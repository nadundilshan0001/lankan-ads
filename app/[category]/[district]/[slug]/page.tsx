// ============================================================
// Lankan Ads — Ad Detail Page (Dynamic SSR)
// ============================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/constants";
import { generateAdMetadata } from "@/lib/seo/meta-tags";
import {
  generateServiceSchema,
  generateLocalBusinessSchema,
} from "@/lib/seo/structured-data";
import { getAdBySlug } from "@/lib/db/queries";
import SchemaMarkup from "@/components/SchemaMarkup";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdGallery from "@/components/AdGallery";
import AdActions from "@/components/AdActions";
import ReportAdButton from "@/components/ReportAdButton";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ category: string; district: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ad = await getAdBySlug(slug);
  if (!ad) return {};
  return generateAdMetadata(ad);
}

export default async function AdDetailPage({ params }: PageProps) {
  const { category: categorySlug, slug } = await params;
  const ad = await getAdBySlug(slug);

  if (!ad) {
    notFound();
  }

  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  const schemaData =
    ad.category === "spa-wellness"
      ? generateLocalBusinessSchema(ad)
      : generateServiceSchema(ad);

  return (
    <>
      <SchemaMarkup data={schemaData} />

      <div className="container">
        <Breadcrumbs
          items={[
            { label: category?.name || ad.category, href: `/${ad.category}` },
            { label: ad.district, href: `/${ad.category}/${ad.district.toLowerCase()}` },
            { label: ad.titleEn, href: `/${ad.category}/${ad.district.toLowerCase()}/${ad.slug}` },
          ]}
        />

        <article className={styles.adDetail} id={`ad-detail-${ad.id}`}>
          {/* Image Gallery (Client Component) */}
          <AdGallery
            images={ad.images || []}
            titleEn={ad.titleEn}
            adTier={ad.adTier}
            categoryIcon={category?.icon}
          />

          {/* Content */}
          <div className={styles.content}>
            {/* Title & Meta */}
            <header className={styles.adHeader}>
              <div className={styles.adMeta}>
                <span className="badge badge-category">{category?.name}</span>
                {ad.subCategory && (
                  <span className={styles.subCategory}>• {ad.subCategory.replace(/-/g, " ")}</span>
                )}
                {ad.role && (
                  <span className={styles.subCategory}>• Role: {ad.role}</span>
                )}
                <span className={`${styles.adTierBadge} ${styles[ad.adTier]}`}>
                  {ad.adTier}
                </span>
              </div>
              <h1 className={styles.adTitle}>{ad.titleEn}</h1>
              <div className={styles.adInfo}>
                <span className={styles.infoItem}>{ad.city}, {ad.district}</span>
                <span className={styles.infoItem}>{ad.viewCount.toLocaleString()} views</span>
                <span className={styles.infoItem}>
                  Posted {new Date(ad.createdAt).toLocaleDateString("en-LK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </header>

            {/* Like, Save, Share Buttons */}
            <AdActions adId={ad.id} title={ad.titleEn} initialLikes={ad.likeCount || 0} />

            {/* Price */}
            {ad.priceRange && (
              <div className={styles.priceBox}>
                <span className={styles.priceLabel}>Starting Price</span>
                <span className={styles.priceValue}>Rs. {ad.priceRange}</span>
              </div>
            )}

            {/* Description */}
            <section className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>Description</h2>
              <p className={styles.description}>{ad.descriptionEn}</p>
            </section>



            {/* Contact CTA */}
            <section className={styles.contactSection}>
              <h2 className={styles.sectionTitle}>Contact</h2>
              <div className={styles.contactActions}>
                <a
                  href={`https://wa.me/${(ad.whatsappNumber || ad.contactNumber).replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn btn-primary btn-lg ${styles.whatsappBtn}`}
                  id="contact-whatsapp"
                >
                  Chat on WhatsApp ({ad.whatsappNumber || ad.contactNumber})
                </a>
                <a
                  href={`tel:${ad.contactNumber}`}
                  className={`btn btn-secondary btn-lg ${styles.callBtn}`}
                  id="contact-phone"
                >
                  Call Now ({ad.contactNumber})
                </a>
              </div>
              <p className={styles.contactNote}>
                Contact the advertiser directly. Lankan Ads is not responsible for the services offered.
              </p>
            </section>

            {/* Report */}
            <div className={styles.reportLink}>
              <ReportAdButton adId={ad.id} />
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
