import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { hashPassword, generateSalt } from "@/lib/auth";
import { otpStore } from "@/lib/otpStore";
import { sendOtpSms } from "@/lib/sms";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, password } = body;

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: "Phone number and password are required." },
        { status: 400 }
      );
    }

    
    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      return NextResponse.json(
        { error: "Invalid Sri Lankan mobile number. Format must be e.g. 0771234567." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "Password must not exceed 128 characters." },
        { status: 400 }
      );
    }



    
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("id, is_verified")
      .eq("phone_number", phoneNumber.trim())
      .maybeSingle();

    if (checkError) {
      console.error("[register] DB check error:", checkError.message);
      return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
    }

    
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    if (existingUser) {
      if (existingUser.is_verified) {
        return NextResponse.json(
          { error: "An account with this phone number already exists." },
          { status: 400 }
        );
      } else {
        
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            password_hash: passwordHash,
            salt,
            language_preference: "en",
          })
          .eq("id", existingUser.id);

        if (updateError) {
          console.error("[register] DB update error:", updateError.message);
          return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
        }
      }
    } else {
      
      const { error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          phone_number: phoneNumber.trim(),
          password_hash: passwordHash,
          salt,
          language_preference: "en",
          is_verified: false,
        });

      if (insertError) {
        console.error("[register] DB insert error:", insertError.message);
        return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
      }
    }

    
    const otpCode = crypto.randomInt(100000, 999999).toString();
    await otpStore.set(phoneNumber.trim(), {
      otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), 
      used: false,
      attempts: 0,
    });

    
    const smsResult = await sendOtpSms(phoneNumber.trim(), otpCode);

    const response: Record<string, unknown> = {
      success: true,
      message: "Verification code sent to your mobile number.",
    };

    if (!smsResult.success) {
      
      console.error("[register] SMS dispatch failed:", smsResult.error);
      
      if (process.env.NODE_ENV !== "production") {
        response.testOtpCode = otpCode;
        response.smsError = smsResult.error;
      }
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

