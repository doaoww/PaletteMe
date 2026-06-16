# Monetization and Affiliate Launch Plan

Date: 2026-06-13
Status: planned

## Goal

Launch the fastest credible paid version of PaletteMe:

- Free color analysis result.
- Paid full report through Stripe Payment Links.
- Pro outfit/product scanner upsell.
- Affiliate-ready product links.

## BRD

PaletteMe needs to validate whether users will pay for personal color guidance before more infrastructure is built. The revenue target is `1000+ MRR`, so affiliate commissions alone are not enough. The plan prioritizes direct payments first, affiliate revenue second.

## PRD

Free users should receive a complete enough result to trust the product. Paid users should unlock guidance that directly helps them buy and wear better colors.

Free:

- Macro season.
- Short explanation.
- Four best colors.
- Basic palette preview.

Paid report:

- Exact sub-season.
- Full palette.
- Avoid colors.
- Makeup, jewelry, hair, and shopping guidance.

Pro:

- Outfit scanner.
- Before-you-buy product scanner.
- Saved profile and saved products.

## TRD

Keep the existing stack:

- Next.js 16 App Router.
- React 19.
- Tailwind v4 CSS-first tokens.
- Supabase for persistence.
- GPT-4o for serious image analysis.
- Gemini fallback where already wired.
- Stripe Payment Links for first payment test.
- A small affiliate URL wrapper for Rakuten/Awin/Amazon later.

## Current Architecture

The app already has these useful foundations:

- `/quiz` onboarding.
- `/profile` result page.
- `/feed` product page.
- `/saved` saved products.
- `/api/check-outfit` outfit analysis.
- `/api/products` product matching.
- Supabase support.

The work should build on those pieces instead of adding a parallel app.

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

## Privacy Rules

Do not claim photos never leave the device. The truthful MVP copy is:

> Photos are processed securely for analysis. PaletteMe does not sell or share your images.

If storage behavior changes, update this copy and the docs.

## Launch Order

1. Stabilize build and documentation.
2. Add payment links and MVP premium gates.
3. Add paid report sections on profile/result pages.
4. Gate outfit scanner as Pro.
5. Add affiliate URL wrapper.
6. QA the full free -> paid -> affiliate flow.

## Not In Scope For This Plan

- Full Stripe webhooks.
- Secure server-backed subscriptions.
- Native mobile app.
- Affiliate feed ingestion.
- PDF generation.
- Email lifecycle campaigns.

Those come after payment demand is proven.

