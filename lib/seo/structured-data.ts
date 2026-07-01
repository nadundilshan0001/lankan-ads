



import { SITE_CONFIG } from "../constants";
import type { Ad, Category, FAQ } from "../types";

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: SITE_CONFIG.description,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Sinhala"],
    },
    sameAs: [],
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateServiceSchema(ad: Ad) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: ad.titleEn,
    description: ad.descriptionEn,
    url: `${SITE_CONFIG.url}/${ad.category}/${ad.district.toLowerCase()}/${ad.slug}`,
    provider: {
      "@type": "Person",
      name: ad.titleEn,
      telephone: ad.contactNumber,
    },
    areaServed: {
      "@type": "Place",
      name: `${ad.city}, ${ad.district}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: ad.city,
        addressRegion: ad.district,
        addressCountry: "LK",
      },
    },
    ...(ad.priceRange && {
      offers: {
        "@type": "Offer",
        priceCurrency: "LKR",
        price: ad.priceRange,
        availability: "https://schema.org/InStock",
      },
    }),
    image: ad.images[0]?.cloudinaryUrl,
  };
}

export function generateLocalBusinessSchema(ad: Ad) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: ad.titleEn,
    description: ad.descriptionEn,
    url: `${SITE_CONFIG.url}/${ad.category}/${ad.district.toLowerCase()}/${ad.slug}`,
    image: ad.images[0]?.cloudinaryUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: ad.city,
      addressRegion: ad.district,
      addressCountry: "LK",
    },
    telephone: ad.contactNumber,
    ...(ad.priceRange && { priceRange: ad.priceRange }),
    ...(ad.availabilityHours && { openingHours: ad.availabilityHours }),
  };
}

export function generateFAQSchema(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.questionEn,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answerEn,
      },
    })),
  };
}

export function generateItemListSchema(
  ads: Ad[],
  listName: string,
  listUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    url: listUrl,
    numberOfItems: ads.length,
    itemListElement: ads.slice(0, 20).map((ad, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_CONFIG.url}/${ad.category}/${ad.district.toLowerCase()}/${ad.slug}`,
      name: ad.titleEn,
    })),
  };
}

export function generateCollectionPageSchema(
  category: Category,
  district?: string
) {
  const url = district
    ? `${SITE_CONFIG.url}/${category.slug}/${district.toLowerCase()}`
    : `${SITE_CONFIG.url}/${category.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: district
      ? `${category.name} in ${district} - ${SITE_CONFIG.name}`
      : `${category.name} - ${SITE_CONFIG.name}`,
    url,
    description: district
      ? `Browse ${category.name} listings in ${district}, Sri Lanka on ${SITE_CONFIG.name}.`
      : category.description,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };
}

export function generateSubCategoryCollectionSchema(
  category: Category,
  subCategory: { name: string; slug: string; description: string }
) {
  const url = `${SITE_CONFIG.url}/${category.slug}/${subCategory.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} — ${subCategory.name} — ${SITE_CONFIG.name}`,
    url,
    description: `Browse verified ${category.name} (${subCategory.name}) listings in Sri Lanka on ${SITE_CONFIG.name}.`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };
}
