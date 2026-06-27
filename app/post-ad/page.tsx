"use client";

// ============================================================
// Lankan Ads — Ad Creation & Posting Page (Client Component)
// ============================================================

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, DISTRICTS, TIERS } from "@/lib/constants";
import styles from "./page.module.css";

export default function PostAdPage() {
  const router = useRouter();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userPhone, setUserPhone] = useState<string>("");

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  
  const [titleEn, setTitleEn] = useState<string>("");
  const [titleSi, setTitleSi] = useState<string>("");
  const [descriptionEn, setDescriptionEn] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [availabilityHours, setAvailabilityHours] = useState<string>("");
  
  // Image Upload State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Tier selection
  const [selectedTier, setSelectedTier] = useState<"standard" | "premium" | "platinum">("standard");
  
  // Modals / Progress states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasPostedAds, setHasPostedAds] = useState<boolean>(true); // default to true, check on mount

  // Check login state
  useEffect(() => {
    const token = localStorage.getItem("lankan_ads_token");
    const phone = localStorage.getItem("lankan_ads_phone");
    if (!token) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
      if (phone) setUserPhone(phone);
      checkFirstAdStatus(token);
    }
  }, []);

  const checkFirstAdStatus = async (token: string) => {
    try {
      const res = await fetch("/api/ads", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.ads) {
        setHasPostedAds(data.ads.length > 0);
      }
    } catch (err) {
      console.error("Failed to check first ad status:", err);
    }
  };

  // Handle image selection simulation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (uploadedImages.length + filesArray.length > 5) {
        setError("You can upload a maximum of 5 images.");
        return;
      }
      
      const newImages = [...uploadedImages];
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            setUploadedImages([...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
      setError("");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedCategory) {
      setError("Please select a category.");
      return;
    }

    const categoryObj = CATEGORIES.find(c => c.id === selectedCategory);
    if (categoryObj && categoryObj.subCategories.length > 0 && !selectedSubCategory) {
      setError("Please select a sub-category.");
      return;
    }

    if (!titleEn.trim()) {
      setError("Please enter a title in English.");
      return;
    }

    if (!descriptionEn.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (!contactNumber.trim()) {
      setError("Please enter a contact number.");
      return;
    }

    if (!district) {
      setError("Please select a district.");
      return;
    }

    if (!city.trim()) {
      setError("Please enter a city.");
      return;
    }

    if (selectedTier === "standard" && !hasPostedAds) {
      // First standard ad is free: bypass payment simulator checkout
      executePayment();
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const uploadImageToCloudinary = async (base64Data: string): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "lankan-ads-unsigned";
    
    if (!cloudName) {
      throw new Error("Cloudinary Cloud Name is not configured");
    }

    const formData = new FormData();
    formData.append("file", base64Data);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || "Failed to upload image to Cloudinary");
    }

    const data = await res.json();
    return data.secure_url;
  };

  // Real PayHere & Cloudinary & Database execution
  const executePayment = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // 1. Upload images to Cloudinary in parallel
      const cloudinaryUrls = await Promise.all(
        uploadedImages.map((base64) => uploadImageToCloudinary(base64))
      );

      // 2. Submit ad to database API
      const token = localStorage.getItem("lankan_ads_token");
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: selectedCategory,
          subCategory: selectedSubCategory,
          titleEn,
          titleSi: "",
          descriptionEn,
          priceRange,
          contactNumber: `${contactNumber}|${whatsappNumber || contactNumber}`,
          district,
          city,
          availabilityHours,
          adTier: selectedTier,
          images: cloudinaryUrls,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create advertisement");
      }

      setIsSubmitting(false);
      setIsCheckoutOpen(false);
      setIsSuccess(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || "An error occurred during submission.");
      setIsCheckoutOpen(false);
    }
  };

  if (isAuthenticated === null) {
    return <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>Loading...</div>;
  }

  if (isAuthenticated === false) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "100px 0 var(--space-3xl)" }}>
        <h1 className={styles.title}>Post a Classified Ad</h1>
        <p className={styles.subtitle} style={{ marginBottom: "var(--space-xl)" }}>
          You must be logged in with a verified mobile number to post ads.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link href="/login" className="btn btn-primary btn-lg">
            Log In
          </Link>
          <Link href="/register" className="btn btn-secondary btn-lg">
            Register (Verify OTP)
          </Link>
        </div>
      </div>
    );
  }

  // Get active category details
  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);
  // Get active tier details
  const activeTier = TIERS.find((t) => t.name === selectedTier);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Create Your Listing</h1>
        <p className={styles.subtitle}>Post a new advertisement on Lankan Ads. All postings are paid.</p>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Logged in as: {userPhone}</span>
      </header>

      {error && <div className={styles.errorMsg} style={{ marginBottom: "1rem", textAlign: "center" }}>{error}</div>}

      {isSuccess ? (
        <div className={styles.formCard} style={{ display: "flex", justifyContent: "center" }}>
          <div className={styles.successCard}>
            <span className={styles.successIcon}></span>
            <h2 className={styles.title} style={{ background: "none", color: "var(--text-primary)", WebkitTextFillColor: "initial" }}>
              Ad Submitted Successfully!
            </h2>
            <p className={styles.text} style={{ maxWidth: "500px", margin: "1rem auto 2rem" }}>
              Thank you for your payment of <strong>{activeTier?.priceFormatted}</strong>. Your ad <strong>&quot;{titleEn}&quot;</strong> is now <strong style={{ color: "#10b981" }}>live</strong> and visible to everyone on Lankan Ads!
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => {
                // Reset form
                setSelectedCategory("");
                setSelectedSubCategory("");
                setTitleEn("");
                setTitleSi("");
                setDescriptionEn("");
                setPriceRange("");
                setContactNumber("");
                setWhatsappNumber("");
                setDistrict("");
                setCity("");
                setAvailabilityHours("");
                setUploadedImages([]);
                setSelectedTier("standard");
                setIsSuccess(false);
              }} className="btn btn-primary">
                Post Another Ad
              </button>
              <Link href="/" className="btn btn-secondary">
                Go to Home Page
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.formCard}>
          {/* SECTION 1: Category Selection */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionStep}>1</span> Category &amp; Sub-Category
            </h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>Select Primary Category</label>
              <div className={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className={`${styles.categoryTile} ${
                      selectedCategory === cat.id ? styles.categoryTileActive : ""
                    }`}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubCategory(""); // Reset subcategory when category changes
                    }}
                  >
                    <span className={styles.categoryIcon}>{cat.icon}</span>
                    <span className={styles.categoryName}>{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {activeCategory && activeCategory.subCategories.length > 0 && (
              <div className={styles.formGroup} style={{ marginTop: "var(--space-md)" }}>
                <label className={styles.label}>Select Sub-Category (Location Type)</label>
                <div className={styles.subCategoryList}>
                  {activeCategory.subCategories.map((sub) => (
                    <div
                      key={sub.id}
                      className={`${styles.subCategoryOption} ${
                        selectedSubCategory === sub.id ? styles.subCategoryOptionActive : ""
                      }`}
                      onClick={() => setSelectedSubCategory(sub.id)}
                    >
                      <input
                        type="radio"
                        name="subcategory"
                        checked={selectedSubCategory === sub.id}
                        onChange={() => {}} // handled by click event
                        className={styles.radioInput}
                      />
                      <div className={styles.subOptionText}>
                        <span className={styles.subOptionName}>{sub.name}</span>
                        <span className={styles.subOptionDesc}>{sub.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Ad Details */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionStep}>2</span> Advertisement Details
            </h2>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="titleEn">Ad Title</label>
                <input
                  id="titleEn"
                  type="text"
                  placeholder="e.g. Premium Thai Spa Therapy — Colombo 07"
                  className={styles.input}
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  maxLength={300}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="descEn">Ad Description</label>
                <textarea
                  id="descEn"
                  placeholder="Describe your service in detail. Mention details, requirements, facilities, qualifications. Max 2500 characters."
                  className={styles.textarea}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value.substring(0, 2500))}
                  maxLength={2500}
                  required
                />
                <div className={styles.charCounter}>{descriptionEn.length}/2500 characters</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="price">Starting price</label>
                <input
                  id="price"
                  type="text"
                  placeholder="e.g. 5000"
                  className={styles.input}
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="contact">Contact number(For normal call)</label>
                <input
                  id="contact"
                  type="tel"
                  placeholder="e.g. 0771234567"
                  className={styles.input}
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="whatsappContact">WhatsApp Contact Number (Optional)</label>
                <input
                  id="whatsappContact"
                  type="tel"
                  placeholder="e.g. 0771234567 (same as above if blank)"
                  className={styles.input}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="district">District</label>
                <select
                  id="district"
                  className={styles.select}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                >
                  <option value="">-- Select District --</option>
                  <option value="All District">All District</option>
                  {DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="city">City / Area</label>
                <textarea
                  id="city"
                  placeholder="e.g. Colombo 07, Cinnamon Gardens, Colombo 03 (You can enter multiple areas)"
                  className={styles.cityTextarea}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="hours">Availability Hours (Optional)</label>
                <input
                  id="hours"
                  type="text"
                  placeholder="e.g. Mon-Sun 09:00 — 21:00"
                  className={styles.input}
                  value={availabilityHours}
                  onChange={(e) => setAvailabilityHours(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Image Uploads */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionStep}>3</span> Photos (Up to 5)
            </h2>
            <div className={styles.imageUploadArea}>
              <div className={styles.uploadTrigger} onClick={() => document.getElementById("img-upload-input")?.click()}>
                <span className={styles.uploadIcon}></span>
                <p className={styles.uploadText}>Click to select and upload photos</p>
                <p className={styles.uploadSubtext}>Supports JPEG, PNG. Max 5MB per file.</p>
                <input
                  id="img-upload-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className={styles.previewGrid}>
                {uploadedImages.map((src, index) => (
                  <div key={index} className={styles.previewItem}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Preview ${index + 1}`} className={styles.previewImage} />
                    <button type="button" onClick={() => removeImage(index)} className={styles.removeBtn}>
                      x
                    </button>
                  </div>
                ))}
                {Array.from({ length: 5 - uploadedImages.length }).map((_, idx) => (
                  <div key={idx} className={styles.previewItem}>
                    <div className={styles.previewPlaceholder}>
                      Photo {uploadedImages.length + idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: Tier Selection */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionStep}>4</span> Visibility Tier
            </h2>
            <div className={styles.tierGrid}>
              {TIERS.map((tier) => {
                const isFreeStandard = tier.name === "standard" && !hasPostedAds;
                const priceFormatted = isFreeStandard ? "Free (First Ad)" : tier.priceFormatted;

                return (
                  <div
                    key={tier.name}
                    className={`${styles.tierCard} ${
                      selectedTier === tier.name ? styles.tierCardActive : ""
                    }`}
                    onClick={() => setSelectedTier(tier.name)}
                  >
                    {tier.name === "platinum" && (
                      <span className={styles.tierPopular}>Max Visibility</span>
                    )}
                    {tier.name === "standard" && !hasPostedAds && (
                      <span className={styles.tierPopular} style={{ background: "#10b981" }}>First Ad Free</span>
                    )}
                    <h3 className={styles.tierName}>{tier.displayName}</h3>
                    <div className={styles.tierPrice}>{priceFormatted}</div>
                    <div className={styles.tierDuration}>
                      {tier.topLayerDuration !== "N/A" ? `${tier.topLayerDuration} spotlight` : "Standard Placement"}
                    </div>
                    <ul className={styles.tierFeatures}>
                      {tier.features.map((feat, i) => (
                        <li key={i} className={styles.tierFeature}>
                          <span className={styles.tierCheck}></span> {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "var(--space-xl)", display: "flex", justifyContent: "flex-end" }}>
              <button 
                type="submit" 
                className="btn btn-primary btn-lg" 
                style={{ width: "100%", maxWidth: "300px" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  selectedTier === "standard" && !hasPostedAds
                    ? "Submit Free Ad"
                    : `Submit & Pay ${activeTier?.priceFormatted}`
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* PayHere Checkout Simulator Modal */}
      {isCheckoutOpen && (
        <div className={styles.checkoutOverlay}>
          <div className={styles.checkoutModal}>
            <div className={styles.checkoutHeader}>
              <div className={styles.payhereLogo}>
                Pay<span>Here</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Sandbox Payment Gateway Simulator
              </p>
            </div>

            <div className={styles.checkoutDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Merchant:</span>
                <span className={styles.detailValue}>Lankan Ads (PVT) Ltd</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Ad Tier:</span>
                <span className={styles.detailValue}>{activeTier?.displayName} Promotion</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Ad Duration:</span>
                <span className={styles.detailValue}>7 Days (Total)</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Order ID:</span>
                <span className={styles.detailValue}>LAD-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className={styles.detailRow} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px", marginTop: "8px" }}>
                <span className={styles.detailLabel} style={{ fontWeight: "700" }}>Total Amount:</span>
                <span className={styles.detailValue} style={{ fontSize: "16px", color: "#eb5757", fontWeight: "800" }}>
                  {activeTier?.priceFormatted}
                </span>
              </div>
            </div>

            <div className={styles.payBtnGroup}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", background: "#2196f3", borderColor: "#2196f3" }}
                onClick={executePayment}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing Sandbox Payment..." : "Complete Sandbox Payment (LKR)"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsCheckoutOpen(false)}
                disabled={isSubmitting}
              >
                Cancel Payment
              </button>
            </div>

            <p className={styles.testPaymentNote}>
              This is a test checkout simulation representing PayHere Sri Lanka merchant integration. No real funds are transferred.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
