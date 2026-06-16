# AI Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the design-independent backend foundation for OpenAI-powered color, clothing, makeup, product, wardrobe, and outfit decisions.

**Architecture:** Keep one Next.js app, with route handlers in `app/api` and server-only backend logic in `lib/server`. Small quiz/profile work can stay synchronous, while heavier photo and scan work can run through a job abstraction. AI outputs use Zod-backed structured outputs so the frontend receives stable verdict cards.

**Tech Stack:** Next.js 16 route handlers, OpenAI Responses API, Zod v4, Supabase-ready data shapes, Upstash-backed rate limiting where configured, Node test runner.

---

## Files

- Create `lib/server/ai/schemas.ts` for shared verdict, scan, wardrobe, and outfit schemas.
- Create `lib/server/ai/prompts.ts` for reusable prompt blocks.
- Create `lib/server/openai.ts` for the server-side OpenAI Responses adapter.
- Create `lib/server/ai/jobs.ts` for an in-memory async job runner that can later move to Supabase/queue workers.
- Create `app/api/ai/scan/route.ts` for the new scan contract.
- Create `app/api/ai/jobs/[id]/route.ts` for job status polling.
- Create `app/api/wardrobe/route.ts` for wardrobe item normalization and storage contract.
- Create `app/api/outfits/route.ts` for outfit generation contract.
- Add tests for schemas, job behavior, and route helper logic.

## Scope

This plan does not replace the current UI and does not migrate every legacy route. It creates stable backend contracts that Claude Design can wire into later.

## Success Criteria

- OpenAI calls stay server-side.
- New AI output shapes include verdict, confidence, reason, next action, and correction options.
- Heavy scan requests can be submitted as jobs and polled by the UI.
- Backend remains useful when Supabase is not configured.
- Tests cover the behavior that future UI work depends on.
