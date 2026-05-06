import { CONVERSION_FACTOR_2026 } from "@/lib/cms/schema";

export const metadata = {
  title: "Methodology — How HCPCS Reimbursement Rates Are Calculated",
  description:
    "How this site calculates Medicare HCPCS reimbursement rates from the CMS Physician Fee Schedule, RVU components, GPCI multipliers, and the annual conversion factor.",
  alternates: { canonical: "/methodology" },
};

export default function Methodology() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Methodology</h1>
      <p>
        Every reimbursement value on this site is calculated deterministically
        from the publicly available CMS Medicare Physician Fee Schedule (MPFS)
        data files. We do not estimate, smooth, or modify CMS values; we apply
        the published formula and round half-to-even at two decimals to match
        the CMS payment system.
      </p>

      <h2>The formula</h2>
      <pre>
{`Allowed Amount =
  ((Work RVU × Work GPCI)
   + (Practice Expense RVU × PE GPCI)
   + (Malpractice RVU × MP GPCI))
  × Conversion Factor`}
      </pre>

      <h2>Inputs we use</h2>
      <ul>
        <li>
          <strong>RVU values</strong> from the CMS PPRRVU file for the year
          shown on each page (the 2026 file for 2026 pages).
        </li>
        <li>
          <strong>GPCI values</strong> from the CMS GPCI file, mapped to the
          state's primary Medicare locality.
        </li>
        <li>
          <strong>Locality crosswalk</strong> from the CMS LOCCO file (ZIP code
          to MAC locality).
        </li>
        <li>
          <strong>Conversion factor</strong>: {CONVERSION_FACTOR_2026.toFixed(4)}{" "}
          for 2026, sourced from the CMS Physician Fee Schedule Final Rule.
        </li>
      </ul>

      <h2>Scope</h2>
      <p>
        We publish reimbursement values for HCPCS Level II codes only — the
        Medicare-specific G-codes, J-codes for drugs, A-codes and B-codes for
        supplies, and E/K/L-codes for durable medical equipment. We do not
        publish AMA-licensed CPT codes.
      </p>

      <h2>Caveats</h2>
      <ul>
        <li>
          Final claim payment depends on patient-specific cost-sharing,
          sequestration, MIPS adjustments, and the specific MAC pricing rules
          for the service.
        </li>
        <li>
          DME, drug, and supply codes may be paid under separate fee schedules
          (DMEPOS, Part B drug ASP) that override the standard PFS calculation.
        </li>
        <li>
          Always confirm exact payment with your Medicare Administrative
          Contractor.
        </li>
      </ul>

      <h2>Update cadence</h2>
      <p>
        The CMS PFS Final Rule is published in November. We refresh the entire
        rate matrix within the first weeks of each calendar year, plus any
        quarterly HCPCS Level II updates issued by CMS.
      </p>
    </article>
  );
}
