"use client";

import Link from "next/link";
import { forwardRef, useEffect, useMemo, useState } from "react";
import type { Season } from "@/lib/shared/landing-data";
import type { ColorIntelligenceReport } from "@/lib/analysis/color-intelligence";
import type { QuizProfile } from "@/lib/quiz/quiz";
import {
  buildMakeupColumnsFromSeasonPalette,
  buildSeasonAvoidSwatches,
  buildSeasonMetalSwatches,
  buildSeasonNeutralSwatches,
  buildSeasonPaletteSwatches,
  buildTieredPaletteSwatches,
  type ResultSwatch,
} from "@/lib/analysis/result-palette";
import { findSeasonPalette } from "@/lib/analysis/season-palettes";
import { getScanComingSoonCopy, isScanFeatureEnabled } from "@/lib/scan/scan-feature";
import { getSilhouetteGuide, getFaceShapeGuide } from "@/lib/quiz/body-silhouette-guide";

type Props = {
  profile: QuizProfile;
  season: Season;
  report: ColorIntelligenceReport;
  subSeason: string;
  confidence?: number;
  onShare: () => void;
  onDownloadPng: () => void;
  onDownloadPdf: () => void;
  exporting: boolean;
};

function splitSeasonName(name: string): [string, string] {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return [name, ""];
  return [parts.slice(0, -1).join(" "), parts[parts.length - 1]!];
}

function formatUndertone(value: string): string {
  if (value === "warm") return "Warm";
  if (value === "cool") return "Cool";
  return "Neutral-warm";
}

function formatContrast(profile: QuizProfile): string {
  const contrast = profile.answers.contrastPref;
  if (contrast === "low") return "Low";
  if (contrast === "high") return "High";
  return "Medium";
}

function seasonBlurb(season: Season, subSeason: string): string {
  const sp = findSeasonPalette(subSeason);
  if (sp?.whyOldClothesFeltWrong) return sp.whyOldClothesFeltWrong;
  return season.why;
}

function glowNote(season: Season): string {
  if (season.id === "autumn") return "warm - natural - expensive";
  if (season.id === "summer") return "soft - refined - graceful";
  if (season.id === "spring") return "fresh - clear - awake";
  return "crisp - clean - polished";
}

function avoidNote(season: Season): string {
  if (season.id === "autumn") return "drains warmth";
  if (season.id === "summer") return "too heavy near face";
  if (season.id === "spring") return "mutes your glow";
  return "flattens contrast";
}

function styleDescriptors(season: Season, subSeason: string): string[] {
  const label = subSeason.toLowerCase();
  if (label.includes("soft")) return ["soft", "muted", "refined", "graceful"];
  if (label.includes("bright")) return ["bright", "fresh", "clear", "radiant"];
  if (label.includes("dark") || label.includes("deep")) return ["deep", "rich", "warm", "grounded"];
  if (label.includes("light")) return ["light", "airy", "fresh", "luminous"];
  if (season.id === "autumn") return ["warm", "earthy", "rich", "natural"];
  if (season.id === "summer") return ["cool", "soft", "dusty", "elegant"];
  if (season.id === "spring") return ["warm", "fresh", "bright", "clear"];
  return ["cool", "crisp", "bold", "polished"];
}

function styleEnergyLine(season: Season, subSeason: string): string {
  const words = styleDescriptors(season, subSeason);
  return words.slice(0, 3).join(" · ");
}

function styleEnergyBody(season: Season): string {
  if (season.id === "autumn") {
    return "Lean into warm neutrals and natural texture. Save icy cools and stark black for accents away from your face.";
  }
  if (season.id === "summer") {
    return "Lean into soft polish and dusty color. Save loud warm brights for accents instead of face-framing pieces.";
  }
  if (season.id === "spring") {
    return "Lean into clean lines and bright accents. Save edgy darks and muted earth for bottoms — let your face stay the brightest thing in the room.";
  }
  return "Lean into crisp contrast and cool shine. Save earthy soft shades for accents instead of face-framing pieces.";
}

function metalNote(name: string, index: number): string {
  const lower = name.toLowerCase();
  if (index === 0) return "your hero metal";
  if (lower.includes("rose")) return "soft & flattering";
  if (lower.includes("copper")) return "earthy warm glow";
  if (lower.includes("bronze")) return "rich & grounded";
  if (lower.includes("silver") || lower.includes("platinum")) return "clean cool shine";
  return "works with your palette";
}

function buildInsights(
  season: Season,
  subSeason: string,
  report: ColorIntelligenceReport,
  heroColor: ResultSwatch | undefined
) {
  const sp = findSeasonPalette(subSeason);
  const clothesBody =
    sp?.whyOldClothesFeltWrong ??
    (season.id === "autumn"
      ? "Cool black and icy pieces can cast shadows on warm skin. Swap them for camel, chocolate, or ivory near your face."
      : season.id === "summer"
        ? "Sharp warm colors can feel louder than your features. Softer dusty tones usually look more expensive on you."
        : season.id === "spring"
          ? "Dusty neutrals can mute the freshness that makes your face glow. Clear warm accents usually wake your skin up."
          : "Earthy soft shades can blur the crisp contrast that makes your features stand out. Jewel tones near the face usually sharpen you.");

  const metalTitle =
    report.jewelry.metals[0]?.toLowerCase().includes("gold") ||
    season.id === "autumn" ||
    season.id === "spring"
      ? "Silver jewelry never quite felt like 'you' — there's a reason."
      : "Warm gold can feel a little loud on you — and that's normal.";

  const metalBody =
    report.jewelry.guidance ||
    (season.id === "autumn" || season.id === "spring"
      ? "Your skin usually reads warm metals better. Try yellow gold or copper near your face for a week and notice the difference."
      : "Cool silver and platinum usually sit more naturally against your undertone than heavy yellow gold.");

  const heroName = heroColor?.name ?? report.bestColors[0]?.name ?? "your best shade";
  const complimentTitle = `That ${heroName.toLowerCase()} piece everyone compliments? Not a coincidence.`;
  const complimentBody = `It's sitting in your palette sweet spot. Build tops, lipstick, and scarves around ${heroName.toLowerCase()} and similar shades first.`;

  return [
    {
      title:
        season.id === "winter" || season.id === "summer"
          ? "You've probably reached for safe neutrals your whole life."
          : "You've probably lived in black your whole life.",
      body: clothesBody,
    },
    { title: metalTitle, body: metalBody },
    { title: complimentTitle, body: complimentBody },
  ];
}

function useCountUp(target: number | undefined, durationMs = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target == null) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return target != null ? value : null;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="cir-label">{children}</p>;
}

export const ColorInsightsReport = forwardRef<HTMLDivElement, Props>(function ColorInsightsReport(
  {
    profile,
    season,
    report,
    subSeason,
    confidence,
    onShare,
    onDownloadPng,
    onDownloadPdf,
    exporting,
  },
  ref
) {
  const displaySeason = subSeason || season.name;
  const [seasonLead, seasonScript] = splitSeasonName(displaySeason);
  const palette = buildSeasonPaletteSwatches(season, subSeason);
  const avoidList = buildSeasonAvoidSwatches(season, undefined, 4, subSeason);
  const neutrals = buildSeasonNeutralSwatches(season, report, subSeason);
  const tiered = buildTieredPaletteSwatches(season, subSeason);
  // Direction 3: foundations first — base tier, then power, then accent
  const tieredPalette: ResultSwatch[] = [...tiered.base, ...tiered.power, ...tiered.accent];
  const wearList = tieredPalette.slice(0, 6);
  const metals = buildSeasonMetalSwatches(season, report, subSeason);
  const makeup = buildMakeupColumnsFromSeasonPalette(season, report, subSeason);
  const makeupCards = [
    { area: "Lipstick", swatch: makeup.LIPS[0] },
    { area: "Blush", swatch: makeup.CHEEK[0] },
    { area: "Eyeshadow", swatch: makeup.EYES[0] },
    { area: "Base", swatch: makeup.BASE[0] ?? makeup.CHEEK[1] ?? makeup.LIPS[1] },
  ].filter((entry) => entry.swatch);
  const animatedMatch = useCountUp(confidence);
  const descriptors = styleDescriptors(season, subSeason);
  const insights = useMemo(
    () => buildInsights(season, subSeason, report, palette[0]),
    [season, subSeason, report, palette]
  );
  const scanEnabled = isScanFeatureEnabled();
  const scanCopy = getScanComingSoonCopy();
  const silhouetteGuide = getSilhouetteGuide(profile.bodyType);
  const faceShapeGuide = getFaceShapeGuide(profile.faceShape);
  const familyLabel = `${season.name.toLowerCase()} family`;
  const makeupLead =
    season.id === "autumn" || season.id === "spring"
      ? "Warm, peachy, golden. Avoid cool berries and mauves near your lips."
      : "Soft rose, taupe, and berry. Avoid orange-heavy warmth right beside your face.";

  return (
    <div className="cir-report" ref={ref}>
      <main className="cir-report__main">
        <section className="cir-hero">
          <div>
            <SectionLabel>Your color season</SectionLabel>
            <h1 className="cir-title cir-title--hero">
              {seasonLead}
              {seasonScript ? (
                <>
                  {" "}
                  <span className="cir-script">{seasonScript}</span>
                </>
              ) : null}
            </h1>
            <p className="cir-lead">{seasonBlurb(season, subSeason)}</p>

            <div className="cir-chip-row">
              {[
                `${formatUndertone(profile.undertoneHint)} undertone`,
                `${formatContrast(profile)} contrast`,
                familyLabel,
              ].map((chip) => (
                <span key={chip} className="cir-chip">
                  {chip}
                </span>
              ))}
            </div>

            {animatedMatch != null ? (
              <div className="cir-meter">
                <div className="cir-meter__head">
                  <span className="cir-meter__label">profile match</span>
                  <span className="cir-meter__value">{animatedMatch}%</span>
                </div>
                <div className="cir-meter__track">
                  <div className="cir-meter__fill" style={{ transform: `scaleX(${animatedMatch / 100})` }} />
                </div>
              </div>
            ) : null}

            <div className="cir-descriptors">
              {descriptors.map((word, index) => (
                <span key={word} className="cir-descriptors__item">
                  {index > 0 ? <span className="cir-descriptors__dot"> · </span> : null}
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="cir-hero-palette">
            <div className="cir-hero-palette__grid">
              {tieredPalette.slice(0, 5).map((swatch) => (
                <div key={swatch.name}>
                  <div
                    className="cir-hero-palette__swatch"
                    style={{ background: swatch.hex }}
                    title={swatch.name}
                  />
                  <p className="cir-hero-palette__name">{swatch.name}</p>
                </div>
              ))}
            </div>
            <span className="cir-hero-palette__badge">your palette</span>
          </div>
        </section>

        {!profile.bodyType && (
          <section className="cir-style-unlock">
            <div className="cir-style-unlock__text">
              <p className="cir-style-unlock__kicker">unlock more</p>
              <h3 className="cir-style-unlock__title">Your silhouette guide + outfit formulas</h3>
              <p className="cir-style-unlock__body">
                Add your body type and style to get cut recommendations, neckline advice, and outfit formulas built around your colour type.
              </p>
            </div>
            <Link href="/style-setup" className="cir-style-unlock__btn">
              complete style profile →
            </Link>
          </section>
        )}

        <section className="cir-duo">
          <article className="cir-panel">
            <div className="cir-panel__head">
              <SectionLabel>Wear near your face</SectionLabel>
              <span className="cir-verdict cir-verdict--yes">✓ flattering</span>
            </div>
            <h2 className="cir-title cir-title--section">What lights you up</h2>
            <ul className="cir-color-list">
              {wearList.map((swatch) => (
                <li key={swatch.name} className="cir-color-list__item">
                  <span className="cir-color-list__dot" style={{ background: swatch.hex }} />
                  <div className="cir-color-list__copy">
                    <p className="cir-color-list__name">{swatch.name}</p>
                    <p className="cir-color-list__note">{glowNote(season)}</p>
                  </div>
                  <code className="cir-color-list__hex">{swatch.hex}</code>
                </li>
              ))}
            </ul>
          </article>

          <article className="cir-panel">
            <div className="cir-panel__head">
              <SectionLabel>Keep away from face</SectionLabel>
              <span className="cir-verdict cir-verdict--no">✗ drains you</span>
            </div>
            <h2 className="cir-title cir-title--section">What dulls your glow</h2>
            <ul className="cir-color-list">
              {avoidList.map((swatch) => (
                <li key={swatch.name} className="cir-color-list__item">
                  <span className="cir-color-list__dot" style={{ background: swatch.hex }} />
                  <div className="cir-color-list__copy">
                    <p className="cir-color-list__name">{swatch.name}</p>
                    <p className="cir-color-list__note">{avoidNote(season)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="cir-panel__tip">
              Not forbidden — just move them to <strong>bottoms, bags, shoes</strong> instead of right beside your face.
            </p>
          </article>
        </section>

        <section className="cir-panel">
          <div className="cir-section-head">
            <div>
              <SectionLabel>Your best neutrals</SectionLabel>
              <h2 className="cir-title cir-title--large">For your wardrobe basics</h2>
            </div>
            <p className="cir-section-head__aside">
              Start with these for coats, trousers, and everyday layers — then add your hero colors on top.
            </p>
          </div>
          <div className="cir-neutral-grid">
            {neutrals.map((swatch) => (
              <div key={swatch.name}>
                <span className="cir-neutral-grid__swatch" style={{ background: swatch.hex }} />
                <p className="cir-neutral-grid__name">{swatch.name}</p>
                <code className="cir-neutral-grid__hex">{swatch.hex}</code>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="cir-section-head">
            <div>
              <SectionLabel>Your full palette</SectionLabel>
              <h2 className="cir-title cir-title--large">All {tieredPalette.length} colors, foundations first</h2>
            </div>
            <p className="cir-section-head__aside">
              Mix and match freely — every shade harmonizes with your coloring.
            </p>
          </div>
          <div className="cir-palette-tier">
            <h3 className="cir-palette-tier__label">Wardrobe foundation</h3>
            <p className="cir-palette-tier__note">Build coats, trousers, and everyday layers around these</p>
            <div className="cir-palette-grid">
              {tiered.base.map((swatch) => (
                <div key={swatch.name} className="cir-palette-grid__item">
                  <div className="cir-palette-grid__swatch" style={{ background: swatch.hex }} />
                  <div className="cir-palette-grid__meta">
                    <span className="cir-palette-grid__name">{swatch.name}</span>
                    <code className="cir-palette-grid__hex">{swatch.hex}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="cir-palette-tier">
            <h3 className="cir-palette-tier__label">Wear near your face</h3>
            <p className="cir-palette-tier__note">Tops, dresses, and scarves — most flattering beside your skin</p>
            <div className="cir-palette-grid">
              {tiered.power.map((swatch) => (
                <div key={swatch.name} className="cir-palette-grid__item">
                  <div className="cir-palette-grid__swatch" style={{ background: swatch.hex }} />
                  <div className="cir-palette-grid__meta">
                    <span className="cir-palette-grid__name">{swatch.name}</span>
                    <code className="cir-palette-grid__hex">{swatch.hex}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="cir-palette-tier">
            <h3 className="cir-palette-tier__label">Accent and accessory</h3>
            <p className="cir-palette-tier__note">Bags, shoes, jewelry, and statement pops</p>
            <div className="cir-palette-grid">
              {tiered.accent.map((swatch) => (
                <div key={swatch.name} className="cir-palette-grid__item">
                  <div className="cir-palette-grid__swatch" style={{ background: swatch.hex }} />
                  <div className="cir-palette-grid__meta">
                    <span className="cir-palette-grid__name">{swatch.name}</span>
                    <code className="cir-palette-grid__hex">{swatch.hex}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="cir-insights-head">
            <SectionLabel>A note from your stylist</SectionLabel>
            <h2 className="cir-title cir-title--large">
              A few things that <span className="cir-script">probably</span> sound familiar
            </h2>
          </div>
          <div className="cir-insights-grid">
            {insights.map((insight, index) => (
              <article key={insight.title} className="cir-insight-card">
                <span className="cir-insight-card__quote" aria-hidden>
                  “
                </span>
                <p className="cir-insight-card__index">observation 0{index + 1}</p>
                <h3 className="cir-insight-card__title">{insight.title}</h3>
                <p className="cir-insight-card__body">{insight.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="cir-section-head">
            <div>
              <SectionLabel>Metals that love you</SectionLabel>
              <h2 className="cir-title cir-title--large">
                Go{" "}
                <span className="cir-script">
                  {season.id === "summer" || season.id === "winter" ? "cool" : "warm"}
                </span>
                , always
              </h2>
            </div>
            <p className="cir-section-head__aside">{report.jewelry.guidance}</p>
          </div>
          <div className="cir-metal-grid">
            {metals.slice(0, 4).map((metal, index) => (
              <article key={metal.name} className="cir-metal-card">
                <div
                  className="cir-metal-card__orb"
                  style={{
                    background:
                      metal.gradient ??
                      `radial-gradient(circle at 30% 25%, color-mix(in srgb, ${metal.hex} 55%, white), ${metal.hex} 72%)`,
                  }}
                />
                <p className="cir-metal-card__name">{metal.name}</p>
                <p className="cir-metal-card__note">{metalNote(metal.name, index)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cir-makeup-band">
          <div className="cir-section-head">
            <div>
              <SectionLabel>Makeup edit</SectionLabel>
              <h2 className="cir-title cir-title--large">
                Your face, <span className="cir-script">amplified</span>
              </h2>
            </div>
            <p className="cir-section-head__aside">{makeupLead}</p>
          </div>
          <div className="cir-makeup-grid">
            {makeupCards.map((entry) => (
              <article key={entry.area} className="cir-makeup-card">
                <div className="cir-makeup-card__swatch" style={{ background: entry.swatch!.hex }} />
                <p className="cir-makeup-card__area">{entry.area}</p>
                <p className="cir-makeup-card__name">{entry.swatch!.name}</p>
                <code className="cir-palette-grid__hex">{entry.swatch!.hex}</code>
              </article>
            ))}
          </div>
        </section>

        {(silhouetteGuide ?? faceShapeGuide) ? (
          <section>
            <div className="cir-section-head">
              <div>
                <SectionLabel>Your silhouette guide</SectionLabel>
                <h2 className="cir-title cir-title--large">
                  {silhouetteGuide?.label ?? "Your shape"}
                </h2>
              </div>
              {silhouetteGuide ? (
                <p className="cir-section-head__aside">{silhouetteGuide.principle}</p>
              ) : null}
            </div>

            {silhouetteGuide ? (
              <div className="cir-silhouette">
                <div className="cir-silhouette__grid">
                  <div className="cir-silhouette__col">
                    <h3 className="cir-silhouette__col-label">Best cuts</h3>
                    <ul className="cir-silhouette__list">
                      {silhouetteGuide.bestCuts.map((cut) => (
                        <li key={cut}>{cut}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="cir-silhouette__col">
                    <h3 className="cir-silhouette__col-label">Best necklines</h3>
                    <ul className="cir-silhouette__list">
                      {silhouetteGuide.necklines.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="cir-silhouette__col">
                    <h3 className="cir-silhouette__col-label cir-silhouette__col-label--avoid">Avoid</h3>
                    <ul className="cir-silhouette__list cir-silhouette__list--avoid">
                      {silhouetteGuide.avoid.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="cir-silhouette__tip">
                  <span className="cir-silhouette__tip-icon" aria-hidden>✦</span>
                  <p>{silhouetteGuide.outfitTip}</p>
                </div>
              </div>
            ) : null}

            {faceShapeGuide ? (
              <div className="cir-face-shape">
                <h3 className="cir-face-shape__title">
                  Face shape: <span className="cir-script">{faceShapeGuide.label}</span>
                </h3>
                <p className="cir-face-shape__tip">{faceShapeGuide.tip}</p>
                <div className="cir-face-shape__rows">
                  <div className="cir-face-shape__row">
                    <span className="cir-face-shape__row-label">Necklines</span>
                    <span className="cir-face-shape__row-value">{faceShapeGuide.necklines.join(" · ")}</span>
                  </div>
                  <div className="cir-face-shape__row">
                    <span className="cir-face-shape__row-label">Eyewear</span>
                    <span className="cir-face-shape__row-value">{faceShapeGuide.eyewear}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="cir-energy">
          <SectionLabel>Your style energy</SectionLabel>
          <h2 className="cir-energy__title">
            {styleEnergyLine(season, subSeason)} · <span className="cir-script">classic</span>
          </h2>
          <p className="cir-energy__body">{styleEnergyBody(season)}</p>
        </section>

        <section className="cir-cta">
          <div>
            <h3 className="cir-cta__title">Take your palette shopping.</h3>
            <p className="cir-cta__sub">Save it as a card on your phone, or share with a friend.</p>
          </div>
          <div className="cir-cta__actions">
            <button
              type="button"
              className="cir-cta__btn cir-cta__btn--solid"
              disabled={exporting}
              onClick={onDownloadPng}
            >
              download card
            </button>
            <button
              type="button"
              className="cir-cta__btn cir-cta__btn--ghost"
              disabled={exporting}
              onClick={onShare}
            >
              share palette
            </button>
            <button
              type="button"
              className="cir-cta__btn cir-cta__btn--outline"
              disabled={exporting}
              onClick={onDownloadPdf}
            >
              download pdf
            </button>
            {scanEnabled ? (
              <Link href="/scan" className="cir-cta__btn cir-cta__btn--outline">
                new scan →
              </Link>
            ) : (
              <span className="cir-cta__btn cir-cta__btn--outline" style={{ cursor: "default", opacity: 0.7 }}>
                {scanCopy.title}
              </span>
            )}
          </div>
        </section>
      </main>

      <footer className="cir-footer">paletteme · your ai stylist</footer>
    </div>
  );
});
