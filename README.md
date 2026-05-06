# Medicare CPT pSEO Platform

Programmatic SEO platform that renders 2026 Medicare reimbursement rates for every CPT and HCPCS code, locality-adjusted to all 50 states + territories. Built on Next.js 15 (App Router) with ISR + fallback so the top ~1,000 highest-volume codes are statically generated at build time and the long tail (~500K URLs) is generated on-demand and cached at the edge.

## Stack
- **Framework:** Next.js 15 App Router on Node 20
- **DB:** Postgres (Neon / Supabase) with materialized view for top-N pre-computation
- **Cache:** Upstash Redis (per CPT × state)
- **Styling:** Tailwind CSS
- **Tests:** Vitest

## Routes
- `/reimbursement/[code]/[state]` — canonical rate page (e.g. `/reimbursement/99214/texas`)
- `/medical-billing-codes/[specialty]/[code]` — specialty-pivot, B2B-leaning (canonical → `/reimbursement/...`)
- `/disclosures` — CMS marketing disclosures, agent NPN, editorial policy
- `/api/revalidate` — HMAC-signed on-demand revalidation webhook

## Local Development

```bash
npm install
cp .env.example .env.local        # fill in env (or leave blank for fixture-only mode)
npm run dev
# open http://localhost:3000/reimbursement/99214/texas
```

Without `DATABASE_URL` / `UPSTASH_REDIS_*`, the app falls back to the checked-in seed fixtures under `data/seed/` (top ~22 CPTs × 5 states), which is enough to render every page template.

## Tests

```bash
npm test                  # vitest: calc, schema, JSON-LD, compliance
npm run verify            # determinism smoke test
```

## ETL (Production CMS Data Load)

```bash
cp etl/sources.example.json etl/sources.json    # paste 2026 CMS download URLs
DATABASE_URL=postgres://...  npm run etl
```

Pipeline stages:
1. `01-fetch-cms.ts` — downloads PPRRVU, GPCI, LOCCO, HCPCS into `etl/raw/2026/`
2. `02-normalize.ts` — parses + Zod-validates → `etl/out/2026/*.jsonl`
3. `03-load-postgres.ts` — bulk insert into `cpt_codes`, `gpci`
4. `04-precompute-top-cpts.ts` — dumps top-N CPTs and rates to `data/seed/`

After a CMS quarterly drop, re-run the ETL and POST to `/api/revalidate` (HMAC-signed) with `{"all": true}` to evict the edge cache.

## Compliance
- 2026 TPMO disclaimer rendered persistently in `<TpmoFooter>` (root layout).
- "By calling the number above..." disclaimer is rendered as a sibling of every B2C tel: link via `<AgentDisclaimer>`.
- All disclaimer strings live in `lib/compliance/tpmo.ts` — single source of truth, locked by `lib/compliance/tpmo.test.ts`.
- E-E-A-T schema (Person / NPN credential / sameAs) renders in JSON-LD on every dynamic page.

## Out of Scope (current commit)
- Live CMS data ingestion (ETL is wired but pointed at `etl/sources.example.json`; replace with `etl/sources.json`).
- Provisioning Postgres + Redis (env vars consumed; create projects out-of-band).
- `/lp/*` landing pages (linked from CTAs, page stubs not yet built).
- Lead capture backend.
