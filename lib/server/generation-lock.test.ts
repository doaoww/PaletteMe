import assert from "node:assert/strict";
import test from "node:test";
import { decideClaim } from "./generation-lock.ts";

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
