export type AiJobStatus = "queued" | "running" | "succeeded" | "failed";

export type AiJob<TResult = unknown, TInput = unknown> = {
  id: string;
  kind: string;
  status: AiJobStatus;
  input: TInput;
  result?: TResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicAiJob<TResult = unknown> = Omit<AiJob<TResult, never>, "input">;

type CreateAiJobInput<TInput, TResult> = {
  kind: string;
  input: TInput;
  run: (input: TInput) => Promise<TResult>;
};

const jobs = new Map<string, AiJob>();

export function createAiJob<TInput, TResult>({
  kind,
  input,
  run,
}: CreateAiJobInput<TInput, TResult>): AiJob<TResult, TInput> {
  const now = new Date().toISOString();
  const job: AiJob<TResult, TInput> = {
    id: crypto.randomUUID(),
    kind,
    status: "queued",
    input,
    createdAt: now,
    updatedAt: now,
  };

  jobs.set(job.id, job as AiJob);
  setTimeout(() => {
    void runAiJob(job.id, run);
  }, 0);

  return job;
}

export function getAiJob<TResult = unknown, TInput = unknown>(
  id: string
): AiJob<TResult, TInput> | null {
  return (jobs.get(id) as AiJob<TResult, TInput> | undefined) ?? null;
}

export function getPublicAiJob<TResult = unknown>(id: string): PublicAiJob<TResult> | null {
  const job = getAiJob<TResult>(id);
  if (!job) return null;
  return {
    id: job.id,
    kind: job.kind,
    status: job.status,
    result: job.result,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export function clearAiJobsForTest(): void {
  jobs.clear();
}

export async function waitForAiJobForTest<TResult = unknown>(
  id: string,
  timeoutMs = 500
): Promise<AiJob<TResult>> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const job = getAiJob<TResult>(id);
    if (!job) throw new Error(`Job ${id} was not found.`);
    if (job.status === "succeeded" || job.status === "failed") return job;
    await sleep(5);
  }
  throw new Error(`Timed out waiting for job ${id}.`);
}

async function runAiJob<TInput, TResult>(
  id: string,
  run: (input: TInput) => Promise<TResult>
): Promise<void> {
  const job = getAiJob<TResult, TInput>(id);
  if (!job) return;

  job.status = "running";
  job.updatedAt = new Date().toISOString();

  try {
    job.result = await run(job.input);
    job.status = "succeeded";
  } catch (error) {
    job.error = error instanceof Error ? error.message : "AI job failed.";
    job.status = "failed";
  } finally {
    job.updatedAt = new Date().toISOString();
    jobs.set(id, job as AiJob);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
