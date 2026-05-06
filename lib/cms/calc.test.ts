import { describe, expect, it } from "vitest";
import { calculateReimbursement, roundHalfEven } from "./calc";
import { CONVERSION_FACTOR_2026 } from "./schema";
import { findSeedCpt, findSeedGpci } from "@/lib/db/seed";

describe("roundHalfEven", () => {
  it("rounds half values to even", () => {
    expect(roundHalfEven(2.125, 2)).toBe(2.12);
    expect(roundHalfEven(2.135, 2)).toBe(2.14);
    expect(roundHalfEven(2.145, 2)).toBe(2.14);
  });
  it("rounds non-half values normally", () => {
    expect(roundHalfEven(1.234, 2)).toBe(1.23);
    expect(roundHalfEven(1.236, 2)).toBe(1.24);
  });
});

describe("calculateReimbursement", () => {
  it("matches the CMS allowed-amount formula for 99214 in TX", () => {
    const cpt = findSeedCpt("99214")!;
    const gpci = findSeedGpci("TX")!;
    const r = calculateReimbursement({ cpt, gpci });

    const expectedNF = roundHalfEven(
      ((cpt.rvu.workRvu * gpci.workGpci) +
        (cpt.rvu.peRvuNonFacility * gpci.peGpci) +
        (cpt.rvu.mpRvu * gpci.mpGpci)) *
        CONVERSION_FACTOR_2026
    );
    const expectedFac = roundHalfEven(
      ((cpt.rvu.workRvu * gpci.workGpci) +
        (cpt.rvu.peRvuFacility * gpci.peGpci) +
        (cpt.rvu.mpRvu * gpci.mpGpci)) *
        CONVERSION_FACTOR_2026
    );

    expect(r.nonFacilityPrice).toBe(expectedNF);
    expect(r.facilityPrice).toBe(expectedFac);
    expect(r.formulaVersion).toBe("2026.1");
    expect(r.localityCode).toBe(gpci.localityCode);
  });

  it("non-facility >= facility for E&M codes (PE differs)", () => {
    for (const code of ["99213", "99214", "99215"]) {
      const cpt = findSeedCpt(code)!;
      const gpci = findSeedGpci("TX")!;
      const r = calculateReimbursement({ cpt, gpci });
      expect(r.nonFacilityPrice).toBeGreaterThanOrEqual(r.facilityPrice);
    }
  });

  it("is deterministic across repeated calls", () => {
    const cpt = findSeedCpt("93306")!;
    const gpci = findSeedGpci("NY")!;
    const a = calculateReimbursement({ cpt, gpci });
    const b = calculateReimbursement({ cpt, gpci });
    expect(a).toEqual(b);
  });

  it("differs between states (GPCI variation)", () => {
    const cpt = findSeedCpt("70553")!;
    const tx = calculateReimbursement({ cpt, gpci: findSeedGpci("TX")! });
    const ny = calculateReimbursement({ cpt, gpci: findSeedGpci("NY")! });
    expect(tx.nonFacilityPrice).not.toBe(ny.nonFacilityPrice);
  });
});
