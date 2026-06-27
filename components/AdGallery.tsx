"use client";

// ============================================================
// Lankan Ads — Ad Gallery Client Component (with Lightbox)
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import { AdImage } from "@/lib/types";
import styles from "./AdGallery.module.css";

interface AdGalleryProps {
  images: AdImage[];
  titleEn: string;
  adTier: string;
  categoryIcon?: string;
}

export default function AdGallery({ images, titleEn, adTier, categoryIcon }: AdGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    setActiveIdx((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handleClose = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Keyboard navigation controls
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, handlePrev, handleNext, handleClose]);

  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[activeIdx] : null;

  return (
    <div className={styles.gallery}>
      {/* Main Image View */}
      <div
        className={styles.mainImage}
        onClick={() => hasImages && setLightboxOpen(true)}
        style={{ cursor: hasImages ? "zoom-in" : "default" }}
      >
        {currentImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentImage.cloudinaryUrl}
            alt={`${titleEn} - view ${activeIdx + 1}`}
            className={styles.mainImg}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>{categoryIcon || ""}</span>
            <span className={styles.placeholderText}>Ad Image</span>
          </div>
        )}
        <span className={`badge badge-${adTier} ${styles.tierBadge}`}>
          {adTier.charAt(0).toUpperCase() + adTier.slice(1)}
        </span>
      </div>

      {/* Thumbnails list */}
      {hasImages && images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`${styles.thumbnail} ${idx === activeIdx ? styles.activeThumbnail : ""}`}
              onClick={() => setActiveIdx(idx)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.cloudinaryUrl}
                alt={`${titleEn} thumbnail ${idx + 1}`}
                className={styles.thumbImg}
              />
            </div>
          ))}
        </div>
      )}

      {/* Full-Screen Lightbox Overlay */}
      {lightboxOpen && currentImage && (
        <div className={styles.lightbox} onClick={handleClose}>
          <button
            className={styles.closeBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label="Close image viewer"
          >
            ✕
          </button>

          {images.length > 1 && (
            <button
              className={`${styles.navBtn} ${styles.prevBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          <div className={styles.lightboxImageContainer} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage.cloudinaryUrl}
              alt={`${titleEn} - large view ${activeIdx + 1}`}
              className={styles.lightboxImg}
            />
            <div className={styles.lightboxCaption}>
              {activeIdx + 1} / {images.length}
            </div>
          </div>

          {images.length > 1 && (
            <button
              className={`${styles.navBtn} ${styles.nextBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
