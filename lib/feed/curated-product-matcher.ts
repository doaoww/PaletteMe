import { buildAffiliateUrl } from "./affiliate.ts";
import { CURATED_PRODUCTS, type CuratedProduct } from "./curated-products.ts";
import type { SeasonId } from "@/lib/analysis/analysis";
import type { ShoppingVerdict } from "./shopping-intents.ts";
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
} from "@/lib/quiz/quiz-data";

export type CuratedMatchProfile = {
  seasonId?: SeasonId | string;
  seasonName?: string;
  subSeason?: string;
  bodyType?: BodyType | string;
  styleVector?: Partial<StyleVector>;
  answers?: Partial<QuizAnswers>;
};

export type ScoredCuratedProduct = {
  intent: CuratedProduct;
  score: number;
  match: number;
  verdict: ShoppingVerdict;
  reason: string;
  fitNote: string;
};

export type FeedCuratedProduct = {
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
  source: "curated-product";
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
  y2k: ["streetwear", "90s-minimal"],
  retro: ["retro", "classic"],
  "goth-lite": ["streetwear"],
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

function collectStyleTags(profile: CuratedMatchProfile): string[] {
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

function collectOccasions(profile: CuratedMatchProfile): OccasionPref[] {
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

function wardrobeMatches(product: CuratedProduct, wardrobeType?: WardrobeType): boolean {
  if (!wardrobeType || wardrobeType === "both") return true;
  if (wardrobeType === "unisex") {
    return product.wardrobeTypes.includes("unisex") || product.wardrobeTypes.includes("both");
  }
  return product.wardrobeTypes.includes(wardrobeType) || product.wardrobeTypes.includes("unisex");
}

function makeupAllowed(product: CuratedProduct, makeupPref?: MakeupPref): boolean {
  if (product.category !== "makeup") return true;
  return makeupPref !== "no";
}

function scoreProduct(product: CuratedProduct, profile: CuratedMatchProfile): number {
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

  let score = 0.18;

  if (seasonId && product.seasonIds.includes(seasonId as SeasonId)) score += 0.3;
  if (subSeason && product.subSeasonIds.includes(subSeason)) score += 0.17;

  score += overlapScore(styleTags, [...product.styleTags, ...product.trendTags], 0.17);

  if (bodyType && product.bodyTypes.includes(bodyType)) score += 0.1;
  else if (bodyType && product.useCareBodyTypes.includes(bodyType)) score -= 0.04;
  else score += 0.04;

  if (wardrobeMatches(product, wardrobeType)) score += 0.08;
  else score -= 0.3;

  if (height && product.heightRanges.includes(height)) score += 0.035;
  else if (!height) score += 0.015;

  if (weight && product.weightRanges.includes(weight)) score += 0.035;
  else if (!weight) score += 0.015;

  score += overlapScore(occasions, product.occasions, 0.05);

  if (budget && product.budgetPrefs.includes(budget)) score += 0.025;
  else if (!budget) score += 0.01;

  if (climate && product.climatePrefs.includes(climate)) score += 0.02;
  else if (!climate) score += 0.01;

  if (!makeupAllowed(product, answers.makeupPref)) score -= 0.55;

  return Math.max(0.05, Math.min(0.99, score));
}

function verdictFromScore(score: number): ShoppingVerdict {
  if (score >= 0.82) return "great";
  if (score >= 0.64) return "good-with-styling";
  return "maybe";
}

function buildReason(product: CuratedProduct, profile: CuratedMatchProfile, score: number): string {
  const season = profile.subSeason ?? profile.seasonName ?? profile.seasonId ?? "your palette";
  const verdict = verdictFromScore(score);
  if (verdict === "great") {
    return `${product.colorName} is a strong ${season} direction, and this is a real ${product.retailer} product page. ${product.reason}`;
  }
  if (verdict === "good-with-styling") {
    return `${product.title} can work well for ${season} when styled intentionally. ${product.reason}`;
  }
  return `${product.title} is a maybe for ${season}; use it as an accent or balance it with stronger palette colors. ${product.reason}`;
}

function buildFitNote(product: CuratedProduct, profile: CuratedMatchProfile): string {
  const bodyType = profile.bodyType as BodyType | undefined;
  if (bodyType && product.useCareBodyTypes.includes(bodyType)) {
    return `${product.fitNote} Choose the cut carefully for your ${bodyType} proportions.`;
  }
  return product.fitNote;
}

export function rankCuratedProducts(
  profile: CuratedMatchProfile,
  options: RankOptions = {}
): ScoredCuratedProduct[] {
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 20;
  const answers = profile.answers ?? {};
  const ranked = CURATED_PRODUCTS
    .filter((product) => wardrobeMatches(product, answers.wardrobeType))
    .filter((product) => makeupAllowed(product, answers.makeupPref))
    .map((product) => {
      const score = scoreProduct(product, profile);
      return {
        intent: product,
        score,
        match: Math.round(score * 100),
        verdict: verdictFromScore(score),
        reason: buildReason(product, profile, score),
        fitNote: buildFitNote(product, profile),
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.intent.title.localeCompare(b.intent.title);
    });

  return ranked.slice(offset, offset + limit);
}

export function toFeedCuratedProduct(scored: ScoredCuratedProduct): FeedCuratedProduct {
  const { intent } = scored;
  return {
    id: intent.id,
    name: intent.title,
    brandedName: `${intent.brand} at ${intent.retailer}`,
    priceLabel: "check retailer",
    image: { sizes: { Best: { url: intent.imageUrl ?? "" } } },
    clickUrl: buildAffiliateUrl(intent.productUrl),
    hex: intent.hex,
    swatches: [intent.hex],
    match: scored.match,
    score: scored.score,
    source: "curated-product",
    merchant: intent.retailer,
    searchQuery: intent.title,
    reason: scored.reason,
    fitNote: scored.fitNote,
    verdict: scored.verdict,
    category: intent.category,
    colorName: intent.colorName,
    placement: intent.placement,
  };
}
