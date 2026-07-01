import assert from "node:assert/strict";
import test from "node:test";
import { SUB_SEASONS } from "@/lib/shared/landing-data";
import {
  SHOPPING_INTENTS,
  SHOPPING_INTENT_CATEGORIES,
  SHOPPING_INTENT_STYLE_TAGS,
} from "./shopping-intents.ts";

test("shopping intent catalog is large enough for affiliate review demos", () => {
  assert.ok(
    SHOPPING_INTENTS.length >= 300,
    `expected at least 300 shopping intents, got ${SHOPPING_INTENTS.length}`
  );
});

test("shopping intent catalog covers every sub-season", () => {
  for (const subSeason of SUB_SEASONS) {
    const matches = SHOPPING_INTENTS.filter((intent) =>
      intent.subSeasonIds.includes(subSeason.id)
    );
    assert.ok(
      matches.length >= 16,
      `${subSeason.name} needs at least 16 intents, got ${matches.length}`
    );
  }
});

test("shopping intent catalog supports the main wardrobe and style modes", () => {
  const wardrobeTypes = new Set(SHOPPING_INTENTS.flatMap((intent) => intent.wardrobeTypes));
  assert.ok(wardrobeTypes.has("menswear"));
  assert.ok(wardrobeTypes.has("womenswear"));
  assert.ok(wardrobeTypes.has("unisex"));

  for (const required of ["minimalist", "classic", "streetwear", "romantic", "office", "eclectic"]) {
    assert.ok(SHOPPING_INTENT_STYLE_TAGS.has(required), `missing style tag ${required}`);
  }

  for (const required of ["tops", "bottoms", "jackets", "dresses", "shoes", "bags", "jewelry", "makeup"]) {
    assert.ok(SHOPPING_INTENT_CATEGORIES.has(required as never), `missing category ${required}`);
  }
});

test("shopping intents use honest search links instead of fake product detail URLs", () => {
  for (const intent of SHOPPING_INTENTS) {
    assert.equal(intent.sourceType, "search-intent");
    assert.match(intent.merchantSearchUrl, /^https:\/\//);
    assert.ok(intent.searchQuery.length >= 8);
    assert.ok(intent.reason.length >= 50);
  }
});
