"use client";

// ============================================================
// Lankan Ads — Admin Login (Client Component)
// ============================================================

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.removeItem("lankan_ads_token");
        localStorage.removeItem("lankan_ads_phone");
        // Since session is stored in an HttpOnly cookie, we don't store token in localStorage.
        // We store user info in localStorage only for client-side context if needed.
        localStorage.setItem("lankan_ads_admin", JSON.stringify(data.admin));
        
        // For backwards compatibility with old client header requests, if any component still expects it:
        // Note: HttpOnly cookie is the secure way, but we can set dummy storage to avoid breaking any other client requests.
        localStorage.setItem("lankan_ads_token_role", "admin");

        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIconContainer}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/logo-dark-mode.svg"
                alt="Lankan Ads Logo"
                className={styles.logoImage}
              />
            </div>
            <span className={styles.logoText}>
              <span className={styles.logoFirstLetter}>ල</span>
              <span className={styles.logoO}>o</span>
              <span className={styles.logoRest}>කන්</span>
              <span className={styles.logoAccent}>Ads</span>
            </span>
          </Link>
        </div>
        <h1 className={styles.title}>Control Panel Login</h1>
        <p className={styles.subtitle}>Enter your administrator credentials to access the backend dashboard.</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.label}>Admin Email</label>
            <input
              type="email"
              id="email"
              required
              className={styles.input}
              placeholder="admin@lankanads.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              required
              className={styles.input}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? (
              <span className={styles.btnContent}>
                <span className={styles.spinnerMini}></span>
                <span>Authenticating Credentials...</span>
              </span>
            ) : (
              "Access Control Panel"
            )}
          </button>
        </form>

        <div className={styles.footerLink}>
          <Link href="/" className={styles.backLink}>
            ← Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}
