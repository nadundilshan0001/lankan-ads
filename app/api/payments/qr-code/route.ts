




import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    
    const authHeader = request.headers.get("authorization");
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      const { searchParams } = new URL(request.url);
      token = searchParams.get("token") || undefined;

      if (!token) {
        const cookieStore = await cookies();
        token = cookieStore.get("admin_session")?.value;
      }
    }

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    
    
    const qrPath = path.join(process.cwd(), "secure-assets", "lanka-qr.jpeg");

    if (!fs.existsSync(qrPath)) {
      return new NextResponse("QR Code Asset not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(qrPath);

    
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
