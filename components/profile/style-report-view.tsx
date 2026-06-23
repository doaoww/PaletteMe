"use client";

import React from "react";
import { AppChrome } from "@/components/nav/app-chrome";
import "../../app/profile/style-report.css";

// ── Client-side types (mirrors lib/style-analysis-schema.ts without Zod) ──────

type EnrichedProduct = {
  title: string;
  price: string | null;
  imageUrl: string | null;
  link: string | null;
  source: string;
} | null;

type PaletteColor = {
  name: string;
  hex: string;
  use: string;
  wearability: "everyday" | "regular" | "accent";
  nearFace: boolean;
  note?: string;
};

type CelebrityTwin = {
  name: string;
  initials: string;
  sharedQuality: string;
};

type MiniResult = {
  kibbeType: string;
  styleReadLabel: string;
  styleEssence: string;
  kibbeOneLiner: string;
  strengths: string[];
  mistakes: string[];
  howPeopleReadYou: string;
  hairHint: string;
  colorFamily: string;
  silhouettes: string[];
  contrastLevel?: string | null;
  metalPrimary?: string | null;
  seasonTagline?: string | null;
  celebrityTwins?: CelebrityTwin[] | null;
};

type FullReport = {
  appearance: {
    kibbeExplanation: string;
    kibbeReferences: string[];
    howOthersReadYou: string;
    appearanceStrengths: string[];
  };
  hair: {
    bestLength: string;
    bestShape: string;
    bestTexture: string;
    avoidCuts: string[];
    colorDirection: string;
    rationale: string;
    referenceImages?: { imageUrl: string; link: string }[];
  };
  color: {
    seasonName: string;
    seasonDescription: string;
    paletteStory: string;
    palette: PaletteColor[];
    anchorNeutral: string;
    heroAccent: string;
    avoidColors: { name: string; hex: string; reason: string }[];
    combinationExample: string;
    metalDirection: {
      primary: string;
      avoid: string;
      note: string;
      searchQuery: string;
    };
  };
  body: {
    bodyTypeLabel: string;
    bodyStrengths: string[];
    bestSilhouettes: { name: string; why: string; searchQuery: string; product?: EnrichedProduct }[];
    avoidSilhouettes: { name: string; why: string }[];
    fittingTips: string[];
  };
  styleDirection: {
    aesthetic: string;
    aestheticDescription: string;
    keyWords: string[];
    whatToLeadWith: string;
    trendsThatWork: string[];
    trendsToAvoid: string[];
    styleReferencePersonalities: string[];
  };
  clothing: {
    items: {
      category: string;
      name: string;
      description: string;
      searchQuery: string;
      priceRange: string;
      why: string;
      appearsUnlocks: string;
      pairsWith: number[];
      product?: EnrichedProduct;
    }[];
    anchorPiece: string;
    capsuleRules: string[];
    buildingBlockPieces: string[];
    fabricManifesto: string;
  };
  makeup: {
    sectionType: "makeup" | "grooming";
    skinPrep: string;
    shadeGuide: {
      foundation: string;
      blush: string;
      bronzer: string;
      eyeShadow: string;
      liner: string;
      lip: string;
      highlight: string;
      avoid: string;
    };
    colorStory: string;
    products: {
      category: string;
      name: string;
      formulationType: string;
      bestFor: string;
      compositionNote: string;
      searchQuery: string;
      colorNote: string;
      shadeHex?: string;
      product?: EnrichedProduct;
    }[];
    avoidShades: string[];
    signatureLook: string;
  };
  styleMistakes: {
    replaceThese: {
      item: string;
      why: string;
      replaceWith: string;
      replacementSearchQuery: string;
      product?: EnrichedProduct;
    }[];
    shoppingMistakes: string;
    mindsetShift: string;
  };
  outfits: {
    outfits: {
      name: string;
      occasion: string;
      items: {
        piece: string;
        searchQuery: string;
        colorHex?: string | null;
        fabric?: string | null;
        product?: EnrichedProduct;
      }[];
      why: string;
      colorLogic: string;
      lookEffect: string;
      heroPiece: string;
      searchQuery: string;
      stylistNote?: string | null;
      heroImage?: { imageUrl: string; pinLink: string; title: string | null } | null;
    }[];
    buildingPrinciple: string;
  };
  shoppingList: {
    buyFirst: {
      item: string;
      searchQuery: string;
      priceRange: string;
      impact: string;
      whyNow: string;
      product?: EnrichedProduct;
    }[];
    dontSpendHere: { category: string; reason: string }[];
    totalEstimate: string;
  };
  // New premium chapters
  contrastAnalysis?: {
    score: number;
    level: string;
    lowerContrastSeason: string;
    higherContrastSeason: string;
    worksFor: string[];
    avoid: string[];
    explanation: string;
  } | null;
  kibbeChapter?: {
    type: string;
    essenceSummary: string;
    boneStructure: string;
    flesh: string;
    facialFeatures: string;
    essence: string;
    worksFor: string[];
    fightsYou: string[];
    disclaimer: string;
  } | null;
  celebrityTwins?: CelebrityTwin[] | null;
  beforeAfter?: {
    wrong: { item: string; reason: string }[];
    right: { item: string; reason: string }[];
    patternNote: string;
  } | null;
  styleRules?: string[] | null;
};

export type StyleAnalysisResult = {
  miniResult: MiniResult;
  fullReport: FullReport | null;
  profileData?: {
    styleProfile: Record<string, unknown>;
    faceFeatures: Record<string, unknown>;
    bodyAnalysis: Record<string, unknown>;
    computedScores: Record<string, unknown>;
    gender: string;
  };
  quizData?: Record<string, unknown>;
  meta: {
    kibbeType: string;
    colorSeason: string;
    skinType?: string | null;
    skinConcerns?: string[] | null;
    currentSeason?: string;
    marketplaces?: string[];
    location?: { countryCode?: string; city?: string };
  };
};

// ── Shared atoms ───────────────────────────────────────────────────────────────

function BoldLead({ text }: { text: string }) {
  const colonIdx = text.indexOf(": ");
  if (colonIdx === -1 || colonIdx > 30) return <>{text}</>;
  return (
    <>
      <strong>{text.slice(0, colonIdx)}</strong>
      {text.slice(colonIdx)}
    </>
  );
}

function ChapterHead({ num, title }: { num: string; title: string }) {
  return (
    <div className="sr__chapter-head">
      <span className="sr__chapter-num">Chapter {num}</span>
      <h2 className="sr__chapter-title">{title}</h2>
    </div>
  );
}

function SwatchRow({ colors }: { colors: { name: string; hex: string }[] }) {
  return (
    <div className="sr__swatch-row">
      {colors.map((c, i) => (
        <div key={i} className="sr__swatch-pill">
          <span className="sr__swatch-dot" style={{ background: c.hex }} />
          <span className="sr__swatch-label">{c.name}</span>
        </div>
      ))}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="sr__tag">{children}</span>;
}

function ProductCard({ product, category, name, why, priceRange, appearsUnlocks }: {
  product?: EnrichedProduct;
  category: string;
  name: string;
  why?: string;
  priceRange?: string;
  appearsUnlocks?: string;
}) {
  if (!product?.imageUrl) {
    return (
      <div className="sr__product-card" style={{ gridTemplateColumns: "1fr" }}>
        <div className="sr__product-info" style={{ padding: "14px 16px" }}>
          <span className="sr__product-category">{category}</span>
          <span className="sr__product-name">{name}</span>
          {why && <span className="sr__product-why">{why}</span>}
          {appearsUnlocks && <span className="sr__product-unlocks">{appearsUnlocks}</span>}
          {priceRange && <span className="sr__product-price">{priceRange}</span>}
        </div>
      </div>
    );
  }

  const inner = (
    <>
      <img src={product.imageUrl} alt={product.title} className="sr__product-img" />
      <div className="sr__product-info">
        <span className="sr__product-category">{product.source || category}</span>
        <span className="sr__product-name">{product.title || name}</span>
        {appearsUnlocks && <span className="sr__product-unlocks">{appearsUnlocks}</span>}
        {product.price && <span className="sr__product-price">{product.price}</span>}
      </div>
    </>
  );

  if (product.link) {
    return (
      <a href={product.link} target="_blank" rel="noopener noreferrer" className="sr__product-card">
        {inner}
      </a>
    );
  }
  return <div className="sr__product-card">{inner}</div>;
}

function ShopCard({ product, category, name, why, priceRange }: {
  product?: EnrichedProduct;
  category: string;
  name: string;
  why?: string;
  priceRange?: string;
}) {
  const inner = (
    <>
      {product?.imageUrl ? (
        <img src={product.imageUrl} alt={product.title} className="sr__shop-img" />
      ) : (
        <div className="sr__shop-placeholder">
          <span className="sr__shop-placeholder-text">{name}</span>
        </div>
      )}
      <div className="sr__shop-meta">
        <span className="sr__shop-source">{product?.source || category}</span>
        <span className="sr__shop-name">{product?.title || name}</span>
        {why && <span className="sr__shop-why">{why}</span>}
        {(product?.price || priceRange) && (
          <span className="sr__shop-price">{product?.price ?? priceRange}</span>
        )}
      </div>
      {product?.link && <span className="sr__shop-btn">shop →</span>}
    </>
  );

  if (product?.link) {
    return (
      <a href={product.link} target="_blank" rel="noopener noreferrer" className="sr__shop-card">
        {inner}
      </a>
    );
  }
  return <div className="sr__shop-card">{inner}</div>;
}

// ── Hero — color season + stat chips ─────────────────────────────────────────

function MiniResultHero({ mini, seasonName }: { mini: MiniResult; seasonName?: string }) {
  const season = seasonName || mini.colorFamily;

  const chips = [
    mini.contrastLevel ? { label: "contrast", value: mini.contrastLevel } : null,
    mini.metalPrimary ? { label: "your metal", value: mini.metalPrimary } : null,
    { label: "style type", value: mini.kibbeType },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="sr__hero">
      <p className="sr__hero-kicker">✦ Color season</p>
      <h1 className="sr__hero-season">{season}</h1>
      {mini.seasonTagline && (
        <p className="sr__hero-tagline">{mini.seasonTagline}</p>
      )}

      {chips.length > 0 && (
        <div className="sr__stat-chips">
          {chips.map((chip, i) => (
            <div key={i} className="sr__stat-chip">
              <span className="sr__stat-chip-value">{chip.value}</span>
              <span className="sr__stat-chip-label">{chip.label}</span>
            </div>
          ))}
        </div>
      )}

      <p className="sr__how-read">&ldquo;{mini.howPeopleReadYou}&rdquo;</p>

      <div className="sr__hero-grid">
        <div className="sr__hero-card">
          <p className="sr__hero-card-label">what works for you</p>
          <ul className="sr__hero-card-items">
            {(mini.strengths ?? []).slice(0, 2).map((s, i) => <li key={i}><BoldLead text={s} /></li>)}
          </ul>
        </div>
        <div className="sr__hero-card">
          <p className="sr__hero-card-label">what to change</p>
          <ul className="sr__hero-card-items">
            {(mini.mistakes ?? []).slice(0, 2).map((m, i) => <li key={i}><BoldLead text={m} /></li>)}
          </ul>
        </div>
      </div>

      <div className="sr__hero-pills">
        {(mini.silhouettes ?? []).map((s, i) => (
          <span key={i} className="sr__pill">{s}</span>
        ))}
        <span className="sr__pill">✂ {mini.hairHint}</span>
      </div>
    </div>
  );
}

// ── Chapter 01: Color palette ──────────────────────────────────────────────────

function ColorPaletteChapter({ data }: { data: FullReport["color"] }) {
  return (
    <div className="sr__section">
      <ChapterHead num="01" title="your color palette" />
      <p className="sr__section-body sr__section-body--story">{data.paletteStory}</p>

      <div className="sr__palette-flat">
        {data.palette.map((c, i) => (
          <div key={i} className="sr__palette-swatch">
            <div
              className={`sr__palette-dot${c.nearFace ? " sr__palette-dot--star" : ""}`}
              style={{ background: c.hex }}
              title={c.nearFace ? "wear near your face" : undefined}
            />
            <span className="sr__palette-name">{c.name}</span>
          </div>
        ))}
      </div>

      <div className="sr__palette-anchors">
        <div className="sr__palette-anchor-card">
          <p className="sr__palette-anchor-label">anchor neutral</p>
          <p className="sr__palette-anchor-value">{data.anchorNeutral}</p>
        </div>
        <div className="sr__palette-anchor-card">
          <p className="sr__palette-anchor-label">hero accent</p>
          <p className="sr__palette-anchor-value">{data.heroAccent}</p>
        </div>
      </div>

      {data.combinationExample && (
        <p className="sr__combo-example">✦ {data.combinationExample}</p>
      )}

      {data.avoidColors.length > 0 && (
        <div className="sr__avoid-block">
          <p className="sr__avoid-block-label">Avoid →</p>
          <div className="sr__avoid-swatches">
            {data.avoidColors.map((c, i) => (
              <div key={i} className="sr__avoid-pill">
                <span className="sr__avoid-dot" style={{ background: c.hex }} />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chapter 02: Contrast analysis ─────────────────────────────────────────────

function ContrastChapter({ data }: { data: NonNullable<FullReport["contrastAnalysis"]> }) {
  const score = Math.max(0, Math.min(10, data.score));
  const scaleX = (score / 10).toFixed(3);

  return (
    <div className="sr__section">
      <ChapterHead num="02" title="contrast analysis" />
      <p className="sr__section-body" style={{ marginBottom: 20 }}>
        Contrast is the difference between your hair, skin, and eyes. It determines how bold your outfits
        and makeup can be — and whether you&apos;re a natural at understated elegance or high-drama looks.
      </p>

      <div className="sr__contrast-block">
        <div className="sr__contrast-header">
          <span className="sr__contrast-label">Overall contrast</span>
          <span className="sr__contrast-score">{data.level} — {score.toFixed(1)} / 10</span>
        </div>
        <div className="sr__contrast-track">
          <div className="sr__contrast-fill" style={{ transform: `scaleX(${scaleX})` }} />
          <div className="sr__contrast-dot" style={{ left: `${(score / 10) * 100}%` }} />
        </div>
        <div className="sr__contrast-axis">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>

      <div className="sr__contrast-compare">
        <div className="sr__contrast-compare-item sr__contrast-compare-item--low">
          <span className="sr__contrast-compare-season">Low contrast</span>
          <span className="sr__contrast-compare-name">{data.lowerContrastSeason}</span>
        </div>
        <div className="sr__contrast-compare-item sr__contrast-compare-item--you">
          <span className="sr__contrast-compare-season">You — {data.level}</span>
          <span className="sr__contrast-compare-name">{data.level} contrast</span>
        </div>
        <div className="sr__contrast-compare-item sr__contrast-compare-item--high">
          <span className="sr__contrast-compare-season">High contrast</span>
          <span className="sr__contrast-compare-name">{data.higherContrastSeason}</span>
        </div>
      </div>

      <p className="sr__section-body" style={{ marginBottom: 20 }}>{data.explanation}</p>

      <div className="sr__contrast-guide">
        <div className="sr__contrast-guide-col">
          <p className="sr__contrast-guide-label">Works for you</p>
          {data.worksFor.map((w, i) => (
            <div key={i} className="sr__contrast-guide-item sr__contrast-guide-item--yes">{w}</div>
          ))}
        </div>
        <div className="sr__contrast-guide-col">
          <p className="sr__contrast-guide-label">Avoid</p>
          {data.avoid.map((a, i) => (
            <div key={i} className="sr__contrast-guide-item sr__contrast-guide-item--no">{a}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Chapter 03: Gold vs Silver ─────────────────────────────────────────────────

function MetalChapter({ metal }: { metal: FullReport["color"]["metalDirection"] }) {
  const isGold = metal.primary === "gold" || metal.primary === "rose gold" || metal.primary === "both";

  return (
    <div className="sr__section">
      <ChapterHead num="03" title="gold vs. silver" />

      <div className="sr__metal-split">
        <div className={`sr__metal-option${isGold ? " sr__metal-option--active" : ""}`}>
          <span className="sr__metal-icon">✦</span>
          <strong>{isGold ? metal.primary : "gold"}</strong>
          {isGold && <span className="sr__metal-badge">your metal</span>}
          {isGold && metal.searchQuery && (
            <p className="sr__metal-sub">Rose gold · Bronze · Copper</p>
          )}
        </div>
        <div className={`sr__metal-option${!isGold ? " sr__metal-option--active" : ""}`}>
          <span className="sr__metal-icon">◇</span>
          <strong>{!isGold ? metal.primary : "silver"}</strong>
          {!isGold && <span className="sr__metal-badge">your metal</span>}
          {isGold && <p className="sr__metal-sub">Use sparingly</p>}
        </div>
      </div>

      <p className="sr__section-body">{metal.note}</p>
      <p className="sr__section-body" style={{ opacity: 0.7, marginTop: 8 }}>{metal.avoid}</p>
    </div>
  );
}

// ── Chapter 04: Kibbe body type ────────────────────────────────────────────────

function KibbeChapter({ data }: { data: NonNullable<FullReport["kibbeChapter"]> }) {
  const traits = [
    { label: "Bone structure", value: data.boneStructure },
    { label: "Flesh", value: data.flesh },
    { label: "Facial features", value: data.facialFeatures },
    { label: "Your essence", value: data.essence },
  ];

  return (
    <div className="sr__section">
      <ChapterHead num="04" title="kibbe body type" />

      <div className="sr__kibbe-badge">
        <span className="sr__kibbe-system">Kibbe system</span>
        <span className="sr__kibbe-type">{data.type}</span>
      </div>

      <p className="sr__section-body" style={{ marginBottom: 20 }}>{data.essenceSummary}</p>

      <div className="sr__kibbe-traits">
        {traits.map((t, i) => (
          <div key={i} className="sr__kibbe-trait">
            <span className="sr__kibbe-trait-label">{t.label}</span>
            <span className="sr__kibbe-trait-value">{t.value}</span>
          </div>
        ))}
      </div>

      <div className="sr__kibbe-guide">
        <div className="sr__kibbe-guide-col">
          <p className="sr__kibbe-guide-label">Dressing your type — what works</p>
          <div className="sr__kibbe-tags">
            {data.worksFor.map((w, i) => <Tag key={i}>{w}</Tag>)}
          </div>
        </div>
        <div className="sr__kibbe-guide-col" style={{ marginTop: 16 }}>
          <p className="sr__kibbe-guide-label">What fights you</p>
          <div className="sr__kibbe-tags">
            {data.fightsYou.map((f, i) => <Tag key={i}>{f}</Tag>)}
          </div>
        </div>
      </div>

      {data.disclaimer && (
        <p className="sr__kibbe-disclaimer">{data.disclaimer}</p>
      )}
    </div>
  );
}

// ── Chapter 05: Makeup formula ────────────────────────────────────────────────

const LIP_HEX_MAP: Record<string, string> = {
  terracotta: "#C4722A",
  "warm nude": "#D4A882",
  rust: "#9A3A10",
  coral: "#E8674A",
  brick: "#8B2500",
  "warm red": "#B83020",
  rose: "#D89898",
  berry: "#7B2D5A",
  mauve: "#B888A0",
  "cool red": "#CC1020",
};

function inferLipHex(label: string): string | null {
  const lower = label.toLowerCase();
  for (const [key, hex] of Object.entries(LIP_HEX_MAP)) {
    if (lower.includes(key)) return hex;
  }
  return null;
}

function MakeupChapter({ data }: { data: FullReport["makeup"] }) {
  const isGrooming = data.sectionType === "grooming";
  const guide = data.shadeGuide;

  const shadeItems = isGrooming
    ? [
        { label: "cleanser", value: guide.foundation },
        { label: "moisturiser", value: guide.blush },
        { label: "eye area", value: guide.eyeShadow },
        { label: "brow", value: guide.liner },
      ]
    : [
        { label: "foundation", value: guide.foundation },
        { label: "blush & bronzer", value: `${guide.blush} · ${guide.bronzer}` },
        { label: "eyes", value: guide.eyeShadow },
        { label: "liner", value: guide.liner },
        { label: "highlight", value: guide.highlight },
      ];

  const lipShades = guide.lip ? guide.lip.split(/[,·]/).map((s) => s.trim()).filter(Boolean) : [];
  const lipAvoids = guide.avoid ? guide.avoid.split(/[,·]/).map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="sr__section">
      <ChapterHead num="05" title={isGrooming ? "grooming formula" : "makeup formula"} />

      <p className="sr__section-body" style={{ marginBottom: 20 }}>{data.colorStory}</p>

      <div className="sr__shade-guide">
        {shadeItems.map(({ label, value }) => (
          <div key={label} className="sr__shade-row">
            <span className="sr__shade-key">{label}</span>
            <span className="sr__shade-val">{value}</span>
          </div>
        ))}
      </div>

      {lipShades.length > 0 && (
        <div className="sr__lip-section">
          <p className="sr__shade-key" style={{ marginBottom: 10 }}>Lips — your shades</p>
          <div className="sr__lip-swatches">
            {lipShades.map((shade, i) => {
              const hex = inferLipHex(shade);
              return (
                <div key={i} className="sr__lip-swatch">
                  {hex && <span className="sr__lip-dot" style={{ background: hex }} />}
                  <span className="sr__lip-label">{shade}</span>
                </div>
              );
            })}
          </div>
          {lipAvoids.length > 0 && (
            <div className="sr__lip-avoids">
              {lipAvoids.map((a, i) => (
                <span key={i} className="sr__lip-avoid-pill">{a}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="sr__signature-look">
        <p className="sr__signature-label">signature 5-min look</p>
        <p className="sr__signature-text">{data.signatureLook}</p>
      </div>

      {data.products.length > 0 && (
        <>
          <p className="sr__section-kicker" style={{ marginTop: 24, marginBottom: 12 }}>recommended products</p>
          <div className="sr__products">
            {data.products.slice(0, 5).map((p, i) => (
              <ProductCard
                key={i}
                product={p.product}
                category={p.category}
                name={p.name}
                why={p.bestFor}
                appearsUnlocks={p.colorNote}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Chapter 06: Hair ──────────────────────────────────────────────────────────

function HairChapter({ data }: { data: FullReport["hair"] }) {
  return (
    <div className="sr__section">
      <ChapterHead num="06" title="hair — color & cuts" />
      <p className="sr__section-body" style={{ marginBottom: 20 }}>{data.rationale}</p>

      <p className="sr__section-kicker" style={{ marginBottom: 10 }}>what works</p>
      <div className="sr__hair-grid">
        {[
          { label: "length", value: data.bestLength },
          { label: "shape", value: data.bestShape },
          { label: "texture", value: data.bestTexture },
          { label: "color", value: data.colorDirection },
        ].map(({ label, value }) => (
          <div key={label} className="sr__hair-item">
            <span className="sr__hair-item-label">{label}</span>
            <span className="sr__hair-item-value">{value}</span>
          </div>
        ))}
      </div>

      {data.avoidCuts.length > 0 && (
        <>
          <p className="sr__section-kicker" style={{ marginTop: 20, marginBottom: 8 }}>cuts to avoid</p>
          <div className="sr__avoid-list">
            {data.avoidCuts.map((c, i) => (
              <div key={i} className="sr__avoid-item">{c}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Chapter 07: Celebrity twins ───────────────────────────────────────────────

function CelebrityTwinsChapter({ twins, patternNote }: {
  twins: CelebrityTwin[];
  patternNote?: string;
}) {
  return (
    <div className="sr__section">
      <ChapterHead num="07" title="people who share your season" />

      <div className="sr__celeb-grid">
        {twins.map((twin, i) => (
          <div key={i} className="sr__celeb-card">
            <div className="sr__celeb-initial">{twin.initials}</div>
            <div className="sr__celeb-info">
              <p className="sr__celeb-name">{twin.name}</p>
              <p className="sr__celeb-quality">{twin.sharedQuality}</p>
            </div>
          </div>
        ))}
      </div>

      {patternNote && (
        <p className="sr__celeb-pattern">{patternNote}</p>
      )}
    </div>
  );
}

// ── Chapter 08: Before & After ────────────────────────────────────────────────

function BeforeAfterChapter({ data }: { data: NonNullable<FullReport["beforeAfter"]> }) {
  return (
    <div className="sr__section">
      <ChapterHead num="08" title="before & after — your transformation" />

      <div className="sr__ba-grid">
        <div className="sr__ba-col">
          <p className="sr__ba-col-label">Before — fighting your palette</p>
          {data.wrong.map((item, i) => (
            <div key={i} className="sr__ba-item sr__ba-item--wrong">
              <span className="sr__ba-icon">✕</span>
              <div>
                <p className="sr__ba-item-name">{item.item}</p>
                <p className="sr__ba-item-reason">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="sr__ba-col">
          <p className="sr__ba-col-label">After — working with your palette</p>
          {data.right.map((item, i) => (
            <div key={i} className="sr__ba-item sr__ba-item--right">
              <span className="sr__ba-icon">✓</span>
              <div>
                <p className="sr__ba-item-name">{item.item}</p>
                <p className="sr__ba-item-reason">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.patternNote && (
        <p className="sr__ba-pattern">{data.patternNote}</p>
      )}
    </div>
  );
}

// ── Chapter 09: Outfits by occasion ──────────────────────────────────────────

type EnrichedOutfit = {
  name: string;
  occasion: string;
  items: Array<{
    piece: string;
    searchQuery: string;
    colorHex?: string | null;
    fabric?: string | null;
    product?: { imageUrl: string | null; price: string | null; link: string | null } | null;
  }>;
  why: string;
  colorLogic: string;
  lookEffect: string;
  heroPiece: string;
  searchQuery: string;
  stylistNote?: string | null;
  heroImage?: { imageUrl: string; pinLink: string; title: string | null } | null;
};

function OutfitCard({ outfit }: { outfit: EnrichedOutfit }) {
  return (
    <div className="sr__outfit-card">
      {outfit.heroImage?.imageUrl && (
        <a
          href={outfit.heroImage.pinLink}
          target="_blank"
          rel="noopener noreferrer"
          className="sr__outfit-hero"
        >
          <img
            src={outfit.heroImage.imageUrl}
            alt={outfit.heroImage.title ?? outfit.name}
            className="sr__outfit-hero-img"
          />
          <span className="sr__outfit-pinterest-attr">via Pinterest</span>
        </a>
      )}

      <div className="sr__outfit-header">
        <span className="sr__outfit-name">{outfit.name}</span>
        <span className="sr__outfit-occasion-chip">{outfit.occasion}</span>
      </div>

      {outfit.stylistNote && (
        <p className="sr__outfit-stylist-note">{outfit.stylistNote}</p>
      )}

      <div className="sr__outfit-items">
        {outfit.items
          .filter((item) => item.product?.imageUrl)
          .map((item, j) => (
            <a
              key={j}
              href={item.product!.link ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="sr__outfit-item"
            >
              <img
                src={item.product!.imageUrl!}
                alt={item.piece}
                className="sr__outfit-item-img"
              />
              <span className="sr__outfit-item-piece">{item.piece}</span>
              {item.product?.price && (
                <span className="sr__outfit-item-price">{item.product.price}</span>
              )}
            </a>
          ))}
      </div>
    </div>
  );
}

function OutfitsChapter({ data }: { data: FullReport["outfits"] }) {
  const outfits = data.outfits as EnrichedOutfit[];
  const occasions = ["all", ...Array.from(new Set(outfits.map((o) => o.occasion)))];
  const [activeOccasion, setActiveOccasion] = React.useState("all");

  const filtered =
    activeOccasion === "all"
      ? outfits
      : outfits.filter((o) => o.occasion === activeOccasion);

  return (
    <div className="sr__section">
      <ChapterHead num="09" title="outfits by occasion" />

      <div className="sr__occasion-tabs">
        {occasions.map((occ) => (
          <button
            key={occ}
            className={`sr__occasion-tab${activeOccasion === occ ? " sr__occasion-tab--active" : ""}`}
            onClick={() => setActiveOccasion(occ)}
          >
            {occ}
          </button>
        ))}
      </div>

      <div className="sr__outfits-feed">
        {filtered.map((outfit, i) => (
          <OutfitCard key={i} outfit={outfit} />
        ))}
      </div>
    </div>
  );
}

// ── Chapter 10: Capsule wardrobe ──────────────────────────────────────────────

function CapsuleChapter({ data }: { data: FullReport["clothing"] }) {
  const count = data.items.length;

  return (
    <div className="sr__section">
      <ChapterHead num="10" title={`${count}-piece capsule`} />

      <p className="sr__capsule-principle">{data.buildingPrinciple}</p>

      {data.capsuleRules && data.capsuleRules.length > 0 && (
        <div className="sr__capsule-rules">
          <p className="sr__capsule-rules-label">combination rules</p>
          <ul className="sr__list">
            {data.capsuleRules.map((rule, i) => <li key={i}><BoldLead text={rule} /></li>)}
          </ul>
        </div>
      )}

      <div className="sr__capsule-list">
        {data.items.map((item, i) => (
          <div key={i} className="sr__capsule-item">
            <div className="sr__capsule-num">{String(i + 1).padStart(2, "0")}</div>
            {item.product?.imageUrl ? (
              <a
                href={item.product.link ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="sr__capsule-img-wrap"
              >
                <img src={item.product.imageUrl} alt={item.name} className="sr__capsule-img" />
              </a>
            ) : (
              <div className="sr__capsule-img-placeholder" />
            )}
            <div className="sr__capsule-info">
              <p className="sr__capsule-name">{item.name}</p>
              <p className="sr__capsule-why">{item.appearsUnlocks || item.why}</p>
              {(item.product?.price || item.priceRange) && (
                <p className="sr__capsule-price">{item.product?.price ?? item.priceRange}</p>
              )}
              {(item.pairsWith ?? []).length > 0 && (
                <p className="sr__capsule-pairs">
                  pairs with: {(item.pairsWith ?? []).slice(0, 3).map((j) => data.items[j]?.name).filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.fabricManifesto && (
        <p className="sr__section-body" style={{ marginTop: 20, fontStyle: "italic" }}>
          {data.fabricManifesto}
        </p>
      )}
    </div>
  );
}

// ── Chapter 11: Style rules ───────────────────────────────────────────────────

function StyleRulesChapter({ rules }: { rules: string[] }) {
  return (
    <div className="sr__section">
      <ChapterHead num="11" title="your personal style rules" />
      <div className="sr__rules-list">
        {rules.map((rule, i) => (
          <div key={i} className="sr__rule-item">
            <span className="sr__rule-num">{String(i + 1).padStart(2, "0")}</span>
            <p className="sr__rule-text">{rule}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shopping list ─────────────────────────────────────────────────────────────

function ShoppingListSection({ data }: { data: FullReport["shoppingList"] }) {
  return (
    <div className="sr__section">
      <div className="sr__chapter-head">
        <span className="sr__chapter-num">Shopping</span>
        <h2 className="sr__chapter-title">buy first</h2>
      </div>

      <div className="sr__shop-grid" style={{ marginBottom: 24 }}>
        {data.buyFirst.map((item, i) => (
          <ShopCard
            key={i}
            product={item.product}
            category="priority buy"
            name={item.item}
            why={item.impact}
            priceRange={item.priceRange}
          />
        ))}
      </div>

      {data.dontSpendHere.length > 0 && (
        <>
          <p className="sr__section-kicker" style={{ marginBottom: 8 }}>don&apos;t spend here</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.dontSpendHere.map((d, i) => (
              <div key={i} className="sr__avoid-item">
                <strong>{d.category}</strong> — {d.reason}
              </div>
            ))}
          </div>
        </>
      )}

      {data.totalEstimate && (
        <p className="sr__section-body" style={{ marginTop: 20, textAlign: "center", fontWeight: 600 }}>
          estimated total: {data.totalEstimate}
        </p>
      )}
    </div>
  );
}

// ── CTA buttons ───────────────────────────────────────────────────────────────

function ReportCTAs() {
  return (
    <div className="sr__cta-row">
      <button className="sr__cta-btn">Create share card ↗</button>
      <button className="sr__cta-btn sr__cta-btn--outline">Shop my capsule ↗</button>
      <button className="sr__cta-btn sr__cta-btn--outline">Makeup products ↗</button>
    </div>
  );
}

// ── Full report skeleton ──────────────────────────────────────────────────────

function FullReportSkeleton() {
  return (
    <div className="sr__full-loading">
      <div className="sr__full-loading-inner">
        <div className="sr__full-loading-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
          </svg>
        </div>
        <p className="sr__full-loading-label">building your full report</p>
        <p className="sr__full-loading-sub">all 11 chapters are being written for you — usually under a minute</p>
        <div className="sr__full-loading-bar">
          <div className="sr__full-loading-progress" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="sr__section sr__section--skel">
          <div className="skel sr__skel-kicker" />
          <div className="skel sr__skel-title" />
          <div className="skel sr__skel-line sr__skel-line--full" />
          <div className="skel sr__skel-line sr__skel-line--long" />
          <div className="skel sr__skel-line sr__skel-line--mid" />
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function StyleReportView({ result }: { result: StyleAnalysisResult }) {
  const { miniResult, fullReport: r } = result;

  return (
    <AppChrome>
      <div className="sr">
        <MiniResultHero mini={miniResult} seasonName={r?.color.seasonName} />

        {r ? (
          <>
            <ColorPaletteChapter data={r.color} />
            {r.contrastAnalysis && <ContrastChapter data={r.contrastAnalysis} />}
            <MetalChapter metal={r.color.metalDirection} />
            {r.kibbeChapter ? (
              <KibbeChapter data={r.kibbeChapter} />
            ) : (
              <div className="sr__section">
                <ChapterHead num="04" title="kibbe body type" />
                <p className="sr__section-body">{r.appearance.kibbeExplanation}</p>
                <p className="sr__section-body" style={{ marginTop: 12 }}>{r.appearance.howOthersReadYou}</p>
              </div>
            )}
            <MakeupChapter data={r.makeup} />
            <HairChapter data={r.hair} />
            {r.celebrityTwins && r.celebrityTwins.length > 0 && (
              <CelebrityTwinsChapter
                twins={r.celebrityTwins}
                patternNote={r.beforeAfter?.patternNote}
              />
            )}
            {r.beforeAfter && <BeforeAfterChapter data={r.beforeAfter} />}
            <OutfitsChapter data={r.outfits} />
            <CapsuleChapter data={r.clothing} />
            {r.styleRules && r.styleRules.length > 0 && (
              <StyleRulesChapter rules={r.styleRules} />
            )}
            <ShoppingListSection data={r.shoppingList} />
            <ReportCTAs />
          </>
        ) : (
          <FullReportSkeleton />
        )}
      </div>
    </AppChrome>
  );
}
