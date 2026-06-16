# Monetization Affiliate Launch

## Status

Shipped on 2026-06-13.

## What Shipped

- Local MVP payment unlocks for `?paid=report` and `?paid=pro`.
- Profile free preview, paid report lock, full report state, and Pro scanner state.
- Paid report content for exact sub-season, full palette, makeup, jewelry, hair, avoid colors, contrast, and shopping guidance.
- Pro-only outfit/product scanner UI calling the existing `/api/check-outfit` Node route.
- Affiliate URL wrapper for disabled fallback, AWIN ASOS, Rakuten ASOS, and Amazon associate tags.
- Affiliate disclosures near dashboard and feed product grids.
- Truthful photo privacy copy across product-facing surfaces.

## Key Files

- `lib/premium.ts` - local MVP premium level and payment URL helper.
- `lib/outfit-scan.ts` - outfit image validation and form-data helper.
- `lib/affiliate.ts` - centralized affiliate URL wrapper.
- `app/profile/page.tsx` - profile unlock query handling.
- `components/profile/profile-view.tsx` - free/report/pro profile and scanner UI.
- `app/api/products/route.ts` - affiliate-wrapped result links.
- `app/api/feed/route.ts` - affiliate-wrapped feed links.
- `components/dashboard/color-analyzer.tsx` - product disclosure and truthful privacy copy.
- `components/feed/product-feed.tsx` - product disclosure.

## Environment Variables

Payment:

```env
NEXT_PUBLIC_PAID_REPORT_URL=
NEXT_PUBLIC_SUBSCRIPTION_URL=
```

Affiliate:

```env
AFFILIATE_ENABLED=false
AFFILIATE_NETWORK=
RAKUTEN_SITE_ID=
RAKUTEN_ASOS_MID=
AWIN_PUBLISHER_ID=
AWIN_ASOS_MID=
AMAZON_ASSOCIATE_TAG=
```

## Verification

- `node --test --experimental-strip-types lib\premium.test.ts lib\outfit-scan.test.ts lib\affiliate.test.ts`
- `.\node_modules\.bin\eslint.cmd`
- `.\node_modules\.bin\next.cmd build`
- Playwright smoke test against `http://localhost:3000/profile` for free, report, Pro, and mobile states.
- Product API smoke test against `/api/products?season=summer`.
- Text scan for stale privacy claims.

## Notes

- Local query-param unlocks are for fast MVP payment validation only. Replace with webhook-backed entitlements before serious launch traffic.
- `npm test` is not reliable on this machine because the global npm shim cannot find `npm-cli.js`; use direct `node --test --experimental-strip-types ...` until npm is repaired.
- The in-app Browser connector failed in this environment, so browser QA used the project Playwright dependency directly.
