import assert from "node:assert/strict";
import test from "node:test";
import { buildResultSwatchStyle } from "./result-swatch-style.ts";

test("builds visible swatch background without mixing background shorthand and backgroundColor", () => {
  const style = buildResultSwatchStyle({ hex: "#770E0E", size: 72 });

  assert.equal(style.width, 72);
  assert.equal(style.height, 72);
  assert.equal(style.background, "#770E0E");
  assert.equal(typeof style.boxShadow, "string");
  assert.equal("backgroundColor" in style, false);
});

test("supports rectangular palette swatches with premium depth", () => {
  const style = buildResultSwatchStyle({ hex: "#770E0E", size: 54, shape: "rect" });

  assert.equal(style.width, "100%");
  assert.equal(style.height, 54);
  assert.equal(style.borderRadius, 14);
});

test("uses a gradient as the single background when a swatch needs metallic rendering", () => {
  const style = buildResultSwatchStyle({
    hex: "#D4AF37",
    size: 56,
    gradient: "linear-gradient(135deg, #FFD700, #D4AF37)",
    border: "currentColor",
  });

  assert.equal(style.background, "linear-gradient(135deg, #FFD700, #D4AF37)");
  assert.equal(style.border, "1px solid currentColor");
  assert.equal("backgroundColor" in style, false);
});
