import assert from "node:assert/strict";
import test from "node:test";
import { parseImageDataUrl } from "./data-url.ts";

test("parses image data urls and preserves the uploaded mime type", () => {
  const parsed = parseImageDataUrl("data:image/webp;base64,aGVsbG8=");

  assert.equal(parsed?.mimeType, "image/webp");
  assert.equal(parsed?.buffer.toString("utf8"), "hello");
});

test("rejects unsupported or malformed data urls", () => {
  assert.equal(parseImageDataUrl("not-a-data-url"), null);
  assert.equal(parseImageDataUrl("data:text/plain;base64,aGVsbG8="), null);
});
