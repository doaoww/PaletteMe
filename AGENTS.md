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

If docs disagree, update the stale doc before implementing.

---

## BRD - Business Requirements

### What Is PaletteMe?

PaletteMe is a personal style assistant. It helps users discover their seasonal color direction, then decide which makeup, outfits, wardrobe items, and products actually suit them.

### Problem

Users buy colors that clash with their undertone, contrast, and personal style. Professional color analysis is expensive and slow. Free online quizzes are fun but shallow, and they do not help users make real shopping decisions.

### Solution

Free testing mode gives users full access while the product validates AI accuracy. The long-term product is recurring outfit, wardrobe, product, and makeup checks.

### Business Goals

- Validate AI accuracy and user trust before re-testing payments.
- Reach `1000+ MRR` through paid report and Pro subscription.
- Use affiliate links as secondary revenue once approvals arrive.
- Establish PaletteMe as a practical "before you wear or buy it" styling assistant.

### Revenue Model

Free:

- Quiz-first result.
- Optional selfie accuracy boost.
- Full report while testing.
- Clothing, outfit, product, and makeup scan access while testing.
- Early wardrobe matching while testing.

Paid report:

- Launch price: `2.99` to `4.99`.
- Exact sub-season, full palette, avoid colors, makeup, jewelry, hair, and shopping guidance.

Pro:

- Launch price: `9.99/mo`.
- Future recurring value: outfit scanner, before-you-buy product scanner, makeup scanner, wardrobe matchmaker, saved profile, saved products, and higher usage limits.

Affiliate:

- Product links should be affiliate-ready but must work without affiliate env vars.

---

## PRD - Product Requirements

### Core User Flow

```text
Landing
  -> Mobile-first quiz
  -> Fast result
  -> Optional selfie accuracy boost
  -> Scan clothing/outfit/makeup/product
  -> Save scan history
  -> Add owned wardrobe items
  -> Build outfits and buy-with-my-closet verdicts
```

### Pages

| Page | Path | Purpose |
| --- | --- | --- |
| Landing | `/` | Explain value, start quiz, collect interest |
| Quiz | `/quiz` | Onboarding and selfie/color flow |
| Profile | `/profile` | Free result, paid report, Pro upsell |
| Feed | `/feed` | Product recommendations |
| Saved | `/saved` | Saved products |
| Login/Auth | `/login` | Account recovery and saved profile |
| Auth redirect | `/auth` | Legacy redirect to `/login` |
| Dashboard | `/dashboard` | Legacy URL that redirects to `/quiz` |

### MVP Features

- Selfie upload or live camera capture with client-side resize.
- Color analysis through server-side AI routes.
- Free testing result.
- Full report while testing.
- Clothing, outfit, makeup, and product scanner direction.
- Early wardrobe matchmaker direction.
- Affiliate-ready product links.
- Waitlist and Telegram notification.

### Post-MVP Features

- Stripe webhooks.
- Supabase entitlement table.
- PDF report generation.
- Email lifecycle flows.
- Affiliate feed ingestion.
- Admin product dashboard.
- Full wardrobe catalog and outfit builder.
- Buy-with-my-closet scanner.

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

- `docs/plans/2026-06-13-monetization-affiliate-launch/`

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

### Auth is progressive

Users can finish the quiz and see results before signing in. Ask for auth when saving profile, restoring data, or using history/account features.

### Color analysis must refuse fake certainty

If the uploaded image is not a usable human selfie, ask for a retake. Do not produce a color season for objects, pets, screenshots, covered faces, harsh color-cast photos, or low-confidence images.

### Deep warm users are not automatically Winter

Dark hair plus high contrast is not enough for Winter. Golden/olive skin, warm brown or olive eyes, chocolate hair, and earthy/smoky evidence should push toward Dark Autumn / Deep Autumn.

### `/quiz` owns selfie analysis

Do not rebuild `/dashboard` as an analysis UI. Use `components/selfie/selfie-capture.tsx` for upload/camera capture and keep `/dashboard` as a redirect.

### Take photo is not upload

The `take photo` action must not click a hidden file input on desktop. Use `navigator.mediaDevices.getUserMedia()` for live webcam capture, and hide the action when the browser cannot support it.

### Camera preview must not be clipped

When the live webcam preview is active, the selfie capture card must grow with its content. Do not wrap the preview and capture buttons in the upload card's fixed `4/5` aspect-ratio box with hidden overflow, because short mobile viewports will hide the bottom action buttons.
