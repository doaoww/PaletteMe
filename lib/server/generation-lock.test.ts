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
