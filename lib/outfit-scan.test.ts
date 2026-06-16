import assert from "node:assert/strict";
import test from "node:test";
import {
  SCAN_API_ENDPOINT,
  adaptAiScanResultToOutfitScanResult,
  buildScanProfilePayload,
  buildOutfitScanFormData,
  formatScanHistoryItems,
  requestAiScanResult,
  validateOutfitImage,
  type AiScanResultForUi,
} from "./outfit-scan.ts";
import { buildQuizProfile, emptyScores } from "./quiz.ts";

test("validates supported outfit image files", () => {
  const file = new File(["image"], "jacket.webp", { type: "image/webp" });
  assert.equal(validateOutfitImage(file), null);
});

test("rejects unsupported outfit image files", () => {
  const file = new File(["text"], "notes.txt", { type: "text/plain" });
  assert.equal(validateOutfitImage(file), "Only JPG, PNG, or WebP images are supported.");
});

test("rejects outfit images over 10 MB", () => {
  const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "huge.jpg", {
    type: "image/jpeg",
  });
  assert.equal(validateOutfitImage(file), "Image must be 10 MB or smaller.");
});

test("builds scanner form data with optional user id", () => {
  const file = new File(["image"], "dress.jpg", { type: "image/jpeg" });
  const formData = buildOutfitScanFormData({
    file,
    scanType: "product_screenshot",
    colortype: "summer",
    seasonId: "summer",
    bestColors: ["#D4C5E2", "#B8A9C9"],
    colorsToAvoid: ["hot orange", "mustard"],
    subSeason: "Soft Summer",
    profileSummary: "Soft Summer profile with cool muted colors.",
    userId: "user-123",
  });

  assert.equal(formData.get("image"), file);
  assert.equal(formData.get("scanType"), "product_screenshot");
  assert.equal(formData.get("colortype"), "summer");
  assert.equal(formData.get("seasonId"), "summer");
  assert.equal(formData.get("best_colors"), JSON.stringify(["#D4C5E2", "#B8A9C9"]));
  assert.equal(formData.get("bestColors"), JSON.stringify(["#D4C5E2", "#B8A9C9"]));
  assert.equal(formData.get("colors_to_avoid"), JSON.stringify(["hot orange", "mustard"]));
  assert.equal(formData.get("colorsToAvoid"), JSON.stringify(["hot orange", "mustard"]));
  assert.equal(formData.get("subSeason"), "Soft Summer");
  assert.equal(formData.get("profileSummary"), "Soft Summer profile with cool muted colors.");
  assert.equal(formData.get("user_id"), "user-123");
  assert.equal(formData.get("mode"), "sync");
});

test("builds personalized scan profile payload from a quiz profile", () => {
  const profile = buildQuizProfile(
    {
      wardrobeType: "unisex",
      styleChallenge: "dont-know-buy",
      skinTone: "olive",
      veinColor: "green",
      naturalHairColor: "dark-brown",
      eyeColor: "hazel",
      contrastPref: "medium",
      sunReaction: "never-burns",
      styleDirections: ["classic"],
      occasions: ["work"],
    },
    emptyScores(),
    {
      seasonId: "autumn",
      seasonName: "Autumn",
      undertoneHint: "warm",
      subSeason: "Dark Autumn",
    }
  );

  const payload = buildScanProfilePayload(profile);

  assert.equal(payload.colortype, "autumn");
  assert.equal(payload.seasonId, "autumn");
  assert.equal(payload.subSeason, "Dark Autumn");
  assert.ok(payload.bestColors.includes("Dark Burgundy #800505"));
  assert.ok(payload.colorsToAvoid.includes("Light Pink #FFB6C1"));
  assert.match(payload.profileSummary, /Dark Autumn/);
  assert.match(payload.profileSummary, /Best colors near the face: Dark Burgundy #800505/);
  assert.match(payload.profileSummary, /Colors to use carefully or away from face: Light Pink #FFB6C1/);
});

test("builds scanner form data directly from a quiz profile", () => {
  const profile = buildQuizProfile(
    {
      wardrobeType: "unisex",
      styleChallenge: "style-refresh",
      skinTone: "olive",
      veinColor: "green",
      naturalHairColor: "dark-brown",
      eyeColor: "hazel",
      contrastPref: "medium",
      sunReaction: "never-burns",
    },
    emptyScores(),
    {
      seasonId: "autumn",
      seasonName: "Autumn",
      undertoneHint: "warm",
      subSeason: "Dark Autumn",
    }
  );

  const formData = buildOutfitScanFormData({
    file: new File(["image"], "coat.jpg", { type: "image/jpeg" }),
    scanType: "clothing_item",
    profile,
  });

  assert.equal(formData.get("colortype"), "autumn");
  assert.equal(formData.get("seasonId"), "autumn");
  assert.equal(formData.get("subSeason"), "Dark Autumn");
  assert.match(String(formData.get("bestColors")), /Dark Burgundy #800505/);
  assert.match(String(formData.get("colorsToAvoid")), /Light Pink #FFB6C1/);
  assert.match(String(formData.get("profileSummary")), /Dark Autumn/);
});

test("omits blank user id from scanner form data", () => {
  const formData = buildOutfitScanFormData({
    file: new File(["image"], "top.png", { type: "image/png" }),
    scanType: "clothing_item",
    colortype: "spring",
    bestColors: [],
    userId: " ",
  });

  assert.equal(formData.has("user_id"), false);
  assert.equal(formData.get("scanType"), "clothing_item");
});

test("scan UI posts to the new AI scan endpoint", () => {
  assert.equal(SCAN_API_ENDPOINT, "/api/ai/scan");
});

test("adapts new AI scan result shape to the existing scan UI shape", () => {
  const result = adaptAiScanResultToOutfitScanResult({
    verdict: "works_with_styling",
    score: 72,
    item: {
      category: "jacket",
      colors: ["olive", "cream"],
      colorTemperature: "warm",
      formality: "casual",
    },
    reason: "The olive is close to the user's palette.",
    nextAction: "Wear it with warmer neutrals.",
  });

  assert.deepEqual(result, {
    verdict: "works_with_styling",
    match: true,
    score: 72,
    confidence: undefined,
    dominant_colors: ["olive", "cream"],
    category: "jacket",
    colorTemperature: "warm",
    reason: "The olive is close to the user's palette.",
    suggestion: "Wear it with warmer neutrals.",
    stylingTips: [],
    betterAlternatives: [],
  });
});

test("keeps scan confidence, styling tips, and alternatives for the result UI", () => {
  const result = adaptAiScanResultToOutfitScanResult({
    verdict: "skip_buying",
    score: 31,
    confidence: 74,
    item: {
      category: "hoodie",
      colors: ["icy gray"],
      colorTemperature: "cool",
    },
    reason: "The shade is too cool and stark for the user's warm muted palette.",
    nextAction: "Use this away from the face or choose a warmer gray.",
    stylingTips: ["wear with a camel scarf"],
    betterAlternatives: ["warm taupe hoodie", "muted olive hoodie"],
  });

  assert.equal(result.match, false);
  assert.equal(result.confidence, 74);
  assert.deepEqual(result.stylingTips, ["wear with a camel scarf"]);
  assert.deepEqual(result.betterAlternatives, ["warm taupe hoodie", "muted olive hoodie"]);
});

test("reads a synchronous AI scan result response", async () => {
  const apiResult = aiScanResult({ score: 91 });
  const result = await requestAiScanResult(new FormData(), {
    fetcher: async () => jsonResponse({ ok: true, mode: "sync", result: apiResult }),
  });

  assert.deepEqual(result, apiResult);
});

test("polls an asynchronous AI scan response until the job succeeds", async () => {
  const calls: string[] = [];
  const apiResult = aiScanResult({ score: 82 });
  const result = await requestAiScanResult(new FormData(), {
    pollIntervalMs: 0,
    fetcher: async (input) => {
      calls.push(String(input));
      if (calls.length === 1) {
        return jsonResponse({ ok: true, mode: "async", jobId: "job-1" }, { status: 202 });
      }
      return jsonResponse({
        ok: true,
        job: { id: "job-1", status: "succeeded", result: apiResult },
      });
    },
  });

  assert.deepEqual(result, apiResult);
  assert.deepEqual(calls, [SCAN_API_ENDPOINT, "/api/ai/jobs/job-1"]);
});

test("throws the server scan error instead of a generic start failure", async () => {
  const originalError = console.error;
  const logs: unknown[] = [];
  console.error = (...args: unknown[]) => {
    logs.push(args);
  };

  try {
    await assert.rejects(
      requestAiScanResult(new FormData(), {
        fetcher: async () =>
          jsonResponse(
            {
              ok: false,
              error: "OPENAI_API_KEY is not configured.",
              code: "OPENAI_KEY_MISSING",
              stage: "env",
            },
            { status: 500 }
          ),
      }),
      /OPENAI_KEY_MISSING: OPENAI_API_KEY is not configured/
    );
  } finally {
    console.error = originalError;
  }

  assert.equal(logs.length, 1);
});

test("formats the latest five scan history records for the scan UI", () => {
  const items = formatScanHistoryItems(
    [
      historyRecord("old", "2026-06-10T10:00:00.000Z", "great", 91, "clothing_item"),
      historyRecord("newest", "2026-06-15T10:00:00.000Z", "great", 92, "clothing_item", "https://example.com/scan.jpg"),
      historyRecord("skip", "2026-06-14T10:00:00.000Z", "skip_buying", 34, "product_screenshot"),
      historyRecord("third", "2026-06-13T10:00:00.000Z", "works_with_styling", 76, "outfit"),
      historyRecord("fourth", "2026-06-12T10:00:00.000Z", "unclear", 42, "makeup"),
      historyRecord("fifth", "2026-06-11T10:00:00.000Z", "great", 88, "clothing_item"),
    ],
    "en-US"
  );

  assert.deepEqual(items.map((item) => item.id), ["newest", "skip", "third", "fourth", "fifth"]);
  assert.equal(items[0].thumbnailUrl, "https://example.com/scan.jpg");
  assert.equal(items[0].verdictLabel, "Works for you");
  assert.equal(items[1].verdictLabel, "Skip this");
  assert.equal(items[0].scoreText, "9.2 / 10");
  assert.equal(items[0].scanTypeLabel, "Clothing item");
  assert.equal(items[0].colorLabel, "olive");
  assert.equal(items[0].colorHex, null);
  assert.equal(items[0].dateScanned, "Jun 15, 2026");
});

function historyRecord(
  id: string,
  createdAt: string,
  verdict: string,
  score: number,
  scanType: string,
  imageUrl?: string
) {
  return {
    id,
    createdAt,
    scanType,
    result: {
      scanType,
      verdict,
      score,
      confidence: 80,
      item: {
        category: "shirt",
        colors: ["olive"],
        colorTemperature: "warm",
        formality: "casual",
      },
      reason: "This is a history item with enough reason text.",
      nextAction: "Wear it with your palette.",
      stylingTips: [],
      betterAlternatives: [],
      correctionOptions: [{ field: "verdict", label: "wrong verdict" }],
      image_url: imageUrl,
    },
  };
}

function aiScanResult(overrides: Partial<AiScanResultForUi> = {}): AiScanResultForUi {
  return {
    verdict: "great",
    score: 90,
    item: {
      category: "shirt",
      colors: ["olive"],
      colorTemperature: "warm",
    },
    reason: "The color fits the user's palette.",
    nextAction: "Wear it near your face.",
    ...overrides,
  };
}

function jsonResponse(
  body: unknown,
  init: ResponseInit = {}
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json" },
  });
}
