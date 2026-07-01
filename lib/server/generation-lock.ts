import type { SupabaseClient } from "@supabase/supabase-js";

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
  if (decision.action === "proceed") {
    // The row was gone by the time we read it back (e.g. a concurrent delete
    // between our failed insert-on-conflict and this follow-up SELECT). It's
    // now safe to insert fresh — retry the same upsert-on-conflict once.
    const { data: retried } = await supabase
      .from(table)
      .upsert(
        { ...match, status: "generating", attempt_count: 1, updated_at: nowIso },
        { onConflict: Object.keys(match).join(","), ignoreDuplicates: true },
      )
      .select();

    if (retried && retried.length > 0) {
      return { outcome: "owned", row: retried[0] as Row };
    }
    // Someone else won the race in the meantime.
    return { outcome: "still-generating" };
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
