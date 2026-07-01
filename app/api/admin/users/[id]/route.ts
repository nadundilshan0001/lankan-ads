




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

  const { id: userId } = await params;
  if (!UUID_RE.test(userId)) {
    return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
  }

  
  if (userId === admin.userId) {
    return NextResponse.json({ error: "Cannot perform this action on your own account." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const action = body?.action as string;

    if (!["activate", "deactivate", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    if (action === "activate") {
      const { error } = await supabaseAdmin
        .from("users")
        .update({ is_active: true })
        .eq("id", userId);
      if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }

    if (action === "deactivate") {
      
      const { error } = await supabaseAdmin
        .from("users")
        .update({ is_active: false })
        .eq("id", userId);
      if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });

      
      await supabaseAdmin
        .from("ads")
        .update({ status: "draft" })
        .eq("user_id", userId)
        .eq("status", "active");
    }

    if (action === "delete") {
      
      const { data: userAds } = await supabaseAdmin
        .from("ads")
        .select("id")
        .eq("user_id", userId);

      const adIds = (userAds || []).map((a: any) => a.id);
      if (adIds.length > 0) {
        await supabaseAdmin.from("ad_images").delete().in("ad_id", adIds);
        await supabaseAdmin.from("payments").delete().in("ad_id", adIds);
        await supabaseAdmin.from("ads").delete().in("id", adIds);
      }

      const { error } = await supabaseAdmin.from("users").delete().eq("id", userId);
      if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }

    await logAdminAction({
      adminId: admin.userId,
      adminEmail: admin.email || "admin",
      action: `user_${action}`,
      targetType: "user",
      targetId: userId,
      details: { action },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
