




import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  try {
    
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rlKey = `payment-status:${ip}`;
    const rl = await rateLimit(rlKey, 30, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${rl.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

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
      status: payment.status, 
      adId: payment.ad_id,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
