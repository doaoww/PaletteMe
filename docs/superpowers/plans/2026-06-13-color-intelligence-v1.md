# Color Intelligence v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the reusable color intelligence layer and wire it into analysis, storage, profile, and scanner UI.

**Architecture:** Add pure helpers first, then attach them to `AnalysisResult`, then let UI consume the same report shape. Persist JSON analysis results locally; never persist uploaded photos.

**Tech Stack:** Next.js App Router, React client components, Node test runner with `--experimental-strip-types`, existing Gemini/OpenAI analysis route.

---

### Task 1: Report Helper

**Files:**
- Create: `lib/color-intelligence.test.ts`
- Create: `lib/color-intelligence.ts`

- [ ] **Step 1:** Write tests for warm/cool reports, free preview, scanner strings, and fallbacks.
- [ ] **Step 2:** Run `node --test --experimental-strip-types lib\color-intelligence.test.ts` and confirm it fails because the module does not exist.
- [ ] **Step 3:** Implement `buildColorIntelligenceReport()` and `getFreeColorPreview()`.
- [ ] **Step 4:** Run the test and confirm it passes.

### Task 2: Analysis Storage

**Files:**
- Create: `lib/analysis-storage.test.ts`
- Create: `lib/analysis-storage.ts`

- [ ] **Step 1:** Write tests for saving, loading, invalid JSON, and clearing.
- [ ] **Step 2:** Run the storage test and confirm it fails because the module does not exist.
- [ ] **Step 3:** Implement storage helper with injected storage support.
- [ ] **Step 4:** Run the storage test and confirm it passes.

### Task 3: Analysis Schema

**Files:**
- Modify: `lib/analysis.ts`
- Modify: `app/api/analyze/route.ts` only if response shape requires route changes.

- [ ] **Step 1:** Extend `AnalysisResult` types with `chroma`, `features`, and `report`.
- [ ] **Step 2:** Extend the prompt JSON shape with the new fields.
- [ ] **Step 3:** Normalize missing raw values and attach `buildColorIntelligenceReport()`.
- [ ] **Step 4:** Run helper tests.

### Task 4: UI Integration

**Files:**
- Modify: `components/dashboard/color-analyzer.tsx`
- Modify: `components/quiz/quiz-selfie-step.tsx`
- Modify: `app/profile/page.tsx`
- Modify: `components/profile/profile-view.tsx`

- [ ] **Step 1:** Save analysis results after successful analyze calls.
- [ ] **Step 2:** Load saved analysis in profile page and pass it to `ProfileView`.
- [ ] **Step 3:** Show chroma and feature notes in result UIs.
- [ ] **Step 4:** Use report data in paid profile and scanner best-color payload.

### Task 5: Verify And Document

**Files:**
- Modify: `docs/TRACKER.yaml`
- Modify: `docs/plans/2026-06-13-color-intelligence-v1/*.md`

- [ ] **Step 1:** Run `node --test --experimental-strip-types lib\color-intelligence.test.ts lib\analysis-storage.test.ts lib\premium.test.ts lib\outfit-scan.test.ts lib\affiliate.test.ts`.
- [ ] **Step 2:** Run `.\node_modules\.bin\eslint.cmd`.
- [ ] **Step 3:** Run `.\node_modules\.bin\next.cmd build`.
- [ ] **Step 4:** Update tracker and task docs.
