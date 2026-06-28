"use client";

// ============================================================
// Lankan Ads — Login Page (Client Component)
// ============================================================

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const isEmail = phoneNumber.includes("@");
    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(phoneNumber.trim())) {
        setError("Please enter a valid email address.");
        return;
      }
    } else {
      const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        setError("Please enter a valid Sri Lankan mobile number (e.g. 0771234567).");
        return;
      }
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        setLoading(false);
        if (res.ok && data.success) {
          localStorage.setItem("lankan_ads_token", data.token);
          localStorage.setItem("lankan_ads_phone", data.user.phoneNumber);
          router.push("/post-ad");
        } else {
          setError(data.error || "Login failed. Please try again.");
        }
      })
      .catch((err) => {
        setLoading(false);
        setError("Network error. Please try again.");
      });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.backgroundOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Login to manage your ads or post new listings</p>
        </div>

        {error && <div className={styles.errorMsg} style={{ marginBottom: "1rem", textAlign: "center" }}>⚠️ {error}</div>}

        <form className={styles.form} onSubmit={handleLoginSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="phone">Mobile Number</label>
            <input
              id="phone"
              type="tel"
              className={styles.input}
              placeholder="e.g. 0771234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className={styles.label} htmlFor="password">Password</label>
              <Link href="/forgot-password" className={styles.link} style={{ fontSize: "var(--text-xs)" }}>
                Forgot Password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg styles.submitBtn"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <div className={styles.footer}>
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className={styles.link}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
