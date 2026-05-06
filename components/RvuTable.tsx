import type { CptCode } from "@/lib/cms/schema";
import type { Gpci } from "@/lib/cms/schema";

const GLOBAL_DAYS_LABEL: Record<string, string> = {
  "000": "Endoscopic / minor — 0 day global",
  "010": "Minor — 10 day global",
  "090": "Major surgery — 90 day global",
  XXX: "Global concept does not apply",
  YYY: "Global period determined by carrier",
  ZZZ: "Add-on code; global same as primary",
  MMM: "Maternity — pre/post-partum bundled",
};

export function RvuTable({ cpt, gpci }: { cpt: CptCode; gpci: { workGpci: number; peGpci: number; mpGpci: number } }) {
  const { rvu } = cpt;
  return (
    <section className="mt-8" aria-labelledby="rvu-heading">
      <h2 id="rvu-heading" className="text-xl font-semibold">
        RVU Breakdown &amp; Locality Adjustment
      </h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm border border-slate-200">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left p-2 font-medium">Component</th>
              <th className="text-right p-2 font-medium">RVU</th>
              <th className="text-right p-2 font-medium">GPCI</th>
              <th className="text-right p-2 font-medium">Adjusted</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200">
              <th scope="row" className="text-left p-2 font-normal">
                Work
              </th>
              <td className="text-right p-2 font-mono">{rvu.workRvu.toFixed(2)}</td>
              <td className="text-right p-2 font-mono">{gpci.workGpci.toFixed(3)}</td>
              <td className="text-right p-2 font-mono">
                {(rvu.workRvu * gpci.workGpci).toFixed(3)}
              </td>
            </tr>
            <tr className="border-t border-slate-200">
              <th scope="row" className="text-left p-2 font-normal">
                Practice Expense (Non-Facility)
              </th>
              <td className="text-right p-2 font-mono">
                {rvu.peRvuNonFacility.toFixed(2)}
              </td>
              <td className="text-right p-2 font-mono">{gpci.peGpci.toFixed(3)}</td>
              <td className="text-right p-2 font-mono">
                {(rvu.peRvuNonFacility * gpci.peGpci).toFixed(3)}
              </td>
            </tr>
            <tr className="border-t border-slate-200">
              <th scope="row" className="text-left p-2 font-normal">
                Practice Expense (Facility)
              </th>
              <td className="text-right p-2 font-mono">
                {rvu.peRvuFacility.toFixed(2)}
              </td>
              <td className="text-right p-2 font-mono">{gpci.peGpci.toFixed(3)}</td>
              <td className="text-right p-2 font-mono">
                {(rvu.peRvuFacility * gpci.peGpci).toFixed(3)}
              </td>
            </tr>
            <tr className="border-t border-slate-200">
              <th scope="row" className="text-left p-2 font-normal">
                Malpractice
              </th>
              <td className="text-right p-2 font-mono">{rvu.mpRvu.toFixed(2)}</td>
              <td className="text-right p-2 font-mono">{gpci.mpGpci.toFixed(3)}</td>
              <td className="text-right p-2 font-mono">
                {(rvu.mpRvu * gpci.mpGpci).toFixed(3)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <dl className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
        <div>
          <dt className="text-slate-500">Global Surgery Indicator</dt>
          <dd>
            <span className="font-mono font-semibold">{cpt.globalDays}</span>
            <span className="ml-2 text-slate-700">
              {GLOBAL_DAYS_LABEL[cpt.globalDays] ?? "—"}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Status</dt>
          <dd className="font-mono">{cpt.status}</dd>
        </div>
        {cpt.modifiers.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Common Modifiers</dt>
            <dd className="font-mono">{cpt.modifiers.join(", ")}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
