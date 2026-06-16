# Hybrid Color Algorithm v1

Date: 2026-06-13
Status: shipped

## What Shipped

PaletteMe color analysis now uses a hybrid flow:

1. OpenAI Responses API extracts structured visual evidence from the selfie.
2. `lib/color-season-scoring.ts` scores all 12 sub-seasons from undertone, depth, contrast, chroma, and evidence.
3. `lib/analysis-normalizer.ts` uses the scorer's winner as the final result and exposes close alternatives.
4. Legacy OpenAI chat and Gemini remain fallback paths.

## Calibration Case

The first regression case is a dark warm user previously labeled True Winter. The expected result is Dark Autumn / Deep Autumn because of golden/olive skin, warm brown/olive eyes, chocolate hair, and earthy/smoky depth.

Coverage lives in `lib/analysis.test.ts`.

## Environment

Color model resolution:

1. `OPENAI_COLOR_ANALYSIS_MODEL`
2. `OPENAI_STYLE_MODEL`
3. `gpt-5.4`

Legacy chat fallback:

1. `OPENAI_COLOR_ANALYSIS_LEGACY_MODEL`
2. `gpt-4o`

## Validation

- `node --test --experimental-strip-types`
- `node node_modules\typescript\bin\tsc --noEmit`
- `node node_modules\next\dist\bin\next build`

