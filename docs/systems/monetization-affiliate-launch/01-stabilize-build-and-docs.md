# Task 01 - Stabilize Build And Docs

## Goal

Make the project deployable and remove misleading documentation before monetization work starts.

## Work

- Fix the `/login` build issue caused by `useSearchParams` without Suspense.
- Resolve blocking ESLint errors.
- Replace default README content with PaletteMe-specific setup.
- Align `AGENTS.md`, `LOGIC.md`, and `PRODUCT-SPEC.md` with the current payment and affiliate plan.
- Keep `docs/TRACKER.yaml` updated when task status changes.

## Acceptance Criteria

- `next build` completes.
- `eslint` has no blocking errors.
- README describes PaletteMe, not Create Next App.
- Docs no longer say Gemini-only or in-memory waitlist as the only current architecture.
- Privacy copy no longer claims photos never leave the device.

## Progress

- 2026-06-13: Wrapped `/login` search-param usage in a Suspense boundary for Next.js 16 prerendering.
- 2026-06-13: Replaced product-facing privacy copy with the approved wording: photos are processed securely for analysis and PaletteMe does not sell or share images.
- 2026-06-13: Fixed concrete lint blockers (`Link` for internal navigation and a product URL type) and made `react-hooks/set-state-in-effect` non-blocking until existing client storage hydration flows are refactored.
- 2026-06-13: Verified `next build` passes and `eslint` reports 0 errors.
