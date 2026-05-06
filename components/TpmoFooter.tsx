import Link from "next/link";
import {
  TPMO_DISCLAIMER_2026,
  NON_GOVERNMENT_DISCLAIMER,
} from "@/lib/compliance/tpmo";
import { getAgentEntity } from "@/lib/seo/agent";

export function TpmoFooter() {
  const agent = getAgentEntity();
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t border-slate-200 bg-slate-50 text-slate-700"
      role="contentinfo"
    >
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs leading-relaxed space-y-3">
        <p data-testid="tpmo-disclaimer">{TPMO_DISCLAIMER_2026}</p>
        <p data-testid="non-government-disclaimer">{NON_GOVERNMENT_DISCLAIMER}</p>
        <p>
          Editorially reviewed by <strong>{agent.name}</strong>, NPN{" "}
          <span className="font-mono">{agent.npn}</span>. Licensed in{" "}
          {agent.licensedStates.length > 0
            ? agent.licensedStates.join(", ")
            : "multiple states"}
          . CMS Marketing ID:{" "}
          <span className="font-mono">{agent.cmsMarketingId}</span>.
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/disclosures" className="underline">
            Full Disclosures
          </Link>
          <a
            href="https://www.medicare.gov"
            rel="external noopener"
            className="underline"
          >
            Medicare.gov
          </a>
          <a href="tel:1-800-633-4227" className="underline">
            1-800-MEDICARE
          </a>
          <span>&copy; {year} Medicare CPT Reimbursement.</span>
        </p>
      </div>
    </footer>
  );
}
