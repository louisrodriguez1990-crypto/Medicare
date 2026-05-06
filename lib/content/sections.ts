import type { CptCode, Gpci, Reimbursement } from "@/lib/cms/schema";
import type { StateMeta } from "@/lib/cms/locality";

// Deterministic, server-rendered content generator. No LLM. Each section is hand-written
// prose templated against the structured CMS data, producing ~600-1000 words of unique
// content per (code, state) pair. The variability across states (GPCI numbers, locality
// names, comparative ranking) plus across codes (modifiers, global period, drug vs DME vs
// service category) keeps each page distinct without resorting to spinning.
//
// IMPORTANT: do NOT add anything that reads like medical advice. Position is purely
// reference / billing / Medicare-payment-policy.

export interface Section {
  id: string;
  heading: string;
  paragraphs: string[];
}

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function categorize(code: string): "service" | "drug" | "dme" | "supply" | "other" {
  const prefix = code[0];
  if (prefix === "J") return "drug";
  if (prefix === "E" || prefix === "K" || prefix === "L") return "dme";
  if (prefix === "A" || prefix === "B") return "supply";
  if (prefix === "G") return "service";
  return "other";
}

const GLOBAL_DAYS_LABEL: Record<string, string> = {
  "000": "0-day global (endoscopic or minor procedure)",
  "010": "10-day global (minor procedure)",
  "090": "90-day global (major surgery)",
  XXX: "global concept does not apply",
  YYY: "carrier-priced global period",
  ZZZ: "add-on; global tied to the primary code",
  MMM: "maternity package — pre/post-partum bundled",
};

const MODIFIER_GLOSSARY: Record<string, string> = {
  "25": "significant, separately identifiable E&M service on the same day as a procedure",
  "26": "professional component only",
  TC: "technical component only",
  "50": "bilateral procedure",
  RT: "right side",
  LT: "left side",
  "59": "distinct procedural service",
  "76": "repeat procedure by same physician",
  "77": "repeat procedure by another physician",
  "95": "synchronous telemedicine service via real-time interactive audio/video",
  KX: "requirements specified in the medical policy have been met",
  KS: "glucose monitor supply for diabetic beneficiary not treated with insulin",
  NU: "new equipment",
  RR: "rental",
  UE: "used durable medical equipment",
  JA: "administered intravenously",
  JB: "administered subcutaneously",
};

const NATIONAL_REFERENCE_GPCI = { workGpci: 1.0, peGpci: 1.0, mpGpci: 1.0 };

export function buildSections({
  cpt,
  rates,
  state,
  gpci,
  nationalRates,
  siblingCodes,
}: {
  cpt: CptCode;
  rates: Reimbursement;
  state: StateMeta;
  gpci: Gpci;
  nationalRates: Reimbursement;
  siblingCodes: Array<{ code: string; shortDescription: string }>;
}): Section[] {
  const category = categorize(cpt.code);
  const stateName = state.name;
  const sections: Section[] = [];

  // ── 1. What this code is and how Medicare pays it ───────────────────────────
  sections.push({
    id: "overview",
    heading: `What HCPCS ${cpt.code} covers`,
    paragraphs: [
      `HCPCS Level II code ${cpt.code} represents ${cpt.shortDescription.toLowerCase()}. ${cpt.longDescription}`,
      category === "drug"
        ? `Because ${cpt.code} is a J-code (an injectable or infused drug), Medicare pays it under Part B drug pricing rules rather than the standard physician fee schedule formula. The amount shown here is derived from the CMS Physician Fee Schedule data file; the actual Average Sales Price (ASP)–based payment can differ quarter to quarter.`
        : category === "dme"
          ? `Because ${cpt.code} is a durable medical equipment (DME) code, payment is determined by the DME Medicare Administrative Contractor (DME MAC) for ${stateName} and is subject to the DME fee schedule, competitive bidding areas, and the cap structure for capped-rental items. The figures below are the PFS-derived reference values; actual DME claims are paid against the DMEPOS fee schedule.`
          : category === "supply"
            ? `${cpt.code} is a medical or surgical supply A-code. Medicare pays supply codes through the DMEPOS fee schedule, not the standard physician fee schedule. The values below are the PFS-derived reference; actual claim payment may follow a different schedule.`
            : `As a G-code, ${cpt.code} is a Medicare-specific HCPCS Level II code created by CMS for services and procedures that don't have a CPT equivalent. Payment follows the standard CMS Physician Fee Schedule methodology, calculated from the code's Relative Value Units (RVUs) adjusted for the Geographic Practice Cost Index (GPCI) of the billing locality.`,
    ],
  });

  // ── 2. Allowed amount in this state ─────────────────────────────────────────
  const diff = rates.nonFacilityPrice - nationalRates.nonFacilityPrice;
  const diffPct = (diff / Math.max(nationalRates.nonFacilityPrice, 0.01)) * 100;
  const directionWord = diff > 0 ? "above" : diff < 0 ? "below" : "equal to";

  sections.push({
    id: "rate-detail",
    heading: `${cpt.sourceYear} Medicare reimbursement for ${cpt.code} in ${stateName}`,
    paragraphs: [
      `For ${cpt.sourceYear}, Medicare's allowed amount for HCPCS ${cpt.code} in ${stateName} is ${usd(rates.nonFacilityPrice)} when the service is provided in a non-facility setting and ${usd(rates.facilityPrice)} when provided in a facility setting. These figures are calculated using locality ${rates.localityCode} (${gpci.localityName}), with a Work GPCI of ${gpci.workGpci.toFixed(3)}, Practice Expense GPCI of ${gpci.peGpci.toFixed(3)}, and Malpractice GPCI of ${gpci.mpGpci.toFixed(3)}, multiplied against the ${cpt.sourceYear} conversion factor of ${rates.conversionFactor.toFixed(4)}.`,
      Math.abs(diffPct) > 0.5
        ? `${stateName}'s non-facility allowed amount for ${cpt.code} runs roughly ${Math.abs(diffPct).toFixed(1)}% ${directionWord} the national reference rate of ${usd(nationalRates.nonFacilityPrice)}. The variance is driven primarily by ${stateName}'s GPCI multipliers, which reflect cost-of-practice differences relative to a national baseline of 1.000.`
        : `${stateName}'s non-facility allowed amount for ${cpt.code} closely tracks the national reference rate of ${usd(nationalRates.nonFacilityPrice)} because the locality's GPCI values sit near the national baseline.`,
      `Beneficiaries in Original Medicare typically owe 20% of the allowed amount as coinsurance after meeting the Part B deductible, unless the cost-sharing is covered by a Medicare Supplement (Medigap) policy or absorbed by a Medicare Advantage plan with different cost-sharing rules.`,
    ],
  });

  // ── 3. Place of service: facility vs non-facility ───────────────────────────
  const facDelta = rates.nonFacilityPrice - rates.facilityPrice;
  if (facDelta > 0.01) {
    sections.push({
      id: "place-of-service",
      heading: "Why the non-facility rate is higher than the facility rate",
      paragraphs: [
        `The ${usd(facDelta)} gap between the non-facility (${usd(rates.nonFacilityPrice)}) and facility (${usd(rates.facilityPrice)}) allowed amounts comes from the Practice Expense (PE) RVU. When a service is performed in a facility — a hospital outpatient department, ASC, or inpatient setting — the facility itself bills for and is reimbursed for the overhead, equipment, and clinical staff. The physician's PE RVU is therefore reduced.`,
        `When the same service is rendered in a non-facility setting (a physician's office, freestanding clinic, or the patient's home), the billing provider absorbs the full overhead, so CMS pays the higher PE RVU. For HCPCS ${cpt.code}, the non-facility PE RVU is ${cpt.rvu.peRvuNonFacility.toFixed(2)} versus a facility PE RVU of ${cpt.rvu.peRvuFacility.toFixed(2)}.`,
        `Place-of-service reporting on the CMS-1500 claim must match where the service was actually delivered. Misreporting POS to claim the higher non-facility rate is a documented OIG audit target.`,
      ],
    });
  }

  // ── 4. RVU + GPCI math walkthrough ──────────────────────────────────────────
  sections.push({
    id: "math",
    heading: `How the ${cpt.code} payment is calculated for ${stateName}`,
    paragraphs: [
      `Medicare's Physician Fee Schedule formula multiplies each RVU component by its corresponding GPCI, sums the three, then multiplies by the conversion factor. For HCPCS ${cpt.code} in ${stateName}, the math works out as: (Work RVU ${cpt.rvu.workRvu.toFixed(2)} × Work GPCI ${gpci.workGpci.toFixed(3)}) + (Non-Facility PE RVU ${cpt.rvu.peRvuNonFacility.toFixed(2)} × PE GPCI ${gpci.peGpci.toFixed(3)}) + (MP RVU ${cpt.rvu.mpRvu.toFixed(2)} × MP GPCI ${gpci.mpGpci.toFixed(3)}) × Conversion Factor ${rates.conversionFactor.toFixed(4)} = ${usd(rates.nonFacilityPrice)}.`,
      `The Work component pays for the physician's time, intensity, and skill. The Practice Expense component covers the office overhead, supplies, and clinical staff. The Malpractice component covers professional liability. CMS recalibrates the RVU values annually as part of the Final Rule.`,
    ],
  });

  // ── 5. Modifier guidance ────────────────────────────────────────────────────
  if (cpt.modifiers.length > 0) {
    const lines = cpt.modifiers
      .map((m) =>
        MODIFIER_GLOSSARY[m]
          ? `Modifier ${m}: ${MODIFIER_GLOSSARY[m]}.`
          : `Modifier ${m}: see CMS billing guidance for usage rules.`
      )
      .join(" ");
    sections.push({
      id: "modifiers",
      heading: `Common modifiers billed with ${cpt.code}`,
      paragraphs: [
        `${cpt.code} is commonly billed with the following modifiers: ${cpt.modifiers.join(", ")}. ${lines}`,
        `Modifier choice can change Medicare's payment, override an NCCI edit, or force a separate line of payment. Always document the clinical justification for any modifier in the medical record before submission.`,
      ],
    });
  }

  // ── 6. Global period ────────────────────────────────────────────────────────
  sections.push({
    id: "global-period",
    heading: `Global period for ${cpt.code}`,
    paragraphs: [
      `HCPCS ${cpt.code} carries a global surgery indicator of ${cpt.globalDays} — ${GLOBAL_DAYS_LABEL[cpt.globalDays] ?? "see CMS guidance"}. The global period determines which related pre-operative and post-operative services are bundled into the single allowed amount and cannot be billed separately.`,
      cpt.globalDays === "XXX"
        ? `Because the global concept does not apply to ${cpt.code}, related E&M services on the same day are generally separately billable when documented and medically necessary.`
        : cpt.globalDays === "000"
          ? `With a 0-day global, only services on the day of the procedure are bundled. Visits on subsequent days can be billed separately when medically necessary.`
          : cpt.globalDays === "010"
            ? `Visits within 10 days of the procedure that are related to recovery are bundled into the ${cpt.code} payment. Unrelated services within that window can be billed with the appropriate modifier (commonly modifier 24 for E&M during a global period).`
            : cpt.globalDays === "090"
              ? `Visits within 90 days of the procedure related to recovery are bundled. Unrelated services in that window require modifier 24 or 79 to be paid separately.`
              : `Refer to the most recent CMS Final Rule for the carrier-priced global period rules that apply to ${cpt.code}.`,
    ],
  });

  // ── 7. Related codes you may also bill / look up ────────────────────────────
  if (siblingCodes.length > 0) {
    sections.push({
      id: "related",
      heading: `Related HCPCS codes`,
      paragraphs: [
        `If you're researching ${cpt.code}, these related HCPCS Level II codes are commonly looked up at the same time:`,
        siblingCodes
          .slice(0, 6)
          .map(
            (s) =>
              `${s.code} (${s.shortDescription.toLowerCase()})`
          )
          .join("; ") + ".",
      ],
    });
  }

  // ── 8. State context (closing) ──────────────────────────────────────────────
  sections.push({
    id: "state-context",
    heading: `Looking up ${cpt.code} payments in ${stateName}`,
    paragraphs: [
      `${stateName} providers submitting claims for ${cpt.code} should bill their Medicare Administrative Contractor (MAC) using locality ${gpci.localityCode}. If your practice spans multiple ZIP codes inside ${stateName}, the locality may differ — CMS publishes a ZIP-code-to-locality crosswalk (LOCCO file) that resolves the correct locality and PEs accordingly.`,
      `Allowed amounts shown here are Medicare reference values from the ${cpt.sourceYear} Physician Fee Schedule. Final payment depends on patient-specific cost-sharing, sequestration adjustments, and any quality-program incentives or penalties (such as MIPS) applied at the practice level.`,
    ],
  });

  return sections;
}

export function nationalRatesFor(cpt: CptCode, conversionFactor: number, computedAt: string): Reimbursement {
  const w = cpt.rvu.workRvu * NATIONAL_REFERENCE_GPCI.workGpci;
  const m = cpt.rvu.mpRvu * NATIONAL_REFERENCE_GPCI.mpGpci;
  const peNF = cpt.rvu.peRvuNonFacility * NATIONAL_REFERENCE_GPCI.peGpci;
  const peF = cpt.rvu.peRvuFacility * NATIONAL_REFERENCE_GPCI.peGpci;
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    code: cpt.code,
    state: "US",
    localityCode: "0000000",
    conversionFactor,
    nonFacilityPrice: round((w + peNF + m) * conversionFactor),
    facilityPrice: round((w + peF + m) * conversionFactor),
    computedAt,
    formulaVersion: "2026.1",
  };
}
