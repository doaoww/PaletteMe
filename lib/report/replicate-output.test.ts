import assert from "node:assert/strict";
import test from "node:test";
import { extractReplicateImageUrl } from "./replicate-output.ts";

test("extracts URL from a direct string output", () => {
  assert.equal(extractReplicateImageUrl("https://replicate.delivery/out.png"), "https://replicate.delivery/out.png");
});

test("extracts URL from a FileOutput-like object", () => {
  const output = { url: () => new URL("https://replicate.delivery/file-output.png") };
  assert.equal(extractReplicateImageUrl(output), "https://replicate.delivery/file-output.png");
});

test("extracts URL from the common one-item Replicate output array", () => {
  const output = [{ url: () => new URL("https://replicate.delivery/array-output.png") }];
  assert.equal(extractReplicateImageUrl(output), "https://replicate.delivery/array-output.png");
});

test("returns null for unusable output shapes", () => {
  assert.equal(extractReplicateImageUrl([]), null);
  assert.equal(extractReplicateImageUrl({}), null);
  assert.equal(extractReplicateImageUrl(null), null);
});
