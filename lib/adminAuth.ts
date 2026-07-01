




import { verifyToken, TokenPayload } from "@/lib/auth";


export function verifyAdminCookieOrBearer(request: Request): TokenPayload | null {
  try {
    
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = verifyToken(token);
      if (payload?.role === "admin") return payload;
    }

    
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
