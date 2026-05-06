// Agent E-E-A-T data, sourced from environment so PII never lives in the repo.
// All getters return safe defaults so dev / preview deploys never crash on missing env.

export interface AgentEntity {
  name: string;
  npn: string;
  licensedStates: string[];
  niprUrl: string;
  stateDoiUrl: string;
  linkedinUrl: string | null;
  cmsMarketingId: string;
}

export function getAgentEntity(): AgentEntity {
  return {
    name: process.env.AGENT_NAME ?? "Licensed Medicare Agent",
    npn: process.env.AGENT_NPN ?? "0000000",
    licensedStates: (process.env.AGENT_LICENSED_STATES ?? "")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean),
    niprUrl: process.env.AGENT_NIPR_URL ?? "https://nipr.com/licensing-center",
    stateDoiUrl: process.env.AGENT_STATE_DOI_URL ?? "https://content.naic.org/state-insurance-departments",
    linkedinUrl: process.env.AGENT_LINKEDIN_URL || null,
    cmsMarketingId: process.env.CMS_MARKETING_ID ?? "MULTIPLAN_PENDING_M",
  };
}

export function getSiteUrl(): string {
  return (process.env.SITE_URL ?? "https://example.com").replace(/\/$/, "");
}
