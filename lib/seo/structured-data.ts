



import { SITE_CONFIG } from "../constants";
import type { Ad, Category, FAQ } from "../types";

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.url}/#website`,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    inLanguage: ["en-LK", "si-LK", "ta-LK"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        // Points to the homepage with a query parameter for sitelinks searchbox
        urlTemplate: `${SITE_CONFIG.url}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.name,
    alternateName: ["Lankan Ads", "LankanAds", "lankanads.lk"],
    url: SITE_CONFIG.url,
    // Use the actual SVG logo file (not a .png that doesn't exist)
    logo: {
      "@type": "ImageObject",
      url: `${SITE_CONFIG.url}/logo/logo-dark-mode.svg`,
      width: 200,
      height: 60,
    },
    description: SITE_CONFIG.description,
    foundingDate: "2025",
    foundingLocation: {
      "@type": "Place",
      name: "Sri Lanka",
      address: {
        "@type": "PostalAddress",
        addressCountry: "LK",
      },
    },
    areaServed: {
      "@type": "Country",
      name: "Sri Lanka",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: `support@${SITE_CONFIG.domain}`,
        availableLanguage: ["English", "Sinhala", "Tamil"],
        areaServed: "LK",
      },
    ],
    sameAs: [
      "https://www.facebook.com/lankanads",
      "https://twitter.com/lankanads",
      "https://t.me/lankanadslk",
      "https://www.linkedin.com/company/lankanads",
    ],
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

/**
 * AEO: HowTo schema — helps Google AI Overviews and voice assistants
 * extract step-by-step instructions for posting an ad on Lankan Ads.
 */
export function generateHowToSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Post a Classified Ad on Lankan Ads",
    description: "Step-by-step guide to posting a verified classified ad on Lankan Ads, Sri Lanka's #1 classified ads platform.",
    totalTime: "PT5M",
    tool: [
      { "@type": "HowToTool", name: "Sri Lankan mobile phone number" },
      { "@type": "HowToTool", name: "A payment method (bank transfer)" },
    ],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Register with your mobile number",
        text: "Visit lankanads.lk and register using a valid Sri Lankan mobile number. You will receive an OTP (One-Time Password) via SMS to verify your identity.",
        url: `${SITE_CONFIG.url}/register`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose your ad category",
        text: "Select from 8 categories: Girls Personal, Boys Personal, Live Cam Shows, Spa & Wellness, Cuckold Couples, Shemale Personal, Gay, or Marriage Proposals.",
        url: `${SITE_CONFIG.url}/post-ad`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Fill in your ad details",
        text: "Enter your ad title, description, district, city, WhatsApp contact number, price range, and availability hours. Upload up to 5 photos.",
        url: `${SITE_CONFIG.url}/post-ad`,
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Select a pricing tier",
        text: "Choose Standard (Rs. 700 / 7 days), Premium (Rs. 1,400 / 24h spotlight + 6 days), or Platinum (Rs. 5,000 / 3 days top spotlight + 4 days). Pay via bank transfer.",
        url: `${SITE_CONFIG.url}/post-ad`,
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Submit payment reference",
        text: "Complete your bank transfer and submit the payment reference number. Our team will verify and approve your ad within hours.",
        url: `${SITE_CONFIG.url}/post-ad`,
      },
    ],
    supply: [],
  };
}

/**
 * AEO/GEO: SpeakableSpecification — allows Google and AI assistants to
 * identify which parts of a page should be read aloud or extracted for summaries.
 */
export function generateSpeakableSchema(cssSelectors: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
    url: SITE_CONFIG.url,
  };
}

/**
 * AEO: Classified ads listing schema with richer entity data
 * for AI engine comprehension of Sri Lanka's ad marketplace.
 */
export function generateClassifiedAdListingSchema(
  categoryName: string,
  district: string | undefined,
  listingCount: number,
  pageUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: district
      ? `${categoryName} in ${district} — ${SITE_CONFIG.name}`
      : `${categoryName} — ${SITE_CONFIG.name}`,
    url: pageUrl,
    description: district
      ? `Find ${listingCount} verified ${categoryName} listings in ${district}, Sri Lanka. Browse with photos, prices, and direct WhatsApp contact.`
      : `Find ${listingCount} verified ${categoryName} listings across Sri Lanka. Browse with photos, prices, and direct WhatsApp contact.`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: district
        ? [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_CONFIG.url },
            { "@type": "ListItem", position: 2, name: categoryName, item: `${SITE_CONFIG.url}/${categoryName.toLowerCase().replace(/\s+/g, "-")}` },
            { "@type": "ListItem", position: 3, name: district, item: pageUrl },
          ]
        : [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_CONFIG.url },
            { "@type": "ListItem", position: 2, name: categoryName, item: pageUrl },
          ],
    },
    mainContentOfPage: {
      "@type": "WebPageElement",
      cssSelector: "#editorial-content",
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "#editorial-content", "#faqs"],
    },
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE_CONFIG.url}/#website`,
    },
  };
}
