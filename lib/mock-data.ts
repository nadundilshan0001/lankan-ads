// ============================================================
// Lankan Ads — Mock Data for Development
// ============================================================

import type { Ad, FAQ } from "./types";

const MOCK_IMAGES = [
  {
    id: "img-1",
    cloudinaryUrl: "https://res.cloudinary.com/demo/image/upload/v1/lankan-ads/spa-1.jpg",
    altText: "Premium spa service in Colombo",
    displayOrder: 1,
  },
  {
    id: "img-2",
    cloudinaryUrl: "https://res.cloudinary.com/demo/image/upload/v1/lankan-ads/spa-2.jpg",
    altText: "Relaxation massage therapy",
    displayOrder: 2,
  },
];

export const MOCK_ADS: Ad[] = [
  // Platinum Ads
  {
    id: "ad-001",
    userId: "u1",
    category: "spa-wellness",
    subCategory: "",
    titleEn: "Royal Thai Spa & Ayurvedic Centre — Colombo 07",
    descriptionEn:
      "Experience the finest Ayurvedic and Thai massage treatments in the heart of Colombo. Our certified therapists provide premium full-body massage, aromatherapy, herbal treatments, and hot stone therapy. Private rooms, clean facilities, and a calming ambiance await you. Walk-ins welcome. Open 7 days a week.",
    slug: "royal-thai-spa-ayurvedic-centre-colombo-07",
    contactNumber: "+94771234567",
    serviceArea: "Colombo 07, Cinnamon Gardens",
    district: "Colombo",
    city: "Colombo 07",
    priceRange: "LKR 3,000 — LKR 8,000",
    adTier: "platinum",
    tierPromotedAt: "2026-06-25T10:00:00Z",
    tierDemotesAt: "2026-06-28T10:00:00Z",
    status: "active",
    expiresAt: "2026-07-02T10:00:00Z",
    createdAt: "2026-06-25T10:00:00Z",
    viewCount: 1842,
    images: MOCK_IMAGES,
    availabilityHours: "Mon-Sun 09:00 — 21:00",
  },
  {
    id: "ad-002",
    userId: "u2",
    category: "girls-personal",
    subCategory: "place-available",
    titleEn: "Nisha — Premium Personal Service, Colombo 03",
    descriptionEn:
      "Hi, I'm Nisha. Offering premium personal companionship services in Colombo 03. Own private place available with a clean, comfortable, and safe environment. Genuine clients only. Contact via WhatsApp for booking and availability. Discretion guaranteed.",
    slug: "nisha-premium-personal-service-colombo-03",
    contactNumber: "+94779876543",
    serviceArea: "Colombo 03, Kollupitiya",
    district: "Colombo",
    city: "Colombo 03",
    priceRange: "LKR 5,000 — LKR 15,000",
    adTier: "platinum",
    tierPromotedAt: "2026-06-24T14:00:00Z",
    tierDemotesAt: "2026-06-27T14:00:00Z",
    status: "active",
    expiresAt: "2026-07-01T14:00:00Z",
    createdAt: "2026-06-24T14:00:00Z",
    viewCount: 2456,
    images: MOCK_IMAGES,
  },
  {
    id: "ad-003",
    userId: "u3",
    category: "live-cam",
    subCategory: "both-platforms",
    titleEn: "Kaviya — Live Cam Sessions (WhatsApp & Telegram)",
    descriptionEn:
      "Private live cam sessions available via both WhatsApp and Telegram. High quality video calls with stable connection. Available evenings and weekends. Genuine callers only. DM for rates and schedule.",
    slug: "kaviya-live-cam-sessions-whatsapp-telegram",
    contactNumber: "+94761112233",
    serviceArea: "Online — Islandwide",
    district: "Colombo",
    city: "Online",
    priceRange: "LKR 1,500 — LKR 5,000",
    adTier: "platinum",
    tierPromotedAt: "2026-06-26T08:00:00Z",
    tierDemotesAt: "2026-06-29T08:00:00Z",
    status: "active",
    expiresAt: "2026-07-03T08:00:00Z",
    createdAt: "2026-06-26T08:00:00Z",
    viewCount: 987,
    images: MOCK_IMAGES,
  },

  // Premium Ads
  {
    id: "ad-004",
    userId: "u4",
    category: "girls-personal",
    subCategory: "home-hotel-visit",
    titleEn: "Sachini — Home & Hotel Visit Service, Kandy",
    descriptionEn:
      "Professional and friendly personal service provider in Kandy area. Available for home and hotel visits. Clean, punctual, and discreet service. Contact via WhatsApp to check availability. Advance booking preferred.",
    slug: "sachini-home-hotel-visit-service-kandy",
    contactNumber: "+94751234567",
    serviceArea: "Kandy City & Surrounding Areas",
    district: "Kandy",
    city: "Kandy",
    priceRange: "LKR 4,000 — LKR 10,000",
    adTier: "premium",
    tierPromotedAt: "2026-06-26T06:00:00Z",
    tierDemotesAt: "2026-06-27T06:00:00Z",
    status: "active",
    expiresAt: "2026-07-03T06:00:00Z",
    createdAt: "2026-06-26T06:00:00Z",
    viewCount: 634,
    images: MOCK_IMAGES,
  },
  {
    id: "ad-005",
    userId: "u5",
    category: "spa-wellness",
    subCategory: "",
    titleEn: "Serenity Ayurvedic Spa — Galle Fort",
    descriptionEn:
      "Traditional Ayurvedic spa located near Galle Fort. We offer full body massage, Shirodhara, herbal steam bath, and beauty treatments. Experienced female therapists. Couples welcome. Tourist-friendly. Air-conditioned rooms.",
    slug: "serenity-ayurvedic-spa-galle-fort",
    contactNumber: "+94912234567",
    serviceArea: "Galle Fort, Galle",
    district: "Galle",
    city: "Galle",
    priceRange: "LKR 2,500 — LKR 6,000",
    adTier: "premium",
    tierPromotedAt: "2026-06-25T12:00:00Z",
    tierDemotesAt: "2026-06-26T12:00:00Z",
    status: "active",
    expiresAt: "2026-07-02T12:00:00Z",
    createdAt: "2026-06-25T12:00:00Z",
    viewCount: 412,
    images: MOCK_IMAGES,
  },
  {
    id: "ad-006",
    userId: "u6",
    category: "boys-personal",
    subCategory: "both",
    titleEn: "Chamara — Male Personal Service, Colombo",
    descriptionEn:
      "Professional male personal service provider in Colombo. Own place available and also willing to visit hotels. Well-groomed, respectful, and discreet. Available most days. WhatsApp for inquiries.",
    slug: "chamara-male-personal-service-colombo",
    contactNumber: "+94771112233",
    serviceArea: "Colombo & Suburbs",
    district: "Colombo",
    city: "Colombo",
    priceRange: "LKR 3,500 — LKR 8,000",
    adTier: "premium",
    tierPromotedAt: "2026-06-26T09:00:00Z",
    tierDemotesAt: "2026-06-27T09:00:00Z",
    status: "active",
    expiresAt: "2026-07-03T09:00:00Z",
    createdAt: "2026-06-26T09:00:00Z",
    viewCount: 298,
    images: MOCK_IMAGES,
  },
  {
    id: "ad-007",
    userId: "u7",
    category: "marriage-proposals",
    subCategory: "brides",
    titleEn: "Sinhala Buddhist Bride — 28 Years, Colombo",
    descriptionEn:
      "Sinhala Buddhist family from Colombo seeking suitable groom for their daughter. Age 28, fair complexion, BSc graduate, currently working in a private sector company. Owns house property in Colombo suburb. Looking for educated, employed partner.",
    slug: "sinhala-buddhist-bride-28-years-colombo",
    contactNumber: "+94771234500",
    serviceArea: "Colombo",
    district: "Colombo",
    city: "Colombo",
    adTier: "premium",
    tierPromotedAt: "2026-06-25T08:00:00Z",
    tierDemotesAt: "2026-06-26T08:00:00Z",
    status: "active",
    expiresAt: "2026-07-02T08:00:00Z",
    createdAt: "2026-06-25T08:00:00Z",
    viewCount: 567,
    images: MOCK_IMAGES,
  },

  // Standard Ads
  {
    id: "ad-008",
    userId: "u8",
    category: "spa-wellness",
    subCategory: "",
    titleEn: "Lotus Wellness Centre — Kurunegala",
    descriptionEn:
      "Affordable wellness and massage services in Kurunegala town. Traditional oil massage, deep tissue, and relaxation treatments. Clean, friendly, and professional environment. Walk-ins welcome. Open daily.",
    slug: "lotus-wellness-centre-kurunegala",
    contactNumber: "+94371234567",
    serviceArea: "Kurunegala Town",
    district: "Kurunegala",
    city: "Kurunegala",
    priceRange: "LKR 1,500 — LKR 4,000",
    adTier: "standard",
    status: "active",
    expiresAt: "2026-07-03T10:00:00Z",
    createdAt: "2026-06-26T10:00:00Z",
    viewCount: 156,
    images: MOCK_IMAGES,
  },
  {
    id: "ad-009",
    userId: "u9",
    category: "girls-personal",
    subCategory: "place-available",
    titleEn: "Dilini — Personal Service, Negombo",
    descriptionEn:
      "Personal service available in Negombo. Own place available near the beach area. Clean and safe environment. Contact via WhatsApp for details and availability. Genuine clients only.",
    slug: "dilini-personal-service-negombo",
    contactNumber: "+94769876543",
    serviceArea: "Negombo Beach Area",
    district: "Gampaha",
    city: "Negombo",
    priceRange: "LKR 3,000 — LKR 7,000",
    adTier: "standard",
    status: "active",
    expiresAt: "2026-07-02T14:00:00Z",
    createdAt: "2026-06-25T14:00:00Z",
    viewCount: 234,
    images: MOCK_IMAGES,
  },
  {
    id: "ad-010",
    userId: "u10",
    category: "shemale-personal",
    subCategory: "home-hotel-visit",
    titleEn: "Amanda — Transgender Personal Service, Colombo",
    descriptionEn:
      "Friendly and professional transgender personal service provider. Available for home and hotel visits in the greater Colombo area. Respectful, clean, and punctual. Contact via WhatsApp.",
    slug: "amanda-transgender-personal-service-colombo",
    contactNumber: "+94771231234",
    serviceArea: "Greater Colombo Area",
    district: "Colombo",
    city: "Colombo",
    priceRange: "LKR 4,000 — LKR 10,000",
    adTier: "standard",
    status: "active",
    expiresAt: "2026-07-01T16:00:00Z",
    createdAt: "2026-06-24T16:00:00Z",
    viewCount: 178,
    images: MOCK_IMAGES,
  },
  {
    id: "ad-011",
    userId: "u11",
    category: "live-cam",
    subCategory: "whatsapp",
    titleEn: "Sanduni — WhatsApp Video Calls",
    descriptionEn:
      "Private video call sessions available via WhatsApp. Stable connection, high quality camera. Available daily from 8 PM to midnight. Message first to book a time slot.",
    slug: "sanduni-whatsapp-video-calls",
    contactNumber: "+94764445566",
    serviceArea: "Online — Islandwide",
    district: "Colombo",
    city: "Online",
    priceRange: "LKR 1,000 — LKR 3,000",
    adTier: "standard",
    status: "active",
    expiresAt: "2026-07-02T20:00:00Z",
    createdAt: "2026-06-25T20:00:00Z",
    viewCount: 342,
    images: MOCK_IMAGES,
  },
  {
    id: "ad-012",
    userId: "u12",
    category: "marriage-proposals",
    subCategory: "grooms",
    titleEn: "Tamil Christian Groom — 32 Years, Jaffna",
    descriptionEn:
      "Tamil Christian family from Jaffna seeking bride for their son. Age 32, engineer by profession, working in Colombo. Good family background. Looking for a well-educated, good-natured partner from a respectable family.",
    slug: "tamil-christian-groom-32-years-jaffna",
    contactNumber: "+94212234567",
    serviceArea: "Jaffna / Colombo",
    district: "Jaffna",
    city: "Jaffna",
    adTier: "standard",
    status: "active",
    expiresAt: "2026-07-03T08:00:00Z",
    createdAt: "2026-06-26T08:00:00Z",
    viewCount: 189,
    images: MOCK_IMAGES,
  },
];

export const MOCK_FAQS: FAQ[] = [
  {
    id: "faq-1",
    questionEn: "How do I post an ad on Lankan Ads?",
    answerEn:
      "To post an ad, register with your Sri Lankan mobile number, verify via OTP, then fill in your ad details including title, description, images, and select a tier (Standard, Premium, or Platinum). Complete payment via PayHere to submit your ad for review.",
    displayOrder: 1,
  },
  {
    id: "faq-2",
    questionEn: "What are the ad pricing tiers on Lankan Ads?",
    answerEn:
      "Lankan Ads offers three tiers: Standard (Rs. 699 for 7 days in normal feed), Premium (Rs. 1,399 with 24 hours in the premium spotlight then 6 days as standard), and Platinum (Rs. 6,000 with 3 days in the top spotlight then 4 days as standard).",
    displayOrder: 2,
  },
  {
    id: "faq-3",
    questionEn: "How long does my ad stay active?",
    answerEn:
      "All ad tiers are valid for 7 days total. Standard ads remain in the normal feed for the full 7 days. Premium ads get 24 hours of spotlight placement before appearing as a standard ad. Platinum ads get 3 days of top placement before appearing as a standard ad.",
    displayOrder: 3,
  },
  {
    id: "faq-4",
    questionEn: "Is Lankan Ads available across all districts in Sri Lanka?",
    answerEn:
      "Yes, Lankan Ads covers all 25 districts in Sri Lanka including Colombo, Kandy, Galle, Jaffna, Kurunegala, and more. You can post ads and search for services in any district across the island.",
    displayOrder: 4,
  },
  {
    id: "faq-5",
    questionEn: "How do I contact an advertiser on Lankan Ads?",
    answerEn:
      "Each ad listing includes a contact button that connects you directly to the advertiser via WhatsApp or phone call. No account is needed to browse or contact advertisers.",
    displayOrder: 5,
  },
  {
    id: "faq-6",
    questionEn: "What categories are available on Lankan Ads?",
    answerEn:
      "Lankan Ads features eight categories: Girls Personal, Boys Personal, Shemale Personal, Marriage Proposals, Live Cam Show, Spa & Wellness, Cuckold Couples, and Gay. Each category has specific sub-categories for more refined browsing.",
    displayOrder: 6,
  },
];

// Helper: Get ads by tier
export function getAdsByTier(tier: Ad["adTier"]) {
  return MOCK_ADS.filter((ad) => ad.adTier === tier && ad.status === "active");
}

// Helper: Get ads by category
export function getAdsByCategory(categorySlug: string) {
  return MOCK_ADS.filter(
    (ad) => ad.category === categorySlug && ad.status === "active"
  );
}

// Helper: Get ads by district
export function getAdsByDistrict(district: string) {
  return MOCK_ADS.filter(
    (ad) =>
      ad.district.toLowerCase() === district.toLowerCase() &&
      ad.status === "active"
  );
}

// Helper: Get ad by slug
export function getAdBySlug(slug: string) {
  return MOCK_ADS.find((ad) => ad.slug === slug);
}
