// ============================================================
// Lankan Ads — Category Page (Dynamic SSR)
// ============================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/constants";
import { generateCategoryMetadata } from "@/lib/seo/meta-tags";
import { generateCollectionPageSchema, generateItemListSchema } from "@/lib/seo/structured-data";
import { getAdsByCategory } from "@/lib/db/queries";
import SchemaMarkup from "@/components/SchemaMarkup";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdCard from "@/components/AdCard";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) return {};
  return generateCategoryMetadata(category);
}

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.slug }));
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = CATEGORIES.find((c) => c.slug === categorySlug);

  if (!category) {
    notFound();
  }

  const ads = await getAdsByCategory(categorySlug);
  const platinumAds = ads.filter((ad) => ad.adTier === "platinum");
  const premiumAds = ads.filter((ad) => ad.adTier === "premium");
  const standardAds = ads.filter((ad) => ad.adTier === "standard");


  return (
    <>
      <SchemaMarkup
        data={[
          generateCollectionPageSchema(category),
          generateItemListSchema(ads, category.name, `https://lankan-ads.lk/${category.slug}`),
        ]}
      />

      <div className="container">
        <Breadcrumbs items={[{ label: category.name, href: `/${category.slug}` }]} />

        {/* Header */}
        <section className={styles.header}>
          <div className={styles.headerContent}>
            <span className={styles.headerIcon}>{category.icon}</span>
            <div>
              <h1 className={styles.title}>{category.name}</h1>
              <p className={styles.description}>{category.description}</p>
              <p className={styles.adCount}>
                {ads.length} active listing{ads.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </section>

        {/* Sub-categories */}
        {category.subCategories.length > 0 && (
          <section className={styles.subCategories} id="sub-categories">
            <h2 className={styles.subTitle}>Browse by Type</h2>
            <div className={styles.subGrid}>
              {category.subCategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${category.slug}/${sub.slug}`}
                  className={styles.subCard}
                >
                  <span className={styles.subName}>{sub.name}</span>
                  <span className={styles.subDesc}>{sub.description}</span>
                  <span className={styles.subArrow}>→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Ads by tier */}
        {platinumAds.length > 0 && (
          <section className={styles.tierSection}>
            <div className={styles.tierHeader}>
              <span className="badge badge-platinum">Platinum</span>
              <h2 className={styles.tierTitle}>Platinum Ads</h2>
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
              <h2 className={styles.tierTitle}>Premium Ads</h2>
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
              <h2 className={styles.tierTitle}>Standard Ads</h2>
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
            <p>No active listings in this category yet.</p>
            <Link href="/post-ad" className="btn btn-primary">
              Be the first — Post an Ad
            </Link>
          </section>
        )}
      </div>
    </>
  );
}
