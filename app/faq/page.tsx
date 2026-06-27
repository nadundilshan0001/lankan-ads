// ============================================================
// Lankan Ads — FAQ Page
// ============================================================

import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { getFaqs } from "@/lib/db/queries";
import { generateFAQSchema } from "@/lib/seo/structured-data";
import SchemaMarkup from "@/components/SchemaMarkup";
import Breadcrumbs from "@/components/Breadcrumbs";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `Frequently Asked Questions — ${SITE_CONFIG.name}`,
  description:
    "Find answers to common questions about posting ads, pricing tiers, payment methods, and browsing services on Lankan Ads — Sri Lanka's premier classified ads platform.",
  alternates: { canonical: `${SITE_CONFIG.url}/faq` },
};

export default async function FAQPage() {
  const faqs = await getFaqs();
  return (
    <>
      <SchemaMarkup data={generateFAQSchema(faqs)} />

      <div className="container">
        <Breadcrumbs items={[{ label: "FAQ", href: "/faq" }]} />

        <section className={styles.faqPage}>
          <div className={styles.header}>
            <h1>Frequently Asked Questions</h1>
            <p>
              Everything you need to know about using Lankan Ads — from posting
              your first ad to choosing the right pricing tier.
            </p>
          </div>

          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details key={faq.id} className={styles.faqItem} id={`faq-${faq.id}`}>
                <summary className={styles.faqQuestion}>
                  <h2 className={styles.questionText}>{faq.questionEn}</h2>
                </summary>
                <div className={styles.faqAnswer}>
                  <p>{faq.answerEn}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
