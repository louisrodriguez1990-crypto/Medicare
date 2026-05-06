import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReimbursementCard } from "@/components/ReimbursementCard";
import { RvuTable } from "@/components/RvuTable";
import { GpciSlider } from "@/components/GpciSlider";
import { B2BCallout } from "@/components/B2BCallout";
import { ContentSections } from "@/components/ContentSections";
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { listTopCpts, getRatesForCptStateCached } from "@/lib/db/queries";
import { findSeedGpci, getSeedCpts } from "@/lib/db/seed";
import { STATES } from "@/lib/cms/locality";
import { CONVERSION_FACTOR_2026 } from "@/lib/cms/schema";
import { buildPageJsonLd } from "@/lib/seo/jsonld";
import { buildReimbursementMetadata } from "@/lib/seo/meta";
import { buildSections, nationalRatesFor } from "@/lib/content/sections";

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 86400;

const SSG_TOP_N = parseInt(process.env.SSG_TOP_N ?? "1000", 10);

interface RouteParams {
  code: string;
  state: string;
}

export async function generateStaticParams() {
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
  if (!result) return { title: "HCPCS code not found" };
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

  const nationalRates = nationalRatesFor(cpt, CONVERSION_FACTOR_2026, rates.computedAt);

  // Sibling codes for internal linking — same starting letter, different code, capped at 6.
  const siblingCodes = getSeedCpts()
    .filter((c) => c.code !== cpt.code && c.code[0] === cpt.code[0])
    .slice(0, 6)
    .map((c) => ({ code: c.code, shortDescription: c.shortDescription }));

  const sections = buildSections({
    cpt,
    rates,
    state: stateMeta,
    gpci,
    nationalRates,
    siblingCodes,
  });

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

      <AdSlot
        slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP ?? "1111111111"}
        format="auto"
        reservedHeight={250}
      />

      <RvuTable cpt={cpt} gpci={gpci} />

      <ContentSections sections={sections} state={stateMeta} />

      <AdSlot
        slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MID ?? "2222222222"}
        format="fluid"
        layout="in-article"
        reservedHeight={300}
      />

      <GpciSlider cpt={cpt} gpci={gpci} />

      <B2BCallout cpt={cpt} state={stateMeta} />

      <AdSlot
        slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_END ?? "3333333333"}
        format="auto"
        reservedHeight={280}
      />
    </>
  );
}
