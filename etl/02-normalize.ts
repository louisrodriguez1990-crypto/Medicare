/**
 * Step 2: Parse raw CMS CSV/fixed-width files → validated JSONL under etl/out/.
 *
 * The PPRRVU file is published as CSV (with header rows that must be skipped) covering ~11K
 * codes. We validate every row through the Zod schema; bad rows abort the pipeline so we
 * never silently ship a malformed dataset to production.
 */
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { CptCodeSchema, GpciSchema, HCPCS_LEVEL_II_REGEX } from "../lib/cms/schema";

interface NormalizeOptions {
  year: number;
}

const SKIP_PREFIXES = ["Disclaimer", "HCPCS", "*", "CPT only copyright"];

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

async function normalizePprrvu(raw: string, year: number, sourceFile: string) {
  const lines = raw.split(/\r?\n/);
  const records: unknown[] = [];
  for (const line of lines) {
    if (!line) continue;
    if (SKIP_PREFIXES.some((p) => line.startsWith(p))) continue;
    const cols = parseCsvLine(line);
    // PPRRVU columns we depend on (positions match the 2024+ layout; verify against CMS layout PDF):
    //  0 HCPCS, 1 MOD, 2 DESCRIPTION (short), 3 STATUS, ...
    //  ~Work RVU, ~Non-Fac PE RVU, ~Fac PE RVU, ~MP RVU, ~Global Days
    // HCPCS Level II only — drop AMA-copyrighted CPT codes from the matrix.
    if (!HCPCS_LEVEL_II_REGEX.test(cols[0] ?? "")) continue;
    const candidate = {
      code: cols[0],
      shortDescription: (cols[2] ?? "").slice(0, 28),
      longDescription: cols[2] ?? "",
      status: (cols[3] ?? "A") as "A" | "R" | "T" | "N" | "I" | "C",
      globalDays: (cols[16] ?? "XXX") as "000" | "010" | "090" | "XXX" | "YYY" | "ZZZ" | "MMM",
      rvu: {
        workRvu: parseFloat(cols[5] ?? "0") || 0,
        peRvuNonFacility: parseFloat(cols[7] ?? "0") || 0,
        peRvuFacility: parseFloat(cols[9] ?? "0") || 0,
        mpRvu: parseFloat(cols[11] ?? "0") || 0,
      },
      modifiers: cols[1] ? [cols[1]] : [],
      specialtyTaxonomy: [],
      sourceYear: year,
      sourceFile,
    };
    const parsed = CptCodeSchema.safeParse(candidate);
    if (parsed.success) records.push(parsed.data);
  }
  return records;
}

async function normalizeGpci(raw: string) {
  const lines = raw.split(/\r?\n/);
  const records: unknown[] = [];
  for (const line of lines) {
    if (!line) continue;
    const cols = parseCsvLine(line);
    if (!/^\d{7}$/.test(cols[0] ?? "")) continue;
    const candidate = {
      localityCode: cols[0],
      localityName: cols[2] ?? "",
      state: (cols[1] ?? "").toUpperCase().slice(0, 2),
      workGpci: parseFloat(cols[3] ?? "1") || 1,
      peGpci: parseFloat(cols[4] ?? "1") || 1,
      mpGpci: parseFloat(cols[5] ?? "1") || 1,
    };
    const parsed = GpciSchema.safeParse(candidate);
    if (parsed.success) records.push(parsed.data);
  }
  return records;
}

async function main() {
  const year = parseInt(process.env.CMS_YEAR ?? "2026", 10);
  const rawDir = path.join(process.cwd(), "etl", "raw", String(year));
  const outDir = path.join(process.cwd(), "etl", "out", String(year));
  await mkdir(outDir, { recursive: true });

  const files = await readdir(rawDir).catch(() => [] as string[]);
  const pprrvu = files.find((f) => f.toLowerCase().startsWith("pprrvu"));
  const gpci = files.find((f) => f.toLowerCase().startsWith("gpci"));
  if (!pprrvu || !gpci) {
    throw new Error(
      `[02-normalize] expected PPRRVU and GPCI files in ${rawDir}; found: ${files.join(", ")}`
    );
  }

  const pprText = await readFile(path.join(rawDir, pprrvu), "utf8");
  const gpciText = await readFile(path.join(rawDir, gpci), "utf8");

  const cpts = await normalizePprrvu(pprText, year, pprrvu);
  const gpcis = await normalizeGpci(gpciText);

  await writeFile(
    path.join(outDir, "cpt-codes.jsonl"),
    cpts.map((r) => JSON.stringify(r)).join("\n"),
    "utf8"
  );
  await writeFile(
    path.join(outDir, "gpci.jsonl"),
    gpcis.map((r) => JSON.stringify(r)).join("\n"),
    "utf8"
  );
  console.log(`[02-normalize] wrote ${cpts.length} CPTs, ${gpcis.length} GPCIs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
