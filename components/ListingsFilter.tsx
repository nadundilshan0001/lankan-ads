"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CATEGORIES, DISTRICTS } from "@/lib/constants";
import { Ad } from "@/lib/types";
import AdCard from "./AdCard";
import styles from "./ListingsFilter.module.css";

interface ListingsFilterProps {
  initialAds: Ad[];
}

export default function ListingsFilter({ initialAds }: ListingsFilterProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTiers, setSelectedTiers] = useState<string[]>([
    "platinum",
    "premium",
    "standard",
  ]);
  const [sortBy, setSortBy] = useState("latest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 100;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedDistrict, selectedTiers, sortBy]);

  // Get subcategories of active category
  const activeCategory = useMemo(() => {
    return CATEGORIES.find((cat) => cat.slug === selectedCategory);
  }, [selectedCategory]);

  // Reset subcategory if parent category is changed
  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedSubCategory(""); // Reset sub-cat selection
  };

  // Toggle tiers checkboxes
  const handleTierToggle = (tierName: string) => {
    if (selectedTiers.includes(tierName)) {
      if (selectedTiers.length > 1) {
        setSelectedTiers(selectedTiers.filter((t) => t !== tierName));
      }
    } else {
      setSelectedTiers([...selectedTiers, tierName]);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedDistrict("");
    setSelectedTiers(["platinum", "premium", "standard"]);
    setSortBy("latest");
  };

  // Filter & Sort Logic
  const processedAds = useMemo(() => {
    // 1. Filter
    const filtered = initialAds.filter((ad) => {
      // Full-text Search Match (En & Si)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const titleMatch = ad.titleEn.toLowerCase().includes(query) || (ad.titleSi && ad.titleSi.toLowerCase().includes(query));
        const descMatch = ad.descriptionEn.toLowerCase().includes(query) || (ad.descriptionSi && ad.descriptionSi.toLowerCase().includes(query));
        const cityMatch = ad.city.toLowerCase().includes(query) || ad.district.toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !cityMatch) return false;
      }

      // Category match
      if (selectedCategory && ad.category !== selectedCategory) {
        return false;
      }

      // Subcategory match
      if (selectedSubCategory && ad.subCategory !== selectedSubCategory) {
        return false;
      }

      // District match
      if (selectedDistrict && ad.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }

      // Ad tier match
      if (!selectedTiers.includes(ad.adTier)) {
        return false;
      }

      return true;
    });

    // 2. Sort (Prioritize Platinum and Premium, then apply secondary sorting)
    const tierWeight = { platinum: 1, premium: 2, standard: 3 };
    
    return filtered.sort((a, b) => {
      // Spotlight weight remains dominant
      if (a.adTier !== b.adTier) {
        return tierWeight[a.adTier] - tierWeight[b.adTier];
      }

      // Apply secondary sort options inside same tiers
      if (sortBy === "popular") {
        return b.viewCount - a.viewCount;
      }

      if (sortBy === "price_asc") {
        const getPrice = (ad: Ad) => {
          const num = (ad.priceRange || "").replace(/[^0-9]/g, "");
          return num ? parseInt(num, 10) : 0;
        };
        return getPrice(a) - getPrice(b);
      }

      if (sortBy === "price_desc") {
        const getPrice = (ad: Ad) => {
          const num = (ad.priceRange || "").replace(/[^0-9]/g, "");
          return num ? parseInt(num, 10) : 0;
        };
        return getPrice(b) - getPrice(a);
      }

      // Default: Latest (created_at desc)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [initialAds, searchQuery, selectedCategory, selectedSubCategory, selectedDistrict, selectedTiers, sortBy]);

  // Compute total pages and paginated slice of ads
  const totalPages = Math.ceil(processedAds.length / adsPerPage) || 1;
  const paginatedAds = useMemo(() => {
    const startIndex = (currentPage - 1) * adsPerPage;
    return processedAds.slice(startIndex, startIndex + adsPerPage);
  }, [processedAds, currentPage, adsPerPage]);

  return (
    <div className={styles.container}>
      {/* ===== FILTER SIDEBAR (LEFT) ===== */}
      <aside className={`${styles.sidebar} ${showMobileFilters ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Filters</span>
          <button onClick={handleClearFilters} className={styles.clearBtn}>
            Clear All
          </button>
        </div>

        {/* 1. Keyword Search */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Search keyword</label>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Type query or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 2. Category Dropdown */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Category</label>
          <select
            className={styles.selectInput}
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Sub-Category (Conditional) */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Service Type</label>
          <select
            className={styles.selectInput}
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            disabled={!selectedCategory || !activeCategory?.subCategories.length}
          >
            <option value="">All Types</option>
            {activeCategory?.subCategories.map((sub) => (
              <option key={sub.id} value={sub.slug}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. District Select */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>District Location</label>
          <select
            className={styles.selectInput}
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="">All Districts</option>
            {DISTRICTS.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Tiers Checkboxes */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Visibility Tiers</label>
          <div className={styles.checkboxList}>
            {["platinum", "premium", "standard"].map((tier) => (
              <label key={tier} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={selectedTiers.includes(tier)}
                  onChange={() => handleTierToggle(tier)}
                />
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* ===== CATALOG PANEL (RIGHT) ===== */}
      <main className={styles.mainContent}>
        <button
          className={styles.mobileFilterToggle}
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <span style={{ marginRight: "6px" }}>⚙</span>
          {showMobileFilters ? "Hide Filters" : "Filter Listings"}
        </button>

        {/* Results Header */}
        <div className={styles.contentHeader}>
          <div className={styles.resultCount}>
            Showing <span className={styles.resultCountHighlight}>{processedAds.length}</span> active listing{processedAds.length !== 1 ? "s" : ""}
          </div>

          <div className={styles.sortWrapper}>
            <span className={styles.sortLabel}>Sort by</span>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="latest">Latest Postings</option>
              <option value="popular">Most Viewed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Grid / Empty State */}
        {paginatedAds.length > 0 ? (
          <>
            <div className={styles.adGrid}>
              {paginatedAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`${styles.pageBtn} ${currentPage === 1 ? styles.pageBtnDisabled : ""}`}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`${styles.pageBtn} ${currentPage === totalPages ? styles.pageBtnDisabled : ""}`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No Matching Listings Found</h3>
            <p className={styles.emptyText}>
              There are no active advertisements fitting your current search parameters. Clear filters or broaden your query to browse other listings.
            </p>
            <button onClick={handleClearFilters} className="btn btn-primary">
              Reset All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
