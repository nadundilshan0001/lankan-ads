// ============================================================
// Lankan Ads — Admin Audit Log Helper
// Writes every admin action to the audit_logs table
// ============================================================

import { supabaseAdmin } from "@/lib/db/supabase";

export type AuditTargetType = "user" | "ad" | "admin" | "payment" | "system";

export interface AuditEntry {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: AuditTargetType;
  targetId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Write an admin action to the audit_logs table.
 * Call this after every destructive or sensitive admin action.
 */
export async function logAdminAction(entry: AuditEntry): Promise<void> {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: entry.adminId,
      admin_email: entry.adminEmail,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId,
      details: entry.details || {},
      ip_address: entry.ipAddress || null,
    });
  } catch (err) {
    // Audit log failure must not block the main action
    console.error("[AuditLog] Failed to write audit entry:", err);
  }
}

/**
 * Extract client IP from request headers (works behind proxies)
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
