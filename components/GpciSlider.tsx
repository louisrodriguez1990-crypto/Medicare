"use client";

import { useState } from "react";
import { calculateReimbursement } from "@/lib/cms/calc";
import type { CptCode, Gpci } from "@/lib/cms/schema";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function GpciSlider({ cpt, gpci }: { cpt: CptCode; gpci: Gpci }) {
  const [workGpci, setWorkGpci] = useState(gpci.workGpci);
  const [peGpci, setPeGpci] = useState(gpci.peGpci);
  const [mpGpci, setMpGpci] = useState(gpci.mpGpci);

  const rates = calculateReimbursement({
    cpt,
    gpci: { ...gpci, workGpci, peGpci, mpGpci },
  });

  return (
    <section className="mt-8 rounded-md border border-slate-200 p-4" aria-labelledby="gpci-heading">
      <h2 id="gpci-heading" className="text-lg font-semibold">
        Estimate other localities
      </h2>
      <p className="text-sm text-slate-600">
        Drag a slider to model how a different MAC locality&apos;s GPCI changes the
        allowed amount.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <SliderRow label="Work GPCI" value={workGpci} onChange={setWorkGpci} />
        <SliderRow label="PE GPCI" value={peGpci} onChange={setPeGpci} />
        <SliderRow label="MP GPCI" value={mpGpci} onChange={setMpGpci} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
        <div className="rounded border border-slate-200 p-3">
          <div className="text-xs uppercase text-slate-500">
            Estimated Non-Facility
          </div>
          <div className="text-xl font-bold">{usd(rates.nonFacilityPrice)}</div>
        </div>
        <div className="rounded border border-slate-200 p-3">
          <div className="text-xs uppercase text-slate-500">
            Estimated Facility
          </div>
          <div className="text-xl font-bold">{usd(rates.facilityPrice)}</div>
        </div>
      </div>
    </section>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-slate-600">{label}</span>
      <input
        type="range"
        min={0.7}
        max={1.7}
        step={0.001}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-1 w-full"
      />
      <span className="font-mono text-xs">{value.toFixed(3)}</span>
    </label>
  );
}
