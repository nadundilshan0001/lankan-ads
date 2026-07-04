

import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: `Blog & Guides — ${SITE_CONFIG.name}`,
  description: `Tips, guides, and news about using ${SITE_CONFIG.name}. Learn how to post ads, find services, and get the most out of Sri Lanka's #1 classified ads platform.`,
  alternates: { canonical: `${SITE_CONFIG.url}/blog` },
  openGraph: {
    title: `Blog & Guides — ${SITE_CONFIG.name}`,
    description: `Tips, guides, and news about using ${SITE_CONFIG.name} — Sri Lanka's #1 classified ads platform.`,
    url: `${SITE_CONFIG.url}/blog`,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
  robots: { index: true, follow: true },
};

const BLOG_POSTS = [
  {
    slug: "how-to-post-ad-lankanads",
    title: "How to Post a Classified Ad on Lankan Ads — Complete Guide (2026)",
    excerpt: "Step-by-step walkthrough for posting your first verified classified ad on Lankan Ads. Covers registration, OTP verification, category selection, photo uploads, tier selection, and payment.",
    date: "2026-01-15",
    category: "Guides",
    readTime: "5 min read",
  },
  {
    slug: "personal-services-colombo-guide",
    title: "Personal Services in Colombo — Complete District Guide (2026)",
    excerpt: "A comprehensive guide to finding verified personal service providers in Colombo, Sri Lanka. Learn about the different areas, pricing, and how to safely contact providers.",
    date: "2026-02-01",
    category: "District Guides",
    readTime: "7 min read",
  },
  {
    slug: "sri-lanka-spa-wellness-guide",
    title: "Sri Lanka Spa & Massage Guide — Verified Centers by District",
    excerpt: "Find the best verified spa, Ayurvedic massage, and wellness centers across all Sri Lanka districts. Includes Colombo, Kandy, Galle, and more.",
    date: "2026-02-15",
    category: "Wellness",
    readTime: "6 min read",
  },
  {
    slug: "marriage-proposals-sri-lanka",
    title: "Marriage Proposals in Sri Lanka — Find Your Match Online Safely (2026)",
    excerpt: "How to browse and respond to marriage proposals on Lankan Ads. Tips for writing an effective matrimonial listing, privacy best practices, and contacting prospects safely.",
    date: "2026-03-01",
    category: "Matrimony",
    readTime: "8 min read",
  },
  {
    slug: "classified-ads-vs-social-media",
    title: "Classified Ads vs Social Media: Why Lankan Ads Gets Better Results",
    excerpt: "Why posting on a dedicated classified ads platform gives advertisers better reach, more serious inquiries, and higher visibility than Facebook groups or Instagram.",
    date: "2026-03-15",
    category: "Tips",
    readTime: "4 min read",
  },
];

export default function BlogIndexPage() {
  return (
    <div className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-2xl)" }}>
      <Breadcrumbs items={[{ label: "Blog", href: "/blog" }]} />

      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "800", marginBottom: "0.5rem" }}>
          Blog &amp; Guides
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", maxWidth: "600px" }}>
          Tips, how-to guides, and news for advertisers and visitors on {SITE_CONFIG.name} —
          Sri Lanka&apos;s #1 verified classified ads platform.
        </p>
      </header>

      <div style={{ display: "grid", gap: "var(--space-lg)" }}>
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-lg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "0.75rem" }}>
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: "600",
                  padding: "0.2rem 0.6rem",
                  background: "var(--color-primary-dim)",
                  color: "var(--color-primary)",
                  borderRadius: "var(--radius-full)",
                }}
              >
                {post.category}
              </span>
              <time
                dateTime={post.date}
                style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}
              >
                {new Date(post.date).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}
              </time>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>·</span>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{post.readTime}</span>
            </div>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", marginBottom: "0.5rem" }}>
              <Link
                href={`/blog/${post.slug}`}
                style={{ color: "var(--text-primary)", textDecoration: "none" }}
              >
                {post.title}
              </Link>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: 1.6, marginBottom: "var(--space-sm)" }}>
              {post.excerpt}
            </p>
            <Link
              href={`/blog/${post.slug}`}
              style={{ fontSize: "var(--text-sm)", color: "var(--color-primary)", fontWeight: "600", textDecoration: "none" }}
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
