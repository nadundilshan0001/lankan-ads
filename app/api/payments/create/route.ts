// ============================================================
// Lankan Ads — API Route: Create PayHere Payment Order
// Generates the signed payment parameters for the PayHere checkout
// ============================================================

import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/db/supabase";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

function generateOrderId(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `LAD-${randomDigits}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adId, tier, amount, currency = "LKR", firstName, email, phone } = body;

    if (!adId || !tier || !amount) {
      return NextResponse.json(
        { error: "adId, tier, and amount are required." },
        { status: 400 }
      );
    }

    // Authenticate the user making the request
    const authHeader = request.headers.get("authorization");
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get("admin_session")?.value;
    }

    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid session. Please log in again." }, { status: 401 });
    }

    // Verify the ad belongs to this user and is in a payable state
    const { data: ad, error: adError } = await supabaseAdmin
      .from("ads")
      .select("id, status, ad_tier, user_id")
      .eq("id", adId)
      .maybeSingle();

    if (adError || !ad) {
      return NextResponse.json({ error: "Ad not found." }, { status: 404 });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId || !merchantSecret) {
      return NextResponse.json(
        { error: "Payment service is not configured." },
        { status: 500 }
      );
    }

    const orderId = generateOrderId();
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Generate PayHere hash: MD5(merchant_id + order_id + amount + currency + MD5(secret).toUpperCase())
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const hashSource = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;
    const hash = crypto
      .createHash("md5")
      .update(hashSource)
      .digest("hex")
      .toUpperCase();

    // Create a pending payment record in the database
    const { error: paymentError } = await supabaseAdmin.from("payments").insert({
      ad_id: adId,
      user_id: payload.userId,
      payhere_order_id: orderId,
      amount: parseFloat(formattedAmount),
      currency,
      status: "pending",
    });

    if (paymentError) {
      console.error("[payment/create] DB error:", paymentError.message);
      return NextResponse.json({ error: "Failed to create payment record." }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const isProduction = process.env.PAYHERE_MODE === "production";

    return NextResponse.json({
      success: true,
      // PayHere form parameters
      checkout: {
        action: isProduction
          ? "https://www.payhere.lk/pay/checkout"
          : "https://sandbox.payhere.lk/pay/checkout",
        merchant_id: merchantId,
        return_url: `${siteUrl}/payment/success?order_id=${orderId}`,
        cancel_url: `${siteUrl}/post-ad?cancelled=1`,
        notify_url: `${siteUrl}/api/payments/webhook`,
        order_id: orderId,
        items: `Lankan Ads ${tier.charAt(0).toUpperCase() + tier.slice(1)} Promotion`,
        currency,
        amount: formattedAmount,
        first_name: firstName || "Customer",
        last_name: "",
        email: email || "customer@lankan-ads.lk",
        phone: phone || "0771234567",
        address: "Sri Lanka",
        city: "Colombo",
        country: "Sri Lanka",
        hash,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
