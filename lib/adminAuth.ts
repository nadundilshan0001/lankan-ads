// ============================================================
// Lankan Ads — Admin Request Helper
// Verifies admin JWT from either Bearer header OR HttpOnly cookie
// ============================================================

import { verifyToken, TokenPayload } from "@/lib/auth";

/**
 * Verify an incoming admin API request.
 * Accepts token from:
 *   1. Authorization: Bearer <token>  (legacy/API calls)
 *   2. Cookie: admin_session=<token>  (new browser-based admin panel)
 */
export function verifyAdminCookieOrBearer(request: Request): TokenPayload | null {
  try {
    // 1. Try Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = verifyToken(token);
      if (payload?.role === "admin") return payload;
    }

    // 2. Try admin_session cookie
    const cookieHeader = request.headers.get("cookie") || "";
    const cookieMatch = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("admin_session="));

    if (cookieMatch) {
      const token = cookieMatch.substring("admin_session=".length);
      const payload = verifyToken(token);
      if (payload?.role === "admin") return payload;
    }

    return null;
  } catch {
    return null;
  }
}
