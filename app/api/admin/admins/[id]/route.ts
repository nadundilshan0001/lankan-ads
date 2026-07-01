




import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { verifyAdminCookieOrBearer } from "@/lib/adminAuth";
import { logAdminAction, getClientIp } from "@/lib/adminAudit";
import { hashPassword, generateSalt } from "@/lib/auth";

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

  
  if (targetId === admin.userId) {
    return NextResponse.json({ error: "You cannot delete your own administrator account." }, { status: 400 });
  }

  try {
    
    const { count } = await supabaseAdmin
      .from("admin_users")
      .select("*", { count: "exact", head: true });

    if (count && count <= 1) {
      return NextResponse.json({ error: "Cannot delete the last remaining administrator account." }, { status: 400 });
    }

    
    const { data: targetAdmin } = await supabaseAdmin
      .from("admin_users")
      .select("email")
      .eq("id", targetId)
      .maybeSingle();

    if (!targetAdmin) {
      return NextResponse.json({ error: "Administrator not found." }, { status: 404 });
    }

    
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminCookieOrBearer(request);
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const { id: targetId } = await params;
  if (!UUID_RE.test(targetId)) {
    return NextResponse.json({ error: "Invalid admin ID." }, { status: 400 });
  }

  if (targetId !== admin.userId) {
    return NextResponse.json({ error: "You can only change your own password." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }

    const { data: dbAdmin, error: fetchError } = await supabaseAdmin
      .from("admin_users")
      .select("password_hash, salt, email")
      .eq("id", targetId)
      .maybeSingle();

    if (fetchError || !dbAdmin) {
      return NextResponse.json({ error: "Administrator account not found." }, { status: 404 });
    }

    const isOldPasswordCorrect = hashPassword(currentPassword, dbAdmin.salt) === dbAdmin.password_hash;
    if (!isOldPasswordCorrect) {
      return NextResponse.json({ error: "Incorrect current password." }, { status: 401 });
    }

    const newSalt = generateSalt();
    const newPasswordHash = hashPassword(newPassword, newSalt);

    const { error: updateError } = await supabaseAdmin
      .from("admin_users")
      .update({
        password_hash: newPasswordHash,
        salt: newSalt,
      })
      .eq("id", targetId);

    if (updateError) {
      console.error("[PATCH admin password] DB update error:", updateError.message);
      return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
    }

    await logAdminAction({
      adminId: admin.userId,
      adminEmail: admin.email || "admin",
      action: "change_admin_password",
      targetType: "admin",
      targetId,
      details: { email: dbAdmin.email },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (err: any) {
    console.error("[PATCH admin password] Internal error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
