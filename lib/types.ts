// ============================================================
// Lankan Ads — Core Types
// ============================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export type AdTier = "standard" | "premium" | "platinum";
export type AdStatus = "draft" | "pending" | "active" | "expired";

export interface Ad {
  id: string;
  userId: string;
  category: string;
  subCategory: string;
  titleEn: string;
  titleSi?: string;
  descriptionEn: string;
  descriptionSi?: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  contactNumber: string;
  whatsappNumber?: string;
  serviceArea: string;
  district: string;
  city: string;
  priceRange?: string;
  adTier: AdTier;
  tierPromotedAt?: string;
  tierDemotesAt?: string;
  status: AdStatus;
  expiresAt: string;
  createdAt: string;
  viewCount: number;
  images: AdImage[];
  availabilityHours?: string;
}

export interface AdImage {
  id: string;
  cloudinaryUrl: string;
  altText: string;
  displayOrder: number;
}

export interface Payment {
  id: string;
  userId: string;
  adId: string;
  payhereOrderId: string;
  tierPurchased: AdTier;
  amountLkr: number;
  status: "pending" | "completed" | "failed";
  paidAt?: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  languagePreference: "en" | "si";
  isVerified: boolean;
  createdAt: string;
}

export interface FAQ {
  id: string;
  categoryId?: string;
  questionEn: string;
  answerEn: string;
  questionSi?: string;
  answerSi?: string;
  displayOrder: number;
}

export interface TierInfo {
  name: AdTier;
  displayName: string;
  price: number;
  priceFormatted: string;
  topLayerDuration: string;
  totalDuration: number;
  description: string;
  color: string;
  features: string[];
}
