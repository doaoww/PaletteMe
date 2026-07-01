import assert from "node:assert/strict";
import test from "node:test";
import {
  ANALYSIS_STORAGE_KEY,
  clearAnalysisResult,
  loadAnalysisResult,
  saveAnalysisResult,
} from "./analysis-storage.ts";

function memoryStorage(initial?: string) {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(ANALYSIS_STORAGE_KEY, initial);
  return {
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    },
  };
}

const result = {
  seasonId: "summer",
  subSeason: "Soft Summer",
  traits: { undertone: "cool", contrast: "low", depth: "medium", chroma: "muted" },
  confidence: 88,
  summary: "Muted cool coloring with low contrast.",
  tips: ["wear soft rose"],
  features: { skin: "cool rosy", hair: "ash brown", eyes: "soft blue grey" },
  report: {
    subSeason: "Soft Summer",
    bestColors: [],
    avoidColors: [],
    neutralColors: [],
    accentColors: [],
    makeup: { blush: [], lips: [], eyes: [] },
    jewelry: { metals: [], guidance: "" },
    hair: { colors: [], guidance: "" },
    shoppingRules: [],
    contrastRule: "",
    featureSummary: "",
    scannerBestColors: [],
  },
};

test("saves and loads JSON analysis result", () => {
  const storage = memoryStorage();
  saveAnalysisResult(result, storage);
  assert.equal(typeof storage.getItem(ANALYSIS_STORAGE_KEY), "string");
  assert.deepEqual(loadAnalysisResult(storage), result);
});

test("invalid JSON returns null", () => {
  assert.equal(loadAnalysisResult(memoryStorage("{not-json")), null);
});

test("invalid shape returns null", () => {
  assert.equal(loadAnalysisResult(memoryStorage(JSON.stringify({ seasonId: "summer" }))), null);
});

test("clear removes the stored analysis result", () => {
  const storage = memoryStorage(JSON.stringify(result));
  clearAnalysisResult(storage);
  assert.equal(storage.getItem(ANALYSIS_STORAGE_KEY), null);
});
