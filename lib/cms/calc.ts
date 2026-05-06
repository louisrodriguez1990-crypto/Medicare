import type { CptCode, Gpci, Reimbursement } from "./schema";
import { CONVERSION_FACTOR_2026, FORMULA_VERSION } from "./schema";

// Round half-to-even (banker's rounding) at 2 decimals so cached values are stable across
// language runtimes and JIT optimizations. Must match the Postgres ROUND(numeric, 2) result.
// Pre-trims IEEE-754 representation noise (e.g. 2.135 stored as 2.1349999...) at 12 sig figs
// before the half-detection so that decimal half-values are detected as half.
export function roundHalfEven(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  const scaled = Number((value * factor).toPrecision(12));
  const floor = Math.floor(scaled);
  const diff = scaled - floor;
  let rounded: number;
  if (diff > 0.5) rounded = floor + 1;
  else if (diff < 0.5) rounded = floor;
  else rounded = floor % 2 === 0 ? floor : floor + 1;
  return rounded / factor;
}

export interface CalcInput {
  cpt: CptCode;
  gpci: Gpci;
  conversionFactor?: number;
}

export function calculateReimbursement({
  cpt,
  gpci,
  conversionFactor = CONVERSION_FACTOR_2026,
}: CalcInput): Reimbursement {
  const { rvu } = cpt;
  const workComponent = rvu.workRvu * gpci.workGpci;
  const mpComponent = rvu.mpRvu * gpci.mpGpci;
  const peNonFac = rvu.peRvuNonFacility * gpci.peGpci;
  const peFac = rvu.peRvuFacility * gpci.peGpci;

  const nonFacilityPrice = roundHalfEven(
    (workComponent + peNonFac + mpComponent) * conversionFactor
  );
  const facilityPrice = roundHalfEven(
    (workComponent + peFac + mpComponent) * conversionFactor
  );

  return {
    code: cpt.code,
    state: gpci.state,
    localityCode: gpci.localityCode,
    conversionFactor,
    nonFacilityPrice,
    facilityPrice,
    computedAt: new Date(0).toISOString(),
    formulaVersion: FORMULA_VERSION,
  };
}
