import type { Section } from "@/lib/content/sections";
import Link from "next/link";

export function ContentSections({
  sections,
  state,
}: {
  sections: Section[];
  state: { slug: string };
}) {
  return (
    <div className="mt-10 space-y-8">
      {sections.map((s) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
          <h2 id={`${s.id}-h`} className="text-xl font-semibold tracking-tight">
            {s.heading}
          </h2>
          <div className="mt-3 space-y-3 text-slate-800 leading-relaxed">
            {s.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {s.id === "related" && (
              <SiblingLinks paragraphs={s.paragraphs} stateSlug={state.slug} />
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

// Pulls "G0008 (admin of...)" tokens out of the related-codes paragraph and renders them
// as internal links so crawl depth/internal-linking improves without duplicating data.
function SiblingLinks({
  paragraphs,
  stateSlug,
}: {
  paragraphs: string[];
  stateSlug: string;
}) {
  const text = paragraphs.join(" ");
  const codes = Array.from(text.matchAll(/\b([A-Z][0-9]{4})\b/g)).map((m) => m[1]);
  const unique = Array.from(new Set(codes));
  if (unique.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {unique.map((c) => (
        <li key={c}>
          <Link
            href={`/reimbursement/${c}/${stateSlug}`}
            className="inline-block rounded border border-slate-300 px-2 py-1 text-sm font-mono hover:bg-slate-100"
          >
            {c}
          </Link>
        </li>
      ))}
    </ul>
  );
}
