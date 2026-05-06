import type { MetadataRoute } from "next";
import { listTopCpts } from "@/lib/db/queries";
import { STATES } from "@/lib/cms/locality";
import { SPECIALTIES } from "@/lib/content/specialties";
import { getSiteConfig } from "@/lib/site/config";

// Next 15 supports a sitemap *index* via generateSitemaps; this file emits a single sitemap
// limited to the top-N CPTs to stay under the 50K-URL / 50 MB sitemap caps.
// For the full 550K-URL build, switch to `export async function generateSitemaps()` returning
// an array of { id } and emit one sitemap per chunk of 45K URLs.
const SITEMAP_TOP_N = parseInt(process.env.SITEMAP_TOP_N ?? "200", 10);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { url: siteUrl } = getSiteConfig();
  const cpts = await listTopCpts(SITEMAP_TOP_N);
  const lastModified = new Date();

  const urls: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/reimbursement`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/medical-billing-codes`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/disclosures`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  for (const cpt of cpts) {
    for (const state of STATES) {
      urls.push({
        url: `${siteUrl}/reimbursement/${cpt.code}/${state.slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
    for (const specialtySlug of cpt.specialtyTaxonomy) {
      const sp = SPECIALTIES.find((s) => s.slug === specialtySlug);
      if (sp) {
        urls.push({
          url: `${siteUrl}/medical-billing-codes/${sp.slug}/${cpt.code}`,
          lastModified,
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  }

  return urls;
}
