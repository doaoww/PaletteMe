import assert from "node:assert/strict";
import test from "node:test";
import { buildFlux2ProInput } from "./replicate-input.ts";

test("builds flux-2-pro input with input_images array and correct defaults", () => {
  const photo = new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" });
  const input = buildFlux2ProInput("White draping cloth", photo) as Record<string, unknown>;

  assert.equal(input.prompt, "White draping cloth");
  assert.deepEqual(input.input_images, [photo]);
  assert.equal(input.resolution, "1 MP");
  assert.equal(input.aspect_ratio, "match_input_image");
  assert.equal(input.safety_tolerance, 2);
  assert.equal(input.output_format, "webp");
  assert.equal(input.output_quality, 90);

  // old wrong params must not be present
  assert.equal(input.image, undefined);
  assert.equal(input.prompt_strength, undefined);
});

test("accepts 2 MP resolution override", () => {
  const photo = new Blob([new Uint8Array([1])], { type: "image/png" });
  const input = buildFlux2ProInput("prompt", photo, "2 MP") as Record<string, unknown>;
  assert.equal(input.resolution, "2 MP");
});
