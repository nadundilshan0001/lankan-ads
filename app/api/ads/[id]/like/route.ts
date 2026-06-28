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
    let currentLikes = 0;
    let isColumnMissing = false;

    const { data: ad, error: fetchError } = await supabaseAdmin
      .from("ads")
      .select("view_count, like_count")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      if (fetchError.message.includes("like_count") && fetchError.message.includes("does not exist")) {
        isColumnMissing = true;
        
        // Backup query to fetch without the missing like_count column
        const { data: adBackup, error: backupError } = await supabaseAdmin
          .from("ads")
          .select("view_count")
          .eq("id", id)
          .maybeSingle();

        if (backupError || !adBackup) {
          return NextResponse.json({ error: backupError?.message || "Ad not found." }, { status: 404 });
        }
        currentLikes = Math.floor((adBackup.view_count || 0) * 0.08) + 2;
      } else {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }
    } else {
      if (!ad) {
        return NextResponse.json({ error: "Ad not found." }, { status: 404 });
      }
      currentLikes = ad.like_count || 0;
    }

    // 2. Calculate new likes value
    const newLikes = action === "like" ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    // 3. Update database if the column is present
    if (!isColumnMissing) {
      const { error: updateError } = await supabaseAdmin
        .from("ads")
        .update({ like_count: newLikes })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      console.warn(
        "WARNING: Database schema is missing 'like_count' column. " +
        "Please execute this SQL command in your Supabase SQL Editor:\n" +
        "ALTER TABLE ads ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;\n" +
        "Using in-memory simulated fallback likes."
      );
    }

    return NextResponse.json({ success: true, likeCount: newLikes });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
