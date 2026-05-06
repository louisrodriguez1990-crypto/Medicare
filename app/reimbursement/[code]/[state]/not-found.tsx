export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold">CPT code or state not found</h1>
      <p className="mt-2 text-slate-600">
        We couldn&apos;t find that combination in the CMS Medicare Physician Fee
        Schedule. Check the code and try again.
      </p>
      <a href="/" className="mt-6 inline-block underline">
        Return to homepage
      </a>
    </div>
  );
}
