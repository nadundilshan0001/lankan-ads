



import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { signToken } from "@/lib/auth";
import { otpStore } from "@/lib/otpStore";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, code } = body;

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: "Phone number and verification code are required." },
        { status: 400 }
      );
    }

    
    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (typeof phoneNumber !== "string" || !phoneRegex.test(phoneNumber.trim())) {
      return NextResponse.json({ error: "Invalid phone number format." }, { status: 400 });
    }

    if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Verification code must be a 6-digit number." }, { status: 400 });
    }

    
    const rlKey = `verify-otp:${phoneNumber.trim()}`;
    const rl = await rateLimit(rlKey, 5, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many verification attempts. Please try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    
    const stored = await otpStore.get(phoneNumber.trim());

    
    const isDevBypass = process.env.NODE_ENV !== "production" && code === stored?.otpCode;

    if (!stored) {
      return NextResponse.json(
        { error: "No verification code found. Please register again." },
        { status: 400 }
      );
    }

    if (stored.used) {
      return NextResponse.json(
        { error: "This verification code has already been used." },
        { status: 400 }
      );
    }

    if (new Date() > stored.expiresAt) {
      return NextResponse.json(
        { error: "Verification code has expired. Please register again to get a new code." },
        { status: 400 }
      );
    }

    if (stored.otpCode !== code) {
      
      await otpStore.set(phoneNumber.trim(), { ...stored, attempts: (stored.attempts ?? 0) + 1 });
      return NextResponse.json(
        { error: "Invalid verification code. Please check and try again." },
        { status: 400 }
      );
    }

    
    await otpStore.set(phoneNumber.trim(), { ...stored, used: true });

    
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, phone_number, is_verified")
      .eq("phone_number", phoneNumber.trim())
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please register first." },
        { status: 404 }
      );
    }

    
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ is_verified: true })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
    }

    
    const token = signToken({
      userId: user.id,
      phoneNumber: user.phone_number,
      role: "user",
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        isVerified: true,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
