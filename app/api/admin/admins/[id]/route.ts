// ============================================================
// Lankan Ads — API: Admin CRUD Actions (by ID)
// DELETE: remove admin user
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { verifyAdminCookieOrBearer } from "@/lib/adminAuth";
import { logAdminAction, getClientIp } from "@/lib/adminAudit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminCookieOrBearer(request);
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const { id: targetId } = await params;
  if (!UUID_RE.test(targetId)) {
    return NextResponse.json({ error: "Invalid admin ID." }, { status: 400 });
  }

  // Prevent admin from deleting themselves
  if (targetId === admin.userId) {
    return NextResponse.json({ error: "You cannot delete your own administrator account." }, { status: 400 });
  }

  try {
    // 1. Fetch total admin users count to prevent locking out all admins
    const { count } = await supabaseAdmin
      .from("admin_users")
      .select("*", { count: "exact", head: true });

    if (count && count <= 1) {
      return NextResponse.json({ error: "Cannot delete the last remaining administrator account." }, { status: 400 });
    }

    // 2. Fetch target admin to get their email for the logs
    const { data: targetAdmin } = await supabaseAdmin
      .from("admin_users")
      .select("email")
      .eq("id", targetId)
      .maybeSingle();

    if (!targetAdmin) {
      return NextResponse.json({ error: "Administrator not found." }, { status: 404 });
    }

    // 3. Delete admin
    const { error } = await supabaseAdmin
      .from("admin_users")
      .delete()
      .eq("id", targetId);

    if (error) return NextResponse.json({ error: "Internal server error." }, { status: 500 });

    await logAdminAction({
      adminId: admin.userId,
      adminEmail: admin.email || "admin",
      action: "delete_admin",
      targetType: "admin",
      targetId,
      details: { email: targetAdmin.email },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
