# Task 03 - AI Analysis Schema

## Goal

Ask AI for deeper observations and normalize them into the new analysis result shape.

## Work

- Extend prompt output with `chroma` and `features`.
- Normalize raw chroma/features in `lib/analysis.ts`.
- Attach `report` from `buildColorIntelligenceReport()`.

## Acceptance Criteria

- Existing clients still receive old fields.
- Missing AI fields get safe defaults.
- API route remains `runtime = "nodejs"`.

## Progress

- 2026-06-13: Extended `AnalysisResult` with `traits.chroma`, `features`, and `report`.
- 2026-06-13: Updated the AI prompt to request chroma and skin/hair/eye feature notes.
- 2026-06-13: Added safe defaults for missing chroma and feature notes, then attached `buildColorIntelligenceReport()`.
