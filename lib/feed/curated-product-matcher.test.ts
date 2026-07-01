import test from "node:test";
import assert from "node:assert/strict";
import { rankCuratedProducts, toFeedCuratedProduct } from "./curated-product-matcher.ts";

test("ranks real curated products for a dark autumn profile", () => {
  const ranked = rankCuratedProducts(
    {
      seasonId: "autumn",
      seasonName: "Autumn",
      subSeason: "Dark Autumn",
      bodyType: "rectangle",
      styleVector: { aesthetics: ["classic", "casual"], occasions: ["work", "casual"] },
      answers: {
        wardrobeType: "both",
        height: "160-170",
        weightRange: "55-75",
        budgetPref: "mid",
        climatePref: "four-seasons",
        makeupPref: "yes",
        styleDirections: ["classic", "minimalist"],
        occasions: ["work", "casual"],
      },
    },
    { limit: 12 }
  );

  assert.ok(ranked.length >= 12);
  assert.ok(ranked[0].intent.sourceType === "curated-product");
  assert.ok(ranked.slice(0, 8).some((item) => item.intent.subSeasonIds.includes("dark-autumn")));
  assert.ok(ranked.slice(0, 8).some((item) => item.intent.productUrl.includes("uniqlo.com") || item.intent.productUrl.includes("adidas.com")));
});

test("filters makeup out when the user says no makeup", () => {
  const ranked = rankCuratedProducts(
    {
      seasonId: "winter",
      subSeason: "True Winter",
      answers: {
        wardrobeType: "unisex",
        makeupPref: "no",
      },
    },
    { limit: 40 }
  );

  assert.ok(ranked.length > 0);
  assert.equal(ranked.some((item) => item.intent.category === "makeup"), false);
});

test("adapts curated product matches into feed products with exact product links", () => {
  const ranked = rankCuratedProducts(
    {
      seasonId: "spring",
      subSeason: "Light Spring",
      bodyType: "hourglass",
      answers: { wardrobeType: "womenswear", makeupPref: "yes" },
    },
    { limit: 1 }
  );

  const feedProduct = toFeedCuratedProduct(ranked[0]);
  const url = new URL(feedProduct.clickUrl);

  assert.equal(feedProduct.source, "curated-product");
  assert.equal(feedProduct.priceLabel, "check retailer");
  assert.equal(url.protocol, "https:");
  assert.ok(!url.pathname.toLowerCase().includes("search"));
  assert.ok(feedProduct.brandedName.includes(ranked[0].intent.brand));
});
