import assert from "node:assert/strict";
import test from "node:test";
import { decideClaim, claimGenerationRow, finalizeGeneration } from "./generation-lock.ts";

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

// Order-agnostic chainable fake: real Supabase/PostgREST filter builders let
// you call .eq()/.lt()/.or() in any order before a terminal .select()/
// .maybeSingle(), and claimGenerationRow's actual call order differs between
// the "select existing row" path (select -> eq -> maybeSingle) and the
// "reclaim" path (update -> lt -> or -> eq -> select). A fake that hardcodes
// one fixed order would break the moment the implementation's call order
// didn't match it exactly, so every filter method just returns the same
// chainable node regardless of order.
function makeFakeSupabase(opts: {
  // Normal shape: the flat array of rows returned by the single upsert call
  // in a test. Batch shape (array of arrays): when a scenario calls upsert
  // more than once (e.g. retry-after-proceed), pass one batch per call in
  // call order; the last batch is reused if there are more calls than batches.
  upsertReturns: unknown[] | unknown[][];
  selectReturns: unknown[];
  updateReturns: unknown[];
}) {
  const calls: { method: string; args: unknown }[] = [];
  let upsertCallCount = 0;

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

  const isBatchMode =
    Array.isArray(opts.upsertReturns) &&
    opts.upsertReturns.length > 0 &&
    Array.isArray(opts.upsertReturns[0]);

  return {
    calls,
    client: {
      from(table: string) {
        return {
          upsert(row: unknown, upsertOpts: unknown) {
            calls.push({ method: "upsert", args: { table, row, upsertOpts } });
            let data: unknown;
            if (isBatchMode) {
              const batches = opts.upsertReturns as unknown[][];
              const idx = Math.min(upsertCallCount, batches.length - 1);
              data = batches[idx];
            } else {
              data = opts.upsertReturns;
            }
            upsertCallCount += 1;
            return chainable(data);
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

test("claimGenerationRow: conflict, row gone on follow-up select, retry insert succeeds -> owned", async () => {
  const fake = makeFakeSupabase({
    // First upsert: conflict (empty). Second upsert (the retry): succeeds.
    upsertReturns: [[], [{ status: "generating", updated_at: new Date().toISOString(), attempt_count: 1 }]],
    selectReturns: [], // follow-up select finds nothing -> row is gone -> "proceed"
    updateReturns: [],
  });
  const result = await claimGenerationRow({
    supabase: fake.client as never,
    table: "style_reports",
    match: { user_id: "u1" },
  });
  assert.equal(result.outcome, "owned");
  if (result.outcome === "owned") {
    assert.equal(result.row.attempt_count, 1);
  }
  const upsertCalls = fake.calls.filter(c => c.method === "upsert");
  assert.equal(upsertCalls.length, 2);
});

test("claimGenerationRow: conflict, row gone on follow-up select, retry insert also loses race -> still-generating", async () => {
  const fake = makeFakeSupabase({
    // Both upsert attempts return empty: someone else won the race in between.
    upsertReturns: [[], []],
    selectReturns: [],
    updateReturns: [],
  });
  const result = await claimGenerationRow({
    supabase: fake.client as never,
    table: "style_reports",
    match: { user_id: "u1" },
  });
  assert.equal(result.outcome, "still-generating");
  const upsertCalls = fake.calls.filter(c => c.method === "upsert");
  assert.equal(upsertCalls.length, 2);
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
