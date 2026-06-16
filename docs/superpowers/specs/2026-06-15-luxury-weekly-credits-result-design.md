# Luxury Weekly Credits Result Design

Date: 2026-06-15
Status: approved for implementation

## Goal

Make PaletteMe's result feel like a premium personal consultation while keeping the first experience free. Monetization should start from repeated scanner usage, not from locking the first color identity report.

## Product Direction

- The quiz result and color identity report remain free while accuracy is being validated.
- The result should create perceived value through emotional identity, visual palette guidance, and practical next actions.
- Scanner usage is limited by weekly credits so a tester can try the product without uploading unlimited photos.
- Paid report language stays dormant. Future monetization should sell more credits, credit packs, or Pro scanner usage.

## Result Experience

The result carousel should read like a luxury color passport:

1. Color Identity: season, sub-season, undertone, contrast, secondary influence, confidence.
2. Glow Colors: rich swatches with emotional descriptors and a tip.
3. Overpower Colors: avoid/careful colors with reasons that explain why old clothes felt wrong.
4. Style Energy: archetype, jewelry, style direction, fashion keywords.
5. Weekly Style Checks: credit-based CTA into Scan Anything.

## Credit Model

- Weekly allowance: 5 credits.
- Clothing item: 1 credit.
- Makeup product: 1 credit.
- Product screenshot: 1 credit.
- Full outfit: 2 credits.
- Credits reset weekly.
- MVP storage: browser localStorage.
- If a scan request fails after consuming credits, refund the credit in the same browser session.
- This is not a secure entitlement system. Server-side credits and paid plans should replace it before real billing.

## Success Criteria

- Result no longer feels like a dry text report.
- User sees concrete reasons and next actions without reading a wall of text.
- Scanner entry clearly communicates remaining weekly credits.
- Uploads are blocked client-side when weekly credits are exhausted.
- Existing free-testing report access remains intact.
