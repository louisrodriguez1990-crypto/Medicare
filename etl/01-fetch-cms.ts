/**
 * Step 1: Fetch raw CMS source files into etl/raw/{year}/.
 *
 * The actual CMS download URLs change each year and are gated behind ZIP downloads on
 * cms.gov ("Physician Fee Schedule" download page). We resolve them through a small
 * config file the operator maintains: etl/sources.json (gitignored).
 *
 * Format of etl/sources.json:
 * {
 *   "year": 2026,
 *   "files": [
 *     { "name": "PPRRVU2026.csv", "url": "https://.../RVU26A.zip!PPRRVU2026.csv" },
 *     { "name": "GPCI2026.csv",  "url": "https://.../RVU26A.zip!GPCI2026.csv"  },
 *     { "name": "LOCCO2026.csv", "url": "https://.../RVU26A.zip!LOCCO2026.csv" },
 *     { "name": "HCPC2026.csv",  "url": "https://www.cms.gov/.../HCPC2026.csv" }
 *   ]
 * }
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

interface SourcesFile {
  year: number;
  files: { name: string; url: string }[];
}

async function main() {
  const cfgPath = path.join(process.cwd(), "etl", "sources.json");
  if (!existsSync(cfgPath)) {
    console.error(
      "[01-fetch] Missing etl/sources.json. Create it from the template in etl/01-fetch-cms.ts."
    );
    process.exit(1);
  }
  const cfg: SourcesFile = JSON.parse(await readFile(cfgPath, "utf8"));
  const outDir = path.join(process.cwd(), "etl", "raw", String(cfg.year));
  await mkdir(outDir, { recursive: true });

  for (const f of cfg.files) {
    const dest = path.join(outDir, f.name);
    if (existsSync(dest)) {
      console.log(`[01-fetch] cached ${f.name}`);
      continue;
    }
    console.log(`[01-fetch] downloading ${f.url}`);
    const res = await fetch(f.url);
    if (!res.ok) throw new Error(`fetch failed ${res.status} for ${f.url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    console.log(`[01-fetch] wrote ${dest} (${buf.length} bytes)`);
  }
  console.log("[01-fetch] done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
