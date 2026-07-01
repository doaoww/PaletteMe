# Money-Leak Protection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Task 2 and Task 12 are orchestrator-only** (they require the human's Supabase CLI login/link and a design walkthrough) — do not dispatch them to a subagent; the main session handles them directly.

**Goal:** Close the unauthenticated AI-spend hole in `/api/report/analyze` and `/api/report/generate-visual` by requiring a real Supabase session on both routes, persisting reports/images to Supabase (source of truth), and using an atomic DB claim/lock so a report or image is only ever generated once per user (retryable on failure/staleness, capped on abuse).

**Architecture:** Two new Postgres tables (`style_reports`, `report_visuals`) each act as a claim/lock + cache, keyed on `user_id` (and `user_id, slot_id` for visuals). A single generic pure function decides what to do given a row's current state (use cache / proceed / wait / exhausted); a thin I/O wrapper turns that decision into Supabase `upsert`/`update` calls using ordinary RLS-scoped PostgREST filters — no custom Postgres functions needed. Both API routes call this before touching OpenAI/Replicate. The frontend gains an auth gate before the expensive call, and `/profile` reads Supabase as truth with localStorage only as a paint cache.

**Tech Stack:** Next.js 16 route handlers (Node runtime), Supabase (Postgres + Auth + Storage) via `@supabase/ssr`, Zod, existing `lib/shared/rate-limit.ts` (Upstash-backed), `node --test` for unit tests.

## Global Constraints

- Every new/changed route handler that touches a paid AI provider MUST return 401 if `supabase.auth.getUser()` has no user — enforced server-side, never trust the frontend gate alone.
- All schema changes ship as files under `supabase/migrations/`, reviewed before being applied — never as "run this in the SQL editor" instructions.
- Migrations in this plan are additive-only: `CREATE TABLE`, `CREATE POLICY`, `CREATE INDEX`. No `ALTER`/`DROP` touching existing tables (`users`, `products`, `wardrobe_items`, `scan_history`, `outfit_checks`, `waitlist`).
- `localStorage` is a UI-paint cache only, written *after* a successful Supabase read/write, never read as the authoritative value once a session exists.
- Reuse one claim/lock implementation for both `style_reports` and `report_visuals` — no per-table copy of the decision logic.
- Image generation prompts are built server-side only, from the stored report. The client sends `slotId` (and the photo) — never a prompt string.
- Follow existing repo conventions: imports use the `@/` alias, tests use `node:test` + `node:assert/strict` (see `lib/db/supabase-db.test.ts` for the pattern — pure logic gets unit tests; live Supabase/OpenAI/Replicate calls are verified manually, since this repo has no test DB harness).
- `npm test` and `npm run lint` must pass after every task before committing.

---

### Task 1: Scaffold Supabase CLI + write both migration files (no login required)

**Files:**
- Create: `supabase/config.toml` (via `supabase init`)
- Create: `supabase/migrations/20260701120000_create_style_reports.sql`
- Create: `supabase/migrations/20260701120100_create_report_visuals.sql`

**Interfaces:**
- Produces: the `style_reports` and `report_visuals` table shapes that every later task reads/writes:
  - `style_reports(user_id UUID PK, status TEXT, full_report JSONB, mini_result JSONB, wardrobe_type TEXT, quiz_answers JSONB, attempt_count INT, created_at, updated_at)`
  - `report_visuals(user_id UUID, slot_id TEXT, status TEXT, image_url TEXT, attempt_count INT, created_at, updated_at, PK(user_id, slot_id))`

- [ ] **Step 1: Initialize the Supabase CLI project (no network/login needed for this)**

Run: `npx supabase init`
Expected: creates `supabase/config.toml`, `supabase/.gitignore`, `supabase/migrations/` (empty). If prompted "Generate VS Code settings?" answer `n`.

- [ ] **Step 2: Write the `style_reports` migration**

Create `supabase/migrations/20260701120000_create_style_reports.sql`:

```sql
-- style_reports: one row per authenticated user holding their generated
-- style report. Cache + claim/lock table for /api/report/analyze.
--
-- INTENTIONAL MVP DECISION: primary key is user_id alone — one active
-- report per user. No regenerate/multi-report UI exists yet.
--
-- FUTURE MULTI-REPORT PATH: to support more than one report per user,
-- add `report_id UUID DEFAULT gen_random_uuid()`, change the primary key
-- to (user_id, report_id), and add a separate unique index if
-- de-duplication by input (e.g. same photo) is still wanted. This is a
-- schema migration, not a rewrite of the claim logic — the claim helper
-- in lib/server/generation-lock.ts is already keyed generically.

CREATE TABLE IF NOT EXISTS style_reports (
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

ALTER TABLE style_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "style_reports_select_own"
  ON style_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "style_reports_insert_own"
  ON style_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "style_reports_update_own"
  ON style_reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS style_reports_status_idx ON style_reports(status);
```

- [ ] **Step 3: Write the `report_visuals` migration**

Create `supabase/migrations/20260701120100_create_report_visuals.sql`:

```sql
-- report_visuals: one row per (user, slot) — claim/lock + cache table
-- for /api/report/generate-visual. Mirrors style_reports' status
-- machinery exactly (see lib/server/generation-lock.ts).

CREATE TABLE IF NOT EXISTS report_visuals (
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

ALTER TABLE report_visuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "report_visuals_select_own"
  ON report_visuals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "report_visuals_insert_own"
  ON report_visuals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "report_visuals_update_own"
  ON report_visuals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS report_visuals_status_idx ON report_visuals(status);
```

- [ ] **Step 4: Validate SQL syntax locally without a live DB**

Run: `npx supabase db lint --schema public 2>&1 || echo "lint needs a linked project — skip if it only complains about missing link"`
Expected: no syntax errors reported. If the command fails purely because no project is linked yet (not because of a SQL error), that's fine — this step is a syntax sanity check only, not full validation. Actual validation happens in Task 12 against the real project.

- [ ] **Step 5: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase migrations for style_reports and report_visuals

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Present migrations for review (orchestrator-only, not subagent work)

**Files:** none (review checkpoint)

This task has no code changes. The orchestrating session must:
1. Show the user both migration files in full.
2. State plainly: "Both migrations are additive-only — `CREATE TABLE IF NOT EXISTS`, `CREATE POLICY`, `CREATE INDEX`. Nothing alters or drops existing tables or data. Non-destructive."
3. Confirm the user has run `supabase login` (they said they'd do this themselves).
4. Run `npx supabase link --project-ref atwjfakbljecxqnebrut` (will prompt for the DB password interactively — the user provides it directly to the CLI prompt, not to the agent).
5. Do **not** run `supabase db push` yet — that happens in Task 12, after Tasks 3–11 (the application code) are implemented and tested, so schema and code land together and there's one clear point where the user can say "go."

- [ ] **Step 1: Show migration files and get explicit non-destructive confirmation from the user before proceeding to Task 3.**

---

### Task 3: Pure claim-decision logic

**Files:**
- Create: `lib/server/generation-lock.ts`
- Test: `lib/server/generation-lock.test.ts`

**Interfaces:**
- Consumes: nothing (pure logic, no Supabase import).
- Produces:
  - `type LockRow = { status: "generating" | "done" | "failed"; updated_at: string; attempt_count: number }`
  - `type ClaimDecision = { action: "use-cached" } | { action: "still-generating" } | { action: "attempts-exhausted" } | { action: "reclaim" } | { action: "proceed" }`
  - `function decideClaim(existingRow: LockRow | null, now: Date, staleMinutes: number, maxAttempts: number): ClaimDecision`
  - Used by Task 4's `claimGenerationRow`.

- [ ] **Step 1: Write the failing tests**

Create `lib/server/generation-lock.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { decideClaim } from "@/lib/server/generation-lock";

const NOW = new Date("2026-07-01T12:00:00.000Z");

test("no existing row -> proceed (fresh insert already happened)", () => {
  const decision = decideClaim(null, NOW, 15, 5);
  assert.deepEqual(decision, { action: "proceed" });
});

test("row done -> use cached, never regenerate", () => {
  const row = { status: "done" as const, updated_at: NOW.toISOString(), attempt_count: 1 };
  const decision = decideClaim(row, NOW, 15, 5);
  assert.deepEqual(decision, { action: "use-cached" });
});

test("row generating and fresh -> still generating, do not start a second AI call", () => {
  const row = {
    status: "generating" as const,
    updated_at: new Date(NOW.getTime() - 2 * 60 * 1000).toISOString(),
    attempt_count: 1,
  };
  const decision = decideClaim(row, NOW, 15, 5);
  assert.deepEqual(decision, { action: "still-generating" });
});

test("row generating and stale (>15min) -> reclaim allowed", () => {
  const row = {
    status: "generating" as const,
    updated_at: new Date(NOW.getTime() - 16 * 60 * 1000).toISOString(),
    attempt_count: 1,
  };
  const decision = decideClaim(row, NOW, 15, 5);
  assert.deepEqual(decision, { action: "reclaim" });
});

test("row generating and exactly at the stale boundary is NOT stale", () => {
  const row = {
    status: "generating" as const,
    updated_at: new Date(NOW.getTime() - 15 * 60 * 1000).toISOString(),
    attempt_count: 1,
  };
  const decision = decideClaim(row, NOW, 15, 5);
  assert.deepEqual(decision, { action: "still-generating" });
});

test("row failed with attempts remaining -> reclaim allowed", () => {
  const row = { status: "failed" as const, updated_at: NOW.toISOString(), attempt_count: 3 };
  const decision = decideClaim(row, NOW, 15, 5);
  assert.deepEqual(decision, { action: "reclaim" });
});

test("row failed but attempts exhausted -> attempts-exhausted, no reclaim", () => {
  const row = { status: "failed" as const, updated_at: NOW.toISOString(), attempt_count: 5 };
  const decision = decideClaim(row, NOW, 15, 5);
  assert.deepEqual(decision, { action: "attempts-exhausted" });
});

test("row stale-generating but attempts exhausted -> attempts-exhausted, no reclaim", () => {
  const row = {
    status: "generating" as const,
    updated_at: new Date(NOW.getTime() - 20 * 60 * 1000).toISOString(),
    attempt_count: 5,
  };
  const decision = decideClaim(row, NOW, 15, 5);
  assert.deepEqual(decision, { action: "attempts-exhausted" });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test --experimental-strip-types lib/server/generation-lock.test.ts`
Expected: FAIL — `Cannot find module '@/lib/server/generation-lock'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `lib/server/generation-lock.ts`:

```ts
export type LockRow = {
  status: "generating" | "done" | "failed";
  updated_at: string;
  attempt_count: number;
};

export type ClaimDecision =
  | { action: "use-cached" }
  | { action: "still-generating" }
  | { action: "attempts-exhausted" }
  | { action: "reclaim" }
  | { action: "proceed" };

export function decideClaim(
  existingRow: LockRow | null,
  now: Date,
  staleMinutes: number,
  maxAttempts: number,
): ClaimDecision {
  if (!existingRow) return { action: "proceed" };

  if (existingRow.status === "done") return { action: "use-cached" };

  const isStale =
    existingRow.status === "generating" &&
    now.getTime() - new Date(existingRow.updated_at).getTime() > staleMinutes * 60 * 1000;

  const isReclaimable = existingRow.status === "failed" || isStale;

  if (!isReclaimable) return { action: "still-generating" };

  if (existingRow.attempt_count >= maxAttempts) return { action: "attempts-exhausted" };

  return { action: "reclaim" };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test --experimental-strip-types lib/server/generation-lock.test.ts`
Expected: PASS — all 8 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/server/generation-lock.ts lib/server/generation-lock.test.ts
git commit -m "feat: add pure claim-decision logic for generation locks

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Generic Supabase I/O wrapper around the claim decision

**Files:**
- Modify: `lib/server/generation-lock.ts` (add to the same file — it's the natural home for both the decision and the thin I/O wrapper around it)

**Interfaces:**
- Consumes: `decideClaim` from Task 3; a `SupabaseClient` (from `@supabase/supabase-js`, already a dependency) passed in by the caller (the route handler owns which client — user-session-scoped — to use).
- Produces:
  ```ts
  type ClaimResult<Row> =
    | { outcome: "use-cached"; row: Row }
    | { outcome: "still-generating" }
    | { outcome: "attempts-exhausted" }
    | { outcome: "owned"; row: Row };

  async function claimGenerationRow<Row extends LockRow>(params: {
    supabase: SupabaseClient;
    table: "style_reports" | "report_visuals";
    match: Record<string, string>; // e.g. { user_id } or { user_id, slot_id }
    staleMinutes?: number;
    maxAttempts?: number;
  }): Promise<ClaimResult<Row>>

  async function finalizeGeneration(params: {
    supabase: SupabaseClient;
    table: "style_reports" | "report_visuals";
    match: Record<string, string>;
    patch: Record<string, unknown>; // must include status: "done" | "failed"
  }): Promise<void>
  ```
  Both `/api/report/analyze` (Task 6) and `/api/report/generate-visual` (Task 7) call these two functions and nothing else for locking.

- [ ] **Step 1: Write the failing test (uses a minimal fake Supabase client — no live DB)**

Append to `lib/server/generation-lock.test.ts`:

```ts
import { claimGenerationRow, finalizeGeneration } from "@/lib/server/generation-lock";

// Order-agnostic chainable fake: real Supabase/PostgREST filter builders let
// you call .eq()/.lt()/.or() in any order before a terminal .select()/
// .maybeSingle(), and claimGenerationRow's actual call order differs between
// the "select existing row" path (select -> eq -> maybeSingle) and the
// "reclaim" path (update -> lt -> or -> eq -> select). A fake that hardcodes
// one fixed order would break the moment the implementation's call order
// didn't match it exactly, so every filter method just returns the same
// chainable node regardless of order.
function makeFakeSupabase(opts: {
  upsertReturns: unknown[];
  selectReturns: unknown[];
  updateReturns: unknown[];
}) {
  const calls: { method: string; args: unknown }[] = [];

  function chainable(terminalData: unknown) {
    const node: Record<string, (...args: unknown[]) => unknown> = {};
    const record = (name: string) => (...args: unknown[]) => {
      calls.push({ method: name, args });
      return node;
    };
    node.eq = record("eq");
    node.lt = record("lt");
    node.or = record("or");
    node.select = () => {
      calls.push({ method: "select-terminal", args: undefined });
      return Promise.resolve({ data: terminalData, error: null });
    };
    node.maybeSingle = () => {
      calls.push({ method: "maybeSingle", args: undefined });
      return Promise.resolve({ data: (terminalData as unknown[])[0] ?? null, error: null });
    };
    return node;
  }

  return {
    calls,
    client: {
      from(table: string) {
        return {
          upsert(row: unknown, upsertOpts: unknown) {
            calls.push({ method: "upsert", args: { table, row, upsertOpts } });
            return chainable(opts.upsertReturns);
          },
          select() {
            calls.push({ method: "select-start", args: { table } });
            return chainable(opts.selectReturns);
          },
          update(patch: unknown) {
            calls.push({ method: "update", args: { table, patch } });
            return chainable(opts.updateReturns);
          },
        };
      },
    },
  };
}

test("claimGenerationRow: fresh insert succeeds -> owned", async () => {
  const fake = makeFakeSupabase({
    upsertReturns: [{ status: "generating", updated_at: new Date().toISOString(), attempt_count: 1 }],
    selectReturns: [],
    updateReturns: [],
  });
  const result = await claimGenerationRow({
    supabase: fake.client as never,
    table: "style_reports",
    match: { user_id: "u1" },
  });
  assert.equal(result.outcome, "owned");
});

test("claimGenerationRow: conflict + cached done row -> use-cached, no update attempted", async () => {
  const fake = makeFakeSupabase({
    upsertReturns: [],
    selectReturns: [{ status: "done", updated_at: new Date().toISOString(), attempt_count: 1, full_report: { x: 1 } }],
    updateReturns: [],
  });
  const result = await claimGenerationRow({
    supabase: fake.client as never,
    table: "style_reports",
    match: { user_id: "u1" },
  });
  assert.equal(result.outcome, "use-cached");
  assert.equal(fake.calls.some(c => c.method === "update"), false);
});

test("claimGenerationRow: conflict + fresh generating row -> still-generating, no update attempted", async () => {
  const fake = makeFakeSupabase({
    upsertReturns: [],
    selectReturns: [{ status: "generating", updated_at: new Date().toISOString(), attempt_count: 1 }],
    updateReturns: [],
  });
  const result = await claimGenerationRow({
    supabase: fake.client as never,
    table: "style_reports",
    match: { user_id: "u1" },
  });
  assert.equal(result.outcome, "still-generating");
});

test("claimGenerationRow: conflict + failed row + successful reclaim -> owned", async () => {
  const fake = makeFakeSupabase({
    upsertReturns: [],
    selectReturns: [{ status: "failed", updated_at: new Date().toISOString(), attempt_count: 2 }],
    updateReturns: [{ status: "generating", updated_at: new Date().toISOString(), attempt_count: 3 }],
  });
  const result = await claimGenerationRow({
    supabase: fake.client as never,
    table: "style_reports",
    match: { user_id: "u1" },
  });
  assert.equal(result.outcome, "owned");
});

test("claimGenerationRow: conflict + failed row + lost reclaim race -> still-generating", async () => {
  const fake = makeFakeSupabase({
    upsertReturns: [],
    selectReturns: [{ status: "failed", updated_at: new Date().toISOString(), attempt_count: 2 }],
    updateReturns: [], // someone else reclaimed it first
  });
  const result = await claimGenerationRow({
    supabase: fake.client as never,
    table: "style_reports",
    match: { user_id: "u1" },
  });
  assert.equal(result.outcome, "still-generating");
});

test("finalizeGeneration: calls update with the given patch", async () => {
  const fake = makeFakeSupabase({ upsertReturns: [], selectReturns: [], updateReturns: [{}] });
  await finalizeGeneration({
    supabase: fake.client as never,
    table: "style_reports",
    match: { user_id: "u1" },
    patch: { status: "done", full_report: { x: 1 } },
  });
  const updateCall = fake.calls.find(c => c.method === "update");
  assert.ok(updateCall);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test --experimental-strip-types lib/server/generation-lock.test.ts`
Expected: FAIL — `claimGenerationRow`/`finalizeGeneration` not exported yet.

- [ ] **Step 3: Implement `claimGenerationRow` and `finalizeGeneration`**

Append to `lib/server/generation-lock.ts`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

export type ClaimResult<Row> =
  | { outcome: "use-cached"; row: Row }
  | { outcome: "still-generating" }
  | { outcome: "attempts-exhausted" }
  | { outcome: "owned"; row: Row };

const DEFAULT_STALE_MINUTES = 15;
const DEFAULT_MAX_ATTEMPTS = 5;

export async function claimGenerationRow<Row extends LockRow>(params: {
  supabase: SupabaseClient;
  table: "style_reports" | "report_visuals";
  match: Record<string, string>;
  staleMinutes?: number;
  maxAttempts?: number;
}): Promise<ClaimResult<Row>> {
  const { supabase, table, match } = params;
  const staleMinutes = params.staleMinutes ?? DEFAULT_STALE_MINUTES;
  const maxAttempts = params.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const nowIso = new Date().toISOString();

  // Try to claim a brand-new row. ignoreDuplicates -> INSERT ... ON CONFLICT DO NOTHING.
  const { data: inserted } = await supabase
    .from(table)
    .upsert(
      { ...match, status: "generating", attempt_count: 1, updated_at: nowIso },
      { onConflict: Object.keys(match).join(","), ignoreDuplicates: true },
    )
    .select();

  if (inserted && inserted.length > 0) {
    return { outcome: "owned", row: inserted[0] as Row };
  }

  // Someone already owns the row (or owned it before) — read current state.
  let query = supabase.from(table).select("*");
  for (const [key, value] of Object.entries(match)) {
    query = query.eq(key, value);
  }
  const { data: existing } = await query.maybeSingle();

  const decision = decideClaim(existing as LockRow | null, new Date(), staleMinutes, maxAttempts);

  if (decision.action === "use-cached") {
    return { outcome: "use-cached", row: existing as Row };
  }
  if (decision.action === "still-generating") {
    return { outcome: "still-generating" };
  }
  if (decision.action === "attempts-exhausted") {
    return { outcome: "attempts-exhausted" };
  }

  // decision.action === "reclaim" -> atomic conditional UPDATE.
  const existingRow = existing as LockRow;
  const staleThreshold = new Date(Date.now() - staleMinutes * 60 * 1000).toISOString();

  let updateQuery = supabase
    .from(table)
    .update({
      status: "generating",
      updated_at: nowIso,
      attempt_count: existingRow.attempt_count + 1,
    })
    .lt("attempt_count", maxAttempts)
    .or(`status.eq.failed,and(status.eq.generating,updated_at.lt.${staleThreshold})`);
  for (const [key, value] of Object.entries(match)) {
    updateQuery = updateQuery.eq(key, value);
  }
  const { data: reclaimed } = await updateQuery.select();

  if (reclaimed && reclaimed.length > 0) {
    return { outcome: "owned", row: reclaimed[0] as Row };
  }
  // Lost the race — someone else reclaimed it between our SELECT and UPDATE.
  return { outcome: "still-generating" };
}

export async function finalizeGeneration(params: {
  supabase: SupabaseClient;
  table: "style_reports" | "report_visuals";
  match: Record<string, string>;
  patch: Record<string, unknown>;
}): Promise<void> {
  const { supabase, table, match, patch } = params;
  let query = supabase.from(table).update({ ...patch, updated_at: new Date().toISOString() });
  for (const [key, value] of Object.entries(match)) {
    query = query.eq(key, value);
  }
  await query;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test --experimental-strip-types lib/server/generation-lock.test.ts`
Expected: PASS — all tests green (8 from Task 3 + 6 from this task).

- [ ] **Step 5: Commit**

```bash
git add lib/server/generation-lock.ts lib/server/generation-lock.test.ts
git commit -m "feat: add Supabase-backed claim/finalize wrapper for generation locks

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Wire rate limiting into the existing shared helper (no new file)

**Files:**
- Modify: none yet — this task just confirms the helper signature Tasks 6–7 will call.

**Interfaces:**
- Consumes: `lib/shared/rate-limit.ts`'s existing `checkRateLimit(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }>` — already implemented, Upstash-backed when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are set (both are already in `.env.local`), falling back to in-memory otherwise.
- Produces: nothing new. Tasks 6 and 7 call `checkRateLimit(\`report-analyze:${userId}\`, 5, 60 * 60 * 1000)` and `checkRateLimit(\`generate-visual:${userId}\`, 60, 60 * 60 * 1000)` respectively, and return 429 when `allowed` is false.

- [ ] **Step 1: Confirm the helper still works standalone**

Run: `node --test --experimental-strip-types lib/shared/rate-limit.ts 2>&1 | head -5 || true`

There's no existing test file for this helper and none is required here (it's pre-existing, unmodified code) — this step is just a sanity import check.

Run instead: `node -e "require('node:module')" && node --experimental-strip-types -e "import('./lib/shared/rate-limit.ts').then(m => console.log(typeof m.checkRateLimit))"`
Expected: prints `function`.

- [ ] **Step 2: No commit needed — no files changed in this task.**

---

### Task 6: Rewrite `/api/report/analyze` with auth, rate limit, and claim/cache

**Files:**
- Modify: `app/api/report/analyze/route.ts` (currently 335 lines, no auth/persistence at all — see Task description below for the exact diff)
- Test: `app/api/report/analyze/route.test.ts`

**Interfaces:**
- Consumes: `claimGenerationRow`, `finalizeGeneration` from `lib/server/generation-lock.ts` (Task 4); `checkRateLimit` from `lib/shared/rate-limit.ts`; `createClient` from `lib/db/supabase-server.ts` (already used elsewhere, returns a cookie-scoped `SupabaseClient`); existing `extractTraits`, `generateReport`, `scoreColorSeasonCandidates`, `applyConfirmedSeasonToReport`, `validateGeneratedReport`, `SEASON_PALETTE_REFERENCE` (all already imported in this file — unchanged).
- Produces: same NDJSON stream shape the client already parses (`{type:"season",...}` then `{type:"report", data}` then `close()`), PLUS new non-stream JSON error responses: `401` (no session), `429` (rate limited or attempts exhausted), `409` (still generating). `style-setup-flow.tsx` (Task 10) is updated to handle `409` specially.

The route becomes, in full (replace the entire file):

```ts
export const runtime = "nodejs";
export const maxDuration = 90;

import { z } from "zod";
import { runStructuredStyleResponse } from "@/server/services/openai";
import { AnalysisResultSchema } from "@/lib/report/report-schema";
import { scoreColorSeasonCandidates } from "@/lib/analysis/color-season-scoring";
import { applyConfirmedSeasonToReport } from "@/lib/report/confirmed-season";
import { SEASON_PALETTE_REFERENCE } from "@/lib/report/season-palettes";
import { EXTRACTION_INSTRUCTIONS, REPORT_INSTRUCTIONS } from "./prompts";
import { validateGeneratedReport } from "@/lib/report/validate-report";
import { createClient } from "@/lib/db/supabase-server";
import { claimGenerationRow, finalizeGeneration, type LockRow } from "@/lib/server/generation-lock";
import { checkRateLimit } from "@/lib/shared/rate-limit";

export const REPORT_SECTION_VALUES = ["colors", "hair", "makeup", "glasses", "outfits"] as const;
export type ReportSection = typeof REPORT_SECTION_VALUES[number];

const QuizAnswersSchema = z.object({
  occasion:       z.enum(["everyday", "work", "events", "everything"]).nullish(),
  styleConcern:   z.enum(["buy-wrong", "cant-combine", "want-refresh", "understand-colors"]).nullish(),
  reportSections: z.array(z.enum(REPORT_SECTION_VALUES)).nullish(),
});

const RequestSchema = z.object({
  photoDataUrl: z.string(),
  wardrobeType: z.enum(["woman", "man", "other"]),
  quizAnswers:  QuizAnswersSchema.nullish(),
});

const SEASON_SUGGESTION_VALUES = [
  "Light Spring", "True Spring", "Bright Spring",
  "Light Summer", "True Summer", "Soft Summer",
  "Soft Autumn", "True Autumn", "Dark Autumn",
  "Dark Winter", "True Winter", "Bright Winter",
] as const;

const ExtractionSchema = z.object({
  undertone: z.enum(["warm", "cool", "neutral"]),
  depth: z.enum(["light", "medium", "deep"]),
  contrast: z.enum(["low", "medium-low", "medium", "medium-high", "high"]),
  chroma: z.enum(["muted", "balanced", "clear"]),
  hairColor: z.string(),
  eyeColor: z.string(),
  skinDescription: z.string(),
  photoQuality: z.enum(["usable", "borderline", "unusable"]),
  qualityNote: z.string().nullish(),
  seasonSuggestion: z.enum(SEASON_SUGGESTION_VALUES).nullish(),
  seasonSuggestionConfidence: z.enum(["strong", "moderate", "uncertain"]).nullish(),
  faceShape: z.enum(["oval", "round", "square", "heart", "oblong", "diamond", "triangle"]).nullish(),
  foreheadWidth: z.enum(["narrow", "medium", "wide"]).nullish(),
  jawLine: z.enum(["soft", "defined", "angular"]).nullish(),
  chinShape: z.enum(["pointed", "round", "square"]).nullish(),
  featureScale: z.enum(["delicate", "medium", "bold"]).nullish(),
  hairTexture: z.enum(["fine", "medium", "thick"]).nullish(),
  hairWave: z.enum(["straight", "wavy", "curly", "coily"]).nullish(),
  eyeShape: z.enum(["almond", "round", "hooded", "monolid"]).nullish(),
  eyeSet: z.enum(["wide-set", "average", "close-set"]).nullish(),
  lipFullness: z.enum(["thin", "medium", "full"]).nullish(),
});

function buildSeasonId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function normalizeContrastForScoring(c: string): "low" | "medium" | "high" {
  if (c === "low" || c === "medium-low") return "low";
  if (c === "medium" || c === "medium-high") return "medium";
  return "high";
}

async function extractTraits(image: { mimeType: string; base64: string; detail: "high" }) {
  return runStructuredStyleResponse({
    schema: ExtractionSchema,
    schemaName: "TraitExtraction",
    instructions: EXTRACTION_INSTRUCTIONS,
    prompt: "Observe and record the physical traits of the person in this photo. Report only what you literally see.",
    image,
    maxOutputTokens: 1200,
    promptCacheKey: "trait-extract-v5",
  });
}

async function generateReport(
  image: { mimeType: string; base64: string; detail: "high" },
  prompt: string,
) {
  return runStructuredStyleResponse({
    schema: AnalysisResultSchema,
    schemaName: "AnalysisResult",
    instructions: REPORT_INSTRUCTIONS,
    prompt,
    image,
    maxOutputTokens: 16000,
    promptCacheKey: "report-generate-v16",
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const rate = await checkRateLimit(`report-analyze:${user.id}`, 5, 60 * 60 * 1000);
  if (!rate.allowed) {
    return Response.json({ error: "Too many report attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { photoDataUrl, wardrobeType, quizAnswers } = parsed.data;

  const match = photoDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return Response.json({ error: "Invalid photo format" }, { status: 400 });
  }
  const [, mimeType, base64] = match;
  const image = { mimeType: mimeType!, base64: base64!, detail: "high" as const };

  // ── Claim the style_reports row before spending anything ────────────────────
  const claim = await claimGenerationRow<LockRow & { full_report?: unknown; mini_result?: unknown }>({
    supabase,
    table: "style_reports",
    match: { user_id: user.id },
  });

  if (claim.outcome === "still-generating") {
    return Response.json({ error: "Your report is already being generated. Please wait a moment." }, { status: 409 });
  }
  if (claim.outcome === "attempts-exhausted") {
    return Response.json({ error: "Too many failed attempts. Please contact support." }, { status: 429 });
  }
  if (claim.outcome === "use-cached") {
    const cached = claim.row.full_report as z.infer<typeof AnalysisResultSchema> | undefined;
    if (!cached) {
      return Response.json({ error: "Report not ready yet. Please try again shortly." }, { status: 409 });
    }
    const enc = new TextEncoder();
    const topId = cached.fullReport.colorAnalysis.topSeason.id;
    const palette8 = (SEASON_PALETTE_REFERENCE[topId] ?? []).slice(0, 8).map(c => c.hex);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(enc.encode(JSON.stringify({
          type: "season",
          seasonId: topId,
          seasonName: cached.fullReport.colorAnalysis.topSeason.name,
          palette: palette8,
        }) + "\n"));
        controller.enqueue(enc.encode(JSON.stringify({ type: "report", data: cached }) + "\n"));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache, no-store" },
    });
  }

  // claim.outcome === "owned" -> we hold the lock, proceed to generate.

  let traits: z.infer<typeof ExtractionSchema>;
  try {
    traits = await extractTraits(image);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/report/analyze] trait extraction failed:", message);
    await finalizeGeneration({ supabase, table: "style_reports", match: { user_id: user.id }, patch: { status: "failed" } });
    return Response.json({ error: "Analysis failed. Please try again.", detail: message }, { status: 500 });
  }

  if (traits.photoQuality === "unusable") {
    await finalizeGeneration({ supabase, table: "style_reports", match: { user_id: user.id }, patch: { status: "failed" } });
    return Response.json(
      {
        error: "Photo unusable",
        retake: true,
        detail: traits.qualityNote ?? "Please upload a clear, well-lit photo with your face visible and unobstructed.",
      },
      { status: 422 },
    );
  }

  const scored = scoreColorSeasonCandidates({
    traits: {
      undertone: traits.undertone,
      depth: traits.depth,
      contrast: normalizeContrastForScoring(traits.contrast),
      chroma: traits.chroma,
    },
    evidence: {
      skin: traits.skinDescription,
      hair: traits.hairColor,
      eyes: traits.eyeColor,
    },
    modelSubSeason: traits.seasonSuggestion ?? undefined,
    modelSeasonConfidence: traits.seasonSuggestionConfidence ?? undefined,
  });

  const top = scored[0]!;
  const alts = scored.slice(1, 3);
  const topId = buildSeasonId(top.subSeason);
  const alt1 = alts[0]!;
  const alt2 = alts[1]!;
  const confirmedSeason = {
    topSeason: { id: topId, name: top.subSeason, percentage: top.likelihood, reason: top.reason },
    alternativeSeasons: [
      { id: buildSeasonId(alt1.subSeason), name: alt1.subSeason, percentage: alt1.likelihood, reason: alt1.reason },
      { id: buildSeasonId(alt2.subSeason), name: alt2.subSeason, percentage: alt2.likelihood, reason: alt2.reason },
    ],
  };

  const paletteRef = (SEASON_PALETTE_REFERENCE[topId] ?? []).map(c => `${c.name} ${c.hex}`).join(" · ");

  const faceGeoLines = [
    `Face shape: ${traits.faceShape ?? "assess from photo"}`,
    `Forehead: ${traits.foreheadWidth ?? "assess from photo"} | Jaw: ${traits.jawLine ?? "assess from photo"} | Chin: ${traits.chinShape ?? "assess from photo"}`,
    `Feature scale: ${traits.featureScale ?? "assess from photo"}`,
    traits.hairTexture || traits.hairWave
      ? `Hair texture: ${[traits.hairTexture, traits.hairWave].filter(Boolean).join(", ")}`
      : `Hair texture: assess from photo`,
    `Eye shape: ${traits.eyeShape ?? "assess from photo"} | Eye set: ${traits.eyeSet ?? "assess from photo"}`,
    `Lip fullness: ${traits.lipFullness ?? "assess from photo"}`,
  ].join("\n");

  const reportPrompt = `CONFIRMED SEASON AND TRAITS (use these exactly — do not change):
Season: ${top.subSeason} (id: "${topId}", family: ${top.seasonId})
Undertone: ${traits.undertone}
Depth: ${traits.depth}
Contrast: ${traits.contrast} ← CONFIRMED. Use this EXACT value as the "level" field in PART 2 (contrast section). Do not re-assess contrast from the photo.
Chroma: ${traits.chroma}
Current hair colour: ${traits.hairColor}
Eye colour: ${traits.eyeColor}
Skin: ${traits.skinDescription}

CONFIRMED FACE GEOMETRY — single source of truth for PART 6 (hair) and PART 10 (glasses). Do not re-derive these from the photo. Use them verbatim in every section that references face structure:
${faceGeoLines}

Season palette reference (anchor these hex values for PART 3 bestColors — expand from them, stay within this colour temperature and saturation range):
${paletteRef}

In colorAnalysis output you MUST use exactly:
- topSeason.id = "${confirmedSeason.topSeason.id}"
- topSeason.name = "${confirmedSeason.topSeason.name}"
- topSeason.percentage = ${confirmedSeason.topSeason.percentage}
- topSeason.reason = "${confirmedSeason.topSeason.reason}"
- alternativeSeasons[0]: { id: "${confirmedSeason.alternativeSeasons[0]!.id}", name: "${confirmedSeason.alternativeSeasons[0]!.name}", percentage: ${confirmedSeason.alternativeSeasons[0]!.percentage}, reason: "${confirmedSeason.alternativeSeasons[0]!.reason}" }
- alternativeSeasons[1]: { id: "${confirmedSeason.alternativeSeasons[1]!.id}", name: "${confirmedSeason.alternativeSeasons[1]!.name}", percentage: ${confirmedSeason.alternativeSeasons[1]!.percentage}, reason: "${confirmedSeason.alternativeSeasons[1]!.reason}" }

Wardrobe type: ${wardrobeType}
${wardrobeType === "man" ? `IMPORTANT — wardrobeType is "man": (1) return makeupComparisons as an empty array []; set colorDiagnostics.makeup to null — do NOT generate any makeup or cosmetics content. (2) DO generate the grooming section (PART 13) — beard shape, beard color, skin note, and 3 options. This replaces makeup for men. (3) If a required schema key is named "makeup" inside faceArchetype.stylingNotes or signatureSummary, fill it with grooming / beard guidance, not cosmetics.` : ""}
${wardrobeType !== "man" ? `wardrobeType is "${wardrobeType}" — return grooming as null.` : ""}
${quizAnswers?.occasion ? `Primary occasion: ${quizAnswers.occasion} — tailor clothing and accessory recommendations to this context.` : ""}
${quizAnswers?.styleConcern ? `Style challenge: ${quizAnswers.styleConcern} — address this explicitly in the relevant report sections. Make the person feel understood.` : ""}

Generate the complete personal style report for a confirmed ${top.subSeason}. Apply the LANGUAGE RULES from your instructions — plain English, no technical terms, every recommendation includes a "because" referencing something you observed.`;

  const enc = new TextEncoder();
  const palette8 = (SEASON_PALETTE_REFERENCE[topId] ?? []).slice(0, 8).map(c => c.hex);

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(enc.encode(JSON.stringify({
        type: "season",
        seasonId: topId,
        seasonName: top.subSeason,
        palette: palette8,
      }) + "\n"));

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const result = await generateReport(image, reportPrompt);
          const final  = applyConfirmedSeasonToReport(result, confirmedSeason);
          const validation = validateGeneratedReport(final, { wardrobeType });

          if (validation.warnings.length > 0) {
            console.warn(`[/api/report/analyze] quality warnings (attempt ${attempt}):`, validation.warnings);
          }

          if (!validation.valid) {
            console.error(`[/api/report/analyze] CRITICAL quality failures (attempt ${attempt}):`, validation.critical);
            if (attempt < 2) {
              await new Promise(r => setTimeout(r, 1500));
              continue;
            }
            console.error("[/api/report/analyze] proceeding with quality-failed report after retry exhausted");
          }

          await finalizeGeneration({
            supabase,
            table: "style_reports",
            match: { user_id: user.id },
            patch: {
              status: "done",
              full_report: final,
              mini_result: final.miniResult,
              wardrobe_type: wardrobeType,
              quiz_answers: quizAnswers ?? null,
            },
          });

          controller.enqueue(enc.encode(JSON.stringify({ type: "report", data: final }) + "\n"));
          break;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const stack   = err instanceof Error ? err.stack : undefined;
          console.error(`[/api/report/analyze] report attempt ${attempt} failed:`, message);
          if (stack) console.error(stack.slice(0, 800));

          if (attempt === 2) {
            await finalizeGeneration({ supabase, table: "style_reports", match: { user_id: user.id }, patch: { status: "failed" } });
            controller.enqueue(enc.encode(JSON.stringify({
              type: "error",
              message: "Report generation failed. Please try again.",
            }) + "\n"));
          } else {
            await new Promise(r => setTimeout(r, 1500));
          }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache, no-store" },
  });
}
```

- [ ] **Step 1: Write a request-shape/auth-guard test that doesn't need a live DB or OpenAI**

Create `app/api/report/analyze/route.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "@/app/api/report/analyze/route";

test("returns 401 when there is no Supabase session", async () => {
  // No Supabase env configured in the test process -> createClient() still
  // constructs a client, but auth.getUser() resolves to { user: null } when
  // there's no session cookie on the request. This exercises the real
  // early-return path without needing a live database.
  const req = new Request("http://localhost/api/report/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photoDataUrl: "data:image/png;base64,AA==", wardrobeType: "woman" }),
  });
  const res = await POST(req);
  assert.equal(res.status, 401);
});
```

- [ ] **Step 2: Run test to verify it currently fails (route doesn't 401 yet)**

Run: `node --test --experimental-strip-types app/api/report/analyze/route.test.ts`
Expected: FAIL (route proceeds past auth today) — confirms the test actually exercises the gap.

- [ ] **Step 3: Replace `app/api/report/analyze/route.ts` with the full rewrite shown above.**

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types app/api/report/analyze/route.test.ts`
Expected: PASS — 401 with no session. If it errors instead of resolving cleanly because Supabase env vars aren't set in the test process, add `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` placeholders are already read from `.env.local` by Next's env loading — running via plain `node --test` does NOT load `.env.local` automatically, so prefix the run with `node -r dotenv/config` equivalent, or simpler: `node --test --experimental-strip-types --env-file=.env.local app/api/report/analyze/route.test.ts` (Node 20+ supports `--env-file`).

- [ ] **Step 5: Manual verification (no automated DB test harness exists in this repo)**

Run: `npm run dev`, then in a second terminal:
```bash
curl -s -X POST http://localhost:3000/api/report/analyze -H "Content-Type: application/json" -d '{"photoDataUrl":"data:image/png;base64,AA==","wardrobeType":"woman"}'
```
Expected: `{"error":"Sign in required"}` with a 401 status (check via `curl -i`). This confirms the anonymous-abuse hole is closed before moving on.

- [ ] **Step 6: Run full test suite and lint**

Run: `npm test && npm run lint`
Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add app/api/report/analyze/route.ts app/api/report/analyze/route.test.ts
git commit -m "feat: require auth and DB-backed claim/cache in /api/report/analyze

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Rewrite `/api/report/generate-visual` — auth, server-built prompts, claim/cache

**Files:**
- Modify: `app/api/report/generate-visual/route.ts`
- Test: `app/api/report/generate-visual/route.test.ts`

**Interfaces:**
- Consumes: `claimGenerationRow`, `finalizeGeneration` (Task 4); `checkRateLimit`; `createClient` from `lib/db/supabase-server.ts`; `buildImageSlots` from `lib/report/image-slots.ts` (already a pure function — confirmed no client-only dependencies); existing `extractReplicateImageUrl`, `buildFlux2ProInput`.
- Produces: request schema changes from `{ photoDataUrl, prompt, slotId, resolutionOverride }` to `{ photoDataUrl, slotId, resolutionOverride }` — **`prompt` is removed**. `lib/report/generate-slot.ts` (Task 8) and `app/profile/page.tsx` (Task 11) are updated to match.

Replace the entire file with:

```ts
export const runtime = "nodejs";
export const maxDuration = 120;

import Replicate from "replicate";
import { z } from "zod";
import { createClient } from "@/lib/db/supabase-server";
import { extractReplicateImageUrl } from "@/lib/report/replicate-output";
import { buildFlux2ProInput } from "@/lib/report/replicate-input";
import { buildImageSlots } from "@/lib/report/image-slots";
import { claimGenerationRow, finalizeGeneration, type LockRow } from "@/lib/server/generation-lock";
import { checkRateLimit } from "@/lib/shared/rate-limit";
import type { AnalysisResult } from "@/lib/report/report-schema";

const RequestSchema = z.object({
  photoDataUrl: z.string(),
  slotId: z.string(),
  resolutionOverride: z.enum(["1 MP", "2 MP"]).nullish(),
});

type PhotoParseOk = { blob: Blob; mimeType: string; byteLength: number };
type PhotoParseErr = { error: string };

function parsePhotoDataUrl(value: string): PhotoParseOk | PhotoParseErr {
  const sep = ";base64,";
  const sepIdx = value.indexOf(sep);
  if (sepIdx === -1 || !value.startsWith("data:")) {
    return { error: `Not a base64 data URL. Prefix: "${value.slice(0, 60)}"` };
  }

  const mimeType = value.slice(5, sepIdx).toLowerCase().trim();
  if (!mimeType.startsWith("image/")) {
    return { error: `Unsupported mime type: "${mimeType}"` };
  }

  const b64 = value.slice(sepIdx + sep.length).replace(/[\s\r\n]/g, "");

  let arrayBuffer: ArrayBuffer;
  try {
    const binary = atob(b64);
    arrayBuffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  } catch (e) {
    return { error: `base64 decode failed: ${e}` };
  }

  if (arrayBuffer.byteLength === 0) {
    return { error: "Decoded buffer is empty" };
  }

  const blob = new Blob([arrayBuffer], { type: mimeType });
  return { blob, mimeType, byteLength: arrayBuffer.byteLength };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const rate = await checkRateLimit(`generate-visual:${user.id}`, 60, 60 * 60 * 1000);
  if (!rate.allowed) {
    return Response.json({ imageUrl: null, debugError: "Rate limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { photoDataUrl, slotId, resolutionOverride } = parsed.data;

  // ── Rebuild the allowed prompt server-side from the stored report ───────────
  const { data: reportRow } = await supabase
    .from("style_reports")
    .select("full_report, wardrobe_type, quiz_answers, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!reportRow || reportRow.status !== "done" || !reportRow.full_report) {
    return Response.json({ error: "Report not ready" }, { status: 400 });
  }

  const fullReport = (reportRow.full_report as AnalysisResult).fullReport;
  const wardrobeType = (reportRow.wardrobe_type as "woman" | "man" | "other") ?? "woman";
  const sections = (reportRow.quiz_answers as { reportSections?: string[] } | null)?.reportSections ?? [];
  const slots = buildImageSlots(fullReport, wardrobeType, sections);
  const slot = slots.find(s => s.slotId === slotId);

  if (!slot) {
    return Response.json({ error: `Unknown slotId: ${slotId}` }, { status: 400 });
  }

  const prompt = slot.prompt;

  const photoResult = parsePhotoDataUrl(photoDataUrl);
  if ("error" in photoResult) {
    console.error(`[generate-visual] parsePhoto failed: ${photoResult.error}`);
    return Response.json({ imageUrl: null, debugError: `parsePhoto: ${photoResult.error}` });
  }
  const { blob, mimeType, byteLength } = photoResult;
  const resolution = resolutionOverride ?? "1 MP";

  console.log(`[generate-visual] slot=${slotId} mimeType=${mimeType} byteLength=${byteLength} blobSize=${blob.size} resolution=${resolution}`);

  // ── Claim the report_visuals row before spending anything ───────────────────
  const claim = await claimGenerationRow<LockRow & { image_url?: string | null }>({
    supabase,
    table: "report_visuals",
    match: { user_id: user.id, slot_id: slotId },
  });

  if (claim.outcome === "still-generating") {
    return Response.json({ imageUrl: null, debugError: "Already generating this slot" }, { status: 409 });
  }
  if (claim.outcome === "attempts-exhausted") {
    return Response.json({ imageUrl: null, debugError: "Too many attempts for this slot" }, { status: 429 });
  }
  if (claim.outcome === "use-cached" && claim.row.image_url) {
    return Response.json({ imageUrl: claim.row.image_url });
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN, fileEncodingStrategy: "upload" });

  let resultUrl: string | null = null;
  try {
    const replicateInput = buildFlux2ProInput(prompt, blob, resolution);
    const output = await replicate.run("black-forest-labs/flux-2-pro", { input: replicateInput });
    resultUrl = extractReplicateImageUrl(output);

    if (!resultUrl) {
      await finalizeGeneration({ supabase, table: "report_visuals", match: { user_id: user.id, slot_id: slotId }, patch: { status: "failed" } });
      return Response.json({ imageUrl: null, debugError: "extractUrl returned null" });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[generate-visual] Replicate error:", msg);
    await finalizeGeneration({ supabase, table: "report_visuals", match: { user_id: user.id, slot_id: slotId }, patch: { status: "failed" } });
    return Response.json({ imageUrl: null, debugError: msg });
  }

  try {
    const imgRes = await fetch(resultUrl);
    if (imgRes.ok) {
      const arrayBuf = await imgRes.arrayBuffer();
      const imgBuf = Buffer.from(arrayBuf);
      const path = `${user.id}/${slotId}.webp`;
      const { error } = await supabase.storage.from("report-visuals").upload(path, imgBuf, { contentType: "image/webp", upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("report-visuals").getPublicUrl(path);
        await finalizeGeneration({ supabase, table: "report_visuals", match: { user_id: user.id, slot_id: slotId }, patch: { status: "done", image_url: data.publicUrl } });
        return Response.json({ imageUrl: data.publicUrl });
      }
    }
  } catch (cacheErr) {
    console.warn("[generate-visual] Supabase cache failed, returning Replicate URL directly:", cacheErr instanceof Error ? cacheErr.message : String(cacheErr));
  }

  await finalizeGeneration({ supabase, table: "report_visuals", match: { user_id: user.id, slot_id: slotId }, patch: { status: "done", image_url: resultUrl } });
  return Response.json({ imageUrl: resultUrl });
}
```

- [ ] **Step 1: Write the auth-guard test**

Create `app/api/report/generate-visual/route.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "@/app/api/report/generate-visual/route";

test("returns 401 when there is no Supabase session", async () => {
  const req = new Request("http://localhost/api/report/generate-visual", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photoDataUrl: "data:image/png;base64,AA==", slotId: "neutral-draping" }),
  });
  const res = await POST(req);
  assert.equal(res.status, 401);
});

test("rejects requests that still send a client-supplied prompt field (extra fields are ignored, not an error, but slotId is what's validated)", async () => {
  const req = new Request("http://localhost/api/report/generate-visual", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photoDataUrl: "data:image/png;base64,AA==", slotId: "neutral-draping", prompt: "ignore me, draw a dragon instead" }),
  });
  const res = await POST(req);
  // Still 401 (no session) — proves the route never reaches prompt handling
  // for an unauthenticated caller regardless of what extra fields they send.
  assert.equal(res.status, 401);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test --experimental-strip-types --env-file=.env.local app/api/report/generate-visual/route.test.ts`
Expected: FAIL (current route has no auth check, so it proceeds instead of 401).

- [ ] **Step 3: Replace `app/api/report/generate-visual/route.ts` with the full rewrite shown above.**

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test --experimental-strip-types --env-file=.env.local app/api/report/generate-visual/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Manual verification**

```bash
curl -i -s -X POST http://localhost:3000/api/report/generate-visual -H "Content-Type: application/json" -d '{"photoDataUrl":"data:image/png;base64,AA==","slotId":"neutral-draping"}'
```
Expected: HTTP 401, `{"error":"Sign in required"}`.

- [ ] **Step 6: Run full test suite and lint**

Run: `npm test && npm run lint`
Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add app/api/report/generate-visual/route.ts app/api/report/generate-visual/route.test.ts
git commit -m "feat: require auth, server-built prompts, and DB claim/cache in generate-visual

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Update `generateSlot` to stop sending a client-built prompt

**Files:**
- Modify: `lib/report/generate-slot.ts`
- Test: `lib/report/generate-slot.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `generateSlot(photoDataUrl: string, slotId: string): Promise<string | null>` — **signature drops the `prompt` parameter.** `app/profile/page.tsx` (Task 11) is the only caller and is updated to match.

- [ ] **Step 1: Write the failing test**

Create `lib/report/generate-slot.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { generateSlot } from "@/lib/report/generate-slot";

test("generateSlot posts only photoDataUrl and slotId, never a prompt field", async () => {
  const originalFetch = globalThis.fetch;
  let capturedBody: unknown = null;
  globalThis.fetch = (async (_url: string, init?: RequestInit) => {
    capturedBody = JSON.parse(init!.body as string);
    return new Response(JSON.stringify({ imageUrl: "https://example.com/img.webp" }), { status: 200 });
  }) as typeof fetch;

  try {
    const url = await generateSlot("data:image/png;base64,AA==", "neutral-draping");
    assert.equal(url, "https://example.com/img.webp");
    assert.deepEqual(Object.keys(capturedBody as object).sort(), ["photoDataUrl", "slotId"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types lib/report/generate-slot.test.ts`
Expected: FAIL — current signature is `generateSlot(photoDataUrl, prompt, slotId)` and sends a `prompt` field.

- [ ] **Step 3: Implement**

Replace `lib/report/generate-slot.ts`:

```ts
export async function generateSlot(
  photoDataUrl: string,
  slotId: string,
): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_SKIP_IMAGE_GEN === "true") return null;

  try {
    const res = await fetch("/api/report/generate-visual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoDataUrl, slotId }),
    });
    const json = await res.json() as { imageUrl: string | null };
    return json.imageUrl ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types lib/report/generate-slot.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/report/generate-slot.ts lib/report/generate-slot.test.ts
git commit -m "feat: stop sending client-built prompts from generateSlot

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Generalize the (currently unused) `PostQuizAuthScreen` for reuse

**Files:**
- Modify: `components/auth/post-quiz-auth-screen.tsx`

**Interfaces:**
- Consumes: `createClient` from `lib/db/supabase`, `auth-flow.ts` helpers (unchanged).
- Produces: `Props = { onAuthed: (user: { id: string; email?: string | null }) => void }` — replaces the old `{ profile: QuizProfile; onComplete: () => void; onSkip?: () => void }`. No `onSkip` (matches ADR-014's "no skip" precedent, which this plan extends to the new flow). Component calls `onAuthed(user)` once a session exists (email sign-up-with-immediate-session, email sign-in, or after returning from the Google OAuth redirect the caller handles separately — see Task 10).

Context: `git status`/`git log` confirm this component currently has **zero callers** anywhere in the app (its only old caller, `components/quiz/quiz-flow.tsx`, has already been deleted as part of unrelated in-progress repo cleanup). It's safe to change its contract without a migration/back-compat shim — there is nothing else to break.

- [ ] **Step 1: Read the current file to confirm zero other callers before editing**

Run: `grep -rn "PostQuizAuthScreen" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules`
Expected: only `components/auth/post-quiz-auth-screen.tsx` itself (its own export line).

- [ ] **Step 2: Edit the Props type and remove the quiz-save coupling**

In `components/auth/post-quiz-auth-screen.tsx`, replace:
```ts
import { saveCompleteQuizResultToSupabase } from "@/lib/profile/post-quiz-supabase";
import type { QuizProfile } from "@/lib/quiz/quiz";
import { syncLocalWardrobeAfterAuth } from "@/lib/wardrobe/wardrobe-store";

type Props = {
  profile: QuizProfile;
  onComplete: () => void;
  onSkip?: () => void;
};
```
with:
```ts
type Props = {
  onAuthed: (user: { id: string; email?: string | null }) => void;
};
```

Replace:
```ts
export function PostQuizAuthScreen({ profile, onComplete, onSkip }: Props) {
```
with:
```ts
export function PostQuizAuthScreen({ onAuthed }: Props) {
```

Replace the `saveAuthedQuizResult` helper (which called `syncLocalWardrobeAfterAuth` + `saveCompleteQuizResultToSupabase`) with a direct call to `onAuthed`:
```ts
async function handleAuthedUser(user: { id: string; email?: string | null } | null): Promise<boolean> {
  if (!user) {
    setErrorMsg(friendlyProfileLinkError("not_authenticated"));
    setMode("email");
    return false;
  }
  onAuthed(user);
  return true;
}
```
and update both call sites (`isSignUp` branch and sign-in branch) from `const saved = await saveAuthedQuizResult(supabase, data.user); if (!saved) return; onComplete();` to `const ok = await handleAuthedUser(data.user); if (!ok) return;` (drop the trailing `onComplete()` call — `handleAuthedUser` already invokes `onAuthed`).

Remove every remaining reference to `onSkip` (the three `{onSkip ? (...) : null}` blocks in the `check-email`, `email`, and default render branches) — no-skip is the intended behavior here, matching ADR-014.

Update the Google handler's `redirectTo` — it currently hardcodes `/profile`; make it a prop so both callers (a future `/profile`-targeting caller and Task 10's `/style-setup`-targeting caller) can each pass their own return path:
```ts
type Props = {
  onAuthed: (user: { id: string; email?: string | null }) => void;
  googleRedirectPath: string;
};
```
and in `handleGoogle`, change `redirectTo: buildAuthCallbackUrl(window.location.origin, "/profile")` to `redirectTo: buildAuthCallbackUrl(window.location.origin, googleRedirectPath)`.

- [ ] **Step 3: Verify the file still type-checks**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "post-quiz-auth-screen"`
Expected: no output (no type errors in this file). It's fine if other pre-existing files in the repo show unrelated errors — only check this file's own errors are gone.

- [ ] **Step 4: Commit**

```bash
git add components/auth/post-quiz-auth-screen.tsx
git commit -m "refactor: generalize PostQuizAuthScreen for reuse outside the old quiz flow

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Wire the auth gate into `style-setup-flow.tsx`, with OAuth-redirect resume

**Files:**
- Modify: `components/style-setup/style-setup-flow.tsx`

**Interfaces:**
- Consumes: `PostQuizAuthScreen` (Task 9) with props `{ onAuthed, googleRedirectPath: "/style-setup" }`; existing `createClient` from `lib/db/supabase` for a one-time session check on mount.
- Produces: no new exports — this is a leaf component change. Behavior: the "sections" step's "create my report" button now shows the auth screen instead of calling `handleSubmit` directly; `handleSubmit` only runs once a session exists (either immediately, for email auth, or after an OAuth redirect resume).

- [ ] **Step 1: Add a new `Step` value and persist pending answers before showing the auth screen**

In `components/style-setup/style-setup-flow.tsx`, add `"auth"` to the `Step` union and `STEP_INDEX`:
```ts
type Step = "photo" | "wardrobe" | "occasion" | "concern" | "sections" | "auth" | "analyzing" | "season-reveal";
```
```ts
const STEP_INDEX: Record<Step, number> = {
  photo:           1,
  wardrobe:        2,
  occasion:        3,
  concern:         4,
  sections:        5,
  auth:            5,
  analyzing:       5,
  "season-reveal": 5,
};
```

Add near the top of `StyleSetupFlow`, alongside the other `useState` calls:
```ts
const [authChecked, setAuthChecked] = useState(false);
```

Add a `useEffect` (near the existing effects) that checks for an already-existing session on mount, so a user who already signed in on a previous visit (or is returning from the Google redirect) skips straight past the auth screen:
```ts
useEffect(() => {
  (async () => {
    try {
      const { createClient } = await import("@/lib/db/supabase");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setAuthChecked(true);
      if (user) {
        const pendingRaw = localStorage.getItem("paletteme-pending-submission");
        if (pendingRaw && step === "photo") {
          try {
            const pending = JSON.parse(pendingRaw) as {
              photoDataUrl: string; wardrobeType: WardrobeType; occasion: Occasion;
              styleConcern: StyleConcern; reportSections: ReportSection[];
            };
            setPhotoDataUrl(pending.photoDataUrl);
            setWardrobeType(pending.wardrobeType);
            setOccasion(pending.occasion);
            setStyleConcern(pending.styleConcern);
            setReportSections(pending.reportSections);
            localStorage.removeItem("paletteme-pending-submission");
            void handleSubmitWithAnswers(pending.photoDataUrl, pending.wardrobeType, pending.occasion, pending.styleConcern, pending.reportSections);
          } catch { /* malformed, ignore and let the user redo the flow */ }
        }
      }
    } catch {
      setAuthChecked(true);
    }
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

- [ ] **Step 2: Split `handleSubmit` into a reusable `handleSubmitWithAnswers` and a thin wrapper**

Rename the existing `handleSubmit` body to accept explicit parameters instead of reading closure state, so it can be called both from the "sections" step's button AND from the post-OAuth-redirect resume path added in Step 1:
```ts
async function handleSubmitWithAnswers(
  photo: string,
  wardrobe: WardrobeType,
  occ: Occasion,
  concern: StyleConcern,
  sections: ReportSection[],
) {
  setStep("analyzing");
  setError(null);
  setReportReady(false);
  setSeasonPreview(null);
  timerRef.current = setInterval(() => {
    setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length);
  }, 3500);

  try { localStorage.setItem("paletteme-report-sections", JSON.stringify(sections)); } catch { /* quota */ }
  const body    = JSON.stringify({ photoDataUrl: photo, wardrobeType: wardrobe, quizAnswers: { occasion: occ, styleConcern: concern, reportSections: sections } });
  const headers = { "Content-Type": "application/json" };

  async function callAnalyze(attempt: number): Promise<Response> {
    const res = await fetch("/api/report/analyze", { method: "POST", headers, body });
    if (res.status === 409 && attempt < 3) {
      await new Promise(r => setTimeout(r, 5000));
      return callAnalyze(attempt + 1);
    }
    if (!res.ok && res.status !== 422 && res.status !== 409 && attempt < 2) {
      await new Promise(r => setTimeout(r, 2000));
      return callAnalyze(attempt + 1);
    }
    return res;
  }

  try {
    const res = await callAnalyze(1);

    if (res.status === 422) {
      clearInterval(timerRef.current!);
      const data = await res.json() as { detail?: string };
      throw new Error(data.detail ?? "photo quality too low — please use a clear, well-lit selfie.");
    }
    if (res.status === 409) {
      clearInterval(timerRef.current!);
      throw new Error("your report is taking a little longer than usual — please try again in a moment.");
    }
    if (!res.ok) {
      clearInterval(timerRef.current!);
      throw new Error("analysis failed. please try again.");
    }

    if (!res.body) throw new Error("no response body");
    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer    = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const chunk = JSON.parse(line) as {
          type: "season" | "report" | "error";
          seasonId?: string; seasonName?: string; palette?: string[];
          data?: unknown;
          message?: string;
        };

        if (chunk.type === "season") {
          clearInterval(timerRef.current!);
          setSeasonPreview({ id: chunk.seasonId!, name: chunk.seasonName!, palette: chunk.palette ?? [] });
          setStep("season-reveal");
        } else if (chunk.type === "report") {
          try { localStorage.setItem("paletteme-analysis", JSON.stringify(chunk.data)); } catch { /* quota */ }
          try { localStorage.setItem("paletteme-wardrobe-type", wardrobe); } catch { /* quota */ }
          try { localStorage.removeItem("paletteme-report-images"); } catch { /* quota */ }
          setReportReady(true);
          setTimeout(() => router.push("/profile"), 2200);
        } else if (chunk.type === "error") {
          throw new Error(chunk.message ?? "analysis failed. please try again.");
        }
      }
    }
  } catch (err) {
    clearInterval(timerRef.current!);
    setError(err instanceof Error ? err.message : "something went wrong.");
    setStep("photo");
  }
}
```

Replace the old `handleSubmit` (the button's `onClick` target) with a function that persists answers and moves to the `"auth"` step instead of calling analyze directly:
```ts
function handleSubmit() {
  if (!photoDataUrl || !wardrobeType || !occasion || !styleConcern) return;
  const sections = reportSections.length > 0 ? reportSections : ALL_SECTIONS;
  try {
    localStorage.setItem("paletteme-pending-submission", JSON.stringify({
      photoDataUrl, wardrobeType, occasion, styleConcern, reportSections: sections,
    }));
  } catch { /* quota — the in-memory state below still lets email auth work */ }
  setStep("auth");
}
```

- [ ] **Step 3: Render the auth step**

The existing file guards the sticky header and the main quiz body with
`{step !== "analyzing" && step !== "season-reveal" && ( ... )}` in two places
(currently lines 316 and 340). Both must also exclude `"auth"`, otherwise the
new auth screen would render *on top of* the still-visible "sections" step
body instead of replacing it. Update both occurrences:
```tsx
{step !== "analyzing" && step !== "season-reveal" && step !== "auth" && (
```

Then add the new auth overlay block as a sibling of the `analyzing`/
`season-reveal` overlay blocks (near the `season-reveal` block), before the
final closing of the component:
```tsx
{step === "auth" && photoDataUrl && wardrobeType && occasion && styleConcern && (
  <PostQuizAuthScreen
    googleRedirectPath="/style-setup"
    onAuthed={() => {
      try { localStorage.removeItem("paletteme-pending-submission"); } catch { /* quota */ }
      const sections = reportSections.length > 0 ? reportSections : ALL_SECTIONS;
      void handleSubmitWithAnswers(photoDataUrl, wardrobeType, occasion, styleConcern, sections);
    }}
  />
)}
```
(The `localStorage.removeItem` here mirrors the cleanup the resume-from-OAuth
path in Step 1 already does after reading the pending submission — without
it, a successful email-auth submission would leave a stale
`paletteme-pending-submission` entry sitting in storage. It's inert, not a
duplicate-submission bug, since the mount effect only reads it once on
initial mount — but it should still be cleaned up.)

Add the import at the top of the file:
```ts
import { PostQuizAuthScreen } from "@/components/auth/post-quiz-auth-screen";
```

- [ ] **Step 4: Manual verification (auth gate can't be meaningfully unit-tested without a browser — this repo has no component test harness for this area)**

Run: `npm run dev`, then in a browser:
1. Go to `/style-setup`, complete all 5 steps, tap "create my report →".
2. Confirm the auth screen appears (Google + email options, no "skip" link) instead of the report immediately generating.
3. Sign up with a test email/password. Confirm the flow proceeds to the "analyzing" screen and `/api/report/analyze` is called (check Network tab) only after sign-up completes.
4. In a fresh incognito window, repeat steps 1–2, choose "continue with google", complete the OAuth flow, and confirm you land back on `/style-setup` and it auto-resumes straight into "analyzing" without re-asking the 5 quiz questions.

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: no new errors in `components/style-setup/style-setup-flow.tsx`.

- [ ] **Step 6: Commit**

```bash
git add components/style-setup/style-setup-flow.tsx
git commit -m "feat: require sign-in before generating a style report

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: `/profile` reads Supabase as source of truth, localStorage becomes paint cache only

**Files:**
- Modify: `app/profile/page.tsx`

**Interfaces:**
- Consumes: `style_reports` table (Task 1); `generateSlot(photoDataUrl, slotId)` new 2-arg signature (Task 8).
- Produces: no new exports — internal behavior change only.

- [ ] **Step 1: Change the `restoreProfile` function's new-report branch to check Supabase before localStorage**

In `app/profile/page.tsx`, inside `restoreProfile()`, the current code is:
```ts
      // Check for new report analysis (photo + 1 question flow)
      try {
        const raw = localStorage.getItem("paletteme-analysis");
        if (raw) {
          const parsed = JSON.parse(raw) as NewAnalysisResult;
          if (parsed?.miniResult && parsed?.fullReport) {
            if (!cancelled) {
              setNewAnalysis(parsed);
              setReady(true);
            }
            return;
          }
        }
      } catch { /* malformed — fall through */ }
```

Replace it with a Supabase-first check. This must run *before* the localStorage read, and only fall back to localStorage if there's no session (e.g. Supabase misconfigured in local dev):
```ts
      // Check Supabase first — it is the source of truth for the new report flow.
      if (authConfigured) {
        try {
          const { createClient } = await import("@/lib/db/supabase");
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: reportRow } = await supabase
              .from("style_reports")
              .select("full_report, status")
              .eq("user_id", user.id)
              .maybeSingle();

            if (reportRow?.status === "done" && reportRow.full_report) {
              const parsed = reportRow.full_report as NewAnalysisResult;
              if (!cancelled) {
                setNewAnalysis(parsed);
                setReady(true);
              }
              try { localStorage.setItem("paletteme-analysis", JSON.stringify(parsed)); } catch { /* quota */ }
              return;
            }
          }
        } catch { /* Supabase check failed — fall through to localStorage below */ }
      }

      // Fallback: localStorage only (no session / Supabase unavailable / row not found yet).
      try {
        const raw = localStorage.getItem("paletteme-analysis");
        if (raw) {
          const parsed = JSON.parse(raw) as NewAnalysisResult;
          if (parsed?.miniResult && parsed?.fullReport) {
            if (!cancelled) {
              setNewAnalysis(parsed);
              setReady(true);
            }
            return;
          }
        }
      } catch { /* malformed — fall through */ }
```

- [ ] **Step 2: Update the image-generation effect's call site for the new `generateSlot` signature**

Find (around line 109-120):
```ts
    void (async () => {
      if (!photoDataUrl) return;
      generationStarted.current = true;
      for (const slot of pending) {
        const url = await generateSlot(photoDataUrl, slot.prompt, slot.slotId);
```
Change the call to drop `slot.prompt` (the server now derives the prompt itself from the stored report):
```ts
    void (async () => {
      if (!photoDataUrl) return;
      generationStarted.current = true;
      for (const slot of pending) {
        const url = await generateSlot(photoDataUrl, slot.slotId);
```
(`slots` is still computed client-side via `buildImageSlots(...)` a few lines above this block — that's fine and unchanged, since it's only used here for the ordered list of `slotId`s/labels/progress count, not for what gets sent to Replicate.)

- [ ] **Step 3: Manual verification**

Run: `npm run dev`. With `NEXT_PUBLIC_SKIP_IMAGE_GEN=true` set (to avoid spending Replicate credits during this check):
1. Complete `/style-setup` end-to-end (through the new auth gate) once, note the account used.
2. On `/profile`, confirm the report renders.
3. Clear `localStorage` in devtools (Application tab) and reload `/profile`.
4. Confirm the report **still renders immediately** without redirecting to `/style-setup` and without a new `/api/report/analyze` call in the Network tab — this is the exact regression this task fixes.

- [ ] **Step 4: Run full test suite and lint**

Run: `npm test && npm run lint`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add app/profile/page.tsx
git commit -m "fix: read style_reports from Supabase as source of truth in /profile

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 12: Apply migrations (orchestrator-only) + record the ADR

**Files:**
- Modify: `AGENTS.md` (add ADR-018 + changelog entry)

This task requires the human. Do not attempt to run `supabase db push` without their explicit go-ahead in this session — pushing schema changes to the live Supabase project is a hard-to-reverse, shared-infrastructure action.

- [ ] **Step 1: Confirm with the user that `supabase login` and `supabase link --project-ref atwjfakbljecxqnebrut` (from Task 2) are complete.**

- [ ] **Step 2: Show the final migration file contents once more (they haven't changed since Task 1) and get an explicit "apply it" from the user.**

- [ ] **Step 3: Apply the migrations**

Run: `npx supabase db push`
Expected: output listing both migrations as applied, no errors. This creates `style_reports` and `report_visuals` in the linked project and records them in Supabase's own migration-history table.

- [ ] **Step 4: Verify the tables exist with RLS enabled**

Run: `npx supabase db pull --schema public 2>&1 | grep -A2 "style_reports\|report_visuals" || npx supabase inspect db table-sizes 2>&1 | grep -i "style_reports\|report_visuals"`

If neither of those subcommands is available in the installed CLI version, instead confirm directly through the Supabase dashboard's Table Editor (read-only check, not a manual SQL edit) that both tables appear with RLS "Enabled".

- [ ] **Step 5: Add ADR-018 to `AGENTS.md`**

In the "ADR - Decision Log" section, after ADR-017, add:
```markdown
### ADR-018 - Auth-gated, DB-locked report and image generation

Date: 2026-07-01
Status: accepted
Context: `/api/report/analyze` and `/api/report/generate-visual` had no authentication, no persistence, and no concurrency control — anyone could call them directly, unlimited times, for free OpenAI/Replicate spend, and the generated report only lived in `localStorage`, so clearing storage silently re-triggered full regeneration.
Decision: Both routes now require a Supabase session (401 otherwise) and use an atomic claim/lock (`lib/server/generation-lock.ts`) against two new tables, `style_reports` (one row per user, MVP-intentional) and `report_visuals` (one row per user+slot), before calling OpenAI or Replicate. A completed row is always served from cache; a `generating` row blocks duplicate calls; a `failed` or stale (>15 min) row can be safely reclaimed, capped at 5 attempts. Image prompts are rebuilt server-side from the stored report — the client sends only a `slotId`, never a prompt string. `/style-setup` gates the "create my report" action behind sign-in (reusing the same no-skip pattern as ADR-014). `/profile` reads `style_reports` as source of truth; `localStorage` is a paint cache only.
Consequences: No endpoint that calls a paid AI provider should ever skip the auth check or the claim/lock pattern going forward — new AI routes must reuse `lib/server/generation-lock.ts` rather than inventing a new caching scheme. Multi-report-per-user support requires a schema migration (see the comment in `supabase/migrations/20260701120000_create_style_reports.sql`), not just new application code.
```

Add to the changelog section:
```markdown
### 2026-07-01 - Money-leak protection for report/image generation

Closed an unauthenticated-abuse hole where `/api/report/analyze` and `/api/report/generate-visual` could be called directly, unlimited times, with no auth and no persistence. Added `style_reports` and `report_visuals` Supabase tables with RLS, a shared atomic claim/lock module (`lib/server/generation-lock.ts`), auth requirements on both routes, server-side prompt reconstruction for image generation (client sends only `slotId`), a sign-in gate in `/style-setup` before report generation, and made `/profile` read Supabase as the source of truth instead of `localStorage`. See ADR-018.
```

- [ ] **Step 6: Commit**

```bash
git add AGENTS.md
git commit -m "docs: record ADR-018 for auth-gated, DB-locked report generation

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 13: Final end-to-end verification + changelist summary

**Files:** none (verification + reporting task)

- [ ] **Step 1: Full automated check**

Run: `npm test && npm run lint && npm run build`
Expected: all pass with zero errors.

- [ ] **Step 2: Manual end-to-end pass (real AI calls this time — do this once, deliberately, not repeatedly)**

1. In a real browser, complete `/style-setup` fully with a real photo, through sign-up, through to a rendered `/profile` report.
2. Reload `/profile` — confirm no duplicate `/api/report/analyze` or `/api/report/generate-visual` calls appear in the Network tab (all should be served from cache / already-populated state).
3. Open the same account in a second browser (or clear cookies + sign back in) — confirm the same report loads without regenerating.
4. Try calling both routes with `curl` and no cookies — confirm both return 401.

- [ ] **Step 3: Produce the checklist of everything that changed**

Report to the user, grouped exactly as requested:
- **Database schema:** `style_reports`, `report_visuals` tables (RLS enabled, additive-only).
- **Migrations:** `supabase/migrations/20260701120000_create_style_reports.sql`, `supabase/migrations/20260701120100_create_report_visuals.sql`.
- **API routes:** `/api/report/analyze`, `/api/report/generate-visual` — both auth-gated, rate-limited, claim/lock-backed.
- **Auth flow:** `components/auth/post-quiz-auth-screen.tsx` generalized; new auth gate in `components/style-setup/style-setup-flow.tsx` before report generation.
- **Frontend:** `app/profile/page.tsx` reads Supabase first; `lib/report/generate-slot.ts` signature simplified.
- **Caching:** `localStorage` demoted to paint-cache-only for the report; Supabase Storage `report-visuals` bucket unchanged as image blob storage, now backed by `report_visuals` table for locking/metadata.
- **Security improvements:** server-enforced 401s on both routes; server-only prompt construction; slotId validated against the real report's slot list.
- **Cost-saving improvements:** one-time report generation per user (cached forever after `done`), one-time image generation per slot, atomic lock preventing concurrent duplicate spend, 5-attempt cap per row, hourly rate limits (5/hr analyze, 60/hr images) as a backstop.

- [ ] **Step 4: No commit — this is a reporting task.**
