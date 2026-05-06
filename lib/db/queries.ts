import { unstable_cache } from "next/cache";
import { calculateReimbursement } from "@/lib/cms/calc";
import type { CptCode, Reimbursement } from "@/lib/cms/schema";
import { resolveState, type StateMeta } from "@/lib/cms/locality";
import { cacheGet, cacheSet } from "@/lib/cache/redis";
import { findSeedCpt, findSeedGpci, getSeedCpts } from "./seed";
import { getSql, hasDatabase } from "./client";

export async function getCptByCode(code: string): Promise<CptCode | null> {
  const upper = code.toUpperCase();
  if (hasDatabase()) {
    const sql = getSql();
    if (sql) {
      const rows = await sql<CptCode[]>`
        select code, short_description as "shortDescription",
               long_description as "longDescription",
               status, global_days as "globalDays",
               jsonb_build_object(
                 'workRvu', work_rvu,
                 'peRvuNonFacility', pe_rvu_non_facility,
                 'peRvuFacility', pe_rvu_facility,
                 'mpRvu', mp_rvu
               ) as rvu,
               modifiers, bilateral_indicator as "bilateralIndicator",
               specialty_taxonomy as "specialtyTaxonomy",
               source_year as "sourceYear",
               source_file as "sourceFile"
        from cpt_codes where code = ${upper} limit 1
      `;
      return rows[0] ?? null;
    }
  }
  return findSeedCpt(upper);
}

export async function listTopCpts(limit = 1000): Promise<CptCode[]> {
  if (hasDatabase()) {
    const sql = getSql();
    if (sql) {
      // Top by display ad RPM proxy: search volume × specialty breadth, persisted in cpt_codes.popularity
      const rows = await sql<CptCode[]>`
        select code, short_description as "shortDescription",
               long_description as "longDescription",
               status, global_days as "globalDays",
               jsonb_build_object(
                 'workRvu', work_rvu, 'peRvuNonFacility', pe_rvu_non_facility,
                 'peRvuFacility', pe_rvu_facility, 'mpRvu', mp_rvu
               ) as rvu,
               modifiers, specialty_taxonomy as "specialtyTaxonomy",
               source_year as "sourceYear", source_file as "sourceFile"
        from cpt_codes order by popularity desc nulls last limit ${limit}
      `;
      return rows;
    }
  }
  return getSeedCpts().slice(0, limit);
}

export interface RatesResult {
  cpt: CptCode;
  state: StateMeta;
  rates: Reimbursement;
}

export async function getRatesForCptState(
  code: string,
  stateInput: string
): Promise<RatesResult | null> {
  const state = resolveState(stateInput);
  if (!state) return null;
  const cpt = await getCptByCode(code);
  if (!cpt) return null;

  const cacheKey = `cpt:${cpt.code}:${state.abbr}`;
  const cached = await cacheGet<Reimbursement>(cacheKey);
  if (cached) return { cpt, state, rates: cached };

  let gpci: import("@/lib/cms/schema").Gpci | null = null;
  if (hasDatabase()) {
    const sql = getSql();
    if (sql) {
      const rows = await sql<import("@/lib/cms/schema").Gpci[]>`
        select locality_code as "localityCode", locality_name as "localityName",
               state, work_gpci as "workGpci", pe_gpci as "peGpci", mp_gpci as "mpGpci"
        from gpci where state = ${state.abbr} limit 1
      `;
      gpci = rows[0] ?? null;
    }
  }
  if (!gpci) gpci = findSeedGpci(state.abbr);
  if (!gpci) return null;

  const rates = calculateReimbursement({ cpt, gpci });
  await cacheSet(cacheKey, rates);
  return { cpt, state, rates };
}

// Wrap in Next's data cache so repeat requests within the ISR window share work even
// when Redis is unconfigured (dev / preview deployments).
export const getRatesForCptStateCached = unstable_cache(
  async (code: string, state: string) => getRatesForCptState(code, state),
  ["cpt-rates"],
  { revalidate: 86400, tags: ["cpt-rates"] }
);
