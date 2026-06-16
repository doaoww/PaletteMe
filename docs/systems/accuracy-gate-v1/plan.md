# Accuracy Gate v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make selfie color analysis honest and trustable by refusing non-human or unreliable images and returning richer evidence for valid selfies.

**Architecture:** Keep the existing Next.js `/api/analyze` route and `lib/analysis.ts` provider cascade. Add a pure normalization/gating layer that transforms model JSON into `AnalysisResult` or throws `AnalysisRetakeError`, then update the UI to show the structured retake message.

**Tech Stack:** Next.js 16 route handlers, OpenAI/Gemini vision providers, TypeScript, Node test runner, existing PaletteMe UI tokens.

---

## Files

- Modify `lib/analysis.ts` with the accuracy schema, retake error, stronger prompt, and normalizer.
- Create `lib/analysis.test.ts` for no-face, poor-quality, valid-result, and alternatives behavior.
- Modify `app/api/analyze/route.ts` to return 422 for retake/no-face cases.
- Modify `components/quiz/quiz-selfie-step.tsx`, `components/quiz/quiz-flow.tsx`, and `components/dashboard/color-analyzer.tsx` to read `message` from the API and show clear selfie guidance.
- Update `lib/analysis-storage.ts` so new result fields are safe to persist.
- Document the system after validation.

## Tasks

### 01 - Analysis contract and tests

- [ ] Write failing `lib/analysis.test.ts`.
- [ ] Implement `AnalysisRetakeError` and `normalizeRawAnalysisResult`.
- [ ] Confirm focused tests pass.

### 02 - API route and UI handling

- [ ] Return 422 for `AnalysisRetakeError` from `/api/analyze`.
- [ ] Show `data.message` in quiz/dashboard clients.
- [ ] Ensure non-human uploads use the selfie-specific message.

### 03 - Docs and validation

- [ ] Update docs and tracker.
- [ ] Run node tests, TypeScript, and Next build.
- [ ] Ship the plan to `docs/systems/accuracy-gate-v1/`.
