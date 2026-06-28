// ============================================================
// Lankan Ads — API: Admin Users Management
// GET: paginated users list
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
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "25"));
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || ""; // "active" | "inactive"
    const verified = searchParams.get("verified") || ""; // "true" | "false"
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("users")
      .select("id, phone_number, is_verified, is_active, language_preference, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) query = query.ilike("phone_number", `%${search}%`);
    if (status === "active") query = query.eq("is_active", true);
    if (status === "inactive") query = query.eq("is_active", false);
    if (verified === "true") query = query.eq("is_verified", true);
    if (verified === "false") query = query.eq("is_verified", false);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });

    // Fetch ad counts for each user
    const userIds = (data || []).map((u: any) => u.id);
    const adCounts: Record<string, number> = {};
    if (userIds.length > 0) {
      const { data: adData } = await supabaseAdmin
        .from("ads")
        .select("user_id")
        .in("user_id", userIds);
      (adData || []).forEach((a: any) => {
        adCounts[a.user_id] = (adCounts[a.user_id] || 0) + 1;
      });
    }

    const users = (data || []).map((u: any) => ({
      id: u.id,
      phoneNumber: u.phone_number,
      isVerified: u.is_verified,
      isActive: u.is_active !== false, // default true if column doesn't exist yet
      languagePreference: u.language_preference,
      createdAt: u.created_at,
      adCount: adCounts[u.id] || 0,
    }));

    return NextResponse.json({
      success: true,
      users,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
