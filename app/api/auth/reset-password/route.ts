



import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { hashPassword, generateSalt } from "@/lib/auth";
import { otpStore } from "@/lib/otpStore";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, otp, newPassword } = body;

    if (!phoneNumber || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Phone number, OTP, and new password are required." },
        { status: 400 }
      );
    }

    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      return NextResponse.json(
        { error: "Invalid Sri Lankan mobile number format." },
        { status: 400 }
      );
    }

    if (!/^[0-9]{4,6}$/.test(otp)) {
      return NextResponse.json(
        { error: "Invalid OTP code format." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: "Password must not exceed 128 characters." },
        { status: 400 }
      );
    }

    
    const rlKey = `reset-password:${phoneNumber.trim()}`;
    const rl = await rateLimit(rlKey, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    
    const memoryRecord = await otpStore.get(phoneNumber);
    
    
    const { data: dbRecord } = await supabaseAdmin
      .from("password_resets")
      .select("otp_code, expires_at, used")
      .eq("phone_number", phoneNumber)
      .maybeSingle();

    
    let isValid = false;
    let isExpired = false;
    let isUsed = false;

    
    if (memoryRecord) {
      if (memoryRecord.otpCode === otp) {
        isValid = true;
        if (new Date(memoryRecord.expiresAt) < new Date()) isExpired = true;
        if (memoryRecord.used) isUsed = true;
      }
    }

    
    if (!isValid && dbRecord) {
      if (dbRecord.otp_code === otp) {
        isValid = true;
        if (new Date(dbRecord.expires_at) < new Date()) isExpired = true;
        if (dbRecord.used) isUsed = true;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid OTP code. Please try again." },
        { status: 400 }
      );
    }

    if (isUsed) {
      return NextResponse.json(
        { error: "This OTP has already been used. Please request a new one." },
        { status: 400 }
      );
    }

    if (isExpired) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    
    const newSalt = generateSalt();
    const newPasswordHash = hashPassword(newPassword, newSalt);

    
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password_hash: newPasswordHash, salt: newSalt })
      .eq("phone_number", phoneNumber.trim());

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }

    
    if (memoryRecord) {
      await otpStore.set(phoneNumber, {
        ...memoryRecord,
        used: true,
      });
    }

    
    if (dbRecord) {
      await supabaseAdmin
        .from("password_resets")
        .update({ used: true })
        .eq("phone_number", phoneNumber);
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now log in with your new password.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
