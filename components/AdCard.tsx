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

  // Stats formatting helpers
  const formatStatsNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  // Simulate active stats for high-fidelity appearance
  const simulatedViews = ad.viewCount * 12 + 45;
  const simulatedLikes = Math.floor(simulatedViews * 0.08) + 2;

  const formattedViews = formatStatsNumber(simulatedViews);
  const formattedLikes = formatStatsNumber(simulatedLikes);

  return (
    <article
      className={`${styles.card} ${tierClass} ${ad.adTier === "platinum" ? styles.platinumCard : ""}`}
      id={`ad-${ad.id}`}
    >
      {/* Overlapping Top Badges */}
      <div className={styles.topBadges}>
        {(ad.adTier === "platinum" || ad.adTier === "premium") && (
          <span className={`${styles.badgeOverlapping} ${styles.badgeGreen}`}>
            Cash Back Guaranteed
          </span>
        )}
        <span className={`${styles.badgeOverlapping} ${styles["badge" + ad.adTier.charAt(0).toUpperCase() + ad.adTier.slice(1)]}`}>
          {ad.adTier === "platinum" ? "Platinum Ad" : ad.adTier === "premium" ? "Premium Ad" : "Standard Ad"}
        </span>
      </div>

      {/* Image Area (Left) */}
      <Link href={adUrl} className={styles.imageWrapper}>
        {ad.images && ad.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.images[0].cloudinaryUrl}
            alt={ad.titleEn}
            className={styles.adImage}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>{category?.icon || ""}</span>
          </div>
        )}

        {/* Small Category Label Overlay */}
        <span className={styles.categoryBadge}>
          {category?.name || ad.category}
        </span>
      </Link>

      {/* Content Area (Right) */}
      <div className={styles.content}>
        <Link href={adUrl} className={styles.titleLink}>
          <h3 className={styles.title}>{ad.titleEn}</h3>
        </Link>

        <p className={styles.description}>
          {ad.descriptionEn.substring(0, 150)}
          {ad.descriptionEn.length > 150 ? "..." : ""}
        </p>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            {ad.city}, {ad.district}
          </span>
          {ad.priceRange && (
            <span className={styles.metaItem}>
              Rs. {ad.priceRange}
            </span>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.stats}>
            <span className={styles.stat}>{formattedLikes} Likes</span>
            <span className={styles.stat}>{formattedViews} Views</span>
            <span className={styles.stat}>{timeAgo}</span>
          </div>
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
