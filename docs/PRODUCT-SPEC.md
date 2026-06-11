# PaletteMe — Full Product Spec

> Source of truth for the full product vision, architecture, and build order.
> Landing page (`/`) is frozen — do not modify it. It exists only for waitlist collection.

---

## Tech Stack (Target)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) + Tailwind | Already in place |
| AI — Vision | OpenAI API (`gpt-4o-mini`) | Primary. Gemini as fallback (already wired in `lib/analysis.ts`) |
| Products | ShopStyle Collective API | Placeholder products until API key obtained |
| Database | Supabase (PostgreSQL) | For user profiles, saved items, product cache |
| Cache | Upstash Redis | Rate limiting + product cache TTL |
| Auth | Supabase Auth (email + Google OAuth) | Post-waitlist launch |
| Deployment | Vercel | |

---

## Color Analysis — Vision Prompt

Send selfie to OpenAI Vision (`gpt-4o-mini`). Return only JSON:

```json
{
  "undertone": "warm|cool|neutral",
  "contrast": "high|medium|low",
  "intensity": "bright|muted",
  "season": "True Winter",
  "confidence": 0.85,
  "best_colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5", "#hex6"],
  "avoid_colors": ["#hex1", "#hex2", "#hex3"],
  "neutrals": ["#hex1", "#hex2", "#hex3"],
  "explanation": "2-3 sentence explanation for the user"
}
```

Seasons (12 total):
True Spring · Warm Spring · Light Spring
True Summer · Cool Summer · Soft Summer
True Autumn · Warm Autumn · Deep Autumn
True Winter · Cool Winter · Deep Winter

---

## Onboarding Flow (3 steps)

### Step 1 — Color Season

**Path A (primary):** Camera / selfie upload → OpenAI Vision analysis
**Path B (fallback):** 8-question quiz for users who won't upload photo

Quiz questions (visual swatches, not just text):
1. Vein color on wrist (blue-purple = cool / green = warm / both = neutral)
2. Which metals suit you (gold / silver / both)
3. Skin reaction to sun (burn / tan / both)
4. Natural hair color (ashy/cool / warm/golden)
5. Eye color family (blue/grey/green = cool / brown/hazel/amber = warm)
6. Which background makes skin glow (pure white / cream)
7. Natural coloring contrast (high / medium / low)
8. Do colors look vivid or muted on you

### Step 2 — Body Type (3 questions, no camera)

1. Shoulders vs hips width
2. Waist definition (defined / not defined)
3. Where you gain weight first

Maps to: Hourglass · Pear · Apple · Rectangle · Inverted Triangle

Each body type → flattering silhouette tags used for product filtering.

### Step 3 — Style Swipe

Show 16 outfit image pairs, user picks preferred.
Derive style vector:

```typescript
interface StyleProfile {
  aesthetics: ('minimalist' | 'classic' | 'bohemian' | 'edgy' | 'romantic' | 'sporty' | 'preppy')[]
  fit: ('oversized' | 'tailored' | 'relaxed' | 'bodycon')[]
  occasions: ('casual' | 'office' | 'evening' | 'weekend' | 'activewear')[]
  priceRange: { min: number; max: number } // USD
}
```

---

## Pages

| Page | Path | Purpose |
|---|---|---|
| Landing | `/` | FROZEN. Waitlist only. Do not modify. |
| Onboarding | `/quiz` | 3-step flow: color → body → style |
| Profile | `/profile` | Season result, palette, body type, style tags |
| Feed | `/feed` | Ranked product recommendations |
| Saved | `/saved` | Wishlist / saved items |

---

## Database Schema (Supabase)

```sql
-- profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  color_season TEXT,
  undertone TEXT,
  contrast TEXT,
  intensity TEXT,
  best_colors TEXT[],      -- hex array
  avoid_colors TEXT[],
  neutrals TEXT[],
  body_type TEXT,
  style_vector JSONB,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- product_cache table
CREATE TABLE product_cache (
  id TEXT PRIMARY KEY,           -- key: "{season}:{category}:{page}"
  data JSONB,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- user_interactions table
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  product_id TEXT,
  action TEXT,                   -- 'click' | 'save' | 'dismiss'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Enable Row Level Security. Users can only read/write their own profile.

---

## ShopStyle API

```typescript
// Base: https://api.shopstyle.com/api/v2/products
// Required: pid=YOUR_UID

interface ShopStyleProduct {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  image: { sizes: { Best: { url: string } } }
  clickUrl: string        // affiliate link — use AS-IS, do not modify
  brandedName: string
  categories: { id: string; name: string }[]
  colors?: { name: string; canonicalColors: string[] }[]
}
```

**CRITICAL:** `clickUrl` must never be modified — commission tracking breaks if you change it.

Cache by `{season}:{category}:{page}` with 4-hour TTL. Fetch 100, score all, return top 20.

---

## Product Scoring Algorithm

Uses LAB color space for perceptual matching (install `d3-color`):

```typescript
import { lab } from 'd3-color'

function colorDistance(hex1: string, hex2: string): number {
  const c1 = lab(hex1)
  const c2 = lab(hex2)
  return Math.sqrt(
    (c1.l - c2.l) ** 2 + (c1.a - c2.a) ** 2 + (c1.b - c2.b) ** 2
  )
}

function colorScore(productColors: string[], palette: UserColorPalette): number {
  let score = 0
  for (const c of productColors) {
    const bestMatch = Math.min(...palette.best_colors.map(p => colorDistance(c, p)))
    const avoidMatch = Math.min(...palette.avoid_colors.map(p => colorDistance(c, p)))
    if (bestMatch < 20)      score += 1.0
    else if (bestMatch < 35) score += 0.6
    else if (avoidMatch < 20) score -= 0.5
    else                     score += 0.2
  }
  return Math.max(0, score / productColors.length)
}

// Final rank: color 50% · style 30% · body type 20%
function rankProduct(product: ShopStyleProduct, profile: UserProfile): number {
  return colorScore(product, profile.palette) * 0.50
       + styleScore(product, profile.style)   * 0.30
       + bodyTypeScore(product, profile.body) * 0.20
}
```

---

## Product Placeholders (until ShopStyle API)

Until ShopStyle UID is obtained, show curated static products per season from `lib/landing-data.ts`.
Cards link to generic retailer search (ASOS / Zara) — no commission, but flow looks real.

Do NOT show match score numbers to users — use visual dot indicators only (green / yellow / red).

---

## Environment Variables

```env
OPENAI_API_KEY=                    # Primary vision analysis
GEMINI_API_KEY=                    # Fallback vision analysis
SHOPSTYLE_UID=                     # ShopStyle affiliate UID (pending)
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Public key
SUPABASE_SERVICE_ROLE_KEY=         # Server-side only
UPSTASH_REDIS_REST_URL=            # Rate limiting + cache
UPSTASH_REDIS_REST_TOKEN=
TELEGRAM_BOT_TOKEN=                # Waitlist notifications (existing)
TELEGRAM_CHAT_ID=                  # Waitlist notifications (existing)
```

---

## Build Order

1. **Deploy landing** (`/`) as-is for waitlist — needs `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`
2. **Refactor `/quiz`** — 3-step onboarding (color → body → style), results saved to sessionStorage
3. **Add `/profile`** — shows season, palette, body type, style tags + placeholder products
4. **Wire OpenAI Vision** into Step 1 (camera path) — `lib/analysis.ts` already handles this
5. **Add Supabase** — user profiles persist after sign-in
6. **Add Supabase Auth** — email + Google OAuth
7. **Connect ShopStyle** — replace placeholder products with real scored feed
8. **Add `/feed`** — infinite scroll ranked recommendations
9. **Add `/saved`** — wishlist
10. **Add Upstash Redis** — rate limiting + 4h product cache
11. **Polish + animations**

---

## UX Rules

- Onboarding completable in under 3 minutes
- Camera analysis result in under 5 seconds
- Never show numeric scores — only visual dot indicators
- Every empty state has a clear CTA
- Mobile-first (majority of users on phone)
- Landing page photos: processed by OpenAI, immediately discarded, never stored
- All API keys server-side only, never exposed to client
