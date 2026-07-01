import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rlKey = `like:${id}:${ip}`;
    const rl = await rateLimit(rlKey, 10, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const action = body?.action || "like";

    if (!["like", "unlike"].includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    
    const { data: ad, error: fetchError } = await supabaseAdmin
      .from("ads")
      .select("like_count")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !ad) {
      return NextResponse.json({ error: fetchError?.message || "Ad not found." }, { status: 404 });
    }

    
    const currentLikes = ad.like_count || 0;
    const newLikes = action === "like" ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    
    const { error: updateError } = await supabaseAdmin
      .from("ads")
      .update({ like_count: newLikes })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, likeCount: newLikes });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
