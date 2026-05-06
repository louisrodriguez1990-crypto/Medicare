/**
 * Step 4: Pre-compute reimbursement values for the top-N CPTs × all states and dump JSON
 * for `generateStaticParams`. Lets SSG run without a Postgres connection at build time
 * (Vercel build environments can be ephemeral).
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { calculateReimbursement } from "../lib/cms/calc";
import { CptCodeSchema, GpciSchema, type CptCode, type Gpci } from "../lib/cms/schema";
import { STATES, STATE_PRIMARY_LOCALITY } from "../lib/cms/locality";

const TOP_N = parseInt(process.env.SSG_TOP_N ?? "1000", 10);

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = postgres(url, { ssl: "require", prepare: false });

  const cptRows = await sql<any[]>`
    select code, short_description, long_description, status, global_days,
           work_rvu, pe_rvu_non_facility, pe_rvu_facility, mp_rvu,
           modifiers, bilateral_indicator, specialty_taxonomy, source_year, source_file
    from cpt_codes order by popularity desc nulls last limit ${TOP_N}
  `;

  const cpts: CptCode[] = cptRows.map((r) =>
    CptCodeSchema.parse({
      code: r.code,
      shortDescription: r.short_description,
      longDescription: r.long_description,
      status: r.status,
      globalDays: r.global_days,
      rvu: {
        workRvu: Number(r.work_rvu),
        peRvuNonFacility: Number(r.pe_rvu_non_facility),
        peRvuFacility: Number(r.pe_rvu_facility),
        mpRvu: Number(r.mp_rvu),
      },
      modifiers: r.modifiers,
      bilateralIndicator: r.bilateral_indicator ?? undefined,
      specialtyTaxonomy: r.specialty_taxonomy,
      sourceYear: r.source_year,
      sourceFile: r.source_file,
    })
  );

  const gpciRows = await sql<any[]>`
    select locality_code, locality_name, state, work_gpci, pe_gpci, mp_gpci from gpci
  `;
  const gpcis: Gpci[] = gpciRows.map((r) =>
    GpciSchema.parse({
      localityCode: r.locality_code,
      localityName: r.locality_name,
      state: r.state,
      workGpci: Number(r.work_gpci),
      peGpci: Number(r.pe_gpci),
      mpGpci: Number(r.mp_gpci),
    })
  );

  const gpciByLocality = new Map(gpcis.map((g) => [g.localityCode, g] as const));

  const rates: Array<{ code: string; state: string; nonFacilityPrice: number; facilityPrice: number }> = [];
  for (const cpt of cpts) {
    for (const state of STATES) {
      const localityCode = STATE_PRIMARY_LOCALITY[state.abbr];
      const gpci = gpciByLocality.get(localityCode);
      if (!gpci) continue;
      const r = calculateReimbursement({ cpt, gpci });
      rates.push({
        code: cpt.code,
        state: state.abbr,
        nonFacilityPrice: r.nonFacilityPrice,
        facilityPrice: r.facilityPrice,
      });
    }
  }

  const outDir = path.join(process.cwd(), "data", "seed");
  await mkdir(outDir, { recursive: true });
  await writeFile(
    path.join(outDir, "top-cpts.json"),
    JSON.stringify(cpts.slice(0, TOP_N), null, 2),
    "utf8"
  );
  await writeFile(
    path.join(outDir, "top-rates.json"),
    JSON.stringify(rates, null, 2),
    "utf8"
  );
  console.log(`[04-precompute] wrote ${cpts.length} cpts, ${rates.length} rates`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
