




import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender, message, secret } = body;

    
    const webhookSecret = process.env.SMS_FORWARDER_SECRET;
    if (!webhookSecret) {
      if (process.env.NODE_ENV === "production") {
        console.error("[SMS Webhook] SMS_FORWARDER_SECRET is missing on the server.");
        return NextResponse.json({ error: "SMS Forwarder service is not configured on the server." }, { status: 500 });
      }
    }
    const safeSecret = webhookSecret || "MOCK_SMS_SECRET_12345";
    if (secret !== safeSecret) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!sender || !message) {
      return NextResponse.json({ error: "Missing sender or message body" }, { status: 400 });
    }

    const cleanSender = sender.trim().toUpperCase();
    const cleanMessage = message.trim();

    console.log(`[SMS Webhook] Received SMS from: ${cleanSender}. Msg: "${cleanMessage}"`);

    
    const isAuthorizedSender =
      cleanSender.includes("FRIMI") ||
      cleanSender.includes("NTB") ||
      cleanSender.includes("NATIONS");

    if (!isAuthorizedSender) {
      console.log(`[SMS Webhook] Ignored non-payment SMS from sender: ${cleanSender}`);
      return NextResponse.json({ message: "Ignored: Non-bank sender" }, { status: 200 });
    }

    
    
    const lowerMsg = cleanMessage.toLowerCase();
    const isCredit = lowerMsg.includes("received") || lowerMsg.includes("added") || lowerMsg.includes("credited");
    const isDebit = lowerMsg.includes("sent") || lowerMsg.includes("debited") || lowerMsg.includes("paid to");

    if (isDebit || !isCredit) {
      console.log("[SMS Webhook] Ignored outgoing/debit transfer SMS alert.");
      return NextResponse.json({ message: "Ignored: Debit transaction alert" }, { status: 200 });
    }

    
    const amountRegex = /(?:LKR|Rs\.?)\s*([\d,]+\.\d{2})/i;
    const amountMatch = cleanMessage.match(amountRegex);

    if (!amountMatch) {
      console.log("[SMS Webhook] No transaction amount found in message.");
      return NextResponse.json({ error: "No transaction amount parsed" }, { status: 400 });
    }

    const parsedAmount = parseFloat(amountMatch[1].replace(/,/g, ""));

    
    const get9DigitPhone = (num: string): string => {
      const digits = num.replace(/\D/g, "");
      if (digits.length >= 9) {
        return digits.slice(-9);
      }
      return digits;
    };

    
    const orderIdRegex = /(LAD-\d{6})/i;
    const orderMatch = cleanMessage.match(orderIdRegex);
    let payment = null;

    if (orderMatch) {
      const orderId = orderMatch[1].toUpperCase();
      console.log(`[SMS Webhook] Found Order ID: ${orderId}, Amount: LKR ${parsedAmount}`);

      const { data, error } = await supabaseAdmin
        .from("payments")
        .select("id, ad_id, status, amount")
        .eq("payhere_order_id", orderId)
        .maybeSingle();

      if (!error && data) {
        payment = data;
      }
    }

    
    if (!payment) {
      console.log("[SMS Webhook] No Order ID matched in SMS. Attempting fallback match using Sender Phone + Amount...");
      
      
      const senderPhoneRegex = /(?:from|to)\s+(\+?94|0)?(7\d{8})/i;
      const senderPhoneMatch = cleanMessage.match(senderPhoneRegex);

      if (!senderPhoneMatch) {
        console.log("[SMS Webhook] Could not parse sender phone number from message.");
        return NextResponse.json({ error: "Could not parse sender phone number" }, { status: 400 });
      }

      const senderPhone9 = get9DigitPhone(senderPhoneMatch[2]);
      console.log(`[SMS Webhook] Extracted Sender Phone: 0${senderPhone9}, Amount: LKR ${parsedAmount}`);

      
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: pendingPayments, error: dbErr } = await supabaseAdmin
        .from("payments")
        .select("*, users!inner(phone_number)")
        .eq("status", "pending")
        .eq("amount", parsedAmount)
        .gt("created_at", oneHourAgo);

      if (dbErr) {
        console.error("[SMS Webhook] Fallback database query error:", dbErr.message);
        return NextResponse.json({ error: "Database query failed" }, { status: 500 });
      }

      
      const matchedPayment = pendingPayments?.find((pay: any) => {
        const userPhone9 = get9DigitPhone(pay.users?.phone_number || "");
        return userPhone9 === senderPhone9;
      });

      if (!matchedPayment) {
        console.log(`[SMS Webhook] No matching pending payment found for phone 0${senderPhone9} and amount LKR ${parsedAmount} in the last hour.`);
        return NextResponse.json({ message: "No matching pending transaction found" }, { status: 200 });
      }

      payment = {
        id: matchedPayment.id,
        ad_id: matchedPayment.ad_id,
        status: matchedPayment.status,
        amount: matchedPayment.amount
      };
      
      console.log(`[SMS Webhook] Successful Fallback Match! Payment ID: ${payment.id}, Ad ID: ${payment.ad_id}`);
    }

    
    if (payment.status === "completed") {
      console.log("[SMS Webhook] Payment has already been completed.");
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    
    const { error: paymentUpdateError } = await supabaseAdmin
      .from("payments")
      .update({
        status: "completed",
        paid_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      console.error("[SMS Webhook] Failed to update payment record:", paymentUpdateError);
      return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
    }

    
    const { error: adUpdateError } = await supabaseAdmin
      .from("ads")
      .update({ status: "active" })
      .eq("id", payment.ad_id);

    if (adUpdateError) {
      console.error(`[SMS Webhook] Failed to activate ad ${payment.ad_id}:`, adUpdateError);
      return NextResponse.json({ error: "Failed to activate ad" }, { status: 500 });
    }

    console.log(`[SMS Webhook] Success! Ad ${payment.ad_id} is now ACTIVE.`);

    return NextResponse.json({
      success: true,
      message: `Transaction processed successfully. Ad activated.`,
    });
  } catch (err: any) {
    console.error("[SMS Webhook] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
