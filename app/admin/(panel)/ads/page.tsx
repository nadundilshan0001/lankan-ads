"use client";





import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CATEGORIES, DISTRICTS } from "@/lib/constants";
import styles from "./page.module.css";

interface AdItem {
  id: string;
  category: string;
  titleEn: string;
  contactNumber: string;
  district: string;
  city: string;
  adTier: "standard" | "premium" | "platinum";
  status: "draft" | "pending" | "active" | "expired" | "deleted";
  createdAt: string;
  viewCount: number;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [tier, setTier] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        search,
        status,
        category,
        district,
        tier,
      });

      const res = await fetch(`/api/admin/ads?${params}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setAds(data.ads);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, category, district, tier]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleAction = async (adId: string, action: "approve" | "deactivate" | "delete") => {
    if (action === "delete" && !confirm("Are you sure you want to permanently delete this ad? This action is irreversible.")) {
      return;
    }

    setActionLoadingId(adId);
    try {
      const res = await fetch(`/api/admin/ads/${adId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        
        if (action === "delete") {
          setAds((prev) => prev.filter((a) => a.id !== adId));
          setTotal((prev) => prev - 1);
        } else {
          setAds((prev) =>
            prev.map((a) => {
              if (a.id === adId) {
                return {
                  ...a,
                  status: action === "approve" ? "active" : "draft",
                };
              }
              return a;
            })
          );
        }
      } else {
        alert(data.error || "Operation failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateViews = async (adId: string, currentViews: number) => {
    const newValStr = prompt(`Enter new view count for this ad (current: ${currentViews}):`, currentViews.toString());
    if (newValStr === null) return;
    
    const views = parseInt(newValStr, 10);
    if (isNaN(views) || views < 0) {
      alert("Please enter a valid non-negative number.");
      return;
    }

    setActionLoadingId(adId);
    try {
      const res = await fetch(`/api/admin/ads/${adId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_views", views }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAds((prev) =>
          prev.map((a) => (a.id === adId ? { ...a, viewCount: views } : a))
        );
      } else {
        alert(data.error || "Failed to update view count.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); 
  };

  const handleFilterChange = (setter: (val: string) => void) => (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setter(e.target.value);
    setPage(1); 
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Listings Moderation</h1>
          <p className={styles.subtitle}>Moderate, deactivate, delete and filter all ads listed on LankanAds.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/post-ad" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
            <span>➕</span> Post Ad (Free)
          </Link>
          <div className={styles.counterBox}>
            <span className={styles.counterVal}>{total}</span>
            <span className={styles.counterLabel}>Total Ads</span>
          </div>
        </div>
      </header>

      {}
      <section className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by title, contact number, ID..."
          value={search}
          onChange={handleSearchChange}
        />

        <div className={styles.selectGrid}>
          <select value={status} onChange={handleFilterChange(setStatus)} className={styles.select}>
            <option value="">All Statuses</option>
            <option value="pending">Pending Moderation</option>
            <option value="active">Active (Live)</option>
            <option value="draft">Draft (Paused/Rejected)</option>
            <option value="expired">Expired</option>
          </select>

          <select value={category} onChange={handleFilterChange(setCategory)} className={styles.select}>
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select value={district} onChange={handleFilterChange(setDistrict)} className={styles.select}>
            <option value="">All Districts</option>
            {DISTRICTS.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>

          <select value={tier} onChange={handleFilterChange(setTier)} className={styles.select}>
            <option value="">All Tiers</option>
            <option value="platinum">Platinum</option>
            <option value="premium">Premium</option>
            <option value="standard">Standard</option>
          </select>
        </div>
      </section>

      {}
      {isLoading ? (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Fetching listings...</p>
        </div>
      ) : ads.length === 0 ? (
        <div className={styles.empty}>
          <p>No listings matched your criteria.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ad Title & ID</th>
                <th>Category</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Views</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => {
                const categoryObj = CATEGORIES.find((c) => c.id === ad.category);
                return (
                  <tr key={ad.id}>
                    <td>
                      <div className={styles.titleCell}>
                        <span className={styles.adTitle}>{ad.titleEn}</span>
                        <span className={styles.adId}>ID: {ad.id}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.categoryBadge}>{categoryObj?.name || ad.category}</span>
                    </td>
                    <td>
                      <div className={styles.locationCell}>
                        <span>{ad.city}</span>
                        <span className={styles.adId}>{ad.district}</span>
                      </div>
                    </td>
                    <td>{ad.contactNumber}</td>
                    <td>
                      <span className={`${styles.tierBadge} ${styles["tier_" + ad.adTier]}`}>
                        {ad.adTier.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles["status_" + ad.status]}`}>
                        {ad.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className={styles.viewsCell}>
                        <span>{ad.viewCount}</span>
                        <button
                          onClick={() => handleUpdateViews(ad.id, ad.viewCount)}
                          className={styles.editViewsBtn}
                          title="Edit View Count"
                          disabled={actionLoadingId !== null}
                        >
                          {actionLoadingId === ad.id ? (
                            <div className={styles.spinnerMiniInline}></div>
                          ) : (
                            "Edit"
                          )}
                        </button>
                      </div>
                    </td>
                    <td>{new Date(ad.createdAt).toLocaleDateString("en-LK")}</td>
                    <td>
                      <div className={styles.actions}>
                        {ad.status === "pending" && (
                          <button
                            onClick={() => handleAction(ad.id, "approve")}
                            className={styles.approveBtn}
                            title="Approve Listing"
                            disabled={actionLoadingId !== null}
                          >
                            {actionLoadingId === ad.id ? (
                              <div className={styles.spinnerMiniInline}></div>
                            ) : (
                              "Approve"
                            )}
                          </button>
                        )}
                        {ad.status === "active" && (
                          <button
                            onClick={() => handleAction(ad.id, "deactivate")}
                            className={styles.deactivateBtn}
                            title="Pause/Deactivate Listing"
                            disabled={actionLoadingId !== null}
                          >
                            {actionLoadingId === ad.id ? (
                              <div className={styles.spinnerMiniInline}></div>
                            ) : (
                              "Pause"
                            )}
                          </button>
                        )}
                        {ad.status === "draft" && (
                          <button
                            onClick={() => handleAction(ad.id, "approve")}
                            className={styles.approveBtn}
                            title="Activate Listing"
                            disabled={actionLoadingId !== null}
                          >
                            {actionLoadingId === ad.id ? (
                              <div className={styles.spinnerMiniInline}></div>
                            ) : (
                              "Activate"
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(ad.id, "delete")}
                          className={styles.deleteBtn}
                          title="Delete Listing Permanently"
                          disabled={actionLoadingId !== null}
                        >
                          {actionLoadingId === ad.id ? (
                            <div className={styles.spinnerMiniInline}></div>
                          ) : (
                            "Delete"
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

      {}
      {totalPages > 1 && (
        <footer className={styles.pagination}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={styles.pageBtn}
          >
            ← Previous
          </button>
          <span className={styles.pageLabel}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={styles.pageBtn}
          >
            Next →
          </button>
        </footer>
      )}
    </div>
  );
}
