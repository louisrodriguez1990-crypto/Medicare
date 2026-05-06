import type { CptCode, Reimbursement } from "@/lib/cms/schema";
import type { StateMeta } from "@/lib/cms/locality";
import type { Specialty } from "@/lib/content/specialties";
import { CMS_SOURCE_URL } from "@/lib/compliance/tpmo";
import { getAgentEntity, getSiteUrl } from "./agent";

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
  const agent = getAgentEntity();
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${pagePath}`;
  const lastReviewed = rates.computedAt.slice(0, 10);

  const sameAs = [agent.niprUrl, agent.stateDoiUrl, `${siteUrl}/npn-attestation.pdf`];
  if (agent.linkedinUrl) sameAs.push(agent.linkedinUrl);

  const reviewer = {
    "@type": "Person",
    "@id": `${siteUrl}/about#agent`,
    name: agent.name,
    jobTitle: "Licensed Medicare Insurance Agent",
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "license",
      name: "National Producer Number",
      identifier: agent.npn,
      recognizedBy: {
        "@type": "Organization",
        name: "National Insurance Producer Registry",
        url: "https://nipr.com",
      },
    },
    knowsAbout: agent.licensedStates.map((s) => `Medicare Advantage in ${s}`),
    sameAs,
  };

  const dataset = {
    "@type": "Dataset",
    "@id": `${siteUrl}/dataset/cms-mpfs-2026`,
    name: `CMS Medicare Physician Fee Schedule ${cpt.sourceYear}`,
    description: `Official CMS reimbursement rates and Relative Value Units for CPT/HCPCS procedure codes for ${cpt.sourceYear}.`,
    creator: {
      "@type": "GovernmentOrganization",
      name: "Centers for Medicare & Medicaid Services",
      url: "https://www.cms.gov",
    },
    isBasedOn: CMS_SOURCE_URL,
    license: "https://www.cms.gov/About-CMS/Agency-Information/Aboutwebsite/Policiesforuse",
    keywords: ["Medicare", "CPT", "HCPCS", "Physician Fee Schedule", "RVU"],
    distribution: {
      "@type": "DataDownload",
      contentUrl: CMS_SOURCE_URL,
      encodingFormat: "text/csv",
    },
  };

  const breadcrumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Medicare Reimbursement",
        item: `${siteUrl}/reimbursement`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `CPT ${cpt.code}`,
        item: `${siteUrl}/reimbursement/${cpt.code}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: state.name,
        item: pageUrl,
      },
    ],
  };

  const faq = {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the 2026 Medicare reimbursement rate for CPT ${cpt.code} in ${state.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `For 2026, Medicare reimburses approximately $${rates.nonFacilityPrice.toFixed(2)} for CPT ${cpt.code} (${cpt.shortDescription}) when performed in a non-facility setting in ${state.name}, and $${rates.facilityPrice.toFixed(2)} in a facility setting. These figures are calculated from the CMS Medicare Physician Fee Schedule using the locality-specific GPCI for ${state.name}.`,
        },
      },
      {
        "@type": "Question",
        name: `Does Medicare cover CPT ${cpt.code}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Original Medicare (Part B) covers CPT ${cpt.code} when medically necessary and ordered by a Medicare-enrolled provider. Beneficiaries are typically responsible for the Part B deductible and 20% coinsurance unless they have a Medicare Supplement (Medigap) or Medicare Advantage plan that covers the cost-sharing.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the global period for CPT ${cpt.code}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `CPT ${cpt.code} has a CMS global surgery indicator of "${cpt.globalDays}". This determines what related pre- and post-procedure services are bundled into the single reimbursement.`,
        },
      },
    ],
  };

  const medicalCode = {
    "@type": "MedicalCode",
    code: cpt.code,
    codingSystem: cpt.code.match(/^[A-Z]/) ? "HCPCS" : "CPT",
    name: cpt.shortDescription,
    description: cpt.longDescription,
  };

  const medicalWebPage: Record<string, unknown> = {
    "@type": "MedicalWebPage",
    "@id": pageUrl,
    url: pageUrl,
    name: `CPT ${cpt.code} Medicare Reimbursement Rate in ${state.name} (${cpt.sourceYear})`,
    headline: `CPT ${cpt.code} ${cpt.shortDescription} — ${state.name} Medicare Rate`,
    inLanguage: "en-US",
    isPartOf: { "@type": "WebSite", "@id": siteUrl },
    about: medicalCode,
    mainContentOfPage: {
      "@type": "WebPageElement",
      cssSelector: "#reimbursement-card",
    },
    audience: [
      { "@type": "MedicalAudience", audienceType: "MedicalResearcher" },
      { "@type": "MedicalAudience", audienceType: "Patient" },
    ],
    lastReviewed,
    reviewedBy: reviewer,
    citation: dataset,
    isBasedOn: CMS_SOURCE_URL,
  };

  if (specialty) {
    medicalWebPage.specialty = {
      "@type": "MedicalSpecialty",
      name: specialty.schemaSpecialty,
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [medicalWebPage, dataset, reviewer, breadcrumbs, faq],
  };
}
