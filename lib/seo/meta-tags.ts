



import type { Metadata } from "next";
import { SITE_CONFIG } from "../constants";
import type { Ad, Category } from "../types";

export function generateHomeMetadata(): Metadata {
  return {
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    keywords: [
      "Sri Lanka classified ads",
      "personal services Sri Lanka",
      "spa wellness Colombo",
      "marriage proposals Sri Lanka",
      "Lankan ads",
    ],
    openGraph: {
      title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
      description: SITE_CONFIG.description,
      url: SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: "website",
      images: [
        {
          url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
      description: SITE_CONFIG.description,
      images: [`${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`],
    },
    alternates: {
      canonical: SITE_CONFIG.url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateCategoryMetadata(
  category: Category,
  district?: string
): Metadata {
  const title = district
    ? `${category.name} in ${district} — ${SITE_CONFIG.name}`
    : `${category.name} — ${SITE_CONFIG.name}`;

  const description = district
    ? `Browse verified ${category.name.toLowerCase()} listings in ${district}, Sri Lanka. Find trusted providers with photos, prices, and direct contact on ${SITE_CONFIG.name}.`
    : `Explore ${category.name.toLowerCase()} listings across Sri Lanka. ${category.description}`;

  const url = district
    ? `${SITE_CONFIG.url}/${category.slug}/${district.toLowerCase()}`
    : `${SITE_CONFIG.url}/${category.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateSubCategoryMetadata(
  category: Category,
  subCategory: { name: string; slug: string; description: string }
): Metadata {
  const title = `${category.name} — ${subCategory.name} in Sri Lanka | ${SITE_CONFIG.name}`;
  const description = `Find verified ${category.name.toLowerCase()} (${subCategory.name.toLowerCase()}) ads in Sri Lanka. ${subCategory.description}. Contact providers directly on WhatsApp.`;
  const url = `${SITE_CONFIG.url}/${category.slug}/${subCategory.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateAdMetadata(ad: Ad): Metadata {
  const title =
    ad.metaTitle ||
    `${ad.titleEn} — ${ad.city}, ${ad.district} | ${SITE_CONFIG.name}`;
  const description =
    ad.metaDescription ||
    ad.descriptionEn.substring(0, 155).trim() + "...";
  const url = `${SITE_CONFIG.url}/${ad.category}/${ad.district.toLowerCase()}/${ad.slug}`;
  const image = ad.images[0]?.cloudinaryUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: "article",
      ...(image && {
        images: [
          {
            url: image,
            width: 800,
            height: 600,
            alt: ad.images[0]?.altText || ad.titleEn,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
    alternates: {
      canonical: url,
    },
  };
}
