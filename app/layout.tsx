import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { getSiteConfig } from "@/lib/site/config";

const { url, name, tagline, searchConsoleVerificationToken } = getSiteConfig();

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: `${name} — Medicare HCPCS Reimbursement Rates by State (2026)`,
    template: `%s | ${name}`,
  },
  description: tagline,
  applicationName: name,
  robots: { index: true, follow: true },
  ...(searchConsoleVerificationToken
    ? { verification: { google: searchConsoleVerificationToken } }
    : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US">
      <head>
        <AdSenseScript />
      </head>
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
              {name}
            </a>
            <nav className="text-sm flex gap-4">
              <a href="/reimbursement" className="hover:underline">
                Reimbursement
              </a>
              <a href="/medical-billing-codes" className="hover:underline">
                By Specialty
              </a>
              <a href="/methodology" className="hover:underline">
                Methodology
              </a>
            </nav>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>
        <SiteFooter />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
