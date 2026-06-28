"use client";

// ============================================================
// Lankan Ads — Admin Users Management (Client Component)
// ============================================================

import React, { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";

interface UserItem {
  id: string;
  phoneNumber: string;
  isVerified: boolean;
  isActive: boolean;
  languagePreference: "en" | "si";
  createdAt: string;
  adCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [verified, setVerified] = useState("");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        search,
        status,
        verified,
      });

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, verified]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAction = async (userId: string, action: "activate" | "deactivate" | "delete") => {
    if (action === "delete" && !confirm("Are you sure you want to permanently delete this user? This will also delete all their listings. This action is irreversible.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (action === "delete") {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          setTotal((prev) => prev - 1);
        } else {
          setUsers((prev) =>
            prev.map((u) => {
              if (u.id === userId) {
                return {
                  ...u,
                  isActive: action === "activate",
                };
              }
              return u;
            })
          );
        }
      } else {
        alert(data.error || "Operation failed.");
      }
    } catch {
      alert("Network error.");
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
          <h1 className={styles.title}>Advertiser Account Management</h1>
          <p className={styles.subtitle}>Review user accounts, enable/disable status, or completely delete profiles.</p>
        </div>
        <div className={styles.counterBox}>
          <span className={styles.counterVal}>{total}</span>
          <span className={styles.counterLabel}>Total Advertisers</span>
        </div>
      </header>

      {/* Filter Bar */}
      <section className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by phone number..."
          value={search}
          onChange={handleSearchChange}
        />

        <div className={styles.selectGrid}>
          <select value={status} onChange={handleFilterChange(setStatus)} className={styles.select}>
            <option value="">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="inactive">Suspended Accounts</option>
          </select>

          <select value={verified} onChange={handleFilterChange(setVerified)} className={styles.select}>
            <option value="">All Verification States</option>
            <option value="true">SMS OTP Verified</option>
            <option value="false">OTP Verification Pending</option>
          </select>
        </div>
      </section>

      {/* Table */}
      {isLoading ? (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Fetching advertiser database...</p>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.empty}>
          <p>No user accounts matched your search criteria.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User UUID</th>
                <th>Phone Number</th>
                <th>OTP Verified</th>
                <th>Status</th>
                <th>Total Ads</th>
                <th>Pref. Lang</th>
                <th>Registered Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className={styles.userId}>{user.id}</span>
                  </td>
                  <td className={styles.phoneCell}>{user.phoneNumber}</td>
                  <td>
                    {user.isVerified ? (
                      <span className={styles.statusVerified}>Yes</span>
                    ) : (
                      <span className={styles.statusUnverified}>Pending</span>
                    )}
                  </td>
                  <td>
                    {user.isActive ? (
                      <span className={`${styles.statusBadge} ${styles.status_active}`}>ACTIVE</span>
                    ) : (
                      <span className={`${styles.statusBadge} ${styles.status_inactive}`}>SUSPENDED</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{user.adCount} listings</td>
                  <td style={{ textTransform: "uppercase" }}>{user.languagePreference}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString("en-LK")}</td>
                  <td>
                    <div className={styles.actions}>
                      {user.isActive ? (
                        <button
                          onClick={() => handleAction(user.id, "deactivate")}
                          className={styles.deactivateBtn}
                          title="Deactivate account"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(user.id, "activate")}
                          className={styles.activateBtn}
                          title="Activate account"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(user.id, "delete")}
                        className={styles.deleteBtn}
                        title="Delete user account"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
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
