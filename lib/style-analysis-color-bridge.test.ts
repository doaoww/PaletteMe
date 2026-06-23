import assert from "node:assert/strict";
import test from "node:test";
import { deriveColorSeason } from "./style-analysis-color-bridge.ts";

const coolDarkFeatures = {
  hairDarkness: 92,
  skinBrightness: 28,
  eyeIntensity: 85,
  hairColorDesc: "jet black cool-toned",
  skinToneDesc: "deep cool brown with ashy undertone",
  eyeColorDesc: "very dark brown, almost black, cool",
};

const coolDarkScores = {
  contrastScore: 78,
  contrastLevel: "high" as const,
};

test("high contrast + cool text evidence → Winter family, not Summer", () => {
  const result = deriveColorSeason(coolDarkFeatures, coolDarkScores);
  assert.match(result.season, /winter/i);
  assert.equal(result.derivedUndertone, "cool");
  assert.ok(result.confidence > 0.65, `Expected confidence > 0.65, got ${result.confidence}`);
});

const warmDeepFeatures = {
  hairDarkness: 88,
  skinBrightness: 32,
  eyeIntensity: 70,
  hairColorDesc: "deep warm chocolate brown",
  skinToneDesc: "deep olive with golden warm undertone",
  eyeColorDesc: "warm dark brown with amber flecks",
};

const warmDeepScores = {
  contrastScore: 62,
  contrastLevel: "medium" as const,
};

test("warm + deep + earthy text → Dark Autumn, not Winter", () => {
  const result = deriveColorSeason(warmDeepFeatures, warmDeepScores);
  assert.match(result.season, /autumn/i);
  assert.equal(result.derivedUndertone, "warm");
});
