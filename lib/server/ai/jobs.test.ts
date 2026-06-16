import assert from "node:assert/strict";
import test from "node:test";
import {
  clearAiJobsForTest,
  createAiJob,
  getAiJob,
  getPublicAiJob,
  waitForAiJobForTest,
} from "./jobs.ts";

test("created jobs are visible as queued before async work runs", () => {
  clearAiJobsForTest();
  const job = createAiJob({
    kind: "scan",
    input: { privateImage: "base64" },
    run: async () => ({ ok: true }),
  });

  assert.equal(job.status, "queued");
  assert.equal(getAiJob(job.id)?.status, "queued");
});

test("jobs move to succeeded with a public result", async () => {
  clearAiJobsForTest();
  const job = createAiJob({
    kind: "scan",
    input: { privateImage: "base64" },
    run: async () => ({ verdict: "great" }),
  });

  const finished = await waitForAiJobForTest(job.id);
  assert.equal(finished.status, "succeeded");
  assert.deepEqual(finished.result, { verdict: "great" });
  assert.deepEqual(getPublicAiJob(job.id), {
    id: job.id,
    kind: "scan",
    status: "succeeded",
    result: { verdict: "great" },
    error: undefined,
    createdAt: finished.createdAt,
    updatedAt: finished.updatedAt,
  });
});

test("failed jobs expose a safe error message", async () => {
  clearAiJobsForTest();
  const job = createAiJob({
    kind: "scan",
    input: {},
    run: async () => {
      throw new Error("OpenAI rate limit");
    },
  });

  const finished = await waitForAiJobForTest(job.id);
  assert.equal(finished.status, "failed");
  assert.equal(finished.error, "OpenAI rate limit");
  assert.equal(getPublicAiJob(job.id)?.error, "OpenAI rate limit");
});

test("unknown jobs return null", () => {
  clearAiJobsForTest();
  assert.equal(getAiJob("missing"), null);
  assert.equal(getPublicAiJob("missing"), null);
});
