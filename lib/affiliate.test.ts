import assert from "node:assert/strict";
import test from "node:test";
import { buildAffiliateUrl } from "./affiliate.ts";

test("returns original url when affiliates are disabled", () => {
  const original = "https://www.asos.com/search/?q=coral";
  assert.equal(buildAffiliateUrl(original, { AFFILIATE_ENABLED: "false" }), original);
  assert.equal(buildAffiliateUrl(original, {}), original);
});

test("wraps ASOS links with AWIN when configured", () => {
  const wrapped = buildAffiliateUrl("https://www.asos.com/product/123?colour=blue", {
    AFFILIATE_ENABLED: "true",
    AFFILIATE_NETWORK: "awin",
    AWIN_PUBLISHER_ID: "111",
    AWIN_ASOS_MID: "222",
  });
  const url = new URL(wrapped);

  assert.equal(url.hostname, "www.awin1.com");
  assert.equal(url.pathname, "/cread.php");
  assert.equal(url.searchParams.get("awinaffid"), "111");
  assert.equal(url.searchParams.get("awinmid"), "222");
  assert.equal(url.searchParams.get("ued"), "https://www.asos.com/product/123?colour=blue");
});

test("wraps ASOS links with Rakuten when configured", () => {
  const wrapped = buildAffiliateUrl("https://www.asos.com/search/?q=dress", {
    AFFILIATE_ENABLED: "true",
    AFFILIATE_NETWORK: "rakuten",
    RAKUTEN_SITE_ID: "site-abc",
    RAKUTEN_ASOS_MID: "merchant-xyz",
  });
  const url = new URL(wrapped);

  assert.equal(url.hostname, "click.linksynergy.com");
  assert.equal(url.pathname, "/deeplink");
  assert.equal(url.searchParams.get("id"), "site-abc");
  assert.equal(url.searchParams.get("mid"), "merchant-xyz");
  assert.equal(url.searchParams.get("murl"), "https://www.asos.com/search/?q=dress");
});

test("adds Amazon associate tag without breaking existing params", () => {
  const wrapped = buildAffiliateUrl("https://www.amazon.com/dp/example?psc=1", {
    AFFILIATE_ENABLED: "true",
    AMAZON_ASSOCIATE_TAG: "paletteme-20",
  });
  const url = new URL(wrapped);

  assert.equal(url.hostname, "www.amazon.com");
  assert.equal(url.searchParams.get("psc"), "1");
  assert.equal(url.searchParams.get("tag"), "paletteme-20");
});

test("does not break unsupported or already wrapped links", () => {
  const unsupported = "https://example.com/item";
  assert.equal(
    buildAffiliateUrl(unsupported, { AFFILIATE_ENABLED: "true", AFFILIATE_NETWORK: "awin" }),
    unsupported
  );

  const alreadyWrapped = "https://www.awin1.com/cread.php?awinmid=1&awinaffid=2&ued=https%3A%2F%2Fwww.asos.com";
  assert.equal(
    buildAffiliateUrl(alreadyWrapped, {
      AFFILIATE_ENABLED: "true",
      AFFILIATE_NETWORK: "awin",
      AWIN_PUBLISHER_ID: "111",
      AWIN_ASOS_MID: "222",
    }),
    alreadyWrapped
  );
});
