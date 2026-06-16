import { SEASONS, type Season } from "./landing-data.ts";
import {
  buildColorIntelligenceReport,
  type ColorIntelligenceReport,
  type ColorTraits,
  type FeatureNotes,
} from "./color-intelligence.ts";
import { scoreColorSeasonCandidates, type ScoredSeasonCandidate } from "./color-season-scoring.ts";

export type SeasonId = "spring" | "summer" | "autumn" | "winter";

export type AnalysisTraits = ColorTraits;

export type AnalysisQualityIssue =
  | "no_human_face"
  | "multiple_faces"
  | "poor_lighting"
  | "blurry"
  | "suboptimal_conditions"
  | "heavy_filter"
  | "strong_color_cast"
  | "covered_face"
  | "face_too_small"
  | "low_confidence";

export type AnalysisPhotoQuality = {
  lighting?: "good" | "mixed" | "poor";
  faceVisible?: boolean;
  naturalLight?: boolean;
  heavyFilter?: boolean;
  strongColorCast?: boolean;
  blurry?: boolean;
  qualityScore?: number;
  imageUsability?: "usable" | "borderline" | "unusable";
  issues?: AnalysisQualityIssue[] | string[];
  recommendation?: string;
};

export type SeasonCandidate = {
  seasonId: SeasonId;
  seasonName: string;
  subSeason: string;
  likelihood: number;
  reason: string;
};

export type RawSeasonCandidate = {
  season: string;
  subSeason?: string;
  likelihood?: number;
  reason?: string;
};

export type AnalysisEvidence = {
  undertone: string;
  contrast: string;
  depth: string;
  chroma: string;
};

export type RawAnalysis = {
  hasHumanFace?: boolean;
  faceCount?: number;
  photoQuality?: AnalysisPhotoQuality;
  season: string;
  subSeason: string;
  undertone: string;
  contrast: string;
  depth: string;
  chroma?: string;
  features?: Partial<FeatureNotes>;
  evidence?: Partial<AnalysisEvidence>;
  alternatives?: RawSeasonCandidate[];
  confidence: number;
  summary: string;
  tips: string[];
};

export type AnalysisQuality = {
  hasHumanFace: boolean;
  faceCount: number;
  lighting: "good" | "mixed" | "poor";
  faceVisible: boolean;
  naturalLight: boolean;
  heavyFilter: boolean;
  strongColorCast: boolean;
  blurry: boolean;
  qualityScore: number;
  imageUsability: "usable" | "borderline" | "unusable";
  issues: string[];
  recommendation: string;
};

export type AnalysisQualityWarning = {
  message: string;
  qualityScore: number;
  issues: string[];
};

export type AnalysisResult = {
  seasonId: SeasonId;
  subSeason: string;
  traits: AnalysisTraits;
  features: FeatureNotes;
  evidence: AnalysisEvidence;
  quality: AnalysisQuality;
  alternatives: SeasonCandidate[];
  report: ColorIntelligenceReport;
  confidence: number;
  accuracyNote: string;
  qualityWarning?: AnalysisQualityWarning;
  summary: string;
  tips: string[];
  season: Season;
  needsRetake: false;
};

export type AnalysisRetakeCode = "no_face" | "bad_photo" | "low_confidence";

export class AnalysisRetakeError extends Error {
  code: AnalysisRetakeCode;
  issues: string[];
  userMessage: string;

  constructor(code: AnalysisRetakeCode, userMessage: string, issues: string[] = []) {
    super(code);
    this.name = "AnalysisRetakeError";
    this.code = code;
    this.userMessage = userMessage;
    this.issues = issues;
  }
}

const SEASON_IDS = new Set<string>(["spring", "summer", "autumn", "winter"]);
export const FACE_PHOTO_REQUIRED_MESSAGE =
  "We need a solo photo of your face to analyze your colors. Please try again.";
export const SOFT_PHOTO_QUALITY_MESSAGE =
  "For best results, try in natural daylight — but you can continue with this photo";

export function normalizeRawAnalysisResult(raw: RawAnalysis): AnalysisResult {
  if (
    typeof raw.hasHumanFace !== "boolean" ||
    typeof raw.faceCount !== "number" ||
    !raw.photoQuality
  ) {
    throw new AnalysisRetakeError(
      "low_confidence",
      "The photo quality check did not complete, so I will not guess your season. Please upload a clear selfie in natural daylight.",
      ["missing_quality_gate"]
    );
  }

  const quality = normalizeQuality(raw);

  if (!quality.hasHumanFace || quality.faceCount !== 1 || !quality.faceVisible) {
    throw new AnalysisRetakeError(
      "no_face",
      FACE_PHOTO_REQUIRED_MESSAGE,
      quality.issues
    );
  }

  const confidence = clamp(Math.round(raw.confidence ?? 0), 0, 100);
  const qualityWarning = buildQualityWarning(quality);

  const traits: AnalysisTraits = {
    undertone: normalizeTrait(raw.undertone, ["warm", "cool", "neutral"], "neutral"),
    contrast: normalizeTrait(raw.contrast, ["low", "medium", "high"], "medium"),
    depth: normalizeTrait(raw.depth, ["light", "medium", "deep"], "medium"),
    chroma: normalizeTrait(raw.chroma ?? "", ["muted", "balanced", "clear"], "balanced"),
  };
  const features = normalizeFeatureNotes(raw.features, traits);
  const evidence = normalizeEvidence(raw.evidence, features, traits);
  const scoredCandidates = scoreColorSeasonCandidates({
    traits,
    evidence: {
      ...features,
      ...evidence,
      summary: raw.summary,
    },
    modelSeason: raw.season,
    modelSubSeason: raw.subSeason,
  });
  const scoredWinner = scoredCandidates[0];
  const seasonId = (scoredWinner?.seasonId ?? normalizeSeasonId(raw.season)) as SeasonId | null;
  if (!seasonId) {
    throw new AnalysisRetakeError(
      "low_confidence",
      "I could not determine a reliable season from this photo. Retake it in natural light with your face clearly visible.",
      [...quality.issues, "unclear_season"]
    );
  }

  const season = SEASONS.find((s) => s.id === seasonId) ?? SEASONS[0];
  const subSeason = scoredWinner?.subSeason ?? (titleCase(raw.subSeason) || season.name);
  const report = buildColorIntelligenceReport({
    season,
    subSeason,
    traits,
    featureNotes: features,
  });
  const alternatives = normalizeAlternatives(raw.alternatives, seasonId, scoredCandidates);

  return {
    seasonId,
    subSeason,
    traits,
    features,
    evidence,
    quality,
    alternatives,
    report,
    confidence,
    accuracyNote: buildAccuracyNote(confidence, quality, alternatives),
    ...(qualityWarning ? { qualityWarning } : {}),
    summary: raw.summary || season.why,
    tips: Array.isArray(raw.tips) ? raw.tips.slice(0, 3) : [],
    season,
    needsRetake: false,
  };
}

function normalizeQuality(raw: RawAnalysis): AnalysisQuality {
  const photoQuality = raw.photoQuality ?? {};
  const issues = [...new Set((photoQuality.issues ?? []).map((issue) => String(issue)))];

  return {
    hasHumanFace: raw.hasHumanFace !== false,
    faceCount: Math.max(0, Math.round(raw.faceCount ?? 1)),
    lighting: normalizeTrait(photoQuality.lighting ?? "", ["good", "mixed", "poor"], "mixed"),
    faceVisible: photoQuality.faceVisible !== false,
    naturalLight: photoQuality.naturalLight !== false,
    heavyFilter: photoQuality.heavyFilter === true,
    strongColorCast: photoQuality.strongColorCast === true,
    blurry: photoQuality.blurry === true || issues.includes("blurry"),
    qualityScore: clamp(Math.round(photoQuality.qualityScore ?? raw.confidence ?? 0), 0, 100),
    imageUsability: normalizeTrait(
      photoQuality.imageUsability ?? "",
      ["usable", "borderline", "unusable"],
      "borderline"
    ),
    issues,
    recommendation: clean(photoQuality.recommendation),
  };
}

function buildQualityWarning(quality: AnalysisQuality): AnalysisQualityWarning | undefined {
  const softIssues = new Set([
    "poor_lighting",
    "blurry",
    "suboptimal_conditions",
    "heavy_filter",
    "strong_color_cast",
    "covered_face",
    "face_too_small",
    "low_confidence",
  ]);
  const shouldWarn =
    quality.qualityScore < 80 ||
    quality.lighting === "poor" ||
    quality.imageUsability !== "usable" ||
    !quality.naturalLight ||
    quality.blurry ||
    quality.heavyFilter ||
    quality.strongColorCast ||
    quality.issues.some((issue) => softIssues.has(issue));

  if (!shouldWarn) return undefined;

  return {
    message: SOFT_PHOTO_QUALITY_MESSAGE,
    qualityScore: quality.qualityScore,
    issues: quality.issues,
  };
}

function normalizeSeasonId(value: string): SeasonId | null {
  const v = value?.toLowerCase().trim();
  if (SEASON_IDS.has(v)) return v as SeasonId;
  if (v?.includes("spring")) return "spring";
  if (v?.includes("summer")) return "summer";
  if (v?.includes("autumn") || v?.includes("fall")) return "autumn";
  if (v?.includes("winter")) return "winter";
  return null;
}

function normalizeAlternatives(
  alternatives: RawSeasonCandidate[] | undefined,
  winner: SeasonId,
  scoredCandidates: ScoredSeasonCandidate[] = []
): SeasonCandidate[] {
  const parsed = (alternatives ?? [])
    .map((candidate) => {
      const seasonId = normalizeSeasonId(candidate.season);
      if (!seasonId || seasonId === winner) return null;
      const season = SEASONS.find((s) => s.id === seasonId);
      if (!season) return null;
      return {
        seasonId,
        seasonName: season.name,
        subSeason: titleCase(candidate.subSeason ?? "") || season.name,
        likelihood: clamp(Math.round(candidate.likelihood ?? 0), 0, 100),
        reason: clean(candidate.reason) || "Secondary possibility based on visible traits.",
      };
    })
    .filter((candidate): candidate is SeasonCandidate => Boolean(candidate));

  if (parsed.length > 0) return parsed.slice(0, 3);

  const scored = scoredCandidates
    .filter((candidate) => candidate.seasonId !== winner)
    .slice(0, 3)
    .map((candidate) => ({
      seasonId: candidate.seasonId,
      seasonName: candidate.seasonName,
      subSeason: candidate.subSeason,
      likelihood: candidate.likelihood,
      reason: candidate.reason,
    }));

  if (scored.length > 0) return scored;

  return SEASONS.filter((season) => season.id !== winner)
    .slice(0, 3)
    .map((season, index) => ({
      seasonId: season.id as SeasonId,
      seasonName: season.name,
      subSeason: season.name,
      likelihood: Math.max(5, 30 - index * 8),
      reason: "Fallback comparison candidate; take another selfie if this feels close.",
    }));
}

function normalizeEvidence(
  evidence: Partial<AnalysisEvidence> | undefined,
  features: FeatureNotes,
  traits: AnalysisTraits
): AnalysisEvidence {
  return {
    undertone: clean(evidence?.undertone) || features.skin,
    contrast: clean(evidence?.contrast) || `${traits.contrast} contrast visible across skin, hair, and eyes`,
    depth: clean(evidence?.depth) || `${traits.depth} overall depth`,
    chroma: clean(evidence?.chroma) || `${traits.chroma} color clarity`,
  };
}

function normalizeFeatureNotes(
  features: Partial<FeatureNotes> | undefined,
  traits: AnalysisTraits
): FeatureNotes {
  return {
    skin: clean(features?.skin) || `${traits.undertone} undertone with ${traits.depth} overall depth`,
    hair: clean(features?.hair) || `${traits.depth} hair depth evidence was considered`,
    eyes: clean(features?.eyes) || `${traits.contrast} contrast and ${traits.chroma} clarity evidence was considered`,
  };
}

function buildAccuracyNote(
  confidence: number,
  quality: AnalysisQuality,
  alternatives: SeasonCandidate[]
): string {
  const qualityNote =
    quality.imageUsability === "usable"
      ? `photo quality was usable (${quality.qualityScore}%)`
      : `photo quality was borderline (${quality.qualityScore}%)`;
  const alternativeNote = alternatives[0]
    ? `Closest alternative: ${alternatives[0].subSeason}.`
    : "No close alternative was provided.";
  return `${confidence}% confidence; ${qualityNote}. ${alternativeNote}`;
}

function titleCase(value: string): string {
  return value?.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) ?? "";
}

function normalizeTrait<T extends string>(value: string, allowed: T[], fallback: T): T {
  const v = value?.toLowerCase().trim();
  return (allowed.find((item) => item === v) ?? fallback) as T;
}

function clean(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
