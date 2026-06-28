"use client";

// ============================================================
// Lankan Ads — Admin Payments & Revenue (Client Component)
// ============================================================

import React, { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";

import { DownloadIcon } from "@/components/AdminIcons";

interface PaymentItem {
  id: string;
  payhereOrderId: string;
  adTitle: string;
  adCategory: string;
  adTier: string;
  userPhone: string;
  amountLkr: number;
  status: "completed" | "pending" | "failed";
  paidAt?: string;
  createdAt: string;
}

interface RevenueStats {
  today: number;
  last7Days: number;
  thisMonth: number;
  allTime: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [revenue, setRevenue] = useState<RevenueStats>({
    today: 0,
    last7Days: 0,
    thisMonth: 0,
    allTime: 0,
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        status,
        from: fromDate ? new Date(fromDate).toISOString() : "",
        to: toDate ? new Date(toDate).toISOString() : "",
      });

      const res = await fetch(`/api/admin/payments?${params}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPayments(data.payments);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setRevenue(data.revenueStats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, status, fromDate, toDate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleExportCSV = () => {
    if (payments.length === 0) return;
    
    const headers = ["Payment ID", "PayHere Order ID", "Ad Title", "Category", "Tier", "User Phone", "Amount LKR", "Status", "Created At"];
    const rows = payments.map((p) => [
      p.id,
      p.payhereOrderId,
      `"${p.adTitle.replace(/"/g, '""')}"`,
      p.adCategory,
      p.adTier,
      p.userPhone,
      p.amountLkr,
      p.status,
      p.createdAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lankanads_payments_export_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Payment History & Finance</h1>
          <p className={styles.subtitle}>Track incoming transactions, review payment status, and export tax summaries.</p>
        </div>
        <button onClick={handleExportCSV} className={styles.exportBtn} disabled={payments.length === 0}>
          <DownloadIcon size={16} style={{ marginRight: "6px", display: "inline-block", verticalAlign: "middle" }} />
          <span style={{ verticalAlign: "middle" }}>Export CSV Summary</span>
        </button>
      </header>

      {/* Revenue aggregated statistics cards */}
      <section className={styles.revenueGrid}>
        <div className={styles.revCard}>
          <span className={styles.revLabel}>Revenue Today</span>
          <span className={styles.revValue}>Rs. {revenue.today.toLocaleString()}</span>
        </div>
        <div className={styles.revCard}>
          <span className={styles.revLabel}>Revenue (Last 7 Days)</span>
          <span className={styles.revValue}>Rs. {revenue.last7Days.toLocaleString()}</span>
        </div>
        <div className={styles.revCard}>
          <span className={styles.revLabel}>Revenue (This Month)</span>
          <span className={styles.revValue}>Rs. {revenue.thisMonth.toLocaleString()}</span>
        </div>
        <div className={styles.revCard}>
          <span className={styles.revLabel}>Total Revenue (All Time)</span>
          <span className={styles.revValue}>Rs. {revenue.allTime.toLocaleString()}</span>
        </div>
      </section>

      {/* Date & status filters */}
      <section className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Payment Status</label>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={styles.select}>
            <option value="">All Statuses</option>
            <option value="completed">Completed Payments</option>
            <option value="pending">Pending Checkout</option>
            <option value="failed">Failed Transactions</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>From Date</label>
          <input
            type="date"
            className={styles.dateInput}
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>To Date</label>
          <input
            type="date"
            className={styles.dateInput}
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
          />
        </div>
      </section>

      {/* Table */}
      {isLoading ? (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Analyzing transactions...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className={styles.empty}>
          <p>No transactions match your search filter.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PayHere Order ID</th>
                <th>Listing Title</th>
                <th>Tier</th>
                <th>Advertiser Phone</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className={styles.orderId}>{p.payhereOrderId}</td>
                  <td>
                    <div className={styles.titleCell}>
                      <span className={styles.adTitle}>{p.adTitle}</span>
                      <span className={styles.categoryLabel}>{p.adCategory}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.tierBadge} ${styles["tier_" + p.adTier]}`}>
                      {p.adTier.toUpperCase()}
                    </span>
                  </td>
                  <td>{p.userPhone}</td>
                  <td className={styles.amount}>Rs. {p.amountLkr.toLocaleString()}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles["status_" + p.status]}`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(p.createdAt).toLocaleDateString("en-LK")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
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
