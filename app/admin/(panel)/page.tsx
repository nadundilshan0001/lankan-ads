"use client";





import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import styles from "./page.module.css";
import {
  InboxIcon,
  SparklesIcon,
  CoinsIcon,
  UsersIcon,
  PhoneIcon,
  AdminUsersIcon,
  AuditLogsIcon,
  StorageIcon,
} from "@/components/AdminIcons";

interface StatInfo {
  pendingAdsCount: number;
  activeAdsCount: number;
  revenueToday: string;
  totalUsersCount: number;
}

interface PendingAd {
  id: string;
  category: string;
  titleEn: string;
  contactNumber: string;
  district: string;
  city: string;
  adTier: "standard" | "premium" | "platinum";
  createdAt: string;
}

interface RecentUser {
  id: string;
  phoneNumber: string;
  isVerified: boolean;
  status: string;
  createdAt: string;
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<StatInfo>({
    pendingAdsCount: 0,
    activeAdsCount: 0,
    revenueToday: "Rs. 0",
    totalUsersCount: 0,
  });
  const [pendingAds, setPendingAds] = useState<PendingAd[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
        setPendingAds(data.pendingAds);
        setRecentUsers(data.users.slice(0, 5)); 
      } else {
        setError(data.error || "Failed to fetch dashboard data.");
      }
    } catch {
      setError("Failed to communicate with server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleModeration = async (adId: string, action: "approve" | "deactivate") => {
    setActionLoadingId(adId);
    try {
      const res = await fetch(`/api/admin/ads/${adId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingAds((prev) => prev.filter((ad) => ad.id !== adId));
        setStats((prev) => ({
          ...prev,
          pendingAdsCount: prev.pendingAdsCount - 1,
          activeAdsCount: action === "approve" ? prev.activeAdsCount + 1 : prev.activeAdsCount,
        }));
      } else {
        alert(data.error || "Operation failed.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading overview diagnostics...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {error && <div className={styles.errorBanner}>{error}</div>}

      {}
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Pending Moderation</span>
            <span className={styles.kpiValue}>{stats.pendingAdsCount}</span>
          </div>
          <div className={`${styles.kpiIcon} ${styles.kpiIconRed}`}><InboxIcon size={20} /></div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Active Listings Live</span>
            <span className={styles.kpiValue}>{stats.activeAdsCount}</span>
          </div>
          <div className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}><SparklesIcon size={20} /></div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Revenue (Today)</span>
            <span className={styles.kpiValue}>{stats.revenueToday}</span>
          </div>
          <div className={`${styles.kpiIcon} ${styles.kpiIconYellow}`}><CoinsIcon size={20} /></div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiLabel}>Total Registered Users</span>
            <span className={styles.kpiValue}>{stats.totalUsersCount}</span>
          </div>
          <div className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}><UsersIcon size={20} /></div>
        </div>
      </section>

      {}
      <div className={styles.sectionsSplit}>
        {}
        <section className={styles.sectionMain}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Ad Moderation Queue</h2>
            <Link href="/admin/ads?status=pending" className={styles.viewAllLink}>
              View All Queue →
            </Link>
          </div>

          {pendingAds.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>The moderation queue is completely empty. Great work!</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title & Details</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Tier</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAds.map((ad) => {
                    const categoryObj = CATEGORIES.find((c) => c.id === ad.category);
                    return (
                      <tr key={ad.id}>
                        <td>
                          <div className={styles.detailsCell}>
                            <span className={styles.adTitle}>{ad.titleEn}</span>
                            <span className={styles.adMeta}>ID: {ad.id} • Contact: {ad.contactNumber}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.categoryBadge}>{categoryObj?.name || ad.category}</span>
                        </td>
                        <td>
                          <div className={styles.locationCell}>
                            <span>{ad.city}</span>
                            <span className={styles.adMeta}>{ad.district}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.tierBadge} ${styles["tier_" + ad.adTier]}`}>
                            {ad.adTier.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button
                              onClick={() => handleModeration(ad.id, "approve")}
                              className={styles.approveBtn}
                              disabled={actionLoadingId !== null}
                            >
                              {actionLoadingId === ad.id ? (
                                <div className={styles.spinnerMiniInline}></div>
                              ) : (
                                "Approve"
                              )}
                            </button>
                            <button
                              onClick={() => handleModeration(ad.id, "deactivate")}
                              className={styles.rejectBtn}
                              disabled={actionLoadingId !== null}
                            >
                              {actionLoadingId === ad.id ? (
                                <div className={styles.spinnerMiniInline}></div>
                              ) : (
                                "Reject"
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {}
        <div className={styles.sidebarWidgets}>
          {}
          <section className={styles.sectionSide}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Users</h2>
              <Link href="/admin/users" className={styles.viewAllLink}>
                Manage Users
              </Link>
            </div>

            <div className={styles.usersList}>
              {recentUsers.map((user) => (
                <div key={user.id} className={styles.userItem}>
                  <div className={styles.userAvatar}><PhoneIcon size={16} /></div>
                  <div className={styles.userInfo}>
                    <span className={styles.userPhone}>{user.phoneNumber}</span>
                    <span className={styles.userDate}>Reg: {user.createdAt}</span>
                  </div>
                  <span className={`${styles.userStatus} ${user.isVerified ? styles.verified : styles.unverified}`}>
                    {user.isVerified ? "Verified" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {}
          <section className={styles.sectionSide}>
            <h2 className={styles.sectionTitle}>Emergency Controls</h2>
            <div className={styles.quickOpsGrid}>
              <Link href="/admin/admins" className={styles.opBtn}>
                <AdminUsersIcon size={16} style={{ marginRight: "6px", display: "inline-block", verticalAlign: "middle" }} />
                <span style={{ verticalAlign: "middle" }}>Manage Admins</span>
              </Link>
              <Link href="/admin/audit" className={styles.opBtn}>
                <AuditLogsIcon size={16} style={{ marginRight: "6px", display: "inline-block", verticalAlign: "middle" }} />
                <span style={{ verticalAlign: "middle" }}>Audit Logs</span>
              </Link>
              <Link href="/admin/storage" className={styles.opBtn}>
                <StorageIcon size={16} style={{ marginRight: "6px", display: "inline-block", verticalAlign: "middle" }} />
                <span style={{ verticalAlign: "middle" }}>Storage Levels</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
