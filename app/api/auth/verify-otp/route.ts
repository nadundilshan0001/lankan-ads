// ============================================================
// Lankan Ads — API Route: Verify OTP (Connected to DB)
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { signToken } from "@/lib/auth";

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

    // OTP validation simulation (accepts standard "123456" for dev)
    if (code !== "123456" && code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid verification code." },
        { status: 400 }
      );
    }

    // Get user from DB
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id, phone_number, is_verified")
      .eq("phone_number", phoneNumber)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please register first." },
        { status: 404 }
      );
    }

    // Update user status to verified in database
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ is_verified: true })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Issue cryptographically signed token
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
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
