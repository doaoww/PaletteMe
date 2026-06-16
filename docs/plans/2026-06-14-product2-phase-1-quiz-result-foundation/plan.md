# Product2 Phase 1 - Quiz Result Foundation

Date: 2026-06-14
Status: shipped
Source intake: `app/product2.md`

## Goal

Make PaletteMe quiz-first, inclusive, and more accurate before adding larger wardrobe/app surfaces.

## Product Decisions

- Do not rename PaletteMe in this phase.
- Use `app/product2.md` as intake direction, but keep active execution here.
- Keep all premium-style features unlocked while testing.
- Show value before asking for selfie, location, payment, or account creation.
- Treat selfie analysis as an accuracy boost, not a requirement.
- User corrections and stated preferences must beat AI guesses.

## Phase 1 Scope

- Add wardrobe-type and main-pain-point answers to the quiz data model.
- Start the quiz with observable onboarding questions before photo upload.
- Move selfie capture to an optional confirmation decision after quiz color answers.
- Add deterministic quiz-prior scoring for warm/cool, light/deep, and bright/muted evidence.
- Use the quiz prior in the saved profile and AI context.
- Personalize the result copy using the user's pain point and wardrobe preference.
- Keep the existing OpenAI/Gemini photo analysis and hybrid photo scoring intact.

## Out of Scope

- App rename.
- Payments and entitlements.
- Full wardrobe UI.
- Live shopping scanner UI.
- Avatar builder.
- Weather/location permission flow.
- Continuous-learning weight updates from many feedback points.

## Files

- Modify `lib/quiz-data.ts` for new answer types and option lists.
- Modify `lib/quiz.ts` for quiz-prior scoring, profile storage, and AI context formatting.
- Add `lib/quiz.test.ts` for deterministic quiz-prior and profile tests.
- Modify `components/quiz/quiz-flow.tsx` for quiz-first flow and optional selfie decision.
- Modify `docs/TRACKER.yaml` for phase status.
- Update `LOGIC.md` and product docs after verification.

## Acceptance Criteria

- A new user begins with wardrobe type and style challenge, not photo upload.
- The user can finish quiz color questions and choose either selfie confirmation or result now.
- Quiz-only result has a deterministic prior with confidence and sub-season hint.
- Warm, deep, muted evidence prefers Autumn over Winter.
- Cool, deep, bright evidence prefers Winter over Autumn.
- Profile/AI context includes wardrobe type and style challenge.
- Existing selfie upload/camera behavior remains owned by `components/selfie/selfie-capture.tsx`.
- Tests pass for the new pure scoring/profile behavior.

## Shipped

- Added wardrobe type, style challenge, skin tone, detailed hair, detailed eye, and expanded sun reaction answer contracts.
- Added deterministic quiz evidence scoring for warm/cool, light/deep, and bright/muted axes.
- Quiz-only warm/deep/muted evidence now produces Dark Autumn instead of over-weighting Winter from depth alone.
- `/quiz` now starts with profile context, collects color evidence, then offers optional selfie confirmation.
- Saved profiles and AI prompt context include quiz evidence, quiz confidence, wardrobe type, and style challenge.

## Verification

- `node --test --experimental-strip-types lib\quiz.test.ts` passed, 4/4 tests.
- `node --test --experimental-strip-types lib\*.test.ts` passed, 53/53 tests.
- `node_modules\.bin\eslint.cmd` passed.
- `node node_modules\typescript\bin\tsc --noEmit` passed.
- `node node_modules\next\dist\bin\next build` passed.
- Playwright mobile smoke for `/quiz` passed: profile questions -> Dark Autumn quiz prior -> optional selfie decision -> result now -> no horizontal overflow.
