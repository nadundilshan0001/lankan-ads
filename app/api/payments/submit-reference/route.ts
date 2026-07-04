




import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { verifyToken } from "@/lib/auth";
import { sendAdToTelegram } from "@/lib/telegram";
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
    
    
    const isRepeated = /^(.)\1+$/.test(cleanRef); 
    const isSequential = "12345678901234567890".includes(cleanRef) || "98765432109876543210".includes(cleanRef);
    const isTooShort = cleanRef.length < 8; 
    const isCommonFake = /^(test|testing|admin|payhere|lankaqr|1234|abc|fake)/i.test(cleanRef);

    if (isTooShort) {
      return NextResponse.json(
        { error: "Invalid reference number format. It must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (isRepeated || isSequential || isCommonFake) {
      return NextResponse.json(
        { error: "Verification failed. Please enter the genuine transaction ID from your payment receipt." },
        { status: 400 }
      );
    }

    
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
      return NextResponse.json({ error: `Failed to process transaction: ${paymentUpdateError.message}` }, { status: 500 });
    }

    
    const { error: adUpdateError } = await supabaseAdmin
      .from("ads")
      .update({ status: "active" })
      .eq("id", payment.ad_id);

    if (adUpdateError) {
      console.error("[submit-reference] Failed to activate ad:", adUpdateError.message);
      return NextResponse.json({ error: "Failed to publish listing." }, { status: 500 });
    }

    // Trigger Telegram notification in the background
    await sendAdToTelegram(payment.ad_id).catch((err) => {
      console.error("[submit-reference] Telegram background notify error:", err);
    });

    
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
