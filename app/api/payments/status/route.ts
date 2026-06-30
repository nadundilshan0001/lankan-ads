// ============================================================
// Lankan Ads — API Route: Check Payment Status
// Used by frontend to poll if LANKAQR transfer was received
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id parameter" }, { status: 400 });
    }

    const { data: payment, error } = await supabaseAdmin
      .from("payments")
      .select("status, ad_id")
      .eq("payhere_order_id", orderId)
      .maybeSingle();

    if (error || !payment) {
      return NextResponse.json({ status: "not_found" });
    }

    return NextResponse.json({
      status: payment.status, // "pending" | "completed" | "failed"
      adId: payment.ad_id,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
