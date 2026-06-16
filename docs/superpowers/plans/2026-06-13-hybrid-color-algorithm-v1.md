# Hybrid Color Algorithm v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make color analysis choose seasons from structured visual evidence and deterministic 12-season scoring, preventing the True Winter vs Dark Autumn failure.

**Architecture:** OpenAI Responses API extracts evidence; `lib/color-season-scoring.ts` scores sub-seasons; `lib/analysis-normalizer.ts` publishes the scorer's winner and alternatives. Legacy providers remain as fallbacks.

**Tech Stack:** Next.js route handler, OpenAI SDK Responses API, Zod v4, Node test runner.

---

### Task 1: Regression Test

**Files:**
- Modify: `lib/analysis.test.ts`

- [x] Add a failing test for deep warm coloring wrongly labeled True Winter.
- [x] Run `node --test --experimental-strip-types lib/analysis.test.ts`.
- [x] Confirm failure is `winter !== autumn`.

### Task 2: Deterministic Scorer

**Files:**
- Create: `lib/color-season-scoring.ts`
- Modify: `lib/analysis-normalizer.ts`
- Test: `lib/analysis.test.ts`

- [ ] Add 12 sub-season scoring profiles.
- [ ] Score undertone, depth, contrast, chroma, and evidence keywords.
- [ ] Add a Dark Autumn guard for deep warm earthy evidence.
- [ ] Use scorer output as the final result in the normalizer.
- [ ] Re-run `node --test --experimental-strip-types lib/analysis.test.ts`.

### Task 3: Responses API Color Analysis

**Files:**
- Modify: `lib/analysis.ts`
- Test: existing analysis tests

- [ ] Add a Zod schema for structured color evidence.
- [ ] Call `runStructuredStyleResponse()` with image detail `high`.
- [ ] Default color model to `OPENAI_COLOR_ANALYSIS_MODEL`, then `OPENAI_STYLE_MODEL`, then `gpt-5.4`.
- [ ] Keep legacy OpenAI chat and Gemini fallbacks.

### Task 4: Documentation and Verification

**Files:**
- Modify: `AGENTS.md`
- Modify: `LOGIC.md`
- Modify: `docs/TRACKER.yaml`

- [ ] Document Hybrid Color Algorithm v1.
- [ ] Run tests, TypeScript, and build.
- [ ] Move shipped plan docs to `docs/systems/hybrid-color-algorithm-v1/`.

