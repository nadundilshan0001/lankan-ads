"use client";





import React, { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";

interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  ipAddress: string | null;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
        search,
        action,
        targetType,
      });

      const res = await fetch(`/api/admin/audit?${params}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.logs);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, action, targetType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>System Audit Log</h1>
          <p className={styles.subtitle}>Trace administrative actions, authorization logs, and audit logs.</p>
        </div>
        <div className={styles.counterBox}>
          <span className={styles.counterVal}>{total}</span>
          <span className={styles.counterLabel}>Total Events</span>
        </div>
      </header>

      {}
      <section className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by admin email, target ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />

        <div className={styles.selectGrid}>
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className={styles.select}
          >
            <option value="">All Actions</option>
            <option value="admin_login">Admin Login</option>
            <option value="ad_approve">Ad Approval</option>
            <option value="ad_deactivate">Ad Deactivation</option>
            <option value="ad_delete">Ad Deletion</option>
            <option value="user_activate">User Activation</option>
            <option value="user_deactivate">User Deactivation</option>
            <option value="user_delete">User Deletion</option>
            <option value="create_admin">Provision Admin</option>
            <option value="delete_admin">Revoke Admin</option>
          </select>

          <select
            value={targetType}
            onChange={(e) => { setTargetType(e.target.value); setPage(1); }}
            className={styles.select}
          >
            <option value="">All Targets</option>
            <option value="system">System</option>
            <option value="ad">Ads</option>
            <option value="user">Users</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </section>

      {}
      {isLoading ? (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Decrypting event stream...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className={styles.empty}>
          <p>No logged events match the filter query.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Administrator</th>
                <th>Action Code</th>
                <th>Target Scope</th>
                <th>Target ID</th>
                <th>Network IP</th>
                <th>Payload Meta</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className={styles.time}>{new Date(log.createdAt).toLocaleString("en-LK")}</td>
                  <td className={styles.email}>{log.adminEmail}</td>
                  <td>
                    <span className={`${styles.actionBadge} ${styles["act_" + log.action] || styles.act_generic}`}>
                      {log.action.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.targetBadge} ${styles["tgt_" + log.targetType]}`}>
                      {log.targetType.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={styles.targetId} title={log.targetId}>{log.targetId.substring(0, 18)}...</span>
                  </td>
                  <td className={styles.ip}>{log.ipAddress || "unknown"}</td>
                  <td>
                    <code className={styles.payload}>
                      {JSON.stringify(log.details) !== "{}" ? JSON.stringify(log.details) : "none"}
                    </code>
                  </td>
                </tr>
              ))}
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
