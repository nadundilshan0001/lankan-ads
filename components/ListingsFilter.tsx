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

  
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 100;

  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedDistrict, selectedTiers, sortBy]);

  
  const activeCategory = useMemo(() => {
    return CATEGORIES.find((cat) => cat.slug === selectedCategory);
  }, [selectedCategory]);

  
  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedSubCategory(""); 
  };

  
  const handleTierToggle = (tierName: string) => {
    if (selectedTiers.includes(tierName)) {
      if (selectedTiers.length > 1) {
        setSelectedTiers(selectedTiers.filter((t) => t !== tierName));
      }
    } else {
      setSelectedTiers([...selectedTiers, tierName]);
    }
  };

  
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedDistrict("");
    setSelectedTiers(["platinum", "premium", "standard"]);
    setSortBy("latest");
  };

  
  const processedAds = useMemo(() => {
    
    const filtered = initialAds.filter((ad) => {
      
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const titleMatch = ad.titleEn.toLowerCase().includes(query) || (ad.titleSi && ad.titleSi.toLowerCase().includes(query));
        const descMatch = ad.descriptionEn.toLowerCase().includes(query) || (ad.descriptionSi && ad.descriptionSi.toLowerCase().includes(query));
        const cityMatch = ad.city.toLowerCase().includes(query) || ad.district.toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !cityMatch) return false;
      }

      
      if (selectedCategory && ad.category !== selectedCategory) {
        return false;
      }

      
      if (selectedSubCategory && ad.subCategory !== selectedSubCategory) {
        return false;
      }

      
      if (selectedDistrict && ad.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }

      
      if (!selectedTiers.includes(ad.adTier)) {
        return false;
      }

      return true;
    });

    
    const tierWeight = { platinum: 1, premium: 2, standard: 3 };
    
    return filtered.sort((a, b) => {
      
      if (a.adTier !== b.adTier) {
        return tierWeight[a.adTier] - tierWeight[b.adTier];
      }

      
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

      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [initialAds, searchQuery, selectedCategory, selectedSubCategory, selectedDistrict, selectedTiers, sortBy]);

  
  const totalPages = Math.ceil(processedAds.length / adsPerPage) || 1;
  const paginatedAds = useMemo(() => {
    const startIndex = (currentPage - 1) * adsPerPage;
    return processedAds.slice(startIndex, startIndex + adsPerPage);
  }, [processedAds, currentPage, adsPerPage]);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.6;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={styles.container}>
      {/* Category Bar */}
      <div className={styles.categoryBarWrapper}>
        <button 
          onClick={() => scroll("left")} 
          className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
          aria-label="Scroll left"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        
        <div ref={scrollRef} className={styles.categoryBarTabs}>
          <button
            onClick={() => handleCategoryChange("")}
            className={`${styles.categoryTab} ${selectedCategory === "" ? styles.categoryTabActive : ""}`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`${styles.categoryTab} ${selectedCategory === cat.slug ? styles.categoryTabActive : ""}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <button 
          onClick={() => scroll("right")} 
          className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
          aria-label="Scroll right"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <aside className={`${styles.sidebar} ${showMobileFilters ? styles.sidebarOpen : ""}`}>
        {}
        <div className={styles.sidebarResultsHeader}>
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

        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Filters</span>
          <button onClick={handleClearFilters} className={styles.clearBtn}>
            Clear All
          </button>
        </div>

        {}
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

        {}
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

        {}
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

        {}
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

        {}
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

      {}
      <main className={styles.mainContent}>
        <button
          className={styles.mobileFilterToggle}
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <span style={{ marginRight: "6px" }}>⚙</span>
          {showMobileFilters ? "Hide Filters" : "Filter Listings"}
        </button>



        {}
        {paginatedAds.length > 0 ? (
          <>
            <div className={styles.adGrid}>
              {paginatedAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>

            {}
            {totalPages >= 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`${styles.pageBtn} ${currentPage === 1 ? styles.pageBtnDisabled : ""}`}
                >
                  Previous
                </button>
                <div className={styles.pageNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`${styles.pageNumBtn} ${currentPage === pageNum ? styles.pageNumBtnActive : ""}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
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
