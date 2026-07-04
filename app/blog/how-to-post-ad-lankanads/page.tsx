

import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { generateHowToSchema, generateFAQSchema } from "@/lib/seo/structured-data";
import SchemaMarkup from "@/components/SchemaMarkup";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: `How to Post a Classified Ad on Lankan Ads — Complete Guide (2026) | ${SITE_CONFIG.name}`,
  description: "Step-by-step guide to posting a verified classified ad on Lankan Ads. Covers registration, OTP verification, category selection, photo uploads, pricing tiers, and bank payment. Takes just 5 minutes.",
  alternates: { canonical: `${SITE_CONFIG.url}/blog/how-to-post-ad-lankanads` },
  openGraph: {
    title: `How to Post a Classified Ad on Lankan Ads — Complete Guide (2026)`,
    description: "Step-by-step guide to posting a verified classified ad on Lankan Ads. Covers registration, OTP, categories, photos, tiers, and payment.",
    url: `${SITE_CONFIG.url}/blog/how-to-post-ad-lankanads`,
    siteName: SITE_CONFIG.name,
    type: "article",
    publishedTime: "2026-01-15",
    locale: "en_LK",
  },
  robots: { index: true, follow: true },
};

const POST_FAQS = [
  {
    id: "blog-faq-1",
    questionEn: "How long does it take to post an ad on Lankan Ads?",
    answerEn: "The entire process — from registration to submitting your ad — takes approximately 5 minutes. After submitting the payment reference, our admin team typically approves ads within 1–6 hours.",
    displayOrder: 1,
  },
  {
    id: "blog-faq-2",
    questionEn: "What payment methods does Lankan Ads accept?",
    answerEn: "Lankan Ads currently accepts bank transfers (Commercial Bank). After completing your transfer, you submit the reference number through the platform and our team verifies the payment before approving your ad.",
    displayOrder: 2,
  },
  {
    id: "blog-faq-3",
    questionEn: "How many photos can I upload with my ad?",
    answerEn: "You can upload up to 5 photos per ad. Photos are stored securely on Cloudinary CDN and are reviewed by our admin team as part of the moderation process.",
    displayOrder: 3,
  },
  {
    id: "blog-faq-4",
    questionEn: "What is the difference between Standard, Premium, and Platinum tiers?",
    answerEn: "Standard (Rs. 700): 7 days in the normal chronological feed. Premium (Rs. 1,400): 24 hours in the premium spotlight section at the top of category pages, then 6 days in standard — 7 days total. Platinum (Rs. 5,000): 3 days in the absolute top spotlight, then 4 days standard — 7 days total.",
    displayOrder: 4,
  },
];

export default function HowToPostAdPage() {
  const schemas = [
    generateHowToSchema(),
    generateFAQSchema(POST_FAQS),
  ];

  return (
    <>
      <SchemaMarkup data={schemas} />

      <div className="container" style={{ paddingTop: "var(--space-xl)", paddingBottom: "var(--space-2xl)", maxWidth: "800px" }}>
        <Breadcrumbs
          items={[
            { label: "Blog", href: "/blog" },
            { label: "How to Post an Ad", href: "/blog/how-to-post-ad-lankanads" },
          ]}
        />

        <header style={{ marginBottom: "var(--space-xl)" }}>
          <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center", marginBottom: "var(--space-sm)" }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: "600", padding: "0.2rem 0.6rem", background: "var(--color-primary-dim)", color: "var(--color-primary)", borderRadius: "var(--radius-full)" }}>
              Guides
            </span>
            <time dateTime="2026-01-15" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              January 15, 2026
            </time>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>· 5 min read</span>
          </div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "800", marginBottom: "var(--space-sm)", lineHeight: 1.3 }}>
            How to Post a Classified Ad on Lankan Ads — Complete Guide (2026)
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.7 }}>
            This guide walks you through the entire process of creating a verified classified ad
            on Lankan Ads — from registration to your ad going live. The whole process takes
            approximately 5 minutes.
          </p>
        </header>

        {/* Article body */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)", fontSize: "var(--text-sm)", lineHeight: 1.8, color: "var(--text-secondary)" }}>

          {/* Quick summary */}
          <section style={{ padding: "var(--space-md)", background: "var(--surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--color-primary)" }}>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Quick Summary
            </h2>
            <p>
              To post an ad on Lankan Ads: (1) Register with your Sri Lankan mobile number, (2) verify via SMS OTP,
              (3) fill in your ad details and upload photos, (4) choose a pricing tier, (5) pay via bank transfer,
              and (6) submit the payment reference. Ads are approved within hours.
            </p>
          </section>

          {/* Step 1 */}
          <section id="step-1">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", color: "var(--text-primary)", marginBottom: "var(--space-sm)" }}>
              Step 1 — Register with Your Mobile Number
            </h2>
            <p>
              Visit <Link href="/register" style={{ color: "var(--color-primary)" }}>lankanads.lk/register</Link> and
              enter your valid Sri Lankan mobile number. Lankan Ads uses SMS OTP verification to ensure every advertiser
              is a real person with a working phone number. This prevents spam and fake listings.
            </p>
            <p style={{ marginTop: "0.75rem" }}>
              You will receive a 6-digit OTP via SMS within 30 seconds. Enter it on the verification screen to complete
              registration. OTPs expire after 5 minutes.
            </p>
          </section>

          {/* Step 2 */}
          <section id="step-2">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", color: "var(--text-primary)", marginBottom: "var(--space-sm)" }}>
              Step 2 — Choose Your Category
            </h2>
            <p>
              Once registered, go to <Link href="/post-ad" style={{ color: "var(--color-primary)" }}>Post an Ad</Link>.
              Select from one of 8 available categories:
            </p>
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li><strong>Girls Personal</strong> — Individual female service providers</li>
              <li><strong>Boys Personal</strong> — Individual male service providers</li>
              <li><strong>Live Cam Shows</strong> — WhatsApp/Telegram digital sessions</li>
              <li><strong>Spa &amp; Wellness</strong> — Physical spas, Ayurvedic centers, massage clinics</li>
              <li><strong>Cuckold Couples</strong> — Couple services listings</li>
              <li><strong>Shemale Personal</strong> — Transgender individual providers</li>
              <li><strong>Gay</strong> — Male-to-male personal services</li>
              <li><strong>Marriage Proposals</strong> — Matrimonial / Bride &amp; Groom profiles</li>
            </ul>
          </section>

          {/* Step 3 */}
          <section id="step-3">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", color: "var(--text-primary)", marginBottom: "var(--space-sm)" }}>
              Step 3 — Fill in Your Ad Details
            </h2>
            <p>Complete the ad form with the following information:</p>
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li><strong>Title</strong> — A clear, descriptive title for your ad (max 80 characters)</li>
              <li><strong>Description</strong> — Detailed service description (max 1000 characters)</li>
              <li><strong>District</strong> — Select your Sri Lanka district (all 25 districts supported)</li>
              <li><strong>City</strong> — Your specific city or suburb</li>
              <li><strong>WhatsApp Number</strong> — The number clients will use to contact you</li>
              <li><strong>Price Range</strong> — Your starting price in LKR (optional)</li>
              <li><strong>Availability</strong> — Your service hours</li>
              <li><strong>Photos</strong> — Upload up to 5 images (JPEG/PNG, max 10MB each)</li>
            </ul>
            <p style={{ marginTop: "0.75rem" }}>
              <strong>Tip:</strong> Ads with high-quality photos and detailed descriptions get significantly
              more views and WhatsApp contacts than text-only ads.
            </p>
          </section>

          {/* Step 4 */}
          <section id="step-4">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", color: "var(--text-primary)", marginBottom: "var(--space-sm)" }}>
              Step 4 — Select a Pricing Tier
            </h2>
            <p>Lankan Ads offers three pricing tiers. All tiers run for 7 days total:</p>
            <div style={{ display: "grid", gap: "var(--space-sm)", marginTop: "0.75rem" }}>
              <div style={{ padding: "var(--space-md)", background: "var(--surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                <strong style={{ color: "var(--text-primary)" }}>Standard — Rs. 700</strong>
                <p style={{ marginTop: "0.25rem" }}>Your ad appears in the normal chronological feed for 7 days. Best for trying the platform.</p>
              </div>
              <div style={{ padding: "var(--space-md)", background: "var(--surface-elevated)", border: "1px solid var(--color-premium)", borderRadius: "var(--radius-md)" }}>
                <strong style={{ color: "var(--text-primary)" }}>Premium — Rs. 1,400</strong>
                <p style={{ marginTop: "0.25rem" }}>24 hours in the premium spotlight at the top of category pages, then 6 days standard. 2× the visibility of Standard.</p>
              </div>
              <div style={{ padding: "var(--space-md)", background: "var(--surface-elevated)", border: "1px solid var(--color-platinum)", borderRadius: "var(--radius-md)" }}>
                <strong style={{ color: "var(--text-primary)" }}>Platinum — Rs. 5,000</strong>
                <p style={{ marginTop: "0.25rem" }}>3 days in the absolute top spotlight (above Premium), then 4 days standard. Maximum visibility for serious advertisers.</p>
              </div>
            </div>
          </section>

          {/* Step 5 */}
          <section id="step-5">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", color: "var(--text-primary)", marginBottom: "var(--space-sm)" }}>
              Step 5 — Pay via Bank Transfer
            </h2>
            <p>
              Lankan Ads processes payments via bank transfer. After selecting your tier, you will see the
              bank account details. Transfer the exact amount, then return to the platform and submit your
              payment reference number.
            </p>
            <p style={{ marginTop: "0.75rem" }}>
              Our team verifies bank transfers and approves ads within <strong>1–6 hours</strong> on business days.
              You will receive an SMS notification when your ad goes live.
            </p>
          </section>

          {/* FAQ section */}
          <section id="faqs">
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", color: "var(--text-primary)", marginBottom: "var(--space-md)" }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {POST_FAQS.map((faq) => (
                <details
                  key={faq.id}
                  id={`faq-${faq.id}`}
                  style={{ background: "var(--surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--space-md)" }}
                >
                  <summary style={{ fontWeight: "600", fontSize: "var(--text-sm)", cursor: "pointer", color: "var(--text-primary)" }}>
                    {faq.questionEn}
                  </summary>
                  <p style={{ marginTop: "0.75rem", color: "var(--text-secondary)" }}>
                    {faq.answerEn}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section style={{ textAlign: "center", padding: "var(--space-xl)", background: "var(--surface-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)" }}>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Ready to post your first ad?
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "var(--space-md)" }}>
              It takes only 5 minutes. Your ad will be live within hours.
            </p>
            <Link
              href="/post-ad"
              style={{
                display: "inline-block",
                padding: "0.75rem 2rem",
                background: "var(--color-primary)",
                color: "#fff",
                borderRadius: "var(--radius-md)",
                fontWeight: "700",
                textDecoration: "none",
                fontSize: "var(--text-sm)",
              }}
            >
              Post an Ad Now →
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
