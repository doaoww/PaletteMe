// Deterministic product quality scorer.
// Runs AFTER SerpAPI retrieval, BEFORE showing results to the user.
// No LLM needed — vocabulary + source signals are enough to filter bad products.

export type RankedProduct = {
  title: string;
  price: string | null;
  imageUrl: string | null;
  link: string | null;
  source: string;
  tasteScore: number;    // 0–100 — how "good taste" the product signals
  qualityScore: number;  // 0–100 — how quality-looking the product is
  finalScore: number;    // weighted composite
};

// Words in product titles that signal quality / good taste
const QUALITY_SIGNALS = [
  { term: "silk", score: 20 },
  { term: "cashmere", score: 22 },
  { term: "merino", score: 20 },
  { term: "linen", score: 15 },
  { term: "wool", score: 12 },
  { term: "leather", score: 12 },
  { term: "crepe", score: 15 },
  { term: "satin", score: 12 },
  { term: "boucle", score: 18 },
  { term: "twill", score: 12 },
  { term: "bias cut", score: 18 },
  { term: "unstructured", score: 14 },
  { term: "minimal", score: 10 },
  { term: "relaxed fit", score: 8 },
  { term: "wide leg", score: 6 },
  { term: "tailored", score: 10 },
  { term: "pleated", score: 8 },
  { term: "knit", score: 6 },
  { term: "draped", score: 12 },
  { term: "midi", score: 5 },
];

// Words that signal cheap / wrong aesthetic — penalize these
const TASTE_PENALTIES = [
  { term: "sexy", penalty: 30 },
  { term: "bodycon", penalty: 25 },
  { term: "going out", penalty: 22 },
  { term: "club", penalty: 20 },
  { term: "party", penalty: 15 },
  { term: "glitter", penalty: 20 },
  { term: "sequin", penalty: 10 },
  { term: "cutout", penalty: 12 },
  { term: "bandage", penalty: 20 },
  { term: "ruched", penalty: 8 },
  { term: "sheer", penalty: 5 },
  { term: "pvc", penalty: 20 },
  // Footwear that should never appear in style recommendations
  { term: "slipper", penalty: 80 },
  { term: "house slipper", penalty: 100 },
  { term: "croc", penalty: 80 },
  { term: "flip flop", penalty: 70 },
  { term: "clog", penalty: 40 },
  { term: "ugg", penalty: 35 },
  { term: "foam", penalty: 50 },
  // Garment quality issues
  { term: "pleather", penalty: 35 },
  { term: "faux fur trim", penalty: 20 },
  { term: "bedazzl", penalty: 40 },
  { term: "rhinestone", penalty: 25 },
  { term: "novelty", penalty: 30 },
  { term: "graphic print", penalty: 20 },
  { term: "slogan", penalty: 35 },
];

// Sources with strong editorial/quality signals
const QUALITY_SOURCES: Record<string, number> = {
  "net-a-porter": 25,
  "matchesfashion": 22,
  "farfetch": 20,
  "mytheresa": 20,
  "nordstrom": 18,
  "bloomingdale": 15,
  "revolve": 12,
  "mango": 14,
  "arket": 18,
  "cos": 16,
  "& other stories": 16,
  "toteme": 22,
  "uniqlo": 14,
  "zara": 12,
  "asos": 10,
  "h&m": 8,
  "urban outfitters": 8,
  "anthropologie": 12,
  "free people": 8,
};

// Sources that usually produce low-taste results
const LOW_QUALITY_SOURCES = [
  "shein", "romwe", "zaful", "boohoo", "prettylittlething", "missguided",
  "nasty gal", "fashion nova",
];

export function scoreProduct(product: {
  title: string | null;
  price: string | null;
  thumbnail: string | null;
  link: string | null;
  source: string | null;
}): RankedProduct {
  const title = (product.title ?? "").toLowerCase();
  const source = (product.source ?? "").toLowerCase();

  // ── Quality score (fabric + construction signals) ──────────────────────────
  let qualityScore = 50; // start neutral
  for (const { term, score } of QUALITY_SIGNALS) {
    if (title.includes(term)) qualityScore += score;
  }
  qualityScore = Math.min(100, qualityScore);

  // ── Taste score (penalize cheap/wrong aesthetic) ───────────────────────────
  let tasteScore = 60; // start optimistic
  for (const { term, penalty } of TASTE_PENALTIES) {
    if (title.includes(term)) tasteScore -= penalty;
  }

  // Source bonus
  let sourceBonus = 0;
  for (const [key, bonus] of Object.entries(QUALITY_SOURCES)) {
    if (source.includes(key)) { sourceBonus = bonus; break; }
  }
  if (LOW_QUALITY_SOURCES.some((s) => source.includes(s))) {
    tasteScore -= 30;
  }
  tasteScore = Math.min(100, Math.max(0, tasteScore + sourceBonus));

  // Must have an image
  const hasImage = Boolean(product.thumbnail);
  const imagePenalty = hasImage ? 0 : -100;

  const finalScore = Math.max(
    0,
    qualityScore * 0.35 + tasteScore * 0.55 + sourceBonus * 0.1 + imagePenalty
  );

  return {
    title: product.title ?? "",
    price: product.price ?? null,
    imageUrl: product.thumbnail ?? null,
    link: product.link ?? null,
    source: product.source ?? "",
    tasteScore,
    qualityScore,
    finalScore,
  };
}

import type { ShopStyleProduct } from "@/lib/shopstyle";

export function scoreShopStyleProduct(product: ShopStyleProduct): RankedProduct {
  return scoreProduct({
    title: product.brandedName || product.name,
    price: product.salePrice != null
      ? `$${product.salePrice}`
      : product.price != null
        ? `$${product.price}`
        : null,
    thumbnail: product.image?.sizes?.Best?.url ?? null,
    link: product.clickUrl, // affiliate link — use as-is
    source: "shopstyle",
  });
}

// Pick the best product from a list of SerpAPI results
export function pickBestProduct(
  results: Array<{
    title: string;
    price?: string;
    thumbnail?: string;
    product_link?: string;
    link?: string;
    source: string;
  }>
): RankedProduct | null {
  if (results.length === 0) return null;

  const scored = results
    .map((r) =>
      scoreProduct({
        title: r.title,
        price: r.price ?? null,
        thumbnail: r.thumbnail ?? null,
        link: r.product_link ?? r.link ?? null,
        source: r.source,
      })
    )
    .filter((p) => p.imageUrl !== null)
    .sort((a, b) => b.finalScore - a.finalScore);

  return scored[0] ?? null;
}
