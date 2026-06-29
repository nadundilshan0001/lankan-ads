// ============================================================
// Lankan Ads — Privacy Policy Page
// ============================================================

export const metadata = {
  title: "Privacy Policy | Lankan Ads",
  description:
    "Read the Privacy Policy for Lankan Ads — how we collect, use, and protect your personal data.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const lastUpdated = "June 29, 2026";

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ marginBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "1.5rem" }}>
        <p style={{ color: "var(--color-primary)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
          Legal
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Last updated: {lastUpdated}</p>
      </header>

      <div style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.925rem", display: "flex", flexDirection: "column", gap: "2rem" }}>

        <section>
          <h2 style={h2Style}>1. Introduction</h2>
          <p>
            <strong style={{ color: "var(--text-primary)" }}>Lankan Ads</strong> ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform. By using the Platform you consent to the practices described in this Policy.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>2. Information We Collect</h2>
          <p style={{ marginBottom: "0.75rem" }}>We collect the following categories of information:</p>

          <h3 style={h3Style}>2.1 Information You Provide</h3>
          <ul style={ulStyle}>
            <li><strong style={{ color: "var(--text-primary)" }}>Mobile phone number</strong> — used for account registration and OTP verification</li>
            <li><strong style={{ color: "var(--text-primary)" }}>Password</strong> — stored as a salted PBKDF2-SHA512 hash; never stored in plain text</li>
            <li><strong style={{ color: "var(--text-primary)" }}>Advertisement content</strong> — title, description, images, price, location, and contact number you submit</li>
            <li><strong style={{ color: "var(--text-primary)" }}>Payment information</strong> — transaction details processed by PayHere (we do not store card numbers)</li>
          </ul>

          <h3 style={{ ...h3Style, marginTop: "1rem" }}>2.2 Information Collected Automatically</h3>
          <ul style={ulStyle}>
            <li><strong style={{ color: "var(--text-primary)" }}>IP address</strong> — collected for security, rate limiting, and fraud prevention</li>
            <li><strong style={{ color: "var(--text-primary)" }}>Browser and device information</strong> — user agent, viewport size</li>
            <li><strong style={{ color: "var(--text-primary)" }}>Usage data</strong> — pages visited, advertisements viewed, interactions with the Platform</li>
            <li><strong style={{ color: "var(--text-primary)" }}>Cookies</strong> — session cookie for authentication and age verification cookie</li>
          </ul>
        </section>

        <section>
          <h2 style={h2Style}>3. How We Use Your Information</h2>
          <ul style={ulStyle}>
            <li>To create and manage your account</li>
            <li>To publish and display your advertisements</li>
            <li>To process payments via PayHere</li>
            <li>To send OTP verification codes via SMS</li>
            <li>To prevent fraud, abuse, and unauthorised access</li>
            <li>To comply with legal obligations</li>
            <li>To improve the Platform's functionality and user experience</li>
            <li>To send service-related communications (account activity, ad expiry)</li>
          </ul>
        </section>

        <section>
          <h2 style={h2Style}>4. Sharing Your Information</h2>
          <p>We do not sell your personal data. We may share your information with:</p>
          <ul style={ulStyle}>
            <li><strong style={{ color: "var(--text-primary)" }}>Payment processors</strong> — PayHere, to process advertisement fees</li>
            <li><strong style={{ color: "var(--text-primary)" }}>SMS providers</strong> — to deliver OTP verification codes to your phone</li>
            <li><strong style={{ color: "var(--text-primary)" }}>Cloud infrastructure</strong> — Supabase (database hosting) and Cloudinary (image storage)</li>
            <li><strong style={{ color: "var(--text-primary)" }}>Law enforcement</strong> — when required by applicable law or to protect the safety of users</li>
          </ul>
          <p style={{ marginTop: "0.75rem" }}>
            Your contact number on advertisements is <strong style={{ color: "var(--text-primary)" }}>visible to the public</strong> as part of your listing. Do not include sensitive personal information you do not wish to be publicly visible.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>5. Cookies</h2>
          <p>We use the following cookies:</p>
          <ul style={ulStyle}>
            <li><strong style={{ color: "var(--text-primary)" }}>admin_session</strong> — HttpOnly, Secure session token for admin panel access</li>
            <li><strong style={{ color: "var(--text-primary)" }}>age_verified</strong> — stores your 18+ age confirmation for 24 hours</li>
          </ul>
          <p style={{ marginTop: "0.75rem" }}>
            Authentication tokens for regular users are stored in <code style={{ color: "var(--color-primary)", background: "rgba(139,92,246,0.1)", padding: "0.1rem 0.3rem", borderRadius: "4px" }}>localStorage</code>. You can clear these at any time through your browser settings.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>6. Data Retention</h2>
          <ul style={ulStyle}>
            <li>Account information is retained for as long as your account is active</li>
            <li>Advertisement data is retained for 90 days after expiry before deletion</li>
            <li>OTP codes expire automatically after 5 minutes</li>
            <li>Payment records are retained for 7 years for financial compliance</li>
          </ul>
        </section>

        <section>
          <h2 style={h2Style}>7. Security</h2>
          <p>
            We implement industry-standard security measures including:
          </p>
          <ul style={ulStyle}>
            <li>Passwords hashed with PBKDF2-SHA512 and a unique random salt per user</li>
            <li>HTTPS encryption for all data in transit</li>
            <li>HttpOnly, Secure cookies for admin sessions</li>
            <li>Rate limiting on authentication endpoints</li>
            <li>Input sanitisation to prevent XSS and injection attacks</li>
            <li>Content Security Policy (CSP) headers</li>
          </ul>
          <p style={{ marginTop: "0.75rem" }}>
            Despite these measures, no system is 100% secure. We cannot guarantee the absolute security of your data.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul style={ulStyle}>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate personal data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for data processing where consent is the legal basis</li>
          </ul>
          <p style={{ marginTop: "0.75rem" }}>
            To exercise these rights, contact us at{" "}
            <a href="mailto:support@lankan-ads.lk" style={{ color: "var(--color-primary)" }}>
              support@lankan-ads.lk
            </a>
            .
          </p>
        </section>

        <section>
          <h2 style={h2Style}>9. Children's Privacy</h2>
          <p>
            The Platform is strictly for individuals aged 18 and over. We do not knowingly collect personal information from anyone under 18. If you believe we have inadvertently collected such information, please contact us immediately and we will delete it.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the "Last updated" date. Continued use of the Platform after changes are posted constitutes acceptance of the updated Policy.
          </p>
        </section>

        <section>
          <h2 style={h2Style}>11. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact:{" "}
            <a href="mailto:support@lankan-ads.lk" style={{ color: "var(--color-primary)" }}>
              support@lankan-ads.lk
            </a>
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

const h3Style: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "var(--text-primary)",
  marginBottom: "0.5rem",
};

const ulStyle: React.CSSProperties = {
  paddingLeft: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
};
