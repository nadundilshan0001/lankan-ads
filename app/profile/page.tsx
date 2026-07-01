"use client";





import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ad } from "@/lib/types";
import styles from "./page.module.css";

type Tab = "my-ads" | "new-ad" | "recover" | "change-password";
type RecoverTier = "standard" | "premium" | "platinum";
type CpStep = "request" | "otp" | "newpw";

const TIER_DETAILS = {
  standard:  { displayName: "Standard Ad",  price: "Rs. 700",   color: "#a78bfa" },
  premium:   { displayName: "Premium Ad",   price: "Rs. 1,400", color: "#f59e0b" },
  platinum:  { displayName: "Platinum Ad",  price: "Rs. 5,000", color: "#ef4444" },
};


function slugifyDistrict(district: string): string {
  return district.toLowerCase().replace(/\s+/g, "-");
}


function useCountdown(expiresAt: string) {
  const calcRemaining = useCallback(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds };
  }, [expiresAt]);

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    const id = setInterval(() => setRemaining(calcRemaining()), 1000);
    return () => clearInterval(id);
  }, [calcRemaining]);

  return remaining;
}


function AdCountdown({ expiresAt }: { expiresAt: string }) {
  const r = useCountdown(expiresAt);
  if (!r) return <span className={styles.countdownExpired}>Expired</span>;
  return (
    <div className={styles.countdown}>
      <span className={styles.countdownLabel}>Expires in</span>
      <span className={styles.countdownTime}>
        {r.days > 0 && <><strong>{r.days}</strong>d </>}
        <strong>{String(r.hours).padStart(2, "0")}</strong>h{" "}
        <strong>{String(r.minutes).padStart(2, "0")}</strong>m{" "}
        <strong>{String(r.seconds).padStart(2, "0")}</strong>s
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("my-ads");

  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  
  const [recoverAdId, setRecoverAdId] = useState<string | null>(null);
  const [recoverTier, setRecoverTier] = useState<RecoverTier>("standard");
  const [isRecovering, setIsRecovering] = useState(false);

  
  const [permDeleteId, setPermDeleteId] = useState<string | null>(null);
  const [isPermDeleting, setIsPermDeleting] = useState(false);

  
  const [actionError, setActionError] = useState<string | null>(null);

  
  const [cpStep, setCpStep] = useState<CpStep>("request");
  const [cpOtp, setCpOtp] = useState(["" ,"", "", "", "", ""]);
  const [cpNewPw, setCpNewPw] = useState("");
  const [cpConfirmPw, setCpConfirmPw] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState("");
  const [cpSuccess, setCpSuccess] = useState("");
  const [cpDevOtp, setCpDevOtp] = useState("");
  const cpOtpRefs = React.useRef<(HTMLInputElement | null)[]>([]);

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

  async function fetchMyAds(token: string) {
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
  }

  const handleSignOut = () => {
    localStorage.removeItem("lankan_ads_token");
    localStorage.removeItem("lankan_ads_phone");
    localStorage.removeItem("lankan_ads_admin");
    localStorage.removeItem("lankan_ads_token_role");
    router.push("/home");
  };

  
  
  const handleSoftDelete = async (adId: string) => {
    const token = localStorage.getItem("lankan_ads_token");
    if (!token) return;
    setActionError(null);
    setIsDeletingId(adId);
    try {
      const res = await fetch(`/api/ads?id=${adId}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMyAds(token);
      } else {
        setActionError(data.error || "Failed to delete ad. Please try again.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setActionError("Network error. Please check your connection and try again.");
    } finally {
      setIsDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  
  const handleRecover = async () => {
    const token = localStorage.getItem("lankan_ads_token");
    if (!token || !recoverAdId) return;
    setActionError(null);
    setIsRecovering(true);
    try {
      const res = await fetch(`/api/ads?id=${recoverAdId}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active", adTier: recoverTier }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMyAds(token);
        setRecoverAdId(null);
      } else {
        setActionError(data.error || "Failed to restore ad. Please try again.");
      }
    } catch (err) {
      console.error("Recover failed:", err);
      setActionError("Network error. Please check your connection and try again.");
    } finally {
      setIsRecovering(false);
    }
  };

  
  const handlePermanentDelete = async (adId: string) => {
    const token = localStorage.getItem("lankan_ads_token");
    if (!token) return;
    setActionError(null);
    setIsPermDeleting(true);
    try {
      const res = await fetch(`/api/ads?id=${adId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchMyAds(token);
      } else {
        setActionError(data.error || "Failed to permanently delete ad.");
      }
    } catch (err) {
      console.error("Permanent delete failed:", err);
    } finally {
      setIsPermDeleting(false);
      setPermDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container} style={{ textAlign: "center", padding: "100px" }}>
        <h2 style={{ color: "var(--text-primary)" }}>Loading Your Profile...</h2>
      </div>
    );
  }

  const liveAds    = myAds.filter((ad) => ad.status === "active" || ad.status === "pending");
  const deletedAds = myAds.filter((ad) => ad.status === "deleted" || ad.status === "expired" || ad.status === "draft");

  return (
    <div className={styles.container}>
      {}
      <section className={styles.profileCard}>
        <div className={styles.userInfo}>
          <span className={styles.phoneLabel}>Registered Account</span>
          <span className={styles.phoneNum}>
            {userPhone}
            <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified User</span>
          </span>
          <div className={styles.adStats}>
            <span className={styles.adStatItem}>
              <span className={styles.adStatNum}>{liveAds.length}</span> Live Ads
            </span>
            <span className={styles.adStatDivider}>•</span>
            <span className={styles.adStatItem}>
              <span className={styles.adStatNum}>{deletedAds.length}</span> In Recover
            </span>
          </div>
        </div>
        <div className={styles.userActions}>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
            Sign Out
          </button>
        </div>
      </section>

      {}
      {actionError && (
        <div
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
            borderRadius: "var(--radius-lg)",
            padding: "0.75rem 1.25rem",
            fontSize: "var(--text-sm)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>⚠ {actionError}</span>
          <button
            onClick={() => setActionError(null)}
            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {}
      <nav className={styles.tabNav} role="tablist" aria-label="Profile sections">
        <button
          id="tab-my-ads"
          role="tab"
          aria-selected={activeTab === "my-ads"}
          className={`${styles.tab} ${activeTab === "my-ads" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("my-ads")}
        >
          My Advertisements
          {liveAds.length > 0 && (
            <span className={styles.tabBadge}>{liveAds.length}</span>
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
          {deletedAds.length > 0 && (
            <span className={styles.tabBadge} style={{ background: "#ef4444" }}>{deletedAds.length}</span>
          )}
        </button>

        <button
          id="tab-change-password"
          role="tab"
          aria-selected={activeTab === "change-password"}
          className={`${styles.tab} ${activeTab === "change-password" ? styles.tabActive : ""}`}
          onClick={() => { setActiveTab("change-password"); setCpStep("request"); setCpError(""); setCpSuccess(""); }}
        >
          🔑 Change Password
        </button>
      </nav>

      {}

      {}
      {activeTab === "my-ads" && (
        <section className={styles.tabPanel} role="tabpanel" aria-labelledby="tab-my-ads">
          {liveAds.length > 0 ? (
            <div className={styles.adsList}>
              {liveAds.map((ad) => {
                const displayDate = new Date(ad.createdAt).toLocaleDateString("en-LK", {
                  year: "numeric", month: "short", day: "numeric",
                });
                const detailUrl = `/${ad.category}/${slugifyDistrict(ad.district)}/${ad.slug}`;
                const isDeleting = isDeletingId === ad.id;

                return (
                  <div key={ad.id} className={styles.adItem} id={`my-ad-${ad.id}`}>
                    <div className={styles.adImageContainer}>
                      {ad.images && ad.images.length > 0 ? (
                        
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
                            <span>Rs. {ad.priceRange}</span>
                          </>
                        )}
                      </div>
                      <div className={styles.statusBadges}>
                        <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                          Live
                        </span>
                        <span className={`${styles.tierBadge} ${styles["tier" + ad.adTier]}`}>
                          {ad.adTier.toUpperCase()}
                        </span>
                      </div>
                      <AdCountdown expiresAt={ad.expiresAt} />
                    </div>

                    <div className={styles.adActions}>
                      <Link href={detailUrl} className="btn btn-secondary btn-sm" id={`view-ad-${ad.id}`}>
                        View Ad
                      </Link>
                      <button
                        className={`btn btn-sm ${styles.deleteBtn}`}
                        onClick={() => setDeleteConfirmId(ad.id)}
                        disabled={isDeleting}
                        id={`delete-ad-${ad.id}`}
                      >
                        {isDeleting ? "Deleting..." : "🗑 Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>No Live Ads</h3>
              <p className={styles.emptyText}>
                You have no active advertisements. Click below to post your first ad!
              </p>
              <button onClick={() => setActiveTab("new-ad")} className="btn btn-primary">
                Post an Ad Now
              </button>
            </div>
          )}
        </section>
      )}

      {}
      {activeTab === "new-ad" && (
        <section className={styles.tabPanel} role="tabpanel" aria-labelledby="tab-new-ad">
          <div className={styles.newAdSection}>
            <div className={styles.newAdHeader}>
              <h2 className={styles.newAdTitle}>Post a New Advertisement</h2>
              <p className={styles.newAdSubtitle}>
                Choose your listing tier and reach thousands of potential clients across Sri Lanka. Your ad goes live instantly after payment.
              </p>
            </div>

            <div className={styles.tierCards}>
              <div className={styles.tierCard}>
                <div className={styles.tierBadgeTop} style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                  🔥 Max Visibility
                </div>
                <h3 className={styles.tierName}>Platinum Ad</h3>
                <div className={styles.tierPrice}>Rs. 5,000</div>
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
                <div className={styles.tierPrice}>Rs. 1,400</div>
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
                  {myAds.length === 0 ? <span style={{ color: "#10b981" }}>Free</span> : "Rs. 700"}
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

      {}
      {activeTab === "recover" && (
        <section className={styles.tabPanel} role="tabpanel" aria-labelledby="tab-recover">
          <div className={styles.recoverSection}>
            <div className={styles.recoverHeader}>
              <h2 className={styles.recoverTitle}>Recover Deleted Ads</h2>
              <p className={styles.recoverSubtitle}>
                Your deleted or expired advertisements are listed below. You can restore them by selecting a new payment tier, or permanently remove them from the system.
              </p>
            </div>

            {deletedAds.length === 0 ? (
              <div className={styles.recoverEmpty}>
                <h3>No Deleted Ads</h3>
                <p>You have no deleted or expired advertisements at this time.</p>
              </div>
            ) : (
              <div className={styles.deletedAdsList}>
                {deletedAds.map((ad) => {
                  const displayDate = new Date(ad.createdAt).toLocaleDateString("en-LK", {
                    year: "numeric", month: "short", day: "numeric",
                  });
                  return (
                    <div key={ad.id} className={styles.deletedAdItem}>
                      <div className={styles.adImageContainer}>
                        {ad.images && ad.images.length > 0 ? (
                          
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
                          <span className={`${styles.statusBadge} ${styles.statusDeleted}`}>
                            Deleted
                          </span>
                          <span className={`${styles.tierBadge} ${styles["tier" + ad.adTier]}`}>
                            {ad.adTier.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className={styles.adActions} style={{ flexDirection: "column", gap: "0.5rem" }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => { setRecoverAdId(ad.id); setRecoverTier("standard"); }}
                          id={`recover-ad-${ad.id}`}
                        >
                          ↺ Recover
                        </button>
                        <button
                          className={`btn btn-sm ${styles.permDeleteBtn}`}
                          onClick={() => setPermDeleteId(ad.id)}
                          id={`perm-delete-${ad.id}`}
                        >
                          🗑 Delete Forever
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {}
      {activeTab === "change-password" && (
        <section className={styles.tabPanel} role="tabpanel" aria-labelledby="tab-change-password">
          <div style={{ maxWidth: "460px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                Change Your Password
              </h2>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                We will send a one-time code to <strong style={{ color: "var(--text-primary)" }}>{userPhone}</strong> to verify it&apos;s you.
              </p>
            </div>

            {}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {(["request", "otp", "newpw"] as CpStep[]).map((s, i) => (
                <div key={s} style={{
                  flex: 1, height: "4px", borderRadius: "2px",
                  background: (cpStep === "request" ? 0 : cpStep === "otp" ? 1 : 2) >= i
                    ? "linear-gradient(90deg,#8b5cf6,#a78bfa)" : "rgba(255,255,255,0.08)",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>

            {}
            {cpError && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: "var(--radius-lg)", padding: "0.65rem 1rem", fontSize: "var(--text-sm)", marginBottom: "1rem", textAlign: "center" }}>
                ⚠️ {cpError}
              </div>
            )}
            {cpSuccess && (
              <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981", borderRadius: "var(--radius-lg)", padding: "0.65rem 1rem", fontSize: "var(--text-sm)", marginBottom: "1rem", textAlign: "center" }}>
                ✓ {cpSuccess}
              </div>
            )}
            {cpDevOtp && cpStep === "otp" && (
              <div style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.12)", borderRadius: "var(--radius-lg)", padding: "0.65rem 1rem", fontSize: "var(--text-sm)", marginBottom: "1rem", textAlign: "center", color: "var(--text-secondary)" }}>
                🔧 <strong>Dev Mode OTP:</strong> {cpDevOtp}
              </div>
            )}

            {}
            {cpStep === "request" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", textAlign: "center", padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)" }}>
                  An OTP will be sent to <strong style={{ color: "var(--text-primary)" }}>{userPhone}</strong>
                </p>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  disabled={cpLoading}
                  id="cp-send-otp-btn"
                  onClick={async () => {
                    setCpError("");
                    setCpLoading(true);
                    try {
                      const res = await fetch("/api/auth/forgot-password", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phoneNumber: userPhone }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        if (data.testOtpCode) setCpDevOtp(data.testOtpCode);
                        setCpStep("otp");
                      } else {
                        setCpError(data.error || "Failed to send OTP.");
                      }
                    } catch { setCpError("Network error. Please try again."); }
                    finally { setCpLoading(false); }
                  }}
                >
                  {cpLoading ? "Sending OTP..." : "Send OTP to My Number"}
                </button>
              </div>
            )}

            {}
            {cpStep === "otp" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", textAlign: "center" }}>
                  Enter the 6-digit code sent to your number
                </p>
                {}
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                  {cpOtp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { cpOtpRefs.current[i] = el; }}
                      id={`cp-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/, "");
                        const updated = [...cpOtp];
                        updated[i] = v.slice(-1);
                        setCpOtp(updated);
                        if (v && i < 5) cpOtpRefs.current[i + 1]?.focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === "Backspace" && !cpOtp[i] && i > 0) cpOtpRefs.current[i - 1]?.focus();
                      }}
                      style={{
                        width: "48px", height: "52px", textAlign: "center",
                        fontSize: "1.25rem", fontWeight: 700,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-lg)",
                        color: "var(--text-primary)",
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                    />
                  ))}
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  disabled={cpLoading}
                  id="cp-verify-otp-btn"
                  onClick={() => {
                    setCpError("");
                    if (cpOtp.join("").length !== 6) { setCpError("Please enter all 6 digits."); return; }
                    setCpStep("newpw");
                  }}
                >
                  Verify OTP
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => { setCpStep("request"); setCpOtp(["","","","","",""]); setCpDevOtp(""); }}
                >
                  ← Resend OTP
                </button>
              </div>
            )}

            {}
            {cpStep === "newpw" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }} htmlFor="cp-new-pw">
                    New Password
                  </label>
                  <input
                    id="cp-new-pw"
                    type="password"
                    placeholder="At least 6 characters"
                    value={cpNewPw}
                    onChange={e => setCpNewPw(e.target.value)}
                    disabled={cpLoading}
                    style={{ width: "100%", padding: "var(--space-sm) var(--space-md)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", color: "var(--text-primary)", fontSize: "var(--text-base)" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }} htmlFor="cp-confirm-pw">
                    Confirm New Password
                  </label>
                  <input
                    id="cp-confirm-pw"
                    type="password"
                    placeholder="Repeat your password"
                    value={cpConfirmPw}
                    onChange={e => setCpConfirmPw(e.target.value)}
                    disabled={cpLoading}
                    style={{ width: "100%", padding: "var(--space-sm) var(--space-md)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", color: "var(--text-primary)", fontSize: "var(--text-base)" }}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  disabled={cpLoading}
                  id="cp-reset-pw-btn"
                  onClick={async () => {
                    setCpError("");
                    if (cpNewPw.length < 6) { setCpError("Password must be at least 6 characters."); return; }
                    if (cpNewPw !== cpConfirmPw) { setCpError("Passwords do not match."); return; }
                    setCpLoading(true);
                    try {
                      const res = await fetch("/api/auth/reset-password", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phoneNumber: userPhone, otp: cpOtp.join(""), newPassword: cpNewPw }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setCpSuccess("Password changed successfully!");
                        setCpStep("request");
                        setCpOtp(["","","","","",""]);
                        setCpNewPw(""); setCpConfirmPw(""); setCpDevOtp("");
                      } else {
                        setCpError(data.error || "Failed to update password.");
                        if (data.error?.toLowerCase().includes("expired")) { setCpStep("request"); }
                      }
                    } catch { setCpError("Network error. Please try again."); }
                    finally { setCpLoading(false); }
                  }}
                >
                  {cpLoading ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {}
      {deleteConfirmId && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirmId(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>🗑</div>
            <h3 className={styles.confirmTitle}>Delete this Ad?</h3>
            <p className={styles.confirmText}>
              This ad will be moved to your <strong>Recover</strong> section. You can restore it later by making a new payment.
            </p>
            <div className={styles.confirmBtns}>
              <button
                className={`btn btn-sm ${styles.deleteBtn}`}
                onClick={() => handleSoftDelete(deleteConfirmId)}
                disabled={!!isDeletingId}
                id="confirm-delete-btn"
              >
                {isDeletingId ? "Deleting..." : "Yes, Delete It"}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {permDeleteId && (
        <div className={styles.modalOverlay} onClick={() => setPermDeleteId(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon} style={{ color: "#ef4444" }}>⚠️</div>
            <h3 className={styles.confirmTitle} style={{ color: "#ef4444" }}>Permanently Delete?</h3>
            <p className={styles.confirmText}>
              This action <strong>cannot be undone</strong>. The ad and all its data will be erased from the system forever.
            </p>
            <div className={styles.confirmBtns}>
              <button
                className={`btn btn-sm ${styles.permDeleteBtn}`}
                onClick={() => handlePermanentDelete(permDeleteId)}
                disabled={isPermDeleting}
                id="confirm-perm-delete-btn"
              >
                {isPermDeleting ? "Deleting..." : "Delete Forever"}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPermDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {recoverAdId && (
        <div className={styles.modalOverlay} onClick={() => setRecoverAdId(null)}>
          <div className={styles.recoverModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.recoverModalTitle}>Restore Your Ad</h3>
            <p className={styles.recoverModalSubtitle}>
              Select a visibility tier to bring this ad back live. Payment will be required.
            </p>

            <div className={styles.recoverTierGrid}>
              {(["platinum", "premium", "standard"] as RecoverTier[]).map((tier) => (
                <div
                  key={tier}
                  className={`${styles.recoverTierCard} ${recoverTier === tier ? styles.recoverTierActive : ""}`}
                  onClick={() => setRecoverTier(tier)}
                >
                  <div className={styles.recoverTierName}>{TIER_DETAILS[tier].displayName}</div>
                  <div className={styles.recoverTierPrice} style={{ color: TIER_DETAILS[tier].color }}>
                    {TIER_DETAILS[tier].price}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.recoverModalNote}>
              Selected: <strong>{TIER_DETAILS[recoverTier].displayName}</strong> — {TIER_DETAILS[recoverTier].price}
            </div>

            <div className={styles.confirmBtns}>
              <button
                className="btn btn-primary"
                onClick={handleRecover}
                disabled={isRecovering}
                id="confirm-recover-btn"
              >
                {isRecovering ? "Restoring..." : `✓ Restore — ${TIER_DETAILS[recoverTier].price}`}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setRecoverAdId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
