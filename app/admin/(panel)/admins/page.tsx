"use client";





import React, { useEffect, useState } from "react";
import styles from "./page.module.css";

interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
  lastLogin: string | null;
}

export default function AdminUsersManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangeLoading, setIsChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState("");
  const [changeSuccess, setChangeSuccess] = useState("");

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (res.ok && data.success) {
        setAdmins(data.admins);
      } else {
        setError(data.error || "Failed to load administrators.");
      }
    } catch {
      setError("Failed to fetch admin accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitLoading(true);

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Administrator account ${email} created successfully.`);
        setEmail("");
        setPassword("");
        fetchAdmins(); 
      } else {
        setError(data.error || "Failed to create administrator account.");
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete administrator account ${adminEmail}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/admins/${adminId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Administrator ${adminEmail} deleted successfully.`);
        setAdmins((prev) => prev.filter((a) => a.id !== adminId));
      } else {
        setError(data.error || "Failed to delete administrator.");
      }
    } catch {
      setError("Network error occurred.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError("");
    setChangeSuccess("");

    if (newPassword.length < 6) {
      setChangeError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangeError("New passwords do not match.");
      return;
    }

    setIsChangeLoading(true);

    try {
      const adminDataStr = localStorage.getItem("lankan_ads_admin");
      if (!adminDataStr) {
        setChangeError("Session expired. Please log in again.");
        return;
      }
      const adminData = JSON.parse(adminDataStr);
      const adminId = adminData.id;

      if (!adminId) {
        setChangeError("Unable to retrieve admin ID.");
        return;
      }

      const res = await fetch(`/api/admin/admins/${adminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setChangeSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setChangeError(data.error || "Failed to update password.");
      }
    } catch {
      setChangeError("Network error occurred.");
    } finally {
      setIsChangeLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p>Loading security profiles...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>System Access Control</h1>
        <p className={styles.subtitle}>Manage administrators who can moderate ads, edit settings, and oversee finances.</p>
      </header>

      {error && <div className={styles.errorBox}>{error}</div>}
      {success && <div className={styles.successBox}>{success}</div>}

      <div className={styles.splitGrid}>
        {}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Active Administrators</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email Address</th>
                  <th>Created Date</th>
                  <th>Last Logged In</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((adm) => (
                  <tr key={adm.id}>
                    <td className={styles.adminEmail}>{adm.email}</td>
                    <td>{adm.createdAt ? new Date(adm.createdAt).toLocaleDateString("en-LK") : "N/A"}</td>
                    <td>
                      {adm.lastLogin ? (
                        new Date(adm.lastLogin).toLocaleString("en-LK")
                      ) : (
                        <span style={{ color: "#9ca3af" }}>Never</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteAdmin(adm.id, adm.email)}
                        className={styles.deleteBtn}
                        title="Delete administrator"
                      >
                        Remove Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Provision New Administrator</h2>
            <form onSubmit={handleCreateAdmin} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label htmlFor="adminEmail" className={styles.label}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  required
                  className={styles.input}
                  placeholder="newadmin@lankanads.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitLoading}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="adminPassword" className={styles.label}>
                  Temp Password
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  required
                  className={styles.input}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitLoading}
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isSubmitLoading}>
                {isSubmitLoading ? (
                  <span className={styles.btnContent}>
                    <span className={styles.spinnerMini}></span>
                    <span>Provisioning Account...</span>
                  </span>
                ) : (
                  "Authorize Admin Account"
                )}
              </button>
            </form>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Change My Password</h2>
            
            {changeError && <div className={styles.errorBox} style={{ marginBottom: "16px" }}>{changeError}</div>}
            {changeSuccess && <div className={styles.successBox} style={{ marginBottom: "16px" }}>{changeSuccess}</div>}

            <form onSubmit={handleChangePassword} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label htmlFor="currentPassword" className={styles.label}>
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  required
                  className={styles.input}
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isChangeLoading}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="newPassword" className={styles.label}>
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  required
                  className={styles.input}
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangeLoading}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="confirmNewPassword" className={styles.label}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  required
                  className={styles.input}
                  placeholder="••••••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={isChangeLoading}
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isChangeLoading}>
                {isChangeLoading ? (
                  <span className={styles.btnContent}>
                    <span className={styles.spinnerMini}></span>
                    <span>Updating Password...</span>
                  </span>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
