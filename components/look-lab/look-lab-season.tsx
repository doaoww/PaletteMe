"use client";

import { useCallback } from "react";
import { LookLabCard } from "./look-lab-card";
import { LookLabBlock } from "./look-lab-block";
import { applyDraping } from "./transforms/apply-draping";
import type { SeasonCard } from "@/lib/look-lab-schema";

type LookLabSeasonProps = {
  photoDataUrl: string;
  best: SeasonCard;
  alternatives: SeasonCard[];
};

export function LookLabSeason({ photoDataUrl, best, alternatives }: LookLabSeasonProps) {
  const makeDrapingHandler = useCallback(
    (hex: string) => (canvas: HTMLCanvasElement) => applyDraping(canvas, hex),
    []
  );

  return (
    <LookLabBlock title="Your Colour Season">
      <div className="look-lab-season__main">
        <LookLabCard
          photoDataUrl={photoDataUrl}
          label={best.season}
          verdict="best"
          explanation={best.explanation}
          confidence={best.confidence}
          size="large"
          onCanvasReady={makeDrapingHandler(best.drapingHex)}
        />
      </div>
      <div className="look-lab-season__alts">
        {alternatives.slice(0, 2).map(alt => (
          <LookLabCard
            key={alt.season}
            photoDataUrl={photoDataUrl}
            label={alt.season}
            verdict="okay"
            explanation={alt.explanation}
            confidence={alt.confidence}
            size="small"
            onCanvasReady={makeDrapingHandler(alt.drapingHex)}
          />
        ))}
      </div>
    </LookLabBlock>
  );
}
