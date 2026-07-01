import assert from "node:assert/strict";
import test from "node:test";
import { buildImageSlots } from "./image-slots.ts";

function makeReport() {
  return {
    contrast: null,
    colorAnalysis: {
      topSeason: {
        id: "dark-autumn",
        name: "Dark Autumn",
        percentage: 94,
        reason: "Warm deep muted traits.",
      },
      alternativeSeasons: [],
      bestColors: [{ hex: "#6B4A2B", name: "Walnut", isBest: true }],
      neutralDrapingPrompt: "ignored — image-slots builds its own draping prompt",
    },
    makeupComparisons: [
      {
        category: "lips" as const,
        categoryLabel: "Lip colour",
        goodShade: { hex: "#8A4B32", name: "Warm Rosewood", imagePrompt: "ignored" },
        badShade:  { hex: "#C94B8C", name: "Cool Fuchsia",  imagePrompt: "ignored" },
        explanation: "Warm rosewood is more harmonious.",
      },
    ],
    hairOptions: [
      {
        name: "Warm chestnut, soft layers",
        color: "Warm chestnut",
        style: "soft layers",
        description: "Keeps warmth and softness.",
        imagePrompt: "ignored",
      },
    ],
    finalLook: {
      description: "A complete warm muted look.",
      outfit: null,
      jewelry: "gold",
      imagePrompt: "ignored",
    },
    colorDiagnostics: null,
    glasses: null,
    faceArchetype: null,
    signatureSummary: null,
    grooming: {
      beardShape: "Short boxed beard with clean-defined edges",
      beardShapeWhy: "Adds structure to the lower face.",
      beardColor: "Keep natural dark brown",
      beardColorHex: "#3A2418",
      beardColorWhy: "Works with the user's natural depth.",
      skinNote: "Keep grooming simple and clean.",
      options: [
        { style: "Short boxed beard", why: "Best definition.", verdict: "best" as const },
        { style: "Light stubble", why: "Still works.", verdict: "okay" as const },
        { style: "Full beard", why: "Too much width.", verdict: "avoid" as const },
      ],
    },
  };
}

test("neutral draping prompt describes the desired visual output", () => {
  const slots = buildImageSlots(makeReport());
  const byId = new Map(slots.map(s => [s.slotId, s.prompt]));

  const draping = byId.get("neutral-draping") ?? "";
  assert.match(draping, /same person/i);
  assert.match(draping, /white draping cloth/i);
  assert.match(draping, /grey/i);
});

test("makeup prompts inject shade name and hex for the correct region", () => {
  const slots = buildImageSlots(makeReport());
  const byId = new Map(slots.map(s => [s.slotId, s.prompt]));

  const goodLips = byId.get("makeup-lips-good") ?? "";
  assert.match(goodLips, /Warm Rosewood/);
  assert.match(goodLips, /#8A4B32/);
  assert.match(goodLips, /lipstick applied to the lips/i);

  const badLips = byId.get("makeup-lips-bad") ?? "";
  assert.match(badLips, /Cool Fuchsia/);
  assert.match(badLips, /#C94B8C/);
});

test("hair slots target colour and style separately", () => {
  const slots = buildImageSlots(makeReport());
  const byId = new Map(slots.map(s => [s.slotId, s.prompt]));

  assert.match(byId.get("hair-color-0") ?? "", /Warm chestnut/);
  assert.match(byId.get("hair-style-0") ?? "", /soft layers/);
});

test("male image slots use beard grooming and skip makeup try-ons", () => {
  const slots = buildImageSlots(makeReport(), "man");
  const ids = slots.map((slot) => slot.slotId);

  assert.equal(ids.some((id) => id.startsWith("makeup-")), false);
  assert.deepEqual(
    ids.filter((id) => id.startsWith("beard-")),
    ["beard-0", "beard-1", "beard-2"],
  );
});

test("prompts are plain visual descriptions — no LLM editing instructions", () => {
  const slots = buildImageSlots(makeReport());
  for (const slot of slots) {
    assert.doesNotMatch(slot.prompt, /Edit the uploaded original photo/i);
    assert.doesNotMatch(slot.prompt, /Do not create a new person/i);
    assert.doesNotMatch(slot.prompt, /Apply only the requested styling change/i);
  }
});
