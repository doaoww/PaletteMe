"use client";

import type { Grooming } from "@/lib/report/report-schema";
import "./grooming-section.css";

type Props = { grooming: Grooming; images?: Record<string, string> };

const VERDICT_LABEL: Record<string, string> = {
  best:  "best for you",
  okay:  "works",
  avoid: "avoid",
};

export function GroomingSection({ grooming, images }: Props) {
  return (
    <div className="grooming">

      {/* ── Beard recommendation ── */}
      <div className="grooming__rec">
        <div className="grooming__rec-header">
          {grooming.beardColorHex && (
            <span
              className="grooming__color-dot"
              style={{ background: grooming.beardColorHex }}
              aria-hidden
            />
          )}
          <p className="grooming__rec-style">{grooming.beardShape}</p>
        </div>
        <p className="grooming__rec-why">{grooming.beardShapeWhy}</p>
      </div>

      {/* ── Beard colour ── */}
      <div className="grooming__block">
        <p className="grooming__block-label">beard colour</p>
        <p className="grooming__block-value">{grooming.beardColor}</p>
        <p className="grooming__block-why">{grooming.beardColorWhy}</p>
      </div>

      {/* ── Skin note ── */}
      <div className="grooming__block">
        <p className="grooming__block-label">grooming note</p>
        <p className="grooming__block-why">{grooming.skinNote}</p>
      </div>

      {/* ── Options with generated photos ── */}
      <div className="grooming__options">
        {grooming.options.map((opt, i) => {
          const img = images?.[`beard-${i}`] ?? null;
          return (
            <div
              key={i}
              className={`grooming__option grooming__option--${opt.verdict}`}
            >
              {img ? (
                <img src={img} alt={opt.style} className="grooming__option-img" />
              ) : (
                <div className="grooming__option-skeleton" aria-hidden />
              )}
              <div className="grooming__option-header">
                <span className="grooming__option-style">{opt.style}</span>
                <span className={`grooming__option-badge grooming__option-badge--${opt.verdict}`}>
                  {VERDICT_LABEL[opt.verdict]}
                </span>
              </div>
              <p className="grooming__option-why">{opt.why}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
