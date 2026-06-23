# AI Stylist Capsule — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make PaletteMe's outfit recommendations genuinely stylish by having the AI design each outfit as a fashion editor (specific fabric + color + silhouette queries), then sourcing products via ShopStyle (primary) and SerpAPI (fallback), with Pinterest editorial photos as per-outfit mood images.

**Architecture:** The existing `/api/style-analysis` route already generates outfits as part of the full report. We improve three things: (1) add an aesthetic selection step to the setup flow so the AI has taste context; (2) enforce fashion-editor-quality search queries in the report-composer prompt; (3) replace the SerpAPI-only outfit enrichment with ShopStyle-first + Pinterest per outfit. The OutfitCard UI is redesigned to show mood photo → items horizontal scroll.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, OpenAI Responses API (Zod structured output), ShopStyle Collective API (`lib/shopstyle.ts`), SerpAPI Google Shopping (`lib/serpapi.ts`), Pinterest API v5 (`lib/clients/pinterest.ts`), TypeScript

## Global Constraints

- Do not create `tailwind.config.js` — Tailwind v4 tokens live in `app/globals.css`
- Do not import server libs (Supabase, OpenAI) into client components
- API routes must export `runtime = "nodejs"`
- ShopStyle `clickUrl` must never be modified — use as-is (affiliate link)
- Missing API keys (`SHOPSTYLE_UID`, `PINTEREST_ACCESS_TOKEN`, `SERPAPI_KEY`) must never crash — always fall back gracefully to the next source or null
- 10-question limit in quiz is a hard cap — the aesthetic step is added OUTSIDE QUIZ_STEPS (like photo steps)
- DM Serif Display weight 400 only; DM Sans for body/UI; no inline hardcoded colors except actual palette swatches
- Use `z` from `zod` (v4)
- Buttons/nav text stay lowercase with `letter-spacing: 0`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `lib/quiz-data.ts` | Modify | Add `AESTHETIC_OPTIONS` array + `aesthetics?: string[]` to `QuizAnswers` |
| `components/style-setup/style-setup-flow.tsx` | Modify | Add "aesthetic" step after quiz steps |
| `lib/prompts/report-composer.ts` | Modify | Accept aesthetics param; add aesthetic-driven outfit query examples; add `pinterestQuery` field per outfit |
| `lib/style-analysis-schema.ts` | Modify | Add `pinterestQuery` field to outfit item schema |
| `lib/shopstyle.ts` | Modify | Add `searchFashionItem` function |
| `lib/clients/pinterest.ts` | Modify | Add `searchOutfitMoodImage` function |
| `app/api/style-analysis/route.ts` | Modify | Wire ShopStyle + Pinterest into outfit enrichment; pass aesthetics into prompt |
| `components/profile/style-report-view.tsx` | Modify | Redesign OutfitCard: Pinterest hero + horizontal product scroll |
| `app/profile/style-report.css` | Modify | New outfit card styles |

---

## Task 1: Aesthetic selection step in style-setup

**Files:**
- Modify: `lib/quiz-data.ts`
- Modify: `components/style-setup/style-setup-flow.tsx`

**Interfaces:**
- Produces: `QuizAnswers.aesthetics?: string[]` — array of 1–2 selected aesthetic IDs
- Produces: `AESTHETIC_OPTIONS` — array of `{ id, label, sub, keywords, emoji }` objects
- Consumed by: Task 3 (style-analysis route reads `quiz.aesthetics`), Task 5 (report-composer gets aesthetic context)

---

- [ ] **Step 1: Add AESTHETIC_OPTIONS and aesthetics field to quiz-data.ts**

In `lib/quiz-data.ts`, after the `ADVENTURE_LEVEL_OPTIONS` block (around line 117), add:

```typescript
export type Aesthetic =
  | "old-money"
  | "clean-girl"
  | "soft-feminine"
  | "streetwear"
  | "office-siren"
  | "minimal-luxury"
  | "dark-romantic"
  | "coastal";

export const AESTHETIC_OPTIONS: {
  id: Aesthetic;
  label: string;
  sub: string;
  keywords: string[];
  emoji: string;
}[] = [
  {
    id: "old-money",
    label: "Old money",
    sub: "Quiet luxury, neutral palette, quality fabrics",
    keywords: ["cashmere", "tailored", "camel", "neutral", "investment"],
    emoji: "🏛",
  },
  {
    id: "clean-girl",
    label: "Clean girl",
    sub: "Minimal, effortless, white + neutral tones",
    keywords: ["minimal", "clean", "effortless", "white", "tote"],
    emoji: "☁️",
  },
  {
    id: "soft-feminine",
    label: "Soft feminine",
    sub: "Romantic, draped, blush tones, delicate details",
    keywords: ["romantic", "floral", "draped", "blush", "lace"],
    emoji: "🌸",
  },
  {
    id: "streetwear",
    label: "Streetwear",
    sub: "Relaxed, oversized, utilitarian, urban",
    keywords: ["oversized", "cargo", "sneakers", "urban", "hooded"],
    emoji: "🏙",
  },
  {
    id: "office-siren",
    label: "Office siren",
    sub: "Tailored, polished, powerful silhouettes",
    keywords: ["blazer", "tailored", "structured", "power dressing"],
    emoji: "💼",
  },
  {
    id: "minimal-luxury",
    label: "Minimal luxury",
    sub: "Structured, monochrome, editorial",
    keywords: ["monochrome", "architectural", "structured", "editorial"],
    emoji: "◼",
  },
  {
    id: "dark-romantic",
    label: "Dark romantic",
    sub: "Rich colors, velvet, moody, layered",
    keywords: ["velvet", "burgundy", "moody", "lace", "dark"],
    emoji: "🌹",
  },
  {
    id: "coastal",
    label: "Coastal",
    sub: "Linen, light, relaxed, nautical",
    keywords: ["linen", "striped", "relaxed", "nautical", "natural"],
    emoji: "🌊",
  },
];
```

Also add `aesthetics?: Aesthetic[]` to the `QuizAnswers` type (after `faceShape?: string` at the end):

```typescript
  aesthetics?: Aesthetic[];
```

- [ ] **Step 2: Add "aesthetic" step to style-setup-flow.tsx**

In `components/style-setup/style-setup-flow.tsx`, add the import:

```typescript
import {
  AESTHETIC_OPTIONS,
  type Aesthetic,
  // ... existing imports
} from "@/lib/quiz-data";
```

Then update the `StyleStep` type to include `"aesthetic"`:

```typescript
type StyleStep =
  | "face-photo"
  | "body-photo"
  | "wardrobe-type"
  | "style-challenge"
  | "measurements"
  | "body-shape"
  | "style-direction"
  | "occasions"
  | "makeup"
  | "budget"
  | "style-mood"
  | "location"
  | "aesthetic"; // ← new
```

Add `"aesthetic"` to `STYLE_STEPS` after `"location"` (outside QUIZ_STEPS — not counted in 10-step progress):

```typescript
const STYLE_STEPS: StyleStep[] = [...PHOTO_STEPS, ...QUIZ_STEPS, "aesthetic"];
```

Note: `QUIZ_STEPS` stays unchanged (still 10 steps). The `stepKicker` function returns `""` for non-quiz steps — handle the aesthetic step kicker:

```typescript
function stepKicker(step: StyleStep): string {
  if (step === "face-photo") return "photo 1/2";
  if (step === "body-photo") return "photo 2/2";
  if (step === "aesthetic") return "your style";
  const idx = QUIZ_STEPS.indexOf(step);
  return `step ${String(idx + 1).padStart(2, "0")}`;
}
```

- [ ] **Step 3: Add aesthetic state and render the step in style-setup-flow.tsx**

Add to the component's state (near other quiz state):

```typescript
const [selectedAesthetics, setSelectedAesthetics] = useState<Aesthetic[]>([]);
```

Add a handler that enforces max 2 selections:

```typescript
function toggleAesthetic(id: Aesthetic) {
  setSelectedAesthetics((prev) => {
    if (prev.includes(id)) return prev.filter((a) => a !== id);
    if (prev.length >= 2) return [...prev.slice(1), id];
    return [...prev, id];
  });
}
```

In the JSX render section, add the aesthetic step case. Look for the existing `{step === "style-mood" && ( ... )}` block and add after it:

```tsx
{step === "aesthetic" && (
  <div className="quiz-step">
    <QuizStepHead
      kicker="your style"
      headline="what's your aesthetic?"
      sub="pick 1 or 2 — we'll build your capsule around these"
    />
    <div className="quiz-card-grid quiz-card-grid--aesthetic">
      {AESTHETIC_OPTIONS.map((opt) => {
        const selected = selectedAesthetics.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            className={`quiz-aesthetic-card${selected ? " quiz-aesthetic-card--selected" : ""}`}
            onClick={() => toggleAesthetic(opt.id)}
            aria-pressed={selected}
          >
            <span className="quiz-aesthetic-emoji">{opt.emoji}</span>
            <span className="quiz-aesthetic-label">{opt.label}</span>
            <span className="quiz-aesthetic-sub">{opt.sub}</span>
          </button>
        );
      })}
    </div>
    <QuizFooter
      onBack={() => setStep("location")}
      onNext={() => {
        // Save aesthetics into quiz answers before submitting
        saveQuizToLocalStorage({ ...quizAnswers, aesthetics: selectedAesthetics });
        handleSubmit({ ...quizAnswers, aesthetics: selectedAesthetics });
      }}
      nextLabel={selectedAesthetics.length > 0 ? "see my results →" : "skip →"}
    />
  </div>
)}
```

Also update the navigation: when the user is on `"location"` step and clicks Next, go to `"aesthetic"` instead of submitting directly. Find where `"location"` step's next action triggers submission and change it to `setStep("aesthetic")`.

- [ ] **Step 4: Add CSS for the aesthetic cards**

In `app/quiz/quiz.css` (or wherever the quiz styles live — check what the style-setup-flow imports), add:

```css
.quiz-card-grid--aesthetic {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 16px 24px;
}

.quiz-aesthetic-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid color-mix(in srgb, var(--color-text) 12%, transparent);
  background: var(--color-surface);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
}

.quiz-aesthetic-card--selected {
  border-color: var(--color-text);
  background: color-mix(in srgb, var(--color-text) 6%, transparent);
}

.quiz-aesthetic-emoji {
  font-size: 1.4rem;
  line-height: 1;
}

.quiz-aesthetic-label {
  font-family: var(--font-sans);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text);
}

.quiz-aesthetic-sub {
  font-family: var(--font-sans);
  font-size: 0.77rem;
  color: color-mix(in srgb, var(--color-text) 60%, transparent);
  line-height: 1.3;
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/quiz-data.ts components/style-setup/style-setup-flow.tsx app/quiz/quiz.css
git commit -m "feat: add aesthetic selection step to style-setup flow"
```

**How to test:** Run `npm run dev`, go to `/style-setup`, complete the quiz, verify the aesthetic step appears after location, can select 1–2 options, and "see my results" advances to analysis.

---

## Task 2: Fashion-editor outfit query enforcement in report-composer

**Files:**
- Modify: `lib/prompts/report-composer.ts`
- Modify: `lib/style-analysis-schema.ts`

**Interfaces:**
- Consumes: `QuizAnswers.aesthetics?: string[]` (read from `quiz` param)
- Produces: Each outfit item now must include `pinterestQuery?: string` in the AI output
- Consumed by: Task 5 (route uses `pinterestQuery` per outfit to call Pinterest)

---

- [ ] **Step 1: Add pinterestQuery to outfit schema in lib/style-analysis-schema.ts**

Find the outfit item schema in `lib/style-analysis-schema.ts`. Search for `OutfitItemSchema` or look for `piece: z.string()`. Add `pinterestQuery` at the outfit level (not per item — one per outfit):

Find the `OutfitSchema` (the object with `name`, `occasion`, `items`, `why`, `colorLogic`, etc.) and add:

```typescript
pinterestQuery: z.string().describe(
  'Pinterest search query for the outfit mood image. Format: "{aesthetic} {occasion} outfit {main color} editorial". Example: "old money everyday outfit cream ivory editorial women"'
),
```

- [ ] **Step 2: Update buildReportComposerPrompt to accept and inject aesthetics**

In `lib/prompts/report-composer.ts`, update the `buildReportComposerPrompt` function signature to accept `aesthetics`:

```typescript
export function buildReportComposerPrompt(data: {
  styleProfile: object;
  faceFeatures: object;
  computedScores: object;
  bodyAnalysis: object;
  quiz: object;
  seasonContext?: string;
  styleDNA?: StyleDNA;
  inspirationPins?: Array<{ imageUrl: string; pinLink: string; title: string | null }>;
  aesthetics?: string[]; // ← new
}): string {
```

Then inside the function, after `aestheticFlavor` is built, add aesthetics context:

```typescript
const aestheticsRaw = data.aesthetics ?? (quiz.aesthetics as string[] | undefined) ?? [];
const aestheticsLabel = aestheticsRaw.length > 0
  ? aestheticsRaw.join(", ")
  : (quiz.styleMood as string | undefined) ?? "not specified";
```

Add this to `tasteContext`:

```typescript
const tasteContext = [
  `Style mood: ${quiz.styleMood ?? "not-sure"}`,
  `Aesthetic direction: ${aestheticsLabel}`,  // ← new line
  `Adventure level: ${quiz.adventureLevel ?? "balanced"}`,
  // ... rest unchanged
```

- [ ] **Step 3: Update the outfit query format rules in the prompt**

Find the `SEARCH QUERY FORMAT per item:` block (around line 955 in report-composer.ts) and replace it with this stronger version:

```typescript
// In the return string, replace the SEARCH QUERY FORMAT block:
```

Find the text:
```
SEARCH QUERY FORMAT per item:
"[specific category] [color name] [fabric signal] [style direction] [gender]"
Example for streetwear woman: "wide-leg cargo trouser off-white cotton twill streetwear women"
```

Replace with:

```
SEARCH QUERY FORMAT per item — NON-NEGOTIABLE:
Each item's searchQuery MUST follow this exact structure:
"[silhouette/cut] [color name] [fabric signal] [aesthetic keyword] [gender]"

Rules:
- Include the SPECIFIC CUT (wide-leg, bias-cut, oversized, fitted, midi, etc.)
- Include the EXACT COLOR from their palette (ivory, dusty rose, camel, not just "beige")
- Include a FABRIC SIGNAL (linen, satin, cashmere, crepe, cotton twill, silk, jersey, etc.)
- Include ONE aesthetic keyword from their direction
- End with gender (women/men)
- MINIMUM 5 words per query. "cream top women" is rejected.

GOOD examples:
- "wide-leg cream linen trouser high waist minimal women"
- "ivory draped satin blouse v-neck relaxed women"
- "tan leather pointed-toe mule minimal women"
- "camel oversized blazer unstructured tailored women"
- "dusty rose bias-cut midi slip dress minimal women"
- "dark olive wide-leg cargo trouser relaxed streetwear women"

BAD examples (will produce trash results):
- "cream pants women" → too vague
- "top women" → useless
- "old money blazer" → no fabric/color/cut
- "dusty rose dress" → no silhouette

PINTEREST QUERY per outfit — REQUIRED:
Each outfit must have pinterestQuery following this format:
"{aesthetic} {occasion} outfit {main near-face color} editorial {gender}"
Example: "old money everyday outfit ivory cream editorial women"
Example: "clean girl work outfit white minimal editorial women"
Example: "dark romantic evening outfit burgundy velvet editorial women"
```

- [ ] **Step 4: Commit**

```bash
git add lib/prompts/report-composer.ts lib/style-analysis-schema.ts
git commit -m "feat: enforce fashion-editor outfit queries + pinterestQuery per outfit"
```

**How to test:** The schema change will be validated when the route runs — the AI must produce `pinterestQuery` on each outfit. To test queries manually: start `npm run dev`, submit a test image through style-setup, check the console output or use `/api/debug` to inspect the report output and verify outfit items have 5+ word specific queries.

---

## Task 3: ShopStyle as primary outfit product source

**Files:**
- Modify: `lib/shopstyle.ts`
- Modify: `lib/product-ranker.ts`

**Interfaces:**
- Produces: `searchFashionItem(query: string): Promise<{ title: string; price: string | null; imageUrl: string | null; link: string | null; source: string } | null>`
- Consumed by: Task 5 (`fetchProductWithFallback` in the route)

---

- [ ] **Step 1: Add scoreShopStyleProduct to lib/product-ranker.ts**

The existing `scoreProduct` in `lib/product-ranker.ts` accepts SerpAPI-shaped data. Add a function that accepts ShopStyle format at the end of the file:

```typescript
export function scoreShopStyleProduct(product: {
  name: string;
  brandedName: string;
  price: number;
  salePrice?: number;
  image: { sizes: { Best: { url: string } } };
  clickUrl: string;
}): RankedProduct {
  const hasImage = Boolean(product.image?.sizes?.Best?.url);
  // Reuse the same scoring logic via existing scoreProduct
  return scoreProduct({
    title: product.brandedName || product.name,
    price: product.salePrice
      ? `$${product.salePrice}`
      : product.price
        ? `$${product.price}`
        : null,
    thumbnail: product.image?.sizes?.Best?.url ?? null,
    link: product.clickUrl,
    source: "shopstyle",
  });
}
```

- [ ] **Step 2: Add searchFashionItem to lib/shopstyle.ts**

At the end of `lib/shopstyle.ts`, add:

```typescript
import { scoreShopStyleProduct } from "@/lib/product-ranker";
// Note: this creates a circular-ish dependency — if that's a problem, inline the scoring here instead.
// Since product-ranker is pure scoring logic with no imports from shopstyle, it's safe.

export type EnrichedFashionProduct = {
  title: string;
  price: string | null;
  imageUrl: string | null;
  link: string | null;
  source: string;
};

export async function searchFashionItem(
  query: string
): Promise<EnrichedFashionProduct | null> {
  const products = await searchProducts({ fts: query, limit: 20 });
  if (products.length === 0) return null;

  // Score all results, pick best
  const scored = products
    .map((p) => ({ raw: p, scored: scoreShopStyleProduct(p) }))
    .filter((p) => p.scored.imageUrl !== null && p.scored.finalScore > 30)
    .sort((a, b) => b.scored.finalScore - a.scored.finalScore);

  const best = scored[0];
  if (!best) return null;

  return {
    title: best.scored.title,
    price: best.scored.price,
    imageUrl: best.scored.imageUrl,
    link: best.raw.clickUrl, // always use clickUrl (affiliate link) — never scored.link
    source: "shopstyle",
  };
}
```

**Important:** `link` must be `best.raw.clickUrl`, not the scored link. ShopStyle `clickUrl` is the affiliate link — use it directly.

- [ ] **Step 3: Write a quick manual test**

Create `lib/shopstyle.test.ts`:

```typescript
import { searchFashionItem } from "@/lib/shopstyle";

// Manual test — requires SHOPSTYLE_UID env var to be set
// Run: npx tsx lib/shopstyle.test.ts
async function main() {
  const result = await searchFashionItem(
    "wide-leg cream linen trouser high waist minimal women"
  );
  console.log("Result:", JSON.stringify(result, null, 2));
  if (result) {
    console.assert(result.imageUrl !== null, "must have imageUrl");
    console.assert(result.link.includes("shopstyle"), "link must be shopstyle");
    console.log("PASS");
  } else {
    console.log("null result (SHOPSTYLE_UID not set or no results — ok)");
  }
}
main().catch(console.error);
```

Run: `npx tsx lib/shopstyle.test.ts`
Expected: Either a product result with imageUrl and shopstyle link, or "null result" if no API key.

- [ ] **Step 4: Commit**

```bash
git add lib/shopstyle.ts lib/product-ranker.ts lib/shopstyle.test.ts
git commit -m "feat: add searchFashionItem to ShopStyle client — primary outfit product source"
```

---

## Task 4: Pinterest per-outfit mood image

**Files:**
- Modify: `lib/clients/pinterest.ts`

**Interfaces:**
- Produces: `searchOutfitMoodImage(pinterestQuery: string): Promise<{ imageUrl: string; pinLink: string; title: string | null } | null>`
- Consumed by: Task 5 (route calls this per outfit)

---

- [ ] **Step 1: Add searchOutfitMoodImage to lib/clients/pinterest.ts**

At the end of `lib/clients/pinterest.ts`, add:

```typescript
export async function searchOutfitMoodImage(
  pinterestQuery: string
): Promise<{ imageUrl: string; pinLink: string; title: string | null } | null> {
  const pins = await searchPinterestPins(pinterestQuery, 5);
  if (pins.length === 0) return null;

  // Pick the pin with the best image (heuristic: prefer taller-than-wide images
  // that look like editorial fashion shots). Since we can't check aspect ratio
  // from v5 API without an extra call, just return the first result.
  const pin = pins[0];
  return {
    imageUrl: pin.imageUrl,
    pinLink: pin.pinLink,
    title: pin.title,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/clients/pinterest.ts
git commit -m "feat: add searchOutfitMoodImage to Pinterest client"
```

**How to test:** If `PINTEREST_ACCESS_TOKEN` is set, run `npx tsx -e "import { searchOutfitMoodImage } from './lib/clients/pinterest.ts'; searchOutfitMoodImage('old money everyday outfit cream ivory editorial women').then(console.log)"`. Expect an object with `imageUrl`, `pinLink`, `title`.

---

## Task 5: Wire ShopStyle + Pinterest into outfit enrichment

**Files:**
- Modify: `app/api/style-analysis/route.ts`

**Interfaces:**
- Consumes: `searchFashionItem` from `lib/shopstyle.ts` (Task 3)
- Consumes: `searchOutfitMoodImage` from `lib/clients/pinterest.ts` (Task 4)
- Consumes: `QuizAnswers.aesthetics` from quiz data (Task 1)
- Produces: `enrichedOutfits` — each outfit now has `heroImage` from Pinterest + products enriched via ShopStyle-first fallback

---

- [ ] **Step 1: Add imports to route.ts**

At the top of `app/api/style-analysis/route.ts`, add:

```typescript
import { searchFashionItem } from "@/lib/shopstyle";
import { searchOutfitMoodImage } from "@/lib/clients/pinterest";
```

- [ ] **Step 2: Add fetchProductWithFallback function**

After the existing `fetchProduct` function (around line 170), add:

```typescript
// Try ShopStyle first (better fashion image quality), fall back to SerpAPI.
async function fetchProductWithFallback(
  searchQuery: string,
  paletteHexes?: string[],
  gl?: string,
  hl?: string,
  siteOperators?: string
): Promise<{
  title: string;
  price: string | null;
  imageUrl: string | null;
  link: string | null;
  source: string;
} | null> {
  // 1. Try ShopStyle (primary — fashion aggregator, better images)
  if (process.env.SHOPSTYLE_UID) {
    const shopResult = await searchFashionItem(searchQuery).catch(() => null);
    if (shopResult?.imageUrl) return shopResult;
  }
  // 2. Fall back to SerpAPI
  return fetchProduct(searchQuery, paletteHexes, gl, hl, siteOperators);
}
```

- [ ] **Step 3: Pass aesthetics into buildReportComposerPrompt**

Find the `buildReportComposerPrompt` call in the route (around line 397) and add `aesthetics`:

```typescript
const analysisOutput = await runStructuredStyleResponse({
  schema: StyleAnalysisOutputSchema,
  schemaName: "StyleAnalysisOutput",
  instructions: buildReportComposerInstructions(gender),
  prompt: buildReportComposerPrompt({
    styleProfile,
    faceFeatures,
    computedScores,
    bodyAnalysis,
    quiz: parsedQuiz,
    seasonContext,
    aesthetics: (parsedQuiz as Record<string, unknown>).aesthetics as string[] | undefined,  // ← new
  }),
  model,
  maxOutputTokens: 14000,
});
```

- [ ] **Step 4: Update outfit enrichment to use ShopStyle + Pinterest**

Find the `enrichedOutfits` part of the big `Promise.all` (around line 444). Replace:

```typescript
// Outfits (all items across all outfits) — season-aware
Promise.all(
  report.outfits.outfits.map(async (outfit) => ({
    ...outfit,
    items: await enrichWithProducts(outfit.items, paletteHexes, serpGl, currentSeason, hl, siteOperators),
  }))
),
```

With:

```typescript
// Outfits — ShopStyle primary, SerpAPI fallback, Pinterest mood image per outfit
Promise.all(
  report.outfits.outfits.map(async (outfit) => {
    // Enrich items with ShopStyle-first fallback (parallel, batched 4 at a time)
    const enrichedItems: typeof outfit.items = [];
    for (let i = 0; i < outfit.items.length; i += 4) {
      const batch = outfit.items.slice(i, i + 4);
      const fetched = await Promise.all(
        batch.map(async (item) => ({
          ...item,
          product: await fetchProductWithFallback(
            item.searchQuery,
            paletteHexes,
            serpGl,
            hl,
            siteOperators
          ),
        }))
      );
      enrichedItems.push(...fetched);
    }

    // Pinterest mood image for this outfit
    const heroImage = outfit.pinterestQuery
      ? await searchOutfitMoodImage(outfit.pinterestQuery).catch(() => null)
      : null;

    return { ...outfit, items: enrichedItems, heroImage };
  })
),
```

- [ ] **Step 5: Verify heroImage flows into enrichedReport**

The `enrichedReport` already spreads `outfits: { ...report.outfits, outfits: enrichedOutfits }`. Since `heroImage` is added to each outfit in the map above, it will be included automatically. No change needed here.

- [ ] **Step 6: Commit**

```bash
git add app/api/style-analysis/route.ts
git commit -m "feat: ShopStyle-first + Pinterest mood image per outfit in style-analysis enrichment"
```

**How to test:** Submit a complete style-setup flow (face photo + quiz). Check the JSON response from `/api/style-analysis`. Each outfit in `fullReport.outfits.outfits` should have:
- `heroImage: { imageUrl, pinLink, title }` (non-null if PINTEREST_ACCESS_TOKEN set)
- `items[*].product.source === "shopstyle"` (if SHOPSTYLE_UID set)
- `items[*].product.imageUrl` non-null (actual product photos)

---

## Task 6: OutfitCard hero UI

**Files:**
- Modify: `components/profile/style-report-view.tsx`
- Modify: `app/profile/style-report.css`

**Interfaces:**
- Consumes: `outfit.heroImage?: { imageUrl: string; pinLink: string; title: string | null } | null` (from Task 5)
- Consumes: `outfit.items[*].product` — enriched product with `imageUrl`, `price`, `link`, `source`
- Produces: redesigned OutfitCard with Pinterest hero + horizontal product scroll

---

- [ ] **Step 1: Find the OutfitCard component in style-report-view.tsx**

Search for `function OutfitCard` or `OutfitsChapter`. The component renders outfit cards inside `OutfitsChapter`. The current outfit type already has `heroImage?: { imageUrl: string; pinLink: string; title: string | null } | null` in the TypeScript types (line ~170 in the component).

- [ ] **Step 2: Replace OutfitCard component**

Find the existing `OutfitCard` component in `components/profile/style-report-view.tsx` and replace it with:

```tsx
function OutfitCard({
  outfit,
  isHero = false,
}: {
  outfit: FullReport["outfits"]["outfits"][number];
  isHero?: boolean;
}) {
  const heroImageUrl = outfit.heroImage?.imageUrl;
  const heroLink = outfit.heroImage?.pinLink;

  return (
    <div className={`outfit-card${isHero ? " outfit-card--hero" : ""}`}>
      {/* Pinterest mood photo */}
      {heroImageUrl ? (
        <a
          href={heroLink}
          target="_blank"
          rel="noopener noreferrer"
          className="outfit-card__hero-wrap"
          aria-label="View outfit on Pinterest"
        >
          <img
            src={heroImageUrl}
            alt={`${outfit.name} outfit mood`}
            className="outfit-card__hero-img"
          />
          <span className="outfit-card__pinterest-badge">pinterest</span>
        </a>
      ) : (
        <div className="outfit-card__hero-placeholder">
          <span className="outfit-card__hero-placeholder-text">{outfit.name}</span>
        </div>
      )}

      {/* Outfit meta */}
      <div className="outfit-card__meta">
        <div className="outfit-card__meta-top">
          <span className="outfit-card__name">{outfit.name}</span>
          <span className="outfit-card__occasion">{outfit.occasion}</span>
        </div>
        {outfit.stylistNote && (
          <p className="outfit-card__stylist-note">{outfit.stylistNote}</p>
        )}
      </div>

      {/* Products horizontal scroll */}
      <div className="outfit-card__products">
        {outfit.items.map((item, i) => {
          const p = item.product;
          const inner = (
            <>
              {p?.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.title || item.piece}
                  className="outfit-product__img"
                />
              ) : (
                <div
                  className="outfit-product__img-placeholder"
                  style={{ background: item.colorHex ?? "#e8e0d8" }}
                />
              )}
              <div className="outfit-product__info">
                <span className="outfit-product__piece">{item.piece}</span>
                {p?.price && <span className="outfit-product__price">{p.price}</span>}
              </div>
            </>
          );

          if (p?.link) {
            return (
              <a
                key={i}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="outfit-product"
              >
                {inner}
              </a>
            );
          }
          return (
            <div key={i} className="outfit-product outfit-product--no-link">
              {inner}
            </div>
          );
        })}
      </div>

      {/* Color logic (collapsed detail) */}
      {outfit.colorLogic && (
        <p className="outfit-card__color-logic">{outfit.colorLogic}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update OutfitsChapter to use hero treatment for first outfit**

Find `function OutfitsChapter` and update it so the first outfit uses `isHero`:

```tsx
function OutfitsChapter({ data }: { data: FullReport["outfits"] }) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const occasions = ["all", ...Array.from(new Set(data.outfits.map((o) => o.occasion)))];
  const filtered =
    activeTab === "all" ? data.outfits : data.outfits.filter((o) => o.occasion === activeTab);

  return (
    <div className="sr__section">
      <ChapterHead num="07" title="your outfits" />

      {/* Occasion tabs */}
      <div className="sr__outfit-tabs">
        {occasions.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`sr__outfit-tab${activeTab === tab ? " sr__outfit-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Outfits list — first outfit gets hero treatment */}
      <div className="sr__outfits-list">
        {filtered.map((outfit, i) => (
          <OutfitCard
            key={outfit.name + i}
            outfit={outfit}
            isHero={i === 0 && activeTab === "all"}
          />
        ))}
      </div>

      {data.buildingPrinciple && (
        <p className="sr__section-body">{data.buildingPrinciple}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Add CSS for OutfitCard**

In `app/profile/style-report.css`, add the outfit card styles. Find the end of the file or an existing `.sr__outfit` block and add:

```css
/* ── Outfit Cards ──────────────────────────────────────────────────────── */

.sr__outfits-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 0 0 24px;
}

.outfit-card {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
  background: var(--color-surface);
}

.outfit-card--hero {
  border: 1.5px solid color-mix(in srgb, var(--color-text) 22%, transparent);
  box-shadow: 0 4px 24px color-mix(in srgb, var(--color-text) 8%, transparent);
}

.outfit-card__hero-wrap {
  display: block;
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  text-decoration: none;
}

.outfit-card--hero .outfit-card__hero-wrap {
  aspect-ratio: 2 / 3;
}

.outfit-card__hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}

.outfit-card__hero-placeholder {
  width: 100%;
  aspect-ratio: 3 / 4;
  background: color-mix(in srgb, var(--color-text) 5%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.outfit-card__hero-placeholder-text {
  font-family: var(--font-serif);
  font-size: 1.2rem;
  color: color-mix(in srgb, var(--color-text) 40%, transparent);
  text-align: center;
  padding: 16px;
}

.outfit-card__pinterest-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(230, 0, 35, 0.88);
  color: #fff;
  font-family: var(--font-sans);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  border-radius: 20px;
  pointer-events: none;
}

.outfit-card__meta {
  padding: 14px 16px 10px;
}

.outfit-card__meta-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.outfit-card__name {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  font-weight: 400;
  color: var(--color-text);
}

.outfit-card__occasion {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  color: color-mix(in srgb, var(--color-text) 55%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-text) 18%, transparent);
  border-radius: 20px;
  padding: 2px 8px;
}

.outfit-card__stylist-note {
  margin: 6px 0 0;
  font-family: var(--font-sans);
  font-size: 0.82rem;
  line-height: 1.45;
  color: color-mix(in srgb, var(--color-text) 70%, transparent);
}

/* Products horizontal scroll */
.outfit-card__products {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 16px 16px;
  scrollbar-width: none;
}
.outfit-card__products::-webkit-scrollbar { display: none; }

.outfit-product {
  flex: 0 0 110px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-text) 10%, transparent);
  text-decoration: none;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s;
}
.outfit-product:hover { border-color: color-mix(in srgb, var(--color-text) 30%, transparent); }
.outfit-product--no-link { cursor: default; }

.outfit-product__img {
  width: 110px;
  height: 110px;
  object-fit: cover;
  object-position: top center;
  display: block;
}

.outfit-product__img-placeholder {
  width: 110px;
  height: 110px;
  display: block;
}

.outfit-product__info {
  padding: 6px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.outfit-product__piece {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  color: var(--color-text);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.outfit-product__price {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--color-text) 65%, transparent);
}

.outfit-card__color-logic {
  padding: 0 16px 14px;
  font-family: var(--font-sans);
  font-size: 0.76rem;
  line-height: 1.4;
  color: color-mix(in srgb, var(--color-text) 50%, transparent);
  font-style: italic;
}

/* Outfit occasion tabs */
.sr__outfit-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 16px 16px;
  scrollbar-width: none;
}
.sr__outfit-tabs::-webkit-scrollbar { display: none; }

.sr__outfit-tab {
  flex: 0 0 auto;
  font-family: var(--font-sans);
  font-size: 0.78rem;
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid color-mix(in srgb, var(--color-text) 15%, transparent);
  background: transparent;
  color: color-mix(in srgb, var(--color-text) 65%, transparent);
  cursor: pointer;
  transition: all 0.15s;
}
.sr__outfit-tab--active {
  background: var(--color-text);
  color: var(--color-surface);
  border-color: var(--color-text);
}
```

- [ ] **Step 5: Commit**

```bash
git add components/profile/style-report-view.tsx app/profile/style-report.css
git commit -m "feat: OutfitCard hero UI — Pinterest mood image + horizontal product scroll"
```

**How to test:** Run `npm run dev`. Go to `/profile` with a saved `paletteme-style-analysis` in localStorage that includes a `fullReport`. Verify:
1. Outfit cards show the Pinterest mood image full-width above the outfit name
2. Products appear as a horizontal scrollable row
3. First outfit in the "all" tab has a slightly larger/bolder treatment
4. On mobile, the horizontal product scroll works without page-width overflow
5. Missing products (no imageUrl) show the color-hex placeholder square
6. Clicking a product card opens the shop link in a new tab

---

## Self-Review

### Spec coverage check

| Spec requirement | Covered by |
|---|---|
| Aesthetic selection in style-setup (1-2 from 8 options) | Task 1 |
| AI designs outfit blueprint as fashion editor | Task 2 (prompt) |
| Specific fabric + color + silhouette queries per item | Task 2 (SEARCH QUERY FORMAT enforcement) |
| Pinterest mood image per outfit | Task 4 + Task 5 |
| ShopStyle as primary product source | Task 3 + Task 5 |
| SerpAPI as fallback | Task 5 (`fetchProductWithFallback`) |
| First outfit as conversion moment (hero treatment) | Task 6 (isHero prop) |
| Horizontal product scroll per outfit | Task 6 (CSS) |
| Occasion tab filter | Task 6 (OutfitsChapter tabs) |
| Stylist note per outfit (personalized) | Already in schema; surfaced in Task 6 |
| Missing API keys never crash | Task 3 (checks SHOPSTYLE_UID), Task 4 (returns [] if no token), Task 5 (fetchProductWithFallback) |

### Potential issues

- **Circular import risk**: `lib/shopstyle.ts` imports from `lib/product-ranker.ts`. Both are pure utility files with no framework imports — this is safe. If the TypeScript compiler complains, inline `scoreProduct` logic directly in `searchFashionItem`.

- **pinterestQuery schema field**: The `StyleAnalysisOutputSchema` Zod schema must be updated in Task 2 Step 1 — without this change, the AI output will fail Zod validation and the route will throw. Double-check the schema name in `lib/style-analysis-schema.ts` before deploying.

- **10-question limit**: The "aesthetic" step is added to `STYLE_STEPS` but NOT to `QUIZ_STEPS`. The progress bar only counts `QUIZ_STEPS.length`, so this does not violate the hard cap.

- **heroImage type in StyleAnalysisResult**: The client-side `FullReport` type in `components/profile/style-report-view.tsx` (line ~170) already has `heroImage?: { imageUrl: string; pinLink: string; title: string | null } | null`. If it doesn't, add it to match the server-side schema.
