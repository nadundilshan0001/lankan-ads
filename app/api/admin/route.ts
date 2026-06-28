// ============================================================
// Lankan Ads — API Route: Admin Panel Actions (Secured)
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { mapDbAd } from "@/lib/db/queries";
import { verifyAdminCookieOrBearer } from "@/lib/adminAuth";

// GET admin data: stats, pending ads, and users
export async function GET(request: Request) {
  try {
    // Verify admin privileges
    const admin = verifyAdminCookieOrBearer(request);
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    // 1. Fetch pending ads
    const { data: pendingAds, error: pendingError } = await supabaseAdmin
      .from("ads")
      .select("*, ad_images(*)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (pendingError) {
      return NextResponse.json({ error: pendingError.message }, { status: 500 });
    }

    // 2. Fetch active ads count
    const { count: activeCount, error: activeError } = await supabaseAdmin
      .from("ads")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // 3. Fetch users
    const { data: dbUsers, error: usersError } = await supabaseAdmin
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    // 4. Fetch completed payments today (sum of amount_lkr)
    const today = new Date();
    today.setHours(0,0,0,0);
    const { data: paymentsToday } = await supabaseAdmin
      .from("payments")
      .select("amount_lkr")
      .eq("status", "completed")
      .gte("created_at", today.toISOString());

    const revenueTodayVal = (paymentsToday || []).reduce(
      (sum, payment) => sum + Number(payment.amount_lkr || 0),
      0
    );

    const stats = {
      pendingAdsCount: pendingAds?.length || 0,
      activeAdsCount: activeCount || 0,
      revenueToday: `Rs. ${revenueTodayVal.toLocaleString()}`,
      totalUsersCount: dbUsers?.length || 0,
    };

    return NextResponse.json({
      success: true,
      pendingAds: (pendingAds || []).map(mapDbAd),
      users: (dbUsers || []).map((u) => ({
        id: u.id,
        phoneNumber: u.phone_number,
        isVerified: u.is_verified,
        status: u.is_verified ? "active" : "pending", // fallback status
        createdAt: new Date(u.created_at).toLocaleDateString("en-LK"),
      })),
      stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST admin actions: approve ad, reject ad
export async function POST(request: Request) {
  try {
    // Verify admin privileges
    const admin = verifyAdminCookieOrBearer(request);
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { action, adId, userId } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (adId && !uuidRegex.test(adId)) {
      return NextResponse.json({ error: "Invalid Ad ID format." }, { status: 400 });
    }
    if (userId && !uuidRegex.test(userId)) {
      return NextResponse.json({ error: "Invalid User ID format." }, { status: 400 });
    }

    if (action === "approve_ad") {
      if (!adId) return NextResponse.json({ error: "Ad ID is required." }, { status: 400 });

      // Approve: set status to 'active' and extend expiration to 7 days
      const { error } = await supabaseAdmin
        .from("ads")
        .update({
          status: "active",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", adId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Ad approved successfully." });
    }

    if (action === "reject_ad") {
      if (!adId) return NextResponse.json({ error: "Ad ID is required." }, { status: 400 });

      // Reject: delete or draft the ad. We will set it to draft.
      const { error } = await supabaseAdmin
        .from("ads")
        .update({ status: "draft" })
        .eq("id", adId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Ad rejected successfully." });
    }

    if (action === "toggle_user_status") {
      if (!userId) return NextResponse.json({ error: "User ID is required." }, { status: 400 });
      // Since schema doesn't have banned status, we toggle is_verified for demo purposes
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("is_verified")
        .eq("id", userId)
        .single();

      if (user) {
        const { error } = await supabaseAdmin
          .from("users")
          .update({ is_verified: !user.is_verified })
          .eq("id", userId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }

      return NextResponse.json({ success: true, message: "User status updated." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
