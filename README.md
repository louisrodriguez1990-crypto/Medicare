# Medicare HCPCS Reimbursement — pSEO + AdSense

Programmatic SEO platform that publishes 2026 Medicare reimbursement rates for **HCPCS Level II codes only** (the public-domain Medicare-specific codes — G-codes, J-codes for drugs, A/B-codes for supplies, E/K/L-codes for DMEPOS), locality-adjusted to all 50 states + territories. Built on Next.js 15 (App Router) with ISR + fallback so the top ~1,000 codes statically prerender at build time and the long tail (~365K URLs at the HCPCS-only matrix size) renders on-demand and caches at the edge.

Monetization: Google AdSense (top / mid-article / end ad slots, CLS-safe) + GA4 + Search Console.

CPT codes (the AMA-copyrighted 5-digit numeric codes) are intentionally excluded.

## Stack
- **Framework:** Next.js 15.5 App Router, Node 20
- **DB:** Postgres (Neon / Supabase) — falls back to seed fixtures when unset
- **Cache:** Upstash Redis (per HCPCS × state)
- **Styling:** Tailwind CSS
- **Tests:** Vitest

## Routes
- `/` — homepage with featured HCPCS lookups
- `/reimbursement/[code]/[state]` — canonical rate page (e.g. `/reimbursement/G0438/texas`)
- `/medical-billing-codes/[specialty]/[code]` — specialty pivot (canonical → `/reimbursement/...`)
- `/methodology`, `/about`, `/privacy` — required AdSense / E-E-A-T pages
- `/api/revalidate` — HMAC-signed on-demand revalidation webhook
- `/sitemap.xml`, `/robots.txt`

## What every CPT page renders
1. Above-fold `ReimbursementCard` with non-facility / facility allowed amounts
2. Top AdSense slot (CLS-safe reserved height)
3. RVU table with GPCI multipliers
4. **~700-word deterministic content section** (`lib/content/sections.ts`) — overview, rate detail vs national, place-of-service explainer, math walkthrough, modifier glossary, global period, related-codes internal links, state context
5. Mid-article AdSense slot (`in-article` layout)
6. GPCI slider (client island for cross-locality estimation)
7. B2B billing-tools callout
8. End-of-article AdSense slot
9. Server-side JSON-LD `@graph`: `WebPage`, `Article`, `Dataset` (CMS-cited), `BreadcrumbList`, `FAQPage`, `Organization`

## Local Development

```bash
npm install
cp .env.example .env.local        # leave blank for fixture-only mode
npm run dev
# open http://localhost:3000/reimbursement/G0438/texas
```

Without `DATABASE_URL` / `UPSTASH_*`, the app falls back to seed fixtures (22 HCPCS codes × 5 states) — enough to render every template. AdSense slots render labelled placeholders when `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is unset.

## Tests

```bash
npm test                  # vitest: calc, schema, JSON-LD, content sections (>=600 words/page)
npm run verify            # determinism smoke test
```

## ETL (Production CMS Data Load)

```bash
cp etl/sources.example.json etl/sources.json    # paste 2026 CMS download URLs
DATABASE_URL=postgres://... npm run etl
```

The normalize step (`etl/02-normalize.ts`) automatically filters to HCPCS Level II — any 5-digit numeric CPT codes from the PPRRVU file are dropped.

## Going to production — checklist

**AdSense / SEO blockers:**
- [ ] Custom domain on Vercel
- [ ] Provision Postgres + Upstash Redis; populate env
- [ ] Run `npm run etl` against real 2026 CMS files
- [ ] Verify the 2026 conversion factor in `lib/cms/schema.ts` matches the CMS Final Rule
- [ ] Submit sitemap to Google Search Console + Bing Webmaster
- [ ] Apply for AdSense (needs the site published, indexed, and ~30+ pages of substantive content)
- [ ] After AdSense approval, paste publisher ID into `NEXT_PUBLIC_ADSENSE_CLIENT_ID` and slot IDs

**Quality / traffic blockers:**
- [ ] Bump `SSG_TOP_N` (e.g. 1000) and verify build time stays sane
- [ ] Switch `app/sitemap.ts` to `generateSitemaps()` chunked output once the matrix exceeds ~50K URLs
- [ ] Internal linking: cross-link related-code clusters, state pivots, specialty pivots
- [ ] Lighthouse audit on production URL (target LCP < 2.5s, CLS < 0.1)

**Compliance:**
- [ ] No medical-advice copy anywhere; all content is reference / billing
- [ ] Privacy policy at `/privacy` reflects which trackers are actually live
- [ ] Non-affiliation disclaimer rendered persistently in the footer
