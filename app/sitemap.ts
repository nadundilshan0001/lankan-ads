



import type { MetadataRoute } from "next";
import { SITE_CONFIG, CATEGORIES, DISTRICTS } from "@/lib/constants";
import { supabaseAdmin } from "@/lib/db/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  
  const subCategoryPages: MetadataRoute.Sitemap = CATEGORIES.flatMap((cat) =>
    cat.subCategories.map((sub) => ({
      url: `${baseUrl}/${cat.slug}/${sub.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }))
  );

  
  const categoryDistrictPages: MetadataRoute.Sitemap = CATEGORIES.flatMap(
    (cat) =>
      DISTRICTS.map((district) => ({
        url: `${baseUrl}/${cat.slug}/${district.toLowerCase().replace(/\s+/g, "-")}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      }))
  );

  
  let adPages: MetadataRoute.Sitemap = [];
  try {
    const { data: dbAds } = await supabaseAdmin
      .from("ads")
      .select("slug, category, district, created_at, ad_tier")
      .eq("status", "active");

    if (dbAds && dbAds.length > 0) {
      adPages = dbAds.map((ad) => ({
        url: `${baseUrl}/${ad.category}/${ad.district.toLowerCase().replace(/\s+/g, "-")}/${ad.slug}`,
        lastModified: new Date(ad.created_at),
        changeFrequency: "weekly" as const,
        priority: ad.ad_tier === "platinum" ? 0.9 : ad.ad_tier === "premium" ? 0.8 : 0.7,
      }));
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
