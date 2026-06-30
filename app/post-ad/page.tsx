"use client";

// ============================================================
// Lankan Ads — Ad Creation & Posting Page (Client Component)
// ============================================================

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, DISTRICTS, TIERS } from "@/lib/constants";
import CategoryIcon from "@/components/CategoryIcon";
import styles from "./page.module.css";

export default function PostAdPage() {
  const router = useRouter();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userPhone, setUserPhone] = useState<string>("");

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [role, setRole] = useState<string>("");
  
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
  const [submissionProgress, setSubmissionProgress] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasPostedAds, setHasPostedAds] = useState<boolean>(true); // default to true, check on mount
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // LankaQR Polling states
  const [currentOrderId, setCurrentOrderId] = useState<string>("");
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [referenceError, setReferenceError] = useState<string>("");

  useEffect(() => {
    const adminDataStr = localStorage.getItem("lankan_ads_admin");
    const adminTokenRole = localStorage.getItem("lankan_ads_token_role");

    if (adminDataStr && adminTokenRole === "admin") {
      setIsAuthenticated(true);
      setIsAdmin(true);
      try {
        const adminData = JSON.parse(adminDataStr);
        setUserPhone(adminData.email || "System Administrator");
      } catch {
        setUserPhone("System Administrator");
      }
      setHasPostedAds(true);
    } else {
      const token = localStorage.getItem("lankan_ads_token");
      const phone = localStorage.getItem("lankan_ads_phone");
      if (!token) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        if (phone) setUserPhone(phone);
        checkFirstAdStatus(token);
      }
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

    if (selectedCategory === "gay" && !role) {
      setError("Please select your role.");
      return;
    }

    const trimmedTitle = titleEn.trim();
    if (trimmedTitle.length < 5 || trimmedTitle.length > 100) {
      setError("Ad Title must be between 5 and 100 characters long.");
      return;
    }

    const trimmedDesc = descriptionEn.trim();
    if (trimmedDesc.length < 20 || trimmedDesc.length > 3000) {
      setError("Ad Description must be between 20 and 3000 characters long.");
      return;
    }

    const trimmedContact = contactNumber.trim();
    if (!trimmedContact) {
      setError("Please enter a primary contact number.");
      return;
    }

    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (!phoneRegex.test(trimmedContact)) {
      setError("Primary contact number must be a valid Sri Lankan mobile number (e.g. 0771234567).");
      return;
    }

    const trimmedWhatsapp = whatsappNumber.trim();
    if (trimmedWhatsapp && !phoneRegex.test(trimmedWhatsapp)) {
      setError("WhatsApp number must be a valid Sri Lankan mobile number (e.g. 0771234567).");
      return;
    }

    if (!district) {
      setError("Please select a district.");
      return;
    }

    const trimmedCity = city.trim();
    if (trimmedCity.length < 2 || trimmedCity.length > 50) {
      setError("City must be between 2 and 50 characters long.");
      return;
    }

    if (isAdmin) {
      // Admin bypasses payment — post directly
      executeDirectPost();
    } else if (selectedTier === "standard" && !hasPostedAds) {
      // First standard ad is free — post directly
      executeDirectPost();
    } else {
      // Paid tier — initiate LankaQR checkout flow
      executeLankaQRCheckout();
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
  // Used for free ads and admin — creates ad directly and marks as success
  const executeDirectPost = async () => {
    setIsSubmitting(true);
    setError("");
    setSubmissionProgress("Uploading photos...");

    try {
      const cloudinaryUrls = await Promise.all(
        uploadedImages.map((base64) => uploadImageToCloudinary(base64))
      );

      setSubmissionProgress("Publishing listing...");

      const token = localStorage.getItem("lankan_ads_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/ads", {
        method: "POST",
        headers,
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
          role: selectedCategory === "gay" ? role : undefined,
          adTier: selectedTier,
          images: cloudinaryUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create advertisement");

      setIsSubmitting(false);
      setIsCheckoutOpen(false);
      setIsSuccess(true);
    } catch (err: any) {
      setIsSubmitting(false);
      const errorMsg = err.message || "An error occurred during submission.";
      setError(errorMsg);
      alert(`⚠️ ERROR: ${errorMsg}`);
      setIsCheckoutOpen(false);
    }
  };

  // Used for paid tiers — uploads images, creates ad as 'pending', then opens LankaQR checkout modal
  const executeLankaQRCheckout = async () => {
    setIsSubmitting(true);
    setError("");
    setSubmissionProgress("Uploading photos...");

    try {
      // 1. Upload images first
      const cloudinaryUrls = await Promise.all(
        uploadedImages.map((base64) => uploadImageToCloudinary(base64))
      );

      setSubmissionProgress("Creating your listing...");

      // 2. Create the ad in DB (status: pending until payment confirmed)
      const token = localStorage.getItem("lankan_ads_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const adRes = await fetch("/api/ads", {
        method: "POST",
        headers,
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
          role: selectedCategory === "gay" ? role : undefined,
          adTier: selectedTier,
          images: cloudinaryUrls,
          paymentPending: true, // signal to route that payment is coming
        }),
      });

      const adData = await adRes.json();
      if (!adRes.ok) throw new Error(adData.error || "Failed to create advertisement");

      // 3. Get Order ID and initialize pending payment row
      const tierPrices: Record<string, number> = { standard: 500, premium: 1500, platinum: 3000 };
      const amount = tierPrices[selectedTier] || 500;

      const payRes = await fetch("/api/payments/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          adId: adData.ad?.id || adData.id,
          tier: selectedTier,
          amount,
          phone: contactNumber,
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || "Failed to initiate payment");

      const generatedOrderId = payData.checkout?.order_id;
      setCurrentOrderId(generatedOrderId);

      // Open checkout modal and start status polling loop
      setIsSubmitting(false);
      setIsCheckoutOpen(true);
      setIsPolling(true);
    } catch (err: any) {
      setIsSubmitting(false);
      const errorMsg = err.message || "An error occurred. Please try again.";
      setError(errorMsg);
      alert(`⚠️ ERROR: ${errorMsg}`);
      setIsCheckoutOpen(false);
    }
  };

  // Poll payment status every 3 seconds while LankaQR checkout modal is open
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPolling && currentOrderId) {
      const pollStatus = async () => {
        try {
          const res = await fetch(`/api/payments/status?order_id=${currentOrderId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "completed") {
              setIsPolling(false);
              setIsCheckoutOpen(false);
              setIsSuccess(true);
              // Clean up local forms and trigger success screen
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }
        } catch (err) {
          console.error("Error polling payment status:", err);
        }
      };

      // Run immediately first
      pollStatus();
      intervalId = setInterval(pollStatus, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, currentOrderId]);

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
              Ad Posted Successfully!
            </h2>
            <p className={styles.text} style={{ maxWidth: "500px", margin: "1rem auto 2rem" }}>
              Your ad <strong>&quot;{titleEn}&quot;</strong> is now <strong style={{ color: "#10b981" }}>live</strong> and visible to everyone on Lankan Ads!
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => {
                // Reset form
                setSelectedCategory("");
                setSelectedSubCategory("");
                setRole("");
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
                    <span className={styles.categoryIcon}>
                      <CategoryIcon slug={cat.slug} size={32} />
                    </span>
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
            {selectedCategory === "gay" && (
              <div className={styles.formGroup} style={{ marginTop: "var(--space-md)" }}>
                <label className={styles.label}>Select Your Role</label>
                <div className={styles.roleSelectionGrid}>
                  {["Top", "Bottom", "50/50"].map((r) => (
                    <div
                      key={r}
                      className={`${styles.roleOption} ${
                        role === r ? styles.roleOptionActive : ""
                      }`}
                      onClick={() => setRole(r)}
                    >
                      <input
                        type="radio"
                        name="role"
                        checked={role === r}
                        onChange={() => {}}
                        className={styles.radioInput}
                      />
                      <span className={styles.roleName}>{r}</span>
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

      {/* LankaQR & Bank Transfer Confirmation Modal */}
      {isCheckoutOpen && (
        <div className={styles.checkoutOverlay}>
          <div className={styles.checkoutModal} style={{ maxWidth: "520px" }}>
            <div className={styles.checkoutHeader}>
              <div className={styles.payhereLogo} style={{ color: "var(--color-primary)" }}>
                LANKA<span>QR</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Scan to Pay with any Sri Lankan Banking App (FriMi, Genie, Solo, Flash)
              </p>
            </div>

            {/* QR Scanner Mockup */}
            <div style={{ display: "flex", justifyContent: "center", margin: "1.25rem 0" }}>
              <img
                src="/lanka-qr-placeholder.png"
                alt="LankaQR scan box"
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.1)",
                  objectFit: "contain",
                  background: "#0d0d13"
                }}
              />
            </div>

            {/* Crucial Instructions */}
            <div
              style={{
                background: "rgba(139, 92, 246, 0.05)",
                border: "1px dashed rgba(139, 92, 246, 0.3)",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "1rem",
                textAlign: "center"
              }}
            >
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 0.5rem 0" }}>
                Reference / Remarks Code to enter in your bank app:
              </p>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  letterSpacing: "0.05em",
                  color: "#10b981",
                  fontFamily: "monospace",
                  background: "rgba(16, 185, 129, 0.1)",
                  padding: "0.4rem",
                  borderRadius: "6px",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  display: "inline-block"
                }}
              >
                {currentOrderId}
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.5rem 0 0 0", lineHeight: "1.4" }}>
                ⚠️ <strong>CRITICAL:</strong> You MUST enter this exact code as the reference/remarks in your payment. Otherwise, your ad cannot activate automatically.
              </p>
            </div>

            {/* Billing Details */}
            <div className={styles.checkoutDetails} style={{ marginBottom: "1rem" }}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Promotional Tier:</span>
                <span className={styles.detailValue} style={{ textTransform: "capitalize" }}>
                  {activeTier?.displayName}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total LKR Amount:</span>
                <span className={styles.detailValue} style={{ color: "#eb5757", fontWeight: "700" }}>
                  {activeTier?.priceFormatted}
                </span>
              </div>
            </div>

            {/* Bank details fallback */}
            <details style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "0.6rem 0.8rem", marginBottom: "1rem" }}>
              <summary style={{ cursor: "pointer", fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: "600" }}>
                Show Bank Transfer Details
              </summary>
              <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                <div><strong>Bank:</strong> Nations Trust Bank (NTB)</div>
                <div><strong>Account Name:</strong> LankanAds</div>
                <div><strong>Account Number:</strong> 100XXXXXXXXX</div>
                <div><strong>Branch:</strong> Colombo Corporate Branch</div>
              </div>
            </details>

            {/* Manual Reference input for instant validation */}
            <div
              style={{
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                paddingTop: "1rem",
                marginBottom: "1rem"
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  marginBottom: "0.4rem"
                }}
              >
                Enter Payment Reference ID / Transaction ID:
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="e.g. CEFT/2948274 or bank trace ID"
                  className={styles.input}
                  style={{ flex: 1, margin: 0, padding: "0.5rem" }}
                  value={paymentReference}
                  onChange={(e) => {
                    setPaymentReference(e.target.value);
                    setReferenceError("");
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: "0 1.25rem", whiteSpace: "nowrap" }}
                  onClick={async () => {
                    if (!paymentReference.trim()) {
                      setReferenceError("Please enter the reference ID.");
                      return;
                    }
                    setIsSubmitting(true);
                    try {
                      const token = localStorage.getItem("lankan_ads_token");
                      const headers: Record<string, string> = { "Content-Type": "application/json" };
                      if (token) headers["Authorization"] = `Bearer ${token}`;

                      const res = await fetch("/api/payments/submit-reference", {
                        method: "POST",
                        headers,
                        body: JSON.stringify({
                          orderId: currentOrderId,
                          reference: paymentReference,
                        }),
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setIsPolling(false);
                        setIsCheckoutOpen(false);
                        setIsSuccess(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      } else {
                        setReferenceError(data.error || "Failed to submit reference.");
                      }
                    } catch {
                      setReferenceError("Network error. Please try again.");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Verify & Activate
                </button>
              </div>
              {referenceError && (
                <p style={{ fontSize: "0.8rem", color: "#EF4444", margin: "0.4rem 0 0 0" }}>{referenceError}</p>
              )}
            </div>

            {/* Auto status verify spinner (backup) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "0.6rem",
                background: "rgba(255, 255, 255, 0.01)",
                border: "1px solid rgba(255, 255, 255, 0.03)",
                borderRadius: "8px",
                marginBottom: "1rem"
              }}
            >
              <div className={styles.spinnerMiniInline}></div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Awaiting payment alert… Ad will go live instantly once transfer completes.
              </span>
            </div>

            <div className={styles.payBtnGroup}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "100%" }}
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsPolling(false);
                  setPaymentReference("");
                  setReferenceError("");
                }}
              >
                Cancel Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingCard}>
            <div className={styles.spinnerLarge}></div>
            <h3 className={styles.loadingTitle}>Processing Listing</h3>
            <p className={styles.loadingProgressText}>{submissionProgress}</p>
          </div>
        </div>
      )}
    </div>
  );
}
