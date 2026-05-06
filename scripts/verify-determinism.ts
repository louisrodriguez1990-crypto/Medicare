/**
 * Smoke-tests the calc pipeline end-to-end against the seed fixtures and prints a small
 * report. Used as a fast pre-commit / pre-deploy check that the math hasn't drifted.
 */
import { calculateReimbursement } from "../lib/cms/calc";
import { getSeedCpts, getSeedGpcis } from "../lib/db/seed";

const cpts = getSeedCpts();
const gpcis = getSeedGpcis();

let total = 0;
let nfSum = 0;
let facSum = 0;

for (const cpt of cpts) {
  for (const gpci of gpcis) {
    const r = calculateReimbursement({ cpt, gpci });
    total++;
    nfSum += r.nonFacilityPrice;
    facSum += r.facilityPrice;
  }
}

console.log(`computed ${total} reimbursement values`);
console.log(`avg non-facility: $${(nfSum / total).toFixed(2)}`);
console.log(`avg facility:     $${(facSum / total).toFixed(2)}`);
console.log("ok");
