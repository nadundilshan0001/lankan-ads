"use client";





import { useState } from "react";
import styles from "./ReportAdButton.module.css";

const REPORT_REASONS = [
  "Illegal or prohibited content",
  "Underage person involved",
  "Fraud or scam",
  "Spam or duplicate ad",
  "Misleading or false information",
  "Harassment or abuse",
  "Other",
];

interface Props {
  adId: string;
}

export default function ReportAdButton({ adId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleOpen = () => {
    setIsOpen(true);
    setDone(false);
    setError("");
    setSelectedReason("");
    setOtherText("");
  };

  const handleClose = () => {
    if (!loading) setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reason = selectedReason === "Other" ? otherText : selectedReason;
    if (!reason.trim()) {
      setError("Please select or describe a reason.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/ads/${adId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDone(true);
      } else {
        setError(data.error || "Failed to submit report. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className={styles.triggerBtn} id="report-ad" onClick={handleOpen}>
        ⚑ Report this ad
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {done ? (
              <div className={styles.doneState}>
                <span className={styles.doneIcon}>✓</span>
                <h3 className={styles.doneTitle}>Report Submitted</h3>
                <p className={styles.doneText}>
                  Thank you for helping keep Lankan Ads safe. Our team will review this report.
                </p>
                <button className={styles.closeBtn} onClick={handleClose}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle} id="report-modal-title">Report This Ad</h3>
                  <button className={styles.dismissBtn} onClick={handleClose} aria-label="Close">✕</button>
                </div>
                <p className={styles.modalDescription}>
                  Help us keep the platform safe. Select the reason for reporting this ad.
                </p>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.reasonList}>
                    {REPORT_REASONS.map((reason) => (
                      <label key={reason} className={`${styles.reasonOption} ${selectedReason === reason ? styles.selected : ""}`}>
                        <input
                          type="radio"
                          name="report-reason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={() => setSelectedReason(reason)}
                          className={styles.radioInput}
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  {selectedReason === "Other" && (
                    <textarea
                      className={styles.otherInput}
                      placeholder="Please describe the issue..."
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      rows={3}
                      maxLength={500}
                      autoFocus
                    />
                  )}

                  {error && <p className={styles.errorMsg}>{error}</p>}

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || !selectedReason}
                    id="report-submit"
                  >
                    {loading ? (
                      <span className={styles.spinner} />
                    ) : (
                      "Submit Report"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
