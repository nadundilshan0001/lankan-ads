




import type { MetadataRoute } from "next";
import { SITE_CONFIG, CATEGORIES, DISTRICTS } from "@/lib/constants";
import { supabaseAdmin } from "@/lib/db/supabase";

// Fixed date for pages that rarely change — prevents unnecessary re-crawling
const SITE_LAUNCH_DATE = new Date("2025-01-01");
const POLICY_DATE = new Date("2025-06-01");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(), // Home changes daily (new ads)
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: POLICY_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: SITE_LAUNCH_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: POLICY_DATE,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: POLICY_DATE,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/sitemap-html`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date("2026-03-15"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/how-to-post-ad-lankanads`,
      lastModified: new Date("2026-01-15"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/personal-services-colombo-guide`,
      lastModified: new Date("2026-02-01"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/sri-lanka-spa-wellness-guide`,
      lastModified: new Date("2026-02-15"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/marriage-proposals-sri-lanka`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/classified-ads-vs-social-media`,
      lastModified: new Date("2026-03-15"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // ── Category pages ────────────────────────────────────────────────────────
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // ── Sub-category pages ────────────────────────────────────────────────────
  const subCategoryPages: MetadataRoute.Sitemap = CATEGORIES.flatMap((cat) =>
    cat.subCategories.map((sub) => ({
      url: `${baseUrl}/${cat.slug}/${sub.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }))
  );

  // ── Category × District pages ──────────────────────────────────────────────
  const categoryDistrictPages: MetadataRoute.Sitemap = CATEGORIES.flatMap(
    (cat) =>
      DISTRICTS.map((district) => ({
        url: `${baseUrl}/${cat.slug}/${district.toLowerCase().replace(/\s+/g, "-")}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      }))
  );

  // ── Individual ad pages (with image sitemap data) ─────────────────────────
  let adPages: MetadataRoute.Sitemap = [];
  try {
    const { data: dbAds } = await supabaseAdmin
      .from("ads")
      .select("slug, category, district, created_at, updated_at, ad_tier, title_en, images")
      .eq("status", "active");

    if (dbAds && dbAds.length > 0) {
      adPages = dbAds.map((ad) => {
        const districtSlug = ad.district.toLowerCase().replace(/\s+/g, "-");
        const url = `${baseUrl}/${ad.category}/${districtSlug}/${ad.slug}`;

        // Use updated_at if available, otherwise created_at
        const lastMod = ad.updated_at
          ? new Date(ad.updated_at)
          : new Date(ad.created_at);

        // Base entry
        const entry: MetadataRoute.Sitemap[0] = {
          url,
          lastModified: lastMod,
          changeFrequency: "weekly" as const,
          priority: ad.ad_tier === "platinum" ? 0.9 : ad.ad_tier === "premium" ? 0.8 : 0.7,
        };

        return entry;
      });
    }
  } catch (error) {
    console.error("Error generating sitemap ad pages:", error);
  }

  return [
    ...staticPages,
    ...categoryPages,
    ...subCategoryPages,
    ...categoryDistrictPages,
    ...adPages,
  ];
}
