import cptSeed from "@/data/seed/cpt-codes.json";
import gpciSeed from "@/data/seed/gpci.json";
import { CptCodeSchema, GpciSchema, type CptCode, type Gpci } from "@/lib/cms/schema";

let _cpts: CptCode[] | null = null;
let _gpcis: Gpci[] | null = null;

export function getSeedCpts(): CptCode[] {
  if (_cpts) return _cpts;
  _cpts = (cptSeed as unknown[]).map((row) => CptCodeSchema.parse(row));
  return _cpts;
}

export function getSeedGpcis(): Gpci[] {
  if (_gpcis) return _gpcis;
  _gpcis = (gpciSeed as unknown[]).map((row) => GpciSchema.parse(row));
  return _gpcis;
}

export function findSeedCpt(code: string): CptCode | null {
  const upper = code.toUpperCase();
  return getSeedCpts().find((c) => c.code === upper) ?? null;
}

export function findSeedGpci(stateAbbr: string): Gpci | null {
  const upper = stateAbbr.toUpperCase();
  return getSeedGpcis().find((g) => g.state === upper) ?? null;
}
