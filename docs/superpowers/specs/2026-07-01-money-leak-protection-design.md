# Money-leak protection for AI report generation

Date: 2026-07-01
Status: approved (proceeding to implementation)

## Problem

`/api/report/analyze` (OpenAI, up to 4 calls per request: trait extraction + full
16k-token report generation, each retried once) and `/api/report/generate-visual`
(Replicate `flux-2-pro`) are both callable with **zero authentication, zero
persistence, and zero rate limiting**:

- Anyone can call `/api/report/analyze` directly (no UI needed) unlimited times —
  free, unmetered OpenAI spend per call.
- The generated report is saved only to `localStorage`. If it's cleared, or the
  user opens a second device, `/profile` redirects back to `/style-setup`, which
  silently regenerates (and re-spends on) a report the user already has.
- `/api/report/generate-visual` checks a Supabase Storage cache before calling
  Replicate, but only `if (userId)` — anonymous callers (the current default,
  since nothing requires sign-in) skip the cache entirely, so every request is a
  fresh Replicate charge.
- `generate-visual` also accepts a free-text `prompt` straight from the client
  with no validation — an authenticated caller could submit arbitrary prompt
  text against their own photo, which is both a cost and content-safety hole.

## Goals

1. Every paid AI call requires a real authenticated session, enforced in the
   API route itself (not just the UI).
2. A completed report/image is generated once per user and always served from
   Supabase after that — localStorage becomes a UI-only cache, never the source
   of truth.
3. Concurrent or repeated requests can't trigger duplicate AI calls (hard DB
   lock), but failed or stuck ("stale") generations are safely retryable.
4. Image prompts are rebuilt server-side from the stored report; the client
   only ever sends a `slotId`.
5. All schema changes ship as versioned Supabase CLI migrations, applied only
   after being reviewed — no ad hoc "run this SQL in the dashboard" steps.

## Schema

Two new tables, both additive-only (no changes to existing tables `users`,
`products`, `wardrobe_items`, etc.):

```sql
-- style_reports: one row per user, MVP-intentional (see note below)
CREATE TABLE style_reports (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'generating'
                  CHECK (status IN ('generating', 'done', 'failed')),
  full_report   JSONB,
  mini_result   JSONB,
  wardrobe_type TEXT,
  quiz_answers  JSONB,
  attempt_count INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- FUTURE MULTI-REPORT PATH: to support >1 report per user, add a `report_id
-- UUID DEFAULT gen_random_uuid()` column, change the primary key to
-- (user_id, report_id), and add a partial unique index for "one row per
-- (user_id, input_hash)" if de-duplication by input is still wanted. Not
-- done now because no regenerate/multi-report UI exists yet — YAGNI.

-- report_visuals: one row per (user, slot); same status/lock machinery
CREATE TABLE report_visuals (
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'generating'
                  CHECK (status IN ('generating', 'done', 'failed')),
  image_url     TEXT,
  attempt_count INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, slot_id)
);
```

RLS on both: user can `SELECT`/`INSERT`/`UPDATE` only where `auth.uid() = user_id`.
No public/anon policies — these tables are never touched by unauthenticated
requests, service-role-only reads are not needed since routes run with the
user's own session.

## Claim/lock pattern (shared, used by both tables)

One helper, `claimGeneration(table, key, staleMinutes = 15, maxAttempts = 5)`:

1. `INSERT ... ON CONFLICT (key) DO NOTHING RETURNING *`
   → row returned: we own it, attempt_count = 1, proceed to generate.
2. No row returned (conflict) → `SELECT` the existing row:
   - `status = 'done'` → return `{ owned: false, cached: row }`. Caller streams
     back `row.full_report` / `row.image_url`, makes **zero** AI calls.
   - `status = 'generating'` and fresh (`updated_at` within `staleMinutes`) →
     return `{ owned: false, cached: null }`. Caller responds "still
     generating, retry shortly" (202/409), makes zero AI calls.
   - `status = 'failed'`, or `status = 'generating'` and stale → try to
     reclaim atomically:
     ```sql
     UPDATE <table> SET status='generating', updated_at=NOW(),
       attempt_count = attempt_count + 1
     WHERE <key> AND attempt_count < <maxAttempts>
       AND (status='failed' OR (status='generating' AND updated_at < NOW() - INTERVAL '15 minutes'))
     RETURNING *;
     ```
     - Row returned → we now own it, proceed to generate.
     - Nothing returned → either `attempt_count` hit the cap (return
       "too many attempts, contact support" — this is the rate limit) or
       someone else reclaimed it first in the race window (return "still
       generating").

This bounds worst-case spend per user to `maxAttempts` OpenAI report
generations and `maxAttempts` Replicate calls per image slot (fixed slot
count, ~12–16), with no separate rate-limiter table required.

## API route changes

**`/api/report/analyze`**
- 401 if no Supabase session.
- Claim `style_reports` row keyed on `user_id`. If cached `done` row exists,
  stream it back immediately (season + report chunks, same NDJSON shape the
  client already parses) — no OpenAI calls.
- If not owned (still generating / attempts exhausted), return the
  appropriate non-200 status instead of starting generation.
- On success, `UPDATE ... SET status='done', full_report=..., mini_result=...`.
  On failure, `UPDATE ... SET status='failed'` (never leave a row stuck in
  `generating` past the stale window).

**`/api/report/generate-visual`**
- 401 if no Supabase session (removes the anonymous bypass entirely).
- Request body drops `prompt` — becomes `{ photoDataUrl, slotId }` only.
- Server fetches the user's `style_reports.full_report` (must be `status='done'`,
  else 400 "report not ready"), recomputes `buildImageSlots(full_report,
  wardrobe_type, quiz_answers.reportSections)` (already a pure function with no
  client-only dependencies — safe to run in the route), and looks up `slotId` in
  that list. Unknown `slotId` → 400.
- Claim `report_visuals` row keyed on `(user_id, slot_id)`. Cached `done` → return
  the stored `image_url`, no Replicate call.
- On success, upload to the existing `report-visuals` Storage bucket (unchanged)
  and `UPDATE ... SET status='done', image_url=...`. On failure, `status='failed'`.

## Auth gate (frontend)

`components/style-setup/style-setup-flow.tsx`'s "sections" step currently calls
`handleSubmit()` (→ `/api/report/analyze`) with no auth check at all. Insert an
auth screen (same choice/email/Google pattern as `PostQuizAuthScreen`, no skip
option, matching the ADR-014 precedent already set for the old quiz flow)
between the last quiz step and `handleSubmit`. This is UX only — the real
enforcement is the 401 in the route itself (requirement: server-side auth is
mandatory regardless of what the frontend does).

## `/profile` page changes

On load: check session → fetch the user's `style_reports` row (source of
truth) → render from it. `localStorage` is only written *after* a successful
fetch, purely so the next paint is instant; it is never trusted over a fresh
DB read. If no session, no `/style-setup` flow exists.

## Migration delivery

New Supabase CLI migration files under `supabase/migrations/` (project has no
`supabase/` directory yet — this introduces it). Both migrations are
additive-only: `CREATE TABLE`, `CREATE POLICY`, `CREATE INDEX` — no `ALTER`/
`DROP` touching existing tables or data. Migration files, their diffs, and
their destructiveness will be shown before anything is applied. Since the CLI
isn't yet linked to the Supabase project (`atwjfakbljecxqnebrut`), applying
them needs a one-time `supabase login` + `supabase link` decision from the
user — covered as an open question before implementation starts.

## Out of scope (explicitly not doing now)

- Multi-report-per-user support (documented migration path only).
- A generic cross-route rate-limiter table — the attempt-count-per-row
  mechanism covers the stated need.
- Content-safety review of the fixed server-side prompts themselves (separate
  concern from cost/abuse).
- The landing-page "see sample report" button and the general pre-deploy
  auth/quiz QA pass — deliberately deferred, per the user's own prioritization,
  to follow-up steps after this fix ships.
