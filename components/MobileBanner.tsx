"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./MobileBanner.module.css";

export default function MobileBanner() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem("lankan_ads_token"));
    };
    checkLogin();
    const interval = setInterval(checkLogin, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.label}>Start posting ads today:</span>
        <div className={styles.actions}>
          <Link href="/post-ad" className={`btn btn-primary btn-sm ${styles.btn}`}>
            Post Ad
          </Link>
          {isLoggedIn ? (
            <Link href="/profile" className={`btn btn-glass btn-sm ${styles.btn}`}>
              My Profile
            </Link>
          ) : (
            <Link href="/login" className={`btn btn-glass btn-sm ${styles.btn}`}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
