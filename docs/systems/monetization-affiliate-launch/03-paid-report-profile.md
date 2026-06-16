# Task 03 - Paid Report Profile

## Goal

Turn the profile/result page into the paid report surface.

## Work

- Keep free report useful but incomplete.
- Add locked sections:
  - Exact sub-season.
  - Full palette.
  - Avoid colors.
  - Makeup shade guide.
  - Jewelry metal guidance.
  - Hair color guidance.
  - Shopping guidance.
- Use existing `SEASONS` data where possible.
- Do not hardcode season names outside `lib/landing-data.ts`.

## Acceptance Criteria

- Free users see macro result and teaser cards.
- Paid users see the full report.
- Locked content communicates value without feeling fake.
- No server-only code is imported into client components.

## Progress

- 2026-06-13: Started after local report/pro unlock wiring shipped.
- 2026-06-13: Free profile now shows macro season and partial palette only; exact sub-season is part of the full report.
- 2026-06-13: Paid report now includes full palette, exact sub-season, makeup, jewelry, hair, avoid-color, contrast, and shopping guidance derived from season/profile data.
- 2026-06-13: Verified `next build` passes and lint remains at 0 errors after report changes.
