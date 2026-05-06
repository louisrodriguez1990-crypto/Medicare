import type { CptCode, Reimbursement } from "@/lib/cms/schema";
import type { StateMeta } from "@/lib/cms/locality";

interface Props {
  cpt: CptCode;
  rates: Reimbursement;
  state: StateMeta;
}

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function ReimbursementCard({ cpt, rates, state }: Props) {
  const codingSystem = /^[A-Z]/.test(cpt.code) ? "HCPCS" : "CPT";
  return (
    <section
      id="reimbursement-card"
      className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
      aria-labelledby="reimbursement-heading"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="inline-flex items-center rounded-md bg-ink px-2.5 py-1 text-xs font-mono font-semibold tracking-wide text-white">
            {codingSystem} {cpt.code}
          </span>
          <h1
            id="reimbursement-heading"
            className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight"
          >
            CPT {cpt.code} Medicare Reimbursement Rate in {state.name} ({cpt.sourceYear})
          </h1>
          <p className="mt-2 text-slate-700 max-w-2xl">{cpt.longDescription}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Non-Facility Allowed Amount
          </dt>
          <dd className="mt-1 text-3xl font-bold text-accent">
            {usd(rates.nonFacilityPrice)}
          </dd>
          <p className="mt-1 text-xs text-slate-500">
            Office, freestanding clinic, patient&apos;s home
          </p>
        </div>
        <div className="rounded-md border border-slate-200 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Facility Allowed Amount
          </dt>
          <dd className="mt-1 text-3xl font-bold text-accent">
            {usd(rates.facilityPrice)}
          </dd>
          <p className="mt-1 text-xs text-slate-500">
            Hospital outpatient, ASC, inpatient
          </p>
        </div>
      </dl>

      <p className="mt-4 text-xs text-slate-500">
        Locality{" "}
        <span className="font-mono">{rates.localityCode}</span> · Conversion
        Factor {rates.conversionFactor.toFixed(4)} · Formula{" "}
        {rates.formulaVersion} · Verified against the CMS Medicare Physician
        Fee Schedule {cpt.sourceYear} Final Rule
      </p>
    </section>
  );
}
