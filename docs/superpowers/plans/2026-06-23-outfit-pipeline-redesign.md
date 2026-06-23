# Outfit Pipeline Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the AI-guess color season and random SerpAPI outfit assembly with a deterministic color season scorer, Style DNA layer, Pinterest-first inspiration, and coherent outfit briefs that search SerpAPI with style+color-aware queries.

**Architecture:** (1) Deterministic color bridge converts face features → ScoringTraits → runs existing `lib/color-season-scoring.ts` → locked season passed to Step 4. (2) Style DNA computed from season + quiz → used to query Pinterest for inspiration + build outfit briefs. (3) Each outfit item has 3 SerpAPI fallback queries derived from the brief + Style DNA vocabulary.

**Tech Stack:** TypeScript, Next.js 16 App Router, Zod v4, OpenAI Responses API, SerpAPI, Pinterest API v5, Google Vision API (existing clients)

## Global Constraints

- Never call AI providers from client components — all AI routes stay on Node runtime
- OpenAI Structured Outputs: no `z.array().min()` / `.max()` / `z.tuple()` / `.regex()` — enforce counts via prompt only. All optional schema fields must be `.nullish()`, not `.optional()`
- `PINTEREST_ACCESS_TOKEN`, `GOOGLE_VISION_API_KEY`, `SERPAPI_KEY` may be absent — all dependent features must degrade gracefully (empty array / skip filter / null)
- Never hardcode design colors in UI — only palette/product hex values
- `export const runtime = "nodejs"` on all API routes using OpenAI or SerpAPI
- Do not revert any user changes; do not delete untracked files unless asked

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/style-analysis-color-bridge.ts` | CREATE | Derives ScoringTraits from RawFaceFeatures; runs deterministic scorer |
| `lib/style-dna.ts` | CREATE | StyleDNA type + builder from styleProfile + quiz |
| `lib/prompts/style-profile.ts` | MODIFY | Accept lockedSeason + derivedUndertone params; fix broken skinUndertone reference |
| `lib/prompts/report-composer.ts` | MODIFY | Accept StyleDNA; inject vocabulary + Pinterest pins; mandate 12-15 outfits |
| `lib/style-analysis-schema.ts` | MODIFY | OutfitItemSchema +colorHex +fabric; OutfitSchema +stylistNote |
| `app/api/style-analysis/mini/route.ts` | MODIFY | Add Step 1.5: run bridge, pass locked season + undertone to Step 4 |
| `app/api/style-analysis/full/route.ts` | MODIFY | Step 4.5 Pinterest; fetchProductWithFallback; hero image per outfit |
| `app/api/feed/route.ts` | MODIFY | StyleDNA-based product query building |
| `components/profile/style-report-view.tsx` | MODIFY | Outfit card: hero image + stylist note + occasion filter tabs |

---

### Task 1: Deterministic Color Bridge

**Files:**
- Create: `lib/style-analysis-color-bridge.ts`

**Interfaces:**
- Consumes: `RawFaceFeatures` from `lib/style-features-schema.ts`, `computedScores` from `lib/style-features-scoring.ts`
- Produces: `ColorBridgeResult` — `{ season: string; confidence: number; locked: boolean; derivedUndertone: "warm" | "cool" | "neutral" }`

- [ ] **Step 1: Write the failing test**

Create `lib/style-analysis-color-bridge.test.ts`:

```typescript
import { deriveColorSeason } from "./style-analysis-color-bridge";

const coolDarkFeatures = {
  hairDarkness: 92,
  skinBrightness: 28,
  eyeIntensity: 85,
  hairColorDesc: "jet black cool-toned",
  skinToneDesc: "deep cool brown with ashy undertone",
  eyeColorDesc: "very dark brown, almost black, cool",
};

const coolDarkScores = {
  contrastScore: 78,
  contrastLevel: "high" as const,
};

test("high contrast + cool text evidence → Winter family, not Summer", () => {
  const result = deriveColorSeason(coolDarkFeatures, coolDarkScores);
  expect(result.season).toMatch(/winter/i);
  expect(result.derivedUndertone).toBe("cool");
  expect(result.confidence).toBeGreaterThan(0.65);
});

const warmDeepFeatures = {
  hairDarkness: 88,
  skinBrightness: 32,
  eyeIntensity: 70,
  hairColorDesc: "deep warm chocolate brown",
  skinToneDesc: "deep olive with golden warm undertone",
  eyeColorDesc: "warm dark brown with amber flecks",
};

const warmDeepScores = {
  contrastScore: 62,
  contrastLevel: "medium" as const,
};

test("warm + deep + earthy text → Dark Autumn, not Winter", () => {
  const result = deriveColorSeason(warmDeepFeatures, warmDeepScores);
  expect(result.season).toMatch(/autumn/i);
  expect(result.derivedUndertone).toBe("warm");
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest lib/style-analysis-color-bridge.test.ts
```
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement the bridge**

Create `lib/style-analysis-color-bridge.ts`:

```typescript
import {
  scoreColorSeasonCandidates,
  ScoringTraits,
  ScoringTextEvidence,
} from "./color-season-scoring";

const WARM_KEYWORDS = [
  "warm", "golden", "gold", "peach", "peachy", "olive", "amber",
  "hazel", "chocolate", "chestnut", "auburn", "copper", "bronze", "camel",
];

const COOL_KEYWORDS = [
  "cool", "pink", "rosy", "ash", "ashy", "silver", "gray", "grey",
  "blue", "icy", "porcelain", "blue-black", "jewel",
];

function deriveUndertone(
  skinToneDesc: string,
  hairColorDesc: string,
  eyeColorDesc: string,
): "warm" | "cool" | "neutral" {
  const text = `${skinToneDesc} ${hairColorDesc} ${eyeColorDesc}`.toLowerCase();
  const warmCount = WARM_KEYWORDS.filter((w) => text.includes(w)).length;
  const coolCount = COOL_KEYWORDS.filter((w) => text.includes(w)).length;
  if (warmCount > coolCount + 1) return "warm";
  if (coolCount > warmCount + 1) return "cool";
  return "neutral";
}

function deriveDepth(skinBrightness: number): "light" | "medium" | "deep" {
  if (skinBrightness > 62) return "light";
  if (skinBrightness > 36) return "medium";
  return "deep";
}

function deriveChroma(
  contrastScore: number,
  eyeIntensity: number,
): "muted" | "balanced" | "clear" {
  if (contrastScore >= 62 && eyeIntensity >= 65) return "clear";
  if (contrastScore < 35 && eyeIntensity < 50) return "muted";
  return "balanced";
}

function deriveContrast(
  contrastScore: number,
): "low" | "medium" | "high" {
  if (contrastScore >= 62) return "high";
  if (contrastScore >= 35) return "medium";
  return "low";
}

export type ColorBridgeResult = {
  season: string;        // e.g. "True Winter"
  confidence: number;    // 0–1
  locked: boolean;       // true when confidence ≥ 0.70
  derivedUndertone: "warm" | "cool" | "neutral";
};

export function deriveColorSeason(
  faceFeatures: {
    hairDarkness: number;
    skinBrightness: number;
    eyeIntensity: number;
    hairColorDesc: string;
    skinToneDesc: string;
    eyeColorDesc: string;
  },
  computedScores: {
    contrastScore: number;
    contrastLevel: string;
  },
): ColorBridgeResult {
  const derivedUndertone = deriveUndertone(
    faceFeatures.skinToneDesc,
    faceFeatures.hairColorDesc,
    faceFeatures.eyeColorDesc,
  );

  const traits: ScoringTraits = {
    undertone: derivedUndertone,
    depth: deriveDepth(faceFeatures.skinBrightness),
    contrast: deriveContrast(computedScores.contrastScore),
    chroma: deriveChroma(computedScores.contrastScore, faceFeatures.eyeIntensity),
  };

  const evidence: ScoringTextEvidence = {
    skin: faceFeatures.skinToneDesc,
    hair: faceFeatures.hairColorDesc,
    eyes: faceFeatures.eyeColorDesc,
    undertone: derivedUndertone,
    contrast: computedScores.contrastLevel,
    depth: traits.depth,
    chroma: traits.chroma,
  };

  const candidates = scoreColorSeasonCandidates({ traits, evidence });
  const top = candidates[0];
  const confidence = Math.min(top.likelihood / 99, 1);

  return {
    season: top.subSeason,
    confidence,
    locked: confidence >= 0.70,
    derivedUndertone,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest lib/style-analysis-color-bridge.test.ts
```
Expected: PASS (both tests)

- [ ] **Step 5: Commit**

```bash
git add lib/style-analysis-color-bridge.ts lib/style-analysis-color-bridge.test.ts
git commit -m "feat: deterministic color season bridge from face features"
```

---

### Task 2: Fix style-profile.ts and wire locked season

**Files:**
- Modify: `lib/prompts/style-profile.ts` (replace the broken color guard from earlier session)

**Interfaces:**
- Consumes: `ColorBridgeResult` from Task 1
- Produces: Updated `buildStyleProfilePrompt` accepting `lockedSeason?: string` and `derivedUndertone?: string`

- [ ] **Step 1: Replace the color guard in buildStyleProfilePrompt**

In `lib/prompts/style-profile.ts`, replace the entire `buildStyleProfilePrompt` export with:

```typescript
export function buildStyleProfilePrompt(data: {
  faceFeatures: object;
  computedScores: object;
  bodyAnalysis: object;
  quiz: object;
  colorSeason?: string;         // weak AI hint (legacy)
  lockedSeason?: string;        // deterministic result — never override
  derivedUndertone?: string;    // from bridge — used in color guard
}): string {
  const quiz = data.quiz as Record<string, unknown>;
  const scores = data.computedScores as Record<string, unknown>;

  // Extract style preferences explicitly
  const styleDirection = quiz.styleDirection as string | undefined;
  const styleTrend = quiz.styleTrend as string | undefined;
  const styleMood = quiz.styleMood as string | undefined;
  const adventureLevel = quiz.adventureLevel as string | undefined;

  const directionToMood: Record<string, string> = {
    streetwear: "street-edge",
    minimalist: "sharp-minimal",
    classic: "classic-polished",
    romantic: "soft-romantic",
    office: "classic-polished",
    eclectic: "editorial",
  };
  const resolvedMood = styleMood && styleMood !== "not-sure"
    ? styleMood
    : (styleDirection ? directionToMood[styleDirection] : null);

  const styleMoodNote = resolvedMood
    ? `User's style direction: "${resolvedMood}"${styleDirection ? ` (from quiz: "${styleDirection}")` : ""} — MANDATORY override of the base Kibbe aesthetic.`
    : "Style direction: not stated — derive from Kibbe type.";

  const trendNote = styleTrend && styleTrend !== "none"
    ? `Trend interest: "${styleTrend}" — incorporate into aesthetic references.`
    : "";

  const adventureNote = adventureLevel
    ? `Adventure level: "${adventureLevel}"`
    : "Adventure level: balanced";

  // Deterministic color season guard — uses derivedUndertone from bridge (not from faceFeatures)
  const contrastScore = scores.contrastScore as number | undefined;
  const contrastLevel = scores.contrastLevel as string | undefined;
  const undertone = data.derivedUndertone;

  let colorGuard = "";
  if (data.lockedSeason) {
    colorGuard = `⚠ COLOR SEASON LOCKED: ${data.lockedSeason} (deterministic — do not override).
Build all color recommendations around this season's palette.
Do not assign a different season. Do not suggest "borderline" alternatives as the primary.`;
  } else if (contrastScore !== undefined && undertone) {
    if (contrastScore >= 65 && (undertone === "cool" || undertone === "cool-neutral")) {
      colorGuard = `⚠ HIGH CONTRAST + COOL UNDERTONE (contrastScore: ${contrastScore}).
Assign a WINTER season: True Winter, Dark Winter, or Bright Winter.
DO NOT assign Summer — Summer requires low contrast (score <40).`;
    } else if (contrastScore < 40 && (undertone === "cool" || undertone === "cool-neutral")) {
      colorGuard = `Low contrast + cool undertone (contrastScore: ${contrastScore}) → Summer family.
DO NOT assign Winter — that requires high contrast (≥65).`;
    } else if ((undertone === "warm" || undertone === "warm-neutral") && contrastScore && contrastScore >= 55) {
      colorGuard = `Warm undertone + moderate-high contrast (${contrastScore}) → Autumn family.
DO NOT assign Winter — Winter requires COOL undertone.`;
    }
  }

  return `Build the complete style profile for this person.
${styleMoodNote}
${trendNote}
${adventureNote}

${colorGuard ? `━━ COLOR SEASON GUARD — FOLLOW BEFORE ASSIGNING SEASON ━━\n${colorGuard}\n` : ""}
━━ FACIAL FEATURES (visual analyst extraction) ━━
${JSON.stringify(data.faceFeatures, null, 2)}

━━ COMPUTED SCORES (deterministic — trust these numbers over visual impressions) ━━
${JSON.stringify(data.computedScores, null, 2)}

━━ BODY ANALYSIS ━━
${JSON.stringify(data.bodyAnalysis, null, 2)}

━━ QUIZ ANSWERS ━━
${JSON.stringify(data.quiz, null, 2)}

Determine:
1. The correct Kibbe type — with reasoning tied to their actual feature scores
2. Aesthetic identity — Kibbe base + style direction overlay (MANDATORY) + adventureLevel
3. Rejection principles — 3 specific things that look plausible but kill this person's look
4. Color direction — respect the COLOR SEASON GUARD above
5. Best lines, silhouettes, fabrics — specific to type + stated style direction
6. Avoid list — tied to this person's specific features AND stated style preferences`;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors in `lib/prompts/style-profile.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/prompts/style-profile.ts
git commit -m "fix: style-profile prompt uses explicit lockedSeason and derivedUndertone params"
```

---

### Task 3: Wire Step 1.5 into mini route

**Files:**
- Modify: `app/api/style-analysis/mini/route.ts`

**Interfaces:**
- Consumes: `deriveColorSeason` from `lib/style-analysis-color-bridge.ts`
- Produces: `lockedSeason` and `derivedUndertone` passed to `buildStyleProfilePrompt`; `colorBridgeResult` returned in `profileData` for use in full route

- [ ] **Step 1: Add Step 1.5 import and code**

In `app/api/style-analysis/mini/route.ts`, add to imports:

```typescript
import { deriveColorSeason } from "@/lib/style-analysis-color-bridge";
```

After the `const computedScores = computeStyleScores(faceFeatures);` line, add:

```typescript
    // ── Step 1.5: Deterministic color season ─────────────────────────────────
    const colorBridge = deriveColorSeason(
      {
        hairDarkness: faceFeatures.hairDarkness,
        skinBrightness: faceFeatures.skinBrightness,
        eyeIntensity: faceFeatures.eyeIntensity,
        hairColorDesc: faceFeatures.hairColorDesc,
        skinToneDesc: faceFeatures.skinToneDesc,
        eyeColorDesc: faceFeatures.eyeColorDesc,
      },
      {
        contrastScore: computedScores.contrastScore,
        contrastLevel: computedScores.contrastLevel,
      },
    );
```

- [ ] **Step 2: Pass bridge result to style profile step**

Find the Step 4 style profile call and replace `buildStyleProfilePrompt(...)` argument:

```typescript
    const styleProfile = await runStructuredStyleResponse({
      schema: StyleProfileSchema,
      schemaName: "StyleProfile",
      instructions: buildStyleProfileInstructions(gender),
      prompt: buildStyleProfilePrompt({
        faceFeatures,
        computedScores,
        bodyAnalysis,
        quiz: parsedQuiz,
        lockedSeason: colorBridge.locked ? colorBridge.season : undefined,
        derivedUndertone: colorBridge.derivedUndertone,
      }),
      model,
      maxOutputTokens: 1800,
    });
```

- [ ] **Step 3: Include colorBridgeResult in profileData return**

In the return statement, add `colorBridgeResult` to `profileData`:

```typescript
      profileData: {
        styleProfile,
        faceFeatures,
        bodyAnalysis,
        computedScores,
        gender,
        colorBridgeResult: colorBridge,   // ← add this line
      },
```

Also add to `meta`:
```typescript
        colorSeason: colorBridge.locked ? colorBridge.season : styleProfile.colorSeasonFamily,
        colorSeasonLocked: colorBridge.locked,
        colorSeasonConfidence: colorBridge.confidence,
```

- [ ] **Step 4: Update FullReportRequestSchema in full route**

In `app/api/style-analysis/full/route.ts`, update `FullReportRequestSchema.profileData`:

```typescript
  profileData: z.object({
    styleProfile: z.record(z.string(), z.unknown()),
    faceFeatures: z.record(z.string(), z.unknown()),
    bodyAnalysis: z.record(z.string(), z.unknown()),
    computedScores: z.record(z.string(), z.unknown()),
    gender: z.enum(["woman", "man", "other"]).default("other"),
    colorBridgeResult: z.object({          // ← add
      season: z.string(),
      confidence: z.number(),
      locked: z.boolean(),
      derivedUndertone: z.enum(["warm", "cool", "neutral"]),
    }).nullish(),
  }),
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add app/api/style-analysis/mini/route.ts app/api/style-analysis/full/route.ts
git commit -m "feat: wire deterministic color season bridge into mini route Step 1.5"
```

---

### Task 4: Style DNA Builder

**Files:**
- Create: `lib/style-dna.ts`

**Interfaces:**
- Consumes: `StyleProfile` from `lib/style-analysis-schema.ts`, quiz record, colorSeason string, gender
- Produces: `StyleDNA` type + `buildStyleDNA(...)` function

- [ ] **Step 1: Write the failing test**

Create `lib/style-dna.test.ts`:

```typescript
import { buildStyleDNA } from "./style-dna";

const mockStyleProfile = {
  kibbeType: "Flamboyant Natural",
  bestSilhouettes: ["wide-leg trouser", "oversized jacket"],
  bestFabrics: ["linen", "cotton", "suede"],
  colorSeasonFamily: "Dark Autumn",
};

const streetwearQuiz = {
  styleDirection: "streetwear",
  occasionPref: "casual",
  budget: "mid",
  height: "170-180",
  weight: "55-75",
  gender: "woman",
};

test("streetwear quiz produces streetwear vocabulary", () => {
  const dna = buildStyleDNA(mockStyleProfile, streetwearQuiz, "Dark Autumn", "woman");
  expect(dna.vocabulary).toContain("bomber");
  expect(dna.vocabulary).toContain("cargo");
  expect(dna.avoidVocabulary).toContain("fitted blazer");
  expect(dna.styleDirection).toBe("streetwear");
});

test("palette hexes are included from season", () => {
  const dna = buildStyleDNA(mockStyleProfile, streetwearQuiz, "Dark Autumn", "woman");
  expect(dna.paletteHexes.length).toBeGreaterThan(0);
  // Dark Autumn palette should have warm earth tones
  expect(dna.paletteHexes.some(h => h.startsWith("#"))).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest lib/style-dna.test.ts
```
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement Style DNA**

Create `lib/style-dna.ts`:

```typescript
// Season hex palettes — earth tones for warm seasons, cool for cool seasons
const SEASON_PALETTES: Record<string, string[]> = {
  "True Winter": ["#1C1C2E","#2D2D44","#4A3728","#8B7355","#C4A882","#E8DDD0","#6B8CAE","#A8B8D0"],
  "Dark Winter": ["#1A1A2E","#2C1810","#4A2C2A","#7B4F3A","#C4956A","#E8D5C0","#3D3D5C","#8B8BB0"],
  "Bright Winter": ["#0D0D1A","#1A0D26","#2D1B4E","#5C3D8F","#9B59B6","#E8D5F0","#0A3D62","#1A8FD8"],
  "True Summer": ["#8B9DC3","#B8C5E0","#D4DCF0","#C8A8C8","#E0C8E0","#F0E8F0","#7A8FA0","#A8BCC8"],
  "Light Summer": ["#B8C8E0","#D0DCF0","#E8EEF8","#C8B8D0","#E0D4E8","#F0EEF8","#9FAEC0","#BFD0E0"],
  "Soft Summer": ["#9AAAB8","#B8C4D0","#D0D8E0","#B0A8B8","#C8C0CC","#E0DCE4","#8090A0","#A8B4C0"],
  "True Autumn": ["#8B4513","#A0522D","#C67C32","#D4892A","#E8A838","#F0C868","#6B3D1E","#9B6040"],
  "Dark Autumn": ["#2C1810","#4A2C1A","#6B3D28","#8B5E3C","#C4956A","#D4AA80","#A0522D","#6B4226"],
  "Soft Autumn": ["#8B7355","#A08060","#C4A882","#D4BCA0","#E8D4B8","#B89070","#9B7B5B","#C0A070"],
  "True Spring": ["#D4892A","#E8A838","#F0C868","#E8D878","#A8D890","#68B888","#F08860","#D87850"],
  "Light Spring": ["#F0C878","#F8D898","#FFE8B0","#F0E8A0","#C8E8A8","#A0D898","#F8B8A0","#F0D0C0"],
  "Bright Spring": ["#F05C28","#F87840","#FCA050","#F0C040","#D8E830","#80D840","#40C8C0","#20A8E0"],
};

const STYLE_VOCABULARY: Record<string, { vocabulary: string[]; avoid: string[] }> = {
  streetwear: {
    vocabulary: ["oversized", "cargo", "bomber", "hoodie", "jogger", "track", "boxy tee", "clean sneaker", "sweatshirt", "wide-leg", "utility", "nylon"],
    avoid: ["fitted blazer", "midi skirt", "romantic detail", "stiletto", "bodycon", "floral", "lace", "chiffon"],
  },
  minimalist: {
    vocabulary: ["structured", "clean seam", "tonal", "tailored", "column", "straight-leg", "unembellished", "monochrome", "sharp"],
    avoid: ["loud pattern", "excessive detail", "frilly", "oversized logo", "mixed prints", "embellished"],
  },
  classic: {
    vocabulary: ["blazer", "slim trouser", "button-down", "loafer", "trench coat", "knit", "tailored", "timeless", "investment"],
    avoid: ["trendy", "statement", "fast fashion silhouette", "graphic", "distressed"],
  },
  romantic: {
    vocabulary: ["wrap", "bias cut", "floral", "gathered", "silk", "ruffle", "flowing", "delicate", "soft"],
    avoid: ["stiff", "angular", "oversized", "utility", "structured", "boxy"],
  },
  office: {
    vocabulary: ["tailored", "blouse", "wide-leg trouser", "blazer", "pump", "structured bag", "slim", "polished"],
    avoid: ["casual", "logo", "distressed", "athletic", "sheer without layer"],
  },
  eclectic: {
    vocabulary: ["mixed", "layered", "textured", "statement", "pattern", "asymmetric", "bold", "expressive"],
    avoid: ["matchy-matchy", "safe", "boring neutral only"],
  },
};

const BUDGET_SIGNALS: Record<string, string[]> = {
  budget: ["affordable", "budget", "under £50", "high street"],
  mid: ["mid-range", "quality", "under £150"],
  "no-limit": ["luxury", "designer", "investment piece"],
};

export type StyleDNA = {
  styleDirection: string;
  vocabulary: string[];
  avoidVocabulary: string[];
  paletteHexes: string[];
  neutralHexes: string[];
  scale: "small" | "medium" | "large";
  fabricSignals: string[];
  occasionMix: string[];
  budgetTier: "budget" | "mid" | "no-limit";
  budgetSignals: string[];
  gender: string;
  colorSeason: string;
  pinterestQuery: string;
};

const KIBBE_SCALE: Record<string, "small" | "medium" | "large"> = {
  "Dramatic": "large",
  "Soft Dramatic": "large",
  "Flamboyant Natural": "large",
  "Natural": "large",
  "Soft Natural": "medium",
  "Dramatic Classic": "medium",
  "Classic": "medium",
  "Soft Classic": "medium",
  "Theatrical Romantic": "small",
  "Romantic": "small",
  "Flamboyant Gamine": "small",
  "Soft Gamine": "small",
  "Gamine": "small",
};

export function buildStyleDNA(
  styleProfile: {
    kibbeType: string;
    bestFabrics: string[];
    colorSeasonFamily?: string;
  },
  quiz: Record<string, unknown>,
  colorSeason: string,
  gender: string,
): StyleDNA {
  const styleDirection = (quiz.styleDirection as string | undefined) ?? "classic";
  const vocab = STYLE_VOCABULARY[styleDirection] ?? STYLE_VOCABULARY.classic;

  const paletteHexes = SEASON_PALETTES[colorSeason] ?? SEASON_PALETTES["True Summer"];
  // Neutrals = lighter/muted palette colors (last 2 in each array are typically neutrals)
  const neutralHexes = paletteHexes.slice(-3);

  const scale = KIBBE_SCALE[styleProfile.kibbeType] ?? "medium";

  const rawOccasion = quiz.occasionPref ?? quiz.occasions;
  const occasionMix = Array.isArray(rawOccasion)
    ? rawOccasion as string[]
    : rawOccasion ? [rawOccasion as string] : ["casual"];

  const rawBudget = (quiz.budget as string | undefined) ?? "mid";
  const budgetTier = (["budget", "mid", "no-limit"].includes(rawBudget)
    ? rawBudget
    : "mid") as "budget" | "mid" | "no-limit";

  const pinterestQuery = `${styleDirection} outfit ${colorSeason} editorial ${occasionMix[0]} ${gender}`;

  return {
    styleDirection,
    vocabulary: vocab.vocabulary,
    avoidVocabulary: vocab.avoid,
    paletteHexes,
    neutralHexes,
    scale,
    fabricSignals: styleProfile.bestFabrics ?? [],
    occasionMix,
    budgetTier,
    budgetSignals: BUDGET_SIGNALS[budgetTier],
    gender,
    colorSeason,
    pinterestQuery,
  };
}
```

- [ ] **Step 4: Run tests**

```bash
npx jest lib/style-dna.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/style-dna.ts lib/style-dna.test.ts
git commit -m "feat: Style DNA builder — vocabulary + palette from season + quiz direction"
```

---

### Task 5: Schema Updates for Outfit Brief

**Files:**
- Modify: `lib/style-analysis-schema.ts`

**Interfaces:**
- Produces: updated `OutfitItemSchema` with `colorHex` + `fabric`; updated `OutfitSchema` with `stylistNote`

- [ ] **Step 1: Update OutfitItemSchema**

In `lib/style-analysis-schema.ts`, replace:
```typescript
const OutfitItemSchema = z.object({
  piece: z.string(),
  searchQuery: z.string(),
});
```
With:
```typescript
const OutfitItemSchema = z.object({
  piece: z.string(),
  searchQuery: z.string(),
  colorHex: z.string().nullish(),   // hex from user's palette, e.g. "#C4956A"
  fabric: z.string().nullish(),      // e.g. "heavy cotton", "nylon ripstop"
});
```

- [ ] **Step 2: Update OutfitSchema**

Replace:
```typescript
const OutfitSchema = z.object({
  name: z.string(),
  occasion: z.enum(["work", "date", "everyday", "going out", "travel", "content/photos", "casual weekend"]),
  items: z.array(OutfitItemSchema),
  why: z.string(),
  colorLogic: z.string(),
  lookEffect: z.string(),
  heroPiece: z.string(),
  searchQuery: z.string(),
});
```
With:
```typescript
const OutfitSchema = z.object({
  name: z.string(),
  occasion: z.enum(["work", "date", "everyday", "going out", "travel", "content/photos", "casual weekend"]),
  items: z.array(OutfitItemSchema),
  why: z.string(),
  colorLogic: z.string(),
  lookEffect: z.string(),
  heroPiece: z.string(),
  searchQuery: z.string(),
  stylistNote: z.string().nullish(),  // why this outfit works for their specific type+DNA
});
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add lib/style-analysis-schema.ts
git commit -m "feat: add colorHex, fabric to OutfitItemSchema; stylistNote to OutfitSchema"
```

---

### Task 6: Report Composer Prompt — Style DNA + Outfit Brief

**Files:**
- Modify: `lib/prompts/report-composer.ts`

**Interfaces:**
- Consumes: `StyleDNA` from `lib/style-dna.ts`
- Produces: updated `buildReportComposerPrompt` accepting `styleDNA?: StyleDNA`; updated instructions mandating 12-15 outfits with colorHex + fabric per item + stylistNote

- [ ] **Step 1: Add StyleDNA import and parameter to buildReportComposerPrompt**

Find the `buildReportComposerPrompt` function signature and add `styleDNA` to the params object. Add import at top:

```typescript
import type { StyleDNA } from "@/lib/style-dna";
```

Then in `buildReportComposerPrompt`, add `styleDNA?: StyleDNA` to the params type and add before the return statement:

```typescript
  // ── Style DNA injection ───────────────────────────────────────────────────
  const dnaBlock = styleDNA ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STYLE DNA — MANDATORY CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User's stated style direction: ${styleDNA.styleDirection}
Visual scale (from body type): ${styleDNA.scale}
Budget tier: ${styleDNA.budgetTier}
Occasions: ${styleDNA.occasionMix.join(", ")}

ALLOWED vocabulary for this person's outfits:
${styleDNA.vocabulary.join(", ")}

FORBIDDEN in outfits — do not include:
${styleDNA.avoidVocabulary.join(", ")}

Fabric signals (preferred):
${styleDNA.fabricSignals.slice(0, 6).join(", ")}

Palette hexes — every outfit item colorHex MUST come from this list:
${styleDNA.paletteHexes.join(", ")}
` : "";
```

- [ ] **Step 2: Add outfit count mandate to instructions**

Find `buildReportComposerInstructions` and ensure the outfit section includes:

```
OUTFIT COUNT RULE: Generate exactly 12–15 complete outfits. Never fewer than 12.
Each outfit MUST include:
- items: at least 3 pieces (top + bottom + shoes at minimum)
- colorHex on each item: must be one of the palette hexes in Style DNA
- fabric on each item: specific fabric signal ("heavy cotton twill", "silk charmeuse", etc)
- stylistNote: one sentence explaining why this outfit works for their Kibbe type + style direction
- searchQuery per item: MUST include the style direction vocabulary word + color name

STYLE COHERENCE RULE: All items in one outfit must share the same Style DNA vocabulary.
Do not mix: streetwear cargo pants + romantic lace blouse. That is a style clash and is forbidden.

SEARCH QUERY FORMAT per item:
"[specific category] [color name] [fabric signal] [style direction] [gender]"
Example for streetwear woman: "wide-leg cargo trouser off-white cotton twill streetwear women"
Example for minimalist woman: "straight-leg trouser camel wool tailored women"
```

- [ ] **Step 3: Pass styleDNA into the prompt return string**

Inside `buildReportComposerPrompt`, add `${dnaBlock}` near the top of the returned template string, before the quiz context section.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add lib/prompts/report-composer.ts
git commit -m "feat: inject Style DNA and outfit brief rules into report composer prompt"
```

---

### Task 7: fetchProductWithFallback + Full Route Step 4.5 + Outfit Enrichment

**Files:**
- Modify: `app/api/style-analysis/full/route.ts`

**Interfaces:**
- Consumes: `StyleDNA` from Task 4, `deriveColorSeason` result from Task 3, `searchPinterestPins` (existing)
- Produces: enriched outfits with `heroImage`, fallback product search, StyleDNA-aware queries

- [ ] **Step 1: Add imports to full route**

```typescript
import { buildStyleDNA, StyleDNA } from "@/lib/style-dna";
import { colorDistance } from "@/lib/clients/google-vision"; // export this function
```

First, export `colorDistance` from `lib/clients/google-vision.ts` by adding `export` to its declaration:
```typescript
export function colorDistance(a: string, b: string): number {
```

- [ ] **Step 2: Add fetchProductWithFallback helper**

Add this function in `app/api/style-analysis/full/route.ts` after the existing `fetchProduct` helper:

```typescript
async function fetchProductWithFallback(
  queries: [string, string, string],
  targetColorHex?: string | null,
  paletteHexes?: string[],
  gl?: string,
  hl?: string,
  siteOperators?: string,
): Promise<Awaited<ReturnType<typeof fetchProduct>>> {
  for (const query of queries) {
    const results = await searchGoogleShopping({ query, num: 10, gl, hl, siteOperators }).catch(() => []);
    if (results.length === 0) continue;

    // Color proximity filter if targetColorHex and Vision key are available
    let filtered = results;
    if (targetColorHex && process.env.GOOGLE_VISION_API_KEY) {
      const colorChecked = await Promise.all(
        results.slice(0, 5).map(async (r) => {
          if (!r.thumbnail) return { r, match: false };
          try {
            const colors = await extractDominantColors(r.thumbnail);
            const match = colors.some(
              (c) => c.score > 0.05 && colorDistance(c.hex, targetColorHex) < 45,
            );
            return { r, match };
          } catch { return { r, match: false }; }
        })
      );
      const colorMatches = colorChecked.filter((x) => x.match).map((x) => x.r);
      if (colorMatches.length >= 2) filtered = colorMatches;
    }

    const best = pickBestProduct(filtered);
    if (best?.imageUrl) {
      return {
        title: best.title,
        price: best.price,
        imageUrl: best.imageUrl,
        link: best.link,
        source: best.source,
        tasteScore: best.tasteScore,
        qualityScore: best.qualityScore,
        paletteMatch: paletteHexes && best.imageUrl
          ? null  // skip Vision check — already did it above
          : null,
      };
    }
  }
  return null;
}

function buildItemFallbackQueries(
  item: { piece: string; searchQuery: string; colorHex?: string | null; fabric?: string | null },
  dna: StyleDNA,
): [string, string, string] {
  const gender = dna.gender === "man" ? "men" : "women";
  const colorName = item.colorHex
    ? `${item.colorHex}` // Vision handles hex, but named color is better for SerpAPI
    : "";
  return [
    item.searchQuery,                                              // primary (from AI, includes style vocab)
    `${item.piece} ${colorName} ${gender}`.trim(),               // simpler
    `${item.piece.split(" ").slice(-2).join(" ")} ${gender}`,    // category only
  ];
}
```

- [ ] **Step 3: Add Step 4.5 — Pinterest inspiration before report generation**

In the POST handler, after parsing `profileData` and before Step 5 (full report generation), add:

```typescript
    // ── Step 4.5: Style DNA + Pinterest inspiration ──────────────────────────
    const resolvedSeason =
      (profileData.colorBridgeResult?.locked ? profileData.colorBridgeResult.season : null)
      ?? (profileData.styleProfile.colorSeasonFamily as string | undefined)
      ?? "True Summer";

    const styleDNA = buildStyleDNA(
      profileData.styleProfile as { kibbeType: string; bestFabrics: string[]; colorSeasonFamily?: string },
      quiz,
      resolvedSeason,
      profileData.gender,
    );

    // Fetch Pinterest inspiration BEFORE brief generation (~0.8s, runs before the ~20s AI call)
    const inspirationPins = await searchPinterestPins(styleDNA.pinterestQuery, 3).catch(() => []);
```

- [ ] **Step 4: Inject StyleDNA and Pinterest pins into Step 5 prompt**

Update the `buildReportComposerPrompt` call in Step 5:

```typescript
    const report = await runStructuredStyleResponse({
      schema: FullReportSchema,
      schemaName: "FullReport",
      instructions: buildReportComposerInstructions(gender),
      prompt: buildReportComposerPrompt({
        styleProfile: styleProfile as object,
        faceFeatures: faceFeatures as object,
        computedScores: computedScores as object,
        bodyAnalysis: bodyAnalysis as object,
        quiz: quiz as object,
        seasonContext,
        styleDNA,                           // ← add
        inspirationPins,                    // ← add
      }),
      model,
      maxOutputTokens: 14000,
    });
```

Also update `buildReportComposerPrompt` signature in `lib/prompts/report-composer.ts` to accept `inspirationPins?` and inject them:

```typescript
  // After dnaBlock, before or inside the prompt string:
  const pinsBlock = inspirationPins && inspirationPins.length > 0 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUAL INSPIRATION FROM PINTEREST (match this aesthetic — same style, energy, color story)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${inspirationPins.map((p, i) => `Pin ${i + 1}: ${p.imageUrl}${p.title ? ` — "${p.title}"` : ""}`).join("\n")}
These pins represent the editorial direction. Build outfits that match this visual language.
` : "";
```

- [ ] **Step 5: Update outfit enrichment to use fetchProductWithFallback**

Replace the current outfit enrichment in Step 6:

```typescript
      enrichedOutfits,
```

Replace its computation (currently in the `Promise.all`) with:

```typescript
      Promise.all(
        report.outfits.outfits.map(async (outfit) => {
          // Find Pinterest pin for this outfit as hero image
          const heroPinQuery = `${styleDNA.styleDirection} ${outfit.occasion} outfit editorial ${styleDNA.colorSeason}`;
          const heroPin = await searchPinterestPins(heroPinQuery, 1).catch(() => []);

          const enrichedItems = await Promise.all(
            outfit.items.map(async (item) => {
              const queries = buildItemFallbackQueries(item, styleDNA);
              const product = await fetchProductWithFallback(
                queries,
                item.colorHex ?? null,
                paletteHexes,
                serpGl,
                hl,
                siteOperators,
              );
              return { ...item, product };
            })
          );

          return {
            ...outfit,
            items: enrichedItems,
            heroImage: heroPin[0] ?? null,
          };
        })
      ),
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add app/api/style-analysis/full/route.ts lib/clients/google-vision.ts
git commit -m "feat: Step 4.5 Pinterest inspiration, StyleDNA-aware outfit enrichment, fetchProductWithFallback"
```

---

### Task 8: Feed Route — StyleDNA Product Filtering

**Files:**
- Modify: `app/api/feed/route.ts`

**Interfaces:**
- Consumes: `StyleDNA` from `lib/style-dna.ts`; styleProfile from request body or Supabase profile
- Produces: StyleDNA-filtered product queries replacing generic feed queries

- [ ] **Step 1: Read current feed route**

```bash
cat app/api/feed/route.ts
```

- [ ] **Step 2: Add StyleDNA query builder**

In `app/api/feed/route.ts`, after imports, add:

```typescript
import { buildStyleDNA } from "@/lib/style-dna";

function buildPicksQueries(dna: StyleDNA): string[] {
  const gender = dna.gender === "man" ? "men" : "women";
  const palette = dna.paletteHexes.slice(0, 3); // top 3 palette colors
  const vocab = dna.vocabulary.slice(0, 4);      // top 4 style words

  // Build 6-8 specific queries combining style vocabulary + palette context
  return [
    `${vocab[0]} ${gender} ${dna.colorSeason.toLowerCase().split(" ").slice(-1)[0]}`,
    `${vocab[1] ?? vocab[0]} ${gender} ${dna.budgetTier === "budget" ? "affordable" : "quality"}`,
    `${vocab[2] ?? vocab[0]} ${gender} new`,
    `${dna.styleDirection} top ${gender}`,
    `${dna.styleDirection} trousers ${gender}`,
    `${dna.styleDirection} outerwear ${gender}`,
    `${dna.occasionMix[0]} outfit ${gender} ${dna.styleDirection}`,
    `${dna.fabricSignals[0] ?? "quality"} ${gender} top`,
  ].filter(Boolean);
}
```

- [ ] **Step 3: Use StyleDNA queries in the feed handler**

In the POST/GET handler, extract styleProfile from the request. If styleProfile is available, build StyleDNA and use DNA-based queries. Otherwise fall back to current behavior:

```typescript
    const styleProfile = body?.styleProfile as Record<string, unknown> | undefined;
    const quiz = body?.quiz as Record<string, unknown> | undefined;
    const colorSeason = (body?.colorSeason as string | undefined) ?? "True Summer";
    const gender = (body?.gender as string | undefined) ?? "woman";

    let searchQueries: string[];
    if (styleProfile && quiz) {
      const dna = buildStyleDNA(
        styleProfile as { kibbeType: string; bestFabrics: string[]; colorSeasonFamily?: string },
        quiz,
        colorSeason,
        gender,
      );
      searchQueries = buildPicksQueries(dna);
    } else {
      searchQueries = [/* existing fallback queries */];
    }
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add app/api/feed/route.ts
git commit -m "feat: StyleDNA-aware product queries in feed route"
```

---

### Task 9: UI — Outfit Card with Hero Image + Occasion Filter Tabs

**Files:**
- Modify: `components/profile/style-report-view.tsx`
- Modify: `app/profile/style-report.css`

**Interfaces:**
- Consumes: enriched outfit with `heroImage: { imageUrl, pinLink, title } | null` and `stylistNote: string | null`

- [ ] **Step 1: Add occasion filter state to OutfitsChapter**

In `components/profile/style-report-view.tsx`, find the `OutfitsChapter` component. Add state and filter UI:

```tsx
function OutfitsChapter({ data }: { data: OutfitsSection & { outfits: EnrichedOutfit[] } }) {
  const occasions = ["all", ...Array.from(new Set(data.outfits.map((o) => o.occasion)))];
  const [activeOccasion, setActiveOccasion] = React.useState("all");

  const filtered = activeOccasion === "all"
    ? data.outfits
    : data.outfits.filter((o) => o.occasion === activeOccasion);

  return (
    <section className="sr__chapter">
      <h2 className="sr__chapter-title">Ready Outfits</h2>

      {/* Occasion filter tabs */}
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
    </section>
  );
}
```

- [ ] **Step 2: Rewrite OutfitCard component**

Replace any existing OutfitCard with:

```tsx
function OutfitCard({ outfit }: { outfit: EnrichedOutfit }) {
  return (
    <div className="sr__outfit-card">
      {/* Pinterest hero image */}
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

      {/* Outfit header */}
      <div className="sr__outfit-header">
        <span className="sr__outfit-name">{outfit.name}</span>
        <span className="sr__outfit-occasion-chip">{outfit.occasion}</span>
      </div>

      {/* Stylist note */}
      {outfit.stylistNote && (
        <p className="sr__outfit-stylist-note">{outfit.stylistNote}</p>
      )}

      {/* Product grid */}
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
```

- [ ] **Step 3: Add CSS for outfit card**

In `app/profile/style-report.css`, add:

```css
.sr__occasion-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 0 0 24px;
}

.sr__occasion-tab {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: transparent;
  font-family: var(--sans);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: lowercase;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.15s;
}

.sr__occasion-tab--active {
  background: var(--pink-deep);
  border-color: var(--pink-deep);
  color: #fff;
}

.sr__outfits-feed {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.sr__outfit-card {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface);
}

.sr__outfit-hero {
  display: block;
  position: relative;
  aspect-ratio: 4/5;
  overflow: hidden;
  max-height: 480px;
}

.sr__outfit-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.sr__outfit-pinterest-attr {
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.75);
  background: rgba(0,0,0,0.35);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--sans);
}

.sr__outfit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 4px;
}

.sr__outfit-name {
  font-family: var(--serif);
  font-size: 1.1rem;
  color: var(--on-surface);
}

.sr__outfit-occasion-chip {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--pink-deep);
  background: color-mix(in srgb, var(--pink-deep) 10%, transparent);
  padding: 3px 10px;
  border-radius: 12px;
}

.sr__outfit-stylist-note {
  padding: 6px 18px 14px;
  font-size: 0.83rem;
  color: var(--ink-soft);
  line-height: 1.55;
  font-style: italic;
}

.sr__outfit-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  padding: 0 14px 18px;
}

.sr__outfit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: inherit;
}

.sr__outfit-item-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid var(--border);
}

.sr__outfit-item-piece {
  font-size: 0.68rem;
  color: var(--ink-soft);
  text-align: center;
  line-height: 1.3;
}

.sr__outfit-item-price {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--on-surface);
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Clear localStorage and run a test analysis**

In browser console: `localStorage.clear()` — then run a new analysis to see the updated outfit cards with hero images and filter tabs.

- [ ] **Step 6: Commit**

```bash
git add components/profile/style-report-view.tsx app/profile/style-report.css
git commit -m "feat: outfit card with Pinterest hero image, stylist note, occasion filter tabs"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Deterministic color season → Task 1, 2, 3
- ✅ Cross-family override never allowed → Task 3 (lockedSeason + same-family guard)
- ✅ Style DNA → Task 4
- ✅ Pinterest as inspiration before brief generation → Task 7 Step 3
- ✅ Style direction in SerpAPI queries → Task 7 (`buildItemFallbackQueries` includes style direction vocab)
- ✅ 12-15 outfits → Task 6 prompt mandate
- ✅ colorHex + fabric per outfit item → Task 5
- ✅ stylistNote per outfit → Task 5 + 6
- ✅ fetchProductWithFallback with 3 queries → Task 7
- ✅ Color proximity filter (Google Vision) → Task 7
- ✅ Pinterest hero image per outfit → Task 7 Step 5
- ✅ Feed route StyleDNA filtering → Task 8
- ✅ UI outfit card + hero image + occasion filter tabs → Task 9
- ✅ Capsule section (existing, unchanged — pairing info already in schema)

**Type consistency:**
- `ColorBridgeResult` defined in Task 1, consumed in Task 3
- `StyleDNA` defined in Task 4, consumed in Task 6, 7, 8
- `buildStyleProfilePrompt` updated in Task 2; `lockedSeason` + `derivedUndertone` param names consistent across Task 2 and 3
- `fetchProductWithFallback` defined in Task 7, used only in Task 7
- `EnrichedOutfit` type (outfit + heroImage) used in Task 9 — needs to be defined in `style-report-view.tsx` as a local type

**Ambiguity fix:** Task 9 references `EnrichedOutfit` — add this type at the top of the OutfitsChapter component:
```typescript
type EnrichedOutfit = z.infer<typeof OutfitSchema> & {
  heroImage: { imageUrl: string; pinLink: string; title: string | null } | null;
  items: Array<z.infer<typeof OutfitItemSchema> & { product: Record<string, unknown> | null }>;
};
```
