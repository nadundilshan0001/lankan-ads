// ============================================================
// Lankan Ads — Ad Expiry Cron Endpoint
// Called by Vercel Cron (or any scheduler) daily at midnight
// Protected by CRON_SECRET environment variable
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";

export async function GET(request: Request) {
  // Verify this is a legitimate cron invocation
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Expire all active ads whose expires_at has passed
    const { data, error, count } = await supabaseAdmin
      .from("ads")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("expires_at", new Date().toISOString())
      .select("id");

    if (error) {
      console.error("[cron/expire-ads] DB error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const expiredCount = data?.length ?? 0;
    console.log(`[cron/expire-ads] Expired ${expiredCount} ads at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      expiredCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron/expire-ads] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
