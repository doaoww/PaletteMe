import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  ScanHistoryRecordSchema,
  WardrobeItemSchema,
  type ScanHistoryRecord,
  type ScanResult,
  type ScanType,
  type WardrobeItem,
} from "@/server/ai/schemas";

// в”Ђв”Ђв”Ђ Singleton в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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

type SupabaseErrorLike = {
  code?: string | null;
  message?: string | null;
} | null | undefined;

export function isMissingPostgrestRowError(error: SupabaseErrorLike): boolean {
  return error?.code === "PGRST116";
}

export function formatSupabaseProfileError(
  action: string,
  error: SupabaseErrorLike
): string {
  const message = error?.message?.trim() || "Unknown Supabase error";
  return `Could not ${action}: ${message}`;
}

function throwSupabaseProfileError(action: string, error: SupabaseErrorLike): never {
  throw new Error(formatSupabaseProfileError(action, error));
}

// в”Ђв”Ђв”Ђ Types в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

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

type WardrobeWrite = Omit<WardrobeItem, "id" | "correctedByUser"> & {
  id?: string;
  correctedByUser?: boolean;
};

type WardrobeCorrectionWrite = Partial<
  Pick<
    WardrobeItem,
    "name" | "category" | "colors" | "colorTemperature" | "seasonFit" | "formality" | "notes" | "imageUrl"
  >
>;

type DbWardrobeItem = {
  id: string;
  user_id: string | null;
  source: WardrobeItem["source"];
  name: string;
  category: string;
  colors: string[];
  color_temperature: WardrobeItem["colorTemperature"];
  season_fit: string[];
  formality: string;
  notes: string | null;
  image_url: string | null;
  corrected_by_user: boolean;
};

type SaveScanHistoryDbInput = {
  id?: string;
  userId?: string | null;
  scanType: ScanType;
  result: ScanResult;
  createdAt?: string;
};

type DbScanHistory = {
  id: string;
  created_at: string;
  user_id: string | null;
  scan_type: ScanType;
  result: ScanResult;
};

// в”Ђв”Ђв”Ђ Users в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

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

// в”Ђв”Ђв”Ђ Products в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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

    // Convert raw score (0вЂ“6) в†’ display match percentage (40вЂ“100)
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

// в”Ђв”Ђв”Ђ Outfit checks в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

// Wardrobe items

export async function saveWardrobeItemDb(input: WardrobeWrite): Promise<WardrobeItem | null> {
  const db = getClient();
  if (!db) return null;

  const item = WardrobeItemSchema.parse({
    ...input,
    id: input.id ?? crypto.randomUUID(),
    correctedByUser: input.correctedByUser ?? false,
  });

  const { data, error } = await db
    .from("wardrobe_items")
    .upsert(toWardrobeRow(item))
    .select("*")
    .single();

  if (error || !data) return null;
  return fromWardrobeRow(data as DbWardrobeItem);
}

export async function listWardrobeItemsDb(userId?: string | null): Promise<WardrobeItem[] | null> {
  const db = getClient();
  if (!db) return null;

  const query = db
    .from("wardrobe_items")
    .select("*")
    .order("created_at", { ascending: false });

  const { data, error } = userId
    ? await query.eq("user_id", userId)
    : await query.is("user_id", null);

  if (error || !data) return null;
  return (data as DbWardrobeItem[]).map(fromWardrobeRow).filter((item) => item !== null);
}

export async function applyWardrobeCorrectionDb(
  id: string,
  correction: WardrobeCorrectionWrite
): Promise<WardrobeItem | null> {
  const existing = await getWardrobeItemDb(id);
  if (!existing) return null;
  return saveWardrobeItemDb({
    ...existing,
    ...correction,
    correctedByUser: true,
  });
}

async function getWardrobeItemDb(id: string): Promise<WardrobeItem | null> {
  const db = getClient();
  if (!db) return null;

  const { data, error } = await db
    .from("wardrobe_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return fromWardrobeRow(data as DbWardrobeItem);
}

function toWardrobeRow(item: WardrobeItem): DbWardrobeItem {
  return {
    id: item.id,
    user_id: item.userId ?? null,
    source: item.source,
    name: item.name,
    category: item.category,
    colors: item.colors,
    color_temperature: item.colorTemperature,
    season_fit: item.seasonFit,
    formality: item.formality,
    notes: item.notes ?? null,
    image_url: item.imageUrl ?? null,
    corrected_by_user: item.correctedByUser,
  };
}

function fromWardrobeRow(row: DbWardrobeItem): WardrobeItem | null {
  const parsed = WardrobeItemSchema.safeParse({
    id: row.id,
    userId: row.user_id,
    source: row.source,
    name: row.name,
    category: row.category,
    colors: row.colors ?? [],
    colorTemperature: row.color_temperature,
    seasonFit: row.season_fit ?? [],
    formality: row.formality ?? "unknown",
    notes: row.notes ?? undefined,
    imageUrl: row.image_url,
    correctedByUser: row.corrected_by_user ?? false,
  });
  return parsed.success ? parsed.data : null;
}

// Scan history

export async function insertScanHistoryDb(
  input: SaveScanHistoryDbInput
): Promise<ScanHistoryRecord | null> {
  const db = getClient();
  if (!db) return null;

  const record = ScanHistoryRecordSchema.parse({
    ...input,
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId ?? null,
    createdAt: input.createdAt ?? new Date().toISOString(),
  });

  const { data, error } = await db
    .from("scan_history")
    .insert({
      id: record.id,
      created_at: record.createdAt,
      user_id: record.userId,
      scan_type: record.scanType,
      result: record.result,
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return fromScanHistoryRow(data as DbScanHistory);
}

export async function listScanHistoryDb(
  userId?: string | null
): Promise<ScanHistoryRecord[] | null> {
  const db = getClient();
  if (!db) return null;

  const query = db
    .from("scan_history")
    .select("*")
    .order("created_at", { ascending: false });

  const { data, error } = userId
    ? await query.eq("user_id", userId)
    : await query.is("user_id", null);

  if (error || !data) return null;
  return (data as DbScanHistory[]).map(fromScanHistoryRow).filter((record) => record !== null);
}

function fromScanHistoryRow(row: DbScanHistory): ScanHistoryRecord | null {
  const parsed = ScanHistoryRecordSchema.safeParse({
    id: row.id,
    userId: row.user_id,
    scanType: row.scan_type,
    result: row.result,
    createdAt: row.created_at,
  });
  return parsed.success ? parsed.data : null;
}

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

// в”Ђв”Ђв”Ђ Waitlist в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

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

  // Duplicate email вЂ” fetch existing row
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

// в”Ђв”Ђв”Ђ Auth linking в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

export async function getUserByAuthId(authId: string): Promise<DbUser | null> {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("auth_id", authId)
    .single();

  if (isMissingPostgrestRowError(error)) return null;
  if (error) throwSupabaseProfileError("restore profile", error);

  return (data as DbUser) ?? null;
}

export async function linkAnonymousUser(
  anonymousId: string,
  authId: string,
  email: string
): Promise<void> {
  const db = getClient();
  if (!db) return;
  const { error } = await db
    .from("users")
    .update({ auth_id: authId, email: email.toLowerCase() })
    .eq("id", anonymousId);

  if (error) throwSupabaseProfileError("save profile link", error);
}
