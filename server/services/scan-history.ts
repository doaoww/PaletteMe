import {
  insertScanHistoryDb,
  listScanHistoryDb,
} from "@/lib/db/supabase-db";
import {
  ScanHistoryResultSchema,
  ScanHistoryRecordSchema,
  type ScanHistoryResult,
  type ScanHistoryRecord,
  type ScanResult,
  type ScanType,
} from "../ai/schemas";

export type SaveScanHistoryInput = {
  id?: string;
  userId?: string | null;
  scanType: ScanType;
  result: ScanResult | ScanHistoryResult;
  createdAt?: string;
};

export type AuthenticatedScanHistoryInput = SaveScanHistoryInput & {
  userId: string | null | undefined;
  seasonId?: string | null;
  imageUrl?: string | null;
  mimeType?: string | null;
};

export type AuthenticatedScanHistoryRow = {
  id: string;
  created_at: string;
  user_id: string;
  scan_type: ScanType;
  result: ScanHistoryResult;
};

type ScanHistoryInsertClient = {
  from(table: string): {
    insert(row: AuthenticatedScanHistoryRow): {
      select(columns?: string): {
        single(): PromiseLike<{
          data: unknown;
          error: unknown;
        }>;
      };
    };
  };
};

export type SaveAuthenticatedScanHistoryInput = AuthenticatedScanHistoryInput & {
  supabase: ScanHistoryInsertClient;
};

const scanHistory = new Map<string, ScanHistoryRecord>();

export async function saveScanHistory(input: SaveScanHistoryInput): Promise<ScanHistoryRecord> {
  const persisted = await insertScanHistoryDb(input);
  return persisted ?? saveLocalScanHistory(input);
}

export async function listScanHistory(userId?: string | null): Promise<ScanHistoryRecord[]> {
  const persisted = await listScanHistoryDb(userId);
  return persisted ?? listLocalScanHistory(userId);
}

export function buildAuthenticatedScanHistoryRow(
  input: AuthenticatedScanHistoryInput
): AuthenticatedScanHistoryRow | null {
  const userId = input.userId?.trim();
  if (!userId) return null;

  const imageUrl = input.imageUrl?.trim() || null;
  const mimeType = input.mimeType?.trim() || undefined;

  return {
    id: input.id ?? crypto.randomUUID(),
    created_at: input.createdAt ?? new Date().toISOString(),
    user_id: userId,
    scan_type: input.scanType,
    result: ScanHistoryResultSchema.parse({
      ...input.result,
      season_id: input.seasonId?.trim() || null,
      image_url: imageUrl,
      image: {
        stored: Boolean(imageUrl),
        url: imageUrl,
        ...(mimeType ? { mimeType } : {}),
      },
    }),
  };
}

export async function saveAuthenticatedScanHistory(
  input: SaveAuthenticatedScanHistoryInput
): Promise<ScanHistoryRecord | null> {
  const row = buildAuthenticatedScanHistoryRow(input);
  if (!row) return null;

  const { data, error } = await input.supabase
    .from("scan_history")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) return null;
  const savedRow = data as AuthenticatedScanHistoryRow;

  const parsed = ScanHistoryRecordSchema.safeParse({
    id: savedRow.id,
    userId: savedRow.user_id,
    scanType: savedRow.scan_type,
    result: savedRow.result,
    createdAt: savedRow.created_at,
  });

  return parsed.success ? parsed.data : null;
}

export function saveLocalScanHistory(input: SaveScanHistoryInput): ScanHistoryRecord {
  const record = ScanHistoryRecordSchema.parse({
    ...input,
    id: input.id ?? crypto.randomUUID(),
    userId: input.userId ?? null,
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
  scanHistory.set(record.id, record);
  return record;
}

export function listLocalScanHistory(userId?: string | null): ScanHistoryRecord[] {
  return [...scanHistory.values()]
    .filter((record) => {
      if (!userId) return !record.userId;
      return record.userId === userId;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function clearScanHistoryForTest(): void {
  scanHistory.clear();
}
