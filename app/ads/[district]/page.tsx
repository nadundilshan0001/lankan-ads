



import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES, DISTRICTS, SITE_CONFIG } from "@/lib/constants";
import { generateBreadcrumbSchema, generateItemListSchema } from "@/lib/seo/structured-data";
import { getAdsByDistrict } from "@/lib/db/queries";
import SchemaMarkup from "@/components/SchemaMarkup";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdCard from "@/components/AdCard";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ district: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { district: districtParam } = await params;
  const districtName = DISTRICTS.find(
    (d) => d.toLowerCase().replace(/\s+/g, "-") === districtParam.toLowerCase()
  );

  if (!districtName) return {};

  const title = `Classified Ads in ${districtName} — ${SITE_CONFIG.name}`;
  const description = `Find verified personal services, spa & wellness, live cam sessions, and matrimonial proposals in ${districtName}, Sri Lanka on ${SITE_CONFIG.name}.`;
  const url = `${SITE_CONFIG.url}/ads/${districtParam}`;

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

export function generateStaticParams() {
  return DISTRICTS.map((dist) => ({
    district: dist.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export default async function DistrictPage({ params }: PageProps) {
  const { district: districtParam } = await params;
  const districtName = DISTRICTS.find(
    (d) => d.toLowerCase().replace(/\s+/g, "-") === districtParam.toLowerCase()
  );

  if (!districtName) {
    notFound();
  }

  const ads = await getAdsByDistrict(districtName);
  const platinumAds = ads.filter((ad) => ad.adTier === "platinum");
  const premiumAds = ads.filter((ad) => ad.adTier === "premium");
  const standardAds = ads.filter((ad) => ad.adTier === "standard");

  const pageUrl = `${SITE_CONFIG.url}/ads/${districtParam}`;

  const breadcrumbs = [
    { label: "Ads", href: "/" },
    { label: districtName, href: `/ads/${districtParam}` },
  ];

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Classified Ads in ${districtName} - ${SITE_CONFIG.name}`,
    url: pageUrl,
    description: `Browse verified personal services and spa listings in ${districtName}, Sri Lanka.`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What services are available in ${districtName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `You can find various services including Girls Personal, Boys Personal, Shemale Personal, Live Cam, Spa & Wellness, and Marriage Proposals in the ${districtName} area.`,
        },
      },
      {
        "@type": "Question",
        name: `How can I find a verified service provider in ${districtName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `All ads on Lankan Ads undergo manual admin review and require phone number OTP verification to ensure credibility and reduce fake listings in ${districtName}.`,
        },
      },
    ],
  };

  const schemas = [
    collectionSchema,
    generateItemListSchema(ads, `Classified Ads in ${districtName}`, pageUrl),
    generateBreadcrumbSchema(
      breadcrumbs.map((b) => ({
        name: b.label,
        url: `${SITE_CONFIG.url}${b.href}`,
      }))
    ),
    faqSchema,
  ];

  return (
    <>
      <SchemaMarkup data={schemas} />

      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbs} />

        {}
        <section className={styles.header}>
          <h1 className={styles.title}>Ads in {districtName}</h1>
          <p className={styles.description}>
            Browse verified listings in personal services, spa &amp; wellness, and other services in {districtName}, Sri Lanka.
          </p>
          <p className={styles.adCount}>
            {ads.length} active listing{ads.length !== 1 ? "s" : ""} found
          </p>
        </section>

        {}
        <section className={styles.filtersSection}>
          <h2 className={styles.filterTitle}>Filter by Category</h2>
          <div className={styles.filterChips}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/${cat.slug}/${districtParam}`}
                className={styles.filterChip}
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </section>

        {}
        {platinumAds.length > 0 && (
          <section className={styles.tierSection}>
            <div className={styles.tierHeader}>
              <span className="badge badge-platinum">Platinum</span>
              <h2 className={styles.tierTitle}>Platinum Spotlight</h2>
            </div>
            <div className={`grid grid-3 ${styles.adGrid}`}>
              {platinumAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </section>
        )}

        {premiumAds.length > 0 && (
          <section className={styles.tierSection}>
            <div className={styles.tierHeader}>
              <span className="badge badge-premium">Premium</span>
              <h2 className={styles.tierTitle}>Premium Spotlight</h2>
            </div>
            <div className={`grid grid-3 ${styles.adGrid}`}>
              {premiumAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </section>
        )}

        {standardAds.length > 0 && (
          <section className={styles.tierSection}>
            <div className={styles.tierHeader}>
              <span className="badge badge-standard">Standard</span>
              <h2 className={styles.tierTitle}>Latest Listings</h2>
            </div>
            <div className={`grid grid-3 ${styles.adGrid}`}>
              {standardAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </section>
        )}

        {ads.length === 0 && (
          <section className={styles.empty}>
            <p>No active listings in {districtName} yet.</p>
            <Link href="/post-ad" className="btn btn-primary">
              Be the first — Post an Ad
            </Link>
          </section>
        )}

        {}
        <section className={styles.districtsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Browse Other Locations</h2>
          </div>
          <div className={styles.districtGrid}>
            {DISTRICTS.filter((d) => d !== districtName).map((district) => (
              <Link
                key={district}
                href={`/ads/${district.toLowerCase().replace(/\s+/g, "-")}`}
                className={styles.districtChip}
              >
                {district}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
