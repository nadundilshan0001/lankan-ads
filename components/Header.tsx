"use client";

// ============================================================
// Lankan Ads — Header Component
// ============================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import styles from "./Header.module.css";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
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
    <header className={styles.header} id="site-header">
      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.container}>
          <Link href="/" className={styles.logo} aria-label="Lankan Ads Home">
            <span className={styles.logoIcon}>◆</span>
            <span className={styles.logoText}>
              Lankan<span className={styles.logoAccent}>Ads</span>
            </span>
          </Link>

          <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.navLinksOpen : ""}`}>
            <Link href="/" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
              Ads
            </Link>
            <Link href="/home" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>

            <div
              className={styles.dropdown}
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                className={styles.navLink}
                aria-expanded={categoriesOpen}
                aria-haspopup="true"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
              >
                Categories
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ marginLeft: '4px' }}>
                  <path d="M6 8L2 4h8L6 8z" />
                </svg>
              </button>
              {categoriesOpen && (
                <div className={styles.dropdownMenu} role="menu">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${cat.slug}`}
                      className={styles.dropdownItem}
                      role="menuitem"
                      onClick={() => {
                        setCategoriesOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <span className={styles.dropdownIcon}>{cat.icon}</span>
                      <div>
                        <span className={styles.dropdownLabel}>{cat.name}</span>
                        <span className={styles.dropdownDesc}>
                          {cat.subCategories.length > 0
                            ? `${cat.subCategories.length} sub-categories`
                            : "Browse listings"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/faq" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>
            <Link href="/about" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
          </div>

          <div className={styles.navActions}>
            <Link href="/post-ad" className={`btn btn-primary btn-sm ${styles.postAdBtn}`}>
              Post Ad
            </Link>
            {isLoggedIn ? (
              <Link href="/profile" className={`btn btn-glass btn-sm`}>
                My Profile
              </Link>
            ) : (
              <Link href="/login" className={`btn btn-glass btn-sm`}>
                Sign In
              </Link>
            )}
          </div>

          <button
            className={styles.mobileToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ""}`} />
          </button>
        </div>
      </nav>
    </header>
  );
}
