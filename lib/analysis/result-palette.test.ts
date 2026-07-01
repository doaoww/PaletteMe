import assert from "node:assert/strict";
import test from "node:test";
import type { Season } from "@/lib/shared/landing-data";
import type { ColorIntelligenceReport } from "./color-intelligence.ts";
import {
  buildMakeupColumnsFromSeasonPalette,
  buildSeasonAvoidSwatches,
  buildSeasonMetalSwatches,
  buildSeasonNeutralSwatches,
  buildSeasonPaletteSwatches,
} from "./result-palette.ts";

const winter: Season = {
  id: "winter",
  name: "Winter",
  bg: "",
  color: "",
  cbg: "",
  cac: "",
  palette: ["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8"],
  paletteNames: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
  temps: ["cool", "deep", "clear"],
  lead: "",
  why: "",
  photoBg: "",
};

const summer: Season = {
  id: "summer",
  name: "Summer",
  bg: "",
  color: "",
  cbg: "",
  cac: "",
  palette: ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"],
  paletteNames: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"],
  temps: ["cool", "light", "soft"],
  lead: "",
  why: "",
  photoBg: "",
};

const autumn: Season = {
  id: "autumn",
  name: "Autumn",
  bg: "",
  color: "",
  cbg: "",
  cac: "",
  palette: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"],
  paletteNames: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"],
  temps: ["warm", "deep", "rich"],
  lead: "",
  why: "",
  photoBg: "",
};

const spring: Season = {
  id: "spring",
  name: "Spring",
  bg: "",
  color: "",
  cbg: "",
  cac: "",
  palette: ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"],
  paletteNames: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"],
  temps: ["warm", "light", "clear"],
  lead: "",
  why: "",
  photoBg: "",
};

const report: ColorIntelligenceReport = {
  subSeason: "Bright Winter",
  bestColors: [],
  avoidColors: [],
  neutralColors: [
    { name: "Cool black", hex: "w5", reason: "" },
    { name: "Icy white", hex: "w4", reason: "" },
  ],
  accentColors: [],
  makeup: {
    blush: ["cool rose"],
    lips: ["berry"],
    eyes: ["charcoal"],
  },
  jewelry: {
    metals: ["silver", "platinum"],
    guidance: "",
  },
  hair: { colors: [], guidance: "" },
  shoppingRules: [],
  contrastRule: "",
  featureSummary: "",
  scannerBestColors: [],
};

test("uses the actual season palette for look-for and complete-palette swatches", () => {
  assert.deepEqual(
    buildSeasonPaletteSwatches(winter).map((swatch) => swatch.hex),
    winter.palette
  );
  assert.deepEqual(
    buildSeasonPaletteSwatches(winter).map((swatch) => swatch.name),
    winter.paletteNames
  );
});

test("derives skip colors from opposite-temperature season palettes", () => {
  const avoidForWinter = buildSeasonAvoidSwatches(winter, [winter, summer, autumn, spring], 5);

  assert.deepEqual(
    avoidForWinter.map((swatch) => swatch.hex),
    ["a1", "a2", "a3", "a4", "a5"]
  );
  assert.ok(avoidForWinter.every((swatch) => swatch.muted));
});

test("uses report labels but season palette colors for metals, neutrals, and makeup", () => {
  assert.deepEqual(buildSeasonMetalSwatches(winter, report), [
    {
      name: "silver",
      hex: "#C0C0C0",
      gradient: "linear-gradient(135deg, #E8E8E8, #C0C0C0, #A8A8A8, #D0D0D0)",
    },
    {
      name: "platinum",
      hex: "#E5E4E2",
      gradient: "linear-gradient(135deg, #F0F0F0, #E5E4E2, #D0D0D0, #ECECEC)",
    },
  ]);
  assert.deepEqual(buildSeasonNeutralSwatches(winter, report), [
    { name: "Cool black", hex: "w5" },
    { name: "Icy white", hex: "w4" },
  ]);
  assert.deepEqual(buildMakeupColumnsFromSeasonPalette(winter, report), {
    LIPS: [{ name: "berry", hex: "w1" }],
    CHEEK: [{ name: "cool rose", hex: "w2" }],
    EYES: [{ name: "charcoal", hex: "w3" }],
    BASE: [{ name: "Bright Winter base", hex: "w4" }],
  });
});
