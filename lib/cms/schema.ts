import { z } from "zod";

export const GlobalDays = z.enum(["000", "010", "090", "XXX", "YYY", "ZZZ", "MMM"]);
export type GlobalDays = z.infer<typeof GlobalDays>;

export const RvuSchema = z.object({
  workRvu: z.number().nonnegative(),
  peRvuNonFacility: z.number().nonnegative(),
  peRvuFacility: z.number().nonnegative(),
  mpRvu: z.number().nonnegative(),
});
export type Rvu = z.infer<typeof RvuSchema>;

export const GpciSchema = z.object({
  localityCode: z.string(),
  localityName: z.string(),
  state: z.string().length(2),
  workGpci: z.number(),
  peGpci: z.number(),
  mpGpci: z.number(),
});
export type Gpci = z.infer<typeof GpciSchema>;

export const CptCodeSchema = z.object({
  code: z.string().regex(/^[0-9A-Z]{5}$/),
  shortDescription: z.string().max(28),
  longDescription: z.string(),
  status: z.enum(["A", "R", "T", "N", "I", "C"]),
  globalDays: GlobalDays,
  rvu: RvuSchema,
  modifiers: z.array(z.string()).default([]),
  bilateralIndicator: z.enum(["0", "1", "2", "3", "9"]).optional(),
  multipleProcedureIndicator: z.string().optional(),
  specialtyTaxonomy: z.array(z.string()).default([]),
  sourceYear: z.number().int(),
  sourceFile: z.string(),
});
export type CptCode = z.infer<typeof CptCodeSchema>;

export const ReimbursementSchema = z.object({
  code: z.string(),
  state: z.string().length(2),
  localityCode: z.string(),
  conversionFactor: z.number(),
  nonFacilityPrice: z.number(),
  facilityPrice: z.number(),
  computedAt: z.string().datetime(),
  formulaVersion: z.literal("2026.1"),
});
export type Reimbursement = z.infer<typeof ReimbursementSchema>;

export const FORMULA_VERSION = "2026.1" as const;

// 2026 CMS Final Rule Conversion Factor placeholder. ETL must overwrite from CMS PFS Final Rule
// before any production deploy. Holding the constant in one place keeps the rest of the codebase
// pure-functional w.r.t. CF.
export const CONVERSION_FACTOR_2026 = 32.3465;
