import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          
          { key: "X-Content-Type-Options", value: "nosniff" },
          
          { key: "X-Frame-Options", value: "DENY" },
          
          { key: "X-XSS-Protection", value: "1; mode=block" },
          
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // GA4 requires googletagmanager.com and google-analytics.com
              process.env.NODE_ENV === "production"
                ? "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https: https://www.google-analytics.com https://www.googletagmanager.com",
              // GA4 sends data to google-analytics.com and region-specific analytics endpoints
              "connect-src 'self' https://*.supabase.co https://api.cloudinary.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://region1.google-analytics.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
