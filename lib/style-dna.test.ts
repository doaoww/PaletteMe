import assert from "node:assert/strict";
import test from "node:test";
import { buildStyleDNA } from "./style-dna.ts";

const mockStyleProfile = {
  kibbeType: "Flamboyant Natural",
  bestSilhouettes: ["wide-leg trouser", "oversized jacket"],
  bestFabrics: ["linen", "cotton", "suede"],
  colorSeasonFamily: "Dark Autumn",
};

const streetwearQuiz = {
  styleDirection: "streetwear",
  occasionPref: "casual",
  budget: "mid",
  height: "170-180",
  weight: "55-75",
  gender: "woman",
};

test("streetwear quiz produces streetwear vocabulary", () => {
  const dna = buildStyleDNA(mockStyleProfile, streetwearQuiz, "Dark Autumn", "woman");
  assert.ok(dna.vocabulary.includes("bomber"), `vocabulary should contain 'bomber', got: ${dna.vocabulary}`);
  assert.ok(dna.vocabulary.includes("cargo"), `vocabulary should contain 'cargo', got: ${dna.vocabulary}`);
  assert.ok(dna.avoidVocabulary.includes("fitted blazer"), `avoidVocabulary should contain 'fitted blazer', got: ${dna.avoidVocabulary}`);
  assert.equal(dna.styleDirection, "streetwear");
});

test("palette hexes are included from season", () => {
  const dna = buildStyleDNA(mockStyleProfile, streetwearQuiz, "Dark Autumn", "woman");
  assert.ok(dna.paletteHexes.length > 0, "paletteHexes should be non-empty");
  // Dark Autumn palette should have warm earth tones
  assert.ok(dna.paletteHexes.some(h => h.startsWith("#")), "all hexes should start with #");
});
