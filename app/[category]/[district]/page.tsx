



import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES, DISTRICTS, SITE_CONFIG } from "@/lib/constants";
import {
  generateCategoryMetadata,
  generateSubCategoryMetadata,
} from "@/lib/seo/meta-tags";
import {
  generateCollectionPageSchema,
  generateSubCategoryCollectionSchema,
  generateItemListSchema,
  generateFAQSchema,
} from "@/lib/seo/structured-data";
import { getAdsByCategoryAndSubcategory, getAdsByCategoryAndDistrict } from "@/lib/db/queries";
import SchemaMarkup from "@/components/SchemaMarkup";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdCard from "@/components/AdCard";
import styles from "./page.module.css";
import type { FAQ } from "@/lib/types";

interface PageProps {
  params: Promise<{ category: string; district: string }>;
}


async function getPageType(categorySlug: string, districtParam: string) {
  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) return null;

  
  const subCategory = category.subCategories.find((sub) => sub.slug === districtParam);
  if (subCategory) {
    return { type: "subcategory" as const, category, subCategory };
  }

  
  const districtName = DISTRICTS.find(
    (d) => d.toLowerCase().replace(/\s+/g, "-") === districtParam.toLowerCase()
  );
  if (districtName) {
    return { type: "district" as const, category, districtName };
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug, district: districtParam } = await params;
  const pageInfo = await getPageType(categorySlug, districtParam);

  if (!pageInfo) return {};

  if (pageInfo.type === "subcategory") {
    return generateSubCategoryMetadata(pageInfo.category, pageInfo.subCategory);
  } else {
    return generateCategoryMetadata(pageInfo.category, pageInfo.districtName);
  }
}

export function generateStaticParams() {
  const params: { category: string; district: string }[] = [];

  
  CATEGORIES.forEach((cat) => {
    cat.subCategories.forEach((sub) => {
      params.push({ category: cat.slug, district: sub.slug });
    });
  });

  
  CATEGORIES.forEach((cat) => {
    DISTRICTS.forEach((dist) => {
      params.push({
        category: cat.slug,
        district: dist.toLowerCase().replace(/\s+/g, "-"),
      });
    });
  });

  return params;
}

export default async function SubCategoryOrDistrictPage({ params }: PageProps) {
  const { category: categorySlug, district: districtParam } = await params;
  const pageInfo = await getPageType(categorySlug, districtParam);

  if (!pageInfo) {
    notFound();
  }

  const { category } = pageInfo;
  let pageTitle = "";
  let pageDescription = "";
  let editorialTitle = "";
  let editorialText = "";
  let breadcrumbs: { label: string; href: string }[] = [];
  let ads = [];
  const pageUrl = `${SITE_CONFIG.url}/${category.slug}/${districtParam}`;
  let pageFaqs: FAQ[] = [];
  let schemaData: any[] = [];

  if (pageInfo.type === "subcategory") {
    const { subCategory } = pageInfo;
    pageTitle = `${category.name} — ${subCategory.name}`;
    pageDescription = `Browse verified listings under ${category.name.toLowerCase()} (${subCategory.name.toLowerCase()}) in Sri Lanka.`;
    breadcrumbs = [
      { label: category.name, href: `/${category.slug}` },
      { label: subCategory.name, href: `/${category.slug}/${subCategory.slug}` },
    ];
    
    
    ads = await getAdsByCategoryAndSubcategory(category.slug, subCategory.id);

    editorialTitle = `About ${category.name} - ${subCategory.name} Services in Sri Lanka`;
    editorialText = `Welcome to the dedicated directory for ${category.name} ${subCategory.name} services on Lankan Ads. In the Sri Lankan local market, individuals seeking independent female, male, or transgender providers have specific preferences regarding availability and location. Our ${subCategory.name} sub-category features active ads from verified providers who offer services conforming to this location type (whether they host at their own private place, travel to client locations like homes and hotels, or both). We recommend checking provider profiles, reading their descriptions carefully, and contacting them directly via the WhatsApp links or direct phone numbers provided in their listings.`;

    
    pageFaqs = [
      {
        id: `faq-sub-1-${subCategory.id}`,
        questionEn: `What does the ${subCategory.name} sub-category mean under ${category.name}?`,
        answerEn: `The ${subCategory.name} sub-category filters providers under ${category.name} who offer services under the location option: "${subCategory.description}". This helps you browse only those listings that match your location requirements.`,
        displayOrder: 1,
      },
      {
        id: `faq-sub-2-${subCategory.id}`,
        questionEn: `How do I contact a provider listed under ${category.name} ${subCategory.name}?`,
        answerEn: `You can contact any provider directly by clicking the "Chat on WhatsApp" or "Call Now" button on their individual ad detail page. Lankan Ads does not act as an agent or middleman, ensuring direct communication.`,
        displayOrder: 2,
      },
    ];

    schemaData = [
      generateSubCategoryCollectionSchema(category, subCategory),
      generateItemListSchema(ads, `${category.name} - ${subCategory.name}`, pageUrl),
      generateFAQSchema(pageFaqs),
    ];
  } else {
    const { districtName } = pageInfo;
    pageTitle = `${category.name} in ${districtName}`;
    pageDescription = `Find active ${category.name.toLowerCase()} listings and services in ${districtName}, Sri Lanka.`;
    breadcrumbs = [
      { label: category.name, href: `/${category.slug}` },
      { label: districtName, href: `/${category.slug}/${districtParam}` },
    ];

    
    ads = await getAdsByCategoryAndDistrict(category.slug, districtParam);

    editorialTitle = `Browse ${category.name} Services in ${districtName}, Sri Lanka`;
    editorialText = `Discover leading local providers and businesses offering ${category.name.toLowerCase()} services in the ${districtName} district. As Sri Lanka's premium advertising platform, Lankan Ads serves the entire ${districtName} region, including major towns and suburbs. Every advertisement is posted by a local provider and reviewed by our administration. By choosing to search locally within ${districtName}, you can easily find providers close to you, minimizing travel and facilitating quick bookings. Check active listings to view rates, verified images, and direct WhatsApp contact details.`;

    
    pageFaqs = [
      {
        id: `faq-dist-1-${districtParam}`,
        questionEn: `How many ${category.name} listings are active in ${districtName}?`,
        answerEn: `Currently, we have ${ads.length} active listings under ${category.name} in the ${districtName} district. Our directory is updated regularly with new verified service providers.`,
        displayOrder: 1,
      },
      {
        id: `faq-dist-2-${districtParam}`,
        questionEn: `Where in ${districtName} are these services available?`,
        answerEn: `Services are available across various cities and suburbs in ${districtName}. You can view the specific service area, city, and neighborhood details on each individual ad listing.`,
        displayOrder: 2,
      },
      {
        id: `faq-dist-3-${districtParam}`,
        questionEn: `How do I filter ads by sub-category in ${districtName}?`,
        answerEn: `You can view category-wide sub-categories (like Place Available or Home/Hotel Visit) on the main ${category.name} category page, or filter listings in ${districtName} by reviewing the location details on each ad card.`,
        displayOrder: 3,
      },
    ];

    schemaData = [
      generateCollectionPageSchema(category, districtName),
      generateItemListSchema(ads, `${category.name} in ${districtName}`, pageUrl),
      generateFAQSchema(pageFaqs),
    ];
  }

  const platinumAds = ads.filter((ad) => ad.adTier === "platinum");
  const premiumAds = ads.filter((ad) => ad.adTier === "premium");
  const standardAds = ads.filter((ad) => ad.adTier === "standard");

  return (
    <>
      <SchemaMarkup data={schemaData} />

      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbs} />

        {}
        <section className={styles.header}>
          <div className={styles.headerContent}>
            <span className={styles.headerIcon}>{category.icon}</span>
            <div>
              <h1 className={styles.title}>{pageTitle}</h1>
              <p className={styles.description}>{pageDescription}</p>
              <p className={styles.adCount}>
                {ads.length} active listing{ads.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
        </section>

        {}
        <section className={styles.editorialSection} id="editorial-content">
          <h2 className={styles.editorialTitle}>{editorialTitle}</h2>
          <p className={styles.editorialText}>{editorialText}</p>
        </section>

        {}
        {platinumAds.length > 0 && (
          <section className={styles.tierSection}>
            <div className={styles.tierHeader}>
              <span className="badge badge-platinum">Platinum</span>
              <h2 className={styles.tierTitle}>Platinum Spotlight</h2>
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
              <h2 className={styles.tierTitle}>Premium Spotlight</h2>
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
              <h2 className={styles.tierTitle}>Latest Listings</h2>
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
            <p>No active listings found matching this criteria yet.</p>
            <Link href="/post-ad" className="btn btn-primary">
              Be the first — Post an Ad
            </Link>
          </section>
        )}

        {}
        {pageFaqs.length > 0 && (
          <section className={styles.faqSection} id="faqs">
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              {pageFaqs.map((faq) => (
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
