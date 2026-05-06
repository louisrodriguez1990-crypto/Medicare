import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/agent";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/reimbursement", "/medical-billing-codes", "/disclosures", "/"],
        disallow: ["/api/", "/lp/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
