import { z } from "zod";

export const REPORT_SECTION_VALUES = ["colors", "hair", "makeup", "glasses", "outfits"] as const;
export type ReportSection = typeof REPORT_SECTION_VALUES[number];

export const QuizAnswersSchema = z.object({
  occasion:       z.enum(["everyday", "work", "events", "everything"]).nullish(),
  styleConcern:   z.enum(["buy-wrong", "cant-combine", "want-refresh", "understand-colors"]).nullish(),
  reportSections: z.array(z.enum(REPORT_SECTION_VALUES)).nullish(),
});

export const SEASON_SUGGESTION_VALUES = [
  "Light Spring", "True Spring", "Bright Spring",
  "Light Summer", "True Summer", "Soft Summer",
  "Soft Autumn", "True Autumn", "Dark Autumn",
  "Dark Winter", "True Winter", "Bright Winter",
] as const;

export const ExtractionSchema = z.object({
  undertone: z.enum(["warm", "cool", "neutral"]),
  depth: z.enum(["light", "medium", "deep"]),
  contrast: z.enum(["low", "medium-low", "medium", "medium-high", "high"]),
  chroma: z.enum(["muted", "balanced", "clear"]),
  hairColor: z.string(),
  eyeColor: z.string(),
  skinDescription: z.string(),
  photoQuality: z.enum(["usable", "borderline", "unusable"]),
  qualityNote: z.string().nullish(),
  seasonSuggestion: z.enum(SEASON_SUGGESTION_VALUES).nullish(),
  seasonSuggestionConfidence: z.enum(["strong", "moderate", "uncertain"]).nullish(),
  faceShape: z.enum(["oval", "round", "square", "heart", "oblong", "diamond", "triangle"]).nullish(),
  foreheadWidth: z.enum(["narrow", "medium", "wide"]).nullish(),
  jawLine: z.enum(["soft", "defined", "angular"]).nullish(),
  chinShape: z.enum(["pointed", "round", "square"]).nullish(),
  featureScale: z.enum(["delicate", "medium", "bold"]).nullish(),
  hairTexture: z.enum(["fine", "medium", "thick"]).nullish(),
  hairWave: z.enum(["straight", "wavy", "curly", "coily"]).nullish(),
  eyeShape: z.enum(["almond", "round", "hooded", "monolid"]).nullish(),
  eyeSet: z.enum(["wide-set", "average", "close-set"]).nullish(),
  lipFullness: z.enum(["thin", "medium", "full"]).nullish(),
});
export type Traits = z.infer<typeof ExtractionSchema>;

// Round-tripped verbatim from scoreColorSeasonCandidates()'s ScoredSeasonCandidate shape
// (lib/analysis/color-season-scoring.ts) so /api/report/full can rebuild the exact same
// confirmedSeason object the mini phase already computed, without re-scoring.
export const ScoredSeasonSchema = z.object({
  subSeason: z.string(),
  seasonId: z.string(),
  likelihood: z.number(),
  reason: z.string(),
});
export type ScoredSeason = z.infer<typeof ScoredSeasonSchema>;

export function buildSeasonId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function normalizeContrastForScoring(c: string): "low" | "medium" | "high" {
  if (c === "low" || c === "medium-low") return "low";
  if (c === "medium" || c === "medium-high") return "medium";
  return "high";
}
