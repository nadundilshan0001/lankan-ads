// ============================================================
// Lankan Ads — Constants & Configuration
// ============================================================

import { Category, TierInfo } from "./types";

export const SITE_CONFIG = {
  name: "Lankan Ads",
  domain: "lankan-ads.lk",
  url: "https://lankan-ads.lk",
  description:
    "Sri Lanka's premier classified ads platform for personal services, wellness, marriage proposals, and more. Find verified providers across all 25 districts.",
  tagline: "Sri Lanka's #1 Classified Ads Platform",
  locale: "en_LK",
  ogImage: "/og-default.png",
};

export const DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Mullaitivu",
  "Vavuniya",
  "Trincomalee",
  "Batticaloa",
  "Ampara",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
] as const;

export type District = (typeof DISTRICTS)[number];

export const CATEGORIES: Category[] = [
  {
    id: "girls-personal",
    name: "Girls Personal",
    slug: "girls-personal",
    description: "Individual female providers offering personal services across Sri Lanka.",
    icon: "",
    subCategories: [
      {
        id: "place-available",
        name: "Place Available",
        slug: "place-available",
        description: "Provider has their own location for service",
      },
      {
        id: "home-hotel-visit",
        name: "Home/Hotel Visit",
        slug: "home-hotel-visit",
        description: "Provider travels to the client's home or hotel",
      },
      {
        id: "both",
        name: "Both",
        slug: "both",
        description: "Place available AND home/hotel visit available",
      },
    ],
  },
  {
    id: "boys-personal",
    name: "Boys Personal",
    slug: "boys-personal",
    description: "Individual male providers offering personal services across Sri Lanka.",
    icon: "",
    subCategories: [
      {
        id: "place-available",
        name: "Place Available",
        slug: "place-available",
        description: "Provider has their own location for service",
      },
      {
        id: "home-hotel-visit",
        name: "Home/Hotel Visit",
        slug: "home-hotel-visit",
        description: "Provider travels to the client's home or hotel",
      },
      {
        id: "both",
        name: "Both",
        slug: "both",
        description: "Place available AND home/hotel visit available",
      },
    ],
  },
  {
    id: "shemale-personal",
    name: "Shemale Personal",
    slug: "shemale-personal",
    description:
      "Individual transgender and independent providers offering personal services across Sri Lanka.",
    icon: "",
    subCategories: [
      {
        id: "place-available",
        name: "Place Available",
        slug: "place-available",
        description: "Provider has their own location for service",
      },
      {
        id: "home-hotel-visit",
        name: "Home/Hotel Visit",
        slug: "home-hotel-visit",
        description: "Provider travels to the client's home or hotel",
      },
      {
        id: "both",
        name: "Both",
        slug: "both",
        description: "Place available AND home/hotel visit available",
      },
    ],
  },
  {
    id: "marriage-proposals",
    name: "Marriage Proposals",
    slug: "marriage-proposals",
    description:
      "Traditional matchmaking and matrimonial listings for brides and grooms across Sri Lanka.",
    icon: "",
    subCategories: [
      {
        id: "brides",
        name: "Brides",
        slug: "brides",
        description: "Female profiles seeking marriage",
      },
      {
        id: "grooms",
        name: "Grooms",
        slug: "grooms",
        description: "Male profiles seeking marriage",
      },
    ],
  },
  {
    id: "live-cam",
    name: "Live Cam",
    slug: "live-cam",
    description:
      "Virtual streaming and webcam session providers available on WhatsApp and Telegram.",
    icon: "",
    subCategories: [
      {
        id: "whatsapp",
        name: "WhatsApp",
        slug: "whatsapp",
        description: "Sessions conducted via WhatsApp",
      },
      {
        id: "telegram",
        name: "Telegram",
        slug: "telegram",
        description: "Sessions conducted via Telegram",
      },
      {
        id: "both-platforms",
        name: "Both (WhatsApp & Telegram)",
        slug: "both-platforms",
        description: "Sessions available on both platforms",
      },
    ],
  },
  {
    id: "spa-wellness",
    name: "Spa & Wellness",
    slug: "spa-wellness",
    description:
      "Physical commercial establishments, Ayurvedic centres, and traditional therapeutic massage spas in Sri Lanka.",
    icon: "",
    subCategories: [],
  },
];

export const TIERS: TierInfo[] = [
  {
    name: "standard",
    displayName: "Standard",
    price: 699,
    priceFormatted: "Rs. 699",
    topLayerDuration: "N/A",
    totalDuration: 7,
    description:
      "Appears in the normal section of the ad feed. Valid for 7 days.",
    color: "var(--color-standard)",
    features: [
      "7 days visibility",
      "Normal feed placement",
      "Up to 5 images",
      "WhatsApp contact link",
    ],
  },
  {
    name: "premium",
    displayName: "Premium",
    price: 1399,
    priceFormatted: "Rs. 1,399",
    topLayerDuration: "24 Hours",
    totalDuration: 7,
    description:
      "24h in the Premium layer, then 6 days as Standard. Total 7 days.",
    color: "var(--color-premium)",
    features: [
      "24h Premium spotlight",
      "Then 6 days as Standard",
      "Up to 5 images",
      "WhatsApp contact link",
      "Priority visibility",
    ],
  },
  {
    name: "platinum",
    displayName: "Platinum",
    price: 8000,
    priceFormatted: "Rs. 8,000",
    topLayerDuration: "3 Days (72h)",
    totalDuration: 7,
    description:
      "3 days in the absolute top layer, then 4 days as Standard. Total 7 days.",
    color: "var(--color-platinum)",
    features: [
      "3 days Platinum spotlight",
      "Absolute top placement",
      "Then 4 days as Standard",
      "Up to 5 images",
      "WhatsApp contact link",
      "Maximum visibility",
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getTierByName(name: string): TierInfo | undefined {
  return TIERS.find((t) => t.name === name);
}
