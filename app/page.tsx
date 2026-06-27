// ============================================================
// Lankan Ads — Root Search & Catalog Browse Page (SSR)
// ============================================================

import React from "react";
import { generateHomeMetadata } from "@/lib/seo/meta-tags";
import { getAllActiveAds } from "@/lib/db/queries";
import ListingsFilter from "@/components/ListingsFilter";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = generateHomeMetadata();

export default async function BrowsePage() {
  const allAds = await getAllActiveAds();

  return (
    <div className="container" style={{ paddingTop: "var(--space-xl)" }}>
      {/* Dynamic SEO Breadcrumbs */}
      <Breadcrumbs items={[]} />

      {/* Directory Title */}
      <header style={{ marginBottom: "var(--space-md)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "800", marginBottom: "0.25rem" }}>
          Browse Classified Ads
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          Find personal services, spa wellness, matrimonies, and web camera providers across Sri Lanka
        </p>
      </header>

      {/* Filters and Listings */}
      <ListingsFilter initialAds={allAds} />
    </div>
  );
}
