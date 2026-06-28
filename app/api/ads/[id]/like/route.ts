import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body?.action || "like";

    if (!["like", "unlike"].includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    // 1. Fetch current ad data to retrieve current like counts
    const { data: ad, error: fetchError } = await supabaseAdmin
      .from("ads")
      .select("like_count")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !ad) {
      return NextResponse.json({ error: fetchError?.message || "Ad not found." }, { status: 404 });
    }

    // 2. Calculate new likes value
    const currentLikes = ad.like_count || 0;
    const newLikes = action === "like" ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    // 3. Update database
    const { error: updateError } = await supabaseAdmin
      .from("ads")
      .update({ like_count: newLikes })
      .eq("id", id);

    if (updateError) {
      // If the like_count column is missing, notify about database setup
      if (updateError.message.includes('column "like_count" of relation "ads" does not exist')) {
        return NextResponse.json(
          {
            error: "Database schema missing 'like_count' column. Please execute this SQL command in your Supabase SQL Editor:\nALTER TABLE ads ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;"
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, likeCount: newLikes });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
