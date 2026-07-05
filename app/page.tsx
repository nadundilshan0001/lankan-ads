



import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { SITE_CONFIG, CATEGORIES, DISTRICTS } from "@/lib/constants";
import { getAllActiveAds } from "@/lib/db/queries";
import {
  generateWebsiteSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateSpeakableSchema,
} from "@/lib/seo/structured-data";
import SchemaMarkup from "@/components/SchemaMarkup";
import ListingsFilter from "@/components/ListingsFilter";
import Breadcrumbs from "@/components/Breadcrumbs";
import MobileBanner from "@/components/MobileBanner";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
  keywords: [
    "Sri Lanka classified ads",
    "personal services Sri Lanka",
    "classified ads Colombo",
    "marriage proposals Sri Lanka",
    "Lankan ads",
    "Colombo personal ads",
    "spa wellness Sri Lanka",
    "adult ads Sri Lanka",
    "personal ads Kandy",
    "lankanads.lk",
    "free classified ads LK",
  ],
  alternates: { canonical: SITE_CONFIG.url },
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
        alt: `${SITE_CONFIG.name} — Sri Lanka's #1 Classified Ads Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

// Top districts to feature for GEO targeting
const FEATURED_DISTRICTS = [
  "Colombo", "Gampaha", "Kandy", "Galle", "Kalutara",
  "Negombo", "Matara", "Kurunegala", "Anuradhapura", "Jaffna",
  "Trincomalee", "Batticaloa",
] as const;

const SITE_FAQS = [
  {
    id: "faq-home-1",
    questionEn: "What is Lankan Ads?",
    answerEn: "Lankan Ads (lankanads.lk) is Sri Lanka's premier verified classified ads platform specializing in personal services, spa & wellness, marriage proposals, and live cam shows. All advertisers are SMS-verified and every ad is manually moderated before going live.",
    displayOrder: 1,
  },
  {
    id: "faq-home-2",
    questionEn: "How do I post an ad on Lankan Ads?",
    answerEn: "Register with your Sri Lankan mobile number, verify via OTP, choose your category, fill in your ad details with up to 5 photos, select a pricing tier (Standard Rs.700, Premium Rs.1,400, or Platinum Rs.5,000), pay via bank transfer, and submit the reference number. Your ad will be approved within hours.",
    displayOrder: 2,
  },
  {
    id: "faq-home-3",
    questionEn: "What districts does Lankan Ads cover?",
    answerEn: "Lankan Ads covers all 25 districts of Sri Lanka including Colombo, Gampaha, Kandy, Galle, Jaffna, Trincomalee, Batticaloa, Kurunegala, Anuradhapura, Matara, Badulla, Ratnapura, Kegalle, Kalutara, Nuwara Eliya, and more.",
    displayOrder: 3,
  },
  {
    id: "faq-home-4",
    questionEn: "Are the listings on Lankan Ads verified?",
    answerEn: "Yes. Every advertiser must verify their mobile number via SMS OTP during registration. Premium and Platinum tier ads undergo additional manual verification by our admin team to ensure authenticity.",
    displayOrder: 4,
  },
  {
    id: "faq-home-5",
    questionEn: "What are the pricing tiers on Lankan Ads?",
    answerEn: "Standard tier (Rs. 700) gives 7 days in the normal feed. Premium tier (Rs. 1,400) gives 24 hours in the premium spotlight, then 6 days standard — total 7 days. Platinum tier (Rs. 5,000) gives 3 days at the absolute top, then 4 days standard — total 7 days.",
    displayOrder: 5,
  },
  {
    id: "faq-home-6",
    questionEn: "How do I contact a service provider on Lankan Ads?",
    answerEn: "Click on any ad listing to view the full details page. From there, you'll find direct WhatsApp and call buttons to contact the provider instantly. Lankan Ads never charges clients — contact is always free and direct.",
    displayOrder: 6,
  },
  {
    id: "faq-home-7",
    questionEn: "What categories are available on Lankan Ads?",
    answerEn: "Lankan Ads has 8 main categories: Girls Personal, Boys Personal, Live Cam Shows, Spa & Wellness, Cuckold Couples, Shemale Personal, Gay, and Marriage Proposals. Each category has subcategories and district-level filtering.",
    displayOrder: 7,
  },
  {
    id: "faq-home-8",
    questionEn: "Is Lankan Ads available in Colombo?",
    answerEn: "Yes, Colombo is our most active city with hundreds of verified listings across all categories. You can filter by Colombo district to find providers near you.",
    displayOrder: 8,
  },
];

export default async function BrowsePage() {
  const allAds = await getAllActiveAds();

  const schemas = [
    generateWebsiteSchema(),
    generateFAQSchema(SITE_FAQS),
    generateHowToSchema(),
    generateSpeakableSchema(["h1", ".site-intro", "#faqs-section"]),
  ];

  return (
    <>
      <SchemaMarkup data={schemas} />

      <div className="container" style={{ paddingTop: "var(--space-xl)" }}>
        <Breadcrumbs items={[]} />
        <MobileBanner />

        {/* ── Hero Section — keyword-rich, indexable by Googlebot ── */}
        <header style={{ marginBottom: "var(--space-lg)" }}>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "800", marginBottom: "0.5rem" }}>
            Sri Lanka&apos;s #1 Verified Classified &amp; Personal Ads Platform
          </h1>
          <p
            className="site-intro"
            style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", maxWidth: "700px", lineHeight: 1.6 }}
          >
            Browse thousands of verified classified ads across all 25 districts of Sri Lanka.
            Find personal services, spa &amp; wellness centers, marriage proposals, and live cam
            providers — all with direct WhatsApp contact and SMS-verified profiles.
          </p>
        </header>


        {/* ── Listings Filter (client component — the actual browsable listings) ── */}
        <ListingsFilter initialAds={allAds} />

        {/* ── District Quick Links — GEO targeting for location keywords ── */}
        <section aria-label="Browse by district" style={{ marginTop: "var(--space-2xl)", marginBottom: "var(--space-xl)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "700", marginBottom: "0.5rem" }}>
            Popular Districts
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginBottom: "var(--space-md)" }}>
            Find verified ads in your district across Sri Lanka
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-xs)" }}>
            {FEATURED_DISTRICTS.map((district) => (
              <div key={district} style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                {CATEGORIES.slice(0, 3).map((cat) => (
                  <Link
                    key={`${district}-${cat.slug}`}
                    href={`/${cat.slug}/${district.toLowerCase().replace(/\s+/g, "-")}`}
                    style={{
                      display: "inline-block",
                      padding: "0.3rem 0.75rem",
                      background: "var(--surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-full)",
                      fontSize: "var(--text-xs)",
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat.name} in {district}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          {/* Secondary district list — all districts for full crawl coverage */}
          <div style={{ marginTop: "var(--space-sm)", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {DISTRICTS.map((district) => (
              <Link
                key={district}
                href={`/girls-personal/${district.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                  textDecoration: "underline",
                }}
              >
                {district}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Platform Overview — E-E-A-T trust signals ── */}
        <section
          id="editorial-content"
          style={{ marginBottom: "var(--space-xl)", padding: "var(--space-lg)", background: "var(--surface-elevated)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}
        >
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", marginBottom: "var(--space-sm)" }}>
            About Lankan Ads — Sri Lanka&apos;s Verified Classifieds
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: 1.7, marginBottom: "var(--space-sm)" }}>
            Lankan Ads is Sri Lanka&apos;s dedicated platform for verified classified ads covering personal services,
            spa &amp; wellness, matrimonial listings, and digital entertainment. Unlike general classifieds,
            every advertiser on lankanads.lk must verify their Sri Lankan mobile number via SMS OTP before posting.
            All submitted ads pass through a manual moderation queue before going live, ensuring genuine, high-quality listings.
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: 1.7 }}>
            We serve all 25 districts of Sri Lanka — from Colombo and Gampaha in the Western Province,
            to Kandy and Matale in the Central Province, to Jaffna and Trincomalee in the Northern and Eastern Provinces.
            Advertisers can reach their target audience with three listing tiers: Standard (Rs. 700 / 7 days),
            Premium (Rs. 1,400 / priority placement), and Platinum (Rs. 5,000 / top spotlight for 3 days).
          </p>
        </section>

        {/* ── Site-wide FAQ — AEO signal for Google AI Overviews ── */}
        <section id="faqs-section" style={{ marginBottom: "var(--space-2xl)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "700", marginBottom: "var(--space-md)" }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {SITE_FAQS.map((faq) => (
              <details
                key={faq.id}
                id={`faq-${faq.id}`}
                style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-md)",
                }}
              >
                <summary
                  style={{
                    fontWeight: "600",
                    fontSize: "var(--text-sm)",
                    cursor: "pointer",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {faq.questionEn}
                  <span style={{ fontSize: "1.2rem", flexShrink: 0, marginLeft: "1rem" }}>+</span>
                </summary>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginTop: "0.75rem", lineHeight: 1.6 }}>
                  {faq.answerEn}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
