// ============================================================
// Lankan Ads — Ad Card Component
// ============================================================

import Link from "next/link";
import type { Ad } from "@/lib/types";
import { getCategoryBySlug } from "@/lib/constants";
import styles from "./AdCard.module.css";

interface AdCardProps {
  ad: Ad;
  variant?: "default" | "compact" | "featured";
}

export default function AdCard({ ad, variant = "default" }: AdCardProps) {
  const category = getCategoryBySlug(ad.category);
  const adUrl = `/${ad.category}/${ad.district.toLowerCase()}/${ad.slug}`;

  const tierClass =
    ad.adTier === "platinum"
      ? styles.platinum
      : ad.adTier === "premium"
        ? styles.premium
        : styles.standard;

  const timeAgo = getTimeAgo(ad.createdAt);

  return (
    <article
      className={`${styles.card} ${tierClass} ${variant === "featured" ? styles.featured : ""} ${variant === "compact" ? styles.compact : ""}`}
      id={`ad-${ad.id}`}
    >
      {/* Tier Glow Border */}
      {ad.adTier !== "standard" && <div className={styles.glowBorder} />}

      {/* Image Area */}
      <Link href={adUrl} className={styles.imageWrapper}>
        {ad.images && ad.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.images[0].cloudinaryUrl}
            alt={ad.titleEn}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>{category?.icon || ""}</span>
          </div>
        )}

        {/* Tier Badge */}
        <span className={`badge ${styles.tierBadge} badge-${ad.adTier}`}>
          {ad.adTier.charAt(0).toUpperCase() + ad.adTier.slice(1)}
        </span>

        {/* Category Badge */}
        <span className={`badge badge-category ${styles.categoryBadge}`}>
          {category?.name || ad.category}
        </span>
      </Link>

      {/* Content */}
      <div className={styles.content}>
        <Link href={adUrl} className={styles.titleLink}>
          <h3 className={styles.title}>{ad.titleEn}</h3>
        </Link>

        <p className={styles.description}>
          {ad.descriptionEn.substring(0, 120)}
          {ad.descriptionEn.length > 120 ? "..." : ""}
        </p>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            {ad.city}, {ad.district}
          </span>
          {ad.priceRange && (
            <span className={styles.metaItem}>
              {ad.priceRange}
            </span>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.stats}>
            <span className={styles.stat}>{ad.viewCount.toLocaleString()} views</span>
            <span className={styles.stat}>{timeAgo}</span>
          </div>

          <Link href={adUrl} className={styles.viewBtn}>
            View Details →
          </Link>
        </div>
      </div>
    </article>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-LK", { month: "short", day: "numeric" });
}
