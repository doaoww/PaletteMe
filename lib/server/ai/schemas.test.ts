import assert from "node:assert/strict";
import test from "node:test";
import {
  ScanResultSchema,
  WardrobeItemSchema,
  OutfitPlanSchema,
  createCorrectionOptions,
  normalizeConfidence,
  normalizeScanVerdict,
} from "./schemas.ts";
import { buildScanPrompt } from "./prompts.ts";

test("normalizes scan verdicts to user-facing decisions", () => {
  assert.equal(normalizeScanVerdict("great"), "great");
  assert.equal(normalizeScanVerdict("yes"), "great");
  assert.equal(normalizeScanVerdict("maybe"), "works_with_styling");
  assert.equal(normalizeScanVerdict("no"), "skip_buying");
  assert.equal(normalizeScanVerdict("unclear"), "unclear");
});

test("clamps confidence to a whole number between 0 and 100", () => {
  assert.equal(normalizeConfidence(101.8), 100);
  assert.equal(normalizeConfidence(74.4), 74);
  assert.equal(normalizeConfidence(-4), 0);
  assert.equal(normalizeConfidence(Number.NaN), 0);
});

test("scan result requires verdict, confidence, reason, next action, and correction options", () => {
  const parsed = ScanResultSchema.parse({
    scanType: "clothing_item",
    verdict: "works_with_styling",
    score: 78,
    confidence: 82,
    item: {
      category: "shirt",
      colors: ["soft blue"],
      colorTemperature: "cool",
      formality: "casual",
    },
    reason: "The color fits the user's cool muted palette, but the contrast is a little strong.",
    nextAction: "Wear it away from the face or soften it with a muted layer.",
    stylingTips: ["pair with soft gray", "avoid bright orange accessories"],
    betterAlternatives: ["powder blue", "mauve"],
    correctionOptions: createCorrectionOptions(["category", "color", "verdict"]),
  });

  assert.equal(parsed.verdict, "works_with_styling");
  assert.equal(parsed.correctionOptions.length, 3);
});

test("wardrobe item schema keeps AI labels editable", () => {
  const parsed = WardrobeItemSchema.parse({
    id: "item-1",
    userId: "user-1",
    source: "user_upload",
    name: "navy blazer",
    category: "jacket",
    colors: ["navy"],
    colorTemperature: "cool",
    seasonFit: ["winter"],
    formality: "work",
    correctedByUser: false,
  });

  assert.equal(parsed.category, "jacket");
  assert.equal(parsed.correctedByUser, false);
});

test("outfit plan schema supports manual control actions", () => {
  const parsed = OutfitPlanSchema.parse({
    id: "outfit-1",
    title: "soft office outfit",
    verdict: "great",
    score: 91,
    confidence: 86,
    reason: "The pieces share a cool muted palette and balanced contrast.",
    nextAction: "Save this as a work outfit.",
    items: [
      { wardrobeItemId: "top-1", role: "top", locked: true },
      { wardrobeItemId: "bottom-1", role: "bottom", locked: false },
    ],
    controls: ["lock_item", "swap_item", "remove_item", "save_outfit"],
  });

  assert.deepEqual(parsed.controls, ["lock_item", "swap_item", "remove_item", "save_outfit"]);
});

test("scan prompt includes profile context and practical no-rejection rules", () => {
  const prompt = buildScanPrompt({
    scanType: "product_screenshot",
    profileSummary: "Soft Summer, cool undertone, low contrast.",
    userGoal: "decide if I should buy this jacket",
    wardrobeSummary: "owns gray trousers and white sneakers",
  });

  assert.match(prompt, /Soft Summer/);
  assert.match(prompt, /do not simply reject/i);
  assert.match(prompt, /buy/i);
  assert.match(prompt, /gray trousers/);
});
