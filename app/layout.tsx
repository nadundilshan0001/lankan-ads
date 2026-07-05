import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SITE_CONFIG } from "@/lib/constants";
import {
  generateWebsiteSchema,
  generateOrganizationSchema,
} from "@/lib/seo/structured-data";
import SchemaMarkup from "@/components/SchemaMarkup";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgeGate from "@/components/AgeGate";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-Z5JJRSP34K";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  icons: {
    icon: [{ url: "/logo/logo-dark-mode.svg", type: "image/svg+xml" }],
    shortcut: "/logo/logo-dark-mode.svg",
    apple: "/logo/logo-dark-mode.svg",
  },
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Sri Lanka classified ads",
    "personal services Sri Lanka",
    "spa wellness Colombo",
    "marriage proposals Sri Lanka",
    "Lankan ads",
    "Colombo services",
    "Sri Lanka massage",
    "lankanads.lk",
    "classified ads LK",
    "adult ads Sri Lanka",
    "personal ads Colombo",
    "free classified ads Sri Lanka",
  ],
  authors: [{ name: SITE_CONFIG.name, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  // Add your Google Search Console verification code here once you have it:
  verification: { google: "HX9hJNG1gILxzqngRgtkVE5R_wd9ewbXhV_khUojrSE" },
  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      "en-LK": SITE_CONFIG.url,
      "si-LK": `${SITE_CONFIG.url}/si`,
      "ta-LK": `${SITE_CONFIG.url}/ta`,
      "x-default": SITE_CONFIG.url,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} — Sri Lanka's #1 Classified Ads Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`],
    site: "@lankanads",
    creator: "@lankanads",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  width: "device-width",
  initialScale: 1,
};

import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en-LK">
      <head>
        {/* Performance: preconnect to external origins for faster LCP */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Geo targeting: Sri Lanka */}
        <meta name="geo.region" content="LK" />
        <meta name="geo.country" content="Sri Lanka" />
        <meta name="geo.placename" content="Sri Lanka" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="3 days" />
        <meta name="rating" content="adult" />
        <SchemaMarkup
          data={[generateWebsiteSchema(), generateOrganizationSchema()]}
        />
      </head>
      <body>
        <NextTopLoader
          color="#8b5cf6"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #8b5cf6,0 0 5px #8b5cf6"
        />
        {!isAdmin && <AgeGate />}
        {!isAdmin && <Header />}
        <main id="main-content">{children}</main>
        {!isAdmin && <Footer />}

        {/* Google Analytics 4 — loads after page is interactive (non-blocking) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              cookie_flags: 'SameSite=None;Secure',
            });
          `}
        </Script>
      </body>
    </html>
  );
}
