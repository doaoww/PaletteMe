import assert from "node:assert/strict";
import test from "node:test";
import {
  applyPersistedWardrobeCorrection,
  clearWardrobeForTest,
  listPersistedWardrobeItems,
  savePersistedWardrobeItem,
} from "./wardrobe.ts";
import {
  buildAuthenticatedScanHistoryRow,
  clearScanHistoryForTest,
  listScanHistory,
  saveAuthenticatedScanHistory,
  saveScanHistory,
} from "./scan-history.ts";
import { createCorrectionOptions } from "./ai/schemas.ts";

function withoutSupabaseEnv(t: test.TestContext) {
  const previous = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  t.after(() => {
    if (previous.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previous.url;
    if (previous.key === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previous.key;
  });
}

test("persisted wardrobe helpers use local fallback when Supabase is not configured", async (t) => {
  withoutSupabaseEnv(t);
  clearWardrobeForTest();

  const item = await savePersistedWardrobeItem({
    userId: "user-1",
    source: "manual",
    name: "olive overshirt",
    category: "jacket",
    colors: ["olive"],
    colorTemperature: "warm",
    seasonFit: ["autumn"],
    formality: "casual",
  });

  assert.equal(item.name, "olive overshirt");
  assert.equal(item.correctedByUser, false);
  assert.deepEqual(
    (await listPersistedWardrobeItems("user-1")).map((saved) => saved.name),
    ["olive overshirt"]
  );
  assert.deepEqual(await listPersistedWardrobeItems("other-user"), []);
});

test("persisted wardrobe corrections mark local fallback items as user corrected", async (t) => {
  withoutSupabaseEnv(t);
  clearWardrobeForTest();

  const item = await savePersistedWardrobeItem({
    userId: "user-1",
    source: "scan",
    name: "brown layer",
    category: "top",
    colors: ["brown"],
    colorTemperature: "warm",
    seasonFit: ["autumn"],
    formality: "unknown",
  });

  const corrected = await applyPersistedWardrobeCorrection(item.id, {
    category: "jacket",
    colors: ["chocolate brown"],
  });

  assert.equal(corrected?.category, "jacket");
  assert.deepEqual(corrected?.colors, ["chocolate brown"]);
  assert.equal(corrected?.correctedByUser, true);
});

test("scan history can be saved and listed through the local fallback", async (t) => {
  withoutSupabaseEnv(t);
  clearScanHistoryForTest();

  const saved = await saveScanHistory({
    userId: "user-1",
    scanType: "product_screenshot",
    result: {
      scanType: "product_screenshot",
      verdict: "works_with_styling",
      score: 78,
      confidence: 84,
      item: {
        category: "shirt",
        colors: ["soft white"],
        colorTemperature: "neutral",
        formality: "casual",
        pattern: null,
        material: null,
      },
      reason: "The soft white is wearable but needs warmer accents.",
      nextAction: "Pair it with camel, olive, or warm brown from your closet.",
      stylingTips: ["keep it away from stark black"],
      betterAlternatives: ["ivory", "warm cream"],
      correctionOptions: createCorrectionOptions(["category", "color", "verdict"]),
    },
  });

  assert.equal(saved.userId, "user-1");
  assert.equal(saved.result.verdict, "works_with_styling");
  assert.match(saved.createdAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.deepEqual(
    (await listScanHistory("user-1")).map((scan) => scan.id),
    [saved.id]
  );
  assert.deepEqual(await listScanHistory("other-user"), []);
}
);

test("authenticated scan history rows include auth user id and requested metadata", () => {
  const row = buildAuthenticatedScanHistoryRow({
    id: "scan-1",
    userId: "auth-user-1",
    scanType: "clothing_item",
    seasonId: "autumn",
    imageUrl: null,
    mimeType: "image/jpeg",
    createdAt: "2026-06-15T00:00:00.000Z",
    result: {
      scanType: "clothing_item",
      verdict: "great",
      score: 92,
      confidence: 88,
      item: {
        category: "jacket",
        colors: ["olive"],
        colorTemperature: "warm",
        formality: "casual",
        pattern: null,
        material: null,
      },
      reason: "Olive is strongly aligned with this warm autumn palette.",
      nextAction: "Wear it near the face.",
      stylingTips: ["pair with camel"],
      betterAlternatives: [],
      correctionOptions: createCorrectionOptions(["category", "color", "verdict"]),
    },
  });

  assert.equal(row?.user_id, "auth-user-1");
  assert.equal(row?.scan_type, "clothing_item");
  assert.equal(row?.result.verdict, "great");
  assert.equal(row?.result.score, 92);
  assert.equal(row?.result.reason, "Olive is strongly aligned with this warm autumn palette.");
  assert.equal(row?.result.season_id, "autumn");
  assert.deepEqual(row?.result.image, {
    stored: false,
    url: null,
    mimeType: "image/jpeg",
  });
});

test("authenticated scan history rows are skipped when no auth user is present", () => {
  const row = buildAuthenticatedScanHistoryRow({
    userId: null,
    scanType: "makeup",
    result: {
      scanType: "makeup",
      verdict: "unclear",
      score: 50,
      confidence: 40,
      item: {
        category: "lipstick",
        colors: ["pink"],
        colorTemperature: "cool",
        formality: "casual",
        pattern: null,
        material: null,
      },
      reason: "The image is not clear enough to make a confident palette call.",
      nextAction: "Try another photo in daylight.",
      stylingTips: [],
      betterAlternatives: [],
      correctionOptions: createCorrectionOptions(["color", "verdict"]),
    },
  });

  assert.equal(row, null);
});

test("authenticated scan history saves through the Supabase scan_history table", async () => {
  let insertedTable = "";
  let insertedRow: unknown = null;
  const supabase = {
    from(table: string) {
      insertedTable = table;
      return {
        insert(row: unknown) {
          insertedRow = row;
          return {
            select() {
              return {
                async single() {
                  return { data: row, error: null };
                },
              };
            },
          };
        },
      };
    },
  };

  const saved = await saveAuthenticatedScanHistory({
    supabase,
    id: "scan-2",
    userId: "auth-user-2",
    scanType: "product_screenshot",
    seasonId: "summer",
    imageUrl: "https://example.com/scan.jpg",
    createdAt: "2026-06-15T00:01:00.000Z",
    result: {
      scanType: "product_screenshot",
      verdict: "works_with_styling",
      score: 74,
      confidence: 80,
      item: {
        category: "dress",
        colors: ["dusty rose"],
        colorTemperature: "cool",
        formality: "casual",
        pattern: null,
        material: null,
      },
      reason: "The dusty rose works for the user's soft summer palette.",
      nextAction: "Buy only if the real color matches the screenshot.",
      stylingTips: [],
      betterAlternatives: [],
      correctionOptions: createCorrectionOptions(["color", "verdict"]),
    },
  });

  assert.equal(insertedTable, "scan_history");
  assert.equal((insertedRow as { user_id?: string }).user_id, "auth-user-2");
  assert.equal(saved?.userId, "auth-user-2");
  assert.equal(saved?.result.image_url, "https://example.com/scan.jpg");
  assert.equal(saved?.result.season_id, "summer");
});
