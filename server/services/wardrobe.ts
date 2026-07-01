import {
  applyWardrobeCorrectionDb,
  listWardrobeItemsDb,
  saveWardrobeItemDb,
} from "@/lib/db/supabase-db";
import { WardrobeItemSchema, type WardrobeItem } from "../ai/schemas";

export type SaveWardrobeItemInput = Omit<WardrobeItem, "id" | "correctedByUser"> & {
  id?: string;
  correctedByUser?: boolean;
};

export type WardrobeCorrection = Partial<
  Pick<
    WardrobeItem,
    "name" | "category" | "colors" | "colorTemperature" | "seasonFit" | "formality" | "notes" | "imageUrl"
  >
>;

const wardrobeItems = new Map<string, WardrobeItem>();

export function saveWardrobeItem(input: SaveWardrobeItemInput): WardrobeItem {
  const item = WardrobeItemSchema.parse({
    ...input,
    id: input.id ?? crypto.randomUUID(),
    correctedByUser: input.correctedByUser ?? false,
  });
  wardrobeItems.set(item.id, item);
  return item;
}

export async function savePersistedWardrobeItem(
  input: SaveWardrobeItemInput
): Promise<WardrobeItem> {
  const persisted = await saveWardrobeItemDb(input);
  return persisted ?? saveWardrobeItem(input);
}

export function listWardrobeItems(userId?: string | null): WardrobeItem[] {
  return [...wardrobeItems.values()].filter((item) => {
    if (!userId) return !item.userId;
    return item.userId === userId;
  });
}

export async function listPersistedWardrobeItems(
  userId?: string | null
): Promise<WardrobeItem[]> {
  const persisted = await listWardrobeItemsDb(userId);
  return persisted ?? listWardrobeItems(userId);
}

export function applyWardrobeCorrection(
  id: string,
  correction: WardrobeCorrection
): WardrobeItem | null {
  const existing = wardrobeItems.get(id);
  if (!existing) return null;
  const updated = WardrobeItemSchema.parse({
    ...existing,
    ...correction,
    correctedByUser: true,
  });
  wardrobeItems.set(id, updated);
  return updated;
}

export async function applyPersistedWardrobeCorrection(
  id: string,
  correction: WardrobeCorrection
): Promise<WardrobeItem | null> {
  const persisted = await applyWardrobeCorrectionDb(id, correction);
  return persisted ?? applyWardrobeCorrection(id, correction);
}

export function clearWardrobeForTest(): void {
  wardrobeItems.clear();
}
