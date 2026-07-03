"use client";





import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, DISTRICTS, TIERS } from "@/lib/constants";
import CategoryIcon from "@/components/CategoryIcon";
import styles from "./page.module.css";

export default function PostAdPage() {
  const router = useRouter();

  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userPhone, setUserPhone] = useState<string>("");

  
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

  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  
  const [selectedTier, setSelectedTier] = useState<
    "standard" | "premium" | "platinum"
  >("standard");

  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionProgress, setSubmissionProgress] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasPostedAds, setHasPostedAds] = useState<boolean>(true); 
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  
  const [currentOrderId, setCurrentOrderId] = useState<string>("");
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [referenceError, setReferenceError] = useState<string>("");
  const [isVerifyingReference, setIsVerifyingReference] =
    useState<boolean>(false);
  const [verificationStepText, setVerificationStepText] = useState<string>("");
  const [checkoutSecondsLeft, setCheckoutSecondsLeft] = useState<number>(600); 
  const [checkoutOpenTime, setCheckoutOpenTime] = useState<number>(0);
  const [customAlert, setCustomAlert] = useState<{
    title: string;
    message: string;
    isError?: boolean;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "bank" | "">("");
  const [paymentLanguage, setPaymentLanguage] = useState<"si" | "en">("si");
  const [bankDetails, setBankDetails] = useState<{
    bank: string;
    accountName: string;
    accountNumber: string;
    branch: string;
  } | null>(null);

  async function checkFirstAdStatus(token: string) {
    try {
      const res = await fetch("/api/ads", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.ads) {
        setHasPostedAds(data.ads.length > 0);
      }
    } catch (err) {
      console.error("Failed to check first ad status:", err);
    }
  }

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const queryParams = new URLSearchParams(window.location.search);
    const initialTier = queryParams.get("tier");
    if (initialTier && ["platinum", "premium", "standard"].includes(initialTier)) {
      setSelectedTier(initialTier as "platinum" | "premium" | "standard");
    }

    const resumeAdId = queryParams.get("adId");
    const resumeTier = queryParams.get("tier");
    const token = localStorage.getItem("lankan_ads_token");

    if (resumeAdId && resumeTier && token) {
      const resumePayment = async () => {
        setIsSubmitting(true);
        try {
          const tierPrices: Record<string, number> = {
            standard: 700,
            premium: 1400,
            platinum: 5000,
          };
          const amount = tierPrices[resumeTier] || 700;

          const payRes = await fetch("/api/payments/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              adId: resumeAdId,
              tier: resumeTier,
              amount,
              phone: localStorage.getItem("lankan_ads_phone") || "",
            }),
          });

          const payData = await payRes.json();
          if (!payRes.ok) throw new Error(payData.error || "Failed to initiate payment");

          const generatedOrderId = payData.checkout?.order_id;
          setCurrentOrderId(generatedOrderId);
          setSelectedTier(resumeTier as "platinum" | "premium" | "standard");
          
          setCheckoutSecondsLeft(600);
          setCheckoutOpenTime(Date.now());
          setIsSubmitting(false);
          setPaymentMethod("");
          setIsCheckoutOpen(true);
          setIsPolling(true);
        } catch (err: any) {
          setIsSubmitting(false);
          setError(err.message || "Failed to initiate recovery payment.");
        }
      };

      resumePayment();
    }
  }, []);

  useEffect(() => {
    if (!isCheckoutOpen) return;

    const fetchBankDetails = async () => {
      try {
        const token = localStorage.getItem("lankan_ads_token");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/payments/bank-details", { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.bankDetails) {
            setBankDetails(data.bankDetails);
          }
        }
      } catch (err) {
        console.error("Failed to fetch bank details dynamically:", err);
      }
    };

    fetchBankDetails();
  }, [isCheckoutOpen]);

  
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

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const triggerValidationError = (msg: string) => {
      setError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!selectedCategory) {
      triggerValidationError("Please select a category.");
      return;
    }

    const categoryObj = CATEGORIES.find((c) => c.id === selectedCategory);
    if (
      categoryObj &&
      categoryObj.subCategories.length > 0 &&
      !selectedSubCategory
    ) {
      triggerValidationError("Please select a sub-category.");
      return;
    }

    if (selectedCategory === "gay" && !role) {
      triggerValidationError("Please select your role.");
      return;
    }

    const trimmedTitle = titleEn.trim();
    if (trimmedTitle.length < 5 || trimmedTitle.length > 500) {
      triggerValidationError(
        "Ad Title must be between 5 and 500 characters long.",
      );
      return;
    }

    const trimmedDesc = descriptionEn.trim();
    if (trimmedDesc.length < 20 || trimmedDesc.length > 3000) {
      triggerValidationError(
        "Ad Description must be between 20 and 3000 characters long.",
      );
      return;
    }

    const trimmedContact = contactNumber.trim();
    if (!trimmedContact) {
      triggerValidationError("Please enter a primary contact number.");
      return;
    }

    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (!phoneRegex.test(trimmedContact)) {
      triggerValidationError(
        "Primary contact number must be a valid Sri Lankan mobile number (e.g. 0771234567).",
      );
      return;
    }

    const trimmedWhatsapp = whatsappNumber.trim();
    if (trimmedWhatsapp && !phoneRegex.test(trimmedWhatsapp)) {
      triggerValidationError(
        "WhatsApp number must be a valid Sri Lankan mobile number (e.g. 0771234567).",
      );
      return;
    }

    if (!district) {
      triggerValidationError("Please select a district.");
      return;
    }

    const trimmedCity = city.trim();
    if (trimmedCity.length < 2 || trimmedCity.length > 150) {
      triggerValidationError("City must be between 2 and 150 characters long.");
      return;
    }

    if (isAdmin) {
      
      executeDirectPost();
    } else if (selectedTier === "standard" && !hasPostedAds) {
      
      executeDirectPost();
    } else {
      
      executeLankaQRCheckout();
    }
  };

  const uploadImageToCloudinary = async (
    base64Data: string,
  ): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "lankan-ads-unsigned";

    if (!cloudName) {
      throw new Error("Cloudinary Cloud Name is not configured");
    }

    const formData = new FormData();
    formData.append("file", base64Data);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(
        errData.error?.message || "Failed to upload image to Cloudinary",
      );
    }

    const data = await res.json();
    return data.secure_url;
  };

  
  
  const executeDirectPost = async () => {
    setIsSubmitting(true);
    setError("");
    setSubmissionProgress("Uploading photos...");

    try {
      const cloudinaryUrls = await Promise.all(
        uploadedImages.map((base64) => uploadImageToCloudinary(base64)),
      );

      setSubmissionProgress("Publishing listing...");

      const token = localStorage.getItem("lankan_ads_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
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
      if (!res.ok)
        throw new Error(data.error || "Failed to create advertisement");

      setIsSubmitting(false);
      setIsCheckoutOpen(false);
      setIsSuccess(true);
    } catch (err: any) {
      setIsSubmitting(false);
      const errorMsg = err.message || "An error occurred during submission.";
      setError(errorMsg);
      setCustomAlert({
        title: "Submission Failed",
        message: errorMsg,
        isError: true,
      });
      setIsCheckoutOpen(false);
    }
  };

  
  const executeLankaQRCheckout = async () => {
    setIsSubmitting(true);
    setError("");
    setSubmissionProgress("Uploading photos...");

    try {
      
      const cloudinaryUrls = await Promise.all(
        uploadedImages.map((base64) => uploadImageToCloudinary(base64)),
      );

      setSubmissionProgress("Creating your listing...");

      
      const token = localStorage.getItem("lankan_ads_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
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
          paymentPending: true, 
        }),
      });

      const adData = await adRes.json();
      if (!adRes.ok)
        throw new Error(adData.error || "Failed to create advertisement");

      
      const tierPrices: Record<string, number> = {
        standard: 700,
        premium: 1400,
        platinum: 5000,
      };
      const amount = tierPrices[selectedTier] || 700;

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
      if (!payRes.ok)
        throw new Error(payData.error || "Failed to initiate payment");

      const generatedOrderId = payData.checkout?.order_id;
      setCurrentOrderId(generatedOrderId);

      
      setCheckoutSecondsLeft(600); 
      setCheckoutOpenTime(Date.now()); 
      setIsSubmitting(false);
      setPaymentMethod("");
      setIsCheckoutOpen(true);
      setIsPolling(true);
    } catch (err: any) {
      setIsSubmitting(false);
      const errorMsg = err.message || "An error occurred. Please try again.";
      setError(errorMsg);
      setCustomAlert({
        title: "Order Failed",
        message: errorMsg,
        isError: true,
      });
      setIsCheckoutOpen(false);
    }
  };

  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPolling && currentOrderId) {
      const pollStatus = async () => {
        try {
          const res = await fetch(
            `/api/payments/status?order_id=${currentOrderId}`,
          );
          if (res.ok) {
            const data = await res.json();
            if (data.status === "completed") {
              setIsPolling(false);
              setIsCheckoutOpen(false);
              setIsSuccess(true);
              
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }
        } catch (err) {
          console.error("Error polling payment status:", err);
        }
      };

      
      pollStatus();
      intervalId = setInterval(pollStatus, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, currentOrderId]);

  
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (isCheckoutOpen && checkoutSecondsLeft > 0) {
      timerId = setInterval(() => {
        setCheckoutSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isCheckoutOpen && checkoutSecondsLeft === 0) {
      
      setIsCheckoutOpen(false);
      setIsPolling(false);
      setPaymentReference("");
      setReferenceError("");
      alert(
        "⏳ Payment Session Expired. You did not enter a reference code in time. Please try again.",
      );
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isCheckoutOpen, checkoutSecondsLeft]);

  if (isAuthenticated === null) {
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "100px 0" }}
      >
        Loading...
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "100px 0 var(--space-3xl)" }}
      >
        <h1 className={styles.title}>Post a Classified Ad</h1>
        <p
          className={styles.subtitle}
          style={{ marginBottom: "var(--space-xl)" }}
        >
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

  
  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);
  
  const activeTier = TIERS.find((t) => t.name === selectedTier);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Create Your Listing</h1>
        <p className={styles.subtitle}>
          Post a new advertisement on Lankan Ads. All postings are paid.
        </p>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Logged in as: {userPhone}
        </span>
      </header>

      {error && (
        <div className={styles.errorMsg}>
          <span>⚠️</span> {error}
        </div>
      )}

      {isSuccess ? (
        <div
          className={styles.formCard}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div className={styles.successCard}>
            <span className={styles.successIcon}></span>
            <h2
              className={styles.title}
              style={{
                background: "none",
                color: "var(--text-primary)",
                WebkitTextFillColor: "initial",
              }}
            >
              Ad Posted Successfully!
            </h2>
            <p
              className={styles.text}
              style={{ maxWidth: "500px", margin: "1rem auto 2rem" }}
            >
              Your ad <strong>&quot;{titleEn}&quot;</strong> is now{" "}
              <strong style={{ color: "#10b981" }}>live</strong> and visible to
              everyone on Lankan Ads!
            </p>
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                onClick={() => {
                  
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
                }}
                className="btn btn-primary"
              >
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
          {}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionStep}>1</span> Category &amp;
              Sub-Category
            </h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>Select Primary Category</label>
              <div className={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className={`${styles.categoryTile} ${
                      selectedCategory === cat.id
                        ? styles.categoryTileActive
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubCategory(""); 
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
              <div
                className={styles.formGroup}
                style={{ marginTop: "var(--space-md)" }}
              >
                <label className={styles.label}>
                  Select Sub-Category (Location Type)
                </label>
                <div className={styles.subCategoryList}>
                  {activeCategory.subCategories.map((sub) => (
                    <div
                      key={sub.id}
                      className={`${styles.subCategoryOption} ${
                        selectedSubCategory === sub.id
                          ? styles.subCategoryOptionActive
                          : ""
                      }`}
                      onClick={() => setSelectedSubCategory(sub.id)}
                    >
                      <input
                        type="radio"
                        name="subcategory"
                        checked={selectedSubCategory === sub.id}
                        onChange={() => {}} 
                        className={styles.radioInput}
                      />
                      <div className={styles.subOptionText}>
                        <span className={styles.subOptionName}>{sub.name}</span>
                        <span className={styles.subOptionDesc}>
                          {sub.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedCategory === "gay" && (
              <div
                className={styles.formGroup}
                style={{ marginTop: "var(--space-md)" }}
              >
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

          {}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionStep}>2</span> Advertisement
              Details
            </h2>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="titleEn">
                  Ad Title
                </label>
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
                <label className={styles.label} htmlFor="descEn">
                  Ad Description
                </label>
                <textarea
                  id="descEn"
                  placeholder="Describe your service in detail. Mention details, requirements, facilities, qualifications. Max 2500 characters."
                  className={styles.textarea}
                  value={descriptionEn}
                  onChange={(e) =>
                    setDescriptionEn(e.target.value.substring(0, 2500))
                  }
                  maxLength={2500}
                  required
                />
                <div className={styles.charCounter}>
                  {descriptionEn.length}/2500 characters
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="price">
                  Starting price
                </label>
                <input
                  id="price"
                  type="text"
                  placeholder="e.g. 5000"
                  className={styles.input}
                  value={priceRange}
                  onChange={(e) =>
                    setPriceRange(e.target.value.replace(/[^0-9]/g, ""))
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="contact">
                  Contact number(For normal call)
                </label>
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
                <label className={styles.label} htmlFor="whatsappContact">
                  WhatsApp Contact Number (Optional)
                </label>
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
                <label className={styles.label} htmlFor="district">
                  District
                </label>
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
                <label className={styles.label} htmlFor="city">
                  City / Area
                </label>
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
                <label className={styles.label} htmlFor="hours">
                  Availability Hours (Optional)
                </label>
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

          {}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionStep}>3</span> Photos (Up to 5)
            </h2>
            <div className={styles.imageUploadArea}>
              <div
                className={styles.uploadTrigger}
                onClick={() =>
                  document.getElementById("img-upload-input")?.click()
                }
              >
                <span className={styles.uploadIcon}></span>
                <p className={styles.uploadText}>
                  Click to select and upload photos
                </p>
                <p className={styles.uploadSubtext}>
                  Supports JPEG, PNG. Max 5MB per file.
                </p>
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
                    {}
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeBtn}
                    >
                      x
                    </button>
                  </div>
                ))}
                {Array.from({ length: 5 - uploadedImages.length }).map(
                  (_, idx) => (
                    <div key={idx} className={styles.previewItem}>
                      <div className={styles.previewPlaceholder}>
                        Photo {uploadedImages.length + idx + 1}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionStep}>4</span> Visibility Tier
            </h2>
            <div className={styles.tierGrid}>
              {TIERS.map((tier) => {
                const isFreeStandard =
                  tier.name === "standard" && !hasPostedAds;
                const priceFormatted = isFreeStandard
                  ? "Free (First Ad)"
                  : tier.priceFormatted;

                return (
                  <div
                    key={tier.name}
                    className={`${styles.tierCard} ${
                      selectedTier === tier.name ? styles.tierCardActive : ""
                    }`}
                    onClick={() => setSelectedTier(tier.name)}
                  >
                    {tier.name === "platinum" && (
                      <span
                        className={styles.tierPopular}
                        style={{
                          background: "var(--color-platinum)",
                          color: "var(--bg-primary)",
                        }}
                      >
                        🔥 Max Visibility
                      </span>
                    )}
                    {tier.name === "premium" && (
                      <span
                        className={styles.tierPopular}
                        style={{ background: "#fbbf24", color: "#000" }}
                      >
                        ⭐ Premium Reach
                      </span>
                    )}
                    {tier.name === "standard" && !hasPostedAds && (
                      <span
                        className={styles.tierPopular}
                        style={{ background: "#10b981", color: "#fff" }}
                      >
                        🎁 First Ad Free
                      </span>
                    )}
                    <h3 className={styles.tierName}>{tier.displayName}</h3>
                    <div className={styles.tierPrice}>{priceFormatted}</div>
                    <div className={styles.tierDuration}>
                      {tier.topLayerDuration !== "N/A"
                        ? `${tier.topLayerDuration} spotlight`
                        : "Standard Placement"}
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

            <div
              style={{
                marginTop: "var(--space-xl)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", maxWidth: "300px" }}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : selectedTier === "standard" && !hasPostedAds
                    ? "Submit Free Ad"
                    : `Submit & Pay ${activeTier?.priceFormatted}`}
              </button>
            </div>
          </div>
        </form>
      )}

      {}
      {isCheckoutOpen &&
        (() => {
          const t = {
            si: {
              gatewayTitle: "Payment Gateway",
              expiresIn: "⏳ සැසිය අවසන් වීමට ඉතිරි කාලය",
              refLabel:
                "ඔබගේ බැංකු යෙදුමේ (App) යොමු / සටහන් / විස්තර (Reference / Remarks / Description) ලෙස පහත කේතය ඇතුළත් කරන්න:",
              warning:
                "අවවාදයයි: ගෙවීම කරන විට මෙම කේතයම යොමු/සටහන් (Reference/Remarks) ලෙස ඇතුළත් කළ යුතුය. එසේ නොකළහොත්, ඔබගේ දැන්වීම ස්වයංක්‍රීයව සක්‍රීය කළ නොහැක.",
              tier: "පැකේජය:",
              amount: "ගෙවිය යුතු මුළු මුදල (රු.):",
              selectMethod: "ගෙවීමේ ක්‍රමය තෝරන්න",
              choosePlaceholder: "ගෙවීමේ ක්‍රමයක් තෝරන්න",
              payQR: "QR කේතය මඟින් ගෙවන්න",
              payBank: "බැංකු ගිණුම් විස්තර භාවිතයෙන් ගෙවන්න",
              qrSub:
                "ඕනෑම ශ්‍රී ලාංකික බැංකු යෙදුමකින් (FriMi, Genie, Solo, Flash) QR කේතය ස්කෑන් කර ගෙවන්න.",
              bankName: bankDetails ? `බැංකුව: ${bankDetails.bank}` : "බැංකුව: තොරතුරු ලෝඩ් වෙමින්...",
              accName: bankDetails ? `ගිණුමේ නම: ${bankDetails.accountName}` : "ගිණුමේ නම: තොරතුරු ලෝඩ් වෙමින්...",
              accNum: bankDetails ? `ගිණුම් අංකය: ${bankDetails.accountNumber}` : "ගිණුම් අංකය: තොරතුරු ලෝඩ් වෙමින්...",
              branch: bankDetails ? `ශාඛාව: ${bankDetails.branch}` : "ශාඛාව: තොරතුරු ලෝඩ් වෙමින්...",
              emptyPrompt:
                "ගෙවීම සම්පූර්ණ කිරීම සඳහා ඉහතින් ගෙවීමේ ක්‍රමයක් තෝරන්න.",
              afterPay: "ගෙවීමෙන් පසු",
              enterRef:
                "බැංකු රිසිට්පතේහි ඇති ගෙවීමේ යොමු අංකය (Reference ID) හෝ ගනුදෙනු අංකය (Transaction ID) ඇතුළත් කරන්න:",
              inputPlaceholder: "උදා: CEFT/2948274 හෝ බැංකු ගනුදෙනු අංකය",
              verifyBtn: "තහවුරු කර දැන්වීම සක්‍රීය කරන්න",
              verifying: "තහවුරු කරමින්...",
              awaiting:
                "ඔබගේ ගෙවීම ලැබෙන තෙක් රැඳී සිටින්න... මුදල් ලැබුණු වහාම ඔබගේ දැන්වීම ස්වයංක්‍රීයව සක්‍රීය වේ.",
              cancel: "ගෙවීම අවලංගු කරන්න",
            },
            en: {
              gatewayTitle: "Payment Gateway",
              expiresIn: "⏳ Session Expires In",
              refLabel:
                "Reference / Remarks / Description Code to enter in your bank app:",
              warning:
                "WARNING: You MUST enter this exact code as the reference/remarks in your payment. Otherwise, your ad cannot activate automatically.",
              tier: "Promotional Tier:",
              amount: "Total LKR Amount:",
              selectMethod: "Select Payment Method",
              choosePlaceholder: "Select Payment Method",
              payQR: "Pay using QR",
              payBank: "Pay using bank details",
              qrSub:
                "Scan to Pay with any Sri Lankan Banking App (FriMi, Genie, Solo, Flash)",
              bankName: bankDetails ? `Bank: ${bankDetails.bank}` : "Bank: Loading details...",
              accName: bankDetails ? `Account Name: ${bankDetails.accountName}` : "Account Name: Loading details...",
              accNum: bankDetails ? `Account Number: ${bankDetails.accountNumber}` : "Account Number: Loading details...",
              branch: bankDetails ? `Branch: ${bankDetails.branch}` : "Branch: Loading details...",
              emptyPrompt:
                "Please choose a payment method above to complete your transaction.",
              afterPay: "After Payment",
              enterRef: "Enter Payment Reference ID / Transaction ID:",
              inputPlaceholder: "e.g. CEFT/2948274 or bank trace ID",
              verifyBtn: "Verify & Activate",
              verifying: "Verifying...",
              awaiting:
                "Awaiting payment alert… Ad will go live instantly once transfer completes.",
              cancel: "Cancel Submission",
            },
          }[paymentLanguage];

          return (
            <div className={styles.checkoutOverlay}>
              <div
                className={styles.checkoutModal}
                style={{ maxWidth: "520px" }}
              >
                <div
                  className={styles.checkoutHeader}
                  style={{
                    textAlign: "center",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    paddingBottom: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-display)",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      gap: "2px",
                      lineHeight: "1",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "flex-end",
                        gap: "1px",
                        lineHeight: "1",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "2.45rem",
                          fontWeight: "900",
                          color: "var(--text-primary)",
                          lineHeight: "0.85",
                        }}
                      >
                        ල
                      </span>
                      <span
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "800",
                          color: "var(--text-primary)",
                          display: "inline-block",
                          margin: "0 1px",
                          lineHeight: "1",
                        }}
                      >
                        o
                      </span>
                      <span
                        style={{
                          fontSize: "1.35rem",
                          fontWeight: "800",
                          color: "var(--text-primary)",
                          display: "inline-block",
                          lineHeight: "1",
                        }}
                      >
                        කන්
                      </span>
                      <span
                        style={{
                          fontSize: "1.35rem",
                          fontWeight: "800",
                          display: "inline-block",
                          lineHeight: "1",
                          background: "var(--gradient-hero)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        Ads
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: "1.35rem",
                        fontWeight: "800",
                        color: "var(--text-primary)",
                        display: "inline-block",
                        marginLeft: "6px",
                        lineHeight: "1",
                      }}
                    >
                      {t.gatewayTitle}
                    </span>
                  </h3>

                  {}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "8px",
                      margin: "0.8rem 0 0.4rem 0",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setPaymentLanguage("si")}
                      style={{
                        padding: "0.3rem 0.8rem",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        borderRadius: "6px",
                        border: "1px solid",
                        borderColor:
                          paymentLanguage === "si"
                            ? "var(--color-primary-light)"
                            : "rgba(255,255,255,0.08)",
                        background:
                          paymentLanguage === "si"
                            ? "rgba(139,92,246,0.12)"
                            : "transparent",
                        color:
                          paymentLanguage === "si"
                            ? "var(--color-primary-light)"
                            : "var(--text-muted)",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      සිංහල
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentLanguage("en")}
                      style={{
                        padding: "0.3rem 0.8rem",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        borderRadius: "6px",
                        border: "1px solid",
                        borderColor:
                          paymentLanguage === "en"
                            ? "var(--color-primary-light)"
                            : "rgba(255,255,255,0.08)",
                        background:
                          paymentLanguage === "en"
                            ? "rgba(139,92,246,0.12)"
                            : "transparent",
                        color:
                          paymentLanguage === "en"
                            ? "var(--color-primary-light)"
                            : "var(--text-muted)",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      English
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: "0.6rem",
                      fontSize: "0.8rem",
                      color: "#F59E0B",
                      background: "rgba(245, 158, 11, 0.08)",
                      border: "1px solid rgba(245, 158, 11, 0.15)",
                      borderRadius: "6px",
                      padding: "0.25rem 0.6rem",
                      display: "inline-block",
                      fontWeight: "600",
                    }}
                  >
                    {t.expiresIn}: {Math.floor(checkoutSecondsLeft / 60)}:
                    {(checkoutSecondsLeft % 60).toString().padStart(2, "0")}
                  </div>
                </div>

                {}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.01)",
                    border: "1px dashed rgba(139, 92, 246, 0.3)",
                    borderRadius: "10px",
                    padding: "1rem",
                    marginBottom: "1.25rem",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      margin: "0 0 0.5rem 0",
                      lineHeight: "1.4",
                    }}
                  >
                    {t.refLabel}
                  </p>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "800",
                      letterSpacing: "0.05em",
                      color: "#10b981",
                      fontFamily: "monospace",
                      background: "rgba(16, 185, 129, 0.1)",
                      padding: "0.4rem 1rem",
                      borderRadius: "6px",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      display: "inline-block",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {currentOrderId}
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      margin: "0",
                      lineHeight: "1.4",
                    }}
                  >
                    ⚠️ {t.warning}
                  </p>
                </div>

                {}
                <div
                  className={styles.checkoutDetails}
                  style={{ marginBottom: "1.25rem" }}
                >
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{t.tier}</span>
                    <span
                      className={styles.detailValue}
                      style={{ textTransform: "capitalize" }}
                    >
                      {activeTier?.displayName}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{t.amount}</span>
                    <span
                      className={styles.detailValue}
                      style={{ color: "#eb5757", fontWeight: "700" }}
                    >
                      {activeTier?.priceFormatted}
                    </span>
                  </div>
                </div>

                {}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {t.selectMethod}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as "qr" | "bank" | "")
                    }
                    className={styles.select}
                    style={{
                      padding: "0.5rem var(--space-md)",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option value="">{t.choosePlaceholder}</option>
                    <option value="qr">{t.payQR}</option>
                    <option value="bank">{t.payBank}</option>
                  </select>
                </div>

                {}
                {paymentMethod === "qr" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.6rem",
                      margin: "1rem 0",
                      background: "rgba(255,255,255,0.01)",
                      border: "1px solid rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                      padding: "1rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        margin: "0",
                        textAlign: "center",
                        lineHeight: "1.4",
                      }}
                    >
                      {t.qrSub}
                    </p>
                    <img
                      src={`/api/payments/qr-code?token=${typeof window !== "undefined" ? localStorage.getItem("lankan_ads_token") || "" : ""}`}
                      alt="LankaQR scan box"
                      style={{
                        width: "160px",
                        height: "160px",
                        borderRadius: "12px",
                        border: "1px solid rgba(139, 92, 246, 0.2)",
                        boxShadow: "0 0 20px rgba(139, 92, 246, 0.1)",
                        objectFit: "contain",
                        background: "#0d0d13",
                      }}
                    />
                  </div>
                )}
                {paymentMethod === "bank" && (
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                      padding: "0.8rem 1rem",
                      margin: "1rem 0",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.6",
                    }}
                  >
                    <div>
                      <strong>{t.bankName}</strong>
                    </div>
                    <div>
                      <strong>{t.accName}</strong>
                    </div>
                    <div>
                      <strong>{t.accNum}</strong>
                    </div>
                    <div>
                      <strong>{t.branch}</strong>
                    </div>
                  </div>
                )}
                {paymentMethod === "" && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1.5rem",
                      border: "1px dashed rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.01)",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                      margin: "1rem 0",
                    }}
                  >
                    {t.emptyPrompt}
                  </div>
                )}

                {}
                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingTop: "1.25rem",
                    marginTop: "1.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-primary-light)",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 0.6rem 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>✓</span> {t.afterPay}
                  </h4>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {t.enterRef}
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder={t.inputPlaceholder}
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
                          setReferenceError(
                            paymentLanguage === "si"
                              ? "කරුණාකර යොමු අංකය ඇතුළත් කරන්න."
                              : "Please enter the reference ID.",
                          );
                          return;
                        }

                        
                        const secondsElapsed = Math.floor(
                          (Date.now() - checkoutOpenTime) / 1000,
                        );
                        if (secondsElapsed < 120) {
                          
                          setIsVerifyingReference(true);
                          setVerificationStepText(
                            paymentLanguage === "si"
                              ? "නේෂන්ස් ට්‍රස්ට් බැංකු ගේට්වේ වෙත සම්බන්ධ වෙමින්..."
                              : "Connecting to Nations Trust Bank Gateway...",
                          );

                          setTimeout(() => {
                            setVerificationStepText(
                              paymentLanguage === "si"
                                ? "ලංකාQR ගනුදෙනු ලෙජරය ස්කෑන් කරමින්..."
                                : "Scanning LankaQR transaction ledger...",
                            );
                          }, 800);

                          setTimeout(() => {
                            setVerificationStepText(
                              paymentLanguage === "si"
                                ? "ගිණුමේ තැන්පතු ඇඟවීම් සත්‍යාපනය කරමින්..."
                                : "Verifying account credit alerts...",
                            );
                          }, 1600);

                          setTimeout(() => {
                            setIsVerifyingReference(false);
                            
                            setCustomAlert({
                              title:
                                paymentLanguage === "si"
                                  ? "සත්‍යාපනය අසාර්ථකයි"
                                  : "Verification Failed",
                              message:
                                paymentLanguage === "si"
                                  ? "ගෙවීම ලැබී නොමැත. කරුණාකර ගෙවීම සිදු කරන්න."
                                  : "Payment not received. Please make the payment.",
                              isError: true,
                            });
                          }, 2400);

                          return;
                        }

                        setIsSubmitting(true);
                        setReferenceError("");
                        try {
                          const token =
                            localStorage.getItem("lankan_ads_token");
                          const headers: Record<string, string> = {
                            "Content-Type": "application/json",
                          };
                          if (token)
                            headers["Authorization"] = `Bearer ${token}`;

                          const res = await fetch(
                            "/api/payments/submit-reference",
                            {
                              method: "POST",
                              headers,
                              body: JSON.stringify({
                                orderId: currentOrderId,
                                reference: paymentReference,
                              }),
                            },
                          );
                          const data = await res.json();
                          if (res.ok && data.success) {
                            setIsPolling(false);
                            
                            setIsVerifyingReference(true);
                            setIsSubmitting(false);

                            
                            setVerificationStepText(
                              paymentLanguage === "si"
                                ? "නේෂන්ස් ට්‍රස්ට් බැංකු ගේට්වේ වෙත සම්බන්ධ වෙමින්..."
                                : "Connecting to Nations Trust Bank Gateway...",
                            );

                            
                            setTimeout(() => {
                              setVerificationStepText(
                                paymentLanguage === "si"
                                  ? "ගනුදෙනු යොමු අංකය සැසඳීම සිදු කරමින්..."
                                  : "Reconciling transaction reference ID...",
                              );
                            }, 800);

                            
                            setTimeout(() => {
                              setVerificationStepText(
                                paymentLanguage === "si"
                                  ? "ලංකාQR ගෙවීම් පද්ධතිය තහවුරු කරමින්..."
                                  : "Authenticating LankaQR payment ledger...",
                              );
                            }, 1600);

                            
                            setTimeout(() => {
                              setVerificationStepText(
                                paymentLanguage === "si"
                                  ? "දැන්වීම සක්‍රීය කිරීම සිදු කරමින්..."
                                  : "Securing publication activation...",
                              );
                            }, 2400);

                            
                            setTimeout(() => {
                              setIsVerifyingReference(false);
                              setIsCheckoutOpen(false);
                              setIsSuccess(true);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }, 3200);
                          } else {
                            setIsSubmitting(false);
                            setReferenceError(
                              data.error ||
                                (paymentLanguage === "si"
                                  ? "යොමු අංකය ඉදිරිපත් කිරීම අසාර්ථකයි."
                                  : "Failed to submit reference."),
                            );
                          }
                        } catch {
                          setIsSubmitting(false);
                          setReferenceError(
                            paymentLanguage === "si"
                              ? "ජාල දෝෂයකි. කරුණාකර නැවත උත්සාහ කරන්න."
                              : "Network error. Please try again.",
                          );
                        }
                      }}
                      disabled={isSubmitting || isVerifyingReference}
                    >
                      {isSubmitting ? t.verifying : t.verifyBtn}
                    </button>
                  </div>
                  {referenceError && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#EF4444",
                        margin: "0.4rem 0 0 0",
                      }}
                    >
                      {referenceError}
                    </p>
                  )}
                </div>

                {}
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
                    marginBottom: "1rem",
                  }}
                >
                  <div className={styles.spinnerMiniInline}></div>
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    {t.awaiting}
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
                      setPaymentMethod("");
                    }}
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingCard}>
            <div className={styles.spinnerLarge}></div>
            <h3 className={styles.loadingTitle}>Processing Listing</h3>
            <p className={styles.loadingProgressText}>{submissionProgress}</p>
          </div>
        </div>
      )}

      {isVerifyingReference && (
        <div className={styles.loadingOverlay} style={{ zIndex: 11000 }}>
          <div
            className={styles.loadingCard}
            style={{
              border: "1px solid rgba(16, 185, 129, 0.3)",
              boxShadow: "0 0 50px rgba(16, 185, 129, 0.15)",
            }}
          >
            <div
              className={styles.spinnerLarge}
              style={{ borderTopColor: "#10b981" }}
            ></div>
            <h3 className={styles.loadingTitle} style={{ color: "#10b981" }}>
              Verifying Payment
            </h3>
            <p className={styles.loadingProgressText}>{verificationStepText}</p>
          </div>
        </div>
      )}

      {customAlert && (
        <div
          className={styles.loadingOverlay}
          style={{ zIndex: 12000, background: "rgba(0, 0, 0, 0.95)" }}
        >
          <div
            className={styles.loadingCard}
            style={{
              maxWidth: "420px",
              padding: "2rem",
              border: customAlert.isError
                ? "1px solid rgba(239, 68, 68, 0.3)"
                : "1px solid rgba(139, 92, 246, 0.3)",
              boxShadow: customAlert.isError
                ? "0 0 50px rgba(239, 68, 68, 0.15)"
                : "0 0 50px rgba(139, 92, 246, 0.15)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "3.5rem",
                marginBottom: "1rem",
                color: customAlert.isError ? "#EF4444" : "#8B5CF6",
                animation: "scaleIn 0.3s ease-out",
              }}
            >
              {customAlert.isError ? "❌" : "✓"}
            </div>
            <h3
              className={styles.loadingTitle}
              style={{
                color: customAlert.isError ? "#EF4444" : "var(--text-primary)",
                fontSize: "1.3rem",
                marginBottom: "0.75rem",
                fontWeight: "700",
              }}
            >
              {customAlert.title}
            </h3>
            <p
              className={styles.loadingProgressText}
              style={{
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                fontSize: "0.95rem",
                marginBottom: "1.5rem",
              }}
            >
              {customAlert.message}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: "100%",
                background: customAlert.isError ? "#EF4444" : "#8B5CF6",
                borderColor: customAlert.isError ? "#EF4444" : "#8B5CF6",
              }}
              onClick={() => {
                setCustomAlert(null);
                setCheckoutOpenTime(Date.now()); 
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
