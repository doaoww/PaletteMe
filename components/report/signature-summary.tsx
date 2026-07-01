"use client";

import type { SignatureSummary } from "@/lib/report/report-schema";
import "./signature-summary.css";

type Props = {
  summary: SignatureSummary;
  wardrobeType?: "woman" | "man" | "other";
};

const ROWS: { key: keyof SignatureSummary; label: string }[] = [
  { key: "colors",    label: "Signature colours"  },
  { key: "neutral",   label: "Neutral base"        },
  { key: "makeup",    label: "Signature makeup"    },
  { key: "hair",      label: "Signature hair"      },
  { key: "glasses",   label: "Best glasses"        },
  { key: "archetype", label: "Face archetype"      },
  { key: "aesthetic", label: "Aesthetic"           },
];

export function SignatureSummarySection({ summary, wardrobeType = "woman" }: Props) {
  const rows = ROWS.map((row) =>
    row.key === "makeup" && wardrobeType === "man"
      ? { ...row, label: "Signature grooming" }
      : row
  );

  return (
    <div className="sig-summary">
      <div className="sig-summary__card">
        <p className="sig-summary__eyebrow">your signature</p>

        <p className="sig-summary__sentence">{summary.summary}</p>

        <div className="sig-summary__divider" />

        <div className="sig-summary__rows">
          {rows.map(({ key, label }) => (
            <div key={key} className="sig-summary__row">
              <span className="sig-summary__label">{label}</span>
              <span className="sig-summary__value">{summary[key]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
