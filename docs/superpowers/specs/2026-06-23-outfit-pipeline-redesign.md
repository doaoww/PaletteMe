# Outfit Pipeline Redesign + Deterministic Color Season

**Date:** 2026-06-23  
**Status:** Approved  
**Scope:** Color season accuracy, outfit quality, Style DNA, Pinterest hero images, Picks feed filtering

---

## Problem Statement

Three systems are broken:

1. **Color season** — `/api/style-analysis/mini` determines season purely by AI guess. A Winter person gets "Light Summer." The old `/api/analyze` had a working deterministic scorer (`lib/color-season-scoring.ts`) that was never wired into the new pipeline.

2. **Outfit assembly** — AI generates a `searchQuery` per item, SerpAPI returns random Google Shopping inventory, ranker picks by keyword. No color coherence, no style coherence. Streetwear users get romantic blouses. Slippers appear as shoe recommendations.

3. **Picks feed** — `/feed` shows products unfiltered by the user's Style DNA. Items don't match their color season, style direction, or body type.

---

## Architecture: What Changes

### Layer 1 — Deterministic Color Season (Step 1.5)

**File:** `app/api/style-analysis/mini/route.ts`

After Step 1 (face feature extraction), before Step 4 (style profile):

```
faceFeatures = {
  skinUndertone: "cool",
  skinDepth: "deep",
  skinBrightness: 28,      ← 0-100 (low = dark)
  hairDarkness: 92,        ← 0-100 (high = dark)
  eyeIntensity: 85,        ← 0-100
  ...
}

→ map to ColorEvidence:
  warm:    undertone === "warm" || "warm-neutral"
  cool:    undertone === "cool" || "cool-neutral"
  light:   skinBrightness > 65
  deep:    skinBrightness < 40
  muted:   (no high contrast + no vivid eye color)
  clear:   contrastScore > 60 && eyeIntensity > 70

→ run lib/color-season-scoring.ts (existing, untouched)
→ get: { season: "True Winter", confidence: 0.87, evidence: [...] }
```

**If confidence ≥ 0.70:** season is LOCKED. Passed to Step 4 as:
```
COLOR SEASON LOCKED: True Winter (confidence: 87%).
Do not override. Build all color recommendations around this palette.
```

**If confidence < 0.70:** season passed as strong hint, AI can adjust only within the same undertone family (cool → cool seasons only; warm → warm seasons only). Cross-family override (Winter → Summer) is never allowed regardless of confidence.

**New helper file:** `lib/style-analysis-color-bridge.ts`  
Converts `RawFaceFeatures` → `ColorEvidence` for the scorer. Keeps scorer untouched.

---

### Layer 2 — Style DNA (computed once, used everywhere)

**File:** `lib/style-dna.ts` (new)

Computed after Step 4 from: kibbeType + colorSeason + quiz.styleDirection + quiz.styleMood + bodyProportions.

```typescript
type StyleDNA = {
  vocabulary: string[];      // e.g. ["oversized", "cargo", "bomber", "clean sneaker", "wide-leg"]
  avoidVocabulary: string[]; // e.g. ["fitted blazer", "midi skirt", "romantic detail", "heel"]
  paletteHexes: string[];    // from colorSeason — 6-8 hex codes
  neutralHexes: string[];    // neutrals from the season (off-white, camel, etc.)
  scale: "small" | "medium" | "large"; // from kibbeType visual weight
  fabricSignals: string[];   // e.g. ["heavy cotton", "nylon ripstop", "fleece", "suede"]
  occasionMix: string[];     // from quiz.occasionPref
  budgetTier: "budget" | "mid" | "no-limit"; // from quiz.budget
};
```

**Mapping logic** (deterministic, not AI):

| styleDirection | vocabulary core |
|---|---|
| streetwear | oversized, cargo, bomber, hoodie, jogger, track, boxy tee, clean sneaker |
| minimalist | structured, clean seam, tonal, tailored, column, straight-leg |
| romantic | wrap, bias cut, floral, gathered, silk, ruffle, soft |
| classic | blazer, slim trouser, button-down, loafer, trench, knit |
| office | tailored, blouse, wide-leg trouser, pump, structured bag |
| eclectic | mixed, asymmetric, textured, layered, statement |

KibbeType overrides scale:
- Dramatic / SD / FN → large scale pieces, never dainty
- Gamine / TR → small scale, never overwhelming
- Classic / SC → medium, balanced

---

### Layer 3 — Outfit Brief Generator

**File:** `lib/prompts/outfit-brief-composer.ts` (new)

Replaces the current outfit generation inside `report-composer.ts`.

The AI receives the Style DNA and generates outfit BRIEFS — not item lists with search queries. Search queries are derived deterministically from the brief.

**Outfit Brief schema (per outfit):**

```typescript
type OutfitBrief = {
  outfitName: string;          // "Sunday Morning", "Off-Duty Edit"
  occasion: string;            // from StyleDNA.occasionMix
  vibe: string;                // one-line description
  colorStory: string[];        // 2-3 hex codes from StyleDNA.paletteHexes
  items: OutfitItemBrief[];
  stylistNote: string;         // why this works for their specific type+season
};

type OutfitItemBrief = {
  category: string;            // "wide-leg cargo trouser"
  color: string;               // "warm off-white"
  colorHex: string;            // from colorStory
  fabric: string;              // "heavy cotton twill"
  fit: string;                 // "relaxed, high-rise"
};
```

**From brief → search queries** (deterministic, no AI):

```typescript
function buildSearchQueries(item: OutfitItemBrief, dna: StyleDNA, gender: string): string[] {
  return [
    // Primary: category + color + fabric + style signal
    `${item.category} ${item.color} ${item.fabric} ${dna.styleDirection} ${gender}`,
    // Fallback 1: category + color + gender
    `${item.category} ${item.color} ${gender}`,
    // Fallback 2: category only + gender
    `${item.category} ${gender}`,
  ];
}
// Style direction is included in the primary query so SerpAPI returns
// style-matched products (streetwear cargo, not office cargo).
```
```

**SerpAPI with fallback chain:**

```
for each query in [primary, fallback1, fallback2]:
  results = searchGoogleShopping(query)
  filtered = results.filter(colorProximity(item.colorHex, threshold=40))
  if filtered.length >= 2: break

best = pickBestProduct(filtered)

// Color proximity uses Google Vision API (lib/clients/google-vision.ts, already wired)
// extractDominantColors(product.imageUrl) → compare each dominant color hex to item.colorHex
// RGB Euclidean distance: sqrt((r1-r2)² + (g1-g2)² + (b1-b2)²), threshold = 40 (~16% of 255 range)
// If GOOGLE_VISION_API_KEY is not set, skip color filter — ranker alone is the fallback
```

**Count:** 12–15 outfits per report. At least 8. Note: OpenAI Structured Outputs does not support `z.array().min()` constraints — count is enforced via prompt instruction only (OpenAI ignores schema min/max on arrays). The schema keeps no min constraint; the prompt says "generate exactly 12–15 outfits, never fewer than 8."

---

### Layer 4 — Pinterest as Inspiration (before brief generation)

**File:** `app/api/style-analysis/full/route.ts`

Pinterest runs BEFORE outfit brief generation, not after. Pins serve as visual reference for the AI — not decoration added after the fact.

**Timing:** after Style DNA is computed, before the AI brief generation call. Pinterest HTTP call takes ~0.8s — negligible vs the ~20s AI call it precedes.

```typescript
// Build query from the full Style DNA — includes user's stated style
function buildPinterestInspirationQuery(dna: StyleDNA): string {
  // All four dimensions of the user's style:
  const style = dna.styleDirection;       // "streetwear"
  const season = dna.colorSeason;         // "Dark Autumn"
  const occasion = dna.occasionMix[0];   // "casual"
  const gender = dna.gender;             // "women"
  return `${style} outfit ${season} editorial ${occasion} ${gender}`;
  // e.g.: "streetwear outfit Dark Autumn editorial casual women"
}

// Step 4.5 — before brief generation:
const inspirationPins = await searchPinterestPins(
  buildPinterestInspirationQuery(dna), 3
).catch(() => []);

// Pins are injected into the outfit brief prompt:
// "VISUAL INSPIRATION (style reference only — match this aesthetic):
//  Pin 1: [imageUrl] — [title]
//  Pin 2: [imageUrl] — [title]"
```

**Pinterest query always includes:**
- User's stated styleDirection (streetwear, minimalist, etc.)
- Color season (Dark Autumn, True Winter, etc.)
- User's primary occasion (casual, work, etc.)
- Gender

**Result:** one pin per outfit used as hero image. AI brief generation is grounded in real editorial fashion photos matching the user's style.

**Fallback:** if `PINTEREST_ACCESS_TOKEN` is not set, brief generation proceeds without visual reference. `heroImage: null` in enriched outfit — UI renders items grid only.

---

### Layer 5 — Capsule Architecture

**Count:** 8–10 core pieces (enforced in schema).

Each capsule item gets:
- `appearsInOutfits: number[]` — which outfit indices use this piece
- `pairsWith: number[]` — which other capsule items pair with it
- `whyInCapsule: string` — one sentence: why this piece for their specific type + DNA

Every capsule item must appear in at least 2 outfits. If not — the AI is instructed to remove it and replace it with a more versatile piece.

---

### Layer 6 — Picks Feed Filtering

**File:** `app/api/feed/route.ts`

Currently: returns products from SerpAPI with minimal filtering.

After: uses stored StyleDNA from Supabase profile to filter:

```typescript
const dna = await getStyleDNA(userId); // from profiles table

const queries = buildPicksQueries(dna); // e.g.:
// ["streetwear hoodie oversized women chocolate brown",
//  "cargo pants women earth tone",
//  "clean sneaker women white minimalist"]

const picks = await Promise.all(queries.map(q => searchGoogleShopping(q)));
const filtered = picks.flat()
  .filter(p => colorProximityAny(p, dna.paletteHexes, threshold=45))
  .map(scoreProduct)
  .sort((a, b) => b.finalScore - a.finalScore)
  .slice(0, 30);
```

---

## UI Changes

### Profile — Outfit Feed Card

```
┌─────────────────────────────────────┐
│  [Pinterest hero image]             │  600px tall, object-cover
├─────────────────────────────────────┤
│  Sunday Morning                     │  outfit name
│  ○ casual                           │  occasion chip
│                                     │
│  "Cargo + bomber: volume balanced   │  stylistNote
│   for your frame. Earth tones keep  │
│   the streetwear from reading young"│
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐ │
│  │cargo │ │bomb. │ │ tee  │ │shoe│ │
│  │£89   │ │£145  │ │ £35  │ │£120│ │
│  │Buy→  │ │Buy→  │ │Buy→  │ │Buy→│ │
│  └──────┘ └──────┘ └──────┘ └────┘ │
└─────────────────────────────────────┘
```

Occasion filter tabs above the feed: All · Casual · Work · Evening · Weekend

### Profile — Capsule Section

```
┌─────────────────────────────────────┐
│  Your Capsule · 8 pieces            │
│  These 8 items build 20+ looks      │
├─────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ IMG │ │ IMG │ │ IMG │ │ IMG │   │
│  │cargo│ │bomb │ │ tee │ │loaf │   │
│  │£89  │ │£145 │ │£35  │ │£120 │   │
│  │in 5 │ │in 4 │ │in 7 │ │in 6 │   │
│  │looks│ │looks│ │looks│ │looks│   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
└─────────────────────────────────────┘
```

---

## Files Changed

| File | Change |
|---|---|
| `lib/style-analysis-color-bridge.ts` | NEW — maps RawFaceFeatures → ColorEvidence |
| `lib/style-dna.ts` | NEW — StyleDNA type + deterministic builder |
| `lib/prompts/outfit-brief-composer.ts` | NEW — outfit brief generation |
| `lib/color-season-scoring.ts` | UNCHANGED — reused as-is |
| `app/api/style-analysis/mini/route.ts` | ADD Step 1.5 (deterministic color) |
| `app/api/style-analysis/full/route.ts` | ADD Pinterest per outfit, use briefs |
| `lib/prompts/report-composer.ts` | REMOVE outfit generation, delegate to brief-composer |
| `lib/prompts/style-profile.ts` | ADD locked season input, Style DNA output |
| `app/api/feed/route.ts` | ADD StyleDNA-based filtering |
| `lib/style-analysis-schema.ts` | ADD min(8) on outfits, heroImage field, OutfitBrief fields |
| `components/profile/style-report-view.tsx` | ADD hero image, stylistNote, occasion filter tabs |

---

## Success Criteria

- A Winter person never gets assigned Summer or Autumn when confidence ≥ 0.70
- A streetwear user gets 0 romantic/formal items in their outfits
- Every item in every outfit uses a color within RGB distance 40 of the user's seasonal palette
- Minimum 8 complete outfits per report, each with 3-4 buyable items
- Every outfit has a stylist note explaining why it works for their specific type
- Picks feed shows items matching Style DNA — no slippers, no wrong aesthetic
- Pinterest hero image appears when `PINTEREST_ACCESS_TOKEN` is set; graceful fallback when not

---

## Out of Scope

- Fashion API integration (Asos/Zalando) — Phase 2
- Outfit builder / wardrobe matchmaker — separate plan
- PDF generation — separate plan
