// ============================================================
// Lankan Ads — Landing Page (SSR)
// ============================================================

import Link from "next/link";
import { generateHomeMetadata } from "@/lib/seo/meta-tags";
import { CATEGORIES, TIERS } from "@/lib/constants";
import { getAdsByTier, getFaqs, getAllActiveAdsCount } from "@/lib/db/queries";
import { generateFAQSchema } from "@/lib/seo/structured-data";
import SchemaMarkup from "@/components/SchemaMarkup";
import AdCard from "@/components/AdCard";
import styles from "./page.module.css";

export const metadata = generateHomeMetadata();

export default async function HomePage() {
  const platinumAds = await getAdsByTier("platinum");
  const premiumAds = await getAdsByTier("premium");
  const standardAds = await getAdsByTier("standard");
  const faqs = await getFaqs();
  const homeFaqs = faqs.slice(0, 4);
  const dbActiveCount = await getAllActiveAdsCount();
  const displayActiveCount = dbActiveCount > 0 ? `${dbActiveCount}+` : "500+";

  return (
    <>
      <SchemaMarkup data={generateFAQSchema(homeFaqs)} />

      {/* ========== HERO SECTION ========== */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroBackground}>
          <video
            autoPlay
            muted
            loop
            playsInline
            className={styles.heroVideo}
          >
            <source src="/media/Background-video-frontpage.mp4" type="video/mp4" />
          </video>
          <div className={styles.heroVideoOverlay} />
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroOrb3} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <span className="section-label">Sri Lanka&apos;s #1 Classified Ads Platform</span>
          <h1 className={styles.heroTitle}>
            Discover Services
            <br />
            <span className={styles.heroGradient}>Across Sri Lanka</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Browse verified providers in personal services, spa &amp; wellness,
            marriage proposals, and live cam — across all 25 districts.
          </p>
          <div className={styles.heroActions}>
            <Link href="/" className="btn btn-primary btn-lg">
              Browse Listings
            </Link>
            <Link href="/post-ad" className="btn btn-secondary btn-lg">
              Post Your Ad
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>{displayActiveCount}</span>
              <span className={styles.heroStatLabel}>Active Ads</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>25</span>
              <span className={styles.heroStatLabel}>Districts</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>6</span>
              <span className={styles.heroStatLabel}>Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PLATINUM ADS ========== */}
      {platinumAds.length > 0 && (
        <section className={`${styles.adSection} ${styles.platinumSection}`} id="platinum-ads">
          <div className="container">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBadge}>
                <span className="badge badge-platinum">Platinum</span>
              </div>
              <h2 className={styles.sectionTitle}>Platinum Spotlight</h2>
              <p className={styles.sectionSubtitle}>
                Top-tier featured advertisements — maximum visibility
              </p>
            </div>
            <div className={`grid grid-3 ${styles.adGrid}`}>
              {platinumAds.slice(0, 6).map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
            {platinumAds.length > 6 && (
              <div className={styles.seeMoreContainer}>
                <Link href="/" className="btn btn-secondary">
                  See More
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========== PREMIUM ADS ========== */}
      {premiumAds.length > 0 && (
        <section className={`${styles.adSection} ${styles.premiumSection}`} id="premium-ads">
          <div className="container">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBadge}>
                <span className="badge badge-premium">Premium</span>
              </div>
              <h2 className={styles.sectionTitle}>Premium Ads</h2>
              <p className={styles.sectionSubtitle}>
                Enhanced visibility — featured for 24 hours
              </p>
            </div>
            <div className={`grid grid-3 ${styles.adGrid}`}>
              {premiumAds.slice(0, 6).map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
            {premiumAds.length > 6 && (
              <div className={styles.seeMoreContainer}>
                <Link href="/" className="btn btn-secondary">
                  See More
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========== STANDARD ADS ========== */}
      {standardAds.length > 0 && (
        <section className={`${styles.adSection} ${styles.standardSection}`} id="standard-ads">
          <div className="container">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBadge}>
                <span className="badge badge-standard">Standard</span>
              </div>
              <h2 className={styles.sectionTitle}>Latest Ads</h2>
              <p className={styles.sectionSubtitle}>
                Browse all recent listings
              </p>
            </div>
            <div className={`grid grid-3 ${styles.adGrid}`}>
              {standardAds.slice(0, 6).map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
            {standardAds.length > 6 && (
              <div className={styles.seeMoreContainer}>
                <Link href="/" className="btn btn-secondary">
                  See More
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========== CATEGORIES ========== */}
      <section className={styles.categoriesSection} id="categories">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Browse by Category</span>
            <h2>Find What You&apos;re Looking For</h2>
            <p>Six categories with tailored sub-categories for refined browsing</p>
          </div>
          <div className={`grid grid-3 ${styles.categoriesGrid}`}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/${cat.slug}`}
                className={styles.categoryCard}
                id={`category-${cat.id}`}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <h3 className={styles.categoryName}>{cat.name}</h3>
                <p className={styles.categoryDesc}>
                  {cat.description.substring(0, 80)}...
                </p>
                {cat.subCategories.length > 0 && (
                  <div className={styles.categoryTags}>
                    {cat.subCategories.slice(0, 3).map((sub) => (
                      <span key={sub.id} className={styles.categoryTag}>
                        {sub.name}
                      </span>
                    ))}
                  </div>
                )}
                <span className={styles.categoryArrow}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRICING TIERS ========== */}
      <section className={styles.pricingSection} id="pricing">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Ad Pricing</span>
            <h2>Choose Your Visibility Tier</h2>
            <p>All ads run for 7 days. Premium tiers get spotlight placement.</p>
          </div>
          <div className={`grid grid-3 ${styles.pricingGrid}`}>
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`${styles.pricingCard} ${tier.name === "platinum" ? styles.pricingCardHighlighted : ""}`}
                id={`tier-${tier.name}`}
              >
                {tier.name === "platinum" && (
                  <span className={styles.pricingPopular}>Most Visible</span>
                )}
                <div className={styles.pricingHeader}>
                  <h3 className={styles.pricingName}>{tier.displayName}</h3>
                  <div className={styles.pricingPrice}>
                    <span className={styles.pricingAmount}>
                      {tier.priceFormatted}
                    </span>
                    <span className={styles.pricingPeriod}>/ 7 days</span>
                  </div>
                  {tier.topLayerDuration !== "N/A" && (
                    <p className={styles.pricingDuration}>
                      {tier.topLayerDuration} spotlight
                    </p>
                  )}
                </div>
                <ul className={styles.pricingFeatures}>
                  {tier.features.map((feature, i) => (
                    <li key={i} className={styles.pricingFeature}>
                      <span className={styles.pricingCheck}></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/post-ad" className={`btn ${tier.name === "platinum" ? "btn-primary" : "btn-secondary"} ${styles.pricingBtn}`}>
                  Post Ad — {tier.priceFormatted}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== DISTRICTS BANNER ========== */}
      <section className={styles.districtsSection} id="districts">
        <div className="container">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <span className="section-label">Browse by Location</span>
            <h2>All 25 Districts Covered</h2>
            <p>Find services near you — we cover every district in Sri Lanka</p>
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className={styles.faqSection} id="faq-preview">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Frequently Asked Questions</span>
            <h2>Got Questions?</h2>
          </div>
          <div className={styles.faqList}>
            {homeFaqs.map((faq) => (
              <details key={faq.id} className={styles.faqItem} id={`faq-${faq.id}`}>
                <summary className={styles.faqQuestion}>
                  {faq.questionEn}
                </summary>
                <p className={styles.faqAnswer}>{faq.answerEn}</p>
              </details>
            ))}
          </div>
          <div className={styles.faqMore}>
            <Link href="/faq" className="btn btn-secondary">
              View All FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className={styles.ctaSection} id="cta">
        <div className="container">
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ready to Get Noticed?</h2>
            <p className={styles.ctaSubtitle}>
              Post your ad today and reach thousands of potential clients across Sri Lanka.
              Starting from just Rs. 699.
            </p>
            <Link href="/post-ad" className="btn btn-primary btn-lg">
              Post Your Ad Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
