



import type { Metadata, Viewport } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  icons: {
    icon: [
      { url: "/logo/logo-dark-mode.svg", type: "image/svg+xml" }
    ],
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
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
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
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`],
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
    <html lang="en">
      <head>
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
      </body>
    </html>
  );
}
