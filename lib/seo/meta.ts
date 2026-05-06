import type { Metadata } from "next";
import type { CptCode, Reimbursement } from "@/lib/cms/schema";
import type { StateMeta } from "@/lib/cms/locality";
import { getSiteUrl } from "./agent";

export function buildReimbursementMetadata(
  cpt: CptCode,
  state: StateMeta,
  rates: Reimbursement,
  pagePath: string
): Metadata {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${pagePath}`;
  const title = `CPT ${cpt.code} Medicare Reimbursement in ${state.name} (${cpt.sourceYear}) — $${rates.nonFacilityPrice.toFixed(2)}`;
  const description = `2026 Medicare reimbursement for CPT ${cpt.code} (${cpt.shortDescription}) in ${state.name}: $${rates.nonFacilityPrice.toFixed(2)} non-facility / $${rates.facilityPrice.toFixed(2)} facility. RVU breakdown, global period, and locality-adjusted GPCI. Sourced from the CMS Physician Fee Schedule.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Medicare CPT Reimbursement",
      type: "article",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}
