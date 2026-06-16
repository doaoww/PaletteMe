# Accuracy Gate v1

Date shipped: 2026-06-13

## What Shipped

PaletteMe now refuses fake color analysis when the uploaded image is not reliable.

- Non-human uploads return a no-face/selfie message.
- Missing model quality metadata returns a retake message instead of a season.
- Poor lighting, heavy filters, strong color cast, covered face, tiny face, and low confidence return retake guidance.
- Valid results include photo quality metadata, evidence, confidence, accuracy note, and closest alternative seasons.
- `/api/analyze` returns HTTP 422 for retake/no-face cases with a user-facing `message`.
- Quiz and dashboard clients show the API `message` and display closest alternatives on valid results.
- OpenAI color analysis now defaults to `gpt-4o`, overrideable with `OPENAI_COLOR_ANALYSIS_MODEL`.

## Key Files

- `lib/analysis-normalizer.ts`
- `lib/analysis.test.ts`
- `lib/analysis.ts`
- `app/api/analyze/route.ts`
- `components/quiz/quiz-selfie-step.tsx`
- `components/quiz/quiz-flow.tsx`
- `components/dashboard/color-analyzer.tsx`
- `lib/analysis-storage.ts`

## Product Rule

If the app cannot confidently read a usable human selfie, it must ask for a better photo. It should never assign a season to an object, screenshot, clothing item, room photo, or unreliable selfie.

## Validation

- `node --test --experimental-strip-types`
- `node node_modules\typescript\bin\tsc --noEmit`
- `node node_modules\next\dist\bin\next build`
