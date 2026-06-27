"use client";

// ============================================================
// Lankan Ads — Admin Dashboard (Client Component)
// ============================================================

import React, { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import styles from "./page.module.css";

// We'll initialize dashboard with some dummy pending ads and users
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

interface MockUser {
  id: string;
  phoneNumber: string;
  isVerified: boolean;
  status: "active" | "banned";
  createdAt: string;
}

function getAdminRoleFromToken(token: string | null): boolean {
  if (!token) return false;
  try {
    const payloadPart = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadPart));
    return decodedPayload.role === "admin";
  } catch {
    return false;
  }
}

export default function AdminDashboard() {
  // Database states
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pendingAdsCount: 0,
    activeAdsCount: 0,
    revenueToday: "Rs. 0",
    totalUsersCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const fetchAdminData = async (token: string) => {
    try {
      const res = await fetch("/api/admin", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setPendingAds(data.pendingAds);
        setUsers(data.users);
        setStats(data.stats);
      } else {
        setAccessDenied(true);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      setAccessDenied(true);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem("lankan_ads_token");
    if (!getAdminRoleFromToken(token)) {
      setIsLoading(false);
      setAccessDenied(true);
      return;
    }
    fetchAdminData(token!);
  }, []);

  const handleApproveAd = async (adId: string) => {
    try {
      const token = localStorage.getItem("lankan_ads_token");
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action: "approve_ad", adId }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingAds(pendingAds.filter((ad) => ad.id !== adId));
        setStats((prev) => ({
          ...prev,
          pendingAdsCount: prev.pendingAdsCount - 1,
          activeAdsCount: prev.activeAdsCount + 1,
        }));
      } else {
        alert("Failed to approve ad: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectAd = async (adId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;
    
    try {
      const token = localStorage.getItem("lankan_ads_token");
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action: "reject_ad", adId }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingAds(pendingAds.filter((ad) => ad.id !== adId));
        setStats((prev) => ({
          ...prev,
          pendingAdsCount: prev.pendingAdsCount - 1,
        }));
      } else {
        alert("Failed to reject ad: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const token = localStorage.getItem("lankan_ads_token");
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action: "toggle_user_status", userId }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(
          users.map((user) => {
            if (user.id === userId) {
              const newStatus = user.status === "active" ? "pending" : "active";
              return { ...user, status: newStatus, isVerified: !user.isVerified };
            }
            return user;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container} style={{ textAlign: "center", padding: "100px" }}>
        <h2 style={{ color: "var(--text-primary)" }}>Loading Admin Dashboard...</h2>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className={styles.container} style={{ textAlign: "center", padding: "120px 20px" }}>
        <div style={{
          maxWidth: "500px",
          margin: "0 auto",
          padding: "40px",
          background: "rgba(239, 68, 68, 0.05)",
          border: "1px solid rgba(239, 68, 68, 0.15)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
        }}>
          <h1 style={{ color: "#ef4444", fontSize: "28px", marginBottom: "16px", fontWeight: "700" }}>Access Denied</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: "1.6", marginBottom: "28px" }}>
            This section is restricted to administrators only. Please sign in with an authorized administrator account to access the control panel.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link href="/login" className="btn btn-primary">
              Sign In as Admin
            </Link>
            <Link href="/" className="btn btn-secondary">
              Back to Main Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1 className={styles.title}>Lankan Ads Admin Dashboard</h1>
          <span className={styles.adminBadge}>Control Panel</span>
        </div>
        <Link href="/" className="btn btn-secondary btn-sm">
          Back to Main Site
        </Link>
      </header>

      {/* Stats Cards */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending Moderation</span>
          <span className={styles.statValue}>{pendingAds.length}</span>
          <span className={styles.statChange} style={{ color: "#ef4444" }}>
            Requires Action
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Ads Live</span>
          <span className={styles.statValue}>{stats.activeAdsCount}</span>
          <span className={styles.statChange}>+12 today</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Revenue (Today)</span>
          <span className={styles.statValue}>{stats.revenueToday}</span>
          <span className={styles.statChange}>24% from yesterday</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Advertisers</span>
          <span className={styles.statValue}>{stats.totalUsersCount}</span>
          <span className={styles.statChange}>+5 new accounts</span>
        </div>
      </section>

      <div className={styles.sectionsContainer}>
        {/* Ad Moderation Queue */}
        <section className={styles.section} id="moderation-queue">
          <h2 className={styles.sectionTitle}>
            <span>Moderation Queue</span>
            <span className="badge badge-standard">{pendingAds.length} Pending</span>
          </h2>

          {pendingAds.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              All ads are moderated. The queue is empty. Good job!
            </p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Ad details</th>
                    <th className={styles.th}>Category</th>
                    <th className={styles.th}>Location</th>
                    <th className={styles.th}>Contact</th>
                    <th className={styles.th}>Tier</th>
                    <th className={styles.th}>Submitted</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAds.map((ad, idx) => {
                    const categoryObj = CATEGORIES.find((c) => c.id === ad.category);
                    return (
                      <tr
                        key={ad.id}
                        className={`${styles.tr} ${
                          idx === pendingAds.length - 1 ? styles.trLast : ""
                        }`}
                      >
                        <td className={styles.td}>
                          <div className={styles.adInfoCell}>
                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{ad.titleEn}</span>
                            <span className={styles.adDetailsMeta}>ID: {ad.id}</span>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <span className="badge badge-category">{categoryObj?.name || ad.category}</span>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.adInfoCell}>
                            <span>{ad.city}</span>
                            <span className={styles.adDetailsMeta}>{ad.district}</span>
                          </div>
                        </td>
                        <td className={styles.td}>{ad.contactNumber}</td>
                        <td className={styles.td}>
                          <span className={`badge badge-${ad.adTier}`}>
                            {ad.adTier.toUpperCase()}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {new Date(ad.createdAt).toLocaleTimeString("en-LK", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className={styles.td}>
                          <div className={styles.actionBtns}>
                            <button
                              onClick={() => handleApproveAd(ad.id)}
                              className={styles.approveBtn}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectAd(ad.id)}
                              className={styles.rejectBtn}
                            >
                              Reject
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

        {/* User Account Moderation */}
        <section className={styles.section} id="user-accounts">
          <h2 className={styles.sectionTitle}>User Account Management</h2>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>User ID</th>
                  <th className={styles.th}>Phone Number</th>
                  <th className={styles.th}>SMS OTP Status</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Registered</th>
                  <th className={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`${styles.tr} ${
                      idx === users.length - 1 ? styles.trLast : ""
                    }`}
                  >
                    <td className={styles.td}>{user.id}</td>
                    <td className={styles.td} style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.phoneNumber}</td>
                    <td className={styles.td}>
                      {user.isVerified ? (
                        <span style={{ color: "#10b981" }}>Verified</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>Pending</span>
                      )}
                    </td>
                    <td className={styles.td}>
                      <span className={`badge badge-${user.status === "active" ? "standard" : "premium"}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className={styles.td}>{user.createdAt}</td>
                    <td className={styles.td}>
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={styles.banBtn}
                        style={
                          user.status === "active"
                            ? { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }
                            : { background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.2)" }
                        }
                      >
                        {user.status === "active" ? "Ban Account" : "Unban Account"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
