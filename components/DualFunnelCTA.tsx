import Link from "next/link";
import type { CptCode } from "@/lib/cms/schema";
import type { StateMeta } from "@/lib/cms/locality";
import { AgentDisclaimer } from "./AgentDisclaimer";

interface Props {
  cpt: CptCode;
  state: StateMeta;
  audience?: "b2b" | "b2c" | "auto";
}

export function DualFunnelCTA({ cpt, state, audience = "auto" }: Props) {
  // Both cards render for SEO; visual order swaps via CSS so search engines see all anchor text.
  const b2bFirst = audience === "b2b";

  return (
    <section
      aria-labelledby="next-step-heading"
      className="mt-10 grid gap-4 sm:grid-cols-2"
      data-audience={audience}
    >
      <h2 id="next-step-heading" className="sr-only">
        Next steps
      </h2>

      <article
        className={`rounded-lg border border-slate-200 bg-slate-50 p-5 ${b2bFirst ? "sm:order-1" : "sm:order-2"}`}
        data-funnel="b2b"
      >
        <span className="inline-block rounded bg-ink px-2 py-0.5 text-xs font-semibold text-white">
          For Billers &amp; Providers
        </span>
        <h3 className="mt-3 text-lg font-semibold">
          Losing revenue on denied {cpt.code} claims?
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          Compare outsourced billing software integrations and clearinghouses
          with proven {cpt.shortDescription.toLowerCase()} acceptance rates in{" "}
          {state.name}.
        </p>
        <Link
          href={`/lp/billing-software?cpt=${cpt.code}&state=${state.slug}`}
          className="mt-4 inline-block rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Compare RCM platforms in {state.name}
        </Link>
      </article>

      <article
        className={`rounded-lg border-2 border-accent bg-white p-5 ${b2bFirst ? "sm:order-2" : "sm:order-1"}`}
        data-funnel="b2c"
      >
        <span className="inline-block rounded bg-accent px-2 py-0.5 text-xs font-semibold text-white">
          For Medicare Beneficiaries
        </span>
        <h3 className="mt-3 text-lg font-semibold">
          Will Medicare cover 100% of your upcoming {cpt.code} procedure?
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          Speak to a licensed local advisor in {state.name} to check your
          supplemental benefits, copays, and prior-authorization requirements.
        </p>
        <a
          href="tel:1-800-555-0100"
          className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accentDark"
        >
          Call a licensed advisor
        </a>
        <AgentDisclaimer />
      </article>
    </section>
  );
}
