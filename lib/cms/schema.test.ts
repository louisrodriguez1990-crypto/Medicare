import { describe, expect, it } from "vitest";
import { CptCodeSchema, GpciSchema, ReimbursementSchema } from "./schema";

describe("CptCodeSchema", () => {
  it("accepts a well-formed row", () => {
    const ok = CptCodeSchema.safeParse({
      code: "99214",
      shortDescription: "Office o/p est",
      longDescription: "Office or other outpatient visit ...",
      status: "A",
      globalDays: "XXX",
      rvu: { workRvu: 1.92, peRvuNonFacility: 1.66, peRvuFacility: 0.66, mpRvu: 0.15 },
      sourceYear: 2026,
      sourceFile: "PPRRVU2026.csv",
    });
    expect(ok.success).toBe(true);
  });

  it("rejects an invalid CPT code shape", () => {
    const bad = CptCodeSchema.safeParse({
      code: "999",
      shortDescription: "x",
      longDescription: "x",
      status: "A",
      globalDays: "XXX",
      rvu: { workRvu: 0, peRvuNonFacility: 0, peRvuFacility: 0, mpRvu: 0 },
      sourceYear: 2026,
      sourceFile: "x",
    });
    expect(bad.success).toBe(false);
  });

  it("rejects negative RVUs", () => {
    const bad = CptCodeSchema.safeParse({
      code: "99214",
      shortDescription: "x",
      longDescription: "x",
      status: "A",
      globalDays: "XXX",
      rvu: { workRvu: -1, peRvuNonFacility: 0, peRvuFacility: 0, mpRvu: 0 },
      sourceYear: 2026,
      sourceFile: "x",
    });
    expect(bad.success).toBe(false);
  });
});

describe("GpciSchema", () => {
  it("requires a 2-letter state", () => {
    const bad = GpciSchema.safeParse({
      localityCode: "0001100",
      localityName: "Texas",
      state: "TEX",
      workGpci: 1,
      peGpci: 1,
      mpGpci: 1,
    });
    expect(bad.success).toBe(false);
  });
});

describe("ReimbursementSchema", () => {
  it("locks formulaVersion to 2026.1", () => {
    const bad = ReimbursementSchema.safeParse({
      code: "99214",
      state: "TX",
      localityCode: "0001100",
      conversionFactor: 32.3465,
      nonFacilityPrice: 100,
      facilityPrice: 80,
      computedAt: new Date().toISOString(),
      formulaVersion: "2025.1",
    });
    expect(bad.success).toBe(false);
  });
});
