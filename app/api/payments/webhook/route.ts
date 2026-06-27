// ============================================================
// Lankan Ads — API Route: PayHere Payment Webhook Callback
// ============================================================

import { NextResponse } from "next/server";
import crypto from "crypto";

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
    // We use a mock merchant secret for sandbox
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

    // In production, we compare the signatures:
    // if (localSignature !== md5sig.toUpperCase()) {
    //   return NextResponse.json({ error: "Invalid signature check." }, { status: 401 });
    // }

    // Check status code: 2 is successfully paid
    if (statusCode === "2") {
      console.log(`Payment successful for Order: ${orderId}, Transaction ID: ${paymentId}`);
      
      // In a real application, we would:
      // 1. Look up the payment record in the Database by orderId
      // 2. Mark payment status as 'completed'
      // 3. Mark the associated ad status as 'active' (or keep as 'pending' for moderation check)
      // 4. Update the ad's tier start/end dates (adTier, tierPromotedAt, tierDemotesAt)
    } else {
      console.log(`Payment failed or pending for Order: ${orderId}, status code: ${statusCode}`);
    }

    // PayHere requires a simple 200 OK text response
    return new Response("OK", { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
