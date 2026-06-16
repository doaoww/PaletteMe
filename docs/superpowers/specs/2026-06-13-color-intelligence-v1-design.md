# Color Intelligence v1 Design

## User Goal

PaletteMe should feel like it identifies a real personal color profile, not just a season label. The app should explain undertone, contrast, depth, chroma, visible feature notes, best/avoid colors, makeup, jewelry, hair guidance, and scanner shopping guidance.

## Product Split

Free users see macro season, a short analysis, key traits, feature notes, and a partial palette preview.

Paid report users see exact sub-season, full palette, avoid colors, neutrals, accents, makeup shades, jewelry metals, hair direction, contrast rule, and shopping guidance.

Pro users also use the scanner, which should receive the same best-color guidance used by the report.

## Implementation Shape

Add a client/server-safe `lib/color-intelligence.ts` helper. It accepts season, sub-season, traits, chroma, optional feature notes, and optional quiz context, then returns a stable `ColorIntelligenceReport`.

Extend `AnalysisResult` in `lib/analysis.ts` with:

- `chroma`
- `features`
- `report`

Add `lib/analysis-storage.ts` to persist the latest JSON result only. Do not store photos or object URLs.

## Safety

AI may omit new fields. The app must normalize missing fields and generate useful report data from `SEASONS` and traits.

Client components may import type-only analysis types, but must not import server-only provider clients.

## Verification

Use Node's built-in test runner because local `npm test` is broken:

```powershell
node --test --experimental-strip-types lib\color-intelligence.test.ts lib\analysis-storage.test.ts
```

Then run:

```powershell
.\node_modules\.bin\eslint.cmd
.\node_modules\.bin\next.cmd build
```
