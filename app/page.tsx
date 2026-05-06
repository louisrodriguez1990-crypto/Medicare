import Link from "next/link";
import { listTopCpts } from "@/lib/db/queries";
import { STATES } from "@/lib/cms/locality";
import { AdSlot } from "@/components/ads/AdSlot";

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
          Medicare HCPCS Reimbursement Rates (2026)
        </h1>
        <p className="mt-3 text-slate-700 max-w-3xl">
          Locality-adjusted Medicare Part B reimbursement for HCPCS Level II
          codes — drugs, durable medical equipment, supplies, and Medicare-
          specific G-codes — calculated from the CMS Physician Fee Schedule.
          Look up Work / PE / MP RVUs, GPCI multipliers, global periods, and
          allowed amounts in your state.
        </p>
      </section>

      <AdSlot
        slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME ?? "9999999999"}
        format="auto"
        reservedHeight={250}
      />

      <section>
        <h2 className="text-xl font-semibold">Frequently looked-up HCPCS codes</h2>
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
                href={`/reimbursement/G0438/${s.slug}`}
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
