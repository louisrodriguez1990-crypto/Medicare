"use client";

import { useEffect, useRef } from "react";
import { getSiteConfig } from "@/lib/site/config";

interface AdSlotProps {
  slotId: string;                    // AdSense slot ID (data-ad-slot)
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  layout?: string;                   // for in-article: layout="in-article"
  responsive?: boolean;
  reservedHeight?: number;           // px, reserved to prevent CLS
  label?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

// CLS-safe AdSense slot. Reserves a fixed-height container (no layout shift) and pushes
// the ad on mount. Renders a clearly-labelled placeholder when AdSense isn't configured.
export function AdSlot({
  slotId,
  format = "auto",
  layout,
  responsive = true,
  reservedHeight = 280,
  label = "Advertisement",
  className = "",
}: AdSlotProps) {
  const { adsenseClientId } = getSiteConfig();
  const pushed = useRef(false);

  useEffect(() => {
    if (!adsenseClientId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* swallow — AdSense bootstrap may not be ready yet on first render */
    }
  }, [adsenseClientId]);

  if (!adsenseClientId) {
    return (
      <div
        role="complementary"
        aria-label={label}
        className={`my-6 grid place-items-center rounded border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500 ${className}`}
        style={{ minHeight: reservedHeight }}
      >
        ad slot · {slotId} · {reservedHeight}px reserved
      </div>
    );
  }

  return (
    <div
      role="complementary"
      aria-label={label}
      className={`my-6 ${className}`}
      style={{ minHeight: reservedHeight }}
    >
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight: reservedHeight }}
        data-ad-client={adsenseClientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
        {...(layout ? { "data-ad-layout": layout } : {})}
      />
    </div>
  );
}
