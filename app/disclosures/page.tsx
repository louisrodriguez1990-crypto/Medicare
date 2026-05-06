import {
  TPMO_DISCLAIMER_2026,
  AGENT_CALL_DISCLAIMER,
  NON_GOVERNMENT_DISCLAIMER,
  EDITORIAL_REVIEW_NOTE,
  CMS_SOURCE_URL,
} from "@/lib/compliance/tpmo";
import { getAgentEntity } from "@/lib/seo/agent";

export const metadata = {
  title: "Disclosures, Editorial Policy, and CMS Compliance",
  description:
    "Required CMS marketing disclosures, the licensed agent's NPN, and how reimbursement values on this site are calculated.",
  alternates: { canonical: "/disclosures" },
};

export default function DisclosuresPage() {
  const agent = getAgentEntity();
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Disclosures &amp; Editorial Policy</h1>

      <h2>2026 CMS Marketing Disclaimer</h2>
      <p>{TPMO_DISCLAIMER_2026}</p>

      <h2>Agent Connection Disclaimer</h2>
      <p>{AGENT_CALL_DISCLAIMER}</p>

      <h2>Non-Government Site</h2>
      <p>{NON_GOVERNMENT_DISCLAIMER}</p>

      <h2>Licensed Agent of Record</h2>
      <p>
        This site is operated and editorially reviewed by{" "}
        <strong>{agent.name}</strong>, a licensed insurance producer with NPN{" "}
        <span className="font-mono">{agent.npn}</span>. Agent licensure can be
        verified via the{" "}
        <a href={agent.niprUrl} rel="external noopener">
          National Insurance Producer Registry
        </a>{" "}
        and individual state Departments of Insurance. CMS Marketing ID:{" "}
        <span className="font-mono">{agent.cmsMarketingId}</span>.
      </p>
      <p>Currently licensed in: {agent.licensedStates.join(", ") || "—"}.</p>

      <h2>How Reimbursement Values Are Calculated</h2>
      <p>{EDITORIAL_REVIEW_NOTE}</p>
      <p>
        All values are derived from the publicly available{" "}
        <a href={CMS_SOURCE_URL} rel="external noopener">
          CMS Medicare Physician Fee Schedule
        </a>{" "}
        and the GPCI tables published in the corresponding Final Rule. Formula:
      </p>
      <pre className="text-sm overflow-auto">
{`Allowed Amount = ((Work RVU × Work GPCI) + (PE RVU × PE GPCI) + (MP RVU × MP GPCI)) × Conversion Factor`}
      </pre>
      <p>
        Practice Expense (PE) RVU differs between non-facility and facility
        settings, which is why the two allowed amounts shown on each page can
        differ substantially. Always confirm the exact amount Medicare will pay
        with your Medicare Administrative Contractor (MAC).
      </p>

      <h2>No Medical or Coverage Advice</h2>
      <p>
        Information on this site is educational and does not constitute medical
        advice, legal advice, or a coverage determination. Coverage of any
        specific procedure depends on medical necessity, place of service,
        modifiers billed, and your individual Medicare or Medicare Advantage
        plan&apos;s benefits and prior-authorization rules.
      </p>
    </article>
  );
}
