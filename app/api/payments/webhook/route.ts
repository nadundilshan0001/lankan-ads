



import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/db/supabase";
import { sendAdToTelegram } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    
    const formData = await request.formData();
    
    const merchantId = formData.get("merchant_id")?.toString();
    const orderId = formData.get("order_id")?.toString();
    const paymentId = formData.get("payment_id")?.toString();
    const payhereAmount = formData.get("payhere_amount")?.toString();
    const payhereCurrency = formData.get("payhere_currency")?.toString();
    const statusCode = formData.get("status_code")?.toString();
    const md5sig = formData.get("md5sig")?.toString();

    
    if (!merchantId || !orderId || !statusCode || !md5sig) {
      return NextResponse.json(
        { error: "Bad request. Missing transaction parameters." },
        { status: 400 }
      );
    }

    
    
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantSecret) {
      if (process.env.NODE_ENV === "production") {
        console.error("[Webhook] PAYHERE_MERCHANT_SECRET is missing on the server.");
        return NextResponse.json({ error: "PayHere service is not configured on the server." }, { status: 500 });
      }
    }
    const safeSecret = merchantSecret || "MOCK_MERCHANT_SECRET_12345";
    const hashedSecret = crypto
      .createHash("md5")
      .update(safeSecret)
      .digest("hex")
      .toUpperCase();
      
    const localSignatureSrc = 
      merchantId + 
      orderId + 
      payhereAmount + 
      payhereCurrency + 
      statusCode + 
      hashedSecret;
      
    const localSignature = crypto
      .createHash("md5")
      .update(localSignatureSrc)
      .digest("hex")
      .toUpperCase();

    
    if (localSignature !== md5sig?.toUpperCase()) {
      console.error("[Webhook] Invalid PayHere signature for order:", orderId);
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }

    
    if (statusCode === "2") {
      console.log(`[Webhook] Payment successful — Order: ${orderId}, PayHere ID: ${paymentId}`);

      
      const { data: payment, error: paymentLookupError } = await supabaseAdmin
        .from("payments")
        .select("id, ad_id")
        .eq("payhere_order_id", orderId)
        .maybeSingle();

      if (paymentLookupError || !payment) {
        console.error("[Webhook] Payment record not found for order:", orderId, paymentLookupError);
        
        return new Response("OK", { status: 200 });
      }

      
      const { error: paymentUpdateError } = await supabaseAdmin
        .from("payments")
        .update({
          status: "completed",
          payhere_payment_id: paymentId || null,
          paid_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (paymentUpdateError) {
        console.error("[Webhook] Failed to update payment record:", paymentUpdateError);
      }

      
      const { error: adUpdateError } = await supabaseAdmin
        .from("ads")
        .update({ status: "active" })
        .eq("id", payment.ad_id);

      if (adUpdateError) {
        console.error("[Webhook] Failed to activate ad:", payment.ad_id, adUpdateError);
      } else {
        console.log(`[Webhook] Ad ${payment.ad_id} is now ACTIVE.`);
        
        // Trigger Telegram notification in the background
        sendAdToTelegram(payment.ad_id).catch((err) => {
          console.error("[Webhook] Telegram background notify error:", err);
        });
      }

    } else if (statusCode === "0") {
      
      console.log(`[Webhook] Payment pending for Order: ${orderId}`);
    } else {
      
      console.log(`[Webhook] Payment failed/cancelled for Order: ${orderId}, status: ${statusCode}`);

      
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed" })
        .eq("payhere_order_id", orderId);
    }

    
    return new Response("OK", { status: 200 });
  } catch {
    console.error("[Webhook] Unhandled error");
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
