"use client";

// ============================================================
// Lankan Ads — Forgot Password Page
// 3 steps: Enter Phone → Verify OTP → Set New Password
// ============================================================

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";

type Step = "phone" | "otp" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [devOtp, setDevOtp] = useState(""); // shown in dev mode

  // OTP input refs for auto-advance
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Step 1: Send OTP ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid Sri Lankan mobile number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.testOtpCode) setDevOtp(data.testOtpCode);
        setStep("otp");
      } else {
        setError(data.error || "Failed to send OTP. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handling with auto-advance ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits of the OTP.");
      return;
    }
    // Store code for step 3 and advance
    setStep("password");
  };

  // ── Step 3: Reset Password ──
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp: otp.join(""), newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Password reset successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(data.error || "Failed to reset password.");
        // If OTP expired, go back to step 1
        if (data.error?.toLowerCase().includes("expired")) setStep("phone");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Phone Number", "Verify OTP", "New Password"];
  const stepIndex = step === "phone" ? 0 : step === "otp" ? 1 : 2;

  return (
    <div className={styles.wrapper}>
      <div className={styles.backgroundOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.authCard}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {step === "phone" && "Forgot Password?"}
            {step === "otp" && "Verify Your Number"}
            {step === "password" && "Set New Password"}
          </h1>
          <p className={styles.subtitle}>
            {step === "phone" && "Enter your registered mobile number to receive an OTP"}
            {step === "otp" && `We sent a 6-digit code to ${phoneNumber}`}
            {step === "password" && "Choose a strong new password"}
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", alignItems: "center" }}>
          {stepLabels.map((label, i) => (
            <React.Fragment key={label}>
              <div style={{
                flex: 1,
                height: "4px",
                borderRadius: "2px",
                background: i <= stepIndex
                  ? "linear-gradient(90deg, #8b5cf6, #a78bfa)"
                  : "rgba(255,255,255,0.08)",
                transition: "background 0.3s ease",
              }} />
            </React.Fragment>
          ))}
        </div>

        {/* Errors / Success */}
        {error && (
          <div className={styles.errorMsg} style={{ marginBottom: "1rem", textAlign: "center" }}>
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.25)",
            color: "#10b981",
            borderRadius: "var(--radius-lg)",
            padding: "0.75rem 1rem",
            fontSize: "var(--text-sm)",
            textAlign: "center",
            marginBottom: "1rem",
          }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Dev OTP hint */}
        {devOtp && step === "otp" && (
          <div className={styles.infoBox} style={{ textAlign: "center" }}>
            🔧 <strong>Dev Mode OTP:</strong> {devOtp}
          </div>
        )}

        {/* ── STEP 1: Phone ── */}
        {step === "phone" && (
          <form className={styles.form} onSubmit={handleSendOtp}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="fp-phone">Mobile Number</label>
              <input
                id="fp-phone"
                type="tel"
                className={styles.input}
                placeholder="e.g. 0771234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
              disabled={loading}
              id="fp-send-otp-btn"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === "otp" && (
          <form className={styles.form} onSubmit={handleVerifyOtp}>
            <div className={styles.otpGroup}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  id={`fp-otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={styles.otpInput}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={loading}
                />
              ))}
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={loading}
              id="fp-verify-otp-btn"
            >
              Verify OTP
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setDevOtp(""); }}
            >
              ← Change Number
            </button>
          </form>
        )}

        {/* ── STEP 3: New Password ── */}
        {step === "password" && (
          <form className={styles.form} onSubmit={handleResetPassword}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="fp-new-pw">New Password</label>
              <input
                id="fp-new-pw"
                type="password"
                className={styles.input}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="fp-confirm-pw">Confirm New Password</label>
              <input
                id="fp-confirm-pw"
                type="password"
                className={styles.input}
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
              disabled={loading}
              id="fp-reset-btn"
            >
              {loading ? "Updating Password..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          Remember your password?{" "}
          <Link href="/login" className={styles.link}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
