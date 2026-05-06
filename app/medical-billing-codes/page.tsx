import Link from "next/link";
import { SPECIALTIES } from "@/lib/content/specialties";

export const revalidate = 86400;

export const metadata = {
  title: "Medical Billing Codes by Specialty",
  description:
    "Browse Medicare-covered CPT and HCPCS codes by medical specialty.",
  alternates: { canonical: "/medical-billing-codes" },
};

export default function SpecialtyIndex() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Medical Billing Codes by Specialty
      </h1>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {SPECIALTIES.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/medical-billing-codes/${s.slug}/G0438`}
              className="block rounded border border-slate-200 px-3 py-2 hover:border-accent"
            >
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
