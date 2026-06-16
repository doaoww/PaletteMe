# PaletteMe System Logic Reference

Date: 2026-06-13
Status: current implementation reference

Read this after `AGENTS.md` and before implementation work. This file describes how the app is intended to work end-to-end. Product strategy lives in `docs/PRODUCT-SPEC.md`; active task progress lives in `docs/TRACKER.yaml`.

## Current Product Model

PaletteMe has three user states:

1. Free user
   - Gets a useful color result.
   - Sees locked previews for deeper guidance.

2. Paid report user
   - Unlocks full color report through a Stripe Payment Link.
   - MVP unlock comes from `/profile?paid=report`.

3. Pro user
   - Unlocks outfit/product scanner through a subscription Payment Link.
   - MVP unlock comes from `/profile?paid=pro`.

Temporary launch note, 2026-06-15: scanner entry points are paused behind `NEXT_PUBLIC_SCAN_FEATURE_ENABLED` until scan accuracy is ready. With the flag omitted or false, `/scan` shows coming-soon copy and `/api/ai/scan` returns `SCAN_FEATURE_DISABLED`.

Affiliate links are a secondary revenue layer. Product links must continue working before affiliate approvals are complete.

## Application Flow

```text
/
  -> /quiz
  -> wardrobe type + style challenge
  -> quiz color evidence
  -> optional selfie confirmation
  -> analysis result
  -> /profile
  -> free result + locked report
  -> Stripe Payment Link
  -> /profile?paid=report
  -> full report unlocked
  -> Pro upsell
  -> scanner / feed / saved products
```

## Main Pages

| Page | Purpose |
| --- | --- |
| `/` | Landing, quiz CTA, waitlist |
| `/quiz` | Onboarding and selfie/color analysis |
| `/profile` | Result, paid report, Pro upsell |
| `/feed` | Product recommendations |
| `/saved` | Saved products |
| `/login` | Single account flow for saving/restoring profile |
| `/auth` | Legacy redirect to `/login` |
| `/dashboard` | Legacy URL that redirects to `/quiz` |

## Main API Routes

| Route | Purpose |
| --- | --- |
| `/api/analyze` | Existing analysis flow |
| `/api/analyze-photo` | GPT-4o selfie analysis and Supabase save |
| `/api/check-outfit` | Outfit/product color check |
| `/api/ai/scan` | Async scan route for clothing, outfit, makeup, and product screenshots |
| `/api/ai/jobs/[id]` | Poll async AI job status |
| `/api/wardrobe` | Save, list, and correct wardrobe items |
| `/api/outfits` | Start async outfit generation from saved wardrobe |
| `/api/products` | Product recommendations with demo/Supabase fallback |
| `/api/feed` | Feed products |
| `/api/interactions` | Product interactions |
| `/api/waitlist` | Waitlist signup and Telegram notification |
| `/api/waitlist/export` | Waitlist CSV export |
| `/api/auth/*` | Supabase callback, anonymous-profile linking, sign out |
| `/api/admin/add-product` | Manual product insertion |

## Data Storage

Client storage:

| Key | Purpose |
| --- | --- |
| `paletteme_quiz_result` | Full quiz profile in sessionStorage |
| `palette_user_id` | Anonymous Supabase user id in localStorage |
| `palette_quiz` | Lightweight quiz snapshot |
| `palette_colortype` | Macro season |
| `palette_best_colors` | Best color array |
| `paletteme_saved` | Saved product list |

Payment MVP storage:

The first launch may use local browser flags for paid/pro unlocks after Stripe success redirects. This is for demand testing only. Secure entitlements require Stripe webhooks and Supabase.

Supabase:

- Anonymous users/profile data.
- Products.
- Waitlist.
- Outfit checks.
- Saved/interactions depending on current implementation.

## Auth Logic

Auth is progressive and should not block the first quiz or result.

- `/login` is the only visible auth UI.
- `/auth` redirects to `/login` for old links.
- `/api/auth/callback` is the canonical Supabase OAuth/email callback.
- `/auth/callback` forwards to `/api/auth/callback` for backward compatibility.
- `proxy.ts` refreshes Supabase sessions on requests using `@supabase/ssr`.
- `/api/auth/link` connects the anonymous quiz/profile row to the Supabase auth user after login.
- `/api/auth/sign-out` clears the Supabase session.
- Use `lib/auth-flow.ts` for callback URLs and safe `next` redirects.

## Payment Logic

Payment links are configured through public env vars:

```env
NEXT_PUBLIC_PAID_REPORT_URL=
NEXT_PUBLIC_SUBSCRIPTION_URL=
```

Rules:

- Missing payment URL should show a disabled/unavailable state, not a broken link.
- Paid report success redirects to `/profile?paid=report`.
- Pro subscription success redirects to `/profile?paid=pro`.
- Do not treat local unlock as secure after launch validation.

## Affiliate Logic

Planned affiliate env vars:

```env
AFFILIATE_ENABLED=false
AFFILIATE_NETWORK=
RAKUTEN_SITE_ID=
RAKUTEN_ASOS_MID=
AWIN_PUBLISHER_ID=
AWIN_ASOS_MID=
AMAZON_ASSOCIATE_TAG=
```

Rules:

- Product URLs must work if affiliate env vars are missing.
- Supported URLs can be wrapped when matching env vars exist.
- Unsupported URLs should pass through unchanged.
- Product UI must include affiliate disclosure.

## AI Logic

Use server-side AI only.

- `/quiz` now builds a deterministic quiz color prior before asking for a selfie. `lib/quiz.ts` scores warm/cool, light/deep, and bright/muted evidence from observable answers, then stores `quizColorEvidence` and `quizConfidence` on the profile.
- Quiz-only warm, deep, muted evidence should prefer Autumn / Dark Autumn instead of Winter unless cool or bright evidence is stronger.
- The quiz asks wardrobe type and style challenge before color questions. These fields are included in `formatProfileForAI()` so scan/outfit prompts know whether the user shops menswear, womenswear, both, or unisex, and what problem they want solved first.
- Selfie upload remains optional. The quiz shows a photo decision screen after the quiz prior: upload a selfie for confirmation or get the result now.
- Legacy selfie/outfit routes may still use GPT-4o or Gemini fallback.
- Color analysis uses Accuracy Gate v1: no human face, missing quality metadata, poor lighting, heavy filters, strong color cast, covered face, or low confidence must ask for a retake instead of returning a season.
- `/api/analyze` uses Hybrid Color Algorithm v1: OpenAI Responses API extracts structured evidence, then `lib/color-season-scoring.ts` scores all 12 sub-seasons. The model's own season label is only a weak hint.
- Color analysis model selection is `OPENAI_COLOR_ANALYSIS_MODEL`, then `OPENAI_STYLE_MODEL`, then `gpt-5.4`. Legacy chat fallback can use `OPENAI_COLOR_ANALYSIS_LEGACY_MODEL` or `gpt-4o`.
- The Dark Autumn vs True Winter calibration case is covered by `lib/analysis.test.ts`; deep warm earthy evidence should prefer Dark Autumn / Deep Autumn over Winter.
- `/api/analyze` returns HTTP 422 with a user-facing `message` for retake/no-face cases.
- New style/scan backend uses `lib/server/openai.ts` with the OpenAI Responses API and Zod structured outputs.
- Heavy scan/outfit work should use async jobs from `lib/server/ai/jobs.ts` so mobile UI can poll instead of freezing.
- Gemini fallback can remain where already wired.
- Never expose API keys to the client.
- Never import server-only analysis code into client components.
- Routes using AI SDKs should use Node runtime.
- Analysis results should include evidence, photo quality metadata, confidence, and closest alternative seasons.
- Selfie capture UI lives in `components/selfie/selfie-capture.tsx`; `/quiz` is the only active selfie analysis page.
- `choose photo` opens a normal image picker. `take photo` uses live `getUserMedia` webcam capture and is hidden when the browser cannot support real camera access.

## Product Matching

Current matching can use a mix of:

- Season tags.
- Style tags.
- Body type.
- Palette colors.
- Demo fallback products from `lib/landing-data.ts`.

Do not claim product ranking is precise unless the route actually uses season palette colors for scoring.

## Privacy

Approved copy:

> Photos are processed securely for analysis. PaletteMe does not sell or share your images.

Do not claim photos never leave the device.

## Known Issues To Fix Before Launch

- Blocking ESLint errors.
- Old privacy copy in landing/social proof.
- Product ranking claims that exceed current implementation.
- Payment and affiliate env handling not implemented yet.
- Supabase RLS/admin policies need production review.
