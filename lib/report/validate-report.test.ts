import assert from "node:assert/strict";
import test from "node:test";
import type { AnalysisResult } from "./report-schema.ts";
import { validateGeneratedReport } from "./validate-report.ts";

function makeColor(hexIndex: number) {
  return {
    hex: `#${String(hexIndex).padStart(6, "0")}`,
    name: `Warm shade ${hexIndex}`,
    isBest: hexIndex < 8,
    explanation: "Works with the user's confirmed warmth and depth.",
  };
}

function makeMaleAnalysis(): AnalysisResult {
  return {
    miniResult: {
      seasonName: "Dark Autumn",
      tagline: "Warm / deep / grounded",
      headline: "You are a Dark Autumn",
      summary: "A warm, deep palette suits this face.",
      imagePrompt: "",
      imageUrl: null,
    },
    fullReport: {
      contrast: {
        level: "medium-high",
        explanation: "The face has clear definition without extreme contrast.",
      },
      colorAnalysis: {
        topSeason: {
          id: "dark-autumn",
          name: "Dark Autumn",
          percentage: 91,
          reason: "Warm, deep and muted traits point to Dark Autumn.",
        },
        alternativeSeasons: [],
        bestColors: Array.from({ length: 20 }, (_, i) => makeColor(i + 1)),
        avoidColors: Array.from({ length: 6 }, (_, i) => ({
          hex: `#${String(i + 80).padStart(6, "0")}`,
          name: `Cool avoid ${i + 1}`,
          explanation: "Too cool for the confirmed warmth.",
        })),
        neutralDrapingPrompt: null,
      },
      makeupComparisons: [],
      hairOptions: [
        {
          name: "Natural dark brown",
          color: "Natural dark brown",
          style: "Short textured cut",
          description: "The cut keeps the face open and avoids extra width.",
          imagePrompt: "",
        },
        {
          name: "Warm espresso",
          color: "Warm espresso",
          style: "Medium crop with soft volume",
          description: "The shape adds height without making the sides bulky.",
          imagePrompt: "",
        },
      ],
      finalLook: {
        description: "The final look keeps the face central.",
        outfit: null,
        jewelry: null,
        imagePrompt: "",
      },
      colorDiagnostics: {
        families: [
          { id: "warm", comment: "Warmth is the strongest direction.", isWinner: true },
          { id: "deep", comment: "Depth suits the face.", isWinner: true },
          { id: "cool", comment: "Coolness drains the skin.", isWinner: false },
        ],
        neutrals: Array.from({ length: 8 }, (_, i) => ({
          hex: `#${String(i + 120).padStart(6, "0")}`,
          name: `Neutral ${i + 1}`,
          comment: "A practical wardrobe neutral.",
          verdict: i < 3 ? "best" : i < 6 ? "okay" : "avoid",
        })),
        makeup: null,
      },
      glasses: {
        bestShapes: ["rounded square", "soft rectangle", "keyhole bridge"],
        frameThickness: "medium",
        frameColors: "warm tortoise and dark brown",
        material: "acetate or brushed metal",
        avoid: "thin icy silver frames",
        cards: [
          { shape: "Rounded square", why: "Adds structure without harshness.", colors: "warm tortoise", avoid: "oversized black" },
          { shape: "Soft rectangle", why: "Keeps the face clean and balanced.", colors: "dark brown", avoid: "rimless" },
          { shape: "Keyhole bridge", why: "Adds lift around the centre of the face.", colors: "warm bronze", avoid: "cool grey" },
        ],
      },
      faceArchetype: {
        primary: "Classic Natural",
        tagline: "Your face reads balanced with grounded structure.",
        reason: "The confirmed geometry points to clean, natural structure.",
        facialFeatures: ["defined jaw", "medium feature scale", "balanced face shape", "grounded contrast"],
        secondaryInfluences: [{ name: "Classic", percentage: 72 }],
        stylingNotes: {
          hair: "Keep hair clean and structured, with natural texture.",
          glasses: "Medium frames work better than tiny wire shapes.",
          accessories: "Choose simple, weighty materials.",
          makeup: "Short boxed beard with clean edges keeps the lower face defined.",
          outfits: "Structured casual layers suit the face.",
        },
      },
      signatureSummary: {
        colors: "warm deep neutrals",
        neutral: "walnut",
        makeup: "short boxed beard, clean skin prep",
        hair: "natural dark brown, textured crop",
        glasses: "warm tortoise frames",
        archetype: "Classic Natural",
        aesthetic: "Grounded polish",
        summary: "The full direction is clean, warm and structured.",
      },
      grooming: {
        beardShape: "Short boxed beard with clean-defined edges",
        beardShapeWhy: "The defined jaw can carry a short boxed beard without adding unnecessary bulk.",
        beardColor: "Keep your natural dark brown",
        beardColorHex: "#3A2418",
        beardColorWhy: "The natural brown keeps warmth near the face and supports the confirmed season.",
        skinNote: "Use a gentle cleanser, light moisturiser and SPF so the skin stays even without looking treated.",
        options: [
          { style: "Short boxed beard", why: "Best match for the confirmed jaw definition.", verdict: "best" },
          { style: "Light stubble", why: "Works when you want less structure.", verdict: "okay" },
          { style: "Full beard", why: "Adds too much width for this balance.", verdict: "avoid" },
        ],
      },
      metals: null,
    },
  };
}

test("male report passes when cosmetics are absent and beard grooming is present", () => {
  const validation = validateGeneratedReport(makeMaleAnalysis(), { wardrobeType: "man" });

  assert.equal(validation.valid, true);
  assert.deepEqual(validation.critical, []);
});

test("male report fails when cosmetics leak in or beard grooming is missing", () => {
  const bad = structuredClone(makeMaleAnalysis()) as AnalysisResult;
  bad.fullReport.makeupComparisons = [
    {
      category: "blush",
      categoryLabel: "Blush",
      goodShade: { hex: "#C47A62", name: "Warm Peach", imagePrompt: "" },
      badShade: { hex: "#D8A0B8", name: "Cool Pink", imagePrompt: "" },
      explanation: "This should not appear in a male report.",
    },
  ];
  bad.fullReport.colorDiagnostics!.makeup = {
    blush: [{ hex: "#C47A62", name: "Warm Peach", explanation: "Cosmetic leak." }],
    lips: [],
    eyeshadowDay: [],
    eyeshadowEvening: [],
  };
  bad.fullReport.grooming = null;
  bad.fullReport.faceArchetype!.stylingNotes.makeup = "Peach blush and soft lipstick.";
  bad.fullReport.signatureSummary!.makeup = "bronzer and nude lip";

  const validation = validateGeneratedReport(bad, { wardrobeType: "man" });

  assert.equal(validation.valid, false);
  assert.match(validation.critical.join("\n"), /makeupComparisons/);
  assert.match(validation.critical.join("\n"), /colorDiagnostics\.makeup/);
  assert.match(validation.critical.join("\n"), /grooming section is required/);
  assert.match(validation.critical.join("\n"), /cosmetic language/);
});
