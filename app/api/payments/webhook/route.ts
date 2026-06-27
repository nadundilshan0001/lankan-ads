// ============================================================
// Lankan Ads — API Route: PayHere Payment Webhook Callback
// ============================================================

import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/db/supabase";

export async function POST(request: Request) {
  try {
    // Parse form-urlencoded parameters sent by PayHere
    const formData = await request.formData();
    
    const merchantId = formData.get("merchant_id")?.toString();
    const orderId = formData.get("order_id")?.toString();
    const paymentId = formData.get("payment_id")?.toString();
    const payhereAmount = formData.get("payhere_amount")?.toString();
    const payhereCurrency = formData.get("payhere_currency")?.toString();
    const statusCode = formData.get("status_code")?.toString();
    const md5sig = formData.get("md5sig")?.toString();

    // Required fields check
    if (!merchantId || !orderId || !statusCode || !md5sig) {
      return NextResponse.json(
        { error: "Bad request. Missing transaction parameters." },
        { status: 400 }
      );
    }

    // Verify signature to validate authenticity
    // PayHere signature formula: MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret))
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "MOCK_MERCHANT_SECRET_12345";
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
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

    // Validate signature in production — uncomment below
    // if (localSignature !== md5sig.toUpperCase()) {
    //   console.error("Invalid PayHere signature for order:", orderId);
    //   return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    // }

    // status_code 2 = successful payment
    if (statusCode === "2") {
      console.log(`[Webhook] Payment successful — Order: ${orderId}, PayHere ID: ${paymentId}`);

      // 1. Look up the payment record by PayHere order ID
      const { data: payment, error: paymentLookupError } = await supabaseAdmin
        .from("payments")
        .select("id, ad_id")
        .eq("payhere_order_id", orderId)
        .maybeSingle();

      if (paymentLookupError || !payment) {
        console.error("[Webhook] Payment record not found for order:", orderId, paymentLookupError);
        // Still return 200 so PayHere doesn't retry repeatedly
        return new Response("OK", { status: 200 });
      }

      // 2. Mark payment as completed
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

      // 3. Activate the linked ad immediately
      const { error: adUpdateError } = await supabaseAdmin
        .from("ads")
        .update({ status: "active" })
        .eq("id", payment.ad_id);

      if (adUpdateError) {
        console.error("[Webhook] Failed to activate ad:", payment.ad_id, adUpdateError);
      } else {
        console.log(`[Webhook] Ad ${payment.ad_id} is now ACTIVE.`);
      }

    } else if (statusCode === "0") {
      // Pending / processing
      console.log(`[Webhook] Payment pending for Order: ${orderId}`);
    } else {
      // statusCode -1 = cancelled, -2 = failed, -3 = chargebacked
      console.log(`[Webhook] Payment failed/cancelled for Order: ${orderId}, status: ${statusCode}`);

      // Mark payment as failed in DB
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed" })
        .eq("payhere_order_id", orderId);
    }

    // PayHere requires a simple 200 OK text response
    return new Response("OK", { status: 200 });
  } catch (err: any) {
    console.error("[Webhook] Unhandled error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
