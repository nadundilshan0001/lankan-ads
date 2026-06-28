# Lankan Ads Logo Directory

Please place your generated logo files in this directory. Since your logo is **1:1 (square)**, here are the standard dimensions and filenames required for different areas of the website to ensure crisp rendering and full mobile responsiveness:

## 1. Web App & Browser Icons (Root / Meta)
* **`favicon.ico`** (Size: `32x32` px)
  * Placement: Copy this directly to the `public/` directory (replace existing if any). This shows in browser tabs.
* **`apple-touch-icon.png`** (Size: `180x180` px)
  * Placement: Place in this folder. Used by iOS devices when users save the site to their home screen.
* **`icon-192.png`** (Size: `192x192` px)
  * Placement: Place in this folder. Standard size for Android devices and web app installations.
* **`icon-512.png`** (Size: `512x512` px)
  * Placement: Place in this folder. High-resolution app icon used for splash screens.

## 2. Page & Layout Logos (Interface)
* **`logo-nav.png`** (Size: `40x40` px or `80x80` px at 2x resolution)
  * Placement: Place in this folder. Used in the Top Header Navigation bar.
* **`logo-footer.png`** (Size: `96x96` px or `192x192` px at 2x resolution)
  * Placement: Place in this folder. Used in the Footer branding area.
* **`logo-og.png`** (Size: `512x512` px)
  * Placement: Place in this folder. Used as a high-resolution preview fallback for social media share links.

---

### Tips for Mobile Responsiveness:
* **Vector Preferred**: If you have the logo as a `.svg`, place it here as **`logo.svg`**. SVG scales infinitely without quality loss and is highly recommended!
* **High Pixel Density (Retina)**: For PNG images, it's best to export them at 2x their target display size (e.g. export at `80x80` px for a `40x40` px navbar container) so they look perfectly sharp on modern smartphones.
