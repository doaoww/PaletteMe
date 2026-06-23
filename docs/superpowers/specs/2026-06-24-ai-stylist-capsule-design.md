# PaletteMe — AI Stylist Capsule Design
Date: 2026-06-24

## What We're Building

An AI personal stylist that analyzes the user's face, color season, body type, and desired aesthetic, then delivers a capsule wardrobe of 5 complete, genuinely stylish outfits with real shoppable products.

**Core promise:** "Upload your photo, pick your aesthetic — get outfits built for your specific face and coloring."

---

## User Flow

```
Landing → Face photo → 5-question quiz → Aesthetic selection → AI analysis → Capsule + outfits
```

1. **Face photo upload** — required, no registration yet
2. **5 questions** (tap-select, under 90 seconds):
   - Lifestyle / occasions (work / casual / going out / mix)
   - Budget tier (high street / mid / investment)
   - What you struggle with most (colors / silhouettes / mixing pieces)
   - How bold you want to go (minimal / balanced / statement)
   - Gender (women / men / non-binary)
3. **Aesthetic selection** — pick 1-2 from: old money / clean girl / soft feminine / streetwear / office siren / minimal luxury / dark romantic / coastal
   - Option A: select from aesthetic tags (with editorial image)
   - Option B: upload your own reference photos (optional, post-MVP)
4. **AI analysis** — face features + color season + Kibbe type + quiz answers + aesthetic
5. **Free result** — 1 complete outfit (mood photo + 2 products) + color season + contrast + metal
6. **Paywall** — "$7.99 — unlock your full capsule (5 outfits + shopping list)"
7. **Paid result** — 5 outfits + full palette + hair direction + shopping priority list

---

## The Outfit Engine — How Outfits Are Actually Styled

### Why outfits were bad before
Old approach: search for products → display them together → call it an outfit.
Result: random product grid with no coherence.

### New approach: AI editor first, search second

**Step 1 — AI designs the outfit blueprint (text only, fast):**

The AI acts as a fashion editor. It receives:
- Color season + Kibbe type + undertone + contrast level + metal
- Selected aesthetic (e.g. "old money")
- Occasion for this outfit
- Budget tier
- Gender

It outputs a complete outfit structure:
```json
{
  "name": "The Quiet Sunday",
  "occasion": "everyday",
  "colorLogic": "cream + ivory near face activates warm undertone, tan grounds the look",
  "lookEffect": "elongates leg line, face becomes focal point",
  "heroPiece": "wide leg cream trouser",
  "stylistNote": "As a Dark Autumn, ivory near your face makes your skin luminous. Cream trousers in a wide cut balance your proportions without adding bulk.",
  "items": [
    { "piece": "Wide leg cream linen trouser", "searchQuery": "wide leg cream linen trouser high waist minimal women", "colorHex": "#F5F0E8" },
    { "piece": "Ivory draped satin blouse", "searchQuery": "ivory draped satin blouse v-neck relaxed women minimal", "colorHex": "#FDFAF4" },
    { "piece": "Tan leather mule", "searchQuery": "tan leather mule pointed toe minimal women", "colorHex": "#C4956A" },
    { "piece": "Gold thin hoop earrings", "searchQuery": "gold thin hoop earrings minimal delicate", "colorHex": "#D4A843" }
  ]
}
```

**Step 2 — Parallel product + mood search:**

For each outfit blueprint, simultaneously:
- Pinterest: search `"{aesthetic} {occasion} outfit {color_palette} editorial"` → get hero mood image
- ShopStyle: search each item's `searchQuery` → get real product
- SerpAPI: fallback if ShopStyle result has no image or poor quality

**Step 3 — Rank and select best product per item:**

Score each result:
```
score = image_quality (has real product photo, not placeholder)
      + price_in_range (matches user's budget tier)
      + title_relevance (key words from searchQuery appear in product title)
      + brand_tier (known brand > noname)
```

Take top-1 per item slot. If nothing passes threshold → use SerpAPI fallback.

**Step 4 — Assemble and display:**

```
┌─────────────────────────────────┐
│  [Pinterest mood photo — tall]  │
│  "The Quiet Sunday"             │
│  everyday · Dark Autumn         │
├─────────────────────────────────┤
│  Stylist note (personalized)    │
├─────────────────────────────────┤
│ [trouser] [blouse] [mule] [earring] → │
│  $89       $45     $79    $28         │
│  ShopStyle ShopStyle SerpAPI ShopStyle│
└─────────────────────────────────┘
```

---

## The First Outfit Rule

The first outfit shown (free, before paywall) must be the absolute best:
- Occasion: "everyday" — most universally relevant
- Color: must use the user's near-face color (activates their specific undertone)
- Stylist note: must name something specific about their face/coloring — not generic
- Products: all 4 slots must have real images and real prices
- Pinterest photo: must visually match the aesthetic the user selected

If the first outfit doesn't impress → user doesn't pay. It is the conversion moment.

---

## Product Sources

| Source | Role | When to use |
|---|---|---|
| ShopStyle API | Primary fashion source | First attempt per item |
| SerpAPI Google Shopping | Fallback | When ShopStyle has no image or OOS |
| Pinterest | Mood images only | Hero photo per outfit (never products) |

ShopStyle query rules:
- Always include: fabric signal + color + silhouette + gender
- Never: generic category words alone ("top", "pants")
- Good: `"wide leg cream linen trouser high waist minimal women"`
- Bad: `"cream pants women"`

---

## Report Structure

### Free (mini-result):
- Style type badge: `Soft Natural · Dark Autumn`
- Essence line: one sentence about how they read visually
- Contrast level (low / medium / high) + what it means
- Metal: GOLD or SILVER — large, clear, one sentence why
- 1 complete outfit (mood photo + 2 products, other 2 blurred)
- Color: 3 main palette swatches

### Paid ($7.99 one-time):
- 5 complete outfits by occasion (all 4 products each)
- Full palette — 12 colors with wear frequency
- Hair direction — 2-3 specific cuts with search references
- 3 style mistakes to stop (with replacements)
- Shopping priority list — 5 items to buy first with price ranges

### Subscription ($9.99/mo):
- New capsule each month (new outfits, new season-appropriate pieces)
- Wardrobe scanner (Phase 2 — upload your items, get combinations)
- "Buy to complete" recommendations (Phase 3 — what's missing from your capsule)

---

## Aesthetic Options (MVP)

| Aesthetic | Description | Key brands to reference |
|---|---|---|
| old money | quiet luxury, neutral palette, quality fabrics | The Row, Loro Piana, Brunello |
| clean girl | minimal, effortless, neutral + white | Aritzia, Toteme, COS |
| soft feminine | romantic, floral, draped, blush tones | Zimmermann, Rouje |
| office siren | tailored, polished, powerful | Jacquemus, Sandro, Theory |
| minimal luxury | structured, monochrome, editorial | Arket, Massimo Dutti, COS |
| streetwear | relaxed, oversized, utilitarian | Nike, Stüssy, New Balance |
| dark romantic | rich colors, velvet, moody | Free People, & Other Stories |
| coastal | linen, light, relaxed, nautical | J.Crew, Mango, Vince |

---

## Technical Architecture

### New/Updated Routes

**`/api/capsule` (new):**
- Input: `{ season, kibbeType, undertone, contrastLevel, metalPrimary, aesthetic, occasions, budgetTier, gender }`
- Step 1: AI generates 5 outfit blueprints (one LLM call, structured output)
- Step 2: Parallel for each outfit:
  - Pinterest search → mood image
  - ShopStyle search × 4 items → products
  - SerpAPI fallback for any missing
- Step 3: Rank products, assemble response
- Output: 5 enriched outfits

**`/api/style-analysis` (update):**
- Add: trigger capsule generation after analysis completes
- Add: pass aesthetic selection into both analysis and capsule

### Updated Files

- `lib/shopstyle.ts` — improve query construction, add image quality filter
- `lib/serpapi.ts` — improve fashion query builder
- `lib/clients/pinterest.ts` — aesthetic-aware mood photo search
- `lib/prompts/report-composer.ts` — add aesthetic context to outfit blueprints
- `components/profile/style-report-view.tsx` — first outfit as hero (full-bleed, not card grid)
- `app/style-setup/` — add aesthetic selection step

### Ranker Improvements (`lib/product-ranker.ts`)

```typescript
function scoreProduct(product, query, budgetTier) {
  let score = 0;
  if (product.imageUrl && !product.imageUrl.includes('placeholder')) score += 40;
  if (priceInBudgetRange(product.price, budgetTier)) score += 20;
  if (queryWordsInTitle(product.title, query)) score += 30;
  if (knownBrand(product.merchant)) score += 10;
  return score; // threshold: 50+
}
```

---

## Monetization

| Tier | Price | What you get |
|---|---|---|
| Free | $0 | 1 outfit preview (2 products) + color season + contrast + metal |
| Full capsule | $7.99 one-time | 5 outfits + full palette + hair + mistakes + shopping list |
| Subscription | $9.99/mo | Monthly refresh + wardrobe scanner (Phase 2) + new analysis anytime |

Payment: Stripe Payment Links (already planned, no webhook needed for MVP).

---

## Roadmap

**Phase 1 — Now (2 weeks):**
- Fix outfit engine: AI blueprint first, then search
- Improve ShopStyle queries to fashion-editor quality
- Pinterest mood photos per outfit
- Aesthetic selection step in style-setup
- First outfit as hero (conversion moment)
- Contrast + metal visible in mini-result

**Phase 2 — Month 2:**
- Wardrobe scanner: upload 5-10 owned items
- AI: what outfits can you make + what's missing
- This is the subscription killer feature

**Phase 3 — Month 3:**
- "Buy to complete your wardrobe" — specific gap items with affiliate links
- Rakuten Advertising integration (if approved)
- Shareable Style DNA card

---

## What We're Not Building Now

- AI-generated try-on photos
- Wardrobe scanner (Phase 2)
- Rakuten API (waiting for approval)
- PDF report generation
- Email automation
