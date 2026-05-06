/**
 * Step 3: Bulk-load normalized JSONL into Postgres.
 *
 * Schema (idempotent CREATE):
 *   cpt_codes    (code PK, ..., popularity int)
 *   gpci         (locality_code PK, state, ...)
 *   locality_state (state PK -> primary_locality_code)
 *
 * After load, refreshes the materialized view used for SSG slate generation.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const DDL = `
CREATE TABLE IF NOT EXISTS cpt_codes (
  code text PRIMARY KEY,
  short_description text NOT NULL,
  long_description text NOT NULL,
  status text NOT NULL,
  global_days text NOT NULL,
  work_rvu numeric NOT NULL,
  pe_rvu_non_facility numeric NOT NULL,
  pe_rvu_facility numeric NOT NULL,
  mp_rvu numeric NOT NULL,
  modifiers text[] NOT NULL DEFAULT '{}',
  bilateral_indicator text,
  specialty_taxonomy text[] NOT NULL DEFAULT '{}',
  source_year int NOT NULL,
  source_file text NOT NULL,
  popularity int
);

CREATE TABLE IF NOT EXISTS gpci (
  locality_code text PRIMARY KEY,
  locality_name text NOT NULL,
  state text NOT NULL,
  work_gpci numeric NOT NULL,
  pe_gpci numeric NOT NULL,
  mp_gpci numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS locality_state (
  state text PRIMARY KEY,
  primary_locality_code text NOT NULL REFERENCES gpci(locality_code)
);

CREATE INDEX IF NOT EXISTS gpci_state_idx ON gpci(state);
CREATE INDEX IF NOT EXISTS cpt_codes_pop_idx ON cpt_codes(popularity DESC);
`;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = postgres(url, { ssl: "require", prepare: false });
  const year = parseInt(process.env.CMS_YEAR ?? "2026", 10);
  const outDir = path.join(process.cwd(), "etl", "out", String(year));

  await sql.unsafe(DDL);

  const cptLines = (await readFile(path.join(outDir, "cpt-codes.jsonl"), "utf8"))
    .split("\n")
    .filter(Boolean);
  const gpciLines = (await readFile(path.join(outDir, "gpci.jsonl"), "utf8"))
    .split("\n")
    .filter(Boolean);

  console.log(`[03-load] loading ${cptLines.length} CPTs into Postgres`);
  await sql`TRUNCATE cpt_codes`;
  for (let i = 0; i < cptLines.length; i += 500) {
    const chunk = cptLines.slice(i, i + 500).map((l) => JSON.parse(l));
    await sql`
      INSERT INTO cpt_codes ${sql(chunk.map((c: any) => ({
        code: c.code,
        short_description: c.shortDescription,
        long_description: c.longDescription,
        status: c.status,
        global_days: c.globalDays,
        work_rvu: c.rvu.workRvu,
        pe_rvu_non_facility: c.rvu.peRvuNonFacility,
        pe_rvu_facility: c.rvu.peRvuFacility,
        mp_rvu: c.rvu.mpRvu,
        modifiers: c.modifiers,
        bilateral_indicator: c.bilateralIndicator ?? null,
        specialty_taxonomy: c.specialtyTaxonomy,
        source_year: c.sourceYear,
        source_file: c.sourceFile,
      })))}
    `;
  }

  console.log(`[03-load] loading ${gpciLines.length} GPCIs`);
  await sql`TRUNCATE gpci CASCADE`;
  const gpciRows = gpciLines.map((l) => JSON.parse(l));
  for (let i = 0; i < gpciRows.length; i += 500) {
    const chunk = gpciRows.slice(i, i + 500);
    await sql`
      INSERT INTO gpci ${sql(chunk.map((g: any) => ({
        locality_code: g.localityCode,
        locality_name: g.localityName,
        state: g.state,
        work_gpci: g.workGpci,
        pe_gpci: g.peGpci,
        mp_gpci: g.mpGpci,
      })))}
    `;
  }

  console.log("[03-load] done");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
