# Task 04 - Pro Outfit Scanner

## Goal

Make the existing outfit analysis route into the recurring Pro feature.

## Work

- Add UI for outfit or product photo upload.
- Use existing `/api/check-outfit`.
- Gate repeated use behind Pro.
- Allow a clear Pro upsell when locked.

## Acceptance Criteria

- Pro users can upload an outfit or product photo.
- The app returns match score, reason, and suggestion.
- Free users understand what they would get with Pro.
- The route remains `nodejs` runtime.

## Progress

- 2026-06-13: Started after paid report profile split shipped.
- 2026-06-13: Added tested `lib/outfit-scan.ts` helper for image validation and `/api/check-outfit` form data.
- 2026-06-13: Added Pro-only outfit/product upload UI inside the profile scanner card.
- 2026-06-13: Scanner now calls existing `/api/check-outfit`, displays match/caution, score, dominant colors, reason, and suggestion, and shows API errors gracefully.
- 2026-06-13: Verified helper tests, `eslint`, and `next build` pass; existing route remains `runtime = "nodejs"`.
