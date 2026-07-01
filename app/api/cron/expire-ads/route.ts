





import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";

export async function GET(request: Request) {
  
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Cron/Expire-Ads] CRON_SECRET is missing on the server.");
      return NextResponse.json({ error: "Cron service is not configured on the server." }, { status: 500 });
    }
  } else if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    
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
