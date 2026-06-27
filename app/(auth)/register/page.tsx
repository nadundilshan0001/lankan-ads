"use client";

// ============================================================
// Lankan Ads — Register Page (Client Component)
// ============================================================

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  
  // States
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [langPref, setLangPref] = useState<"en" | "si">("en");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  
  // Validation / Feedback States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle phone submission (moves to OTP)
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic Sri Lankan Phone number regex validation (+94 or 0 followed by 9 digits)
    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid Sri Lankan mobile number (e.g. 0771234567).");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, password, languagePreference: langPref }),
    })
      .then(async (res) => {
        const data = await res.json();
        setLoading(false);
        if (res.ok && data.success) {
          setStep("otp");
        } else {
          setError(data.error || "Registration failed. Please try again.");
        }
      })
      .catch((err) => {
        setLoading(false);
        setError("Network error. Please try again.");
      });
  };

  // Handle individual digit input for OTP
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otpCode];
    newOtp[index] = element.value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (element.value !== "" && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  // Handle OTP verification submit
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const fullCode = otpCode.join("");
    if (fullCode.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, code: fullCode }),
    })
      .then(async (res) => {
        const data = await res.json();
        setLoading(false);
        if (res.ok && data.success) {
          localStorage.setItem("lankan_ads_token", data.token);
          localStorage.setItem("lankan_ads_phone", data.user.phoneNumber);
          router.push("/post-ad");
        } else {
          setError(data.error || "OTP verification failed. Please try again.");
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
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>
            {step === "phone"
              ? "Register with your mobile number to post ads"
              : "Verify your phone number to continue"}
          </p>
        </div>

        {error && <div className={styles.errorMsg} style={{ marginBottom: "1rem", textAlign: "center" }}>⚠️ {error}</div>}

        {step === "phone" ? (
          <form className={styles.form} onSubmit={handlePhoneSubmit}>
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
              <label className={styles.label} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Language Preference</label>
              <select
                className={styles.input}
                value={langPref}
                onChange={(e) => setLangPref(e.target.value as "en" | "si")}
                disabled={loading}
              >
                <option value="en">English (default)</option>
                <option value="si">සිංහල (Sinhala)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg styles.submitBtn"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Get OTP Code"}
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleOtpSubmit}>
            <div className={styles.infoBox}>
              We sent a verification code to <strong>{phoneNumber}</strong> via SMS. Enter the code below to complete registration.
              <br />
              <span style={{ color: "var(--color-primary-light)", fontSize: "10px" }}>* For testing, enter any 6 digits (e.g. 123456)</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                Verification Code
              </label>
              <div className={styles.otpGroup}>
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    className={styles.otpInput}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target, idx)}
                    onFocus={(e) => e.target.select()}
                    required
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg styles.submitBtn"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Register"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep("phone")}
              style={{ marginTop: "0.5rem" }}
              disabled={loading}
            >
              Back to Mobile Number
            </button>
          </form>
        )}

        <div className={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" className={styles.link}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
