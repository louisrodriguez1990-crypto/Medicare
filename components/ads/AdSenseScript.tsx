import Script from "next/script";
import { getSiteConfig } from "@/lib/site/config";

// Bootstrap script. Loads `pagead2.googlesyndication.com/.../adsbygoogle.js` once globally
// using next/script's afterInteractive strategy so it doesn't block LCP. Skipped entirely
// when NEXT_PUBLIC_ADSENSE_CLIENT_ID is unset (dev / preview).
export function AdSenseScript() {
  const { adsenseClientId } = getSiteConfig();
  if (!adsenseClientId) return null;
  return (
    <Script
      id="adsense-bootstrap"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
    />
  );
}
