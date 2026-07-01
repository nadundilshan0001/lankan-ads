"use client";





import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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

  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[activeIdx] : null;
  const isImageFailed = currentImage ? failedImages[currentImage.id] : false;

  return (
    <div className={styles.gallery}>
      {}
      <div
        className={styles.mainImage}
        onClick={() => hasImages && !isImageFailed && setLightboxOpen(true)}
        style={{ cursor: hasImages && !isImageFailed ? "zoom-in" : "default" }}
      >
        {currentImage && !isImageFailed ? (
          <Image
            src={currentImage.cloudinaryUrl}
            alt={`${titleEn} - view ${activeIdx + 1}`}
            width={800}
            height={600}
            className={styles.mainImg}
            sizes="(max-width: 768px) 100vw, 800px"
            priority
            onError={() => setFailedImages((prev) => ({ ...prev, [currentImage.id]: true }))}
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

      {}
      {hasImages && images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((img, idx) => {
            const isThumbFailed = failedImages[img.id];
            return (
              <div
                key={img.id}
                className={`${styles.thumbnail} ${idx === activeIdx ? styles.activeThumbnail : ""}`}
                onClick={() => setActiveIdx(idx)}
              >
                {!isThumbFailed ? (
                  <Image
                    src={img.cloudinaryUrl}
                    alt={`${titleEn} thumbnail ${idx + 1}`}
                    width={100}
                    height={75}
                    className={styles.thumbImg}
                    sizes="100px"
                    onError={() => setFailedImages((prev) => ({ ...prev, [img.id]: true }))}
                  />
                ) : (
                  <div className={styles.placeholderIcon} style={{ fontSize: "1.5rem" }}>
                    {categoryIcon || ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {}
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
            {}
            <Image
              src={currentImage.cloudinaryUrl}
              alt={`${titleEn} - large view ${activeIdx + 1}`}
              width={1200}
              height={900}
              className={styles.lightboxImg}
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
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
