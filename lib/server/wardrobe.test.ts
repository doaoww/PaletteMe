import assert from "node:assert/strict";
import test from "node:test";
import {
  applyWardrobeCorrection,
  clearWardrobeForTest,
  listWardrobeItems,
  saveWardrobeItem,
} from "./wardrobe.ts";

test("saves wardrobe items with editable AI labels", () => {
  clearWardrobeForTest();
  const item = saveWardrobeItem({
    userId: "user-1",
    source: "manual",
    name: "blue shirt",
    category: "top",
    colors: ["blue"],
    colorTemperature: "cool",
    seasonFit: ["summer"],
    formality: "casual",
  });

  assert.equal(item.userId, "user-1");
  assert.equal(item.correctedByUser, false);
  assert.equal(listWardrobeItems("user-1").length, 1);
});

test("lists wardrobe items by user id", () => {
  clearWardrobeForTest();
  saveWardrobeItem({
    userId: "user-1",
    source: "manual",
    name: "gray trousers",
    category: "bottom",
    colors: ["gray"],
    colorTemperature: "cool",
    seasonFit: ["summer"],
    formality: "work",
  });
  saveWardrobeItem({
    userId: "user-2",
    source: "manual",
    name: "rust sweater",
    category: "top",
    colors: ["rust"],
    colorTemperature: "warm",
    seasonFit: ["autumn"],
    formality: "casual",
  });

  assert.deepEqual(listWardrobeItems("user-1").map((item) => item.name), ["gray trousers"]);
});

test("corrections update labels and mark item as user-corrected", () => {
  clearWardrobeForTest();
  const item = saveWardrobeItem({
    userId: "user-1",
    source: "scan",
    name: "dark shirt",
    category: "top",
    colors: ["black"],
    colorTemperature: "cool",
    seasonFit: ["winter"],
    formality: "casual",
  });

  const corrected = applyWardrobeCorrection(item.id, {
    category: "jacket",
    colors: ["charcoal"],
  });

  assert.equal(corrected?.category, "jacket");
  assert.deepEqual(corrected?.colors, ["charcoal"]);
  assert.equal(corrected?.correctedByUser, true);
});
