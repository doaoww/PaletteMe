"use client";

import { useState } from "react";
import { DrapePortrait } from "./drape-portrait";

export type CircleEntry = {
  hex: string;
  name: string;
  description: string;
  verdict?: "best" | "okay" | "avoid";
};

type Props = {
  entries: CircleEntry[];
  drapingUrl: string | null;
  showVerdict?: boolean;
};

export function ColourCircles({ entries, drapingUrl, showVerdict = false }: Props) {
  const [activeHex, setActiveHex] = useState<string | null>(entries[0]?.hex ?? null);
  const active = entries.find(e => e.hex === activeHex) ?? null;

  return (
    <div className="cc">
      <div className="cc__row">
        {entries.map(e => (
          <button
            key={e.hex}
            className={[
              "cc__dot",
              e.verdict === "best"  ? "cc__dot--best"  : "",
              e.verdict === "avoid" ? "cc__dot--avoid" : "",
              activeHex === e.hex   ? "cc__dot--active" : "",
            ].filter(Boolean).join(" ")}
            style={{ background: e.hex }}
            onClick={() => setActiveHex(p => p === e.hex ? null : e.hex)}
            aria-label={e.name}
            title={e.name}
          />
        ))}
      </div>

      {active && (
        <div className="cc__panel" key={active.hex}>
          <div className="cc__portrait-wrap">
            {drapingUrl ? (
              <DrapePortrait
                baseImageUrl={drapingUrl}
                overlayColor={active.verdict === "avoid" ? undefined : active.hex}
                alt={active.name}
              />
            ) : (
              <div className="cc__portrait-fallback" style={{ background: active.hex }} />
            )}
            {showVerdict && active.verdict === "best" && (
              <span className="cc__verdict cc__verdict--best">works for you</span>
            )}
            {showVerdict && active.verdict === "avoid" && (
              <span className="cc__verdict cc__verdict--avoid">avoid</span>
            )}
          </div>
          <div className="cc__info">
            <p className="cc__name">{active.name}</p>
            <p className="cc__desc">{active.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
