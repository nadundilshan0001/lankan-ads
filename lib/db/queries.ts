import { supabase, supabaseAdmin } from "./supabase";
import { Ad, AdImage, AdTier, AdStatus, User } from "@/lib/types";
import fs from "fs";
import path from "path";

function getLocalLikeCount(adId: string): number | null {
  try {
    const filePath = path.join(process.cwd(), "lib/db/local_likes.json");
    if (fs.existsSync(filePath)) {
      const map = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (typeof map[adId] === "number") {
        return map[adId];
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// Helper: map database fields (snake_case) to client interface (camelCase)
export function mapDbAd(dbAd: any): Ad {
  const localLikes = getLocalLikeCount(dbAd.id);
  const resolvedLikeCount = localLikes !== null ? localLikes : (dbAd.like_count || 0);
  let role: string | undefined = undefined;
  let availabilityHours = dbAd.availability_hours || "";

  if (availabilityHours.startsWith("{")) {
    try {
      const parsed = JSON.parse(availabilityHours);
      role = parsed.role;
      availabilityHours = parsed.hours || "";
    } catch (e) {
      // ignore
    }
  }

  return {
    id: dbAd.id,
    userId: dbAd.user_id,
    category: dbAd.category,
    subCategory: dbAd.sub_category || "",
    titleEn: dbAd.title_en,
    titleSi: dbAd.title_si || "",
    descriptionEn: dbAd.description_en,
    descriptionSi: dbAd.description_si || "",
    slug: dbAd.slug,
    metaTitle: dbAd.meta_title || "",
    metaDescription: dbAd.meta_description || "",
    contactNumber: dbAd.contact_number ? dbAd.contact_number.split("|")[0] : "",
    whatsappNumber: dbAd.contact_number ? (dbAd.contact_number.split("|")[1] || dbAd.contact_number.split("|")[0]) : "",
    serviceArea: dbAd.service_area || "",
    district: dbAd.district,
    city: dbAd.city,
    priceRange: dbAd.price_range || "",
    adTier: dbAd.ad_tier as AdTier,
    tierPromotedAt: dbAd.tier_promoted_at,
    tierDemotesAt: dbAd.tier_demotes_at,
    status: dbAd.status as AdStatus,
    expiresAt: dbAd.expires_at,
    createdAt: dbAd.created_at,
    viewCount: dbAd.view_count || 0,
    likeCount: resolvedLikeCount,
    images: (dbAd.ad_images || dbAd.images || []).map((img: any) => ({
      id: img.id,
      cloudinaryUrl: img.cloudinary_url,
      altText: img.alt_text || "",
      displayOrder: img.display_order || 1,
    })).sort((a: any, b: any) => a.displayOrder - b.displayOrder),
    availabilityHours,
    role,
  };
}

// 1. Get ads by tier
export async function getAdsByTier(tier: AdTier): Promise<Ad[]> {
  const { data, error } = await supabase
    .from("ads")
    .select("*, ad_images(*)")
    .eq("status", "active")
    .eq("ad_tier", tier)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching ads by tier:", error);
    return [];
  }
  return (data || []).map(mapDbAd);
}

// 2. Get ads by category
export async function getAdsByCategory(categorySlug: string): Promise<Ad[]> {
  const { data, error } = await supabase
    .from("ads")
    .select("*, ad_images(*)")
    .eq("status", "active")
    .eq("category", categorySlug)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching ads by category:", error);
    return [];
  }
  return (data || []).map(mapDbAd);
}

// 3. Get ads by district
export async function getAdsByDistrict(district: string): Promise<Ad[]> {
  // In our URL handling, district parameters are lowercase-dashed, but database stores standard names (e.g. "Colombo")
  // So we fetch all and filter or query directly using ilike
  const { data, error } = await supabase
    .from("ads")
    .select("*, ad_images(*)")
    .eq("status", "active")
    .ilike("district", district.replace(/-/g, " "))
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching ads by district:", error);
    return [];
  }
  return (data || []).map(mapDbAd);
}

export async function getAdBySlug(slug: string): Promise<Ad | null> {
  // Use admin client so the owner can always view their own ad
  const { data, error } = await supabaseAdmin
    .from("ads")
    .select("*, ad_images(*)")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching ad by slug:", error);
    return null;
  }
  
  if (data) {
    // Increment view count in the background using admin client (bypasses RLS write restrictions)
    supabaseAdmin
      .from("ads")
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq("id", data.id)
      .then(({ error: viewError }) => {
        if (viewError) console.error("Error incrementing view count:", viewError);
      });
  }

  return data ? mapDbAd(data) : null;
}

// 5. Get ads by category and subcategory
export async function getAdsByCategoryAndSubcategory(category: string, subCategory: string): Promise<Ad[]> {
  const { data, error } = await supabase
    .from("ads")
    .select("*, ad_images(*)")
    .eq("status", "active")
    .eq("category", category)
    .eq("sub_category", subCategory)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching ads by category & subcategory:", error);
    return [];
  }
  return (data || []).map(mapDbAd);
}

// 6. Get ads by category and district
export async function getAdsByCategoryAndDistrict(category: string, district: string): Promise<Ad[]> {
  const { data, error } = await supabase
    .from("ads")
    .select("*, ad_images(*)")
    .eq("status", "active")
    .eq("category", category)
    .ilike("district", district.replace(/-/g, " "))
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching ads by category & district:", error);
    return [];
  }
  return (data || []).map(mapDbAd);
}

// 7. Get all ads (any status)
export async function getAllActiveAdsCount(): Promise<number> {
  const { count, error } = await supabase
    .from("ads")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");
  if (error) return 0;
  return count || 0;
}

// 8. Get FAQs with fallback to mock data if DB is empty
export async function getFaqs(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      const { MOCK_FAQS } = require("@/lib/mock-data");
      return MOCK_FAQS;
    }
    return data.map((faq: any) => ({
      id: faq.id,
      categoryId: faq.category_id || "",
      questionEn: faq.question_en,
      answerEn: faq.answer_en,
      questionSi: faq.question_si || "",
      answerSi: faq.answer_si || "",
      displayOrder: faq.display_order || 1,
    }));
  } catch (e) {
    const { MOCK_FAQS } = require("@/lib/mock-data");
    return MOCK_FAQS;
  }
}

// 9. Get all active ads ordered by tier weight and then date
export async function getAllActiveAds(): Promise<Ad[]> {
  const { data, error } = await supabase
    .from("ads")
    .select("*, ad_images(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all active ads:", error);
    return [];
  }
  
  const mapped = (data || []).map(mapDbAd);
  
  // Sort by tier weight (platinum = 1, premium = 2, standard = 3)
  const tierWeight = { platinum: 1, premium: 2, standard: 3 };
  return mapped.sort((a, b) => tierWeight[a.adTier] - tierWeight[b.adTier]);
}

