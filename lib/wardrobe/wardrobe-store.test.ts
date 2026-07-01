import assert from "node:assert/strict";
import test from "node:test";
import {
  loadWardrobeItemsForCurrentUser,
  saveWardrobeItemForCurrentUser,
  syncLocalWardrobeItemsToSupabase,
  type PersistedWardrobeItem,
  type WardrobeItem,
} from "./wardrobe-store.ts";

const localItem: WardrobeItem = {
  id: "local-1",
  category: "Top",
  color: "Warm neutral",
  paletteMatch: "careful",
  imageDataUrl: "data:image/jpeg;base64,local",
  addedAt: "2026-06-15T00:00:00.000Z",
};

const persistedItem: PersistedWardrobeItem = {
  id: "remote-1",
  userId: "auth-user-1",
  source: "user_upload",
  name: "olive overshirt",
  category: "jacket",
  colors: ["olive", "camel"],
  colorTemperature: "warm",
  seasonFit: ["autumn"],
  formality: "casual",
  imageUrl: "https://example.com/olive.jpg",
  correctedByUser: false,
};

test("loads Supabase wardrobe items for a signed-in user", async () => {
  let fetchedUserId = "";

  const items = await loadWardrobeItemsForCurrentUser({
    getCurrentUserId: async () => "auth-user-1",
    loadLocalItems: () => [localItem],
    fetchWardrobeItems: async (userId) => {
      fetchedUserId = userId;
      return [persistedItem];
    },
  });

  assert.equal(fetchedUserId, "auth-user-1");
  assert.deepEqual(items, [
    {
      id: "remote-1",
      category: "jacket",
      color: "olive, camel",
      paletteMatch: "great",
      imageDataUrl: "https://example.com/olive.jpg",
      addedAt: "",
    },
  ]);
});

test("falls back to local wardrobe items when the user is not signed in", async () => {
  let fetched = false;

  const items = await loadWardrobeItemsForCurrentUser({
    getCurrentUserId: async () => null,
    loadLocalItems: () => [localItem],
    fetchWardrobeItems: async () => {
      fetched = true;
      return [persistedItem];
    },
  });

  assert.equal(fetched, false);
  assert.deepEqual(items, [localItem]);
});

test("saves new wardrobe items to Supabase for a signed-in user", async () => {
  let localSaved = false;
  let postedUserId = "";
  let postedItem: unknown = null;

  await saveWardrobeItemForCurrentUser({
    item: {
      category: "Top",
      color: "Warm neutral",
      paletteMatch: "great",
      imageDataUrl: "data:image/jpeg;base64,new",
    },
    getCurrentUserId: async () => "auth-user-1",
    saveLocalItem: () => {
      localSaved = true;
      return localItem;
    },
    savePersistedItem: async (userId, item) => {
      postedUserId = userId;
      postedItem = item;
      return persistedItem;
    },
  });

  assert.equal(localSaved, false);
  assert.equal(postedUserId, "auth-user-1");
  assert.deepEqual(postedItem, {
    userId: "auth-user-1",
    source: "user_upload",
    name: "Warm neutral Top",
    category: "Top",
    colors: ["Warm neutral"],
    colorTemperature: "unknown",
    seasonFit: ["current_palette"],
    formality: "unknown",
    imageUrl: "data:image/jpeg;base64,new",
  });
});

test("saves new wardrobe items locally when the user is not signed in", async () => {
  let posted = false;
  let localInput: unknown = null;

  await saveWardrobeItemForCurrentUser({
    item: {
      category: "Shoes",
      color: "Black",
      paletteMatch: "careful",
      imageDataUrl: "data:image/jpeg;base64,shoes",
    },
    getCurrentUserId: async () => null,
    saveLocalItem: (item) => {
      localInput = item;
      return localItem;
    },
    savePersistedItem: async () => {
      posted = true;
      return persistedItem;
    },
  });

  assert.equal(posted, false);
  assert.deepEqual(localInput, {
    category: "Shoes",
    color: "Black",
    paletteMatch: "careful",
    imageDataUrl: "data:image/jpeg;base64,shoes",
  });
});

test("syncs local wardrobe items to Supabase and clears successful items", async () => {
  const secondItem: WardrobeItem = {
    ...localItem,
    id: "local-2",
    category: "Bottom",
    color: "Olive",
  };
  let remainingItems: WardrobeItem[] | null = null;
  const postedNames: string[] = [];

  const result = await syncLocalWardrobeItemsToSupabase({
    userId: "auth-user-1",
    loadLocalItems: () => [localItem, secondItem],
    saveLocalItems: (items) => {
      remainingItems = items;
    },
    savePersistedItem: async (_userId, item) => {
      postedNames.push(item.name);
      return persistedItem;
    },
  });

  assert.deepEqual(postedNames, ["Warm neutral Top", "Olive Bottom"]);
  assert.deepEqual(remainingItems, []);
  assert.deepEqual(result, { attempted: 2, synced: 2, remaining: 0 });
});

test("keeps local wardrobe items that fail Supabase sync", async () => {
  const failedItem: WardrobeItem = {
    ...localItem,
    id: "local-failed",
    color: "Black",
  };
  let remainingItems: WardrobeItem[] | null = null;

  const result = await syncLocalWardrobeItemsToSupabase({
    userId: "auth-user-1",
    loadLocalItems: () => [localItem, failedItem],
    saveLocalItems: (items) => {
      remainingItems = items;
    },
    savePersistedItem: async (_userId, item) => {
      if (item.name === "Black Top") return null;
      return persistedItem;
    },
  });

  assert.deepEqual(remainingItems, [failedItem]);
  assert.deepEqual(result, { attempted: 2, synced: 1, remaining: 1 });
});
