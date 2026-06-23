// ShopStyle Collective API client
// Activate by setting SHOPSTYLE_UID in .env.local

export type ShopStyleProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  image: { sizes: { Best: { url: string } } };
  clickUrl: string; // affiliate link — use as-is, never modify
  brandedName: string;
  categories: { id: string; name: string }[];
  colors?: { name: string; canonicalColors: string[] }[];
};

type ShopStyleResponse = {
  products: ShopStyleProduct[];
  metadata: { total: number; offset: number; limit: number };
};

const BASE = "https://api.shopstyle.com/api/v2";

export async function searchProducts(params: {
  fts: string;
  offset?: number;
  limit?: number;
  fl?: string[];
  cat?: string;
}): Promise<ShopStyleProduct[]> {
  const uid = process.env.SHOPSTYLE_UID;
  if (!uid) return [];

  const qs = new URLSearchParams({
    pid: uid,
    fts: params.fts,
    offset: String(params.offset ?? 0),
    limit: String(params.limit ?? 100),
    country: "US",
    format: "json",
  });

  if (params.cat) qs.set("cat", params.cat);
  if (params.fl?.length) params.fl.forEach((f) => qs.append("fl", f));

  const res = await fetch(`${BASE}/products?${qs}`, {
    next: { revalidate: 14400 }, // 4 hours
  });

  if (!res.ok) return [];
  const data = (await res.json()) as ShopStyleResponse;
  return data.products ?? [];
}

// ─── Color scoring (LAB perceptual distance) ─────────────────────────────

function hexToLab(hex: string): [number, number, number] {
  // hex → linear RGB → XYZ → LAB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const lin = (c: number) => (c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92);
  const rl = lin(r);
  const gl = lin(g);
  const bl = lin(b);

  const x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / 0.95047;
  const y = (rl * 0.2126 + gl * 0.7152 + bl * 0.0722) / 1.0;
  const z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / 1.08883;

  const f = (t: number) => (t > 0.008856 ? t ** (1 / 3) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function labDistance(hex1: string, hex2: string): number {
  try {
    const [l1, a1, b1] = hexToLab(hex1);
    const [l2, a2, b2] = hexToLab(hex2);
    return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
  } catch {
    return 999;
  }
}

export function colorScore(
  productColors: string[],
  bestColors: string[],
  avoidColors: string[]
): number {
  if (!productColors.length) return 0.5; // unknown color → neutral
  let total = 0;
  for (const pc of productColors) {
    const bestDist = Math.min(...bestColors.map((c) => labDistance(pc, c)));
    const avoidDist = Math.min(...avoidColors.map((c) => labDistance(pc, c)));
    if (bestDist < 20) total += 1.0;
    else if (bestDist < 35) total += 0.6;
    else if (avoidDist < 20) total -= 0.5;
    else total += 0.2;
  }
  return Math.max(0, total / productColors.length);
}

const STYLE_KEYWORDS: Record<string, string[]> = {
  minimalist: ["minimal", "simple", "clean", "neutral", "basic"],
  classic: ["tailored", "blazer", "structured", "timeless", "preppy"],
  casual: ["relaxed", "denim", "knit", "everyday", "comfortable"],
  romantic: ["floral", "lace", "ruffle", "feminine", "flowy", "midi"],
  edgy: ["leather", "moto", "bold", "graphic", "dark"],
  bohemian: ["boho", "maxi", "flowy", "earthy", "ethnic"],
  sporty: ["athletic", "active", "sport", "stretch", "performance"],
};

export function styleScore(
  product: ShopStyleProduct,
  aesthetics: string[]
): number {
  if (!aesthetics.length) return 0.5;
  const text = `${product.name} ${product.description}`.toLowerCase();
  let score = 0;
  for (const aesthetic of aesthetics) {
    const keywords = STYLE_KEYWORDS[aesthetic] ?? [];
    if (keywords.some((k) => text.includes(k))) score += 1;
  }
  return Math.min(1, score / aesthetics.length);
}

const BODY_TYPE_TAGS: Record<string, string[]> = {
  pear: ["a-line", "flared", "off-shoulder", "wide-leg", "wrap"],
  apple: ["empire", "v-neck", "flowy", "wrap", "straight-leg"],
  hourglass: ["wrap", "fitted", "belted", "bodycon"],
  rectangle: ["peplum", "ruffled", "belted", "high-waist"],
  "inverted-triangle": ["a-line", "full skirt", "wide-leg", "v-neck"],
};

export function bodyTypeScore(product: ShopStyleProduct, bodyType: string): number {
  const tags = BODY_TYPE_TAGS[bodyType] ?? [];
  if (!tags.length) return 0.5;
  const text = `${product.name} ${product.description}`.toLowerCase();
  const matched = tags.filter((t) => text.includes(t)).length;
  return matched > 0 ? Math.min(1, 0.5 + matched * 0.25) : 0.3;
}

export function rankProduct(
  product: ShopStyleProduct,
  palette: { best: string[]; avoid: string[] },
  aesthetics: string[],
  bodyType: string
): number {
  const colors = product.colors?.flatMap((c) => c.canonicalColors) ?? [];
  const c = colorScore(colors, palette.best, palette.avoid);
  const s = styleScore(product, aesthetics);
  const b = bodyTypeScore(product, bodyType);
  return c * 0.5 + s * 0.3 + b * 0.2;
}

import { scoreShopStyleProduct } from "@/lib/product-ranker";

export type EnrichedFashionProduct = {
  title: string;
  price: string | null;
  imageUrl: string | null;
  link: string | null;
  source: "shopstyle";
};

export async function searchFashionItem(
  query: string
): Promise<EnrichedFashionProduct | null> {
  const products = await searchProducts({ fts: query, limit: 20 });
  if (products.length === 0) return null;

  const scored = products
    .map((p) => ({ raw: p, scored: scoreShopStyleProduct(p) }))
    .filter((p) => p.scored.imageUrl !== null && p.scored.finalScore > 30)
    .sort((a, b) => b.scored.finalScore - a.scored.finalScore);

  const best = scored[0];
  if (!best) return null;

  return {
    title: best.scored.title,
    price: best.scored.price,
    imageUrl: best.scored.imageUrl,
    link: best.raw.clickUrl, // always use clickUrl (affiliate link) — never scored.link
    source: "shopstyle",
  };
}
