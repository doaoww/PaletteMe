"use client";

import { useEffect, useState } from "react";
import { getBrowserScanCreditState } from "@/lib/scan/scan-credits";
import { ScanPaywallModal } from "@/components/billing/scan-paywall-modal";

type Props = {
  className?: string;
  compact?: boolean;
  labelMode?: "compact" | "scans-left" | "full";
};

export function CreditPill({ className, compact = false, labelMode }: Props) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    setRemaining(getBrowserScanCreditState().remaining);
  }, []);

  if (remaining === null) return null;

  const mode = labelMode ?? (compact ? "compact" : "full");
  const label =
    mode === "compact"
      ? `${remaining} ✦`
      : mode === "scans-left"
        ? `${remaining} scans left`
        : `${remaining} scans left ✦`;

  return (
    <>
      <button
        type="button"
        onClick={() => setPaywallOpen(true)}
        className={`credit-pill credit-pill--${mode}${className ? ` ${className}` : ""}`}
        aria-label="View scan credits and upgrade options"
      >
        {mode === "scans-left" ? (
          <>
            <svg className="credit-pill__spark" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="m12 2 2.2 6.8H21l-5.5 4 2.1 6.7L12 15.5 6.4 19.5l2.1-6.7L3 8.8h6.8L12 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            {label}
          </>
        ) : (
          label
        )}
      </button>
      <ScanPaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}
