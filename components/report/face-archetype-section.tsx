"use client";

import type { FaceArchetype } from "@/lib/report/report-schema";
import "./face-archetype-section.css";

type Props = {
  archetype: FaceArchetype;
  wardrobeType?: "woman" | "man" | "other";
};

export function FaceArchetypeSection({ archetype, wardrobeType = "woman" }: Props) {
  const stylingLabels = {
    ...STYLING_LABELS,
    makeup: wardrobeType === "man" ? "grooming" : "makeup",
  };

  return (
    <div className="archetype-section">

      {/* Primary result */}
      <div className="archetype-section__hero">
        <p className="archetype-section__primary">{archetype.primary}</p>
        <p className="archetype-section__tagline">{archetype.tagline}</p>
      </div>

      {/* Reason */}
      <p className="archetype-section__reason">{archetype.reason}</p>

      {/* Feature chips */}
      <div className="archetype-section__features">
        <p className="archetype-section__sub-label">because your face has</p>
        <div className="archetype-section__chips">
          {archetype.facialFeatures.map((f, i) => (
            <span key={i} className="archetype-chip">{f}</span>
          ))}
        </div>
      </div>

      {/* Styling notes */}
      <div className="archetype-section__notes">
        <p className="archetype-section__sub-label">this usually works well with</p>
        <div className="archetype-notes-grid">
          {Object.entries(stylingLabels).map(([key, label]) => {
            const val = archetype.stylingNotes[key as keyof typeof archetype.stylingNotes];
            if (!val) return null;
            return (
              <div key={key} className="archetype-note">
                <span className="archetype-note__icon">{STYLING_ICONS[key as keyof typeof STYLING_ICONS]}</span>
                <div className="archetype-note__body">
                  <p className="archetype-note__label">{label}</p>
                  <p className="archetype-note__text">{val}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary influences */}
      {archetype.secondaryInfluences.length > 0 && (
        <div className="archetype-section__influences">
          <p className="archetype-section__sub-label">similar influences</p>
          <div className="archetype-influences">
            {archetype.secondaryInfluences.map((inf, i) => (
              <div key={i} className="archetype-influence">
                <div className="archetype-influence__header">
                  <span className="archetype-influence__name">{inf.name}</span>
                  <span className="archetype-influence__pct">{inf.percentage}%</span>
                </div>
                <div className="archetype-influence__bar-track">
                  <div
                    className="archetype-influence__bar-fill"
                    style={{ transform: `scaleX(${inf.percentage / 100})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

const STYLING_LABELS: Record<string, string> = {
  hair: "hair",
  glasses: "glasses",
  accessories: "accessories",
  makeup: "makeup",
  outfits: "outfits",
};

const STYLING_ICONS: Record<string, string> = {
  hair: "✦",
  glasses: "◎",
  accessories: "◇",
  makeup: "◈",
  outfits: "▱",
};
