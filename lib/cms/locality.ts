import type { Gpci } from "./schema";

// State → "primary" locality. CMS publishes one or more localities per state for MPFS pricing.
// For pSEO pages targeted at "Medicare reimbursement in {state}", we surface the state's
// statewide locality where one exists, else the largest metropolitan locality. ETL replaces
// this map at load time; the in-repo copy is the dev fallback.
export const STATE_PRIMARY_LOCALITY: Record<string, string> = {
  AL: "0001000", AK: "0200000", AZ: "0300000", AR: "1300000",
  CA: "0500000", CO: "0400000", CT: "0700000", DE: "1200000",
  DC: "0100000", FL: "0900000", GA: "1000000", HI: "0102200",
  ID: "1500000", IL: "1600000", IN: "1700000", IA: "1800000",
  KS: "1900000", KY: "1500000", LA: "0700000", ME: "3100000",
  MD: "0301000", MA: "0001401", MI: "1300000", MN: "0500200",
  MS: "0700000", MO: "0200000", MT: "1500000", NE: "1600000",
  NV: "0100000", NH: "1400000", NJ: "0001200", NM: "0500000",
  NY: "0511101", NC: "1100000", ND: "1100000", OH: "1500000",
  OK: "1300000", OR: "0102100", PA: "1200000", RI: "1300000",
  SC: "1100000", SD: "1200000", TN: "1000000", TX: "0001100",
  UT: "0900000", VT: "3100000", VA: "0301600", WA: "0200200",
  WV: "1600000", WI: "0001500", WY: "1700000",
  PR: "7200000", VI: "7800000",
};

export type StateSlug =
  | "alabama" | "alaska" | "arizona" | "arkansas" | "california" | "colorado"
  | "connecticut" | "delaware" | "district-of-columbia" | "florida" | "georgia"
  | "hawaii" | "idaho" | "illinois" | "indiana" | "iowa" | "kansas" | "kentucky"
  | "louisiana" | "maine" | "maryland" | "massachusetts" | "michigan"
  | "minnesota" | "mississippi" | "missouri" | "montana" | "nebraska" | "nevada"
  | "new-hampshire" | "new-jersey" | "new-mexico" | "new-york" | "north-carolina"
  | "north-dakota" | "ohio" | "oklahoma" | "oregon" | "pennsylvania"
  | "rhode-island" | "south-carolina" | "south-dakota" | "tennessee" | "texas"
  | "utah" | "vermont" | "virginia" | "washington" | "west-virginia"
  | "wisconsin" | "wyoming" | "puerto-rico" | "us-virgin-islands";

export interface StateMeta {
  slug: StateSlug;
  abbr: string;
  name: string;
}

export const STATES: ReadonlyArray<StateMeta> = [
  { slug: "alabama", abbr: "AL", name: "Alabama" },
  { slug: "alaska", abbr: "AK", name: "Alaska" },
  { slug: "arizona", abbr: "AZ", name: "Arizona" },
  { slug: "arkansas", abbr: "AR", name: "Arkansas" },
  { slug: "california", abbr: "CA", name: "California" },
  { slug: "colorado", abbr: "CO", name: "Colorado" },
  { slug: "connecticut", abbr: "CT", name: "Connecticut" },
  { slug: "delaware", abbr: "DE", name: "Delaware" },
  { slug: "district-of-columbia", abbr: "DC", name: "District of Columbia" },
  { slug: "florida", abbr: "FL", name: "Florida" },
  { slug: "georgia", abbr: "GA", name: "Georgia" },
  { slug: "hawaii", abbr: "HI", name: "Hawaii" },
  { slug: "idaho", abbr: "ID", name: "Idaho" },
  { slug: "illinois", abbr: "IL", name: "Illinois" },
  { slug: "indiana", abbr: "IN", name: "Indiana" },
  { slug: "iowa", abbr: "IA", name: "Iowa" },
  { slug: "kansas", abbr: "KS", name: "Kansas" },
  { slug: "kentucky", abbr: "KY", name: "Kentucky" },
  { slug: "louisiana", abbr: "LA", name: "Louisiana" },
  { slug: "maine", abbr: "ME", name: "Maine" },
  { slug: "maryland", abbr: "MD", name: "Maryland" },
  { slug: "massachusetts", abbr: "MA", name: "Massachusetts" },
  { slug: "michigan", abbr: "MI", name: "Michigan" },
  { slug: "minnesota", abbr: "MN", name: "Minnesota" },
  { slug: "mississippi", abbr: "MS", name: "Mississippi" },
  { slug: "missouri", abbr: "MO", name: "Missouri" },
  { slug: "montana", abbr: "MT", name: "Montana" },
  { slug: "nebraska", abbr: "NE", name: "Nebraska" },
  { slug: "nevada", abbr: "NV", name: "Nevada" },
  { slug: "new-hampshire", abbr: "NH", name: "New Hampshire" },
  { slug: "new-jersey", abbr: "NJ", name: "New Jersey" },
  { slug: "new-mexico", abbr: "NM", name: "New Mexico" },
  { slug: "new-york", abbr: "NY", name: "New York" },
  { slug: "north-carolina", abbr: "NC", name: "North Carolina" },
  { slug: "north-dakota", abbr: "ND", name: "North Dakota" },
  { slug: "ohio", abbr: "OH", name: "Ohio" },
  { slug: "oklahoma", abbr: "OK", name: "Oklahoma" },
  { slug: "oregon", abbr: "OR", name: "Oregon" },
  { slug: "pennsylvania", abbr: "PA", name: "Pennsylvania" },
  { slug: "rhode-island", abbr: "RI", name: "Rhode Island" },
  { slug: "south-carolina", abbr: "SC", name: "South Carolina" },
  { slug: "south-dakota", abbr: "SD", name: "South Dakota" },
  { slug: "tennessee", abbr: "TN", name: "Tennessee" },
  { slug: "texas", abbr: "TX", name: "Texas" },
  { slug: "utah", abbr: "UT", name: "Utah" },
  { slug: "vermont", abbr: "VT", name: "Vermont" },
  { slug: "virginia", abbr: "VA", name: "Virginia" },
  { slug: "washington", abbr: "WA", name: "Washington" },
  { slug: "west-virginia", abbr: "WV", name: "West Virginia" },
  { slug: "wisconsin", abbr: "WI", name: "Wisconsin" },
  { slug: "wyoming", abbr: "WY", name: "Wyoming" },
  { slug: "puerto-rico", abbr: "PR", name: "Puerto Rico" },
  { slug: "us-virgin-islands", abbr: "VI", name: "U.S. Virgin Islands" },
] as const;

const SLUG_TO_STATE = new Map(STATES.map((s) => [s.slug, s] as const));
const ABBR_TO_STATE = new Map(STATES.map((s) => [s.abbr, s] as const));

export function resolveState(input: string): StateMeta | null {
  const trimmed = input.trim().toLowerCase();
  return (
    SLUG_TO_STATE.get(trimmed as StateSlug) ??
    ABBR_TO_STATE.get(input.trim().toUpperCase()) ??
    null
  );
}
