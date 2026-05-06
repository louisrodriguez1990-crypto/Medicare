import type { CptCode, Reimbursement } from "@/lib/cms/schema";
import type { StateMeta } from "@/lib/cms/locality";
import type { Specialty } from "@/lib/content/specialties";
import { getSiteConfig } from "@/lib/site/config";

const CMS_SOURCE_URL =
  "https://www.cms.gov/medicare/payment/fee-schedules/physician";

interface BuildArgs {
  cpt: CptCode;
  rates: Reimbursement;
  state: StateMeta;
  specialty?: Specialty | null;
  pagePath: string;
}

export function buildPageJsonLd({
  cpt,
  rates,
  state,
  specialty,
  pagePath,
}: BuildArgs): Record<string, unknown> {
  const site = getSiteConfig();
  const pageUrl = `${site.url}${pagePath}`;
  const lastReviewed = rates.computedAt.slice(0, 10);

  const organization = {
    "@type": "Organization",
    "@id": `${site.url}#org`,
    name: site.publisherName,
    url: site.publisherUrl,
  };

  const dataset = {
    "@type": "Dataset",
    "@id": `${site.url}/dataset/cms-mpfs-${cpt.sourceYear}`,
    name: `CMS Medicare Physician Fee Schedule ${cpt.sourceYear}`,
    description: `Official CMS reimbursement rates and Relative Value Units for HCPCS Level II procedure codes for ${cpt.sourceYear}.`,
    creator: {
      "@type": "GovernmentOrganization",
      name: "Centers for Medicare & Medicaid Services",
      url: "https://www.cms.gov",
    },
    isBasedOn: CMS_SOURCE_URL,
    license: "https://www.cms.gov/About-CMS/Agency-Information/Aboutwebsite/Policiesforuse",
    keywords: ["Medicare", "HCPCS", "Physician Fee Schedule", "RVU", "GPCI"],
    distribution: {
      "@type": "DataDownload",
      contentUrl: CMS_SOURCE_URL,
      encodingFormat: "text/csv",
    },
  };

  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "HCPCS Reimbursement",
        item: `${site.url}/reimbursement`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `HCPCS ${cpt.code}`,
        item: `${site.url}/reimbursement/${cpt.code}`,
      },
      { "@type": "ListItem", position: 4, name: state.name, item: pageUrl },
    ],
  };

  const faq = {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the ${cpt.sourceYear} Medicare reimbursement rate for HCPCS ${cpt.code} in ${state.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `For ${cpt.sourceYear}, Medicare reimburses approximately $${rates.nonFacilityPrice.toFixed(2)} for HCPCS ${cpt.code} (${cpt.shortDescription}) in a non-facility setting in ${state.name}, and $${rates.facilityPrice.toFixed(2)} in a facility setting. Rates are calculated from the CMS Medicare Physician Fee Schedule using the locality-specific GPCI for ${state.name}.`,
        },
      },
      {
        "@type": "Question",
        name: `Does Medicare cover HCPCS ${cpt.code}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Original Medicare (Part B) generally covers HCPCS ${cpt.code} when medically necessary and ordered by a Medicare-enrolled provider. Beneficiaries are typically responsible for the Part B deductible and 20% coinsurance unless covered by a supplemental policy.`,
        },
      },
      {
        "@type": "Question",
        name: `What modifiers apply to HCPCS ${cpt.code}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            cpt.modifiers.length > 0
              ? `Common modifiers billed with HCPCS ${cpt.code} include: ${cpt.modifiers.join(", ")}.`
              : `HCPCS ${cpt.code} is typically billed without modifiers; consult the most recent CMS billing guidance for exceptions.`,
        },
      },
    ],
  };

  const article = {
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: `HCPCS ${cpt.code} Medicare Reimbursement Rate in ${state.name} (${cpt.sourceYear})`,
    description: `${cpt.sourceYear} Medicare allowed amount for HCPCS ${cpt.code} (${cpt.shortDescription}) in ${state.name}: $${rates.nonFacilityPrice.toFixed(2)} non-facility / $${rates.facilityPrice.toFixed(2)} facility.`,
    datePublished: lastReviewed,
    dateModified: lastReviewed,
    author: organization,
    publisher: organization,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    isBasedOn: CMS_SOURCE_URL,
    citation: dataset,
    about: {
      "@type": "Thing",
      name: `HCPCS Level II code ${cpt.code}`,
      description: cpt.longDescription,
    },
    keywords: [
      `HCPCS ${cpt.code}`,
      `${cpt.code} reimbursement`,
      `${cpt.code} ${state.name}`,
      "Medicare allowed amount",
      "RVU",
      "GPCI",
      ...(specialty ? [specialty.name] : []),
    ],
  };

  const webPage = {
    "@type": "WebPage",
    "@id": pageUrl,
    url: pageUrl,
    name: article.headline,
    inLanguage: "en-US",
    isPartOf: { "@type": "WebSite", "@id": site.url },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    primaryImageOfPage: undefined,
    mainContentOfPage: {
      "@type": "WebPageElement",
      cssSelector: "#reimbursement-card",
    },
    lastReviewed,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      webPage,
      article,
      dataset,
      { ...breadcrumbs, "@id": `${pageUrl}#breadcrumb` },
      faq,
      organization,
    ],
  };
}
