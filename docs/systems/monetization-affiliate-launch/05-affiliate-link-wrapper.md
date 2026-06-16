# Task 05 - Affiliate Link Wrapper

## Goal

Prepare product links for affiliate programs without blocking launch while approvals are pending.

## Work

- Add one URL wrapper function.
- Support original URL fallback.
- Support Rakuten, Awin, and Amazon env vars.
- Apply wrapper to product links before they reach UI.
- Add affiliate disclosure text near product grids.

## Acceptance Criteria

- Product links still work with no affiliate env vars.
- When affiliate env vars exist, supported links are wrapped.
- Unsupported links are not broken.
- Disclosure is visible and plain.

## Progress

- 2026-06-13: Started after Pro scanner shipped.
- 2026-06-13: Added tested `lib/affiliate.ts` helper for disabled fallback, AWIN ASOS, Rakuten ASOS, Amazon associate tags, unsupported URLs, and already wrapped URLs.
- 2026-06-13: Applied affiliate wrapping in `/api/products` and `/api/feed` before product URLs reach UI.
- 2026-06-13: Added plain affiliate disclosure text near dashboard and feed product grids.
- 2026-06-13: Verified affiliate tests, all helper tests, `eslint`, and `next build` pass.
