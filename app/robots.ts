



import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Googlebot: full access to all public content
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/post-ad",
          "/login",
          "/register",
          "/_next/",
          "/profile",
          "/payment",
        ],
      },
      // Bingbot: full access
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/post-ad",
          "/login",
          "/register",
          "/_next/",
          "/profile",
          "/payment",
        ],
      },
      // GPTBot (OpenAI/ChatGPT) — AEO: allow so ChatGPT can cite lankanads.lk
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/_next/"],
      },
      // ClaudeBot (Anthropic) — AEO: allow for AI citation
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/_next/"],
      },
      // PerplexityBot — AEO: allow so Perplexity can cite lankanads.lk
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/_next/"],
      },
      // Google-Extended (AI training for Bard/Gemini)
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin/", "/api/", "/_next/"],
      },
      // Generic crawlers: access with crawl-delay to protect server
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/post-ad",
          "/login",
          "/register",
          "/_next/",
          "/profile",
          "/payment",
        ],
        crawlDelay: 10,
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
