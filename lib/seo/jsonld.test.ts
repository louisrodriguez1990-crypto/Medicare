import { describe, expect, it } from "vitest";
import { buildPageJsonLd } from "./jsonld";
import { calculateReimbursement } from "@/lib/cms/calc";
import { findSeedCpt, findSeedGpci } from "@/lib/db/seed";
import { resolveState } from "@/lib/cms/locality";

describe("buildPageJsonLd", () => {
  const cpt = findSeedCpt("G0438")!;
  const gpci = findSeedGpci("TX")!;
  const state = resolveState("texas")!;
  const rates = calculateReimbursement({ cpt, gpci });
  const graph = buildPageJsonLd({
    cpt,
    rates,
    state,
    pagePath: "/reimbursement/G0438/texas",
  });

  it("uses schema.org @context and a @graph", () => {
    expect(graph["@context"]).toBe("https://schema.org");
    expect(Array.isArray(graph["@graph"])).toBe(true);
  });

  it("includes WebPage, Article, Dataset, BreadcrumbList, FAQPage, Organization", () => {
    const types = (graph["@graph"] as Array<{ "@type": string }>).map((n) => n["@type"]);
    expect(types).toContain("WebPage");
    expect(types).toContain("Article");
    expect(types).toContain("Dataset");
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("FAQPage");
    expect(types).toContain("Organization");
  });

  it("does not include MedicalWebPage or Person (informational positioning)", () => {
    const types = (graph["@graph"] as Array<{ "@type": string }>).map((n) => n["@type"]);
    expect(types).not.toContain("MedicalWebPage");
    expect(types).not.toContain("Person");
  });

  it("cites CMS as the dataset creator", () => {
    const dataset = (graph["@graph"] as Array<Record<string, any>>).find(
      (n) => n["@type"] === "Dataset"
    )!;
    expect(dataset.creator.name).toMatch(/Centers for Medicare/i);
    expect(dataset.creator.url).toBe("https://www.cms.gov");
  });

  it("links Article author and publisher to the site Organization", () => {
    const article = (graph["@graph"] as Array<Record<string, any>>).find(
      (n) => n["@type"] === "Article"
    )!;
    expect(article.author["@type"]).toBe("Organization");
    expect(article.publisher["@type"]).toBe("Organization");
  });
});
