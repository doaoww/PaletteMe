# Look Lab — Design Spec

Date: 2026-06-24
Status: approved

## What Is Look Lab

Look Lab is the core paid product of PaletteMe. It takes the user's face photo and visually shows them in their correct versions — color season, metals, makeup, hair color, hairstyles — with real CV-based transformations on their actual face, not generic advice.

The key insight: instead of telling users "wear peach blush", we show them their own face with peach blush vs pink blush side by side. One sentence explains why. They see it instantly and believe it.

Look Lab is what we sell. The report IS Look Lab.

## Product Placement

**Free mini-result:** one card — best color season with draped face photo + one explanation sentence. Everything else locked.

**Paid report (9.99):** full Look Lab — all 6 blocks.

## The 6 Blocks

### Block 1 — Color Season

Multiple photos of the user's face side by side, each with a different color season draping applied via MediaPipe to the skin/collar region.

Layout:
- Main card (best season): centered, largest, confidence %, explanation in English
- 2 secondary cards (close alternatives): displayed below the main card, smaller, confidence %, short note in English

```
            [Soft Summer 99%]
   "Ashy pigment lifts your skin tone"

[True Summer 68%]     [Light Summer 51%]
 "Slightly warmer       "Too light —
  than your ideal"       you lose depth"
```

### Block 2 — Metals

Two photos side by side: gold overlay vs silver overlay near the face (collar/neck region). Percentage score derived from the warm/cool score of the color analysis.

```
[Gold 87% ✓]                      [Silver 41% ✗]
"Warm skin pigment amplifies       "Cool reflection
 gold naturally"                    dulls your complexion"
```

### Block 3 — Contrast

User's face photo converted to grayscale via Canvas API. Visually shows how far apart hair, skin, and eyes are on the value scale. One sentence output.

```
[B&W photo of user]
"High contrast — soft makeup disappears on you. Go bold or go home."
```

Grayscale is trivial (Canvas `filter: grayscale(100%)`) — no ML needed, instant.

### Block 4 — Makeup

Three sub-blocks, each with 3 photos side by side.

**Blush:**
```
[peach ✓]              [pink ✗]             [coral ~]
"Lifts warmth          "Drains colour        "Works but
 from your skin"        from your face"       reads harsh"
```

**Lips:**
```
[nude-rose ✓]    [berry ✓]       [bright red ✗]
```

**Eyeshadow:**
```
[bronze ✓]       [taupe ✓]       [cool grey ✗]
```

Each photo: MediaPipe FaceMesh landmarks → Canvas pixel transform on exact facial region.

### Block 5 — Hair Color

3 photos side by side, MediaPipe Selfie Segmentation isolates hair region, hue-shift applied per option.

```
[ashy blonde ✓]       [copper ✗]           [dark chestnut ~]
"Cool ash balances     "Too warm —           "Works but
 your undertone"        overheats the face"   loses lightness"
```

### Block 6 — Hairstyles

2–3 AI-generated photos (fal.ai FLUX/PhotoMaker) of the user with recommended hairstyle shapes. Generated once at report unlock, cached in Supabase Storage.

```
[user + lob ✓]            [user + long layers ✓]    [user + blunt bob ✗]
"Soft line balances        "Elongates the face,       "Shortens the neck,
 your cheekbones"           adds movement"             sharpens the jaw"
```

Reference haircut recommendations come from face shape analysis in `/api/style-analysis`. fal.ai applies them to the user's actual photo.

## Technology Stack

| Block | Technology | Cost | Speed |
|---|---|---|---|
| Color Season | MediaPipe FaceMesh + Canvas | Free | Instant |
| Metals | MediaPipe FaceMesh + Canvas | Free | Instant |
| Contrast | Canvas grayscale | Free | Instant |
| Makeup | MediaPipe FaceMesh landmarks | Free | Instant |
| Hair Color | MediaPipe Selfie Segmentation | Free | Instant |
| Hairstyles | fal.ai FLUX/PhotoMaker | ~$0.05/image | Generated once, then cached |

MediaPipe model bundle: ~2MB, loaded once when Look Lab mounts, cached by browser.

## AI Output Schema Extension

`/api/style-analysis` response needs a new `lookLab` field:

```typescript
lookLab: {
  colorSeason: {
    best: { season: string, confidence: number, drapingHex: string, explanation: string },
    alternatives: Array<{ season: string, confidence: number, drapingHex: string, explanation: string }>
  },
  metals: {
    gold: { score: number, explanation: string },
    silver: { score: number, explanation: string }
  },
  contrast: {
    level: "low" | "medium" | "high",
    explanation: string
  },
  blush: Array<{ name: string, hex: string, verdict: "best" | "okay" | "avoid", explanation: string }>,
  lips: Array<{ name: string, hex: string, verdict: "best" | "okay" | "avoid", explanation: string }>,
  eyeshadow: Array<{ name: string, hex: string, verdict: "best" | "okay" | "avoid", explanation: string }>,
  hairColor: Array<{ name: string, hex: string, verdict: "best" | "okay" | "avoid", explanation: string }>,
  hairstyles: Array<{ name: string, description: string, faceShapeReason: string, verdict: "best" | "okay" | "avoid" }>
}
```

## Component Structure

```
components/look-lab/
  look-lab.tsx                   ← main container, receives lookLab data + user photo
  look-lab-block.tsx             ← one named block (e.g. "Румяна")
  look-lab-card.tsx              ← single transformed photo card with label + explanation
  look-lab-contrast.tsx          ← B&W contrast block (special layout)
  use-mediapipe.ts               ← loads + initializes MediaPipe models once
  transforms/
    apply-draping.ts             ← color overlay on skin/collar region
    apply-lip-color.ts           ← lip region color fill via landmarks
    apply-blush.ts               ← cheek region color fill
    apply-eyeshadow.ts           ← eye region color fill
    apply-hair-color.ts          ← hue-shift on segmented hair region
```

## Data Flow

```
1. User completes style-setup → /api/style-analysis runs
2. Response includes lookLab spec (colors, verdicts, explanations)
3. Saved to localStorage + Supabase (miniResult free, lookLab gated)
4. User hits /profile → sees free color season card (1 card only)
5. User pays → /profile?paid=report → full Look Lab unlocks
6. LookLab component mounts → loads MediaPipe (~2MB, cached after first load)
7. MediaPipe processes user photo → applies transformations client-side
8. Hairstyle images: fal.ai call triggered server-side on first unlock → stored in Supabase Storage → subsequent views load from Supabase
```

## Free vs Paid Gate

**Free (mini-result):**
- Block 1 (Color Season): best season card only, no alternatives
- Blocks 2–6: locked with visible titles

**Paid:**
- All 6 blocks, full gallery per block

## Key Decisions

- Look Lab IS the paid report — not a section within it. The visual transformations are the product.
- One explanation sentence per card maximum. No lists, no bullet points. Short, direct, personal. Always in English.
- Verdicts use ✓ / ~ / ✗ not "recommended/okay/avoid" — visual not textual.
- Hairstyle photos generated once per user at unlock, not on every view.
- Contrast block uses B&W photo of the user's actual face — not swatches or diagrams.
- MediaPipe runs client-side. User photo never sent to a server for CV processing.

## What Is Not In Scope

- Real-time camera try-on (future subscription feature)
- Clothing color try-on (separate feature)
- Makeup product links (handled by existing Makeup report section)
- PDF export of Look Lab (post-Phase 1)
