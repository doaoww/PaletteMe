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
