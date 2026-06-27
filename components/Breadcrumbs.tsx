// ============================================================
// Lankan Ads — Breadcrumbs Component (with BreadcrumbList schema)
// ============================================================

import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";
import SchemaMarkup from "./SchemaMarkup";
import styles from "./Breadcrumbs.module.css";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schemaItems = [
    { name: "Home", url: SITE_CONFIG.url },
    ...items.map((item) => ({
      name: item.label,
      url: `${SITE_CONFIG.url}${item.href}`,
    })),
  ];

  return (
    <>
      <SchemaMarkup data={generateBreadcrumbSchema(schemaItems)} />
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <ol className={styles.list}>
          <li className={styles.item}>
            <Link href="/" className={styles.link}>
              Home
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={item.href} className={styles.item}>
              <span className={styles.separator}>›</span>
              {index === items.length - 1 ? (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
