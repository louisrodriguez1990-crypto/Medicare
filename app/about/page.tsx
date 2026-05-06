import { getSiteConfig, NON_AFFILIATION_DISCLAIMER } from "@/lib/site/config";

export const metadata = {
  title: "About",
  description:
    "About this independent reference site for Medicare HCPCS reimbursement rates.",
  alternates: { canonical: "/about" },
};

export default function About() {
  const { name } = getSiteConfig();
  return (
    <article className="prose prose-slate max-w-none">
      <h1>About {name}</h1>
      <p>
        {name} is an independent reference site for Medicare HCPCS Level II
        reimbursement rates, built for medical billers, coders, practice
        administrators, and Medicare beneficiaries researching what a procedure
        will cost.
      </p>
      <p>
        We render the publicly available CMS Medicare Physician Fee Schedule
        (MPFS) data into a fast, locality-adjusted lookup. Our values are
        calculated using the formula CMS publishes; see our{" "}
        <a href="/methodology">methodology</a> for the exact inputs and steps.
      </p>
      <h2>Disclaimer</h2>
      <p>{NON_AFFILIATION_DISCLAIMER}</p>
    </article>
  );
}
