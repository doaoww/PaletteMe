# Color Intelligence v1

## Status

Shipped on 2026-06-13.

## What Shipped

- `AnalysisResult` now includes chroma, feature notes, and a reusable color intelligence report.
- AI prompt asks for skin, hair, eye, undertone, depth, contrast, chroma, confidence, summary, and tips.
- Safe fallback report generation covers missing AI fields.
- Latest analysis JSON is saved locally without storing the uploaded image.
- Dashboard and quiz selfie results now show richer color intelligence.
- Profile paid report now uses shared report data instead of local hardcoded guidance.
- Pro scanner receives report-derived best color strings.

## Key Files

- `lib/color-intelligence.ts` - pure report builder.
- `lib/color-intelligence.test.ts` - report helper tests.
- `lib/analysis-storage.ts` - local JSON result persistence.
- `lib/analysis-storage.test.ts` - storage helper tests.
- `lib/analysis.ts` - richer prompt/result schema and report attachment.
- `components/dashboard/color-analyzer.tsx` - saves result and shows richer preview.
- `components/quiz/quiz-selfie-step.tsx` - saves result and links to profile.
- `app/profile/page.tsx` - loads saved analysis result.
- `components/profile/profile-view.tsx` - uses saved/generated report for paid profile and scanner.

## Verification

- `node --test --experimental-strip-types lib\color-intelligence.test.ts lib\analysis-storage.test.ts lib\premium.test.ts lib\outfit-scan.test.ts lib\affiliate.test.ts`
- `.\node_modules\.bin\eslint.cmd`
- `.\node_modules\.bin\next.cmd build`
- Playwright smoke against production `next start` for profile free/report/pro states with a saved Color Intelligence result.

## Notes

- This stores only analysis JSON. It does not store the uploaded selfie or object URL.
- Old saved analysis without `report` or `chroma` falls back to generated report data.
- `npm test` remains unreliable on this machine because the global npm shim is broken; use direct `node --test --experimental-strip-types ...`.
