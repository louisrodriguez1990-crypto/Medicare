import Link from "next/link";
import type { CptCode } from "@/lib/cms/schema";
import type { StateMeta } from "@/lib/cms/locality";

// B2B-only callout. Single card. Drives clicks to internal /tools or affiliate-link
// landing pages where ad/affiliate revenue actually monetizes. No phone numbers, no
// licensed-agent flow.
export function B2BCallout({ cpt, state }: { cpt: CptCode; state: StateMeta }) {
  return (
    <aside
      className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-5"
      aria-labelledby="b2b-cta-h"
    >
      <h2 id="b2b-cta-h" className="text-lg font-semibold">
        Tools for {cpt.code} billing
      </h2>
      <p className="mt-2 text-sm text-slate-700">
        Bookmark this page for the {state.name} allowed amount. For higher-volume
        lookups, compare medical-billing software and clearinghouses that
        specialize in {cpt.code.startsWith("J") ? "J-code drug billing" : cpt.code.startsWith("E") || cpt.code.startsWith("K") || cpt.code.startsWith("L") ? "DMEPOS billing" : "Medicare Part B billing"}.
      </p>
      <Link
        href={`/tools/billing-software?code=${cpt.code}&state=${state.slug}`}
        className="mt-4 inline-block rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Compare billing tools
      </Link>
    </aside>
  );
}
