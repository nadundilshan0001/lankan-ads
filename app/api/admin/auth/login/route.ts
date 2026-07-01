




import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { hashPassword, generateSalt, signToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { logAdminAction, getClientIp } from "@/lib/adminAudit";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Invalid email address format." },
        { status: 400 }
      );
    }

    
    const rlKey = `admin-login:${email.trim().toLowerCase()}`;
    const rl = await rateLimit(rlKey, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const { data: admin, error: fetchError } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, password_hash, salt")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (fetchError || !admin) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    
    let isValid = false;
    if (!admin.salt) {
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
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    
    await supabaseAdmin
      .from("admin_users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", admin.id);

    
    const token = signToken({
      userId: admin.id,
      email: admin.email,
      role: "admin",
    });

    
    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email },
    });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60, 
    });

    
    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "admin_login",
      targetType: "system",
      targetId: admin.id,
      details: { ip: getClientIp(request) },
      ipAddress: getClientIp(request),
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
