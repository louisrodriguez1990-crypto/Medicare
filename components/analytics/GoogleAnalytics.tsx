import Script from "next/script";
import { getSiteConfig } from "@/lib/site/config";

export function GoogleAnalytics() {
  const { ga4MeasurementId } = getSiteConfig();
  if (!ga4MeasurementId) return null;
  return (
    <>
      <Script
        async
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4MeasurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
