import test from "node:test";
import assert from "node:assert/strict";
import { CURATED_PRODUCTS } from "./curated-products.ts";

test("curated product seed has enough real product examples for affiliate review", () => {
  assert.ok(CURATED_PRODUCTS.length >= 40, `expected at least 40 products, got ${CURATED_PRODUCTS.length}`);
  assert.ok(CURATED_PRODUCTS.length <= 80, `expected no more than 80 products, got ${CURATED_PRODUCTS.length}`);
});

test("curated products link to real product pages, not marketplace searches", () => {
  const domains = new Set<string>();

  for (const product of CURATED_PRODUCTS) {
    const url = new URL(product.productUrl);
    domains.add(url.hostname.replace(/^www\./, ""));
    assert.equal(url.protocol, "https:");
    assert.equal(product.sourceType, "curated-product");
    assert.ok(!url.pathname.toLowerCase().includes("search"), product.productUrl);
    assert.ok(product.brand.length > 0);
    assert.ok(product.retailer.length > 0);
    assert.ok(product.title.length > 0);
    assert.ok(product.hex.startsWith("#"));
  }

  assert.ok(domains.has("uniqlo.com"));
  assert.ok(domains.has("adidas.com"));
  assert.ok(domains.has("sephora.com"));
});

test("curated products cover wardrobe, shoes, and makeup examples", () => {
  const categories = new Set(CURATED_PRODUCTS.map((product) => product.category));
  const wardrobeTypes = new Set(CURATED_PRODUCTS.flatMap((product) => product.wardrobeTypes));

  assert.ok(categories.has("tops"));
  assert.ok(categories.has("bottoms"));
  assert.ok(categories.has("shoes"));
  assert.ok(categories.has("makeup"));
  assert.ok(wardrobeTypes.has("menswear"));
  assert.ok(wardrobeTypes.has("womenswear"));
  assert.ok(wardrobeTypes.has("unisex"));
});

test("curated products include season and fit metadata for matching", () => {
  for (const product of CURATED_PRODUCTS) {
    assert.ok(product.seasonIds.length > 0, product.id);
    assert.ok(product.subSeasonIds.length > 0, product.id);
    assert.ok(product.styleTags.length > 0, product.id);
    assert.ok(product.bodyTypes.length > 0, product.id);
    assert.ok(product.heightRanges.length > 0, product.id);
    assert.ok(product.weightRanges.length > 0, product.id);
    assert.ok(product.occasions.length > 0, product.id);
    assert.ok(product.budgetPrefs.length > 0, product.id);
    assert.ok(product.climatePrefs.length > 0, product.id);
  }
});
