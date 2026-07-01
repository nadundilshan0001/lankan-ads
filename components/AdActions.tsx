"use client";





import { useState, useEffect } from "react";
import styles from "./AdActions.module.css";

interface AdActionsProps {
  adId: string;
  title: string;
  initialLikes?: number;
}

export default function AdActions({ adId, title, initialLikes = 0 }: AdActionsProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const likedAds = JSON.parse(localStorage.getItem("lankan_ads_liked_ads") || "[]");
    if (likedAds.includes(adId)) {
      setLiked(true);
    }
  }, [adId]);

  const handleLike = async () => {
    const likedAds = JSON.parse(localStorage.getItem("lankan_ads_liked_ads") || "[]");
    const isLiking = !liked;

    
    setLiked(isLiking);
    setLikeCount((prev) => (isLiking ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`/api/ads/${adId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isLiking ? "like" : "unlike" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLikeCount(data.likeCount);

        if (isLiking) {
          if (!likedAds.includes(adId)) likedAds.push(adId);
        } else {
          const idx = likedAds.indexOf(adId);
          if (idx > -1) likedAds.splice(idx, 1);
        }
        localStorage.setItem("lankan_ads_liked_ads", JSON.stringify(likedAds));
      } else {
        
        setLiked(!isLiking);
        setLikeCount((prev) => (isLiking ? prev - 1 : prev + 1));
        if (data.error) alert(data.error);
      }
    } catch {
      
      setLiked(!isLiking);
      setLikeCount((prev) => (isLiking ? prev - 1 : prev + 1));
    }
  };

  const handleSave = () => setSaved((prev) => !prev);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        
      }
    } else {
      
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className={styles.adActions} id={`ad-actions-${adId}`}>
      <button
        id={`like-btn-${adId}`}
        className={`${styles.actionBtn} ${liked ? styles.liked : ""}`}
        onClick={handleLike}
        aria-label={liked ? "Unlike this ad" : "Like this ad"}
        aria-pressed={liked}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span>{liked ? "Liked" : "Like"} ({likeCount})</span>
      </button>

      <button
        id={`save-btn-${adId}`}
        className={`${styles.actionBtn} ${saved ? styles.saved : ""}`}
        onClick={handleSave}
        aria-label={saved ? "Unsave this ad" : "Save this ad"}
        aria-pressed={saved}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <span>{saved ? "Saved" : "Save"}</span>
      </button>

      <button
        id={`share-btn-${adId}`}
        className={`${styles.actionBtn} ${shared ? styles.shareSuccess : ""}`}
        onClick={handleShare}
        aria-label="Share this ad"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        <span>{shared ? "Copied!" : "Share"}</span>
      </button>
    </div>
  );
}
