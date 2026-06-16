# Task 02 - Payment Links And Premium Gates

## Goal

Add the first payment path without full billing infrastructure.

## Work

- Add a small premium helper for MVP unlock state.
- Add support for:
  - `NEXT_PUBLIC_PAID_REPORT_URL`
  - `NEXT_PUBLIC_SUBSCRIPTION_URL`
- Add success redirect handling for:
  - `/profile?paid=report`
  - `/profile?paid=pro`
- Show clear upgrade CTAs.

## Acceptance Criteria

- Free users can use the app without payment.
- Locked report sections display a payment CTA.
- Payment URL buttons are hidden or disabled if env vars are missing.
- Returning with `paid=report` unlocks report content in MVP mode.
- Returning with `paid=pro` unlocks Pro content in MVP mode.

## Progress

- 2026-06-13: Started after build/lint stabilization.
- 2026-06-13: Added tested `lib/premium.ts` helper for local MVP unlock state, payment URLs, and report/pro access checks.
- 2026-06-13: Wired `/profile?paid=report` and `/profile?paid=pro` into the profile page, with checkout URLs from public env vars.
- 2026-06-13: Added free preview, report lock CTA, report unlocked state, and Pro upsell to the profile view.
- 2026-06-13: Verified premium helper tests and `next build` pass.
