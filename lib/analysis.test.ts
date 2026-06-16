import assert from "node:assert/strict";
import test from "node:test";
import {
  AnalysisRetakeError,
  normalizeRawAnalysisResult,
  type RawAnalysis,
} from "./analysis-normalizer.ts";
import { getConfiguredColorAnalysisModel } from "./analysis.ts";

const validRaw: RawAnalysis = {
  hasHumanFace: true,
  faceCount: 1,
  photoQuality: {
    lighting: "good",
    faceVisible: true,
    naturalLight: true,
    heavyFilter: false,
    strongColorCast: false,
    blurry: false,
    qualityScore: 92,
    imageUsability: "usable",
    issues: [],
    recommendation: "Photo is usable for seasonal color analysis.",
  },
  season: "spring",
  subSeason: "True Spring",
  undertone: "warm",
  contrast: "medium",
  depth: "medium",
  chroma: "clear",
  features: {
    skin: "warm peach-gold skin evidence",
    hair: "medium golden brown hair",
    eyes: "clear green-hazel eyes",
  },
  evidence: {
    undertone: "golden cast around cheeks and neck",
    contrast: "medium contrast between skin and hair",
    depth: "medium overall depth",
    chroma: "clear rather than muted features",
  },
  alternatives: [
    { season: "autumn", subSeason: "True Autumn", likelihood: 24, reason: "also warm, but appears more muted" },
    { season: "summer", subSeason: "Light Summer", likelihood: 10, reason: "lighter coloring, but undertone is not cool enough" },
  ],
  confidence: 88,
  summary: "Warm, clear, medium-depth features point to True Spring.",
  tips: ["wear coral near the face", "avoid icy gray", "choose clear warm accents"],
};

test("rejects non-human uploads instead of inventing a season", () => {
  assert.throws(
    () =>
      normalizeRawAnalysisResult({
        ...validRaw,
        hasHumanFace: false,
        faceCount: 0,
        photoQuality: {
          ...validRaw.photoQuality,
          faceVisible: false,
          imageUsability: "unusable",
          issues: ["no_human_face"],
        },
      }),
    (error) => {
      assert.ok(error instanceof AnalysisRetakeError);
      assert.equal(error.code, "no_face");
      assert.equal(
        error.userMessage,
        "We need a solo photo of your face to analyze your colors. Please try again."
      );
      return true;
    }
  );
});

test("hard rejects photos with more than one face", () => {
  assert.throws(
    () =>
      normalizeRawAnalysisResult({
        ...validRaw,
        faceCount: 2,
        photoQuality: {
          ...validRaw.photoQuality,
          issues: ["multiple_faces"],
        },
      }),
    (error) => {
      assert.ok(error instanceof AnalysisRetakeError);
      assert.equal(error.code, "no_face");
      assert.equal(
        error.userMessage,
        "We need a solo photo of your face to analyze your colors. Please try again."
      );
      return true;
    }
  );
});

test("color analysis model uses the color override before style fallback", () => {
  assert.equal(
    getConfiguredColorAnalysisModel({
      OPENAI_COLOR_ANALYSIS_MODEL: " gpt-color ",
      OPENAI_STYLE_MODEL: "gpt-style",
    }),
    "gpt-color"
  );
  assert.equal(
    getConfiguredColorAnalysisModel({
      OPENAI_STYLE_MODEL: " gpt-style ",
    }),
    "gpt-style"
  );
  assert.equal(getConfiguredColorAnalysisModel({}), "gpt-5.4");
});

test("soft warns but allows a solo face photo with borderline quality", () => {
  const result = normalizeRawAnalysisResult({
    ...validRaw,
    confidence: 72,
    photoQuality: {
      ...validRaw.photoQuality,
      lighting: "poor",
      naturalLight: false,
      blurry: true,
      qualityScore: 64,
      imageUsability: "borderline",
      issues: ["poor_lighting", "blurry"],
      recommendation: "Retake in daylight with no filter.",
    },
  });

  assert.equal(result.needsRetake, false);
  assert.equal(
    result.qualityWarning?.message,
    "For best results, try in natural daylight — but you can continue with this photo"
  );
  assert.equal(result.quality.qualityScore, 64);
  assert.equal(result.quality.blurry, true);
});

test("rejects model output that skipped the photo quality gate", () => {
  const rawWithoutGate = { ...validRaw } as RawAnalysis;
  delete (rawWithoutGate as Partial<RawAnalysis>).photoQuality;
  delete (rawWithoutGate as Partial<RawAnalysis>).hasHumanFace;
  delete (rawWithoutGate as Partial<RawAnalysis>).faceCount;

  assert.throws(
    () => normalizeRawAnalysisResult(rawWithoutGate),
    (error) => {
      assert.ok(error instanceof AnalysisRetakeError);
      assert.equal(error.code, "low_confidence");
      assert.match(error.userMessage, /quality check/i);
      return true;
    }
  );
});

test("normalizes valid analysis with quality metadata and alternatives", () => {
  const result = normalizeRawAnalysisResult(validRaw);

  assert.equal(result.needsRetake, false);
  assert.equal(result.seasonId, "spring");
  assert.equal(result.subSeason, "True Spring");
  assert.equal(result.quality.hasHumanFace, true);
  assert.equal(result.quality.imageUsability, "usable");
  assert.equal(result.qualityWarning, undefined);
  assert.equal(result.evidence.undertone, "golden cast around cheeks and neck");
  assert.equal(result.alternatives.length, 2);
  assert.equal(result.alternatives[0].seasonId, "autumn");
  assert.match(result.accuracyNote, /88%/);
});

test("adds safe fallback alternatives when the model omits them", () => {
  const result = normalizeRawAnalysisResult({
    ...validRaw,
    alternatives: [],
  });

  assert.equal(result.alternatives.length, 3);
  assert.ok(result.alternatives.every((candidate) => candidate.seasonId !== result.seasonId));
});

test("corrects deep warm coloring away from True Winter toward Dark Autumn", () => {
  const result = normalizeRawAnalysisResult({
    ...validRaw,
    season: "winter",
    subSeason: "True Winter",
    undertone: "warm",
    contrast: "high",
    depth: "deep",
    chroma: "muted",
    features: {
      skin: "noticeable golden olive warmth in the skin",
      hair: "deep warm chocolate brown hair, not blue black",
      eyes: "warm brown olive eyes",
    },
    evidence: {
      undertone: "golden olive skin warmth is visible",
      contrast: "deep contrast, but smoky rather than icy sharp",
      depth: "dark hair and eyes create deep overall coloring",
      chroma: "earthy rich muted quality, not crystalline brightness",
    },
    alternatives: [
      { season: "autumn", subSeason: "Dark Autumn", likelihood: 72, reason: "warm deep earthy evidence" },
      { season: "winter", subSeason: "Dark Winter", likelihood: 61, reason: "deep contrast" },
    ],
    confidence: 86,
    summary: "The model over-selected winter from darkness, but visible warmth points to autumn.",
  });

  assert.equal(result.seasonId, "autumn");
  assert.equal(result.subSeason, "Dark Autumn");
  assert.equal(result.alternatives[0].subSeason, "Dark Winter");
});
