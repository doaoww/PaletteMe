"use client";

import { useState } from "react";
import type { BestColor } from "@/lib/report/report-schema";
import { DrapePortrait } from "./drape-portrait";
import "./best-colors-slide.css";

type Props = {
  neutralDrapingUrl: string;
  bestColors: BestColor[];
  onComplete: () => void;
  reportMode?: boolean;
};

export function BestColorsSlide({ neutralDrapingUrl, bestColors, onComplete, reportMode = false }: Props) {
  const [activeHex, setActiveHex] = useState<string>(bestColors[0]?.hex ?? "");
  const activeColor = bestColors.find(c => c.hex === activeHex);

  return (
    <div className="best-colors-slide">
      <div className="best-colors-slide__header">
        <p className="best-colors-slide__eyebrow">your palette</p>
        <h2 className="best-colors-slide__title">your best colours</h2>
      </div>

      <div className="best-colors-slide__portrait-wrap">
        <DrapePortrait
          baseImageUrl={neutralDrapingUrl}
          overlayColor={activeHex || undefined}
          alt="best colour try-on"
        />
      </div>

      <div className="best-colors-slide__swatches">
        {bestColors.map(c => (
          <button
            key={c.hex}
            className={[
              "best-colors-slide__swatch",
              c.isBest ? "best-colors-slide__swatch--best" : "",
              c.hex === activeHex ? "best-colors-slide__swatch--active" : "",
            ].filter(Boolean).join(" ")}
            style={{ background: c.hex }}
            onClick={() => setActiveHex(c.hex)}
            aria-label={c.name}
            title={c.name}
          />
        ))}
      </div>

      {activeColor && (
        <div className="best-colors-slide__info">
          <p className="best-colors-slide__color-name">{activeColor.name}</p>
          {activeColor.explanation && (
            <p className="best-colors-slide__explanation">{activeColor.explanation}</p>
          )}
        </div>
      )}

      {!reportMode && (
        <div className="best-colors-slide__footer">
          <button className="best-colors-slide__next" onClick={onComplete}>
            view full report →
          </button>
        </div>
      )}
    </div>
  );
}
