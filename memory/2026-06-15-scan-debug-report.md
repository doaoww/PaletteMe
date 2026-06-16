# Scan Debug Report - 2026-06-15

## Symptom

Clothing scan either did not work well or produced weak verdicts.

## Root Cause

- Scan and wardrobe capture reused `SelfieCapture` with `facingMode: "user"` and selfie labels, so mobile users were pushed toward the front camera for clothing/item photos.
- AI scan image input used `detail: "low"`, which is too weak for clothing colors, texture, makeup shades, and product screenshots.
- Scan profile payload used broad macro-season palettes instead of the exact sub-season palette when available.
- UI adaptation dropped structured AI fields such as confidence, styling tips, and better alternatives.
- Existing scan tests had drifted from current palette data and still expected an old Autumn swatch.

## Fix

- Added configurable camera facing mode and capture labels to `SelfieCapture`.
- Scan and wardrobe item capture now request `environment` camera and use item-specific capture labels.
- Scan AI input now sends high-detail images.
- Scan profile payload now uses exact sub-season palette names and avoid colors when available.
- Scan prompt now asks for visible garment evidence, score bands, confidence rules, and practical styling advice.
- Scan UI adapter now preserves confidence, styling tips, and better alternatives.

## Verification

- `node --test --experimental-strip-types lib\selfie-capture.test.ts lib\server\ai\scan.test.ts lib\server\ai\schemas.test.ts lib\outfit-scan.test.ts lib\scan-credits.test.ts` passed, 37/37.
- `node_modules\.bin\eslint.cmd components\selfie\selfie-capture.tsx components\scan\scan-flow.tsx components\wardrobe\add-item-flow.tsx lib\selfie-capture.ts lib\server\ai\scan.ts lib\server\ai\prompts.ts lib\outfit-scan.ts` passed.
- `node node_modules\next\dist\bin\next build` passed.
- Playwright mobile smoke for `/scan` passed with no horizontal overflow and no selfie capture label in the scan upload flow.

## Remaining Risk

Live OpenAI quality still needs to be tested with real clothing photos from the user. Synthetic/headless checks can verify wiring, but not whether the verdict feels stylistically accurate on real garments.
