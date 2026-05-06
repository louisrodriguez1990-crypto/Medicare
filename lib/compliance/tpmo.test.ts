import { describe, expect, it } from "vitest";
import {
  TPMO_DISCLAIMER_2026,
  AGENT_CALL_DISCLAIMER,
  NON_GOVERNMENT_DISCLAIMER,
} from "./tpmo";

// These are CMS-mandated strings. Locking them byte-for-byte so any drift triggers a test
// failure and forces a deliberate compliance review.

describe("CMS disclaimers", () => {
  it("TPMO 2026 disclaimer is verbatim", () => {
    expect(TPMO_DISCLAIMER_2026).toBe(
      "We do not offer every plan available in your area. Any information we provide is limited to those plans we do offer in your area. Please contact Medicare.gov or 1-800-MEDICARE to get information on all of your options."
    );
  });

  it("agent-call disclaimer is verbatim", () => {
    expect(AGENT_CALL_DISCLAIMER).toBe(
      "By calling the number above, you will be connected to a licensed insurance agent."
    );
  });

  it("non-government disclaimer is present", () => {
    expect(NON_GOVERNMENT_DISCLAIMER).toMatch(
      /not connected with or endorsed by the United States government/
    );
  });
});
