import { describe, expect, it } from "vitest";
import { buildPageJsonLd } from "./jsonld";
import { calculateReimbursement } from "@/lib/cms/calc";
import { findSeedCpt, findSeedGpci } from "@/lib/db/seed";
import { resolveState } from "@/lib/cms/locality";

describe("buildPageJsonLd", () => {
  const cpt = findSeedCpt("99214")!;
  const gpci = findSeedGpci("TX")!;
  const state = resolveState("texas")!;
  const rates = calculateReimbursement({ cpt, gpci });
  const graph = buildPageJsonLd({
    cpt,
    rates,
    state,
    pagePath: "/reimbursement/99214/texas",
  });

  it("uses schema.org @context and a @graph", () => {
    expect(graph["@context"]).toBe("https://schema.org");
    expect(Array.isArray(graph["@graph"])).toBe(true);
  });

  it("includes MedicalWebPage, Dataset, Person, BreadcrumbList, FAQPage", () => {
    const types = (graph["@graph"] as Array<{ "@type": string }>).map((n) => n["@type"]);
    expect(types).toContain("MedicalWebPage");
    expect(types).toContain("Dataset");
    expect(types).toContain("Person");
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("FAQPage");
  });

  it("attaches the licensed agent NPN as a credential", () => {
    const person = (graph["@graph"] as Array<Record<string, any>>).find(
      (n) => n["@type"] === "Person"
    )!;
    expect(person.hasCredential.name).toBe("National Producer Number");
    expect(person.hasCredential.identifier).toBeTruthy();
    expect(Array.isArray(person.sameAs)).toBe(true);
  });

  it("cites CMS as the dataset creator", () => {
    const dataset = (graph["@graph"] as Array<Record<string, any>>).find(
      (n) => n["@type"] === "Dataset"
    )!;
    expect(dataset.creator.name).toMatch(/Centers for Medicare/i);
    expect(dataset.creator.url).toBe("https://www.cms.gov");
  });
});
