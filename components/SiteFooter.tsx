import Link from "next/link";
import { getSiteConfig, NON_AFFILIATION_DISCLAIMER } from "@/lib/site/config";

export function SiteFooter() {
  const { name } = getSiteConfig();
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t border-slate-200 bg-slate-50 text-slate-700"
      role="contentinfo"
    >
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs leading-relaxed space-y-2">
        <p data-testid="non-affiliation">{NON_AFFILIATION_DISCLAIMER}</p>
        <p>
          Reimbursement values are calculated from the publicly available CMS
          Medicare Physician Fee Schedule and are provided for educational and
          billing reference purposes only.
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/about" className="underline">About</Link>
          <Link href="/methodology" className="underline">Methodology</Link>
          <Link href="/privacy" className="underline">Privacy</Link>
          <a
            href="https://www.cms.gov/medicare/payment/fee-schedules/physician"
            rel="external noopener"
            className="underline"
          >
            CMS source
          </a>
          <span>&copy; {year} {name}.</span>
        </p>
      </div>
    </footer>
  );
}
