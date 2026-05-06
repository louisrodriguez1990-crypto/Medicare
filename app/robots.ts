import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/site/config";

export default function robots(): MetadataRoute.Robots {
  const { url: siteUrl } = getSiteConfig();
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
