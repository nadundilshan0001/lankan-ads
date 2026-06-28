// ============================================================
// Lankan Ads — API: Admin Analytics
// All chart data in a single call
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { verifyAdminCookieOrBearer } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const admin = verifyAdminCookieOrBearer(request);
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const days = Math.min(90, parseInt(searchParams.get("days") || "30"));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Fetch all data needed for charts in parallel
    const [adsData, usersData, paymentsData, categoryData, tierData, districtData] =
      await Promise.all([
        // Ads created per day
        supabaseAdmin
          .from("ads")
          .select("created_at, status")
          .gte("created_at", since),

        // Users registered per day
        supabaseAdmin
          .from("users")
          .select("created_at, is_verified")
          .gte("created_at", since),

        // Revenue per day (completed payments only)
        supabaseAdmin
          .from("payments")
          .select("created_at, amount_lkr, tier_purchased, status")
          .gte("created_at", since),

        // Ads by category (all time)
        supabaseAdmin.from("ads").select("category"),

        // Ads by tier (all time)
        supabaseAdmin.from("ads").select("ad_tier, status"),

        // Ads by district (all time)
        supabaseAdmin.from("ads").select("district"),
      ]);

    // Helper: group by day label
    const groupByDay = (
      items: any[],
      dateField: string,
      valueField?: string,
      filterFn?: (item: any) => boolean
    ): { date: string; value: number }[] => {
      const map: Record<string, number> = {};
      (items || []).forEach((item) => {
        if (filterFn && !filterFn(item)) return;
        const day = item[dateField]?.substring(0, 10);
        if (!day) return;
        map[day] = (map[day] || 0) + (valueField ? Number(item[valueField] || 0) : 1);
      });

      // Fill all days in range
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const label = d.toISOString().substring(0, 10);
        result.push({ date: label, value: map[label] || 0 });
      }
      return result;
    };

    // Ads per day
    const adsPerDay = groupByDay(adsData.data || [], "created_at");

    // Users per day
    const usersPerDay = groupByDay(usersData.data || [], "created_at");

    // Revenue per day (completed only)
    const revenuePerDay = groupByDay(
      paymentsData.data || [],
      "created_at",
      "amount_lkr",
      (p) => p.status === "completed"
    );

    // Ads by category
    const categoryCount: Record<string, number> = {};
    (categoryData.data || []).forEach((a: any) => {
      categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
    });
    const adsByCategory = Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);

    // Ads by tier
    const tierCount: Record<string, number> = {};
    (tierData.data || []).forEach((a: any) => {
      tierCount[a.ad_tier] = (tierCount[a.ad_tier] || 0) + 1;
    });
    const adsByTier = ["platinum", "premium", "standard"].map((t) => ({
      name: t.charAt(0).toUpperCase() + t.slice(1),
      value: tierCount[t] || 0,
    }));

    // Ads by district (top 10)
    const districtCount: Record<string, number> = {};
    (districtData.data || []).forEach((a: any) => {
      if (a.district) districtCount[a.district] = (districtCount[a.district] || 0) + 1;
    });
    const adsByDistrict = Object.entries(districtCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Payment status split
    const paymentStatusCount: Record<string, number> = {};
    (paymentsData.data || []).forEach((p: any) => {
      paymentStatusCount[p.status] = (paymentStatusCount[p.status] || 0) + 1;
    });
    const paymentStatus = Object.entries(paymentStatusCount).map(([name, value]) => ({
      name,
      value,
    }));

    return NextResponse.json({
      success: true,
      period: { days, since },
      charts: {
        adsPerDay,
        usersPerDay,
        revenuePerDay,
        adsByCategory,
        adsByTier,
        adsByDistrict,
        paymentStatus,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
