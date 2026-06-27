"use client";

// ============================================================
// Lankan Ads — User Profile Dashboard
// ============================================================

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ad } from "@/lib/types";
import styles from "./page.module.css";

type Tab = "my-ads" | "new-ad" | "recover";

export default function ProfilePage() {
  const router = useRouter();
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("my-ads");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoredIds, setRestoredIds] = useState<string[]>([]);

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
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMyAds(data.ads || []);
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

  const handleRestore = async (adId: string) => {
    const token = localStorage.getItem("lankan_ads_token");
    if (!token) return;
    setRestoringId(adId);
    try {
      const res = await fetch(`/api/ads?id=${adId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "pending" }),
      });
      const data = await res.json();
      if (data.success) {
        setRestoredIds((prev) => [...prev, adId]);
        fetchMyAds(token);
      }
    } catch (err) {
      console.error("Restore failed:", err);
    } finally {
      setRestoringId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container} style={{ textAlign: "center", padding: "100px" }}>
        <h2 style={{ color: "var(--text-primary)" }}>Loading Your Profile...</h2>
      </div>
    );
  }

  const activeAds = myAds.filter((ad) => ad.status === "active");
  const pendingAds = myAds.filter((ad) => ad.status === "pending");

  return (
    <div className={styles.container}>
      {/* ===== PROFILE HEADER CARD ===== */}
      <section className={styles.profileCard}>
        <div className={styles.userInfo}>
          <span className={styles.phoneLabel}>Registered Account</span>
          <span className={styles.phoneNum}>
            {userPhone}
            <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified User</span>
          </span>
          <div className={styles.adStats}>
            <span className={styles.adStatItem}>
              <span className={styles.adStatNum}>{myAds.length}</span> Total Ads
            </span>
            <span className={styles.adStatDivider}>•</span>
            <span className={styles.adStatItem}>
              <span className={styles.adStatNum}>{activeAds.length}</span> Active
            </span>
            <span className={styles.adStatDivider}>•</span>
            <span className={styles.adStatItem}>
              <span className={styles.adStatNum}>{pendingAds.length}</span> Pending
            </span>
          </div>
        </div>
        <div className={styles.userActions}>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
            Sign Out
          </button>
        </div>
      </section>

      {/* ===== TAB NAVIGATION ===== */}
      <nav className={styles.tabNav} role="tablist" aria-label="Profile sections">
        <button
          id="tab-my-ads"
          role="tab"
          aria-selected={activeTab === "my-ads"}
          className={`${styles.tab} ${activeTab === "my-ads" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("my-ads")}
        >
          My Advertisements
          {myAds.length > 0 && (
            <span className={styles.tabBadge}>{myAds.length}</span>
          )}
        </button>

        <button
          id="tab-new-ad"
          role="tab"
          aria-selected={activeTab === "new-ad"}
          className={`${styles.tab} ${activeTab === "new-ad" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("new-ad")}
        >
          New Advertisement
        </button>

        <button
          id="tab-recover"
          role="tab"
          aria-selected={activeTab === "recover"}
          className={`${styles.tab} ${activeTab === "recover" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("recover")}
        >
          Recover
        </button>
      </nav>

      {/* ===== TAB PANELS ===== */}

      {/* MY ADVERTISEMENTS */}
      {activeTab === "my-ads" && (
        <section className={styles.tabPanel} role="tabpanel" aria-labelledby="tab-my-ads">
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
                    <div className={styles.adImageContainer}>
                      {ad.images && ad.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ad.images[0].cloudinaryUrl} alt={ad.titleEn} className={styles.adImage} />
                      ) : (
                        <div className={styles.placeholderImage}>No Photo</div>
                      )}
                    </div>

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
              <button onClick={() => setActiveTab("new-ad")} className="btn btn-primary">
                Post an Ad Now
              </button>
            </div>
          )}
        </section>
      )}

      {/* NEW ADVERTISEMENT */}
      {activeTab === "new-ad" && (
        <section className={styles.tabPanel} role="tabpanel" aria-labelledby="tab-new-ad">
          <div className={styles.newAdSection}>
            <div className={styles.newAdHeader}>
              <h2 className={styles.newAdTitle}>Post a New Advertisement</h2>
              <p className={styles.newAdSubtitle}>
                Choose your listing tier and reach thousands of potential clients across Sri Lanka. Your ad will be reviewed and published within minutes.
              </p>
            </div>

            <div className={styles.tierCards}>
              <div className={styles.tierCard}>
                <div className={styles.tierBadgeTop} style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                  🔥 Max Visibility
                </div>
                <h3 className={styles.tierName}>Platinum Ad</h3>
                <div className={styles.tierPrice}>Rs. 8,000</div>
                <p className={styles.tierDesc}>Top placement across all category and district pages. Maximum exposure for serious advertisers.</p>
                <ul className={styles.tierFeatures}>
                  <li>✓ Priority top placement</li>
                  <li>✓ Bold red border highlight</li>
                  <li>✓ 7-day spotlight duration</li>
                  <li>✓ Featured in search results</li>
                </ul>
                <Link href="/post-ad" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Post Platinum Ad
                </Link>
              </div>

              <div className={styles.tierCard}>
                <div className={styles.tierBadgeTop} style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                  ⭐ Premium Reach
                </div>
                <h3 className={styles.tierName}>Premium Ad</h3>
                <div className={styles.tierPrice}>Rs. 1,399</div>
                <p className={styles.tierDesc}>Enhanced visibility with gold highlight and placement above standard listings.</p>
                <ul className={styles.tierFeatures}>
                  <li>✓ Above standard placement</li>
                  <li>✓ Gold border highlight</li>
                  <li>✓ 3-day spotlight duration</li>
                  <li>✓ Visible in search results</li>
                </ul>
                <Link href="/post-ad" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Post Premium Ad
                </Link>
              </div>

              <div className={styles.tierCard}>
                {myAds.length === 0 && (
                  <div className={styles.tierBadgeTop} style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                    🎁 First Ad Free
                  </div>
                )}
                <h3 className={styles.tierName}>Standard Ad</h3>
                <div className={styles.tierPrice}>
                  {myAds.length === 0 ? <span style={{ color: "#10b981" }}>Free</span> : "Rs. 699"}
                </div>
                <p className={styles.tierDesc}>Standard placement in the listings directory. Perfect for getting started.</p>
                <ul className={styles.tierFeatures}>
                  <li>✓ Standard listing placement</li>
                  <li>✓ Visible across categories</li>
                  <li>✓ No spotlight duration</li>
                  {myAds.length === 0 && <li>✓ <strong>Free for first ad</strong></li>}
                </ul>
                <Link href="/post-ad" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  Post Standard Ad
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RECOVER */}
      {activeTab === "recover" && (
        <section className={styles.tabPanel} role="tabpanel" aria-labelledby="tab-recover">
          <div className={styles.recoverSection}>
            <div className={styles.recoverHeader}>
              <h2 className={styles.recoverTitle}>Recover Deleted Posts</h2>
              <p className={styles.recoverSubtitle}>
                Your expired or removed advertisements are listed below. You can restore them back to pending review and they will be re-published once approved by our team.
              </p>
            </div>

            {(() => {
              const deletedAds = myAds.filter((ad) => ad.status === "expired" || ad.status === "draft");
              if (deletedAds.length === 0) {
                return (
                  <div className={styles.recoverEmpty}>
                    <h3>No Deleted Posts</h3>
                    <p>You have no expired or removed advertisements at this time.</p>
                  </div>
                );
              }
              return (
                <div className={styles.deletedAdsList}>
                  {deletedAds.map((ad) => {
                    const isRestored = restoredIds.includes(ad.id);
                    const isRestoring = restoringId === ad.id;
                    const displayDate = new Date(ad.createdAt).toLocaleDateString("en-LK", {
                      year: "numeric", month: "short", day: "numeric",
                    });
                    return (
                      <div key={ad.id} className={`${styles.deletedAdItem} ${isRestored ? styles.deletedAdRestored : ""}`}>
                        <div className={styles.adImageContainer}>
                          {ad.images && ad.images.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={ad.images[0].cloudinaryUrl} alt={ad.titleEn} className={styles.adImage} />
                          ) : (
                            <div className={styles.placeholderImage}>No Photo</div>
                          )}
                        </div>
                        <div className={styles.adDetails}>
                          <h3 className={styles.adTitle}>{ad.titleEn}</h3>
                          <div className={styles.adMeta}>
                            <span>{ad.city}, {ad.district}</span>
                            <span>•</span>
                            <span>Posted {displayDate}</span>
                          </div>
                          <div className={styles.statusBadges}>
                            <span className={`${styles.statusBadge} ${ad.status === "expired" ? styles.statusDraft : styles.statusPending}`}>
                              {ad.status === "expired" ? "Expired" : "Draft"}
                            </span>
                            <span className={`${styles.tierBadge} ${styles["tier" + ad.adTier]}`}>
                              {ad.adTier.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className={styles.adActions}>
                          {isRestored ? (
                            <span className={styles.restoredLabel}>✓ Submitted</span>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleRestore(ad.id)}
                              disabled={isRestoring}
                              id={`restore-ad-${ad.id}`}
                            >
                              {isRestoring ? "Restoring..." : "↺ Restore"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div className={styles.recoverHelp}>
              <h4>How does restoration work?</h4>
              <p>Restored ads will be set to "Awaiting Review" and published on the site after verification by our moderation team. This usually takes less than 24 hours.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
