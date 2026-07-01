




import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { hashPassword, generateSalt } from "@/lib/auth";
import { verifyAdminCookieOrBearer } from "@/lib/adminAuth";
import { logAdminAction, getClientIp } from "@/lib/adminAudit";

export async function GET(request: Request) {
  const admin = verifyAdminCookieOrBearer(request);
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const { data: admins, error } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, last_login")
      .order("email", { ascending: true });

    if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });

    return NextResponse.json({
      success: true,
      admins: (admins || []).map((a) => ({
        id: a.id,
        email: a.email,
        createdAt: null,
        lastLogin: a.last_login,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = verifyAdminCookieOrBearer(request);
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    
    const { data: existing } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "An administrator with this email already exists." }, { status: 400 });
    }

    
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const { data: newAdmin, error } = await supabaseAdmin
      .from("admin_users")
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        salt,
      })
      .select("id, email")
      .single();

    if (error || !newAdmin) {
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }

    await logAdminAction({
      adminId: admin.userId,
      adminEmail: admin.email || "admin",
      action: "create_admin",
      targetType: "admin",
      targetId: newAdmin.id,
      details: { email: newAdmin.email },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true, admin: newAdmin });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
