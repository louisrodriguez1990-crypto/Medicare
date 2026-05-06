import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReimbursementCard } from "@/components/ReimbursementCard";
import { RvuTable } from "@/components/RvuTable";
import { B2BCallout } from "@/components/B2BCallout";
import { ContentSections } from "@/components/ContentSections";
import { AdSlot } from "@/components/ads/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { listTopCpts, getRatesForCptStateCached } from "@/lib/db/queries";
import { findSeedGpci, getSeedCpts } from "@/lib/db/seed";
import { resolveSpecialty, SPECIALTIES } from "@/lib/content/specialties";
import { CONVERSION_FACTOR_2026 } from "@/lib/cms/schema";
import { buildPageJsonLd } from "@/lib/seo/jsonld";
import { buildSections, nationalRatesFor } from "@/lib/content/sections";
import { getSiteConfig } from "@/lib/site/config";

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 86400;

interface RouteParams {
  specialty: string;
  code: string;
}

const CANONICAL_STATE_SLUG = "texas";

export async function generateStaticParams() {
  const top = await listTopCpts(50);
  const params: RouteParams[] = [];
  for (const cpt of top) {
    for (const taxonomy of cpt.specialtyTaxonomy) {
      const sp = SPECIALTIES.find((s) => s.slug === taxonomy);
      if (sp) params.push({ specialty: sp.slug, code: cpt.code });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { specialty, code } = await params;
  const sp = resolveSpecialty(specialty);
  if (!sp) return { title: "Specialty not found" };
  const result = await getRatesForCptStateCached(code, CANONICAL_STATE_SLUG);
  if (!result) return { title: "HCPCS code not found" };
  const { url } = getSiteConfig();
  return {
    title: `HCPCS ${result.cpt.code} for ${sp.name} — Medicare Reimbursement (${result.cpt.sourceYear})`,
    description: `${sp.name}-relevant HCPCS ${result.cpt.code} (${result.cpt.shortDescription}) — Medicare Physician Fee Schedule allowed amount, RVU breakdown, and global period.`,
    alternates: {
      canonical: `${url}/reimbursement/${result.cpt.code}/${CANONICAL_STATE_SLUG}`,
    },
  };
}

export default async function SpecialtyCodePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { specialty, code } = await params;
  const sp = resolveSpecialty(specialty);
  if (!sp) notFound();
  const result = await getRatesForCptStateCached(code, CANONICAL_STATE_SLUG);
  if (!result) notFound();

  const { cpt, state, rates } = result;
  const gpci = findSeedGpci(state.abbr) ?? {
    localityCode: rates.localityCode,
    localityName: state.name,
    state: state.abbr,
    workGpci: 1,
    peGpci: 1,
    mpGpci: 1,
  };

  const nationalRates = nationalRatesFor(cpt, CONVERSION_FACTOR_2026, rates.computedAt);
  const siblingCodes = getSeedCpts()
    .filter((c) => c.code !== cpt.code && c.code[0] === cpt.code[0])
    .slice(0, 6)
    .map((c) => ({ code: c.code, shortDescription: c.shortDescription }));

  const sections = buildSections({
    cpt,
    rates,
    state,
    gpci,
    nationalRates,
    siblingCodes,
  });

  const pagePath = `/medical-billing-codes/${sp.slug}/${cpt.code}`;
  const jsonLd = buildPageJsonLd({ cpt, rates, state, specialty: sp, pagePath });

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-4">
        <ol className="flex flex-wrap gap-1">
          <li><a href="/" className="hover:underline">Home</a> /</li>
          <li><a href="/medical-billing-codes" className="hover:underline">By Specialty</a> /</li>
          <li>{sp.name} /</li>
          <li className="font-mono">{cpt.code}</li>
        </ol>
      </nav>

      <ReimbursementCard cpt={cpt} rates={rates} state={state} />

      <AdSlot
        slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP ?? "1111111111"}
        format="auto"
        reservedHeight={250}
      />

      <RvuTable cpt={cpt} gpci={gpci} />
      <ContentSections sections={sections} state={state} />

      <AdSlot
        slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MID ?? "2222222222"}
        format="fluid"
        layout="in-article"
        reservedHeight={300}
      />

      <B2BCallout cpt={cpt} state={state} />
    </>
  );
}
