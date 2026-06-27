// ============================================================
// Lankan Ads — API Route: Ads Listing & Creation (Connected to DB)
// ============================================================

import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/db/supabase";
import { mapDbAd } from "@/lib/db/queries";

import { verifyToken } from "@/lib/auth";

function parseToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  
  // 1. Verify securely signed JWT token
  const payload = verifyToken(token);
  if (payload) {
    return { phoneNumber: payload.phoneNumber, userId: payload.userId };
  }
  
  // 2. Backward compatibility fallback for active legacy sessions during transition
  if (token.startsWith("db-token-for-")) {
    const parts = token.replace("db-token-for-", "").split("-");
    const phoneNumber = parts[0];
    const userId = parts.slice(1).join("-");
    return { phoneNumber, userId };
  } else if (token.startsWith("mock-jwt-token-for-")) {
    const phoneNumber = token.replace("mock-jwt-token-for-", "");
    return { phoneNumber, userId: null };
  }
  return null;
}

// GET handler: lists active or pending ads from database
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const district = searchParams.get("district");
    const tier = searchParams.get("tier");
    const status = searchParams.get("status") || "active";

    const authHeader = request.headers.get("authorization");
    const userPayload = parseToken(authHeader);

    let query;

    if (userPayload?.userId) {
      // Authenticated view: retrieve user's own ads across all statuses
      query = supabaseAdmin
        .from("ads")
        .select("*, ad_images(*)")
        .eq("user_id", userPayload.userId)
        .order("created_at", { ascending: false });
    } else {
      // Public directory view: list active/pending ads based on search parameters
      query = status === "active"
        ? supabase.from("ads").select("*, ad_images(*)")
        : supabaseAdmin.from("ads").select("*, ad_images(*)");

      query = query.eq("status", status).order("created_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      if (district) {
        query = query.ilike("district", district.replace(/-/g, " "));
      }

      if (tier) {
        query = query.eq("ad_tier", tier);
      }
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const ads = (data || []).map(mapDbAd);

    return NextResponse.json({
      success: true,
      ads,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST handler: creates a new ad in the database
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const auth = parseToken(authHeader);
    
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized. Please provide a valid authorization token." },
        { status: 401 }
      );
    }

    let userId = auth.userId;
    if (!userId) {
      // Look up user UUID from phone number in database
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("phone_number", auth.phoneNumber)
        .maybeSingle();

      if (userError || !user) {
        return NextResponse.json(
          { error: "User account not found in database. Please register first." },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    const body = await request.json();
    const {
      category,
      subCategory,
      titleEn,
      titleSi,
      descriptionEn,
      descriptionSi,
      priceRange,
      contactNumber,
      district,
      city,
      availabilityHours,
      adTier,
      images, // Cloudinary URLs array
    } = body;

    // Check mandatory fields
    if (
      !category ||
      !titleEn ||
      !descriptionEn ||
      !contactNumber ||
      !district ||
      !city
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Auto-generate clean SEO slug from Title + City
    let cleanTitle = titleEn
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    
    let cleanCity = city
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    if (!cleanTitle) cleanTitle = "ad";
    if (!cleanCity) cleanCity = "location";
      
    const slug = `${cleanTitle}-${cleanCity}-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Insert Ad Row
    const { data: adRow, error: adError } = await supabaseAdmin
      .from("ads")
      .insert({
        user_id: userId,
        category,
        sub_category: subCategory || "",
        title_en: titleEn,
        title_si: titleSi || "",
        description_en: descriptionEn,
        description_si: descriptionSi || "",
        slug,
        contact_number: contactNumber,
        service_area: `${city}, ${district}`,
        district,
        city,
        price_range: priceRange || "",
        ad_tier: adTier || "standard",
        status: "active", // immediately live after payment
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (adError || !adRow) {
      return NextResponse.json(
        { error: adError?.message || "Failed to create ad record." },
        { status: 500 }
      );
    }

    // 2. Insert Images if any are provided
    if (images && images.length > 0) {
      const imageRows = images.map((img: any, idx: number) => {
        const cloudinaryUrl = typeof img === "string" ? img : img.cloudinaryUrl;
        return {
          ad_id: adRow.id,
          cloudinary_url: cloudinaryUrl,
          alt_text: `Image for ${titleEn}`,
          display_order: idx + 1,
        };
      });

      const { error: imageError } = await supabaseAdmin
        .from("ad_images")
        .insert(imageRows);

      if (imageError) {
        console.error("Failed to insert ad images to database:", imageError);
      }
    }

    // 3. Insert Payment Row (auto-completed for development simulation)
    const { count: adsCount } = await supabaseAdmin
      .from("ads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    const isFirstAd = (adsCount || 0) <= 1;

    const payhereOrderId = `LAD-${Math.floor(100000 + Math.random() * 900000)}`;
    let amountLkr = adTier === "platinum" ? 8000 : adTier === "premium" ? 1399 : 699;
    if (adTier === "standard" && isFirstAd) {
      amountLkr = 0;
    }

    const { error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: userId,
        ad_id: adRow.id,
        payhere_order_id: payhereOrderId,
        tier_purchased: adTier || "standard",
        amount_lkr: amountLkr,
        status: "completed",
        paid_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error("Failed to insert payment record:", paymentError);
    }

    return NextResponse.json({
      success: true,
      message: "Ad created successfully and is now live.",
      ad: {
        id: adRow.id,
        slug,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH handler: update ad status (soft-delete or restore)
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get("id");

    if (!adId) {
      return NextResponse.json({ error: "Missing ad id parameter." }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    const auth = parseToken(authHeader);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let userId = auth.userId;
    if (!userId) {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("phone_number", auth.phoneNumber)
        .maybeSingle();
      if (!user) return NextResponse.json({ error: "User not found." }, { status: 401 });
      userId = user.id;
    }

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from("ads")
      .select("id, user_id")
      .eq("id", adId)
      .maybeSingle();

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json({ error: "Ad not found or unauthorized." }, { status: 403 });
    }

    const body = await request.json();
    const { status, adTier } = body;

    const updatePayload: Record<string, string> = {};
    if (status) updatePayload.status = status;
    if (adTier) updatePayload.ad_tier = adTier;

    const { error: updateError } = await supabaseAdmin
      .from("ads")
      .update(updatePayload)
      .eq("id", adId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE handler: permanently delete an ad and its images
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get("id");

    if (!adId) {
      return NextResponse.json({ error: "Missing ad id parameter." }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    const auth = parseToken(authHeader);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let userId = auth.userId;
    if (!userId) {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("phone_number", auth.phoneNumber)
        .maybeSingle();
      if (!user) return NextResponse.json({ error: "User not found." }, { status: 401 });
      userId = user.id;
    }

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from("ads")
      .select("id, user_id")
      .eq("id", adId)
      .maybeSingle();

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json({ error: "Ad not found or unauthorized." }, { status: 403 });
    }

    // Delete images first (FK constraint)
    await supabaseAdmin.from("ad_images").delete().eq("ad_id", adId);
    // Delete payments associated
    await supabaseAdmin.from("payments").delete().eq("ad_id", adId);
    // Delete the ad
    const { error: deleteError } = await supabaseAdmin.from("ads").delete().eq("id", adId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
