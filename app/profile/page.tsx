"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ad } from "@/lib/types";
import styles from "./page.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("lankan_ads_token");
    const phone = localStorage.getItem("lankan_ads_phone");

    if (!token || !phone) {
      router.push("/login");
      return;
    }

    setUserPhone(phone);
    fetchMyAds(token);
  }, [router]);

  const fetchMyAds = async (token: string) => {
    try {
      const res = await fetch("/api/ads", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setMyAds(data.ads || []);
      }
    } catch (err) {
      console.error("Failed to load user ads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("lankan_ads_token");
    localStorage.removeItem("lankan_ads_phone");
    router.push("/home");
  };

  if (isLoading) {
    return (
      <div className={styles.container} style={{ textAlign: "center", padding: "100px" }}>
        <h2 style={{ color: "var(--text-primary)" }}>Loading Your Profile...</h2>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* User Info Card */}
      <section className={styles.profileCard}>
        <div className={styles.userInfo}>
          <span className={styles.phoneLabel}>Registered Account</span>
          <span className={styles.phoneNum}>
            {userPhone}
            <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified User</span>
          </span>
        </div>
        <div className={styles.userActions}>
          <Link href="/post-ad" className="btn btn-primary btn-sm">
            Post New Ad
          </Link>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
            Sign Out
          </button>
        </div>
      </section>

      {/* User Listings Catalog */}
      <section>
        <h2 className={styles.sectionTitle}>My Advertisements</h2>

        {myAds.length > 0 ? (
          <div className={styles.adsList}>
            {myAds.map((ad) => {
              const displayDate = new Date(ad.createdAt).toLocaleDateString("en-LK", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              const detailUrl = `/${ad.category}/${ad.district}/${ad.slug}`;

              return (
                <div key={ad.id} className={styles.adItem} id={`my-ad-${ad.id}`}>
                  {/* Image Preview */}
                  <div className={styles.adImageContainer}>
                    {ad.images && ad.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ad.images[0].cloudinaryUrl}
                        alt={ad.titleEn}
                        className={styles.adImage}
                      />
                    ) : (
                      <div className={styles.placeholderImage}>No Photo</div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className={styles.adDetails}>
                    <h3 className={styles.adTitle}>{ad.titleEn}</h3>
                    <div className={styles.adMeta}>
                      <span>{ad.city}, {ad.district}</span>
                      <span>•</span>
                      <span>Posted {displayDate}</span>
                      {ad.priceRange && (
                        <>
                          <span>•</span>
                          <span>{ad.priceRange}</span>
                        </>
                      )}
                    </div>
                    <div className={styles.statusBadges}>
                      <span className={`${styles.statusBadge} ${styles["status" + ad.status.charAt(0).toUpperCase() + ad.status.slice(1)]}`}>
                        {ad.status === "active" ? "Approved" : ad.status === "pending" ? "Awaiting Review" : "Draft"}
                      </span>
                      <span className={`${styles.tierBadge} ${styles["tier" + ad.adTier]}`}>
                        {ad.adTier.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.adActions}>
                    {ad.status === "active" ? (
                      <Link href={detailUrl} className="btn btn-secondary btn-sm" id={`view-ad-${ad.id}`}>
                        View Live Ad
                      </Link>
                    ) : (
                      <button disabled className="btn btn-secondary btn-sm" style={{ opacity: 0.5, cursor: "not-allowed" }}>
                        In Queue
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No Ads Created Yet</h3>
            <p className={styles.emptyText}>
              You have not posted any classified listings under this account. Click the button below to publish your first advertisement!
            </p>
            <Link href="/post-ad" className="btn btn-primary">
              Post an Ad Now
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
