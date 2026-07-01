"use client";

import type { Glasses } from "@/lib/report/report-schema";
import "./glasses-section.css";

type Props = { glasses: Glasses; images?: Record<string, string> };

export function GlassesSection({ glasses, images }: Props) {
  return (
    <div className="glasses-section">

      {/* Quick summary */}
      <div className="glasses-section__summary">
        <div className="glasses-section__row">
          <span className="glasses-section__label">Best shapes</span>
          <span className="glasses-section__value">{glasses.bestShapes.join(", ")}</span>
        </div>
        <div className="glasses-section__row">
          <span className="glasses-section__label">Frame weight</span>
          <span className="glasses-section__value">{glasses.frameThickness}</span>
        </div>
        <div className="glasses-section__row">
          <span className="glasses-section__label">Frame colours</span>
          <span className="glasses-section__value">{glasses.frameColors}</span>
        </div>
        <div className="glasses-section__row">
          <span className="glasses-section__label">Material</span>
          <span className="glasses-section__value">{glasses.material}</span>
        </div>
        <div className="glasses-section__row glasses-section__row--avoid">
          <span className="glasses-section__label">Avoid</span>
          <span className="glasses-section__value glasses-section__value--avoid">{glasses.avoid}</span>
        </div>
      </div>

      {/* Frame cards */}
      <div className="glasses-section__cards">
        {glasses.cards.map((card, i) => {
          const img = images?.[`glasses-${i}`] ?? null;
          return (
            <div key={i} className="glasses-card">
              <div className="glasses-card__visual">
                {img ? (
                  <img src={img} alt={card.shape} className="glasses-card__img" />
                ) : (
                  <div className="glasses-card__skeleton" aria-hidden>
                    <span className="glasses-card__skeleton-icon" aria-hidden>
                      {pickIcon(card.shape)}
                    </span>
                  </div>
                )}
              </div>
              <div className="glasses-card__body">
                <p className="glasses-card__shape">{card.shape}</p>
                <p className="glasses-card__why">{card.why}</p>
                <p className="glasses-card__meta">
                  <span className="glasses-card__colors-label">Colours: </span>
                  {card.colors}
                </p>
                <p className="glasses-card__avoid">Avoid: {card.avoid}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ── Icon library ─────────────────────────────────────────────────────────────

const S = 2.5; // strokeWidth shorthand

const ICONS: Record<string, React.ReactNode> = {
  oval: (
    <svg viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="18" rx="16" ry="13" stroke="currentColor" strokeWidth={S}/>
      <ellipse cx="60" cy="18" rx="16" ry="13" stroke="currentColor" strokeWidth={S}/>
      <line x1="36" y1="18" x2="44" y2="18" stroke="currentColor" strokeWidth={S}/>
      <line x1="4"  y1="13" x2="0"  y2="10" stroke="currentColor" strokeWidth={S}/>
      <line x1="76" y1="13" x2="80" y2="10" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  round: (
    <svg viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="18" r="15" stroke="currentColor" strokeWidth={S}/>
      <circle cx="60" cy="18" r="15" stroke="currentColor" strokeWidth={S}/>
      <line x1="35" y1="18" x2="45" y2="18" stroke="currentColor" strokeWidth={S}/>
      <line x1="5"  y1="12" x2="0"  y2="9"  stroke="currentColor" strokeWidth={S}/>
      <line x1="75" y1="12" x2="80" y2="9"  stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  "cat-eye": (
    <svg viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 22 Q12 4 30 7 Q36 9 35 18 Q34 29 20 29 Q6 29 4 22Z" stroke="currentColor" strokeWidth={S} fill="none"/>
      <path d="M45 18 Q44 9 50 7 Q68 4 76 22 Q74 29 60 29 Q46 29 45 18Z" stroke="currentColor" strokeWidth={S} fill="none"/>
      <line x1="35" y1="18" x2="45" y2="18" stroke="currentColor" strokeWidth={S}/>
      <line x1="4"  y1="22" x2="0"  y2="19" stroke="currentColor" strokeWidth={S}/>
      <line x1="76" y1="22" x2="80" y2="19" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  rectangular: (
    <svg viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3"  y="8"  width="32" height="20" rx="2" stroke="currentColor" strokeWidth={S}/>
      <rect x="45" y="8"  width="32" height="20" rx="2" stroke="currentColor" strokeWidth={S}/>
      <line x1="35" y1="18" x2="45" y2="18" stroke="currentColor" strokeWidth={S}/>
      <line x1="3"  y1="14" x2="0"  y2="11" stroke="currentColor" strokeWidth={S}/>
      <line x1="77" y1="14" x2="80" y2="11" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  square: (
    <svg viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3"  y="5"  width="30" height="26" rx="2" stroke="currentColor" strokeWidth={S}/>
      <rect x="47" y="5"  width="30" height="26" rx="2" stroke="currentColor" strokeWidth={S}/>
      <line x1="33" y1="18" x2="47" y2="18" stroke="currentColor" strokeWidth={S}/>
      <line x1="3"  y1="12" x2="0"  y2="9"  stroke="currentColor" strokeWidth={S}/>
      <line x1="77" y1="12" x2="80" y2="9"  stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  geometric: (
    <svg viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="4,28 10,6 30,6 36,28" stroke="currentColor" strokeWidth={S} fill="none"/>
      <polygon points="44,28 50,6 70,6 76,28" stroke="currentColor" strokeWidth={S} fill="none"/>
      <line x1="36" y1="18" x2="44" y2="18" stroke="currentColor" strokeWidth={S}/>
      <line x1="4"  y1="22" x2="0"  y2="20" stroke="currentColor" strokeWidth={S}/>
      <line x1="76" y1="22" x2="80" y2="20" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  aviator: (
    <svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12 Q4 6 12 6 Q20 6 22 12 Q28 34 20 34 Q8 34 3 24 Z" stroke="currentColor" strokeWidth={S} fill="none"/>
      <path d="M77 12 Q76 6 68 6 Q60 6 58 12 Q52 34 60 34 Q72 34 77 24 Z" stroke="currentColor" strokeWidth={S} fill="none"/>
      <line x1="22" y1="14" x2="58" y2="14" stroke="currentColor" strokeWidth={S}/>
      <line x1="3"  y1="14" x2="0"  y2="12" stroke="currentColor" strokeWidth={S}/>
      <line x1="77" y1="14" x2="80" y2="12" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  browline: (
    <svg viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* thick top bar */}
      <rect x="3"  y="6"  width="32" height="7" rx="2" stroke="currentColor" strokeWidth={S} fill="currentColor" fillOpacity="0.15"/>
      <rect x="45" y="6"  width="32" height="7" rx="2" stroke="currentColor" strokeWidth={S} fill="currentColor" fillOpacity="0.15"/>
      {/* thin lower rim */}
      <path d="M3 13 Q3 30 19 30 Q35 30 35 13" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M45 13 Q45 30 61 30 Q77 30 77 13" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="35" y1="10" x2="45" y2="10" stroke="currentColor" strokeWidth={S}/>
      <line x1="3"  y1="10" x2="0"  y2="8"  stroke="currentColor" strokeWidth={S}/>
      <line x1="77" y1="10" x2="80" y2="8"  stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
  wayfarer: (
    <svg viewBox="0 0 80 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* wider top, narrower bottom = trapezoid */}
      <path d="M3 10 L8 6 L32 6 L37 10 L35 28 Q35 30 19 30 Q3 30 3 28 Z" stroke="currentColor" strokeWidth={S} fill="none"/>
      <path d="M43 10 L48 6 L72 6 L77 10 L77 28 Q77 30 61 30 Q43 30 43 28 Z" stroke="currentColor" strokeWidth={S} fill="none"/>
      <line x1="37" y1="16" x2="43" y2="16" stroke="currentColor" strokeWidth={S}/>
      <line x1="3"  y1="14" x2="0"  y2="12" stroke="currentColor" strokeWidth={S}/>
      <line x1="77" y1="14" x2="80" y2="12" stroke="currentColor" strokeWidth={S}/>
    </svg>
  ),
};

const FALLBACK_ICON_KEYS = ["oval", "round", "cat-eye"] as const;

function pickIcon(shapeName: string): React.ReactNode {
  const s = shapeName.toLowerCase();
  if (s.includes("cat"))        return ICONS["cat-eye"];
  if (s.includes("round"))      return ICONS.round;
  if (s.includes("oval"))       return ICONS.oval;
  if (s.includes("rectangular") || s.includes("rectangle")) return ICONS.rectangular;
  if (s.includes("square"))     return ICONS.square;
  if (s.includes("geometric") || s.includes("angular") || s.includes("hexagon") || s.includes("octagon")) return ICONS.geometric;
  if (s.includes("aviator"))    return ICONS.aviator;
  if (s.includes("browline") || s.includes("brow line") || s.includes("semi-rimless") || s.includes("clubmaster")) return ICONS.browline;
  if (s.includes("wayfarer"))   return ICONS.wayfarer;
  if (s.includes("thin") || s.includes("delicate") || s.includes("wire")) return ICONS.oval;
  if (s.includes("soft"))       return ICONS.oval;
  return ICONS.oval; // default
}
