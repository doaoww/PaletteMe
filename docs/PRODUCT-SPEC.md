# PaletteMe Product Spec

Date: 2026-06-13
Status: current product direction

## Product

PaletteMe helps style-conscious people understand which colors, makeup shades, outfits, wardrobe items, and products suit them.

The core promise:

> Before you buy or wear it, PaletteMe tells you whether it works for your colors, body/fit goals, wardrobe, and style.

For the latest product principles, read `docs/PRODUCT-NORTH-STAR.md` before planning new features.

## Business Goal

Reach direct payment validation with a path toward `1000+ MRR`, but only after the core AI experience is accurate enough to trust.

Current mode is free testing. The first product test is whether users trust the quiz, selfie analysis, scan verdicts, wardrobe matching, and makeup guidance. As of 2026-06-15, scanner entry points are temporarily paused behind `NEXT_PUBLIC_SCAN_FEATURE_ENABLED` until item/outfit scan accuracy is good enough to deploy.

Affiliate revenue is useful but secondary. The later business test is whether users will pay for recurring "should I wear or buy this?" checks.

## Target User

- Style-conscious people, not only women.
- Users who shop womenswear, menswear, both, or unisex.
- Users interested in seasonal color analysis.
- Users who shop online and want fewer color mistakes.
- Users who want practical wardrobe, makeup, outfit, and shopping decisions, not just a season label.

## Pricing

Pricing is paused while the app runs in free testing mode. Keep all major features unlocked until accuracy and usefulness are validated.

### Free

- Quiz-first result.
- Optional selfie accuracy boost by upload or live camera capture.
- Full color report while testing.
- Outfit/product/makeup scan access while testing, currently paused behind `NEXT_PUBLIC_SCAN_FEATURE_ENABLED` for deployment safety.
- Early wardrobe matching while testing.

### Paid Report

Launch price: `2.99` to `4.99`.

Includes:

- Exact sub-season.
- Full palette.
- Avoid colors.
- Makeup shade guide.
- Jewelry metals.
- Hair color guidance.
- Shopping guidance.

### Pro

Launch price: `9.99/mo`.

Includes:

- Outfit scanner.
- Before-you-buy product scanner.
- Saved profile.
- Saved products.
- Unlimited or high-limit checks.

Likely future paid value is not the static report. It is recurring wardrobe, outfit, product, and makeup checks.

## Pages

| Page | Path | Purpose |
| --- | --- | --- |
| Landing | `/` | Explain value, start quiz, collect interest |
| Quiz | `/quiz` | Onboarding and selfie/color result |
| Profile | `/profile` | Free result, paid report, Pro upsell |
| Feed | `/feed` | Personalized product recommendations |
| Saved | `/saved` | Saved products |
| Login/Auth | `/login`, `/auth` | Account recovery and saved profile |
| Dashboard | `/dashboard` | Legacy URL that redirects to `/quiz` |

Future surfaces:

| Page | Path | Purpose |
| --- | --- | --- |
| Wardrobe | `/wardrobe` | User-owned clothing catalog |
| Scans | `/scans` | Clothing, outfit, makeup, and product verdict history |
| Outfit Builder | `/outfits` | Build outfits from saved wardrobe items |

## Payment Flow

Use Stripe Payment Links for the first launch.

Environment variables:

```env
NEXT_PUBLIC_PAID_REPORT_URL=
NEXT_PUBLIC_SUBSCRIPTION_URL=
```

Flow:

1. User sees locked report section.
2. User clicks "unlock full report".
3. App opens Stripe Payment Link.
4. Stripe redirects back to `/profile?paid=report`.
5. MVP unlock flag reveals report content.

For Pro:

1. User sees scanner locked.
2. User clicks "upgrade to Pro".
3. App opens subscription Payment Link.
4. Stripe redirects back to `/profile?paid=pro`.
5. MVP unlock flag reveals Pro features.

MVP limitation:

- Redirect/local unlock is not a secure entitlement system.
- After payment demand is proven, add Stripe webhooks and Supabase entitlements.

## Affiliate Flow

Add one affiliate link wrapper.

Rules:

- Missing affiliate env vars must never break links.
- Unsupported merchants must return the original URL.
- Affiliate disclosure must be visible near product links.
- Affiliate approvals are not a launch blocker.

Planned env vars:

```env
AFFILIATE_ENABLED=false
AFFILIATE_NETWORK=
RAKUTEN_SITE_ID=
RAKUTEN_ASOS_MID=
AWIN_PUBLISHER_ID=
AWIN_ASOS_MID=
AMAZON_ASSOCIATE_TAG=
```

## AI Analysis

Use GPT-4o for serious selfie and outfit analysis. Keep Gemini fallback where already wired.

Rules:

- AI calls stay server-side.
- API keys stay server-side.
- Non-human uploads must ask for a clear selfie and must not return a color season.
- Client components must not import server-only AI files.
- Low-confidence photos should ask users to retry in better lighting.
- AI outputs must include confidence, reason, and editable structured labels where possible.
- User corrections must override AI guesses.
- Do not simply reject uploaded clothes. Explain how to use, balance, or replace them.

## Product Principles

- Ask observable facts, not self-diagnosis.
- Show quiz result fast, ideally around 60 seconds.
- Make selfie upload/live camera capture optional and position it as an accuracy boost.
- Build a deterministic quiz color prior before selfie confirmation. Warm/deep/muted evidence should not be mislabeled Winter just because the user has dark hair or high depth.
- Support men, women, nonbinary users, and unisex styling.
- Make makeup optional.
- Avoid borrowed reviews. Use real beta feedback or product demos.
- Give users item-level control over wardrobe and outfit generation.
- Build feedback capture into AI results.

## Killer Features

### Scan Anything

One upload entry point for clothing, outfits, makeup, and product screenshots.

The result should show:

- works / maybe / skip
- score
- reason
- what to change
- better alternatives
- save result

### Wardrobe Matchmaker

Users add 5-10 owned items first. PaletteMe labels each item, lets the user correct it, then builds outfits from those owned clothes.

Required controls:

- lock item
- swap item
- remove item
- edit labels
- add manual item

### Buy-With-My-Closet

User uploads a product screenshot or link. PaletteMe tells them whether to buy it and shows outfits using items they already own.

### Makeup Scanner

User uploads lipstick, blush, foundation, eyeshadow, or a product screenshot. PaletteMe judges undertone fit and suggests better shade families.

## Privacy Copy

Do not say photos never leave the device.

Approved copy:

> Photos are processed securely for analysis. PaletteMe does not sell or share your images.

If the app stores photos later, this copy must change before launch.

## Build Order

1. Mobile-first quiz with fast result and optional selfie.
2. Accuracy feedback on quiz and photo results.
3. Scan Anything for clothes, outfits, makeup, and product screenshots.
4. Save scan history.
5. Mini wardrobe: add 5-10 owned items with editable AI labels.
6. Outfit builder from saved wardrobe.
7. Buy-with-my-closet scanner.
8. Product recommendations and affiliate links.
9. Payment re-test after usefulness is proven.

## Current Quiz Foundation

Phase 1 of the product2 direction shipped on 2026-06-14:

- `/quiz` starts with wardrobe type and main style challenge.
- Color questions collect skin tone, undertone, sun reaction, natural hair, eye color, white/cream, contrast, and intensity.
- `lib/quiz.ts` produces a quiz prior with axes, confidence, macro season, and sub-season hint.
- Users can upload a selfie after the quiz or continue with the quiz-only result.
- Saved profiles and AI prompt context include wardrobe type, style challenge, quiz evidence, and quiz confidence.

## Not In Scope For First Monetization Launch

- Full Stripe webhook integration.
- PDF report generation.
- Email lifecycle automation.
- Affiliate feed ingestion.
- Native mobile app.
- Large whole-closet batch upload before the mini wardrobe flow works.
