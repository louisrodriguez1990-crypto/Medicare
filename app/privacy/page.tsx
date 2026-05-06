import { getSiteConfig } from "@/lib/site/config";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for this independent Medicare HCPCS reimbursement reference site.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  const { name, ga4MeasurementId, adsenseClientId } = getSiteConfig();
  const useAds = Boolean(adsenseClientId);
  const useGa = Boolean(ga4MeasurementId);
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Privacy Policy</h1>
      <p>
        {name} does not collect, store, or process protected health information
        (PHI). We do not require accounts or sign-in. The site is purely
        reference content rendered from publicly available CMS data.
      </p>

      <h2>Analytics and advertising</h2>
      {useGa ? (
        <p>
          We use Google Analytics 4 with IP anonymization to understand
          aggregate site usage. GA4 sets cookies and may collect technical
          information (browser, device, referrer, pages viewed). You can opt
          out using the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            rel="external noopener"
          >
            Google Analytics opt-out browser add-on
          </a>
          .
        </p>
      ) : (
        <p>This deployment is not currently running analytics.</p>
      )}
      {useAds ? (
        <>
          <p>
            We display advertising through Google AdSense. Google and its
            advertising partners may use cookies and similar technologies to
            serve ads based on your prior visits to this and other websites.
          </p>
          <p>
            You can manage personalized advertising at{" "}
            <a
              href="https://www.google.com/settings/ads"
              rel="external noopener"
            >
              Google Ad Settings
            </a>{" "}
            and review Google&apos;s advertising privacy practices at{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              rel="external noopener"
            >
              policies.google.com/technologies/ads
            </a>
            .
          </p>
        </>
      ) : (
        <p>This deployment is not currently displaying advertising.</p>
      )}

      <h2>Cookies</h2>
      <p>
        Beyond third-party analytics and advertising cookies described above,
        we set no first-party cookies.
      </p>

      <h2>Data we do not collect</h2>
      <ul>
        <li>We do not request, collect, or store names, addresses, or contact information.</li>
        <li>We do not collect medical records, claim data, or any PHI.</li>
        <li>We do not sell or rent any user data.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent through the contact form linked
        in the site footer.
      </p>
    </article>
  );
}
