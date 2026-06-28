// ============================================================
// Lankan Ads — API: Admin Auth Logout
// Clears the admin_session HttpOnly cookie
// ============================================================

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // expire immediately
  });
  return response;
}
