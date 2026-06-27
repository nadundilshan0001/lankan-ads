// ============================================================
// Lankan Ads — API Route: Auth Login (Connected to DB)
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { hashPassword, generateSalt, signToken } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, password } = body; // phoneNumber can be an email for admin users

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: "Username/phone number and password are required." },
        { status: 400 }
      );
    }

    const isEmail = phoneNumber.includes("@");

    if (isEmail) {
      // --------------------------------------------------------
      // ADMIN AUTHENTICATION
      // --------------------------------------------------------
      const { data: admin, error: fetchError } = await supabaseAdmin
        .from("admin_users")
        .select("id, email, password_hash, salt")
        .eq("email", phoneNumber.toLowerCase().trim())
        .maybeSingle();

      if (fetchError || !admin) {
        return NextResponse.json(
          { error: "Invalid email address or password." },
          { status: 401 }
        );
      }

      // Password verification with backward-compatible legacy SHA-256 fallback
      let isValid = false;
      if (!admin.salt) {
        // Upgrade legacy hash
        const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
        if (legacyHash === admin.password_hash) {
          isValid = true;
          const newSalt = generateSalt();
          const newHash = hashPassword(password, newSalt);
          await supabaseAdmin
            .from("admin_users")
            .update({ password_hash: newHash, salt: newSalt })
            .eq("id", admin.id);
        }
      } else {
        isValid = hashPassword(password, admin.salt) === admin.password_hash;
      }

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email address or password." },
          { status: 401 }
        );
      }

      // Record last login
      await supabaseAdmin
        .from("admin_users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", admin.id);

      // Sign admin token
      const token = signToken({
        userId: admin.id,
        email: admin.email,
        role: "admin",
      });

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: admin.id,
          phoneNumber: admin.email,
          role: "admin",
          isVerified: true,
        },
      });
    } else {
      // --------------------------------------------------------
      // USER AUTHENTICATION
      // --------------------------------------------------------
      const { data: user, error: fetchError } = await supabaseAdmin
        .from("users")
        .select("id, phone_number, password_hash, salt, is_verified")
        .eq("phone_number", phoneNumber)
        .maybeSingle();

      if (fetchError || !user) {
        return NextResponse.json(
          { error: "Invalid phone number or password." },
          { status: 401 }
        );
      }

      // Password verification with legacy fallback upgrade
      let isValid = false;
      if (!user.salt) {
        const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
        if (legacyHash === user.password_hash) {
          isValid = true;
          const newSalt = generateSalt();
          const newHash = hashPassword(password, newSalt);
          await supabaseAdmin
            .from("users")
            .update({ password_hash: newHash, salt: newSalt })
            .eq("id", user.id);
        }
      } else {
        isValid = hashPassword(password, user.salt) === user.password_hash;
      }

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid phone number or password." },
          { status: 401 }
        );
      }

      // Check if account is verified
      if (!user.is_verified) {
        return NextResponse.json(
          { error: "Please verify your mobile number first.", requiresVerification: true },
          { status: 403 }
        );
      }

      // Sign user token
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
          role: "user",
          isVerified: true,
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
