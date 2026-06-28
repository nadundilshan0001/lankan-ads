// ============================================================
// Lankan Ads — Category Icon Component
// Custom high-fidelity SVGs for each classified category
// ============================================================

import React from "react";

interface CategoryIconProps {
  slug: string;
  className?: string;
  size?: number;
}

export default function CategoryIcon({ slug, className, size = 18 }: CategoryIconProps) {
  const props = {
    className,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (slug) {
    case "girls-personal":
      // Elegant female profile icon
      return (
        <svg {...props}>
          <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
          <path d="M19 21a7 7 0 0 0-14 0" />
          <circle cx="12" cy="7" r="1" />
          <path d="M12 12v3m-2-1.5h4" />
        </svg>
      );

    case "boys-personal":
      // Elegant male profile icon
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );

    case "shemale-personal":
      // Transgender symbol
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 16v6M9 19h6M14.8 9.2l4.7-4.7M19 4h-4M19 4v4" />
          <path d="M9.2 9.2L4.5 4.5M4 4h4M4 4v4" />
          <path d="M6.5 6.5l4-4M13.5 2.5l4 4" />
        </svg>
      );

    case "marriage-proposals":
      // Two intertwined wedding rings
      return (
        <svg {...props}>
          <circle cx="9" cy="14" r="5" />
          <circle cx="15" cy="10" r="5" />
        </svg>
      );

    case "live-cam":
    case "live-cam-show":
      // Video camera
      return (
        <svg {...props}>
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );

    case "spa-wellness":
      // Lotus flower outline
      return (
        <svg {...props}>
          <path d="M12 3c-1.2 2.5-3.6 4.5-6 6.5C4 11 3 13 3 15a9 9 0 0 0 18 0c0-2-1-4-3-5.5-2.4-2-4.8-4-6-6.5z" />
          <path d="M12 21V9" />
          <path d="M12 12c-1.5.5-3 1.5-4 3m4-3c1.5.5 3 1.5 4 3" />
        </svg>
      );

    case "cuckold-couples":
      // Two people silhouette with a mutual overlay/heart
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case "gay":
      // Intertwined double male gender symbols
      return (
        <svg {...props}>
          <circle cx="8" cy="14" r="4" />
          <circle cx="15" cy="10" r="4" />
          <path d="M10.8 10.8l4.7-4.7M19 4h-4M19 4v4" />
          <path d="M4.5 17.5l-2 2" />
        </svg>
      );

    default:
      // Fallback search/tag icon
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
  }
}
