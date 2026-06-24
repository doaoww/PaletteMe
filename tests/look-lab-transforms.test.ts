import { test } from "node:test";
import assert from "node:assert/strict";
import { hexToRgb, blendColor } from "../components/look-lab/transforms/apply-draping.ts";

test("hexToRgb parses valid hex", () => {
  assert.deepEqual(hexToRgb("#FFAD8B"), { r: 255, g: 173, b: 139 });
});

test("hexToRgb parses 3-digit hex", () => {
  assert.deepEqual(hexToRgb("#F80"), { r: 255, g: 136, b: 0 });
});

test("blendColor blends with alpha", () => {
  const result = blendColor(200, 255, 0.5);
  assert.equal(result, 228); // Math.round(200 * 0.5 + 255 * 0.5)
});
