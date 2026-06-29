// ============================================================
// Lankan Ads — Refund & Cancellation Policy Page
// ============================================================

export const metadata = {
  title: "Refund & Cancellation Policy | Lankan Ads",
  description:
    "Read the Refund, Return, and Cancellation Policy for Lankan Ads.",
  robots: { index: true, follow: true },
};

export default function RefundPage() {
  const lastUpdated = "June 29, 2026";

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ marginBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1.5rem" }}>
        <p style={{ color: "var(--color-primary)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
          Legal
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Refund & Cancellation Policy</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Last updated: {lastUpdated}</p>
      </header>

      <div style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.925rem", display: "flex", flexDirection: "column", gap: "2rem" }}>

        <section>
          <h2 style={h2Style}>1. Overview</h2>
          <p>
            At <strong style={{ color: "var(--text-primary)" }}>Lankan Ads</strong>, we charge fees to publish paid classified advertisements (Standard, Premium, and Platinum tiers) for a fixed period of 7 days. Because our service is digital and delivered immediately upon successful payment, this policy outlines the terms governing refunds, cancellations, and modifications.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>2. Refund Policy</h2>
          <p>
            All payments made to Lankan Ads for listing promotions are <strong style={{ color: "var(--text-primary)" }}>non-refundable</strong>. Once an advertisement goes live on our platform:
          </p>
          <ul style={ulStyle}>
            <li>We cannot offer refunds if you change your mind.</li>
            <li>We cannot offer refunds if you find a customer/client before the 7-day period expires.</li>
            <li>We cannot offer partial refunds for unused days if you choose to pause or delete your listing early.</li>
          </ul>
        </section>

        <section>
          <h2 style={h2Style}>3. Exceptions & Ad Moderation Rejections</h2>
          <p>
            While all advertisements go live immediately, we run automated and manual post-publication moderation audits. If your advertisement is deleted or suspended due to a severe violation of our Terms of Service (such as underage content, illegal services, or fraudulent listings):
          </p>
          <ul style={ulStyle}>
            <li>No refund will be issued.</li>
            <li>Your account may be permanently banned.</li>
          </ul>
          <p style={{ marginTop: "0.75rem" }}>
            If an ad is rejected due to a minor formatting issue (e.g., poor image quality or wrong category placement), we will contact you to correct the listing rather than deleting it.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>4. Cancellation Policy</h2>
          <p>
            You can cancel or delete your listing at any time directly from your user dashboard. 
          </p>
          <ul style={ulStyle}>
            <li>Deleting a listing will immediately remove it from public search results and category pages.</li>
            <li>Deleting a listing is permanent and cannot be undone.</li>
            <li>No refunds will be provided for early cancellations.</li>
          </ul>
        </section>

        <section>
          <h2 style={h2Style}>5. Transaction and Processing Failures</h2>
          <p>
            If you are charged twice for a single listing due to a technical glitch or payment gateway error:
          </p>
          <ul style={ulStyle}>
            <li>Please contact us immediately at <a href="mailto:support@lankan-ads.lk" style={{ color: "var(--color-primary)" }}>support@lankan-ads.lk</a> with your transaction details and order ID.</li>
            <li>We will investigate the issue and process a refund for the duplicate charge within 5-7 working days.</li>
          </ul>
        </section>

        <section>
          <h2 style={h2Style}>6. Contact Us</h2>
          <p>
            If you have questions regarding this policy, please reach out to our team:
            <br />
            Email: <a href="mailto:support@lankan-ads.lk" style={{ color: "var(--color-primary)" }}>support@lankan-ads.lk</a>
          </p>
        </section>

      </div>
    </div>
  );
}

const h2Style: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "var(--text-primary)",
  marginBottom: "0.75rem",
};

const ulStyle: React.CSSProperties = {
  paddingLeft: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
};
