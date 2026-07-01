"use client";

import { useState } from "react";
import type { BestColor, AvoidColor } from "@/lib/report/report-schema";

type ActiveEntry =
  | { kind: "best"; hex: string }
  | { kind: "avoid"; hex: string };

type Props = {
  baseImageUrl: string | null;
  photoDataUrl: string;
  colors?: BestColor[];
  avoidColors?: AvoidColor[];
};

export function ColorTryout({ baseImageUrl, colors = [], avoidColors }: Props) {
  const [active, setActive] = useState<ActiveEntry | null>(null);

  function toggle(next: ActiveEntry) {
    setActive(prev =>
      prev?.hex === next.hex && prev?.kind === next.kind ? null : next
    );
  }

  const activeHex = active?.hex ?? null;
  const activeBest  = active?.kind === "best"  ? colors.find(c => c.hex === active.hex) : null;
  const activeAvoid = active?.kind === "avoid" ? avoidColors?.find(c => c.hex === active.hex) : null;
  const isAvoidActive = active?.kind === "avoid";

  const avoidOnly = colors.length === 0;

  return (
    <div className={`color-tryout${avoidOnly ? " color-tryout--avoid-only" : ""}`}>
      <div className="color-tryout__frame">
        {baseImageUrl ? (
          <>
            <img src={baseImageUrl} alt="colour draping" className="color-tryout__base" />
            {activeHex && (
              <div
                className={`color-tryout__overlay${isAvoidActive ? " color-tryout__overlay--avoid" : ""}`}
                style={{ background: activeHex }}
              />
            )}
            {isAvoidActive && (
              <div className="color-tryout__avoid-badge" aria-hidden>✕ avoid</div>
            )}
          </>
        ) : (
          <div className="color-tryout__skeleton" />
        )}
      </div>

      {/* Best colors */}
      <div className="color-tryout__swatches">
        {colors.map(c => (
          <button
            key={c.hex}
            className={[
              "color-tryout__swatch",
              c.isBest ? "color-tryout__swatch--best" : "",
              active?.kind === "best" && active.hex === c.hex ? "color-tryout__swatch--active" : "",
            ].filter(Boolean).join(" ")}
            style={{ background: c.hex }}
            onClick={() => toggle({ kind: "best", hex: c.hex })}
            title={c.name}
            aria-label={c.name}
          />
        ))}
      </div>

      {/* Avoid colors */}
      {avoidColors && avoidColors.length > 0 && (
        <>
          {colors.length > 0 && <p className="color-tryout__avoid-label">colours to avoid</p>}
          <div className="color-tryout__swatches color-tryout__swatches--avoid">
            {avoidColors.map(c => (
              <button
                key={c.hex}
                className={[
                  "color-tryout__swatch",
                  "color-tryout__swatch--avoid-item",
                  active?.kind === "avoid" && active.hex === c.hex ? "color-tryout__swatch--active" : "",
                ].filter(Boolean).join(" ")}
                style={{ background: c.hex }}
                onClick={() => toggle({ kind: "avoid", hex: c.hex })}
                title={c.name}
                aria-label={c.name}
              />
            ))}
          </div>
        </>
      )}

      {/* Info panel */}
      {(activeBest || activeAvoid) && (
        <div className={`color-tryout__info${isAvoidActive ? " color-tryout__info--avoid" : ""}`}>
          <p className="color-tryout__label">
            {activeBest?.name ?? activeAvoid?.name}
          </p>
          <p className="color-tryout__explanation">
            {activeBest?.explanation ?? activeAvoid?.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
