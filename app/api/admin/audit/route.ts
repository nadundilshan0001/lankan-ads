// ============================================================
// Lankan Ads — API: Admin Audit Logs
// GET: paginated list of all logs
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { verifyAdminCookieOrBearer } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const admin = verifyAdminCookieOrBearer(request);
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
    const search = searchParams.get("search")?.trim() || "";
    const action = searchParams.get("action") || "";
    const targetType = searchParams.get("targetType") || "";
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (action) query = query.eq("action", action);
    if (targetType) query = query.eq("target_type", targetType);
    if (search) {
      query = query.or(`admin_email.ilike.%${search}%,target_id.eq.${search},action.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });

    const logs = (data || []).map((l: any) => ({
      id: l.id,
      adminId: l.admin_id,
      adminEmail: l.admin_email,
      action: l.action,
      targetType: l.target_type,
      targetId: l.target_id,
      details: l.details,
      ipAddress: l.ip_address,
      createdAt: l.created_at,
    }));

    return NextResponse.json({
      success: true,
      logs,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
