"use client";

import type { MakeupComparison } from "@/lib/report/report-schema";

type Props = {
  item: MakeupComparison;
  goodImageUrl: string | null;
};

export function MakeupComparisonCard({ item, goodImageUrl }: Props) {
  return (
    <div className="makeup-comparison">
      <p className="makeup-comparison__label">{item.categoryLabel}</p>

      <div className="makeup-comparison__layout">
        {/* Good shade — generated photo */}
        <div className="makeup-comparison__good">
          {goodImageUrl ? (
            <img src={goodImageUrl} alt={item.goodShade.name} className="makeup-comparison__img" />
          ) : (
            <div className="makeup-comparison__img-skeleton" />
          )}
          <div className="makeup-comparison__tag makeup-comparison__tag--good">
            <span className="makeup-comparison__swatch" style={{ background: item.goodShade.hex }} />
            {item.goodShade.name}
          </div>
        </div>

        {/* Bad shade — swatch + explanation, no generated image */}
        <div className="makeup-comparison__bad-panel">
          <div className="makeup-comparison__bad-swatch-row">
            <span className="makeup-comparison__bad-swatch" style={{ background: item.badShade.hex }} />
            <span className="makeup-comparison__tag makeup-comparison__tag--bad">
              {item.badShade.name}
            </span>
          </div>
          <p className="makeup-comparison__explanation">{item.explanation}</p>
        </div>
      </div>
    </div>
  );
}
