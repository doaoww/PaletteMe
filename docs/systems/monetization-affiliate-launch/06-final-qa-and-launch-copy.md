# Task 06 - Final QA And Launch Copy

## Goal

Verify the full monetization path before launch.

## Work

- Test free analysis flow.
- Test paid report CTA.
- Test missing payment link state.
- Test success redirect unlock state.
- Test Pro scanner gate.
- Test product links.
- Test mobile layout.
- Verify privacy copy.

## Acceptance Criteria

- A user can complete free analysis.
- A user can click payment CTA.
- Paid report unlocks after success redirect.
- Product links remain usable.
- Mobile layout is usable.
- No false trust, privacy, or waitlist claims remain.

## Progress

- 2026-06-13: Started after affiliate wrapper shipped.
- 2026-06-13: Verified profile monetization states with Playwright smoke test: free locked report, report unlock, Pro unlock, and mobile no-horizontal-overflow.
- 2026-06-13: Verified `/api/products?season=summer` returns usable product links.
- 2026-06-13: Verified stale false privacy claims are gone.
- 2026-06-13: Final helper tests pass: premium, outfit scan, affiliate.
- 2026-06-13: Final `eslint` reports 0 errors and existing warnings only; final `next build` passes.
