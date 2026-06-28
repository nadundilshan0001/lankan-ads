"use client";

// ============================================================
// Lankan Ads — Admin Storage Health Dashboard (Client Component)
// ============================================================

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";

interface CloudinaryStats {
  storage?: {
    usageBytes: number;
    limitBytes: number;
    usedPercent: number;
  };
  bandwidth?: {
    usageBytes: number;
    limitBytes: number;
    usedPercent: number;
  };
  requests?: number;
  resources?: number;
  transformations?: {
    usage: number;
    limit: number;
  };
  plan?: string;
  lastUpdated?: string;
  error?: string;
}

interface SupabaseStats {
  tables: {
    users: number;
    ads: number;
    ad_images: number;
    payments: number;
    audit_logs: number;
  };
  adsBreakdown: Record<string, number>;
}

export default function AdminStoragePage() {
  const [cloudinary, setCloudinary] = useState<CloudinaryStats | null>(null);
  const [supabase, setSupabase] = useState<SupabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStorageStats = async () => {
      try {
        const res = await fetch("/api/admin/storage");
        const data = await res.json();
        if (res.ok && data.success) {
          setCloudinary(data.cloudinary);
          setSupabase(data.supabase);
        } else {
          setError(data.error || "Failed to load storage metrics.");
        }
      } catch {
        setError("Failed to communicate with storage API.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorageStats();
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p>Polling storage metrics and capacity checks...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>System Storage & Capacity</h1>
        <p className={styles.subtitle}>Monitor Supabase database table volumes and Cloudinary asset limits.</p>
      </header>

      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.grid}>
        {/* Cloudinary Stats */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Cloudinary Asset CDN</h2>
            <span className={`${styles.statusLabel} ${cloudinary?.error ? styles.statusWarning : styles.statusSuccess}`}>
              {cloudinary?.error ? "Error" : `Plan: ${cloudinary?.plan || "Free"}`}
            </span>
          </div>

          {cloudinary?.error ? (
            <div className={styles.cardError}>{cloudinary.error}</div>
          ) : (
            <div className={styles.cardBody}>
              {/* Storage usage bar */}
              <div className={styles.metricGroup}>
                <div className={styles.metricLabelRow}>
                  <span>Storage Used</span>
                  <span>
                    {formatBytes(cloudinary?.storage?.usageBytes || 0)} / {formatBytes(cloudinary?.storage?.limitBytes || 0)}
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${cloudinary?.storage?.usedPercent || 0}%` }}
                  ></div>
                </div>
                <span className={styles.metricSubText}>{cloudinary?.storage?.usedPercent || 0}% space consumed</span>
              </div>

              {/* Bandwidth usage bar */}
              <div className={styles.metricGroup}>
                <div className={styles.metricLabelRow}>
                  <span>Bandwidth Used (Rolling 30 Days)</span>
                  <span>
                    {formatBytes(cloudinary?.bandwidth?.usageBytes || 0)} / {formatBytes(cloudinary?.bandwidth?.limitBytes || 0)}
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFillBlue}
                    style={{ width: `${cloudinary?.bandwidth?.usedPercent || 0}%` }}
                  ></div>
                </div>
                <span className={styles.metricSubText}>{cloudinary?.bandwidth?.usedPercent || 0}% monthly limit consumed</span>
              </div>

              {/* Other details */}
              <div className={styles.detailedGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Hosted Resources</span>
                  <span className={styles.detailValue}>{cloudinary?.resources?.toLocaleString() || 0} files</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Requests (30d)</span>
                  <span className={styles.detailValue}>{cloudinary?.requests?.toLocaleString() || 0} hits</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Transformations</span>
                  <span className={styles.detailValue}>
                    {cloudinary?.transformations?.usage.toLocaleString() || 0} / {cloudinary?.transformations?.limit.toLocaleString() || 0}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Last Updated</span>
                  <span className={styles.detailValue}>
                    {cloudinary?.lastUpdated ? new Date(cloudinary.lastUpdated).toLocaleTimeString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Supabase Database Stats */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Supabase Database</h2>
            <span className={`${styles.statusLabel} ${styles.statusSuccess}`}>Connected</span>
          </div>

          <div className={styles.cardBody}>
            {/* Row Counts */}
            <h3 className={styles.subTitle}>Database Table Volumes</h3>
            <div className={styles.tableList}>
              <div className={styles.tableItem}>
                <span className={styles.tableName}>Users Table (`users`)</span>
                <span className={styles.tableCount}>{supabase?.tables.users.toLocaleString() || 0} records</span>
              </div>
              <div className={styles.tableItem}>
                <span className={styles.tableName}>Listings Table (`ads`)</span>
                <span className={styles.tableCount}>{supabase?.tables.ads.toLocaleString() || 0} records</span>
              </div>
              <div className={styles.tableItem}>
                <span className={styles.tableName}>Ad Images Table (`ad_images`)</span>
                <span className={styles.tableCount}>{supabase?.tables.ad_images.toLocaleString() || 0} records</span>
              </div>
              <div className={styles.tableItem}>
                <span className={styles.tableName}>Payments Table (`payments`)</span>
                <span className={styles.tableCount}>{supabase?.tables.payments.toLocaleString() || 0} records</span>
              </div>
              <div className={styles.tableItem}>
                <span className={styles.tableName}>Audit Logs Table (`audit_logs`)</span>
                <span className={styles.tableCount}>{supabase?.tables.audit_logs.toLocaleString() || 0} records</span>
              </div>
            </div>

            {/* Ads breakdown */}
            <h3 className={styles.subTitle} style={{ marginTop: "24px" }}>Listing Status Distribution</h3>
            <div className={styles.breakdownGrid}>
              {supabase?.adsBreakdown &&
                Object.entries(supabase.adsBreakdown).map(([status, count]) => (
                  <div key={status} className={styles.breakdownItem}>
                    <span className={styles.breakdownName}>{status.toUpperCase()}</span>
                    <span className={styles.breakdownValue}>{count.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
