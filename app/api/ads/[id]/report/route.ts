import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { rateLimit } from "@/lib/rateLimit";


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

    
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    
    const rlKey = `report:${id}:${ip}`;
    const rl = await rateLimit(rlKey, 3, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many reports submitted. Please try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    
    const { data: ad, error: adError } = await supabaseAdmin
      .from("ads")
      .select("id, title_en")
      .eq("id", id)
      .maybeSingle();

    if (adError || !ad) {
      return NextResponse.json({ error: "Ad not found." }, { status: 404 });
    }

    
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
