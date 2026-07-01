import { SEASONS, SUB_SEASONS } from "@/lib/shared/landing-data";

export type ScoringSeasonId = "spring" | "summer" | "autumn" | "winter";

export type ScoringTraits = {
  undertone: "warm" | "cool" | "neutral";
  contrast: "low" | "medium" | "high";
  depth: "light" | "medium" | "deep";
  chroma: "muted" | "balanced" | "clear";
};

export type ScoringTextEvidence = {
  skin?: string;
  hair?: string;
  eyes?: string;
  undertone?: string;
  contrast?: string;
  depth?: string;
  chroma?: string;
  summary?: string;
};

export type ScoredSeasonCandidate = {
  seasonId: ScoringSeasonId;
  seasonName: string;
  subSeason: string;
  likelihood: number;
  reason: string;
  score: number;
};

type ScoreInput = {
  traits: ScoringTraits;
  evidence?: ScoringTextEvidence;
  modelSeason?: string;
  modelSubSeason?: string;
  modelSeasonConfidence?: "strong" | "moderate" | "uncertain";
};

const WARM_WORDS = [
  "warm",
  "golden",
  "gold",
  "peach",
  "peachy",
  "olive",
  "yellow",
  "amber",
  "hazel",
  "chocolate",
  "chestnut",
  "auburn",
  "copper",
  "bronze",
  "camel",
  "espresso",
  "brown olive",
];

const COOL_WORDS = [
  "cool",
  "pink",
  "rosy",
  "blue",
  "blue-black",
  "ash",
  "ashy",
  "silver",
  "gray",
  "grey",
  "icy",
  "crystalline",
  "jewel",
  "black-brown",
  "porcelain",
];

const EARTHY_WORDS = [
  "earthy",
  "smoky",
  "smokey",
  "rich",
  "sultry",
  "muted",
  "softened",
  "terracotta",
  "olive",
  "camel",
  "bronze",
  "espresso",
  "burgundy",
  "deep teal",
];

const ICY_WORDS = [
  "icy",
  "sharp",
  "crisp",
  "crystalline",
  "clear",
  "jewel",
  "blue-black",
  "stark",
  "high contrast",
];

export function scoreColorSeasonCandidates(input: ScoreInput): ScoredSeasonCandidate[] {
  const text = buildEvidenceText(input.evidence);
  const warmSignals = countSignals(text, WARM_WORDS);
  const coolSignals = countSignals(text, COOL_WORDS);
  const earthySignals = countSignals(text, EARTHY_WORDS);
  const icySignals = countSignals(text, ICY_WORDS);

  return SUB_SEASONS.map((profile) => {
    let score = 0;
    score += traitScore(input.traits.undertone, profile.undertones, 36);
    score += traitScore(input.traits.depth, profile.depths, 24);
    score += traitScore(input.traits.contrast, profile.contrasts, 18);
    score += traitScore(input.traits.chroma, profile.chromas, 18);
    score += signalScore(profile.seasonId, warmSignals, coolSignals, earthySignals, icySignals);
    score += deepWarmGuard(profile.id, input.traits, warmSignals, earthySignals, coolSignals, icySignals);
    score += modelHintScore(profile.name, profile.seasonId, input.modelSeason, input.modelSubSeason, input.modelSeasonConfidence);

    const seasonName = SEASONS.find((season) => season.id === profile.seasonId)?.name ?? profile.seasonId;
    return {
      seasonId: profile.seasonId,
      seasonName,
      subSeason: profile.name,
      likelihood: clamp(Math.round(score), 0, 99),
      reason: buildReason(profile.name, input.traits, warmSignals, coolSignals, earthySignals, icySignals),
      score,
    };
  }).sort((a, b) => b.score - a.score);
}

function traitScore<T extends string>(actual: T, preferred: readonly T[], weight: number): number {
  const index = preferred.indexOf(actual);
  if (index === 0) return weight;
  if (index === 1) return weight * 0.72;
  if (index >= 2) return weight * 0.45;
  if (actual === "neutral" && (preferred.includes("warm" as T) || preferred.includes("cool" as T))) {
    return weight * 0.42;
  }
  return 0;
}

function signalScore(
  seasonId: ScoringSeasonId,
  warmSignals: number,
  coolSignals: number,
  earthySignals: number,
  icySignals: number
): number {
  if (seasonId === "autumn") {
    return Math.min(26, warmSignals * 3 + earthySignals * 4) - Math.min(18, coolSignals * 3 + icySignals * 3);
  }
  if (seasonId === "winter") {
    return Math.min(26, coolSignals * 3 + icySignals * 4) - Math.min(18, warmSignals * 3 + earthySignals * 3);
  }
  if (seasonId === "spring") {
    return Math.min(20, warmSignals * 3 + icySignals) - Math.min(12, earthySignals * 2);
  }
  return Math.min(20, coolSignals * 3 + earthySignals) - Math.min(12, warmSignals * 2);
}

function deepWarmGuard(
  profileId: string,
  traits: ScoringTraits,
  warmSignals: number,
  earthySignals: number,
  coolSignals: number,
  icySignals: number
): number {
  const deepWarm =
    (traits.undertone === "warm" || traits.undertone === "neutral") &&
    traits.depth === "deep" &&
    (traits.contrast === "high" || traits.contrast === "medium") &&
    (traits.chroma === "muted" || traits.chroma === "balanced") &&
    warmSignals + earthySignals >= coolSignals + icySignals;

  if (!deepWarm) return 0;
  if (profileId === "dark-autumn") return 30;
  if (profileId === "dark-winter" || profileId === "true-winter" || profileId === "bright-winter") return -22;
  return 0;
}

function modelHintScore(
  profileName: string,
  profileSeasonId: ScoringSeasonId,
  modelSeason?: string,
  modelSubSeason?: string,
  confidence?: "strong" | "moderate" | "uncertain",
): number {
  const normalizedSeason = modelSeason?.toLowerCase() ?? "";
  const normalizedSubSeason = modelSubSeason?.toLowerCase() ?? "";
  if (!normalizedSubSeason && !normalizedSeason) return 0;

  // Weight scales by confidence: strong=full, moderate=60%, uncertain=35%
  const multiplier = confidence === "strong" ? 1.0 : confidence === "moderate" ? 0.6 : 0.35;

  if (normalizedSubSeason === profileName.toLowerCase()) return Math.round(28 * multiplier);
  if (normalizedSubSeason.includes(profileName.toLowerCase())) return Math.round(12 * multiplier);
  if (normalizedSeason.includes(profileSeasonId)) return Math.round(5 * multiplier);
  return 0;
}

function buildEvidenceText(evidence: ScoringTextEvidence | undefined): string {
  if (!evidence) return "";
  return [
    evidence.skin,
    evidence.hair,
    evidence.eyes,
    evidence.undertone,
    evidence.contrast,
    evidence.depth,
    evidence.chroma,
    evidence.summary,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function countSignals(text: string, words: string[]): number {
  if (!text) return 0;
  return words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
}

function buildReason(
  subSeason: string,
  traits: ScoringTraits,
  warmSignals: number,
  coolSignals: number,
  earthySignals: number,
  icySignals: number
): string {
  if (subSeason === "Dark Autumn") {
    return "Deep coloring with warm/neutral undertone and earthy or smoky evidence points away from icy Winter.";
  }
  if (subSeason.includes("Winter")) {
    return "Winter stays likely when depth and contrast combine with cool, icy, or sharp evidence.";
  }
  const strongestTemperature = warmSignals >= coolSignals ? "warm" : "cool";
  const finish = earthySignals >= icySignals ? "softened" : "clear";
  return `${traits.depth} depth, ${traits.contrast} contrast, ${traits.chroma} chroma, and ${strongestTemperature} evidence support a ${finish} ${subSeason} direction.`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
