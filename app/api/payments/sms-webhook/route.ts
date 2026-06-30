// ============================================================
// Lankan Ads — API Route: FriMi SMS Payment Alert Parser
// Automatically activates ads when bank transaction alerts are forwarded
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender, message, secret } = body;

    // Security check: ensure the request is from your authorised SMS forwarder app
    const webhookSecret = process.env.SMS_FORWARDER_SECRET || "MOCK_SMS_SECRET_12345";
    if (secret !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!sender || !message) {
      return NextResponse.json({ error: "Missing sender or message body" }, { status: 400 });
    }

    const cleanSender = sender.trim().toUpperCase();
    const cleanMessage = message.trim();

    console.log(`[SMS Webhook] Received SMS from: ${cleanSender}. Msg: "${cleanMessage}"`);

    // Verify the SMS comes from FriMi or Nations Trust Bank (NTB)
    const isAuthorizedSender =
      cleanSender.includes("FRIMI") ||
      cleanSender.includes("NTB") ||
      cleanSender.includes("NATIONS");

    if (!isAuthorizedSender) {
      console.log(`[SMS Webhook] Ignored non-payment SMS from sender: ${cleanSender}`);
      return NextResponse.json({ message: "Ignored: Non-bank sender" }, { status: 200 });
    }

    // Security: Only accept incoming credits (received / added / deposited)
    // Ignore any sent / debited alerts
    const lowerMsg = cleanMessage.toLowerCase();
    const isCredit = lowerMsg.includes("received") || lowerMsg.includes("added") || lowerMsg.includes("credited");
    const isDebit = lowerMsg.includes("sent") || lowerMsg.includes("debited") || lowerMsg.includes("paid to");

    if (isDebit || !isCredit) {
      console.log("[SMS Webhook] Ignored outgoing/debit transfer SMS alert.");
      return NextResponse.json({ message: "Ignored: Debit transaction alert" }, { status: 200 });
    }

    // Regex to find amount (e.g., LKR 500.00, LKR 1,500.00, Rs. 500.00)
    const amountRegex = /(?:LKR|Rs\.?)\s*([\d,]+\.\d{2})/i;
    const amountMatch = cleanMessage.match(amountRegex);

    if (!amountMatch) {
      console.log("[SMS Webhook] No transaction amount found in message.");
      return NextResponse.json({ error: "No transaction amount parsed" }, { status: 400 });
    }

    const parsedAmount = parseFloat(amountMatch[1].replace(/,/g, ""));

    // Regex to find our unique 6-digit Order ID (e.g., LAD-123456)
    const orderIdRegex = /(LAD-\d{6})/i;
    const orderMatch = cleanMessage.match(orderIdRegex);

    if (!orderMatch) {
      console.log("[SMS Webhook] No matching Order ID (LAD-xxxxxx) found in SMS.");
      return NextResponse.json({ message: "Ignored: No Order ID in message" }, { status: 200 });
    }

    const orderId = orderMatch[1].toUpperCase();

    console.log(`[SMS Webhook] Match found! Order ID: ${orderId}, Amount: LKR ${parsedAmount}`);

    // 1. Look up the payment record by Order ID
    const { data: payment, error: paymentLookupError } = await supabaseAdmin
      .from("payments")
      .select("id, ad_id, status, amount")
      .eq("payhere_order_id", orderId)
      .maybeSingle();

    if (paymentLookupError || !payment) {
      console.error(`[SMS Webhook] Payment record not found for Order ID: ${orderId}`, paymentLookupError);
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    // If ad is already active or payment is completed, ignore
    if (payment.status === "completed") {
      console.log(`[SMS Webhook] Payment for order ${orderId} has already been completed.`);
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    // 2. Mark payment as completed
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

    // 3. Activate the ad immediately
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
      message: `Order ${orderId} completed successfully. Ad activated.`,
    });
  } catch (err: any) {
    console.error("[SMS Webhook] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
