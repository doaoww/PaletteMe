"use client";

import "./contrast-section.css";

type Level = "low" | "medium-low" | "medium" | "medium-high" | "high";

const LEVELS: Level[] = ["low", "medium-low", "medium", "medium-high", "high"];

const LEVEL_LABELS: Record<Level, string> = {
  "low":         "Low Contrast",
  "medium-low":  "Medium-Low Contrast",
  "medium":      "Medium Contrast",
  "medium-high": "Medium-High Contrast",
  "high":        "High Contrast",
};

type Recs = { do: string[]; avoid: string[] };

const RECOMMENDATIONS: Record<Level, Recs> = {
  "low": {
    do: ["Tonal outfits from the same colour family", "Monochromatic combinations", "Soft colour transitions", "Blended, natural makeup", "Ombré and gradient patterns"],
    avoid: ["Stark black + white combinations", "Bold graphic prints", "Heavy colour blocking", "Very defined dark liner"],
  },
  "medium-low": {
    do: ["Tonal dressing with subtle variation", "Soft layering", "Natural everyday makeup", "Delicate patterns"],
    avoid: ["Very harsh contrasts", "Stark black + white combinations", "Strong graphic elements"],
  },
  "medium": {
    do: ["Balanced colour mixing", "Medium-scale prints", "Both defined and blended makeup", "Tonal and softly contrasting outfits"],
    avoid: ["Extremes at either end — very stark or very all-blended"],
  },
  "medium-high": {
    do: ["Bold prints and graphic elements", "Clear colour blocking", "Defined liner and brows", "Strong accessories as a focal point"],
    avoid: ["All-tonal monochromatic looks head to toe", "Blending every element into sameness"],
  },
  "high": {
    do: ["Bold colour blocking", "High-contrast combinations", "Dramatic makeup looks", "Graphic prints", "Strong statement accessories"],
    avoid: ["Head-to-toe tonal neutrals", "All-same-value combinations", "Looks with no contrast anywhere"],
  },
};

type Props = {
  photoDataUrl: string;
  level: Level;
  explanation: string;
};

export function ContrastSection({ photoDataUrl, level, explanation }: Props) {
  const levelIdx = LEVELS.indexOf(level);
  const progress = levelIdx / (LEVELS.length - 1);
  const recs = RECOMMENDATIONS[level] ?? RECOMMENDATIONS["medium"];
  const label = LEVEL_LABELS[level] ?? level;

  return (
    <div className="contrast-section">

      {/* Side-by-side portraits */}
      <div className="contrast-section__portraits">
        <div className="contrast-section__portrait-wrap">
          <img src={photoDataUrl} alt="Colour portrait" className="contrast-section__photo" />
          <p className="contrast-section__caption">colour</p>
        </div>
        <div className="contrast-section__portrait-wrap">
          <img src={photoDataUrl} alt="Contrast analysis" className="contrast-section__photo contrast-section__photo--bw" />
          <p className="contrast-section__caption">contrast</p>
        </div>
      </div>

      {/* Level + bar */}
      <div className="contrast-section__result">
        <p className="contrast-section__level">{label}</p>

        <div className="contrast-section__bar-row" aria-label={`Contrast: ${label}`}>
          <span className="contrast-section__bar-edge">Low</span>
          <div className="contrast-section__bar">
            <div className="contrast-section__bar-fill" style={{ transform: `scaleX(${progress})` }} />
            <div className="contrast-section__bar-thumb" style={{ left: `${progress * 100}%` }} />
          </div>
          <span className="contrast-section__bar-edge">High</span>
        </div>

        <p className="contrast-section__explanation">{explanation}</p>
      </div>

      {/* Style cards */}
      <div className="contrast-section__style">
        <p className="contrast-section__style-heading">What this means for your style</p>
        <div className="contrast-section__cards">
          <div className="contrast-section__card contrast-section__card--yes">
            <p className="contrast-section__card-label">Recommended</p>
            <ul className="contrast-section__card-list">
              {recs.do.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="contrast-section__card contrast-section__card--no">
            <p className="contrast-section__card-label">Better to avoid</p>
            <ul className="contrast-section__card-list">
              {recs.avoid.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
