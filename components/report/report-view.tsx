"use client";

import type { AnalysisResult } from "@/lib/report/report-schema";
import { SEASON_STYLE_DATA } from "@/lib/report/season-style-data";
import {
  FABRICS, PRINTS, ACCESSORIES, NAILS, AESTHETICS,
  getOutfits, getAesthetics, deriveProfile, filterLibrary,
  type LibraryItem,
} from "@/lib/report/style-library";
import { buildImageSlots, METAL_SLOTS } from "@/lib/report/image-slots";
import { SeasonWheel } from "./season-wheel";
import { ColorTryout } from "./color-tryout";
import { MakeupSection } from "./makeup-section";
import StyleCarousel, { type CarouselCard } from "./style-carousel";

function toCard(item: LibraryItem): CarouselCard {
  return { id: item.id, name: item.name, image: item.image, sentence: item.sentence };
}

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  analysis: AnalysisResult;
  photoDataUrl: string;
  images: Record<string, string>;
  totalSlots: number;
};

export function ReportView({ analysis: a, photoDataUrl, images, totalSlots }: Props) {
  const { miniResult: mini, fullReport: report } = a;
  const { contrast, colorAnalysis, hairOptions, finalLook } = report;

  const profile = deriveProfile(colorAnalysis.topSeason.id);

  // Slot list used only for progress step labels
  const slots = buildImageSlots(report);
  const doneCount = Object.keys(images).length;
  const generating = doneCount < totalSlots;

  const img = (id: string) => images[id] ?? null;

  // suppress unused import warning — AESTHETICS is consumed by getAesthetics internally
  void AESTHETICS;

  return (
    <div className="report">

      {/* ── Progress ── */}
      {generating && (
        <div className="report-progress">
          <div className="report-progress__bar" style={{ transform: `scaleX(${doneCount / totalSlots})` }} />
          <div className="report-progress__steps">
            {slots.filter(s => s.label).map(s => {
              const idx = slots.indexOf(s);
              return (
                <span
                  key={s.slotId}
                  className={`report-progress__step${idx < doneCount ? " report-progress__step--done" : idx === doneCount ? " report-progress__step--active" : ""}`}
                >
                  {s.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Mini result — CSS card, no image generation ── */}
      <div className="report-mini">
        <div className="report-mini__palette-bar">
          {report.colorAnalysis.bestColors.slice(0, 8).map(c => (
            <span key={c.hex} className="report-mini__palette-swatch" style={{ background: c.hex }} />
          ))}
        </div>
        {photoDataUrl && (
          <div className="report-mini__photo-wrap">
            <img src={photoDataUrl} alt="Your photo" className="report-mini__photo" />
          </div>
        )}
        <div className="report-mini__body">
          <p className="report-mini__tagline">{mini.tagline}</p>
          <h1 className="report-mini__headline">{mini.headline}</h1>
          <p className="report-mini__summary">{mini.summary}</p>
        </div>
      </div>

      {/* ── Colour season ── */}
      <div className="report-section report-section--seasons">
        <p className="report-section__eyebrow">colour analysis</p>
        <h2 className="report-section__title">{colorAnalysis.topSeason.name}</h2>
        <p className="report-section__body">{colorAnalysis.topSeason.reason}</p>

        {/* Season wheels */}
        <div className="season-cards">
          <div className="season-cards__main">
            <SeasonWheel
              seasonId={colorAnalysis.topSeason.id}
              photoUrl={photoDataUrl}
              percentage={colorAnalysis.topSeason.percentage}
              isMain
            />
            <p className="season-cards__name">{colorAnalysis.topSeason.name}</p>
            <p className="season-cards__pct">{colorAnalysis.topSeason.percentage}% match</p>
          </div>

          <div className="season-cards__alts">
            {colorAnalysis.alternativeSeasons.map(s => (
              <div key={s.id} className="season-cards__alt">
                <SeasonWheel
                  seasonId={s.id}
                  photoUrl={photoDataUrl}
                  percentage={s.percentage}
                />
                <p className="season-cards__alt-name">{s.name}</p>
                <p className="season-cards__alt-pct">{s.percentage}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Colour try-on */}
        <p className="report-section__eyebrow" style={{ marginTop: "1.5rem" }}>your best colours</p>
        <ColorTryout
          baseImageUrl={img("neutral-draping")}
          photoDataUrl={photoDataUrl}
          colors={colorAnalysis.bestColors}
        />
      </div>

      {/* ── Contrast ── */}
      {contrast && (
        <div className="report-section">
          <p className="report-section__eyebrow">contrast</p>
          <h2 className="report-section__title">Your facial contrast</h2>
          <div className="report-contrast">
            <div className="report-contrast__image-wrap">
              {img("contrast-bw") ? (
                <img src={img("contrast-bw")!} alt="Facial contrast analysis" className="report-contrast__photo" />
              ) : photoDataUrl ? (
                <img src={photoDataUrl} alt="Your contrast" className="report-contrast__photo report-contrast__photo--color" />
              ) : (
                <div className="report-contrast__skeleton" />
              )}
            </div>
            <div className="report-contrast__body">
              <span className="report-contrast__level">{contrast.level.replace("-", "‑")}</span>
              <p className="report-contrast__explanation">{contrast.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Makeup ── */}
      {report.colorDiagnostics?.makeup && (
        <div className="report-section">
          <p className="report-section__eyebrow">makeup</p>
          <h2 className="report-section__title">colours that work on you</h2>
          <MakeupSection makeup={report.colorDiagnostics.makeup} />
        </div>
      )}

      {/* ── Hair ── */}
      <div className="report-section">
        <p className="report-section__eyebrow">hair</p>
        <h2 className="report-section__title">Your best hair directions</h2>

        <p className="report-hair__sub">Colour</p>
        <div className="hair-options">
          {hairOptions.map((h, i) => (
            <div key={i} className="hair-option">
              {img(`hair-color-${i}`) ? (
                <img src={img(`hair-color-${i}`)!} alt={h.color ?? h.name} className="hair-option__img" />
              ) : (
                <div className="hair-option__skeleton" />
              )}
              <p className="hair-option__name">{h.color ?? h.name}</p>
              <p className="hair-option__desc">{h.description}</p>
            </div>
          ))}
        </div>

        <p className="report-hair__sub">Hairstyle</p>
        <div className="hair-options">
          {hairOptions.map((h, i) => (
            <div key={i} className="hair-option">
              {img(`hair-style-${i}`) ? (
                <img src={img(`hair-style-${i}`)!} alt={h.style ?? h.name} className="hair-option__img" />
              ) : (
                <div className="hair-option__skeleton" />
              )}
              <p className="hair-option__name">{h.style ?? h.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Metals ── */}
      <div className="report-section">
        <p className="report-section__eyebrow">jewelry</p>
        <h2 className="report-section__title">Your metal</h2>
        <p className="report-section__body">{finalLook.jewelry}</p>
        <div className="metal-options">
          {METAL_SLOTS.map(m => {
            const isRecommended = finalLook.jewelry
              ? finalLook.jewelry.toLowerCase().includes(m.metal.toLowerCase().split(" ")[0])
              : false;
            return (
              <div key={m.slotId} className={`metal-option${isRecommended ? " metal-option--recommended" : ""}`}>
                {img(m.slotId) ? (
                  <img src={img(m.slotId)!} alt={m.label} className="metal-option__img" />
                ) : (
                  <div className="metal-option__skeleton" />
                )}
                <div className="metal-option__footer">
                  <span className="metal-option__label">{m.label}</span>
                  {isRecommended && <span className="metal-option__badge">yours</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Static style sections (per-season curated content) ── */}
      {(() => {
        const sd = SEASON_STYLE_DATA[colorAnalysis.topSeason.id];
        if (!sd) return null;
        return (
          <>
            {/* Outfits */}
            {(() => {
              const outfitCards: CarouselCard[] = getOutfits(profile)
                .map(o => ({ id: o.id, name: o.label, image: o.image }));
              return outfitCards.length > 0 ? (
                <div className="report-section">
                  <p className="report-section__eyebrow">outfits</p>
                  <h2 className="report-section__title">Ready-to-wear looks</h2>
                  <StyleCarousel cards={outfitCards} aspect="portrait" size="lg" showSentence={false} />
                </div>
              ) : null;
            })()}

            {/* Shopping Cheat Sheet */}
            {(sd.shoppingAlways.length > 0 || sd.shoppingSkip.length > 0) && (
              <div className="report-section">
                <p className="report-section__eyebrow">shopping</p>
                <h2 className="report-section__title">Shopping cheat sheet</h2>
                <p className="report-section__body report-section__body--small">Open this in the store.</p>
                <div className="cheatsheet">
                  <div className="cheatsheet__col cheatsheet__col--yes">
                    <p className="cheatsheet__heading">Always reach for</p>
                    {sd.shoppingAlways.map(c => <p key={c} className="cheatsheet__item cheatsheet__item--yes">✓ {c}</p>)}
                  </div>
                  <div className="cheatsheet__col cheatsheet__col--no">
                    <p className="cheatsheet__heading">Skip when possible</p>
                    {sd.shoppingSkip.map(c => <p key={c} className="cheatsheet__item cheatsheet__item--no">✗ {c}</p>)}
                  </div>
                </div>
              </div>
            )}

            {/* Fabrics */}
            <div className="report-section">
              <p className="report-section__eyebrow">texture</p>
              <h2 className="report-section__title">Best fabrics</h2>
              <StyleCarousel
                cards={filterLibrary(FABRICS, profile, { limit: 6 }).map(toCard)}
                avoidCards={filterLibrary(FABRICS, profile, { limit: 3, avoidSection: true }).map(toCard)}
                aspect="fabric"
                size="md"
                label="Reach for these"
                avoidLabel="Avoid"
              />
            </div>

            {/* Prints */}
            <div className="report-section">
              <p className="report-section__eyebrow">pattern</p>
              <h2 className="report-section__title">Best prints</h2>
              <StyleCarousel
                cards={filterLibrary(PRINTS, profile, { limit: 6 }).map(toCard)}
                avoidCards={filterLibrary(PRINTS, profile, { limit: 2, avoidSection: true }).map(toCard)}
                aspect="fabric"
                size="md"
                label="Reach for these"
                avoidLabel="Avoid"
              />
            </div>

            {/* Accessories */}
            <div className="report-section">
              <p className="report-section__eyebrow">accessories</p>
              <h2 className="report-section__title">Accessories guide</h2>
              <StyleCarousel
                cards={filterLibrary(ACCESSORIES, profile, { limit: 8 }).map(toCard)}
                aspect="square"
                size="sm"
                label="Your picks"
              />
            </div>

            {/* Nails */}
            <div className="report-section">
              <p className="report-section__eyebrow">nails</p>
              <h2 className="report-section__title">Nail colours</h2>
              <StyleCarousel
                cards={filterLibrary(NAILS, profile, { limit: 6 }).map(toCard)}
                avoidCards={filterLibrary(NAILS, profile, { limit: 3, avoidSection: true }).map(toCard)}
                aspect="square"
                size="sm"
                label="Your palette"
                avoidLabel="Skip"
              />
            </div>

            {/* Quick Wins */}
            {sd.quickWins.length > 0 && (
              <div className="report-section">
                <p className="report-section__eyebrow">quick wins</p>
                <h2 className="report-section__title">Three changes you'll notice immediately</h2>
                <div className="quick-wins">
                  {sd.quickWins.map((w, i) => (
                    <div key={i} className="quick-win">
                      <span className="quick-win__num">{i + 1}</span>
                      <p className="quick-win__text">{w}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Why people compliment you */}
            {sd.whyCompliments && (
              <div className="report-section">
                <p className="report-section__eyebrow">your effect</p>
                <h2 className="report-section__title">Why people compliment you</h2>
                <blockquote className="report-pullquote">{sd.whyCompliments}</blockquote>
              </div>
            )}

            {/* Style Inspirations */}
            {(() => {
              const boards: CarouselCard[] = getAesthetics(profile)
                .map(b => ({ id: b.id, name: b.name, image: b.image }));
              return boards.length > 0 ? (
                <div className="report-section">
                  <p className="report-section__eyebrow">style inspiration</p>
                  <h2 className="report-section__title">Your aesthetic directions</h2>
                  <StyleCarousel cards={boards} aspect="portrait" size="lg" showSentence={false} />
                </div>
              ) : null;
            })()}

            {/* Style Identity */}
            {sd.styleIdentity.name && (
              <div className="report-section">
                <p className="report-section__eyebrow">identity</p>
                <h2 className="report-section__title">Your style identity</h2>
                <p className="style-identity__name">{sd.styleIdentity.name}</p>
                <p className="report-section__body">{sd.styleIdentity.description}</p>
                <div className="style-tags">
                  {sd.styleIdentity.aesthetics.map(t => (
                    <span key={t} className="style-tag">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Style Rules */}
            {sd.styleRules.length > 0 && (
              <div className="report-section report-section--rules">
                <p className="report-section__eyebrow">your rules</p>
                <h2 className="report-section__title">Your style rules</h2>
                <ol className="style-rules">
                  {sd.styleRules.map((r, i) => (
                    <li key={i} className="style-rule">{r}</li>
                  ))}
                </ol>
              </div>
            )}
          </>
        );
      })()}

      {/* ── Final look ── */}
      <div className="report-section report-section--final">
        <p className="report-section__eyebrow">your transformation</p>
        {img("final-look") ? (
          <img src={img("final-look")!} alt="Your complete look" className="report-final__img" />
        ) : (
          <div className="report-final__skeleton" />
        )}
        <div className="report-final__body">
          <h2 className="report-section__title">This is you, styled</h2>
          <p className="report-section__body">{finalLook.description}</p>
        </div>
      </div>

    </div>
  );
}
