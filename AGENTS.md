# AGENTS.md - PaletteMe

This file is the source of truth for AI agents working on this codebase. Read it before code edits.

## Current Docs Order

Use these in order:

1. `AGENTS.md` - agent rules, product direction, hard constraints.
2. `LOGIC.md` - current implementation reference.
3. `docs/TRACKER.yaml` - active plan progress.
4. `docs/PRODUCT-NORTH-STAR.md` - current product goals, principles, and feature direction.
5. `docs/PRODUCT-SPEC.md` - current product spec.
6. `docs/systems/free-testing-mode/README.md` - current unlocked testing mode.
7. `design/PaletteMe-style-guide.md` - UI style guide.
8. `docs/report-writing-spec.md` - **read before any work on the AI report prompt or report UI**. Single source of truth for how every section must be written.

If docs disagree, update the stale doc before implementing.

---

## BRD - Business Requirements

### What Is PaletteMe?

PaletteMe is an AI personal stylist. It analyzes your face, body, and style preferences, then delivers a complete personalized style map: face typology, haircut direction, color palette, body recommendations, ready-to-wear outfits, and a shopping list — all in one report built specifically for you.

Color analysis was the original entry point. The durable product is the full AI stylist: face-first analysis, 9-section paid report, and a living subscription stylist.

### Problem

Nobody tells people what actually works for their specific face and body. Professional image consulting costs hundreds of dollars. Free quizzes give generic advice. Users keep buying clothes that look wrong and can't explain why.

### Solution

Upload a face photo, answer 10 quick questions, get a free mini-preview that feels real, then unlock a full personalized style map. The mini-result creates desire; the full report delivers concrete action. The subscription keeps the stylist active.

### Business Goals

- Prove that AI face + body analysis is accurate enough to feel personal and specific.
- Reach `1000+ MRR` through paid one-time reports (4.99–9.99) and Pro subscription (9.99/mo).
- Use affiliate links in the shopping list as secondary revenue once approvals arrive.
- Establish PaletteMe as the AI personal stylist people trust before buying or wearing anything.

### Revenue Model

Free:

- Face photo upload + quick quiz.
- Free mini-result: face typology, 2 strengths, 2 mistakes, "how people read you", 1 hair hint, 1 color family, 1–2 silhouettes.
- Locked section titles visible (creates desire to unlock).

Paid report (one-time):

- Launch price: `4.99` to `9.99`.
- Full 9-section style map: appearance, hair, color, body, style direction, clothing with images, style mistakes, ready outfits (lookbooks), shopping list with links.

Pro subscription:

- Launch price: `9.99/mo`.
- Monthly style refresh, new outfit ideas, item scan ("buy or skip"), outfit scan, weekly outfit picks, monthly capsule wardrobe, new photo analysis anytime.

Affiliate:

- Product links in shopping list must be affiliate-ready but work without affiliate env vars.

---

## PRD - Product Requirements

### Core User Flow

```text
Landing
  -> Register (Google or email) — required before analysis
  -> Upload face photo
  -> Upload body photo (optional) OR select body type from visual cards
  -> Quick quiz (10 tap-select questions, < 2 min)
  -> Free mini-result (strong preview with hooks)
  -> Paywall: "Your full style map is ready"
  -> Pay -> Full 9-section report with images
  -> Scan items / subscription
```

### Pages

| Page | Path | Purpose |
| --- | --- | --- |
| Landing | `/` | Promise, how it works, CTA |
| Login / Register | `/login` | Google or email auth |
| Style Setup | `/style-setup` | Face photo + body + 10-question quiz |
| Profile / Report | `/profile` | Mini-result + paywall + full 9-section report |
| Feed | `/feed` | Personalized product recommendations |
| Saved | `/saved` | Saved products and scan history |
| Auth redirect | `/auth` | Legacy redirect to `/login` |
| Dashboard | `/dashboard` | Legacy redirect to `/style-setup` |
| Quiz | `/quiz` | Legacy color quiz — secondary entry, redirect to `/style-setup` |

Future:

| Page | Path | Purpose |
| --- | --- | --- |
| Wardrobe | `/wardrobe` | Owned items with editable AI labels |
| Scans | `/scans` | Scan history |
| Outfit Builder | `/outfits` | Build outfits from wardrobe |

### Phase 1 MVP Features (Rebrand Core)

- Registration required before face photo upload.
- Face photo upload in `/style-setup` with good/bad photo example.
- Body photo upload (optional) OR visual body type selector.
- 10-question quick quiz, all tap-select, < 2 min total.
- AI analysis route `/api/style-analysis`: face + body + quiz → mini-result + full report (one call, two output tiers).
- Free mini-result: typology, 2 strengths, 2 mistakes, "how people read you", 1 hair hint, 1 color, 1–2 silhouettes.
- Paywall after mini-result with visible locked section titles.
- Paid full report (9 sections, with images for clothing and outfits).
- Updated landing page: new promise, new flow explanation.

### Post-Phase-1 Features

- Stripe webhooks + Supabase entitlement table.
- Scan Anything (item, outfit, makeup, product screenshot).
- Wardrobe matchmaker (5–10 owned items, AI labels, user corrections, outfit builder).
- Buy-with-my-closet scanner.
- Makeup scanner.
- Monthly subscription refresh jobs.
- PDF report generation.
- Email lifecycle automation.
- Affiliate feed ingestion.

### Seasons

Season names, palette colors, and season metadata live in `lib/landing-data.ts` under `SEASONS`. Do not hardcode season names or palette arrays elsewhere unless the value is clearly UI copy or test data.

---

## TRD - Technical Requirements

### Stack

| Layer | Package | Notes |
| --- | --- | --- |
| Framework | Next.js 16 / React 19 | App Router |
| Styles | Tailwind v4 | CSS-first config via `@theme inline` |
| Image AI | OpenAI Responses API + legacy GPT-4o/Gemini fallback | New scan/outfit routes use `lib/server/openai.ts`; legacy routes can keep GPT-4o/Gemini until migrated |
| Database/Auth | Supabase | Profiles, products, saved data, auth |
| Payments now | Stripe Payment Links | Fast validation, no webhook required |
| Payments later | Stripe Checkout + webhooks | Secure entitlements after demand is proven |
| Affiliate | Custom URL wrapper | Rakuten/Awin/Amazon env-driven wrapping |
| Validation | Zod v4 | Import `z` from `zod` |

### Payment Env Vars

```env
NEXT_PUBLIC_PAID_REPORT_URL=
NEXT_PUBLIC_SUBSCRIPTION_URL=
```

These are public URLs, not secrets.

### Affiliate Env Vars

```env
AFFILIATE_ENABLED=false
AFFILIATE_NETWORK=
RAKUTEN_SITE_ID=
RAKUTEN_ASOS_MID=
AWIN_PUBLISHER_ID=
AWIN_ASOS_MID=
AMAZON_ASSOCIATE_TAG=
```

Missing affiliate env vars must never break product links.

### AI Rules

- Never call AI providers directly from client components.
- Never expose API keys to the client.
- Keep AI routes on Node runtime.
- Keep photo privacy copy truthful.
- AI results must include confidence, reason, and practical next action.
- User corrections must override AI guesses.
- Do not reject most user clothes. Explain how to use, balance, or replace them.
- Color analysis must use structured evidence plus deterministic scoring; do not let a model's season label override warm/cool/depth evidence.

Approved privacy copy:

> Photos are processed securely for analysis. PaletteMe does not sell or share your images.

Do not say photos never leave the device.

### Styling Rules

Read `design/PaletteMe-style-guide.md` before UI work.

- Use DM Serif Display at weight 400 only.
- Use DM Sans for body/UI.
- Use Allura only for script flourish spans.
- Buttons and nav text stay lowercase with `letter-spacing: 0`.
- Do not create `tailwind.config.js`.
- Tailwind v4 tokens live in `app/globals.css`.

### Next.js Rules

This project uses Next.js 16. Before touching routing, middleware/proxy, route handlers, Suspense boundaries, or data-fetching conventions, check local Next docs in `node_modules/next/dist/docs/`.

Known Next 16 issue:

- `middleware.ts` is deprecated in favor of `proxy.ts`.
- Client pages using `useSearchParams()` must be wrapped in Suspense.

---

## Documentation Convention

All active feature plans live under `docs/plans/`.

Every plan folder must include:

- `plan.md`
- `diagram.excalidraw`
- `blockers.excalidraw`
- at least one task file

`docs/TRACKER.yaml` is the plan progress source of truth.

Status values:

- Plan: `planned`, `in-progress`, `shipped`
- Task: `pending`, `in-progress`, `done`

Update `docs/TRACKER.yaml` when plan/task state changes.

Current active plan:

- `docs/plans/2026-06-20-ai-stylist-rebrand/`

---

## Code Safety Rules

- Do not revert user changes.
- Do not delete dirty/untracked files unless the user explicitly asks.
- Use `apply_patch` for manual file edits.
- Do not import `lib/analysis.ts`, Supabase server helpers, Telegram helpers, or Playwright code into client components.
- API routes using Node SDKs must export `runtime = "nodejs"`.
- Always close Playwright browsers in `finally`.
- Avoid raw hardcoded design colors in UI unless they are actual palette/product swatches.
- Keep product links working even when affiliate programs are not approved yet.

---

## ADR - Decision Log

### ADR-001 - Tailwind v4 CSS-first config

Date: 2025-01-01
Status: accepted
Decision: Use CSS-first Tailwind v4 tokens in `app/globals.css`. Do not create `tailwind.config.js`.

### ADR-002 - GPT-4o for serious image analysis

Date: 2026-06-13
Status: accepted
Context: Color undertone and outfit matching are subtle visual tasks.
Decision: Use GPT-4o for serious selfie/outfit analysis. Keep Gemini fallback where already wired.
Consequences: Documentation and code should not claim Gemini-only architecture.

### ADR-003 - Stripe Payment Links before full billing

Date: 2026-06-13
Status: accepted
Context: The fastest risk to validate is whether users will pay.
Decision: Use Stripe Payment Links for paid report and Pro subscription in the first monetization launch.
Consequences: MVP unlock can be redirect/local-state based. After demand is proven, add Stripe webhooks and Supabase entitlements.

### ADR-004 - Affiliate wrapper before affiliate feed ingestion

Date: 2026-06-13
Status: accepted
Context: Affiliate approvals are pending and should not block launch.
Decision: Add a URL wrapper that returns original links when affiliate env vars are missing.
Consequences: Product links remain usable before approval and become trackable after env vars are added.

### ADR-005 - Supabase for persistence, local fallback only for development

Date: 2026-06-13
Status: accepted
Context: Serverless filesystems are not reliable persistence.
Decision: Supabase is the preferred persistence layer. Local file fallback is development-only.
Consequences: Production features should not depend on `lib/waitlist-store.ts`.

### ADR-006 - Style operating system direction

Date: 2026-06-13
Status: accepted
Context: Competitor reviews show users are frustrated by inaccurate wardrobe recognition, bad outfit generation, narrow womenswear assumptions, poor size diversity, and lack of manual control.
Decision: PaletteMe should move toward a broader style assistant for all style-conscious people. Color analysis remains the entry point, but the durable product is Scan Anything, wardrobe matching, makeup scanning, and buy-with-my-closet decisions.
Consequences: New features must support men, women, nonbinary users, unisex styling, optional makeup, editable AI labels, and practical verdicts instead of rigid rejections.

### ADR-007 - Accuracy and free testing before monetization

Date: 2026-06-13
Status: accepted
Context: The user wants all features unlocked to test whether the AI is accurate before asking for payment.
Decision: Keep current product work in free testing mode until quiz, selfie, scanner, and wardrobe features are trustworthy.
Consequences: Payments stay dormant. Do not optimize paywalls before accuracy, mobile UX, and scan usefulness are proven.

### ADR-008 - OpenAI Responses API for new style intelligence backend

Date: 2026-06-13
Status: accepted
Context: New scan, wardrobe, and outfit features need stable structured outputs, prompt caching, and async job handling.
Decision: Use `lib/server/openai.ts` with the OpenAI Responses API and Zod structured outputs for new style intelligence routes. `OPENAI_STYLE_MODEL` can override the model; default is `gpt-5.5`.
Consequences: New frontend work should call `/api/ai/scan`, `/api/ai/jobs/[id]`, `/api/wardrobe`, and `/api/outfits` instead of adding provider calls inside components. Legacy `GPT-4o`/Gemini routes remain until intentionally migrated.

### ADR-009 - Progressive Supabase auth with one login surface

Date: 2026-06-13
Status: accepted
Context: PaletteMe needs saved profiles and history, but auth should not block quiz completion or first results.
Decision: Use Supabase Auth progressively. `/login` is the only visible auth UI, `/api/auth/callback` is the canonical callback, `/auth` and `/auth/callback` remain compatibility redirects, and Next 16 `proxy.ts` refreshes sessions.
Consequences: Do not rebuild a second auth page. Use `lib/auth-flow.ts` for callback URLs and safe post-login redirects.

### ADR-010 - Accuracy Gate v1 for color analysis

Date: 2026-06-13
Status: accepted
Context: Users lose trust when non-human images or bad selfies produce confident color-season results.
Decision: `/api/analyze` must pass model output through `lib/analysis-normalizer.ts`. Non-human uploads, missing quality metadata, bad lighting, heavy filters, strong color cast, covered face, and low confidence return a retake/no-face message instead of a season.
Consequences: Never bypass the normalizer when adding analysis providers. Results should include photo quality, evidence, confidence, and closest alternative seasons.

### ADR-011 - Hybrid color evidence scoring

Date: 2026-06-13
Status: accepted
Context: A real calibration case was mislabeled True Winter even though visible evidence pointed to Dark Autumn / Deep Autumn. Dark warm users are commonly confused with Winter when the app over-weights dark hair and contrast.
Decision: `/api/analyze` uses OpenAI Responses API structured evidence first, then `lib/color-season-scoring.ts` deterministically scores all 12 sub-seasons. The model's season label is only a weak hint; traits and evidence decide the final result.
Consequences: Deep warm earthy evidence should prefer Dark Autumn over True Winter. Keep `lib/analysis.test.ts` regression coverage for this case.

### ADR-012 - One selfie capture flow

Date: 2026-06-13
Status: accepted
Context: Multiple upload surfaces confused the product and duplicated analysis UI.
Decision: `/quiz` is the canonical selfie analysis flow. `/dashboard` redirects to `/quiz`; upload/camera behavior lives in `components/selfie/selfie-capture.tsx`.
Consequences: Do not add new selfie upload surfaces. Add capture improvements to the reusable component. Do not implement desktop camera by clicking a hidden `capture="user"` file input; desktop browsers can treat that as upload. Use live `getUserMedia` capture or hide the camera action.

### ADR-013 - Quiz-first product2 foundation

Date: 2026-06-14
Status: accepted
Context: The product2 direction requires value before permissions, support for menswear/womenswear/unisex users, and stronger quiz evidence before optional selfie confirmation.
Decision: `/quiz` starts with wardrobe type and style challenge, then builds a deterministic color prior from observable answers. Selfie upload is offered after the quiz as an accuracy boost.
Consequences: Do not move selfie upload back to the first screen. New style intelligence should use `quizColorEvidence`, `quizConfidence`, `wardrobeType`, and `styleChallenge` when present.

### ADR-014 - Registration required before viewing quiz results

Date: 2026-06-17
Status: accepted
Context: Deployment testing showed the team wants signed-in accounts attached to every saved result rather than relying on anonymous local-storage profiles.
Decision: `components/quiz/quiz-flow.tsx` renders `PostQuizAuthScreen` with no `onSkip` once the quiz finishes, so users must sign in or create an account before being routed to `/profile`. The deterministic quiz prior (and the optional pre-result selfie analysis) still run and save to `localStorage` before this screen renders, so analysis itself stays login-free; only navigating to the results page requires auth.
Consequences: This supersedes the "see results before signing in" framing in ADR-009/ADR-013. Do not add a skip option back without an explicit product decision, since the two ADRs above no longer reflect the live quiz-completion flow.

### ADR-015 - AI Stylist Rebrand: face-first analysis with 9-section paid report

Date: 2026-06-20
Status: accepted
Context: Color season analysis alone is too narrow. Users want to know what works for their face and body, not just their undertone. A full AI stylist product with face photo analysis, concrete hair/silhouette/outfit recommendations, and a clear paywall after a strong free preview has higher trust and conversion potential than the current quiz-only color result.
Decision: Rebuild the core product around face photo analysis. New route `/style-setup` replaces `/quiz` as the primary onboarding. New AI route `/api/style-analysis` produces a mini-result (free) and a 9-section full report (paid) from one structured AI call. The `/profile` page shows mini-result, then paywall, then full report. The old `/quiz` color analysis is preserved as a secondary entry point and feeds into report section 3 (Color).
Consequences: `/style-setup` is the new canonical onboarding. `/quiz` and `/dashboard` redirect there. The AI prompt and Zod schema for `style-analysis` must cover all 9 report sections. Images in the clothing and outfit sections require product/lookbook images (via search or curated). Do not bypass the mini-result paywall gate.

### ADR-016 - Face photo required, body photo optional

Date: 2026-06-20
Status: accepted
Context: Face photo is the foundation of the AI analysis (typology, features, hair direction, color reading). Body photo improves silhouette accuracy but creates friction for users who are not comfortable showing their body.
Decision: Face photo upload is required before the quiz. Body photo is optional — the alternative is a visual body type selector (silhouette cards). Both paths produce valid analysis; body photo path has higher silhouette accuracy. The UI must treat both as equal and not shame users who skip the body photo.
Consequences: `/api/style-analysis` must handle missing body photo gracefully and rely on quiz self-report (height, body area goals, body type selection) instead. Do not block analysis when body photo is absent.

### ADR-017 - Short quiz as the only pre-analysis questionnaire

Date: 2026-06-20
Status: accepted
Context: Long quizzes lose users midway. The previous color quiz had 12+ questions including self-diagnosis questions (undertone, contrast) that users cannot reliably answer. The new quiz must be short enough that users can complete it in under 2 minutes, with every question answerable in 3 seconds.
Decision: The new `/style-setup` quiz has exactly 10 tap-select questions. No dropdowns. No long text. One question per screen with a progress bar. No self-diagnosis questions — only observable facts and stated preferences. See `docs/PRODUCT-SPEC.md` for the full question list.
Consequences: The 10-question limit is a hard cap. If new data is needed, replace an existing question rather than adding one. Observable color facts (skin tone, hair color, eye color) are collected from the face photo analysis, not the quiz.

### ADR-018 - Auth-gated, DB-locked report and image generation

Date: 2026-07-01
Status: accepted
Context: `/api/report/analyze` and `/api/report/generate-visual` had no authentication, no persistence, and no concurrency control — anyone could call them directly, unlimited times, for free OpenAI/Replicate spend, and the generated report only lived in `localStorage`, so clearing storage silently re-triggered full regeneration.
Decision: Both routes now require a Supabase session (401 otherwise) and use an atomic claim/lock (`lib/server/generation-lock.ts`) against two new tables, `style_reports` (one row per user, MVP-intentional) and `report_visuals` (one row per user+slot), before calling OpenAI or Replicate. A completed row is always served from cache; a `generating` row blocks duplicate calls; a `failed` or stale (>15 min) row can be safely reclaimed, capped at 5 attempts. Image prompts are rebuilt server-side from the stored report — the client sends only a `slotId`, never a prompt string. `/style-setup` gates the "create my report" action behind sign-in (reusing the same no-skip pattern as ADR-014). `/profile` reads `style_reports` as source of truth; `localStorage` is a paint cache only.
Consequences: No endpoint that calls a paid AI provider should ever skip the auth check or the claim/lock pattern going forward — new AI routes must reuse `lib/server/generation-lock.ts` rather than inventing a new caching scheme. Multi-report-per-user support requires a schema migration (see the comment in `supabase/migrations/20260701120000_create_style_reports.sql`), not just new application code.

---

## Feature Changelog

### Initial build - Core app

Built landing page, dashboard selfie upload, color analysis, seasonal result display, and waitlist signup.

### 2026-06-08 - Dedicated color quiz funnel

Built `/quiz` flow with quiz result storage and dashboard gating.

### 2026-06-08 - Full onboarding quiz

Expanded quiz into color, body, style, trend, and selfie flow.

### 2026-06-13 - Monetization and affiliate launch plan

Added current docs/spec direction for free result, paid report, Pro scanner, Stripe Payment Links, and affiliate wrapper.

### 2026-06-13 - Product north star update

Saved the current strategy in `docs/PRODUCT-NORTH-STAR.md`: mobile-first quiz, optional selfie, inclusive styling, Scan Anything, wardrobe matchmaker, makeup scanner, buy-with-my-closet, AI accuracy, user correction, and free testing before monetization.

### 2026-06-13 - AI backend foundation

Built the design-independent backend foundation for Scan Anything, wardrobe corrections, async AI jobs, OpenAI Responses structured outputs, and outfit-generation contracts.

### 2026-06-13 - Supabase auth cleanup

Consolidated auth into `/login`, canonicalized Supabase callbacks through `/api/auth/callback`, moved session refresh to `proxy.ts`, added sign out, and documented progressive auth rules.

### 2026-06-13 - Accuracy Gate v1

Added a no-face and photo-quality gate for color analysis, richer analysis evidence, closest alternatives, and user-facing retake messages instead of fake season results.

### 2026-06-13 - Hybrid Color Algorithm v1

Added OpenAI Responses API structured evidence extraction, deterministic 12-season scoring, and a Dark Autumn vs True Winter regression test.

### 2026-06-13 - Single selfie capture flow

Added native camera capture to `/quiz`, removed legacy dashboard analysis UI, deleted unused quiz selfie UI, and redirected `/dashboard` to `/quiz`.

### 2026-06-13 - Desktop camera capture fix

Replaced the duplicate desktop camera file-picker behavior with live `getUserMedia` webcam capture and hid the take-photo action when webcam capture is unsupported.

### 2026-06-14 - Product2 Phase 1 quiz result foundation

Added wardrobe type, style challenge, skin tone, detailed eye/hair answers, deterministic quiz color evidence, quiz confidence, and the optional selfie decision screen after the quiz result prior. Warm/deep/muted quiz evidence now prefers Dark Autumn over Winter.

### 2026-06-17 - Scan feature fix and quiz sub-season corrections

Turned on `NEXT_PUBLIC_SCAN_FEATURE_ENABLED` and fixed the actual bug blocking every scan: `lib/server/openai.ts` sent an explicit `temperature: 0` to the OpenAI Responses API, which `gpt-5.5` (and `gpt-5.4`, the analyze-route default) rejects outright. This also meant `/api/analyze` had been silently falling back to the legacy GPT-4o path on every request instead of using the ADR-011 hybrid evidence scorer. Also fixed `lib/quiz.ts`'s `mapAxesToSeason`: warm+deep evidence was labeled "Deep Autumn", a name that does not exist in `lib/season-palettes.ts`'s 12-season database (breaking palette lookups for those users); it now always resolves to the real "Dark Autumn" entry. Cool+deep+high-contrast+bright evidence now resolves to "Bright Winter" instead of "True Winter" to match the database and existing tests. Added a registration-before-results decision record as ADR-014.

### 2026-06-20 - AI Stylist Rebrand (product direction reset)

Rewrote product direction: PaletteMe is now an AI personal stylist, not a color analysis quiz. New flow: register → face photo → body photo (optional) / body type selector → 10-question quiz → free mini-result → paywall → full 9-section paid report. New AI route `/api/style-analysis` produces both mini-result and full report from one structured call. New page `/style-setup` owns the onboarding. Color analysis is preserved as a sub-component of report section 3 (Color). Updated `docs/PRODUCT-NORTH-STAR.md`, `docs/PRODUCT-SPEC.md`, `AGENTS.md`. Added ADR-015, ADR-016, ADR-017.

### 2026-07-01 - Money-leak protection for report/image generation

Closed an unauthenticated-abuse hole where `/api/report/analyze` and `/api/report/generate-visual` could be called directly, unlimited times, with no auth and no persistence. Added `style_reports` and `report_visuals` Supabase tables with RLS, a shared atomic claim/lock module (`lib/server/generation-lock.ts`), auth requirements on both routes, server-side prompt reconstruction for image generation (client sends only `slotId`), a sign-in gate in `/style-setup` before report generation, and made `/profile` read Supabase as the source of truth instead of `localStorage`. See ADR-018.

---

## Gotchas

### Docs can drift

If a doc says "single source of truth" but conflicts with current code and `docs/TRACKER.yaml`, fix the doc before building.

### Payment Links are an MVP shortcut

They are good for fast payment validation. They are not a secure entitlement system. Use webhooks later.

### Affiliate approval is not required for product links

The app must keep normal product links working until affiliate IDs are available.

### Privacy wording matters

Photos are sent to server-side AI providers for analysis. Do not write copy that says otherwise.

### Auth is progressive, but results now require an account

Quiz answers and the optional pre-result selfie analysis still run without signing in, and the prior is saved to `localStorage` immediately. As of ADR-014, viewing the results page itself requires sign-in or account creation — `PostQuizAuthScreen` has no skip option. Ask for auth when saving profile, restoring data, or using history/account features, same as before.

### Color analysis must refuse fake certainty

If the uploaded image is not a usable human selfie, ask for a retake. Do not produce a color season for objects, pets, screenshots, covered faces, harsh color-cast photos, or low-confidence images.

### Deep warm users are not automatically Winter

Dark hair plus high contrast is not enough for Winter. Golden/olive skin, warm brown or olive eyes, chocolate hair, and earthy/smoky evidence should push toward Dark Autumn / Deep Autumn.

### `/style-setup` owns the onboarding analysis

As of the 2026-06-20 rebrand, `/style-setup` is the canonical onboarding: face photo → body → quiz. `/quiz` and `/dashboard` redirect there. Do not add new face/body upload surfaces outside of `/style-setup`. Use `components/selfie/selfie-capture.tsx` for all photo upload/camera capture.

### Take photo is not upload

The `take photo` action must not click a hidden file input on desktop. Use `navigator.mediaDevices.getUserMedia()` for live webcam capture, and hide the action when the browser cannot support it.

### Camera preview must not be clipped

When the live webcam preview is active, the selfie capture card must grow with its content. Do not wrap the preview and capture buttons in the upload card's fixed `4/5` aspect-ratio box with hidden overflow, because short mobile viewports will hide the bottom action buttons.

### Mini-result must appear before the paywall, never after

The free mini-result is the conversion hook. It must be shown in full before the paywall. The paywall appears below the mini-result, with visible locked section titles. Never show an empty or loading profile to the user before showing the mini-result.

### Body photo is optional — never block analysis on it

If the user skips the body photo, use quiz self-report (body type selection, height, body area goals) for the body analysis section. Do not show an error or incomplete state because body photo is missing.

### Full report is generated on demand, not on registration

Do not generate the full 9-section report during onboarding. Generate and cache it when the user first unlocks it (post-payment). The mini-result is generated during onboarding.

### Quiz is 10 questions maximum

Do not add questions to the `/style-setup` quiz. The 10-question cap is a conversion-critical constraint. If new data is needed, derive it from the face photo analysis or replace an existing question.
