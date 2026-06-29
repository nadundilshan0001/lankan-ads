import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";

// POST /api/ads/[id]/report — submits a user report on an ad
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const reason = (body?.reason || "").trim().slice(0, 500);

    if (!reason) {
      return NextResponse.json({ error: "A reason is required." }, { status: 400 });
    }

    // Get forwarded IP for basic spam prevention
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Verify ad exists
    const { data: ad, error: adError } = await supabaseAdmin
      .from("ads")
      .select("id, title_en")
      .eq("id", id)
      .maybeSingle();

    if (adError || !ad) {
      return NextResponse.json({ error: "Ad not found." }, { status: 404 });
    }

    // Store report in audit_logs table (reuse existing infra)
    const { error: insertError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        action: "ad_reported",
        target_type: "ad",
        target_id: id,
        details: JSON.stringify({ reason, ip, adTitle: ad.title_en }),
      });

    if (insertError) {
      console.error("[report] DB error:", insertError.message);
      return NextResponse.json({ error: "Failed to submit report." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
