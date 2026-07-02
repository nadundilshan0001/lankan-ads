



import { SITE_CONFIG } from "@/lib/constants";

export const metadata = {
  title: "Terms of Service | Lankan Ads",
  description:
    "Read the Terms of Service for Lankan Ads — Sri Lanka's classified ads platform for personal services, wellness, and more.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_CONFIG.url}/terms` },
};

export default function TermsPage() {
  const lastUpdated = "June 29, 2026";

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ marginBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1.5rem" }}>
        <p style={{ color: "var(--color-primary)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
          Legal
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Terms of Service</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Last updated: {lastUpdated}</p>
      </header>

      <div style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.925rem", display: "flex", flexDirection: "column", gap: "2rem" }}>

        <section>
          <h2 style={h2Style}>1. Acceptance of Terms</h2>
          <p>
            By accessing or using <strong style={{ color: "var(--text-primary)" }}>Lankan Ads</strong> ("the Platform", "we", "us"), you confirm that you are at least 18 years of age and agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use this Platform.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>2. Age Restriction</h2>
          <p>
            This Platform contains adult content. Access is <strong style={{ color: "var(--text-primary)" }}>strictly limited to individuals who are 18 years of age or older</strong>. By using the Platform you declare that you meet this age requirement. It is your responsibility to ensure that your use of this site complies with the laws applicable in your jurisdiction.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>3. User Accounts</h2>
          <p>To post advertisements you must register with a verified Sri Lankan mobile number. You are responsible for:</p>
          <ul style={ulStyle}>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activity that occurs under your account</li>
            <li>Providing accurate and complete information during registration</li>
            <li>Notifying us immediately of any unauthorised use of your account</li>
          </ul>
        </section>

        <section>
          <h2 style={h2Style}>4. Prohibited Content</h2>
          <p>You must not post any advertisement that:</p>
          <ul style={ulStyle}>
            <li>Involves or depicts minors (individuals under 18 years of age) in any sexual or suggestive context</li>
            <li>Promotes human trafficking, forced labour, or non-consensual activities</li>
            <li>Is fraudulent, misleading, or contains false information</li>
            <li>Violates any applicable Sri Lankan law or regulation</li>
            <li>Contains malware, spam, or unsolicited commercial communications</li>
            <li>Infringes on the intellectual property rights of any third party</li>
          </ul>
          <p style={{ marginTop: "0.75rem" }}>
            Violation of these rules will result in immediate removal of your advertisement and permanent suspension of your account. We reserve the right to report illegal content to the relevant authorities.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>5. Advertisement Listings</h2>
          <ul style={ulStyle}>
            <li>All advertisements are subject to review and may be removed at our sole discretion</li>
            <li>Listings are active for 7 days from the date of publication</li>
            <li>Fees paid for advertisements are non-refundable once the ad has been published</li>
            <li>We do not verify, endorse, or guarantee the accuracy of any advertisement</li>
            <li>Users are solely responsible for the content of their advertisements</li>
          </ul>
        </section>

        <section>
          <h2 style={h2Style}>6. Payments</h2>
          <p>
            Payments are processed through <strong style={{ color: "var(--text-primary)" }}>PayHere</strong>, a third-party payment gateway. By making a payment you also agree to PayHere's terms and conditions. Lankan Ads does not store your payment card details. All fees are charged in Sri Lankan Rupees (LKR) and are non-refundable.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>7. Intellectual Property</h2>
          <p>
            All content on the Platform (excluding user-submitted advertisements) — including design, code, logos, and text — is the intellectual property of Lankan Ads. You may not reproduce, distribute, or create derivative works without our written permission.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            By submitting an advertisement you grant Lankan Ads a non-exclusive, worldwide, royalty-free licence to display your content on the Platform.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>8. Disclaimer of Warranties</h2>
          <p>
            The Platform is provided on an "as is" and "as available" basis without warranties of any kind. We do not warrant that the Platform will be uninterrupted, error-free, or free of viruses. We are not responsible for any transactions, meetings, or interactions between users arising from advertisements on the Platform.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>9. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Lankan Ads shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Platform. Our total liability shall not exceed the amount you paid for the specific advertisement in question.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>10. DMCA & Takedown Policy</h2>
          <p>
            If you believe that content on the Platform infringes your copyright, please contact us with: (a) identification of the copyrighted work, (b) identification of the infringing material and its location, (c) your contact information, and (d) a statement that you have a good faith belief that the use is not authorised.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            We will review all valid takedown requests and remove infringing content promptly.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>11. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms of Service at any time. Continued use of the Platform after changes are posted constitutes acceptance of the new terms. The "Last updated" date at the top of this page indicates when changes were last made.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of Sri Lanka. Any disputes arising from your use of the Platform shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>13. Contact</h2>
          <p>
            For questions about these Terms, please contact us at{" "}
            <a href="mailto:info@lankanads.lk" style={{ color: "var(--color-primary)" }}>
              info@lankanads.lk
            </a>
            .
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
