"use client";

import { useState } from "react";
import type { MakeupShade } from "@/lib/report/color-diagnostics-schema";
import type { MakeupComparison } from "@/lib/report/report-schema";
import "./makeup-section.css";

// ── Avoid shades list ─────────────────────────────────────────────────────────

type AvoidShadesListProps = {
  shades: { hex: string; name: string; reason: string }[];
};

function AvoidShadesList({ shades }: AvoidShadesListProps) {
  return (
    <div className="avoid-shades">
      <p className="avoid-shades__label">also avoid</p>
      <div className="avoid-shades__list">
        {shades.map(s => (
          <div key={s.hex} className="avoid-shade">
            <span className="avoid-shade__dot" style={{ background: s.hex }} />
            <div className="avoid-shade__body">
              <span className="avoid-shade__name">{s.name}</span>
              <span className="avoid-shade__reason">{s.reason}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shade picker ──────────────────────────────────────────────────────────────

type ShadePickerProps = {
  shades: MakeupShade[];
  label: string;
};

function ShadePicker({ shades, label }: ShadePickerProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = shades[activeIdx];

  return (
    <div className="shade-picker">
      <p className="shade-picker__label">{label}</p>
      <div className="shade-picker__circles">
        {shades.map((s, i) => (
          <button
            key={s.hex}
            className={`shade-picker__circle${i === activeIdx ? " shade-picker__circle--active" : ""}`}
            style={{ background: s.hex }}
            onClick={() => setActiveIdx(i)}
            aria-label={s.name}
            title={s.name}
          />
        ))}
      </div>
      {active && (
        <div className="shade-picker__info">
          <p className="shade-picker__name">{active.name}</p>
          <p className="shade-picker__explanation">{active.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ── Contrast pair ─────────────────────────────────────────────────────────────

type ContrastPairProps = {
  comparison: MakeupComparison;
  goodImage: string | null;
  badImage: string | null;
};

function ContrastPair({ comparison, goodImage, badImage }: ContrastPairProps) {
  return (
    <div className="makeup-contrast">
      <div className="makeup-contrast__side makeup-contrast__side--bad">
        <div className="makeup-contrast__img-wrap">
          {badImage ? (
            <img
              src={badImage}
              alt={`${comparison.badShade.name} — not recommended`}
              className="makeup-contrast__img"
            />
          ) : (
            <div
              className="makeup-contrast__skeleton"
              style={{ background: `color-mix(in srgb, ${comparison.badShade.hex} 12%, #f0ebe5)` }}
            />
          )}
          <span className="makeup-contrast__badge makeup-contrast__badge--bad">✗ skip</span>
        </div>
        <div className="makeup-contrast__shade-row">
          <span className="makeup-contrast__dot" style={{ background: comparison.badShade.hex }} />
          <span className="makeup-contrast__shade-name">{comparison.badShade.name}</span>
        </div>
      </div>

      <div className="makeup-contrast__side makeup-contrast__side--good">
        <div className="makeup-contrast__img-wrap">
          {goodImage ? (
            <img
              src={goodImage}
              alt={`${comparison.goodShade.name} — recommended`}
              className="makeup-contrast__img"
            />
          ) : (
            <div
              className="makeup-contrast__skeleton"
              style={{ background: `color-mix(in srgb, ${comparison.goodShade.hex} 12%, #f0ebe5)` }}
            />
          )}
          <span className="makeup-contrast__badge makeup-contrast__badge--good">✓ yours</span>
        </div>
        <div className="makeup-contrast__shade-row">
          <span className="makeup-contrast__dot" style={{ background: comparison.goodShade.hex }} />
          <span className="makeup-contrast__shade-name">{comparison.goodShade.name}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

type Props = {
  makeup: {
    blush: MakeupShade[];
    lips: MakeupShade[];
    eyeshadowDay: MakeupShade[];
    eyeshadowEvening: MakeupShade[];
  };
  makeupComparisons: MakeupComparison[];
  images: Record<string, string>;
};

export function MakeupSection({ makeup, makeupComparisons, images }: Props) {
  const get = (cat: string) => makeupComparisons.find(m => m.category === cat);

  const lipsComp = get("lips");
  const blushComp = get("blush");

  return (
    <div className="makeup-section">
      {lipsComp && (
        <div className="makeup-category">
          <p className="makeup-category__title">lip colour</p>
          <ContrastPair
            comparison={lipsComp}
            goodImage={images["makeup-lips-good"] ?? null}
            badImage={images["makeup-lips-bad"] ?? null}
          />
          {makeup.lips.length > 0 && (
            <ShadePicker shades={makeup.lips} label="other shades for you" />
          )}
          {lipsComp.avoidShades && lipsComp.avoidShades.length > 0 && (
            <AvoidShadesList shades={lipsComp.avoidShades} />
          )}
        </div>
      )}

      {blushComp && (
        <div className="makeup-category">
          <p className="makeup-category__title">blush</p>
          <ContrastPair
            comparison={blushComp}
            goodImage={images["makeup-blush-good"] ?? null}
            badImage={images["makeup-blush-bad"] ?? null}
          />
          {makeup.blush.length > 0 && (
            <ShadePicker shades={makeup.blush} label="other shades for you" />
          )}
          {blushComp.avoidShades && blushComp.avoidShades.length > 0 && (
            <AvoidShadesList shades={blushComp.avoidShades} />
          )}
        </div>
      )}
    </div>
  );
}
