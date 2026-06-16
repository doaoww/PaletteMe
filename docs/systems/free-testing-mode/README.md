# Free Testing Mode

PaletteMe is temporarily running with premium report features unlocked so accuracy can be tested before payments return. Scanner entry points are paused until item/outfit scan accuracy is ready for testers.

## What Shipped

- Free-testing mode defaults to enabled.
- Fresh users receive `pro` access without needing `?paid=...`.
- The full report, body notes, style notes, and full palette are visible to every tester.
- Scanner entry points are temporarily paused for deployment safety while scan accuracy is being polished.
- Payment URLs are suppressed while free-testing mode is active.
- Profile UI shows free-testing copy instead of upgrade, price, or payment-link copy.

## Files

- `lib/premium.ts` - mode switch, payment URL suppression, and local unlock fallback.
- `lib/premium.test.ts` - tests for free-testing mode and disabled payment mode.
- `app/profile/page.tsx` - passes the explicit free-testing flag into the profile view.
- `components/profile/profile-view.tsx` - renders full access and testing copy.
- `lib/scan-feature.ts` - keeps scan entry points disabled by default through `NEXT_PUBLIC_SCAN_FEATURE_ENABLED`.
- `components/scan/scan-flow.tsx` - shows the scanner coming-soon surface while scans are disabled.
- `app/api/ai/scan/route.ts` - blocks direct scan requests with `SCAN_FEATURE_DISABLED` while scans are disabled.

## Restore Payments Later

Set this in the environment:

```env
NEXT_PUBLIC_FREE_TESTING_MODE=false
NEXT_PUBLIC_PAID_REPORT_URL=
NEXT_PUBLIC_SUBSCRIPTION_URL=
```

When disabled, the previous local MVP unlock flow works again:

- `/profile?paid=report`
- `/profile?paid=pro`

## Restore Scanner Later

Set this in the environment when scan accuracy is ready to test again:

```env
NEXT_PUBLIC_SCAN_FEATURE_ENABLED=true
```

When omitted or false, `/scan` shows a coming-soon screen and `/api/ai/scan` returns `SCAN_FEATURE_DISABLED` without starting AI analysis.

## Verification

- 2026-06-13: `node --test --experimental-strip-types lib\premium.test.ts lib\outfit-scan.test.ts lib\color-intelligence.test.ts lib\analysis-storage.test.ts lib\affiliate.test.ts` passed, 27/27 tests.
- 2026-06-13: `node_modules\.bin\eslint.cmd` passed with 0 errors and 6 existing warnings.
- 2026-06-13: `node node_modules\next\dist\bin\next build` passed.
- 2026-06-13: Production `next start` plus Playwright profile smoke passed for desktop and mobile: free badge visible, full report visible, scanner upload visible, paid copy absent, no horizontal overflow.
- 2026-06-15: Scanner pause verification passed: scan feature tests, related scan tests, ESLint on touched files, `next build`, `/scan` smoke showing coming-soon copy, and `/api/ai/scan` POST returning `SCAN_FEATURE_DISABLED`.
- Note: `npm test` could not run because the local machine's global npm CLI path was missing; the equivalent underlying Node test command was run directly.

## Notes

This mode must not write fake paid access to local storage. That keeps testers fully unlocked now while preserving a clean path back to real payment entitlements later.
