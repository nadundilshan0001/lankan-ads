// ============================================================
// Lankan Ads — API Route: Submit Manual Transaction Reference
// Activates ad optimistically and saves Ref ID for admin review
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, reference } = body;

    if (!orderId || !reference) {
      return NextResponse.json(
        { error: "Order ID and Transaction Reference are required." },
        { status: 400 }
      );
    }

    const cleanRef = reference.trim();
    if (cleanRef.length < 4 || cleanRef.length > 50) {
      return NextResponse.json(
        { error: "Please enter a valid Transaction Reference (4-50 characters)." },
        { status: 400 }
      );
    }

    // Authenticate the user making the request
    const authHeader = request.headers.get("authorization");
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get("admin_session")?.value;
    }

    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid session. Please log in again." }, { status: 401 });
    }

    // 1. Look up the pending payment record
    const { data: payment, error: lookupError } = await supabaseAdmin
      .from("payments")
      .select("id, ad_id, status")
      .eq("payhere_order_id", orderId)
      .eq("user_id", payload.userId)
      .maybeSingle();

    if (lookupError || !payment) {
      return NextResponse.json({ error: "Transaction record not found." }, { status: 404 });
    }

    if (payment.status === "completed") {
      return NextResponse.json({ success: true, message: "Payment already verified." });
    }

    // Check if this reference ID was already used recently to prevent duplicate inputs
    const { data: duplicateRef } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("payhere_payment_id", cleanRef)
      .eq("status", "completed")
      .maybeSingle();

    if (duplicateRef) {
      return NextResponse.json(
        { error: "This Transaction Reference has already been submitted." },
        { status: 400 }
      );
    }

    // 2. Optimistically mark payment as completed and save the Reference ID
    const { error: paymentUpdateError } = await supabaseAdmin
      .from("payments")
      .update({
        status: "completed",
        payhere_payment_id: cleanRef,
        paid_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      console.error("[submit-reference] Failed to update payment record:", paymentUpdateError.message);
      return NextResponse.json({ error: "Failed to process transaction." }, { status: 500 });
    }

    // 3. Activate the linked ad immediately (Optimistic live activation!)
    const { error: adUpdateError } = await supabaseAdmin
      .from("ads")
      .update({ status: "active" })
      .eq("id", payment.ad_id);

    if (adUpdateError) {
      console.error("[submit-reference] Failed to activate ad:", adUpdateError.message);
      return NextResponse.json({ error: "Failed to publish listing." }, { status: 500 });
    }

    // Log this optimistic validation in audit logs for security transparency
    await supabaseAdmin.from("audit_logs").insert({
      action: "payment_reference_submitted",
      target_type: "payment",
      target_id: payment.id,
      details: JSON.stringify({ orderId, reference: cleanRef, adId: payment.ad_id, userId: payload.userId }),
    });

    console.log(`[submit-reference] Ad ${payment.ad_id} activated optimistically with Ref: ${cleanRef}`);

    return NextResponse.json({
      success: true,
      message: "Payment submitted. Your ad is now live!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
