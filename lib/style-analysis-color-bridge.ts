import {
  scoreColorSeasonCandidates,
  type ScoringTraits,
  type ScoringTextEvidence,
} from "./color-season-scoring.ts";

const WARM_KEYWORDS = [
  "warm", "golden", "gold", "peach", "peachy", "olive", "amber",
  "hazel", "chocolate", "chestnut", "auburn", "copper", "bronze", "camel",
];

const COOL_KEYWORDS = [
  "cool", "pink", "rosy", "ash", "ashy", "silver", "gray", "grey",
  "blue", "icy", "porcelain", "blue-black", "jewel",
];

function deriveUndertone(
  skinToneDesc: string,
  hairColorDesc: string,
  eyeColorDesc: string,
): "warm" | "cool" | "neutral" {
  const text = `${skinToneDesc} ${hairColorDesc} ${eyeColorDesc}`.toLowerCase();
  const warmCount = WARM_KEYWORDS.filter((w) => text.includes(w)).length;
  const coolCount = COOL_KEYWORDS.filter((w) => text.includes(w)).length;
  if (warmCount > coolCount + 1) return "warm";
  if (coolCount > warmCount + 1) return "cool";
  return "neutral";
}

function deriveDepth(skinBrightness: number): "light" | "medium" | "deep" {
  if (skinBrightness > 62) return "light";
  if (skinBrightness > 36) return "medium";
  return "deep";
}

function deriveChroma(
  contrastScore: number,
  eyeIntensity: number,
): "muted" | "balanced" | "clear" {
  if (contrastScore > 65 && eyeIntensity >= 65) return "clear";
  if (contrastScore < 35 && eyeIntensity < 50) return "muted";
  return "balanced";
}

function deriveContrast(
  contrastScore: number,
): "low" | "medium" | "high" {
  if (contrastScore >= 62) return "high";
  if (contrastScore >= 35) return "medium";
  return "low";
}

export type ColorBridgeResult = {
  season: string;        // e.g. "True Winter"
  confidence: number;    // 0–1
  locked: boolean;       // true when confidence ≥ 0.70
  derivedUndertone: "warm" | "cool" | "neutral";
};

export function deriveColorSeason(
  faceFeatures: {
    hairDarkness: number;
    skinBrightness: number;
    eyeIntensity: number;
    hairColorDesc: string;
    skinToneDesc: string;
    eyeColorDesc: string;
  },
  computedScores: {
    contrastScore: number;
    contrastLevel: string;
  },
): ColorBridgeResult {
  const derivedUndertone = deriveUndertone(
    faceFeatures.skinToneDesc,
    faceFeatures.hairColorDesc,
    faceFeatures.eyeColorDesc,
  );

  const traits: ScoringTraits = {
    undertone: derivedUndertone,
    depth: deriveDepth(faceFeatures.skinBrightness),
    contrast: deriveContrast(computedScores.contrastScore),
    chroma: deriveChroma(computedScores.contrastScore, faceFeatures.eyeIntensity),
  };

  const evidence: ScoringTextEvidence = {
    skin: faceFeatures.skinToneDesc,
    hair: faceFeatures.hairColorDesc,
    eyes: faceFeatures.eyeColorDesc,
    undertone: derivedUndertone,
    contrast: computedScores.contrastLevel,
    depth: traits.depth,
    chroma: traits.chroma,
  };

  const candidates = scoreColorSeasonCandidates({ traits, evidence });
  const top = candidates[0];
  const confidence = Math.min(top.likelihood / 99, 1);

  return {
    season: top.subSeason,
    confidence,
    locked: confidence >= 0.70,
    derivedUndertone,
  };
}
