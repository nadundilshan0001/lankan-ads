




import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { mapDbAd } from "@/lib/db/queries";
import { verifyAdminCookieOrBearer } from "@/lib/adminAuth";
import { logAdminAction, getClientIp } from "@/lib/adminAudit";

export async function GET(request: Request) {
  const admin = verifyAdminCookieOrBearer(request);
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "25"));
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const district = searchParams.get("district") || "";
    const tier = searchParams.get("tier") || "";
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("ads")
      .select("*, ad_images(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);
    if (category) query = query.eq("category", category);
    if (district) query = query.ilike("district", district);
    if (tier) query = query.eq("ad_tier", tier);
    if (search) query = query.or(`title_en.ilike.%${search}%,contact_number.ilike.%${search}%,id.eq.${search}`);

    const { data, error, count } = await query;

    if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });

    return NextResponse.json({
      success: true,
      ads: (data || []).map(mapDbAd),
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
