# Free Testing Mode Plan

## Goal

Make PaletteMe fully free while color accuracy and scanner usefulness are being tested.

## Context

The payment/report/pro architecture already exists, but payments are deferred. The app should now expose the full color report and scanner to every tester without showing payment or upgrade prompts.

## Scope

- Add a free-testing mode in the premium helper.
- Default the current build to free-testing mode.
- Allow payments to be restored later with `NEXT_PUBLIC_FREE_TESTING_MODE=false`.
- Hide payment, price, unlock, and upgrade copy while free-testing mode is active.
- Keep affiliate links and product recommendations available.
- Update docs so future agents understand this is intentional.

## Out of Scope

- Stripe checkout.
- Webhook-backed entitlements.
- Subscription billing.
- New AI analysis fields.

## Architecture

`lib/premium.ts` becomes the single switchboard for test-mode access:

1. If free-testing mode is active, `resolvePremiumLevel()` returns `pro`.
2. Payment URLs are ignored while free-testing mode is active.
3. Profile UI receives an explicit `freeTestingMode` flag and renders the full report and scanner without paid CTAs.

## Acceptance Criteria

- A fresh user on `/profile` gets full report access without `?paid=...`.
- The scanner upload UI is visible without payment.
- No payment buttons, prices, or "payment link coming soon" states appear in free-testing mode.
- Setting `NEXT_PUBLIC_FREE_TESTING_MODE=false` restores the old local unlock behavior.
- Premium helper tests cover both free-testing and payment modes.
