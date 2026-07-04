



import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES, SITE_CONFIG } from "@/lib/constants";
import CategoryIcon from "@/components/CategoryIcon";
import { generateCategoryMetadata } from "@/lib/seo/meta-tags";
import {
  generateCollectionPageSchema,
  generateItemListSchema,
  generateFAQSchema,
  generateClassifiedAdListingSchema,
} from "@/lib/seo/structured-data";
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
      {
        id: "cat-faq-gp-4",
        questionEn: "What districts are available for Girls Personal listings in Sri Lanka?",
        answerEn: "Girls Personal listings are available in all 25 Sri Lanka districts, including Colombo, Gampaha, Kandy, Galle, Jaffna, Trincomalee, Batticaloa, Matara, Kurunegala, Anuradhapura, and more.",
        displayOrder: 4,
      },
      {
        id: "cat-faq-gp-5",
        questionEn: "How much does it cost to advertise in the Girls Personal category?",
        answerEn: "Advertising starts from Rs. 700 for a Standard 7-day listing. Premium listings (Rs. 1,400) receive 24h spotlight placement. Platinum listings (Rs. 5,000) receive 3-day top placement. All tiers are active for 7 days total.",
        displayOrder: 5,
      },
    ],
  },
  "boys-personal": {
    editorialTitle: "Boys Personal Ads & Male Services in Sri Lanka",
    editorialText: "Browse Lankan Ads' Boys Personal section — a verified directory of individual male service providers and companion listings across Sri Lanka. Whether you are looking for providers in Colombo, Kandy, Galle, or any other district, our platform maintains a curated list of verified male advertisers. Every account is verified via SMS OTP to ensure authenticity. Browse provider profiles to view service areas, hosting options (place available, home/hotel visit, or both), pricing details, and direct WhatsApp contact buttons.",
    faqs: [
      {
        id: "cat-faq-bp-1",
        questionEn: "What services are listed under Boys Personal on Lankan Ads?",
        answerEn: "Boys Personal includes verified listings from individual male service providers and companions across Sri Lanka. Listings cover place-available providers, home/hotel visit options, and those offering both.",
        displayOrder: 1,
      },
      {
        id: "cat-faq-bp-2",
        questionEn: "Are Boys Personal listings verified on Lankan Ads?",
        answerEn: "Yes. All advertisers must verify their Sri Lankan mobile number via SMS OTP. Our admin team also reviews all submitted ads and images before they go live on the platform.",
        displayOrder: 2,
      },
      {
        id: "cat-faq-bp-3",
        questionEn: "How do I find a Boys Personal provider in Colombo?",
        answerEn: "Navigate to the Boys Personal category and use the district filter to select Colombo. You can also visit the dedicated Boys Personal in Colombo page to see all active listings in that area.",
        displayOrder: 3,
      },
      {
        id: "cat-faq-bp-4",
        questionEn: "Can I contact a Boys Personal provider directly?",
        answerEn: "Yes. Every listing has a direct WhatsApp chat button and call button. Lankan Ads never charges clients or acts as a middleman — all contact is direct between client and provider.",
        displayOrder: 4,
      },
    ],
  },
  "spa-wellness": {
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
      {
        id: "cat-faq-sw-3",
        questionEn: "Are spa listings on Lankan Ads legitimate businesses?",
        answerEn: "Yes. Spa & Wellness listings on Lankan Ads represent physical commercial establishments, Ayurvedic centers, and therapeutic massage providers. All accounts are SMS-verified and manually reviewed.",
        displayOrder: 3,
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
      {
        id: "cat-faq-lc-3",
        questionEn: "What platforms are used for live cam shows?",
        answerEn: "Most providers on Lankan Ads offer sessions via WhatsApp video calls, Telegram calls, or Skype. Check each provider's listing for their available platforms and pricing.",
        displayOrder: 3,
      },
    ],
  },
  "cuckold-couples": {
    editorialTitle: "Cuckold Couples Listings & Services in Sri Lanka",
    editorialText: "Lankan Ads' Cuckold Couples section features verified couple listings from across Sri Lanka. All advertiser accounts are verified via mobile SMS OTP, and every submitted listing undergoes manual admin review. Browse couples in Colombo, Gampaha, Kandy, Galle, and other major districts. Each listing includes location details (place-available, home/hotel visit, or both), contact hours, pricing, and a direct WhatsApp contact button.",
    faqs: [
      {
        id: "cat-faq-cc-1",
        questionEn: "What is the Cuckold Couples category on Lankan Ads?",
        answerEn: "This category features verified listings from couples in Sri Lanka who offer adult companionship services. All listings are by consenting adults and every advertiser account is SMS-verified.",
        displayOrder: 1,
      },
      {
        id: "cat-faq-cc-2",
        questionEn: "How do I contact a couple listed in this category?",
        answerEn: "Click any listing to view the full ad details page. Use the WhatsApp chat button or direct call button to contact the couple. Lankan Ads does not act as a middleman.",
        displayOrder: 2,
      },
      {
        id: "cat-faq-cc-3",
        questionEn: "Are Cuckold Couples listings available across Sri Lanka?",
        answerEn: "Yes, listings are available across multiple districts in Sri Lanka. Use the district filter on the category page to find couples in your area.",
        displayOrder: 3,
      },
    ],
  },
  "shemale-personal": {
    editorialTitle: "Shemale & Transgender Personal Listings in Sri Lanka",
    editorialText: "Browse verified transgender and shemale personal service listings on Lankan Ads. Our platform provides a safe, verified directory for transgender individuals in Sri Lanka offering personal services. All advertisers verify their identity via SMS OTP and listings are individually reviewed by our moderation team. Find providers across Colombo, Kandy, Galle, Gampaha, and other districts with direct WhatsApp contact information.",
    faqs: [
      {
        id: "cat-faq-sm-1",
        questionEn: "What is the Shemale Personal category on Lankan Ads?",
        answerEn: "This category features verified listings from transgender and shemale individuals in Sri Lanka offering personal services. All advertisers are SMS-verified and listings are manually reviewed.",
        displayOrder: 1,
      },
      {
        id: "cat-faq-sm-2",
        questionEn: "How are shemale listings verified on Lankan Ads?",
        answerEn: "Every advertiser registers with a valid Sri Lankan mobile number verified via OTP. All submitted photos and descriptions are manually reviewed by our admin team before the ad goes live.",
        displayOrder: 2,
      },
      {
        id: "cat-faq-sm-3",
        questionEn: "In which cities are Shemale Personal services available?",
        answerEn: "Services are available across Sri Lanka. Active listings exist in Colombo, Gampaha, Kandy, Galle, Negombo, and other major cities and districts.",
        displayOrder: 3,
      },
    ],
  },
  "gay": {
    editorialTitle: "Gay Personal Services & Listings in Sri Lanka",
    editorialText: "The Gay Personal category on Lankan Ads provides a discreet, verified directory of male-to-male personal service listings and companionship across Sri Lanka. All advertisers are verified by SMS OTP during registration and every listing is reviewed by our admin team. Browse active listings in Colombo, Kandy, Gampaha, Galle, and other districts. Each profile includes service details, availability, and direct WhatsApp contact buttons for private, direct communication.",
    faqs: [
      {
        id: "cat-faq-gay-1",
        questionEn: "What types of listings are in the Gay category on Lankan Ads?",
        answerEn: "The Gay category includes verified male-to-male personal service listings, companionship, and social service providers across Sri Lanka, filtered by place-available and place-unavailable options.",
        displayOrder: 1,
      },
      {
        id: "cat-faq-gay-2",
        questionEn: "Is the Gay category on Lankan Ads discreet?",
        answerEn: "Yes. Lankan Ads is a private platform. Your browsing is not shared. Advertisers control what information they display in their listings. Contact with providers is direct via WhatsApp.",
        displayOrder: 2,
      },
      {
        id: "cat-faq-gay-3",
        questionEn: "Are Gay listings verified?",
        answerEn: "Yes. All Gay Personal listings require SMS OTP mobile verification and pass through our manual moderation queue before going live on the platform.",
        displayOrder: 3,
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
      {
        id: "cat-faq-mp-3",
        questionEn: "What is the cost to post a marriage proposal on Lankan Ads?",
        answerEn: "Matrimonial listings follow the same pricing as other categories: Standard Rs. 700, Premium Rs. 1,400, or Platinum Rs. 5,000 — all valid for 7 days with different visibility levels.",
        displayOrder: 3,
      },
      {
        id: "cat-faq-mp-4",
        questionEn: "Are there separate sections for brides and grooms?",
        answerEn: "Yes. The Marriage Proposals category has two sub-categories: Brides (female profiles seeking marriage) and Grooms (male profiles seeking marriage). You can browse each separately.",
        displayOrder: 4,
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
  const pageUrl = `${SITE_CONFIG.url}/${category.slug}`;
  const schemas: any[] = [
    generateCollectionPageSchema(category),
    generateItemListSchema(ads, category.name, pageUrl),
    generateClassifiedAdListingSchema(category.name, undefined, ads.length, pageUrl),
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
