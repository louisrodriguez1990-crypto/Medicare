import type { Metadata } from "next";
import "./globals.css";
import { TpmoFooter } from "@/components/TpmoFooter";
import { getSiteUrl } from "@/lib/seo/agent";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Medicare CPT Reimbursement Rates by State (2026)",
    template: "%s | Medicare CPT Reimbursement",
  },
  description:
    "Look up 2026 Medicare reimbursement rates for any CPT or HCPCS code, adjusted for your state's GPCI. Sourced from the CMS Physician Fee Schedule.",
  applicationName: "Medicare CPT Reimbursement",
  authors: [{ name: "Licensed Medicare Agent" }],
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US">
      <body className="min-h-screen bg-white text-ink antialiased font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:p-2"
        >
          Skip to content
        </a>
        <header className="border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-tight">
              Medicare CPT Reimbursement
            </a>
            <nav className="text-sm flex gap-4">
              <a href="/reimbursement" className="hover:underline">
                Reimbursement
              </a>
              <a href="/medical-billing-codes" className="hover:underline">
                By Specialty
              </a>
              <a href="/disclosures" className="hover:underline">
                Disclosures
              </a>
            </nav>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>
        <TpmoFooter />
      </body>
    </html>
  );
}
