// ============================================================
// Lankan Ads — API Route: Auth Registration (Connected to DB)
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { generateSalt, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, password, languagePreference } = body;

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: "Phone number and password are required." },
        { status: 400 }
      );
    }

    // Sri Lankan mobile number format validation
    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid Sri Lankan mobile number." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("id, is_verified")
      .eq("phone_number", phoneNumber)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    // Generate secure random salt and hash password with PBKDF2
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    if (existingUser) {
      if (existingUser.is_verified) {
        return NextResponse.json(
          { error: "An account with this phone number already exists." },
          { status: 400 }
        );
      } else {
        // Update password hash, salt, and language preference for unverified user
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({ 
            password_hash: passwordHash, 
            salt,
            language_preference: languagePreference || "en" 
          })
          .eq("id", existingUser.id);

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      }
    } else {
      // Create new unverified user
      const { error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          phone_number: phoneNumber,
          password_hash: passwordHash,
          salt,
          language_preference: languagePreference || "en",
          is_verified: false,
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: "OTP verification code dispatched to " + phoneNumber,
      testOtpCode: "123456", // Mock OTP for development
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
