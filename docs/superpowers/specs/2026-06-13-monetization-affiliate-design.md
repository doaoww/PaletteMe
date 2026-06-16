# Monetization and Affiliate Launch Design

Date: 2026-06-13
Status: approved direction, implementation not started

## Goal

Turn PaletteMe from a free color-analysis demo into a paid B2C product that can test payment demand quickly:

- Free result gives enough value to feel real.
- A low-cost paid report unlocks deeper personalized guidance.
- A subscription unlocks recurring outfit and product checks.
- Affiliate links are ready for Rakuten, Awin, Amazon, or other approvals without blocking launch.

## Product Thesis

The paid product is not "AI tells me my season." That is a one-time curiosity and competitors can make it free. The paid product is "before I buy or wear something, tell me whether it works for me."

The fastest revenue path is:

1. Free color result for conversion.
2. Paid full report as the first purchase.
3. Pro scanner for recurring value.
4. Affiliate links as upside, not the primary revenue assumption.

## Pricing Model

Free:

- Macro season.
- Short explanation.
- Four best colors.
- Basic palette preview.
- A teaser of locked guidance.

Paid report, first launch price `2.99` to `4.99`:

- Exact sub-season.
- Full palette.
- Avoid colors.
- Makeup shades.
- Jewelry metals.
- Hair color guidance.
- Downloadable or shareable report view.

Pro subscription, first launch price `9.99/mo`:

- Outfit scanner.
- Before-you-buy product scanner.
- Saved profile.
- Saved product list.
- Unlimited or high-limit checks.

## Payment Strategy

Use Stripe Payment Links first.

Why:

- Fastest launch.
- No webhook required for first payment test.
- Stripe hosts checkout.
- Supports one-time products and subscriptions.
- Can be replaced by full Stripe Checkout and webhooks later.

MVP implementation:

- `NEXT_PUBLIC_PAID_REPORT_URL`
- `NEXT_PUBLIC_SUBSCRIPTION_URL`
- Success redirects return to `/profile?paid=report` or `/profile?paid=pro`.
- Client stores an MVP unlock flag.
- Supabase entitlement table comes later with Stripe webhooks.

Known limitation:

- Local unlock flags are not secure. This is acceptable only for the first demand test. When payments work, add webhook-backed entitlements.

## Affiliate Strategy

Add an affiliate wrapper now, even before program approvals finish.

Behavior:

- If affiliate env vars are missing, return the original product URL.
- If Rakuten/Awin/Amazon env vars exist, wrap supported product URLs.
- Always show a disclosure near product links.

Affiliate revenue is not expected to hit the first MRR goal. It is a secondary revenue stream.

## UX Flow

1. User lands on `/`.
2. User starts `/quiz`.
3. User gets a useful free result.
4. User sees locked report sections with clear previews.
5. User clicks "unlock full report".
6. Stripe Payment Link handles payment.
7. User returns to `/profile?paid=report`.
8. Full report is unlocked.
9. User sees Pro upsell for outfit and product scanner.
10. Product links use affiliate wrapping when available.

## Technical Boundaries

- Keep AI calls server-side only.
- Do not import server-only code into client components.
- Keep payment URLs as public env vars only because they are not secrets.
- Keep affiliate IDs configurable by env vars.
- Do not block launch on affiliate approvals.
- Do not build full subscription webhooks until payment demand is proven.

## Success Criteria

- App builds and deploys.
- Free result works without payment.
- Paid report CTA appears after result.
- Payment link opens correctly.
- Success redirect unlocks premium report in MVP mode.
- Outfit scanner is visible as a Pro feature.
- Product links still work without affiliate env vars.
- Affiliate disclosure is visible.

