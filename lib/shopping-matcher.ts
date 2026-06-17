import { buildAffiliateUrl } from "./affiliate.ts";
import {
  SHOPPING_INTENTS,
  type ShoppingIntent,
  type ShoppingVerdict,
} from "./shopping-intents.ts";
import type { SeasonId } from "./analysis.ts";
import type {
  BodyType,
  BudgetPref,
  ClimatePref,
  HeightRange,
  MakeupPref,
  OccasionPref,
  QuizAnswers,
  StyleVector,
  WardrobeType,
  WeightRange,
} from "./quiz-data.ts";

export type ShoppingMatchProfile = {
  seasonId?: SeasonId | string;
  seasonName?: string;
  subSeason?: string;
  bodyType?: BodyType | string;
  styleVector?: Partial<StyleVector>;
  answers?: Partial<QuizAnswers>;
};

export type ScoredShoppingIntent = {
  intent: ShoppingIntent;
  score: number;
  match: number;
  verdict: ShoppingVerdict;
  reason: string;
  fitNote: string;
};

export type FeedShoppingProduct = {
  id: string;
  name: string;
  brandedName: string;
  price?: number;
  priceLabel: string;
  image: { sizes: { Best: { url: string } } };
  clickUrl: string;
  hex: string;
  swatches: string[];
  match: number;
  score: number;
  source: "intent-catalog";
  merchant: string;
  searchQuery: string;
  reason: string;
  fitNote: string;
  verdict: ShoppingVerdict;
  category: string;
  colorName: string;
  placement: string;
};

type RankOptions = {
  limit?: number;
  offset?: number;
};

const STYLE_ALIASES: Record<string, string[]> = {
  feminine: ["romantic"],
  edgy: ["streetwear", "eclectic"],
  preppy: ["classic", "office", "literary-chic"],
  sporty: ["streetwear", "casual"],
  "old-money": ["classic", "quiet-luxury"],
  boho: ["bohemian", "eclectic"],
  y2k: ["streetwear", "90s-minimal", "eclectic"],
  retro: ["eclectic", "classic"],
  "goth-lite": ["streetwear", "eclectic"],
  office: ["office", "classic"],
  capsule: ["minimalist", "classic"],
};

function normalizeTag(tag: string | undefined): string[] {
  if (!tag) return [];
  const normalized = tag.toLowerCase().trim();
  return [normalized, ...(STYLE_ALIASES[normalized] ?? [])];
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function collectStyleTags(profile: ShoppingMatchProfile): string[] {
  const answers = profile.answers ?? {};
  return unique([
    ...(profile.styleVector?.aesthetics ?? []).flatMap(normalizeTag),
    ...(profile.styleVector?.fit ?? []).flatMap(normalizeTag),
    ...(profile.styleVector?.occasions ?? []).flatMap(normalizeTag),
    ...(answers.styleDirections ?? []).flatMap(normalizeTag),
    ...(answers.trends ?? []).flatMap(normalizeTag),
    ...normalizeTag(answers.styleVibe),
    ...normalizeTag(answers.goal),
  ]);
}

function collectOccasions(profile: ShoppingMatchProfile): OccasionPref[] {
  return profile.answers?.occasions ?? [];
}

function overlapScore(a: string[], b: string[], max: number): number {
  if (!a.length || !b.length) return max * 0.45;
  const bSet = new Set(b);
  const matches = a.filter((item) => bSet.has(item)).length;
  return Math.min(max, (matches / Math.max(1, a.length)) * max);
}

function normalizeSubSeason(value?: string): string | undefined {
  return value?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function wardrobeMatches(intent: ShoppingIntent, wardrobeType?: WardrobeType): boolean {
  if (!wardrobeType || wardrobeType === "both") return true;
  if (wardrobeType === "unisex") {
    return intent.wardrobeTypes.includes("unisex") || intent.wardrobeTypes.includes("both");
  }
  return intent.wardrobeTypes.includes(wardrobeType) || intent.wardrobeTypes.includes("unisex");
}

function makeupAllowed(intent: ShoppingIntent, makeupPref?: MakeupPref): boolean {
  if (intent.category !== "makeup") return true;
  return makeupPref !== "no";
}

function scoreIntent(intent: ShoppingIntent, profile: ShoppingMatchProfile): number {
  const answers = profile.answers ?? {};
  const seasonId = profile.seasonId;
  const subSeason = normalizeSubSeason(profile.subSeason);
  const bodyType = profile.bodyType as BodyType | undefined;
  const wardrobeType = answers.wardrobeType;
  const height = answers.height as HeightRange | undefined;
  const weight = answers.weightRange as WeightRange | undefined;
  const budget = answers.budgetPref as BudgetPref | undefined;
  const climate = answers.climatePref as ClimatePref | undefined;
  const styleTags = collectStyleTags(profile);
  const occasions = collectOccasions(profile);

  let score = 0.12;

  if (seasonId && intent.seasonIds.includes(seasonId as SeasonId)) score += 0.32;
  if (subSeason && intent.subSeasonIds.includes(subSeason)) score += 0.16;

  score += overlapScore(styleTags, [...intent.styleTags, ...intent.trendTags], 0.18);

  if (bodyType && intent.bodyTypes.includes(bodyType)) score += 0.11;
  else if (bodyType && intent.useCareBodyTypes.includes(bodyType)) score -= 0.04;
  else score += 0.05;

  if (wardrobeMatches(intent, wardrobeType)) score += 0.08;
  else score -= 0.28;

  if (height && intent.heightRanges.includes(height)) score += 0.04;
  else if (!height) score += 0.02;

  if (weight && intent.weightRanges.includes(weight)) score += 0.04;
  else if (!weight) score += 0.02;

  score += overlapScore(occasions, intent.occasions, 0.05);

  if (budget && intent.budgetPrefs.includes(budget)) score += 0.03;
  else if (!budget) score += 0.015;

  if (climate && intent.climatePrefs.includes(climate)) score += 0.025;
  else if (!climate) score += 0.01;

  if (!makeupAllowed(intent, answers.makeupPref)) score -= 0.5;

  return Math.max(0.05, Math.min(0.99, score));
}

function verdictFromScore(score: number): ShoppingVerdict {
  if (score >= 0.82) return "great";
  if (score >= 0.64) return "good-with-styling";
  return "maybe";
}

function buildReason(intent: ShoppingIntent, profile: ShoppingMatchProfile, score: number): string {
  const season = profile.subSeason ?? profile.seasonName ?? profile.seasonId ?? "your palette";
  const verdict = verdictFromScore(score);
  if (verdict === "great") {
    return `${intent.colorName} is a strong ${season} direction. ${intent.reason}`;
  }
  if (verdict === "good-with-styling") {
    return `${intent.title} is a good ${season} option when styled intentionally. ${intent.reason}`;
  }
  return `${intent.title} is a maybe for ${season}; use it as an accent or balance it with stronger palette colors. ${intent.reason}`;
}

function buildFitNote(intent: ShoppingIntent, profile: ShoppingMatchProfile): string {
  const bodyType = profile.bodyType as BodyType | undefined;
  if (bodyType && intent.useCareBodyTypes.includes(bodyType)) {
    return `${intent.fitNote} This is usable, but choose the cut carefully for your ${bodyType} proportions.`;
  }
  return intent.fitNote;
}

export function rankShoppingIntents(
  profile: ShoppingMatchProfile,
  options: RankOptions = {}
): ScoredShoppingIntent[] {
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 20;
  const answers = profile.answers ?? {};
  const ranked = SHOPPING_INTENTS
    .filter((intent) => wardrobeMatches(intent, answers.wardrobeType))
    .filter((intent) => makeupAllowed(intent, answers.makeupPref))
    .map((intent) => {
      const score = scoreIntent(intent, profile);
      return {
        intent,
        score,
        match: Math.round(score * 100),
        verdict: verdictFromScore(score),
        reason: buildReason(intent, profile, score),
        fitNote: buildFitNote(intent, profile),
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.intent.title.localeCompare(b.intent.title);
    });

  return ranked.slice(offset, offset + limit);
}

export function toFeedShoppingProduct(scored: ScoredShoppingIntent): FeedShoppingProduct {
  const { intent } = scored;
  return {
    id: intent.id,
    name: intent.title,
    brandedName: `${intent.merchant} search`,
    priceLabel: "shop similar",
    image: { sizes: { Best: { url: "" } } },
    clickUrl: buildAffiliateUrl(intent.merchantSearchUrl),
    hex: intent.hex,
    swatches: [intent.hex],
    match: scored.match,
    score: scored.score,
    source: "intent-catalog",
    merchant: intent.merchant,
    searchQuery: intent.searchQuery,
    reason: scored.reason,
    fitNote: scored.fitNote,
    verdict: scored.verdict,
    category: intent.category,
    colorName: intent.colorName,
    placement: intent.placement,
  };
}
