import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function parseToken(authHeader: string | null) {
  let token = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("admin_session")?.value;
    } catch {
      // ignore
    }
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (payload) {
    return {
      phoneNumber: payload.phoneNumber || "",
      userId: payload.userId,
      role: payload.role || "user",
    };
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const auth = await parseToken(authHeader);

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized. Please provide a valid authorization token." },
        { status: 401 }
      );
    }

    // Retrieve bank details from server-side environment variables securely
    const bankName = process.env.BANK_NAME || "";
    const bankAccountName = process.env.BANK_ACCOUNT_NAME || "";
    const bankAccountNum = process.env.BANK_ACCOUNT_NUM || "";
    const bankBranch = process.env.BANK_BRANCH || "";

    if (!bankName || !bankAccountName || !bankAccountNum || !bankBranch) {
      return NextResponse.json(
        { error: "Bank details configuration is missing on the server." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bankDetails: {
        bank: bankName,
        accountName: bankAccountName,
        accountNumber: bankAccountNum,
        branch: bankBranch,
      },
    });
  } catch (err: any) {
    console.error("Failed to fetch secure bank details:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
