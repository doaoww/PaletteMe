export type WardrobeItem = {
  id: string;
  category: string;
  color: string;
  paletteMatch: "great" | "careful";
  imageDataUrl: string;
  addedAt: string;
};

export type PersistedWardrobeItem = {
  id: string;
  userId?: string | null;
  source: "user_upload" | "manual" | "scan" | "product";
  name: string;
  category: string;
  colors: string[];
  colorTemperature: "warm" | "cool" | "neutral" | "mixed" | "unknown";
  seasonFit: string[];
  formality: string;
  notes?: string;
  imageUrl?: string | null;
  correctedByUser: boolean;
  createdAt?: string;
};

export type NewWardrobeItemInput = Omit<WardrobeItem, "id" | "addedAt">;

export type PersistedWardrobeItemInput = {
  userId: string;
  source: PersistedWardrobeItem["source"];
  name: string;
  category: string;
  colors: string[];
  colorTemperature: PersistedWardrobeItem["colorTemperature"];
  seasonFit: string[];
  formality: string;
  imageUrl: string | null;
};

type LoadWardrobeItemsForCurrentUserOptions = {
  getCurrentUserId: () => Promise<string | null>;
  fetchWardrobeItems: (userId: string) => Promise<PersistedWardrobeItem[] | null>;
  loadLocalItems?: () => WardrobeItem[];
};

type SaveWardrobeItemForCurrentUserOptions = {
  item: NewWardrobeItemInput;
  getCurrentUserId: () => Promise<string | null>;
  savePersistedItem: (
    userId: string,
    item: PersistedWardrobeItemInput
  ) => Promise<PersistedWardrobeItem | null>;
  saveLocalItem?: (item: NewWardrobeItemInput) => WardrobeItem;
};

type SyncLocalWardrobeItemsToSupabaseOptions = {
  userId: string | null | undefined;
  savePersistedItem: (
    userId: string,
    item: PersistedWardrobeItemInput
  ) => Promise<PersistedWardrobeItem | null>;
  loadLocalItems?: () => WardrobeItem[];
  saveLocalItems?: (items: WardrobeItem[]) => void;
};

export type WardrobeSyncResult = {
  attempted: number;
  synced: number;
  remaining: number;
};

const LS_WARDROBE = "paletteme_wardrobe";
let localWardrobeSyncPromise: Promise<WardrobeSyncResult> | null = null;

export function loadWardrobeItems(): WardrobeItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LS_WARDROBE);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as WardrobeItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWardrobeItems(items: WardrobeItem[]): void {
  localStorage.setItem(LS_WARDROBE, JSON.stringify(items));
}

export function clearWardrobeItems(): void {
  localStorage.removeItem(LS_WARDROBE);
}

function saveRemainingWardrobeItems(items: WardrobeItem[]): void {
  if (items.length === 0) {
    clearWardrobeItems();
    return;
  }
  saveWardrobeItems(items);
}

export function addWardrobeItem(
  item: Omit<WardrobeItem, "id" | "addedAt">,
): WardrobeItem {
  const next: WardrobeItem = {
    ...item,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
  };
  const items = loadWardrobeItems();
  items.unshift(next);
  saveWardrobeItems(items);
  return next;
}

export function wardrobeItemCount(): number {
  return loadWardrobeItems().length;
}

export async function loadWardrobeItemsForCurrentUser({
  getCurrentUserId,
  fetchWardrobeItems,
  loadLocalItems = loadWardrobeItems,
}: LoadWardrobeItemsForCurrentUserOptions): Promise<WardrobeItem[]> {
  const userId = await getCurrentUserId().catch(() => null);
  if (!userId) return loadLocalItems();

  const persistedItems = await fetchWardrobeItems(userId).catch(() => null);
  if (!persistedItems) return loadLocalItems();

  return persistedItems.map(wardrobeApiItemToLocalItem);
}

export async function saveWardrobeItemForCurrentUser({
  item,
  getCurrentUserId,
  savePersistedItem,
  saveLocalItem = addWardrobeItem,
}: SaveWardrobeItemForCurrentUserOptions): Promise<PersistedWardrobeItem | WardrobeItem> {
  const userId = await getCurrentUserId().catch(() => null);
  if (!userId) return saveLocalItem(item);

  const persisted = await savePersistedItem(
    userId,
    wardrobeLocalItemToApiInput(userId, item)
  ).catch(() => null);

  return persisted ?? saveLocalItem(item);
}

export async function syncLocalWardrobeItemsToSupabase({
  userId,
  savePersistedItem,
  loadLocalItems = loadWardrobeItems,
  saveLocalItems = saveRemainingWardrobeItems,
}: SyncLocalWardrobeItemsToSupabaseOptions): Promise<WardrobeSyncResult> {
  const items = loadLocalItems();
  if (!userId || items.length === 0) {
    return { attempted: items.length, synced: 0, remaining: items.length };
  }

  const remainingItems: WardrobeItem[] = [];
  let synced = 0;

  for (const item of items) {
    const saved = await savePersistedItem(
      userId,
      wardrobeLocalItemToApiInput(userId, item)
    ).catch(() => null);

    if (saved) {
      synced += 1;
    } else {
      remainingItems.push(item);
    }
  }

  if (synced > 0) {
    saveLocalItems(remainingItems);
  }

  return {
    attempted: items.length,
    synced,
    remaining: remainingItems.length,
  };
}

export function syncLocalWardrobeAfterAuth(
  userId: string | null | undefined
): Promise<WardrobeSyncResult> {
  if (!userId) {
    const remaining = loadWardrobeItems().length;
    return Promise.resolve({ attempted: remaining, synced: 0, remaining });
  }

  if (!localWardrobeSyncPromise) {
    localWardrobeSyncPromise = syncLocalWardrobeItemsToSupabase({
      userId,
      savePersistedItem: postWardrobeItemToApi,
    }).finally(() => {
      localWardrobeSyncPromise = null;
    });
  }

  return localWardrobeSyncPromise;
}

export function wardrobeApiItemToLocalItem(item: PersistedWardrobeItem): WardrobeItem {
  return {
    id: item.id,
    category: item.category,
    color: item.colors.length > 0 ? item.colors.join(", ") : item.name,
    paletteMatch: item.seasonFit.length > 0 ? "great" : "careful",
    imageDataUrl: item.imageUrl ?? "",
    addedAt: item.createdAt ?? "",
  };
}

export async function postWardrobeItemToApi(
  userId: string,
  item: PersistedWardrobeItemInput
): Promise<PersistedWardrobeItem | null> {
  const response = await fetch("/api/wardrobe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      ...item,
      userId,
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json().catch(() => null)) as {
    item?: PersistedWardrobeItem;
  } | null;

  return data?.item ?? null;
}

export function wardrobeLocalItemToApiInput(
  userId: string,
  item: NewWardrobeItemInput
): PersistedWardrobeItemInput {
  const colors = item.color
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean);

  return {
    userId,
    source: "user_upload",
    name: [item.color.trim(), item.category.trim()].filter(Boolean).join(" "),
    category: item.category,
    colors: colors.length > 0 ? colors : [item.color],
    colorTemperature: "unknown",
    seasonFit: item.paletteMatch === "great" ? ["current_palette"] : [],
    formality: "unknown",
    imageUrl: item.imageDataUrl,
  };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

export function scanScoreToMatch(score: number): WardrobeItem["paletteMatch"] {
  return score >= 70 ? "great" : "careful";
}
