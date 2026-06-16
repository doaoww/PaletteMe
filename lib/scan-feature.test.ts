import assert from "node:assert/strict";
import test from "node:test";

import {
  SCAN_DISABLED_RESPONSE,
  getScanComingSoonCopy,
  isScanFeatureEnabled,
} from "./scan-feature.ts";

test("keeps scan feature disabled by default for deploy safety", () => {
  assert.equal(isScanFeatureEnabled(undefined), false);
  assert.equal(isScanFeatureEnabled(""), false);
});

test("enables scan feature only through explicit public env values", () => {
  assert.equal(isScanFeatureEnabled("true"), true);
  assert.equal(isScanFeatureEnabled("1"), true);
  assert.equal(isScanFeatureEnabled("yes"), true);
  assert.equal(isScanFeatureEnabled("on"), true);
  assert.equal(isScanFeatureEnabled("false"), false);
});

test("uses user-facing coming soon copy for the blocked scan surface", () => {
  const copy = getScanComingSoonCopy();

  assert.match(copy.title, /coming soon/i);
  assert.match(copy.body, /polishing/i);
  assert.equal(SCAN_DISABLED_RESPONSE.code, "SCAN_FEATURE_DISABLED");
});
