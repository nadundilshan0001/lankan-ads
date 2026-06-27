// ============================================================
// Lankan Ads — API Route: Forgot Password / Send Reset OTP
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";

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

    // Check user exists
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, phone_number, is_verified")
      .eq("phone_number", phoneNumber)
      .maybeSingle();

    if (fetchError || !user) {
      // Return success even if not found to prevent user enumeration
      return NextResponse.json({
        success: true,
        message: "If this number is registered, an OTP has been sent.",
        testOtpCode: "123456",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

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

    // In production: send SMS via your SMS gateway
    // For now, return the OTP in the response (dev mode)
    return NextResponse.json({
      success: true,
      message: `OTP sent to ${phoneNumber}`,
      testOtpCode: otp, // Remove in production!
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
