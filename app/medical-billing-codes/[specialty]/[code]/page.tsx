import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReimbursementCard } from "@/components/ReimbursementCard";
import { RvuTable } from "@/components/RvuTable";
import { DualFunnelCTA } from "@/components/DualFunnelCTA";
import { JsonLd } from "@/components/JsonLd";
import { listTopCpts, getRatesForCptStateCached } from "@/lib/db/queries";
import { findSeedGpci } from "@/lib/db/seed";
import { resolveSpecialty, SPECIALTIES } from "@/lib/content/specialties";
import { buildPageJsonLd } from "@/lib/seo/jsonld";
import { getSiteUrl } from "@/lib/seo/agent";

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 86400;

interface RouteParams {
  specialty: string;
  code: string;
}

// B2B-leaning pivot: anchored on a specialty taxonomy node. Canonical points to the
// /reimbursement/[code]/[state] form (with the licensed agent's home state) to consolidate
// link equity rather than splitting it between two URL templates for the same code.
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
  if (!result) return { title: "CPT code not found" };
  const siteUrl = getSiteUrl();
  return {
    title: `CPT ${result.cpt.code} for ${sp.name} — Medicare Reimbursement (${result.cpt.sourceYear})`,
    description: `${sp.name}-relevant CPT ${result.cpt.code} (${result.cpt.shortDescription}) — Medicare Physician Fee Schedule allowed amount, RVU breakdown, and global period.`,
    alternates: {
      canonical: `${siteUrl}/reimbursement/${result.cpt.code}/${CANONICAL_STATE_SLUG}`,
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
      <RvuTable cpt={cpt} gpci={gpci} />
      <DualFunnelCTA cpt={cpt} state={state} audience="b2b" />
    </>
  );
}
