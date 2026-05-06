export interface Specialty {
  slug: string;
  name: string;
  cmsSpecialtyCode: string;
  schemaSpecialty: string;
}

export const SPECIALTIES: ReadonlyArray<Specialty> = [
  { slug: "cardiology", name: "Cardiology", cmsSpecialtyCode: "06", schemaSpecialty: "Cardiovascular" },
  { slug: "internal-medicine", name: "Internal Medicine", cmsSpecialtyCode: "11", schemaSpecialty: "InternalMedicine" },
  { slug: "family-practice", name: "Family Practice", cmsSpecialtyCode: "08", schemaSpecialty: "FamilyPractice" },
  { slug: "orthopedic-surgery", name: "Orthopedic Surgery", cmsSpecialtyCode: "20", schemaSpecialty: "Orthopedic" },
  { slug: "general-surgery", name: "General Surgery", cmsSpecialtyCode: "02", schemaSpecialty: "Surgical" },
  { slug: "radiology", name: "Radiology", cmsSpecialtyCode: "30", schemaSpecialty: "DiagnosticRadiology" },
  { slug: "anesthesiology", name: "Anesthesiology", cmsSpecialtyCode: "05", schemaSpecialty: "Anesthesia" },
  { slug: "dermatology", name: "Dermatology", cmsSpecialtyCode: "07", schemaSpecialty: "Dermatologic" },
  { slug: "neurology", name: "Neurology", cmsSpecialtyCode: "13", schemaSpecialty: "Neurologic" },
  { slug: "ophthalmology", name: "Ophthalmology", cmsSpecialtyCode: "18", schemaSpecialty: "Ophthalmologic" },
  { slug: "psychiatry", name: "Psychiatry", cmsSpecialtyCode: "26", schemaSpecialty: "Psychiatric" },
  { slug: "obstetrics-gynecology", name: "Obstetrics & Gynecology", cmsSpecialtyCode: "16", schemaSpecialty: "Obstetric" },
  { slug: "emergency-medicine", name: "Emergency Medicine", cmsSpecialtyCode: "93", schemaSpecialty: "Emergency" },
  { slug: "pulmonology", name: "Pulmonology", cmsSpecialtyCode: "29", schemaSpecialty: "Pulmonary" },
  { slug: "gastroenterology", name: "Gastroenterology", cmsSpecialtyCode: "10", schemaSpecialty: "Gastroenterologic" },
] as const;

const BY_SLUG = new Map(SPECIALTIES.map((s) => [s.slug, s] as const));

export function resolveSpecialty(slug: string): Specialty | null {
  return BY_SLUG.get(slug.trim().toLowerCase()) ?? null;
}
