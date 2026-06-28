// ============================================================
// Lankan Ads — API: Admin Storage Stats
// Cloudinary + Supabase storage usage
// ============================================================

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabase";
import { verifyAdminCookieOrBearer } from "@/lib/adminAuth";

// Simple in-memory cache (1 hour TTL) to avoid hammering Cloudinary API
let cloudinaryCache: { data: any; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchCloudinaryUsage() {
  if (cloudinaryCache && Date.now() - cloudinaryCache.fetchedAt < CACHE_TTL_MS) {
    return cloudinaryCache.data;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return { error: "Cloudinary credentials not configured." };
  }

  try {
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/usage`,
      {
        headers: { Authorization: `Basic ${credentials}` },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) return { error: `Cloudinary API error: ${res.status}` };

    const usage = await res.json();
    const data = {
      storage: {
        usageBytes: usage.storage?.usage ?? 0,
        limitBytes: usage.storage?.limit ?? 0,
        usedPercent: usage.storage?.usage_percent ?? 0,
      },
      bandwidth: {
        usageBytes: usage.bandwidth?.usage ?? 0,
        limitBytes: usage.bandwidth?.limit ?? 0,
        usedPercent: usage.bandwidth?.usage_percent ?? 0,
      },
      requests: usage.requests ?? 0,
      resources: usage.resources ?? 0,
      transformations: {
        usage: usage.transformations?.usage ?? 0,
        limit: usage.transformations?.limit ?? 0,
      },
      plan: usage.plan ?? "Free",
      lastUpdated: new Date().toISOString(),
    };

    cloudinaryCache = { data, fetchedAt: Date.now() };
    return data;
  } catch {
    return { error: "Failed to fetch Cloudinary usage." };
  }
}

export async function GET(request: Request) {
  const admin = verifyAdminCookieOrBearer(request);
  if (!admin) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    // Fetch Cloudinary stats (cached 1h)
    const cloudinary = await fetchCloudinaryUsage();

    // Fetch Supabase table row counts
    const [usersRes, adsRes, imagesRes, paymentsRes, auditRes] = await Promise.all([
      supabaseAdmin.from("users").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("ads").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("ad_images").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("payments").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("audit_logs").select("*", { count: "exact", head: true }),
    ]);

    // Fetch ad status breakdown
    const statusBreakdown: Record<string, number> = {};
    const statuses = ["active", "pending", "draft", "expired", "deleted"];
    await Promise.all(
      statuses.map(async (s) => {
        const { count } = await supabaseAdmin
          .from("ads")
          .select("*", { count: "exact", head: true })
          .eq("status", s);
        statusBreakdown[s] = count || 0;
      })
    );

    return NextResponse.json({
      success: true,
      cloudinary,
      supabase: {
        tables: {
          users: usersRes.count || 0,
          ads: adsRes.count || 0,
          ad_images: imagesRes.count || 0,
          payments: paymentsRes.count || 0,
          audit_logs: auditRes.count || 0,
        },
        adsBreakdown: statusBreakdown,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
