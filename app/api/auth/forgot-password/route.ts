



import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { otpStore } from "@/lib/otpStore";
import { rateLimit } from "@/lib/rateLimit";
import { sendOtpSms } from "@/lib/sms";
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

    
    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (typeof phoneNumber !== "string" || !phoneRegex.test(phoneNumber.trim())) {
      return NextResponse.json(
        { error: "Invalid Sri Lankan mobile number format." },
        { status: 400 }
      );
    }

    
    const rlKey = `forgot-password:${phoneNumber.trim()}`;
    const rl = await rateLimit(rlKey, 3, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, phone_number, is_verified")
      .eq("phone_number", phoneNumber)
      .maybeSingle();

    if (fetchError || !user) {
      
      const fakeResponse: Record<string, unknown> = {
        success: true,
        message: "If this number is registered, an OTP has been sent.",
      };
      return NextResponse.json(fakeResponse);
    }

    
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); 

    
    await otpStore.set(phoneNumber, {
      otpCode: otp,
      expiresAt: new Date(expiresAt),
      used: false,
      attempts: 0,
    });

    
    
    
    const { error: upsertError } = await supabaseAdmin
      .from("password_resets")
      .upsert({
        phone_number: phoneNumber,
        otp_code: otp,
        expires_at: expiresAt,
        used: false,
      }, { onConflict: "phone_number" });

    if (upsertError) {
      
      console.error("password_resets upsert error:", upsertError.message);
      
    }

    
    const smsResult = await sendOtpSms(phoneNumber.trim(), otp);
    if (!smsResult.success) {
      console.error("[forgot-password] SMS dispatch failed:", smsResult.error);
    }

    const response: Record<string, unknown> = {
      success: true,
      message: "If this number is registered, an OTP has been sent.",
    };

    
    if (process.env.NODE_ENV !== "production") {
      response.testOtpCode = otp;
      if (!smsResult.success) response.smsError = smsResult.error;
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
