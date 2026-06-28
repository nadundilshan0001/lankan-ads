// ============================================================
// Lankan Ads — API Route: Forgot Password / Send Reset OTP
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { otpStore } from "@/lib/otpStore";
import { rateLimit } from "@/lib/rateLimit";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }

    // Validate phone format
    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (typeof phoneNumber !== "string" || !phoneRegex.test(phoneNumber.trim())) {
      return NextResponse.json(
        { error: "Invalid Sri Lankan mobile number format." },
        { status: 400 }
      );
    }

    // SECURITY: Rate limit — 3 OTP requests per phone per hour
    const rlKey = `forgot-password:${phoneNumber.trim()}`;
    const rl = rateLimit(rlKey, 3, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    // Check user exists
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, phone_number, is_verified")
      .eq("phone_number", phoneNumber)
      .maybeSingle();

    if (fetchError || !user) {
      // Return success even if not found to prevent user enumeration
      const fakeResponse: Record<string, unknown> = {
        success: true,
        message: "If this number is registered, an OTP has been sent.",
      };
      return NextResponse.json(fakeResponse);
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store in-memory as a reliable backup/primary mechanism
    otpStore.set(phoneNumber, {
      otpCode: otp,
      expiresAt: new Date(expiresAt),
      used: false,
      attempts: 0,
    });

    // Store OTP in password_reset_otps table (or reuse a generic otp_codes table)
    // We store it in users table in a temp column, or use a dedicated table.
    // Here we upsert into a password_resets table
    const { error: upsertError } = await supabaseAdmin
      .from("password_resets")
      .upsert({
        phone_number: phoneNumber,
        otp_code: otp,
        expires_at: expiresAt,
        used: false,
      }, { onConflict: "phone_number" });

    if (upsertError) {
      // Table may not exist — fallback: store OTP in users table metadata
      console.error("password_resets upsert error:", upsertError.message);
      // Still return success with the dev OTP
    }

    // In production: send SMS via your SMS gateway here
    const response: Record<string, unknown> = {
      success: true,
      message: "If this number is registered, an OTP has been sent.",
    };

    // SECURITY: Only expose OTP in development mode
    if (process.env.NODE_ENV !== "production") {
      response.testOtpCode = otp;
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
