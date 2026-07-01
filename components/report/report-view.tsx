"use client";

import type { AnalysisResult } from "@/lib/report/report-schema";
import { SEASON_STYLE_DATA } from "@/lib/report/season-style-data";
import {
  ACCESSORIES, NAILS,
  getOutfits, getAesthetics, deriveProfile, filterLibrary,
  type LibraryItem,
} from "@/lib/report/style-library";
import { buildImageSlots, METAL_SLOTS } from "@/lib/report/image-slots";
import { SeasonWheel } from "./season-wheel";
import { FamilySwiper } from "./family-swiper";
import { ColourCircles } from "./colour-circles";
import { MakeupSection } from "./makeup-section";
import { ContrastSection } from "./contrast-section";
import { GlassesSection } from "./glasses-section";
import { GroomingSection } from "./grooming-section";
import { FaceArchetypeSection } from "./face-archetype-section";
import { SignatureSummarySection } from "./signature-summary";
import { ReportBlock } from "./report-block";
import StyleCarousel, { type CarouselCard } from "./style-carousel";

function toCard(item: LibraryItem): CarouselCard {
  return { id: item.id, name: item.name, image: item.image, sentence: item.sentence };
}

type Props = {
  analysis: AnalysisResult;
  photoDataUrl: string;
  images: Record<string, string>;
  totalSlots: number;
  wardrobeType?: "woman" | "man" | "other";
  reportSections?: string[];
};

export function ReportView({ analysis: a, photoDataUrl, images, totalSlots, wardrobeType = "woman", reportSections = [] }: Props) {
  // Empty array = all sections (user didn't customise)
  const has = (s: string) => reportSections.length === 0 || reportSections.includes(s);
  const { miniResult: mini, fullReport: report } = a;
  const { contrast, colorAnalysis, hairOptions, finalLook } = report;

  const showMakeup = wardrobeType !== "man";
  const profile = deriveProfile(colorAnalysis.topSeason.id);
  const sd = SEASON_STYLE_DATA[colorAnalysis.topSeason.id];

  const slots = buildImageSlots(report, wardrobeType, reportSections);
  const labeledSlots = slots.filter(s => s.label);
  const doneCount = Object.keys(images).length;
  const generating = doneCount < totalSlots;

  const img = (id: string) => images[id] ?? null;

  return (
    <div className="report">

      {/* ── Generation progress ── */}
      {generating && (
        <div className="report-progress">
          <div className="report-progress__bar" style={{ transform: `scaleX(${doneCount / totalSlots})` }} />
          <div className="report-progress__steps">
            {labeledSlots.map((s, li) => {
              const done = !!images[s.slotId];
              const prevAllDone = labeledSlots.slice(0, li).every(ls => !!images[ls.slotId]);
              const isActive = !done && prevAllDone;
              return (
                <span
                  key={s.slotId}
                  className={`report-progress__step${done ? " report-progress__step--done" : isActive ? " report-progress__step--active" : ""}`}
                >
                  {s.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Mini result — intro card above all blocks ── */}
      <div className="report-mini">
        <div className="report-mini__palette-bar">
          {colorAnalysis.bestColors.slice(0, 8).map(c => (
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

      {/* ════════════════════════════════════════
          BLOCK 01 — DISCOVER YOUR COLORS
          ════════════════════════════════════════ */}
      <ReportBlock
        num="01"
        title="Discover Your Colors"
        subtitle="Your natural coloring — what harmonizes, what clashes, and why."
      >
        {/* Colour season */}
        <div className="report-section report-section--seasons">
          <p className="report-section__eyebrow">colour analysis</p>
          <h2 className="report-section__title">{colorAnalysis.topSeason.name}</h2>
          <p className="report-section__body">{colorAnalysis.topSeason.reason}</p>

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
                  <SeasonWheel seasonId={s.id} photoUrl={photoDataUrl} percentage={s.percentage} />
                  <p className="season-cards__alt-name">{s.name}</p>
                  <p className="season-cards__alt-pct">{s.percentage}%</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Colour families */}
        {report.colorDiagnostics && (
          <div className="report-section report-section--flush">
            <FamilySwiper
              neutralDrapingUrl={img("neutral-draping") ?? ""}
              userPhotoUrl={photoDataUrl || undefined}
              families={report.colorDiagnostics.families}
              onComplete={() => {}}
              reportMode
            />
          </div>
        )}

        {/* Neutral colours */}
        {report.colorDiagnostics?.neutrals && report.colorDiagnostics.neutrals.length > 0 && (
          <div className="report-section">
            <p className="report-section__eyebrow">neutral colours</p>
            <h2 className="report-section__title">Your neutrals</h2>
            <ColourCircles
              entries={report.colorDiagnostics.neutrals.map(n => ({
                hex: n.hex,
                name: n.name,
                description: n.comment,
                verdict: n.verdict,
              }))}
              drapingUrl={photoDataUrl || img("neutral-draping") || null}
              showVerdict
            />
          </div>
        )}

        {/* Best colours */}
        <div className="report-section">
          <p className="report-section__eyebrow">best colours</p>
          <h2 className="report-section__title">Colours that work for you</h2>
          <ColourCircles
            entries={colorAnalysis.bestColors
              .filter((c, i, arr) => arr.findIndex(x => x.hex === c.hex) === i)
              .map(c => ({ hex: c.hex, name: c.name, description: c.explanation ?? "" }))}
            drapingUrl={photoDataUrl || img("neutral-draping") || null}
          />
        </div>

        {/* Colours to avoid */}
        {colorAnalysis.avoidColors && colorAnalysis.avoidColors.length > 0 && (
          <div className="report-section">
            <p className="report-section__eyebrow">colours to avoid</p>
            <h2 className="report-section__title">Colours that work against you</h2>
            <ColourCircles
              entries={colorAnalysis.avoidColors
                .filter((c, i, arr) => arr.findIndex(x => x.hex === c.hex) === i)
                .map(c => ({ hex: c.hex, name: c.name, description: c.explanation ?? "", verdict: "avoid" as const }))}
              drapingUrl={photoDataUrl || img("neutral-draping") || null}
              showVerdict
            />
          </div>
        )}

        {/* Natural contrast */}
        {contrast && photoDataUrl && (
          <div className="report-section">
            <p className="report-section__eyebrow">natural contrast</p>
            <h2 className="report-section__title">Your natural contrast</h2>
            <ContrastSection
              photoDataUrl={photoDataUrl}
              level={contrast.level}
              explanation={contrast.explanation}
            />
          </div>
        )}

        {/* Metals */}
        <div className="report-section">
          <p className="report-section__eyebrow">jewelry</p>
          <h2 className="report-section__title">Your metals</h2>
          {report.metals?.explanation && (
            <p className="report-section__body">{report.metals.explanation}</p>
          )}
          <div className="metal-options">
            {METAL_SLOTS.map(m => {
              const bestEntry  = report.metals?.best?.find(b => b.metal === m.metal);
              const avoidEntry = report.metals?.avoid?.find(a => a.metal === m.metal);
              const verdict    = bestEntry ? "best" : avoidEntry ? "avoid" : "neutral";
              return (
                <div key={m.slotId} className={`metal-option metal-option--${verdict}`}>
                  {img(m.slotId) ? (
                    <img src={img(m.slotId)!} alt={m.label} className="metal-option__img" />
                  ) : (
                    <div className="metal-option__skeleton" />
                  )}
                  <div className="metal-option__footer">
                    <span className="metal-option__label">{m.label}</span>
                    {verdict === "best"    && <span className="metal-option__badge metal-option__badge--best">suits you</span>}
                    {verdict === "avoid"   && <span className="metal-option__badge metal-option__badge--avoid">avoid</span>}
                  </div>
                  {(bestEntry?.reason ?? avoidEntry?.reason) && (
                    <p className="metal-option__reason">
                      {bestEntry?.reason ?? avoidEntry?.reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </ReportBlock>

      {/* ════════════════════════════════════════
          BLOCK 02 — ENHANCE YOUR FEATURES
          ════════════════════════════════════════ */}
      <ReportBlock
        num="02"
        title="Enhance Your Features"
        subtitle={showMakeup
          ? "Hair, makeup, glasses and nails — chosen for your specific face."
          : "Hair, beard, grooming and glasses — chosen for your specific face."
        }
      >
        {/* Hair color */}
        {has("hair") && (
          <div className="report-section">
            <p className="report-section__eyebrow">hair colour</p>
            <h2 className="report-section__title">Colours that suit you</h2>
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
          </div>
        )}

        {/* Hairstyle */}
        {has("hair") && (
          <div className="report-section">
            <p className="report-section__eyebrow">hairstyle</p>
            <h2 className="report-section__title">Cuts for your face</h2>
            <div className="hair-options">
              {hairOptions.map((h, i) => (
                <div key={i} className="hair-option">
                  {img(`hair-style-${i}`) ? (
                    <img src={img(`hair-style-${i}`)!} alt={h.style ?? h.name} className="hair-option__img" />
                  ) : (
                    <div className="hair-option__skeleton" />
                  )}
                  <p className="hair-option__name">{h.style ?? h.name}</p>
                  {h.description && <p className="hair-option__desc">{h.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grooming — men only */}
        {!showMakeup && report.grooming && (
          <div className="report-section">
            <p className="report-section__eyebrow">grooming</p>
            <h2 className="report-section__title">Beard & grooming guide</h2>
            <GroomingSection grooming={report.grooming} images={images} />
          </div>
        )}

        {/* Makeup */}
        {showMakeup && has("makeup") && report.colorDiagnostics?.makeup && (
          <div className="report-section">
            <p className="report-section__eyebrow">makeup</p>
            <h2 className="report-section__title">Colours that work on you</h2>
            <MakeupSection
              makeup={report.colorDiagnostics.makeup}
              makeupComparisons={report.makeupComparisons}
              images={images}
            />
          </div>
        )}

        {/* Nails */}
        {showMakeup && sd && (
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
        )}

        {/* Glasses */}
        {has("glasses") && report.glasses && (
          <div className="report-section">
            <p className="report-section__eyebrow">eyewear</p>
            <h2 className="report-section__title">Best glasses for your face</h2>
            <GlassesSection glasses={report.glasses} images={images} />
          </div>
        )}
      </ReportBlock>

      {/* ════════════════════════════════════════
          BLOCK 03 — DEFINE YOUR STYLE
          ════════════════════════════════════════ */}
      <ReportBlock
        num="03"
        title="Define Your Style"
        subtitle="Your facial essence, aesthetic direction and personal style identity."
      >
        {/* Face archetype */}
        {report.faceArchetype && (
          <div className="report-section">
            <p className="report-section__eyebrow">face style archetype</p>
            <h2 className="report-section__title">Your face style archetype</h2>
            <FaceArchetypeSection archetype={report.faceArchetype} wardrobeType={wardrobeType} />
          </div>
        )}

        {/* Style identity */}
        {sd?.styleIdentity?.name && (
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

        {/* Style rules */}
        {sd?.styleRules && sd.styleRules.length > 0 && (
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

        {/* Aesthetic directions */}
        {sd && (() => {
          const boards: CarouselCard[] = getAesthetics(profile).map(b => ({ id: b.id, name: b.name, image: b.image }));
          return boards.length > 0 ? (
            <div className="report-section">
              <p className="report-section__eyebrow">style inspiration</p>
              <h2 className="report-section__title">Your aesthetic directions</h2>
              <StyleCarousel cards={boards} aspect="portrait" size="lg" showSentence={false} />
            </div>
          ) : null;
        })()}

        {/* Shopping cheat sheet */}
        {sd && (sd.shoppingAlways.length > 0 || sd.shoppingSkip.length > 0) && (
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

        {/* Accessories */}
        {sd && (
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
        )}
      </ReportBlock>

      {/* ════════════════════════════════════════
          BLOCK 04 — OUTFIT CAPSULES
          ════════════════════════════════════════ */}
      {has("outfits") && <ReportBlock
        num="04"
        title="Outfit Capsules"
        subtitle="Ready-to-wear looks built around your palette and style identity."
      >
        {/* Outfits */}
        {sd && (() => {
          const outfitCards: CarouselCard[] = getOutfits(profile).map(o => ({ id: o.id, name: o.label, image: o.image }));
          return outfitCards.length > 0 ? (
            <div className="report-section">
              <p className="report-section__eyebrow">outfits</p>
              <h2 className="report-section__title">Ready-to-wear looks</h2>
              <StyleCarousel cards={outfitCards} aspect="portrait" size="lg" showSentence={false} />
            </div>
          ) : null;
        })()}

        {/* Quick wins */}
        {sd?.quickWins && sd.quickWins.length > 0 && (
          <div className="report-section">
            <p className="report-section__eyebrow">quick wins</p>
            <h2 className="report-section__title">Three changes you&apos;ll notice immediately</h2>
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
        {sd?.whyCompliments && (
          <div className="report-section">
            <p className="report-section__eyebrow">your effect</p>
            <h2 className="report-section__title">Why people compliment you</h2>
            <blockquote className="report-pullquote">{sd.whyCompliments}</blockquote>
          </div>
        )}

        {/* Final look image */}
        <div className="report-section report-section--final">
          <p className="report-section__eyebrow">your transformation</p>
          {img("final-look") ? (
            <img src={img("final-look")!} alt="Your complete look" className="report-final__img" />
          ) : (
            <div className="report-final__skeleton" />
          )}
          <div className="report-final__body">
            <h2 className="report-section__title">You, in your colours</h2>
            <p className="report-section__body">{finalLook.description}</p>
          </div>
        </div>
      </ReportBlock>}

      {/* ════════════════════════════════════════
          BLOCK 05 — YOUR SIGNATURE LOOK
          ════════════════════════════════════════ */}
      {report.signatureSummary && (
        <ReportBlock
          num="05"
          title="Your Signature Look"
          subtitle="Everything distilled into one cohesive style identity."
        >
          <SignatureSummarySection summary={report.signatureSummary} wardrobeType={wardrobeType} />
        </ReportBlock>
      )}

    </div>
  );
}
