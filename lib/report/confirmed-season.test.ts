import assert from "node:assert/strict";
import test from "node:test";
import { applyConfirmedSeasonToReport } from "./confirmed-season.ts";

function makeReport() {
  return {
    miniResult: {
      seasonName: "True Winter",
      tagline: "Cool / Clear / Sharp",
      headline: "You are a True Winter",
      summary: "A generated summary.",
      imagePrompt: "A generated image prompt.",
    },
    fullReport: {
      contrast: null,
      colorAnalysis: {
        topSeason: {
          id: "true-winter",
          name: "True Winter",
          percentage: 92,
          reason: "The model guessed winter.",
        },
        alternativeSeasons: [],
        bestColors: [],
        neutralDrapingPrompt: null,
      },
      makeupComparisons: [],
      hairOptions: [],
      finalLook: {
        description: "Generated final look.",
        outfit: null,
        jewelry: null,
        imagePrompt: "",
      },
      colorDiagnostics: null,
      glasses: null,
      faceArchetype: null,
      signatureSummary: null,
    },
  };
}

test("forces generated report season fields to the deterministic confirmed season", () => {
  const original = makeReport();
  const confirmed = {
    topSeason: {
      id: "dark-autumn",
      name: "Dark Autumn",
      percentage: 94,
      reason: "Warm deep muted traits confirmed Dark Autumn.",
    },
    alternativeSeasons: [
      {
        id: "true-autumn",
        name: "True Autumn",
        percentage: 76,
        reason: "Still warm and muted, but less deep.",
      },
      {
        id: "dark-winter",
        name: "Dark Winter",
        percentage: 62,
        reason: "Deep contrast is present, but warmth is stronger.",
      },
    ],
  };

  const result = applyConfirmedSeasonToReport(original, confirmed);

  assert.notEqual(result, original);
  assert.equal(result.miniResult.seasonName, "Dark Autumn");
  assert.equal(result.miniResult.headline, "You are a Dark Autumn");
  assert.deepEqual(result.fullReport.colorAnalysis.topSeason, confirmed.topSeason);
  assert.deepEqual(result.fullReport.colorAnalysis.alternativeSeasons, confirmed.alternativeSeasons);
  assert.equal(original.fullReport.colorAnalysis.topSeason.name, "True Winter");
});
