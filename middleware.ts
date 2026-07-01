import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


async function verifySignature(
  header: string,
  payload: string,
  signatureBase64Url: string,
  secret: string
): Promise<boolean> {
  try {
    const keyData = Buffer.from(secret);
    const messageData = Buffer.from(`${header}.${payload}`);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = Buffer.from(signatureBase64Url, "base64url");

    return await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      signatureBytes,
      messageData
    );
  } catch (err: any) {
    console.error("ERROR inside verifySignature:", err);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  
  if (pathname === "/admin/login") {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  
  const allowedIpsStr = process.env.ADMIN_IP_ALLOWLIST;
  if (allowedIpsStr) {
    const allowedIps = allowedIpsStr.split(",").map((ip) => ip.trim());
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || (request as any).ip || "unknown";
    if (clientIp && !allowedIps.includes(clientIp)) {
      console.warn(`[Security Block] Admin access attempt blocked for unauthorized IP: ${clientIp}`);
      return new NextResponse("Access Denied: Unauthorized IP address.", { status: 403 });
    }
  }

  
  const sessionCookie = request.cookies.get("admin_session")?.value;

  if (!sessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  
  try {
    const parts = sessionCookie.split(".");
    if (parts.length !== 3) throw new Error("Invalid token structure");

    const [header, payloadStr, signature] = parts;
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is missing on server");
    }

    const isSignatureValid = await verifySignature(header, payloadStr, signature, secret);
    if (!isSignatureValid) {
      throw new Error("Invalid token signature");
    }

    const base64 = payloadStr.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    
    if (payload.role !== "admin") throw new Error("Not admin");
    if (payload.exp && Date.now() / 1000 > payload.exp)
      throw new Error("Token expired");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err: any) {
    console.error("[Admin Guard] Cryptographic verification failed:", err?.message || err);
    
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("admin_session");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
