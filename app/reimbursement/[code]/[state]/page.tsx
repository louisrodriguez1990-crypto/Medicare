import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReimbursementCard } from "@/components/ReimbursementCard";
import { RvuTable } from "@/components/RvuTable";
import { GpciSlider } from "@/components/GpciSlider";
import { DualFunnelCTA } from "@/components/DualFunnelCTA";
import { JsonLd } from "@/components/JsonLd";
import { listTopCpts } from "@/lib/db/queries";
import { getRatesForCptStateCached } from "@/lib/db/queries";
import { findSeedGpci } from "@/lib/db/seed";
import { STATES } from "@/lib/cms/locality";
import { buildPageJsonLd } from "@/lib/seo/jsonld";
import { buildReimbursementMetadata } from "@/lib/seo/meta";

// SSG the top N codes × all states; long tail uses ISR fallback (24h revalidate).
export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 86400;

const SSG_TOP_N = parseInt(process.env.SSG_TOP_N ?? "1000", 10);

interface RouteParams {
  code: string;
  state: string;
}

export async function generateStaticParams() {
  // In production this enumerates the top 1,000 CPTs × 50 states (~50K). With seed-only data
  // it falls through to the seed list, which keeps build time fast for the empty-repo bring-up.
  const top = await listTopCpts(SSG_TOP_N);
  const params: RouteParams[] = [];
  for (const cpt of top) {
    for (const state of STATES) {
      params.push({ code: cpt.code, state: state.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { code, state } = await params;
  const result = await getRatesForCptStateCached(code, state);
  if (!result) return { title: "CPT code not found" };
  return buildReimbursementMetadata(
    result.cpt,
    result.state,
    result.rates,
    `/reimbursement/${result.cpt.code}/${result.state.slug}`
  );
}

export default async function ReimbursementPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { code, state } = await params;
  const result = await getRatesForCptStateCached(code, state);
  if (!result) notFound();
  const { cpt, state: stateMeta, rates } = result;

  const gpci = findSeedGpci(stateMeta.abbr) ?? {
    localityCode: rates.localityCode,
    localityName: stateMeta.name,
    state: stateMeta.abbr,
    workGpci: 1,
    peGpci: 1,
    mpGpci: 1,
  };

  const pagePath = `/reimbursement/${cpt.code}/${stateMeta.slug}`;
  const jsonLd = buildPageJsonLd({ cpt, rates, state: stateMeta, pagePath });

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-4">
        <ol className="flex flex-wrap gap-1">
          <li><a href="/" className="hover:underline">Home</a> /</li>
          <li><a href="/reimbursement" className="hover:underline">Reimbursement</a> /</li>
          <li className="font-mono">{cpt.code}</li>
          <li>/ {stateMeta.name}</li>
        </ol>
      </nav>

      <ReimbursementCard cpt={cpt} rates={rates} state={stateMeta} />
      <RvuTable cpt={cpt} gpci={gpci} />
      <GpciSlider cpt={cpt} gpci={gpci} />
      <DualFunnelCTA cpt={cpt} state={stateMeta} />
    </>
  );
}
