



import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES, SITE_CONFIG } from "@/lib/constants";
import CategoryIcon from "@/components/CategoryIcon";
import { generateCategoryMetadata } from "@/lib/seo/meta-tags";
import { generateCollectionPageSchema, generateItemListSchema, generateFAQSchema } from "@/lib/seo/structured-data";
import { getAdsByCategory } from "@/lib/db/queries";
import SchemaMarkup from "@/components/SchemaMarkup";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdCard from "@/components/AdCard";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) return {};
  return generateCategoryMetadata(category);
}

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.slug }));
}

interface CategoryContent {
  editorialTitle: string;
  editorialText: string;
  faqs: { id: string; questionEn: string; answerEn: string; displayOrder: number }[];
}

const CATEGORY_CONTENT_MAP: Record<string, CategoryContent> = {
  "girls-personal": {
    editorialTitle: "Girls Personal Ads & Companionship in Sri Lanka",
    editorialText: "Welcome to Lankan Ads' Girls Personal section, the premier directory connecting independent female companion and social service providers with clients across Sri Lanka. Browse verified ads from individuals in major hubs like Colombo, Gampaha, Negombo, and Kandy. Our platform verifies all registered advertiser accounts via SMS OTP to maintain community trust. Explore listing details for locations served, pricing packages, hosting preferences, and direct WhatsApp contact details.",
    faqs: [
      {
        id: "cat-faq-gp-1",
        questionEn: "How do I contact an advertiser in the Girls Personal category?",
        answerEn: "You can click on any listing card to open its detail page. From there, you will find direct buttons to chat with the advertiser on WhatsApp or call their direct phone number. Lankan Ads does not charge middlemen fees.",
        displayOrder: 1,
      },
      {
        id: "cat-faq-gp-2",
        questionEn: "Are all listings under Girls Personal verified?",
        answerEn: "Yes, every advertiser is required to verify their mobile phone number via a dynamic SMS OTP code during registration. Highly prominent listings (Platinum and Premium tiers) undergo manual verification checks.",
        displayOrder: 2,
      },
      {
        id: "cat-faq-gp-3",
        questionEn: "Can I filter listings by district or city?",
        answerEn: "Absolutely! You can use our main search filters to narrow down providers by your specific district (e.g., Colombo, Kandy, Galle) or specific sub-categories.",
        displayOrder: 3,
      },
    ],
  },
  "spa-wellness-services": {
    editorialTitle: "Professional Spa & Wellness Services in Sri Lanka",
    editorialText: "Discover high-quality spa, massage, and therapeutic wellness centers across Sri Lanka on Lankan Ads. Whether you are looking for local Ayurvedic therapy in Kandy, a luxury hotel spa experience in Colombo, or professional reflexology services, browse active listings from verified wellness providers. View starting prices, opening hours, facilities, and contact details instantly.",
    faqs: [
      {
        id: "cat-faq-sw-1",
        questionEn: "What types of spas are advertised on Lankan Ads?",
        answerEn: "Our listings include luxury spa centers, professional wellness clinics, Ayurvedic massage centers, and independent certified massage therapists offering various relaxation therapies.",
        displayOrder: 1,
      },
      {
        id: "cat-faq-sw-2",
        questionEn: "How do I find a spa near me?",
        answerEn: "Navigate to the Spa & Wellness category and filter the listings by your current district or city. You can also view exact address coordinates and location details on each listing's page.",
        displayOrder: 2,
      },
    ],
  },
  "live-cam": {
    editorialTitle: "Live Cam Shows & Digital Services in Sri Lanka",
    editorialText: "Explore verified listings for digital live cam shows, online companionship, and video entertainment on Lankan Ads. Connect with verified local hosts across Sri Lanka who offer digital interaction. Direct contact links allow you to coordinate packages, platforms (e.g. WhatsApp, Skype, Telegram), and scheduling directly with the host.",
    faqs: [
      {
        id: "cat-faq-lc-1",
        questionEn: "How do cam shows and digital services work?",
        answerEn: "Hosts list their online availability, service details, and pricing on their ad details page. You contact them directly through the WhatsApp or call links to arrange the show platform and time.",
        displayOrder: 1,
      },
      {
        id: "cat-faq-lc-2",
        questionEn: "Is payment secure for digital services?",
        answerEn: "Lankan Ads only processes listing advertisement fees. All transactions for individual services are negotiated directly between the advertiser and client. We advise reviewing safety guidelines.",
        displayOrder: 2,
      },
    ],
  },
  "marriage-proposals": {
    editorialTitle: "Marriage Proposals & Matrimonial Services in Sri Lanka",
    editorialText: "Find your ideal life partner with Lankan Ads' Matrimony and Marriage Proposals section. Browse verified proposals posted by parents, relatives, or individuals seeking marriage in Sri Lanka. Filter listings by category, district, profession, age, and religion. Direct contact details are provided on every profile to begin safe, respectful family discussions.",
    faqs: [
      {
        id: "cat-faq-mp-1",
        questionEn: "Who posts marriage proposals on Lankan Ads?",
        answerEn: "Proposals are submitted directly by individuals or by their parents/guardians. All accounts require phone verification to prevent fake profile creation.",
        displayOrder: 1,
      },
      {
        id: "cat-faq-mp-2",
        questionEn: "Is my privacy protected in the Matrimony section?",
        answerEn: "Yes, you decide what personal, family, or educational details to include in your listing, and you can edit or remove your proposal from the dashboard at any time.",
        displayOrder: 2,
      },
    ],
  },
};

function getCategoryContent(categorySlug: string, categoryName: string): CategoryContent {
  const custom = CATEGORY_CONTENT_MAP[categorySlug];
  if (custom) return custom;

  return {
    editorialTitle: `${categoryName} Classified Listings in Sri Lanka`,
    editorialText: `Browse the active verified listings under ${categoryName} on Lankan Ads. Find trusted local service providers and businesses operating in your district. All advertiser accounts undergo strict SMS verification to ensure authenticity. Look inside individual ads for pricing details, locations served, and direct WhatsApp contact details.`,
    faqs: [
      {
        id: `cat-faq-fallback-1-${categorySlug}`,
        questionEn: `What is the ${categoryName} category on Lankan Ads?`,
        answerEn: `This category gathers verified advertisements, business offers, and services related to ${categoryName.toLowerCase()} across Sri Lanka.`,
        displayOrder: 1,
      },
      {
        id: `cat-faq-fallback-2-${categorySlug}`,
        questionEn: `How can I contact providers in ${categoryName}?`,
        answerEn: `You can reach out to any listed provider directly using the WhatsApp link or direct call button on their listing details page.`,
        displayOrder: 2,
      },
    ],
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = CATEGORIES.find((c) => c.slug === categorySlug);

  if (!category) {
    notFound();
  }

  const ads = await getAdsByCategory(categorySlug);
  const platinumAds = ads.filter((ad) => ad.adTier === "platinum");
  const premiumAds = ads.filter((ad) => ad.adTier === "premium");
  const standardAds = ads.filter((ad) => ad.adTier === "standard");

  const content = getCategoryContent(categorySlug, category.name);
  const schemas: any[] = [
    generateCollectionPageSchema(category),
    generateItemListSchema(ads, category.name, `${SITE_CONFIG.url}/${category.slug}`),
  ];

  if (content.faqs.length > 0) {
    schemas.push(generateFAQSchema(content.faqs));
  }

  return (
    <>
      <SchemaMarkup data={schemas} />

      <div className="container">
        <Breadcrumbs items={[{ label: category.name, href: `/${category.slug}` }]} />

        <section className={styles.header}>
          <div className={styles.headerContent}>
            <span className={styles.headerIcon}>
              <CategoryIcon slug={category.slug} size={36} />
            </span>
            <div>
              <h1 className={styles.title}>{category.name}</h1>
              <p className={styles.description}>{category.description}</p>
              <p className={styles.adCount}>
                {ads.length} active listing{ads.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </section>

        {category.subCategories.length > 0 && (
          <section className={styles.subCategories} id="sub-categories">
            <h2 className={styles.subTitle}>Browse by Type</h2>
            <div className={styles.subGrid}>
              {category.subCategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${category.slug}/${sub.slug}`}
                  className={styles.subCard}
                >
                  <span className={styles.subName}>{sub.name}</span>
                  <span className={styles.subDesc}>{sub.description}</span>
                  <span className={styles.subArrow}>→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={styles.editorialSection} id="editorial-content">
          <h2 className={styles.editorialTitle}>{content.editorialTitle}</h2>
          <p className={styles.editorialText}>{content.editorialText}</p>
        </section>

        {platinumAds.length > 0 && (
          <section className={styles.tierSection}>
            <div className={styles.tierHeader}>
              <span className="badge badge-platinum">Platinum</span>
              <h2 className={styles.tierTitle}>Platinum Ads</h2>
            </div>
            <div className={`grid grid-3 ${styles.adGrid}`}>
              {platinumAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </section>
        )}

        {premiumAds.length > 0 && (
          <section className={styles.tierSection}>
            <div className={styles.tierHeader}>
              <span className="badge badge-premium">Premium</span>
              <h2 className={styles.tierTitle}>Premium Ads</h2>
            </div>
            <div className={`grid grid-3 ${styles.adGrid}`}>
              {premiumAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </section>
        )}

        {standardAds.length > 0 && (
          <section className={styles.tierSection}>
            <div className={styles.tierHeader}>
              <span className="badge badge-standard">Standard</span>
              <h2 className={styles.tierTitle}>Standard Ads</h2>
            </div>
            <div className={`grid grid-3 ${styles.adGrid}`}>
              {standardAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </section>
        )}

        {ads.length === 0 && (
          <section className={styles.empty}>
            <p>No active listings in this category yet.</p>
            <Link href="/post-ad" className="btn btn-primary">
              Be the first — Post an Ad
            </Link>
          </section>
        )}

        {content.faqs.length > 0 && (
          <section className={styles.faqSection} id="faqs">
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              {content.faqs.map((faq) => (
                <details key={faq.id} className={styles.faqItem} id={`faq-${faq.id}`}>
                  <summary className={styles.faqQuestion}>
                    {faq.questionEn}
                  </summary>
                  <p className={styles.faqAnswer}>{faq.answerEn}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
