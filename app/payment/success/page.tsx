"use client";






import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [status, setStatus] = useState<"loading" | "success" | "pending">("loading");

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setStatus("success");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {status === "loading" ? (
          <>
            <div className={styles.spinner} />
            <h1 className={styles.title}>Confirming Payment…</h1>
            <p className={styles.text}>Please wait while we confirm your payment.</p>
          </>
        ) : (
          <>
            <div className={styles.icon}>✓</div>
            <h1 className={styles.title}>Payment Successful!</h1>
            <p className={styles.text}>
              Your advertisement is now <strong className={styles.live}>live</strong> and visible to
              everyone on Lankan Ads.
            </p>
            {orderId && (
              <p className={styles.orderId}>Order ID: <strong>{orderId}</strong></p>
            )}
            <div className={styles.actions}>
              <Link href="/" className="btn btn-primary">
                Browse All Ads
              </Link>
              <Link href="/profile" className="btn btn-secondary">
                View My Ads
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
