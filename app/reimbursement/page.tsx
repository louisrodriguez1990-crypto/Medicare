import Link from "next/link";
import { listTopCpts } from "@/lib/db/queries";

export const revalidate = 86400;

export const metadata = {
  title: "Browse Medicare Reimbursement by CPT Code",
  description:
    "Directory of Medicare reimbursement rates for every CPT and HCPCS procedure code, by state.",
  alternates: { canonical: "/reimbursement" },
};

export default async function ReimbursementIndex() {
  const cpts = await listTopCpts(500);
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Medicare Reimbursement by CPT Code
      </h1>
      <p className="mt-3 text-slate-700">
        Pick a code to see the 2026 Medicare allowed amount in every state.
      </p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {cpts.map((c) => (
          <li key={c.code}>
            <Link
              href={`/reimbursement/${c.code}/texas`}
              className="block rounded border border-slate-200 px-3 py-2 hover:border-accent"
            >
              <span className="font-mono font-semibold">{c.code}</span>
              <span className="ml-2 text-sm text-slate-600">
                {c.shortDescription}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
