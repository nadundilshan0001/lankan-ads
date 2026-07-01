



import Link from "next/link";
import Image from "next/image";
import type { Ad } from "@/lib/types";
import { getCategoryBySlug } from "@/lib/constants";
import CategoryIcon from "./CategoryIcon";
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

  
  const formatStatsNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  
  const simulatedViews = ad.viewCount;
  const simulatedLikes = ad.likeCount || 0;

  const formattedViews = formatStatsNumber(simulatedViews);
  const formattedLikes = formatStatsNumber(simulatedLikes);

  return (
    <article
      className={`${styles.card} ${tierClass} ${ad.adTier === "platinum" ? styles.platinumCard : ""}`}
      id={`ad-${ad.id}`}
    >
      {}
      <div className={styles.topBadges}>
        <span className={`${styles.badgeOverlapping} ${styles["badge" + ad.adTier.charAt(0).toUpperCase() + ad.adTier.slice(1)]}`}>
          {ad.adTier === "platinum" ? "Platinum Ad" : ad.adTier === "premium" ? "Premium Ad" : "Standard Ad"}
        </span>
      </div>

      {}
      <Link href={adUrl} className={styles.imageWrapper}>
        {ad.images && ad.images.length > 0 ? (
          
          <Image
            src={ad.images[0].cloudinaryUrl}
            alt={ad.titleEn}
            width={400}
            height={300}
            className={styles.adImage}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={ad.adTier === "platinum"}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>
              <CategoryIcon slug={ad.category} size={40} />
            </span>
          </div>
        )}

        {}
        <span className={styles.categoryBadge}>
          {category?.name || ad.category}
        </span>
      </Link>

      {}
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
          {ad.role && (
            <span className={styles.metaItem} style={{ color: "var(--color-primary-light)", fontWeight: "600" }}>
              • {ad.role}
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
