// ============================================================
// Lankan Ads — Footer Component
// ============================================================

import Link from "next/link";
import { CATEGORIES, SITE_CONFIG } from "@/lib/constants";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="site-footer">
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon}>◆</span>
              <span className={styles.logoText}>
                Lankan<span className={styles.logoAccent}>Ads</span>
              </span>
            </Link>
            <p className={styles.brandDescription}>
              Sri Lanka&apos;s premier classified ads platform for personal services,
              wellness, marriage proposals, and more.
            </p>
            <div className={styles.trustBadges}>
              <span className={styles.badge}>Secure Payments</span>
              <span className={styles.badge}>Verified Providers</span>
              <span className={styles.badge}>Admin Reviewed</span>
            </div>
          </div>

          {/* Categories */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Categories</h3>
            <ul className={styles.list}>
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/${cat.slug}`} className={styles.link}>
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Quick Links</h3>
            <ul className={styles.list}>
              <li><Link href="/post-ad" className={styles.link}>Post an Ad</Link></li>
              <li><Link href="/faq" className={styles.link}>FAQ</Link></li>
              <li><Link href="/about" className={styles.link}>About Us</Link></li>
              <li><Link href="/login" className={styles.link}>Sign In</Link></li>
              <li><Link href="/register" className={styles.link}>Register</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Contact</h3>
            <ul className={styles.list}>
              <li className={styles.contactItem}>
                support@{SITE_CONFIG.domain}
              </li>
              <li className={styles.contactItem}>
                {SITE_CONFIG.domain}
              </li>
              <li className={styles.contactItem}>
                Sri Lanka
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              © {currentYear} {SITE_CONFIG.name}. All rights reserved.
            </p>
            <div className={styles.bottomLinks}>
              <Link href="/privacy" className={styles.bottomLink}>Privacy Policy</Link>
              <Link href="/terms" className={styles.bottomLink}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
