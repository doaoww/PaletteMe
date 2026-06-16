# Color Intelligence v1 Plan

## Goal

Make PaletteMe feel smarter by turning selfie analysis into a reusable color intelligence report: undertone, contrast, depth, chroma, feature notes, best/avoid colors, makeup, jewelry, hair, neutrals, accents, and scanner guidance.

## Scope

In scope:

- Add a pure report helper that derives rich guidance from `SEASONS`, analysis traits, chroma, sub-season, and quiz context.
- Extend `AnalysisResult` with chroma, feature notes, and a report object.
- Save the latest analysis result locally so users keep it on refresh and profile pages can reuse it.
- Show richer analysis in quiz/dashboard results and paid profile report.
- Improve scanner inputs by passing richer best-color guidance.

Out of scope:

- Stripe/webhook payments.
- New AI provider.
- Database-backed report persistence.
- New image upload route.

## Architecture

`lib/color-intelligence.ts` becomes the client/server-safe source of report guidance. `lib/analysis.ts` asks AI for deeper raw observations, normalizes the result, then attaches a generated report. `lib/analysis-storage.ts` saves only JSON analysis data, not photos. UI components read the same report shape instead of inventing guidance locally.

## Data Flow

```text
selfie + quiz hint
  -> /api/analyze
  -> analyzeFaceImage()
  -> AI raw JSON
  -> normalize traits/chroma/feature notes
  -> buildColorIntelligenceReport()
  -> AnalysisResult.report
  -> saveAnalysisResult()
  -> profile/report/scanner UI
```

## Acceptance Criteria

- Analysis result includes undertone, contrast, depth, chroma, feature notes, confidence, and report.
- Report includes best colors, avoid colors, neutrals, accents, makeup, jewelry, hair, shopping rules, and scanner guidance.
- Free surfaces reveal useful summary without exposing the full paid report.
- Paid profile report uses saved analysis when available and falls back to quiz/season data when not.
- Latest analysis persists across refresh without storing the uploaded image.
- Pure helpers have tests that were observed failing before implementation.
- `eslint` has 0 errors and `next build` passes.
