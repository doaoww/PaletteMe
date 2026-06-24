import { test } from "node:test";
import assert from "node:assert/strict";
import { LookLabSchema } from "../lib/look-lab-schema.ts";

test("LookLabSchema accepts valid lookLab data", () => {
  const valid = {
    colorSeason: {
      best: { season: "Soft Summer", confidence: 99, drapingHex: "#B8C4D4", explanation: "Ashy pigment lifts your skin tone" },
      alternatives: [
        { season: "True Summer", confidence: 68, drapingHex: "#9BA8C0", explanation: "Slightly warmer than your ideal" }
      ]
    },
    metals: {
      gold: { score: 87, explanation: "Warm skin pigment amplifies gold naturally" },
      silver: { score: 41, explanation: "Cool reflection dulls your complexion" }
    },
    contrast: { level: "high", explanation: "High contrast — soft makeup disappears on you. Go bold or go home." },
    blush: [{ name: "Peach", hex: "#FFAD8B", verdict: "best", explanation: "Lifts warmth from your skin" }],
    lips: [{ name: "Nude rose", hex: "#C68B8B", verdict: "best", explanation: "Enhances without overpowering" }],
    eyeshadow: [{ name: "Bronze", hex: "#8B6914", verdict: "best", explanation: "Deepens eye colour naturally" }],
    hairColor: [{ name: "Ashy blonde", hex: "#C8B89A", verdict: "best", explanation: "Cool ash balances your undertone" }],
    hairstyles: [{ name: "Lob", description: "Collarbone-length, soft ends", faceShapeReason: "Balances a longer face", verdict: "best" }]
  };
  const result = LookLabSchema.safeParse(valid);
  assert.equal(result.success, true);
});

test("LookLabSchema rejects invalid verdict", () => {
  const invalid = {
    colorSeason: { best: { season: "Soft Summer", confidence: 99, drapingHex: "#B8C4D4", explanation: "x" }, alternatives: [] },
    metals: { gold: { score: 87, explanation: "x" }, silver: { score: 41, explanation: "x" } },
    contrast: { level: "extreme", explanation: "x" },
    blush: [{ name: "Peach", hex: "#FFAD8B", verdict: "wrong", explanation: "x" }],
    lips: [], eyeshadow: [], hairColor: [], hairstyles: []
  };
  const result = LookLabSchema.safeParse(invalid);
  assert.equal(result.success, false);
});
