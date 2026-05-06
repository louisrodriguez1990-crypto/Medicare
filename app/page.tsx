import Link from "next/link";
import { listTopCpts } from "@/lib/db/queries";
import { STATES } from "@/lib/cms/locality";

export const revalidate = 86400;

export default async function HomePage() {
  const topCpts = (await listTopCpts(20)).slice(0, 12);
  const featuredStates = STATES.filter((s) =>
    ["TX", "NY", "CA", "FL", "PA"].includes(s.abbr)
  );

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">
          Medicare CPT &amp; HCPCS Reimbursement Rates (2026)
        </h1>
        <p className="mt-3 text-slate-700 max-w-3xl">
          Locality-adjusted Medicare Part B reimbursement for every CPT and HCPCS
          procedure code, calculated from the CMS Physician Fee Schedule. Look
          up Work / PE / MP RVUs, GPCI multipliers, global periods, and the
          exact non-facility and facility allowed amount in your state.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Most-searched CPT codes</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {topCpts.map((c) => (
            <li key={c.code}>
              <Link
                href={`/reimbursement/${c.code}/texas`}
                className="block rounded border border-slate-200 px-3 py-2 hover:border-accent hover:bg-slate-50"
              >
                <span className="font-mono font-semibold">{c.code}</span>
                <span className="ml-2 text-sm text-slate-600">
                  {c.shortDescription}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">By state</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {featuredStates.map((s) => (
            <li key={s.abbr}>
              <Link
                href={`/reimbursement/99214/${s.slug}`}
                className="inline-block rounded-full border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
