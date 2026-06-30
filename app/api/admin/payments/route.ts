// ============================================================
// Lankan Ads — API: Admin Payments
// GET: paginated payments + revenue stats
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
    const status = searchParams.get("status") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("payments")
      .select("*, ads(title_en, category, ad_tier), users(phone_number)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });

    // Revenue aggregates
    const { data: allCompleted } = await supabaseAdmin
      .from("payments")
      .select("amount_lkr, created_at, tier_purchased")
      .eq("status", "completed");

    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

    const sum = (payments: any[], since?: Date) =>
      (payments || [])
        .filter((p) => !since || new Date(p.created_at) >= since)
        .reduce((acc, p) => acc + Number(p.amount_lkr || 0), 0);

    const revenueStats = {
      today: sum(allCompleted || [], startOfDay),
      last7Days: sum(allCompleted || [], startOfWeek),
      thisMonth: sum(allCompleted || [], startOfMonth),
      allTime: sum(allCompleted || []),
    };

    const payments = (data || []).map((p: any) => ({
      id: p.id,
      payhereOrderId: p.payhere_order_id,
      adTitle: p.ads?.title_en || "Unknown Ad",
      adCategory: p.ads?.category || "",
      adTier: p.tier_purchased,
      userPhone: p.users?.phone_number || "Unknown",
      amountLkr: p.amount_lkr,
      status: p.status,
      reference: p.payhere_payment_id || "",
      paidAt: p.paid_at,
      createdAt: p.created_at,
    }));

    return NextResponse.json({
      success: true,
      payments,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      revenueStats,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
