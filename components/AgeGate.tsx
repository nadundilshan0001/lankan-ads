"use client";






import { useState, useEffect } from "react";
import styles from "./AgeGate.module.css";

export default function AgeGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    
    const verified = document.cookie
      .split("; ")
      .find((row) => row.startsWith("age_verified="))
      ?.split("=")[1];

    if (verified !== "true") {
      setVisible(true);
      
      document.body.style.overflow = "hidden";
    }
  }, []);

  const handleConfirm = () => {
    
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `age_verified=true; expires=${expires}; path=/; SameSite=Strict`;
    document.body.style.overflow = "";
    setVisible(false);
  };

  const handleDecline = () => {
    
    window.location.href = "https://www.google.com";
  };

  if (!visible) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className={styles.card}>
        {}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔞</span>
        </div>

        {}
        <div className={styles.warningBadge}>Adults Only — 18+</div>

        <h1 className={styles.title} id="age-gate-title">
          Age Verification Required
        </h1>

        <p className={styles.description}>
          This website contains <strong>adult content</strong> intended for
          individuals who are <strong>18 years of age or older</strong>. By
          entering, you confirm that:
        </p>

        <ul className={styles.confirmList}>
          <li>You are at least 18 years old</li>
          <li>It is legal to view adult content in your location</li>
          <li>You are accessing this site of your own free will</li>
        </ul>

        <div className={styles.actions}>
          <button
            id="age-gate-confirm"
            className={styles.btnConfirm}
            onClick={handleConfirm}
          >
            I am 18 or Older — Enter
          </button>
          <button
            id="age-gate-decline"
            className={styles.btnDecline}
            onClick={handleDecline}
          >
            I am Under 18 — Exit
          </button>
        </div>

        <p className={styles.disclaimer}>
          By entering, you agree to our{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
