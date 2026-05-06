import { describe, expect, it } from "vitest";
import { buildSections, nationalRatesFor } from "./sections";
import { calculateReimbursement } from "@/lib/cms/calc";
import { CONVERSION_FACTOR_2026 } from "@/lib/cms/schema";
import { findSeedCpt, findSeedGpci } from "@/lib/db/seed";
import { resolveState } from "@/lib/cms/locality";

describe("buildSections", () => {
  const cpt = findSeedCpt("G0438")!;
  const gpci = findSeedGpci("TX")!;
  const state = resolveState("texas")!;
  const rates = calculateReimbursement({ cpt, gpci });
  const nationalRates = nationalRatesFor(cpt, CONVERSION_FACTOR_2026, rates.computedAt);
  const sections = buildSections({
    cpt,
    rates,
    state,
    gpci,
    nationalRates,
    siblingCodes: [
      { code: "G0439", shortDescription: "Annual wellness visit, subsequent" },
      { code: "G0444", shortDescription: "Depression screening" },
    ],
  });

  it("produces enough body content per page (>= 600 words)", () => {
    const wordCount = sections
      .flatMap((s) => s.paragraphs)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
    expect(wordCount).toBeGreaterThanOrEqual(600);
  });

  it("includes the canonical sections", () => {
    const ids = sections.map((s) => s.id);
    expect(ids).toContain("overview");
    expect(ids).toContain("rate-detail");
    expect(ids).toContain("math");
    expect(ids).toContain("global-period");
    expect(ids).toContain("state-context");
  });

  it("varies content between two states for the same code", () => {
    const ny = resolveState("new-york")!;
    const nyGpci = findSeedGpci("NY")!;
    const nyRates = calculateReimbursement({ cpt, gpci: nyGpci });
    const nySections = buildSections({
      cpt,
      rates: nyRates,
      state: ny,
      gpci: nyGpci,
      nationalRates,
      siblingCodes: [],
    });
    const a = sections.flatMap((s) => s.paragraphs).join(" ");
    const b = nySections.flatMap((s) => s.paragraphs).join(" ");
    expect(a).not.toBe(b);
    expect(b).toMatch(/New York/);
  });
});
