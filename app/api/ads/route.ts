



import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/db/supabase";
import { mapDbAd } from "@/lib/db/queries";

import { verifyToken, generateSalt, hashPassword } from "@/lib/auth";
import crypto from "crypto";
import { CATEGORIES, DISTRICTS } from "@/lib/constants";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";

function sanitizeInput(val: any): string {
  if (typeof val !== "string") return "";
  
  return val.replace(/<\/?[^>]+(>|$)/g, "").trim();
}

function isValidSriLankanPhone(phone: string): boolean {
  return /^(?:\+94|0)?7[0-9]{8}$/.test(phone.trim());
}

async function parseToken(authHeader: string | null) {
  let token = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("admin_session")?.value;
    } catch {
      
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
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const district = searchParams.get("district");
    const tier = searchParams.get("tier");
    const status = searchParams.get("status") || "active";

    const authHeader = request.headers.get("authorization");
    const userPayload = await parseToken(authHeader);

    let query;

    if (userPayload?.userId) {
      
      query = supabaseAdmin
        .from("ads")
        .select("*, ad_images(*)")
        .eq("user_id", userPayload.userId)
        .order("created_at", { ascending: false });
    } else {
      
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
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const auth = await parseToken(authHeader);
    
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized. Please provide a valid authorization token." },
        { status: 401 }
      );
    }

    
    if (auth.role !== "admin") {
      const rlKey = `create-ad:${auth.userId}`;
      const rl = await rateLimit(rlKey, 5, 60 * 60 * 1000);
      if (!rl.allowed) {
        return NextResponse.json(
          { error: `Too many ad postings. Please try again in ${rl.retryAfterSeconds} seconds.` },
          { status: 429 }
        );
      }
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
      role,
      adTier,
      images, 
      paymentPending, 
    } = body;

    
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

    let targetPhone = auth.phoneNumber;
    if (auth.role === "admin") {
      targetPhone = contactNumber.split("|")[0].trim();
    }

    let dbUserId;
    if (auth.role === "admin") {
      
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("phone_number", targetPhone)
        .maybeSingle();

      if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 500 });
      }

      if (!user) {
        // If the user profile doesn't exist, we auto-create a user profile for them
        const randomTempPassword = crypto.randomBytes(16).toString("hex");
        const salt = generateSalt();
        const passwordHash = hashPassword(randomTempPassword, salt);

        const { data: newUser, error: createError } = await supabaseAdmin
          .from("users")
          .insert({
            phone_number: targetPhone,
            password_hash: passwordHash,
            salt,
            language_preference: "en",
            is_verified: false,
            is_active: true,
          })
          .select("id")
          .single();

        if (createError || !newUser) {
          console.error("[POST /api/ads] Failed to auto-create user profile:", createError);
          return NextResponse.json(
            { error: "Failed to auto-create user profile for the contact number." },
            { status: 500 }
          );
        }
        dbUserId = newUser.id;
      } else {
        dbUserId = user.id;
      }
    } else {
      
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("phone_number", targetPhone)
        .maybeSingle();

      if (userError || !user) {
        return NextResponse.json(
          { error: "User account not found in database. Please register first." },
          { status: 401 }
        );
      }
      dbUserId = user.id;
    }

    const userId = dbUserId;


    
    const sanitizedTitleEn = sanitizeInput(titleEn);
    const sanitizedTitleSi = sanitizeInput(titleSi || "");
    const sanitizedDescriptionEn = sanitizeInput(descriptionEn);
    const sanitizedDescriptionSi = sanitizeInput(descriptionSi || "");
    const sanitizedCity = sanitizeInput(city);
    const sanitizedPriceRange = sanitizeInput(priceRange || "");
    const sanitizedAvailabilityHours = sanitizeInput(availabilityHours || "");

    
    if (sanitizedTitleEn.length < 5 || sanitizedTitleEn.length > 500) {
      return NextResponse.json(
        { error: "English Title must be between 5 and 500 characters long." },
        { status: 400 }
      );
    }

    if (titleSi && (sanitizedTitleSi.length < 5 || sanitizedTitleSi.length > 500)) {
      return NextResponse.json(
        { error: "Sinhala Title must be between 5 and 500 characters long if provided." },
        { status: 400 }
      );
    }

    if (sanitizedDescriptionEn.length < 20 || sanitizedDescriptionEn.length > 3000) {
      return NextResponse.json(
        { error: "English Description must be between 20 and 3000 characters long." },
        { status: 400 }
      );
    }

    if (descriptionSi && (sanitizedDescriptionSi.length < 20 || sanitizedDescriptionSi.length > 3000)) {
      return NextResponse.json(
        { error: "Sinhala Description must be between 20 and 3000 characters long if provided." },
        { status: 400 }
      );
    }

    if (sanitizedCity.length < 2 || sanitizedCity.length > 50) {
      return NextResponse.json(
        { error: "City must be between 2 and 50 characters long." },
        { status: 400 }
      );
    }

    
    const phoneParts = contactNumber.split("|");
    const primaryPhone = phoneParts[0];
    const whatsappPhone = phoneParts[1] || primaryPhone;

    if (!isValidSriLankanPhone(primaryPhone)) {
      return NextResponse.json(
        { error: "Primary contact number must be a valid Sri Lankan mobile number." },
        { status: 400 }
      );
    }

    if (whatsappPhone && !isValidSriLankanPhone(whatsappPhone)) {
      return NextResponse.json(
        { error: "WhatsApp contact number must be a valid Sri Lankan mobile number." },
        { status: 400 }
      );
    }

    
    const matchedCategory = CATEGORIES.find((c) => c.slug === category || c.id === category);
    if (!matchedCategory) {
      return NextResponse.json(
        { error: "Invalid category selected." },
        { status: 400 }
      );
    }

    if (subCategory) {
      const matchedSubCategory = matchedCategory.subCategories.find(
        (sub) => sub.slug === subCategory || sub.id === subCategory || sub.name === subCategory
      );
      if (!matchedSubCategory) {
        return NextResponse.json(
          { error: "Invalid sub-category selected for the chosen category." },
          { status: 400 }
        );
      }
    }

    
    if (matchedCategory.slug === "gay" || matchedCategory.id === "gay") {
      if (!role || !["Top", "Bottom", "50/50"].includes(role)) {
        return NextResponse.json(
          { error: "Please select a valid role (Top, Bottom, or 50/50) for the Gay category." },
          { status: 400 }
        );
      }
    }

    
    let matchedDistrict: any = DISTRICTS.find(
      (d) => d.toLowerCase() === district.toLowerCase()
    );
    if (!matchedDistrict && district.toLowerCase() === "all district") {
      matchedDistrict = "All District";
    }
    if (!matchedDistrict) {
      return NextResponse.json(
        { error: "Invalid district selected." },
        { status: 400 }
      );
    }

    
    if (adTier && !["platinum", "premium", "standard"].includes(adTier)) {
      return NextResponse.json(
        { error: "Invalid ad tier selected." },
        { status: 400 }
      );
    }

    
    let cleanTitle = sanitizedTitleEn
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    
    let cleanCity = sanitizedCity
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    if (!cleanTitle) cleanTitle = "ad";
    if (!cleanCity) cleanCity = "location";
      
    const slug = `${cleanTitle}-${cleanCity}-${Math.floor(100 + Math.random() * 900)}`;

    
    const { data: adRow, error: adError } = await supabaseAdmin
      .from("ads")
      .insert({
        user_id: dbUserId,
        category: matchedCategory.slug, 
        sub_category: subCategory || "",
        title_en: sanitizedTitleEn,
        title_si: sanitizedTitleSi,
        description_en: sanitizedDescriptionEn,
        description_si: sanitizedDescriptionSi,
        slug,
        contact_number: contactNumber,
        service_area: `${sanitizedCity}, ${matchedDistrict}`,
        district: matchedDistrict,
        city: sanitizedCity,
        price_range: sanitizedPriceRange,
        availability_hours: role ? JSON.stringify({ role, hours: sanitizedAvailabilityHours }) : sanitizedAvailabilityHours,
        ad_tier: adTier || "standard",
        
        
        status: paymentPending ? "pending" : "active",
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

    
    if (images && images.length > 0) {
      
      const MAX_IMAGES = 5;
      const safeImages = images.slice(0, MAX_IMAGES);

      const imageRows = safeImages
        .map((img: any) => {
          const cloudinaryUrl = typeof img === "string" ? img : img.cloudinaryUrl;
          
          if (
            typeof cloudinaryUrl !== "string" ||
            !cloudinaryUrl.startsWith("https://res.cloudinary.com/")
          ) {
            return null;
          }
          return cloudinaryUrl;
        })
        .filter(Boolean)
        .map((cloudinaryUrl: string, idx: number) => ({
          ad_id: adRow.id,
          cloudinary_url: cloudinaryUrl,
          alt_text: `Image for ${sanitizedTitleEn}`,
          display_order: idx + 1,
        }));

      const { error: imageError } = await supabaseAdmin
        .from("ad_images")
        .insert(imageRows);

      if (imageError) {
        console.error("Failed to insert ad images to database:", imageError);
      }
    }

    
    
    if (!paymentPending) {
      const { count: adsCount } = await supabaseAdmin
        .from("ads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      const isFirstAd = (adsCount || 0) <= 1;

      const payhereOrderId = `LAD-${Math.floor(100000 + Math.random() * 900000)}`;
      let amountLkr = adTier === "platinum" ? 5000 : adTier === "premium" ? 1400 : 700;
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
    }

    return NextResponse.json({
      success: true,
      message: paymentPending
        ? "Ad created. Awaiting payment confirmation."
        : "Ad created successfully and is now live.",
      ad: {
        id: adRow.id,
        slug,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}


export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get("id");

    if (!adId) {
      return NextResponse.json({ error: "Missing ad id parameter." }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    const auth = await parseToken(authHeader);
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

    
    const USER_SAFE_STATUSES = ["draft", "paused"];
    if (status && !USER_SAFE_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value. Users may only set status to draft or paused." },
        { status: 400 }
      );
    }

    
    if (adTier && !["platinum", "premium", "standard"].includes(adTier)) {
      return NextResponse.json(
        { error: "Invalid ad tier value." },
        { status: 400 }
      );
    }

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
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get("id");

    if (!adId) {
      return NextResponse.json({ error: "Missing ad id parameter." }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    const auth = await parseToken(authHeader);
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

    
    const { data: existing } = await supabaseAdmin
      .from("ads")
      .select("id, user_id")
      .eq("id", adId)
      .maybeSingle();

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json({ error: "Ad not found or unauthorized." }, { status: 403 });
    }

    
    await supabaseAdmin.from("ad_images").delete().eq("ad_id", adId);
    
    await supabaseAdmin.from("payments").delete().eq("ad_id", adId);
    
    const { error: deleteError } = await supabaseAdmin.from("ads").delete().eq("id", adId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
