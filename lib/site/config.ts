// Centralized site config. Pure informational publisher — not a Medicare plan marketer,
// not a licensed-agent referral, no TPMO scope.

export interface SiteConfig {
  name: string;
  tagline: string;
  url: string;
  publisherName: string;
  publisherUrl: string;
  adsenseClientId: string | null;
  ga4MeasurementId: string | null;
  searchConsoleVerificationToken: string | null;
}

export function getSiteConfig(): SiteConfig {
  const url = (process.env.SITE_URL ?? "https://example.com").replace(/\/$/, "");
  return {
    name: process.env.SITE_NAME ?? "HCPCS Reimbursement",
    tagline:
      process.env.SITE_TAGLINE ??
      "Medicare HCPCS reimbursement rates by state, sourced from CMS.",
    url,
    publisherName: process.env.PUBLISHER_NAME ?? "HCPCS Reimbursement",
    publisherUrl: url,
    adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || null,
    ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_ID || null,
    searchConsoleVerificationToken: process.env.GSC_VERIFICATION_TOKEN || null,
  };
}

export const NON_AFFILIATION_DISCLAIMER =
  "This site is independent and not affiliated with, endorsed by, or sponsored by the U.S. government, the Centers for Medicare & Medicaid Services, or the federal Medicare program. Information is provided for educational purposes from publicly available CMS data.";
