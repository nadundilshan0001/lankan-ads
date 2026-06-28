// ============================================================
// Lankan Ads — API: Admin Ad Actions (by ID)
// POST: approve | deactivate | delete
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { verifyAdminCookieOrBearer } from "@/lib/adminAuth";
import { logAdminAction, getClientIp } from "@/lib/adminAudit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminCookieOrBearer(request);
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const { id: adId } = await params;
  if (!UUID_RE.test(adId)) {
    return NextResponse.json({ error: "Invalid ad ID." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const action = body?.action as string;

    if (!["approve", "deactivate", "delete", "update_views"].includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    if (action === "update_views") {
      const views = parseInt(body?.views, 10);
      if (isNaN(views) || views < 0) {
        return NextResponse.json({ error: "Invalid views count." }, { status: 400 });
      }
      const { error } = await supabaseAdmin
        .from("ads")
        .update({ view_count: views })
        .eq("id", adId);
      if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }

    if (action === "approve") {
      const { error } = await supabaseAdmin
        .from("ads")
        .update({
          status: "active",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", adId);
      if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }

    if (action === "deactivate") {
      const { error } = await supabaseAdmin
        .from("ads")
        .update({ status: "draft" })
        .eq("id", adId);
      if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }

    if (action === "delete") {
      await supabaseAdmin.from("ad_images").delete().eq("ad_id", adId);
      await supabaseAdmin.from("payments").delete().eq("ad_id", adId);
      const { error } = await supabaseAdmin.from("ads").delete().eq("id", adId);
      if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }

    await logAdminAction({
      adminId: admin.userId,
      adminEmail: admin.email || "admin",
      action: `ad_${action}`,
      targetType: "ad",
      targetId: adId,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
