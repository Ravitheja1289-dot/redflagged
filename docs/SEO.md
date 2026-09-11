# RedFlaggers — Production SEO & Google Search Console Guide

This document details the technical SEO architecture, privacy safeguards, crawl configurations, and step-by-step procedures for Google Search Console (GSC) verification and indexing for **RedFlaggers**.

---

## 1. Domain & Canonical Architecture

- **Canonical Base URL:** `https://redflaggers.vercel.app`
- **Engine:** Next.js 16 App Router (Turbopack)
- **Metadata API:** Native Next.js 16 Metadata API (`metadataBase`, `generateMetadata`, `MetadataRoute`)

All canonical URLs across the platform resolve strictly to `https://redflaggers.vercel.app`. Local development hosts (`localhost`) and backend infrastructure domains (e.g. Render) are never used in indexable URLs.

---

## 2. Public vs. Private Crawl Boundaries

RedFlaggers handles sensitive community narratives. The platform strictly enforces boundaries between public awareness content and private administration/tokens.

### Public & Indexable Routes
| Route | Title | Description | Frequency |
|---|---|---|---|
| `/` | `RedFlaggers — Recognize the red flags` | Homepage featuring recent vetted community reports | Daily |
| `/reports` | `Explore Experiences \| RedFlaggers` | Primary index / feed of public warning patterns | Daily |
| `/reports/[id]` | `[Dynamic Experience Title] \| RedFlaggers` | Individual approved community experience | Weekly |
| `/about` | `About Our Mission & Methodology \| RedFlaggers` | Educational mission and platform guidelines | Monthly |
| `/safety` | `Safety & Emergency Resources \| RedFlaggers` | Safety notice, emergency contacts, quick exit | Monthly |

### Disallowed & Non-Indexable Routes
The following routes are blocked from search engine crawlers via both `robots.txt` and HTTP/meta `noindex, nofollow, nocache`:
- `/admin` & `/admin/*`: Admin dashboard, queue review, moderation controls.
- `/manage` & `/manage/*`: Secret one-time token links for report authors to edit/delete their reports.
- `/api` & `/api/*`: Internal API endpoints.
- `/submit`: Submission form (`noindex, follow` prevents blank form indexing while allowing link discovery).
- **Unapproved Reports**: Any dynamic report with status `PENDING`, `REJECTED`, or `REMOVED` returns `404 Not Found` and `noindex, nofollow`.

---

## 3. Google Search Console Setup & Verification

Follow these steps to claim and verify RedFlaggers in Google Search Console:

### Step 1: Add Property in Google Search Console
1. Visit [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property**.
3. Select **URL prefix** and enter:
   ```text
   https://redflaggers.vercel.app
   ```
4. Click **Continue**.

### Step 2: HTML Tag Verification
The verification token is configured directly in [`src/app/layout.tsx`](file:///c:/Ravitheja%20Reddy/Github%20Projects%20Collab/Projects/redflag/src/app/layout.tsx):
```html
<meta name="google-site-verification" content="uMo8rfKq2ifc-apz3UxYsu23yJEjuYphBV-L0pz8kTA" />
```
- Active token: `uMo8rfKq2ifc-apz3UxYsu23yJEjuYphBV-L0pz8kTA`
- Next.js automatically outputs this in the root HTML `<head>` on all public pages.
- (Optional): You can also override it via the `GOOGLE_SITE_VERIFICATION` environment variable in Vercel if needed in the future.
- In Google Search Console, simply click **Verify**.

*(Alternative: Domain DNS TXT verification can be configured in your Vercel / DNS registrar settings).*

---

## 4. Submitting the XML Sitemap

RedFlaggers automatically generates a dynamic XML sitemap at:
```text
https://redflaggers.vercel.app/sitemap.xml
```

### How It Works:
- Automatically lists all core static routes (`/`, `/reports`, `/about`, `/safety`).
- Queries Supabase for all reports where `status = 'APPROVED'`.
- Uses real timestamps (`published_at` or `created_at`) for `<lastmod>`.
- Excludes all pending, rejected, removed, or draft reports.
- Revalidates hourly (`export const revalidate = 3600`).

### Submitting to GSC:
1. In Google Search Console, open the **Sitemaps** menu on the left sidebar.
2. Under "Add a new sitemap", type:
   ```text
   sitemap.xml
   ```
3. Click **Submit**.
4. Confirm the status shows **Success**.

---

## 5. Structured Data (JSON-LD)

RedFlaggers includes Schema.org structured data in `src/components/StructuredData.tsx`, injected at the root level:
- **`WebSite`**: Declares platform name, canonical URL, and description.
- **`Organization`**: Declares RedFlaggers organization, purpose, and branded image asset.
- **Compliance**: No synthetic review stars, fake ratings, or deceptive aggregates.

Test your structured data at:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

---

## 6. Social Sharing (Open Graph & Twitter Cards)

- **OpenGraph Image Generator**: `src/app/opengraph-image.tsx` generates dynamic 1200x630 branded editorial cards using `@vercel/og` / `next/og`.
- **Card Type**: `summary_large_image`.
- **Favicons & App Icons**:
  - `src/app/icon.tsx`: 32x32 branded favicon.
  - `src/app/apple-icon.tsx`: 180x180 Apple touch icon.
  - `src/app/manifest.ts`: Web App Manifest with stand-alone mobile compatibility.

---

## 7. Ongoing Maintenance & Monitoring

1. **URL Inspection**:
   - Use the **URL Inspection** tool in GSC on `https://redflaggers.vercel.app/reports` to confirm it is indexed and renders mobile-friendly.
2. **Indexing Requests**:
   - When launching new milestone features, request indexing on `https://redflaggers.vercel.app` via the URL inspection tool.
3. **Core Web Vitals & Mobile Usability**:
   - RedFlaggers has been designed mobile-first with clean semantic tags (`h1`, `header`, `main`, `footer`), responsive typography, and fast Turbopack server rendering. Monitor the **Page Experience** tab in GSC.
