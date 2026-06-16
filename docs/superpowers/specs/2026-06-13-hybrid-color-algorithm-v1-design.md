# Hybrid Color Algorithm v1 Design

Date: 2026-06-13
Status: approved for implementation

## Problem

PaletteMe can confuse dark warm users with Winter because the current analysis trusts the vision model's final season label too much. The first calibration case is a user-provided photo where the app returned True Winter, but the visible evidence points to Dark Autumn: golden/olive skin, warm brown/olive eyes, deep chocolate hair, and an earthy-rich rather than icy/sharp effect.

## Decision

Color analysis should be a hybrid system:

1. OpenAI Responses API extracts structured visual evidence from the selfie.
2. A deterministic scorer maps undertone, depth, contrast, chroma, and evidence text to all 12 sub-seasons.
3. The scorer chooses the final season and top alternatives.
4. The AI explanation remains useful, but the model's final label no longer overrides the measured traits.

## Accuracy Rules

- Deep + warm + earthy/smoky evidence should prefer Dark Autumn over True Winter.
- Deep + cool + icy/crystalline evidence should prefer Winter.
- Borderline results should expose close alternatives instead of false certainty.
- Non-human, poor-quality, filtered, or color-cast uploads still return retake messages through Accuracy Gate v1.

## Implementation Units

- `lib/color-season-scoring.ts` scores 12 sub-seasons from normalized traits and evidence.
- `lib/analysis-normalizer.ts` uses the scorer before building the public result.
- `lib/analysis.ts` uses OpenAI Responses API structured output first, then legacy OpenAI/Gemini fallbacks.
- `lib/analysis.test.ts` stores the Dark Autumn regression case.

