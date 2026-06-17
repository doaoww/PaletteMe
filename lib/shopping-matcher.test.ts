import assert from "node:assert/strict";
import test from "node:test";
import { rankShoppingIntents } from "./shopping-matcher.ts";
import type { QuizProfile } from "./quiz.ts";

function profile(overrides: Partial<QuizProfile> = {}): QuizProfile {
  return {
    answers: {
      wardrobeType: "both",
      styleDirections: ["classic"],
      occasions: ["work"],
      height: "160-170",
      weightRange: "55-75",
      budgetPref: "mid",
      climatePref: "four-seasons",
      makeupPref: "sometimes",
    },
    scores: { spring: 0, summer: 0, autumn: 5, winter: 0 },
    seasonId: "autumn",
    seasonName: "Autumn",
    undertoneHint: "warm",
    completedAt: "2026-06-17T00:00:00.000Z",
    quizColorEvidence: {
      warmCool: { first: 4, second: 1, winner: "warm", confidence: 80, warm: 4, cool: 1 },
      depth: { first: 1, second: 4, winner: "deep", confidence: 80, light: 1, deep: 4 },
      clarity: { first: 1, second: 4, winner: "muted", confidence: 80, bright: 1, muted: 4 },
      seasonId: "autumn",
      subSeason: "Dark Autumn",
      confidence: 82,
      evidenceCount: 7,
      reasons: ["warm deep muted evidence"],
    },
    quizConfidence: 82,
    bodyType: "pear",
    styleVector: { aesthetics: ["classic", "office"], fit: ["tailored"], occasions: ["office"] },
    subSeason: "Dark Autumn",
    ...overrides,
  };
}

test("ranks dark autumn warm earthy pieces above off-season items", () => {
  const ranked = rankShoppingIntents(profile(), { limit: 12 });

  assert.equal(ranked.length, 12);
  assert.ok(ranked.every((item) => item.score >= 0.65));
  assert.ok(ranked.slice(0, 8).every((item) => item.intent.seasonIds.includes("autumn")));
  assert.ok(
    ranked.slice(0, 8).some((item) => item.intent.subSeasonIds.includes("dark-autumn"))
  );
  assert.ok(ranked[0].reason.includes("Dark Autumn") || ranked[0].reason.includes("Autumn"));
});

test("respects wardrobe type and returns menswear or unisex picks for menswear users", () => {
  const ranked = rankShoppingIntents(
    profile({
      answers: {
        wardrobeType: "menswear",
        styleDirections: ["streetwear"],
        occasions: ["casual"],
        height: "over-170",
        weightRange: "over-75",
        budgetPref: "mid",
        climatePref: "four-seasons",
        makeupPref: "no",
      },
      bodyType: "inverted-triangle",
      styleVector: { aesthetics: ["streetwear", "casual"], fit: ["relaxed"], occasions: ["weekend"] },
    }),
    { limit: 10 }
  );

  assert.ok(
    ranked.every((item) =>
      item.intent.wardrobeTypes.includes("menswear") || item.intent.wardrobeTypes.includes("unisex")
    )
  );
  assert.ok(ranked.every((item) => item.intent.category !== "makeup"));
});

test("body fit affects the order without rejecting useful pieces", () => {
  const pearRanked = rankShoppingIntents(
    profile({ bodyType: "pear", styleVector: { aesthetics: ["romantic"], fit: [], occasions: [] } }),
    { limit: 20 }
  );
  const invertedRanked = rankShoppingIntents(
    profile({ bodyType: "inverted-triangle", styleVector: { aesthetics: ["romantic"], fit: [], occasions: [] } }),
    { limit: 20 }
  );

  const pearFirstBottom = pearRanked.findIndex((item) => item.intent.category === "bottoms");
  const invertedFirstBottom = invertedRanked.findIndex((item) => item.intent.category === "bottoms");

  assert.ok(pearFirstBottom >= 0);
  assert.ok(invertedFirstBottom >= 0);
  assert.ok(invertedFirstBottom <= pearFirstBottom);
});
