// ============================================================
// Lankan Ads — About Page (SSR / Static)
// ============================================================

import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { generateOrganizationSchema } from "@/lib/seo/structured-data";
import SchemaMarkup from "@/components/SchemaMarkup";
import Breadcrumbs from "@/components/Breadcrumbs";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `About Us — ${SITE_CONFIG.name}`,
  description: `Learn more about ${SITE_CONFIG.name}, Sri Lanka's leading directory for personal services, wellness, marriage proposals, and live cam sessions. Discover our verification guidelines.`,
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
};

export default function AboutPage() {
  const organizationSchema = generateOrganizationSchema();
  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About Lankan Ads`,
    url: `${SITE_CONFIG.url}/about`,
    description: `About page explaining the services, verification system, and standards of Lankan Ads.`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };

  return (
    <>
      <SchemaMarkup data={[organizationSchema, aboutPageSchema]} />

      <div className={styles.container}>
        <Breadcrumbs items={[{ label: "About Us", href: "/about" }]} />

        <header className={styles.header}>
          <h1 className={styles.title}>About Lankan Ads</h1>
          <p className={styles.subtitle}>Sri Lanka&apos;s Premium Classifieds Platform</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Vision</h2>
          <p className={styles.text}>
            Lankan Ads was founded to provide a modern, organized, and secure classified advertising platform specifically optimized for Sri Lankan independent service providers, wellness businesses, traditional matrimonial matchmaking, and digital creators.
          </p>
          <p className={styles.text}>
            Our primary focus is on search engine discoverability. Every page on our platform is server-side rendered (SSR) and optimized for traditional search engines (Google, Bing) as well as modern AI search engines and voice assistants. This ensures that advertisers on Lankan Ads get maximum organic exposure, while visitors can find high-quality services near them instantly.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Verification &amp; Security</h2>
          <p className={styles.text}>
            We prioritize user safety and trust. To maintain a clean directory and minimize fraud, scam listings, or automated spam:
          </p>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Mobile OTP Verification</h3>
              <p className={styles.cardText}>
                Every advertiser is required to register using a valid Sri Lankan mobile number. An OTP (One-Time Password) is sent to verify ownership before posting.
              </p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Manual Moderation</h3>
              <p className={styles.cardText}>
                Every submitted advertisement goes through a manual verification queue. Our admin team checks titles, descriptions, and images before the ad goes live.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Monetisation &amp; Listing Tiers</h2>
          <p className={styles.text}>
            Lankan Ads operates on a fully paid model to maintain high-quality directory standards. There are no free listings. We offer three structured pricing tiers designed for varying promotion needs:
          </p>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Standard (Rs. 699)</h3>
              <p className={styles.cardText}>
                The baseline ad tier. Puts your ad in the normal section of our chronological feed for 7 days total.
              </p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Premium (Rs. 1,399)</h3>
              <p className={styles.cardText}>
                Grants a 24-hour spotlight at the second-highest section of our home page and category pages, before auto-demoting to standard for the remaining 6 days.
              </p>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Platinum (Rs. 6,000)</h3>
              <p className={styles.cardText}>
                The ultimate visibility tier. Puts your ad in the absolute top spotlight layer of our site for 3 days, followed by 4 days of standard placement.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.disclaimer}>
          <h2 className={styles.disclaimerTitle}>Adult Content &amp; Age Disclaimer (18+)</h2>
          <p className={styles.disclaimerText}>
            Lankan Ads lists services that are strictly intended for adults (18 years and older). By browsing or using this platform, you affirm that you are at least 18 years of age and that accessing such content is legal in your jurisdiction. 
          </p>
          <p className={styles.disclaimerText} style={{ marginTop: "1rem" }}>
            Lankan Ads does not employ the service providers, nor do we act as an agency. We are an advertising platform. Users and clients are encouraged to practice safety, discretion, and mutual respect. We reserves the right to remove any ad that violates our community standards, local laws, or ethical guidelines.
          </p>
        </section>
      </div>
    </>
  );
}
