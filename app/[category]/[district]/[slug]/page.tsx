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
          {/* Image Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {ad.images && ad.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ad.images[0].cloudinaryUrl}
                  alt={ad.titleEn}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span className={styles.placeholderIcon}>{category?.icon || ""}</span>
                  <span className={styles.placeholderText}>Ad Image</span>
                </div>
              )}
              <span className={`badge badge-${ad.adTier} ${styles.tierBadge}`}>
                {ad.adTier.charAt(0).toUpperCase() + ad.adTier.slice(1)}
              </span>
            </div>
            {ad.images && ad.images.length > 0 && (
              <div className={styles.thumbnails}>
                {ad.images.map((img) => (
                  <div key={img.id} className={styles.thumbnail}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.cloudinaryUrl}
                      alt={img.altText || ad.titleEn}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Title & Meta */}
            <header className={styles.adHeader}>
              <div className={styles.adMeta}>
                <span className="badge badge-category">{category?.name}</span>
                {ad.subCategory && (
                  <span className={styles.subCategory}>• {ad.subCategory.replace(/-/g, " ")}</span>
                )}
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

            {/* Price */}
            {ad.priceRange && (
              <div className={styles.priceBox}>
                <span className={styles.priceLabel}>Price Range</span>
                <span className={styles.priceValue}>{ad.priceRange}</span>
              </div>
            )}

            {/* Description */}
            <section className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>Description</h2>
              <p className={styles.description}>{ad.descriptionEn}</p>
            </section>

            {/* Details */}
            <section className={styles.detailsSection}>
              <h2 className={styles.sectionTitle}>Details</h2>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Category</span>
                  <span className={styles.detailValue}>{category?.name}</span>
                </div>
                {ad.subCategory && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Type</span>
                    <span className={styles.detailValue}>
                      {ad.subCategory.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Location</span>
                  <span className={styles.detailValue}>{ad.serviceArea}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>District</span>
                  <span className={styles.detailValue}>{ad.district}</span>
                </div>
                {ad.availabilityHours && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Hours</span>
                    <span className={styles.detailValue}>{ad.availabilityHours}</span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Ad Tier</span>
                  <span className={styles.detailValue}>
                    <span className={`badge badge-${ad.adTier}`}>
                      {ad.adTier.charAt(0).toUpperCase() + ad.adTier.slice(1)}
                    </span>
                  </span>
                </div>
              </div>
            </section>

            {/* Contact CTA */}
            <section className={styles.contactSection}>
              <h2 className={styles.sectionTitle}>Contact</h2>
              <div className={styles.contactActions}>
                <a
                  href={`https://wa.me/${ad.contactNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn btn-primary btn-lg ${styles.whatsappBtn}`}
                  id="contact-whatsapp"
                >
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${ad.contactNumber}`}
                  className={`btn btn-secondary btn-lg ${styles.callBtn}`}
                  id="contact-phone"
                >
                  Call Now
                </a>
              </div>
              <p className={styles.contactNote}>
                Contact the advertiser directly. Lankan Ads is not responsible for the services offered.
              </p>
            </section>

            {/* Report */}
            <div className={styles.reportLink}>
              <button className={styles.reportBtn} id="report-ad">
                Report this ad
              </button>
            </div>
          </div>
        </article>

        {/* Back Link */}
        <div className={styles.backLink}>
          <Link href={`/${ad.category}`} className="btn btn-secondary">
            Back to {category?.name}
          </Link>
        </div>
      </div>
    </>
  );
}
