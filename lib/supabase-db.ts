import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ─── Singleton ────────────────────────────────────────────────────────────────
// One client per warm function instance. Vercel reuses warm instances across
// requests, so this avoids creating a new TCP connection on every call.

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key, {
    auth: { persistSession: false }, // server-side: no cookie/localStorage session
  });
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type DbUser = {
  id: string;
  created_at: string;
  colortype: string | null;
  colortype_confidence: number | null;
  quiz_answers: QuizAnswersSnapshot | null;
  best_colors: string[] | null;
  avoid_colors: string[] | null;
};

export type QuizAnswersSnapshot = {
  style: "minimalist" | "romantic" | "edgy" | "classic" | "bohemian";
  occasion: "everyday" | "work" | "going_out" | "special";
  body_concern: "shoulders" | "waist" | "hips" | "height" | "none";
  budget: "low" | "mid" | "high";
};

export type DbProduct = {
  id: string;
  name: string;
  image_url: string | null;
  price: number | null;
  affiliate_url: string | null;
  colortypes: string[] | null;
  category: string | null;
  colors: string[] | null;
  styles: string[] | null;
  body_types: string[] | null;
  source: string;
  source_id: string | null;
  is_active: boolean;
  last_synced: string | null;
};

export type DbOutfitCheck = {
  id: string;
  created_at: string;
  user_id: string | null;
  result: OutfitCheckResult;
};

export type OutfitCheckResult = {
  match: boolean;
  score: number;
  dominant_colors: string[];
  reason: string;
  suggestion: string;
};

// ─── Users ────────────────────────────────────────────────────────────────────

export async function insertUser(data: {
  colortype?: string;
  colortype_confidence?: number;
  quiz_answers?: QuizAnswersSnapshot;
  best_colors?: string[];
  avoid_colors?: string[];
}): Promise<string | null> {
  const db = getClient();
  if (!db) return null;
  const { data: row, error } = await db
    .from("users")
    .insert(data)
    .select("id")
    .single();
  if (error || !row) return null;
  return (row as { id: string }).id;
}

export async function updateUser(
  id: string,
  data: Partial<Omit<DbUser, "id" | "created_at">>
): Promise<boolean> {
  const db = getClient();
  if (!db) return false;
  const { error } = await db.from("users").update(data).eq("id", id);
  return !error;
}

// ─── Products ─────────────────────────────────────────────────────────────────
// Per-instance cache: 5-minute TTL. Reduces DB round-trips for repeated
// requests with the same season/style/bodyType combo within a warm instance.

type CacheEntry = { data: ScoredProduct[]; ts: number };
const _productCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export type ProductQuery = {
  season?: string;
  style?: string;
  bodyType?: string;
  category?: string;
  limit?: number;
};

export type ScoredProduct = DbProduct & { score: number; match: number };

export async function queryProducts(params: ProductQuery): Promise<ScoredProduct[]> {
  const { season, style, bodyType } = params;
  const limit = params.limit ?? 12;

  const cacheKey = `${season ?? ""}|${style ?? ""}|${bodyType ?? ""}|${limit}`;
  const hit = _productCache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data;

  const db = getClient();
  if (!db) return [];

  const { data, error } = await db
    .from("products")
    .select("*")
    .eq("is_active", true)
    .limit(200); // fetch generously; scoring narrows it down

  if (error || !data) return [];

  const products = data as DbProduct[];

  const scored = products.map((p) => {
    let score = 0;

    // +3 if product is tagged for user's color season
    if (season && p.colortypes?.includes(season)) score += 3;

    // +2 if product style matches user's quiz style preference
    if (style && p.styles?.includes(style)) score += 2;

    // +1 if product body_types includes user's body type
    if (bodyType && (p.body_types?.includes(bodyType) || p.body_types?.includes("all"))) score += 1;

    // Convert raw score (0–6) → display match percentage (40–100)
    const match = score === 0 ? 40 : Math.min(100, 40 + score * 10);

    return { ...p, score, match };
  });

  const result = scored
    .filter((p) => !season || p.score > 0) // if season given, only include matching products
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  _productCache.set(cacheKey, { data: result, ts: Date.now() });
  return result;
}

export async function insertProduct(
  data: Omit<DbProduct, "id" | "last_synced">
): Promise<string | null> {
  const db = getClient();
  if (!db) return null;
  const { data: row, error } = await db
    .from("products")
    .insert({ ...data, last_synced: new Date().toISOString() })
    .select("id")
    .single();
  if (error || !row) return null;
  return (row as { id: string }).id;
}

// ─── Outfit checks ────────────────────────────────────────────────────────────

export async function insertOutfitCheck(data: {
  user_id?: string | null;
  result: OutfitCheckResult;
}): Promise<string | null> {
  const db = getClient();
  if (!db) return null;
  const { data: row, error } = await db
    .from("outfit_checks")
    .insert(data)
    .select("id")
    .single();
  if (error || !row) return null;
  return (row as { id: string }).id;
}

// ─── Waitlist ─────────────────────────────────────────────────────────────────

export async function addToWaitlistDb(
  email: string,
  source = "landing"
): Promise<{ id: string; isNew: boolean } | null> {
  const db = getClient();
  if (!db) return null;

  // Try insert; unique constraint on email handles duplicates
  const { data, error } = await db
    .from("waitlist")
    .insert({ email: email.trim().toLowerCase(), source })
    .select("id")
    .single();

  if (!error && data) {
    return { id: (data as { id: string }).id, isNew: true };
  }

  // Duplicate email — fetch existing row
  if (error?.code === "23505") {
    const { data: existing } = await db
      .from("waitlist")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .single();
    if (existing) return { id: (existing as { id: string }).id, isNew: false };
  }

  return null;
}

// ─── Auth linking ─────────────────────────────────────────────────────────────

export async function getUserByAuthId(authId: string): Promise<DbUser | null> {
  const db = getClient();
  if (!db) return null;
  const { data } = await db
    .from("users")
    .select("*")
    .eq("auth_id", authId)
    .single();
  return (data as DbUser) ?? null;
}

export async function linkAnonymousUser(
  anonymousId: string,
  authId: string,
  email: string
): Promise<void> {
  const db = getClient();
  if (!db) return;
  await db
    .from("users")
    .update({ auth_id: authId, email: email.toLowerCase() })
    .eq("id", anonymousId);
}
