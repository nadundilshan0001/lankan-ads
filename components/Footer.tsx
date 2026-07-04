



import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, SITE_CONFIG } from "@/lib/constants";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="site-footer">
      <div className={styles.container}>
        <div className={styles.grid}>
          {}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIconContainer}>
                {}
                <Image
                  src="/logo/logo-dark-mode.svg"
                  alt="Lankan Ads Logo"
                  width={32}
                  height={32}
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
            <p className={styles.brandDescription}>
              Sri Lanka&apos;s premier classified ads platform for personal services,
              wellness, marriage proposals, and more.
            </p>
            <div className={styles.trustBadges}>
              <span className={styles.badge}>Secure Payments</span>
              <span className={styles.badge}>Verified Providers</span>
            </div>
          </div>

          {}
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

          {}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Quick Links</h3>
            <ul className={styles.list}>
              <li><Link href="/home" className={styles.link}>Home</Link></li>
              <li><Link href="/" className={styles.link}>Browse Ads</Link></li>
              <li><Link href="/post-ad" className={styles.link}>Post an Ad</Link></li>
              <li><Link href="/blog" className={styles.link}>Blog &amp; Guides</Link></li>
              <li><Link href="/faq" className={styles.link}>FAQ</Link></li>
              <li><Link href="/about" className={styles.link}>About Us</Link></li>
              <li><Link href="/sitemap-html" className={styles.link}>Sitemap</Link></li>
            </ul>
          </div>

          {}
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
                🇱🇰 Sri Lanka
              </li>
              <li>
                <Link
                  href="https://t.me/lankanadslk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  📢 Telegram Channel
                </Link>
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
