import assert from "node:assert/strict";
import test from "node:test";
import { SEASONS } from "./landing-data.ts";
import {
  buildColorIntelligenceReport,
  getFreeColorPreview,
  type ColorTraits,
} from "./color-intelligence.ts";

const spring = SEASONS.find((s) => s.id === "spring")!;
const summer = SEASONS.find((s) => s.id === "summer")!;
const winter = SEASONS.find((s) => s.id === "winter")!;

test("builds warm report guidance from season and traits", () => {
  const traits: ColorTraits = {
    undertone: "warm",
    contrast: "medium",
    depth: "light",
    chroma: "clear",
  };

  const report = buildColorIntelligenceReport({
    season: spring,
    subSeason: "Light Spring",
    traits,
    featureNotes: {
      skin: "peachy golden skin",
      hair: "strawberry blonde hair",
      eyes: "clear green eyes",
    },
    context: {
      styleGoal: "capsule",
      styleVibe: "classic",
      naturalHairColor: "strawberry blonde",
    },
  });

  assert.equal(report.subSeason, "Light Spring");
  assert.equal(report.bestColors.length, 8);
  assert.deepEqual(report.bestColors.map((c) => c.hex), spring.palette);
  assert.match(report.jewelry.metals.join(" "), /gold/i);
  assert.match(report.makeup.blush.join(" "), /peach|coral/i);
  assert.match(report.hair.guidance, /strawberry blonde/i);
  assert.match(report.shoppingRules[0], /warm/i);
  assert.match(report.featureSummary, /peachy golden skin/i);
});

test("builds cool muted report guidance and avoid colors", () => {
  const report = buildColorIntelligenceReport({
    season: summer,
    subSeason: "Soft Summer",
    traits: {
      undertone: "cool",
      contrast: "low",
      depth: "medium",
      chroma: "muted",
    },
  });

  assert.match(report.jewelry.metals.join(" "), /silver|platinum/i);
  assert.match(report.makeup.lips.join(" "), /rose|mauve|berry/i);
  assert.ok(report.avoidColors.some((c) => /neon|orange|black/i.test(c.reason)));
  assert.match(report.contrastRule, /tonal|soft|blended/i);
});

test("clear high-contrast report gives crisp scanner guidance", () => {
  const report = buildColorIntelligenceReport({
    season: winter,
    subSeason: "Bright Winter",
    traits: {
      undertone: "cool",
      contrast: "high",
      depth: "deep",
      chroma: "clear",
    },
  });

  assert.match(report.contrastRule, /contrast|crisp/i);
  assert.ok(report.scannerBestColors.every((item) => item.includes("#")));
  assert.equal(report.scannerBestColors.length, winter.palette.length);
});

test("free preview exposes only the requested number of best colors", () => {
  const report = buildColorIntelligenceReport({
    season: spring,
    subSeason: "True Spring",
    traits: {
      undertone: "warm",
      contrast: "medium",
      depth: "medium",
      chroma: "clear",
    },
  });

  const preview = getFreeColorPreview(report, 4);
  assert.equal(preview.length, 4);
  assert.deepEqual(preview.map((c) => c.hex), spring.palette.slice(0, 4));
});

test("report falls back gracefully when sub-season and feature notes are missing", () => {
  const report = buildColorIntelligenceReport({
    season: summer,
    traits: {
      undertone: "neutral",
      contrast: "medium",
      depth: "medium",
      chroma: "balanced",
    },
  });

  assert.equal(report.subSeason, "Summer");
  assert.match(report.featureSummary, /medium contrast/i);
  assert.equal(report.neutralColors.length, 3);
  assert.equal(report.accentColors.length, 3);
});
