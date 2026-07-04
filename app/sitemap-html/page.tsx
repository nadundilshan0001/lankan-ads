

import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, DISTRICTS, SITE_CONFIG } from "@/lib/constants";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: `Sitemap — ${SITE_CONFIG.name}`,
  description: `Complete sitemap of all pages, categories, and districts on ${SITE_CONFIG.name}. Browse all classified ad categories and districts across Sri Lanka.`,
  alternates: { canonical: `${SITE_CONFIG.url}/sitemap-html` },
  robots: { index: true, follow: true },
};

export default function HtmlSitemapPage() {
  return (
    <div className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-2xl)" }}>
      <Breadcrumbs items={[{ label: "Sitemap", href: "/sitemap-html" }]} />

      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "800", marginBottom: "0.5rem" }}>
          Site Map
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          Complete directory of all pages on {SITE_CONFIG.name}
        </p>
      </header>

      {/* Main pages */}
      <section style={{ marginBottom: "var(--space-xl)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", marginBottom: "var(--space-md)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
          Main Pages
        </h2>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <li><Link href="/" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Home — Browse All Classified Ads</Link></li>
          <li><Link href="/about" style={{ color: "var(--color-primary)", textDecoration: "none" }}>About Lankan Ads</Link></li>
          <li><Link href="/faq" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Frequently Asked Questions</Link></li>
          <li><Link href="/post-ad" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Post an Ad</Link></li>
          <li><Link href="/terms" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Terms of Service</Link></li>
          <li><Link href="/privacy" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Privacy Policy</Link></li>
        </ul>
      </section>

      {/* Categories with subcategories */}
      <section style={{ marginBottom: "var(--space-xl)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", marginBottom: "var(--space-md)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
          Categories
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--space-lg)" }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <Link
                href={`/${cat.slug}`}
                style={{ fontWeight: "700", color: "var(--color-primary)", textDecoration: "none", fontSize: "var(--text-sm)" }}
              >
                {cat.icon} {cat.name}
              </Link>
              {cat.subCategories.length > 0 && (
                <ul style={{ listStyle: "none", marginTop: "0.5rem", paddingLeft: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {cat.subCategories.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/${cat.slug}/${sub.slug}`}
                        style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "var(--text-xs)" }}
                      >
                        → {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Categories × Districts cross-links */}
      <section style={{ marginBottom: "var(--space-xl)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", marginBottom: "0.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
          Listings by District
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", marginBottom: "var(--space-md)" }}>
          All 25 districts × all categories
        </p>
        {DISTRICTS.map((district) => (
          <div key={district} style={{ marginBottom: "var(--space-md)" }}>
            <h3 style={{ fontSize: "var(--text-sm)", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              {district}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {CATEGORIES.map((cat) => (
                <Link
                  key={`${district}-${cat.slug}`}
                  href={`/${cat.slug}/${district.toLowerCase().replace(/\s+/g, "-")}`}
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    padding: "0.2rem 0.6rem",
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
