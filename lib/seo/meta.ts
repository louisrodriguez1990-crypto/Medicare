import type { Metadata } from "next";
import type { CptCode, Reimbursement } from "@/lib/cms/schema";
import type { StateMeta } from "@/lib/cms/locality";
import { getSiteConfig } from "@/lib/site/config";

export function buildReimbursementMetadata(
  cpt: CptCode,
  state: StateMeta,
  rates: Reimbursement,
  pagePath: string
): Metadata {
  const { url, name } = getSiteConfig();
  const pageUrl = `${url}${pagePath}`;
  const title = `HCPCS ${cpt.code} Medicare Reimbursement in ${state.name} (${cpt.sourceYear}) — $${rates.nonFacilityPrice.toFixed(2)}`;
  const description = `${cpt.sourceYear} Medicare reimbursement for HCPCS ${cpt.code} (${cpt.shortDescription}) in ${state.name}: $${rates.nonFacilityPrice.toFixed(2)} non-facility / $${rates.facilityPrice.toFixed(2)} facility. RVU breakdown, global period, GPCI math. Sourced from CMS.`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: { title, description, url: pageUrl, siteName: name, type: "article" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}
