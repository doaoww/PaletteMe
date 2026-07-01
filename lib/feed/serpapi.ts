// Google Shopping via Serpapi
// Activate by setting SERPAPI_KEY in .env.local

type SerpResult = {
  position: number;
  title: string;
  link?: string;
  product_link?: string;
  source: string;
  price?: string;
  extracted_price?: number;
  old_price?: string;
  extracted_old_price?: number;
  thumbnail?: string;
  rating?: number;
  reviews?: number;
};

type SerpResponse = {
  shopping_results?: SerpResult[];
  error?: string;
};

// Wearable clothing color terms per sub-season — real retail language that appears in product titles.
// 6 options per season; the query rotates through them (2 at a time) as the user scrolls.
const SUB_SEASON_CLOTHING: Record<string, string[]> = {
  "light-spring":   ["blush pink", "ivory", "light peach", "warm cream", "soft apricot", "warm white"],
  "true-spring":    ["coral", "warm peach", "salmon", "golden yellow", "warm orange", "jade green"],
  "bright-spring":  ["vivid coral", "bright pink", "amber", "warm turquoise", "warm red", "cobalt teal"],
  "soft-spring":    ["warm peach", "camel", "warm blush", "dusty coral", "warm beige", "peach pink"],
  "light-summer":   ["powder blue", "lavender", "soft blush", "pale lilac", "baby pink", "dusty pink"],
  "true-summer":    ["dusty rose", "mauve", "periwinkle", "lavender", "soft raspberry", "slate blue"],
  "soft-summer":    ["dusty rose", "mauve", "taupe", "dusty blue", "mushroom", "soft sage"],
  "soft-autumn":    ["camel", "warm beige", "sage green", "dusty olive", "warm brown", "dusty terracotta"],
  "true-autumn":    ["terracotta", "rust", "olive green", "copper", "camel", "burnt orange"],
  "dark-autumn":    ["burgundy", "dark olive", "chocolate brown", "deep rust", "forest green", "espresso"],
  "bright-winter":  ["bright red", "cobalt blue", "hot pink", "stark white", "royal blue", "fuchsia"],
  "true-winter":    ["black", "cobalt blue", "crimson red", "navy", "emerald green", "icy white"],
  "dark-winter":    ["navy", "dark burgundy", "charcoal", "dark plum", "forest green", "deep teal"],
};

// Makeup-specific search terms per sub-season — what actual makeup products are called.
const SUB_SEASON_MAKEUP: Record<string, string[]> = {
  "light-spring":   ["peach blush", "coral lip gloss", "warm nude lipstick", "apricot blush", "peach eyeshadow", "warm ivory foundation"],
  "true-spring":    ["coral lipstick", "warm peach blush", "bronze eyeshadow", "golden highlight", "warm pink lip", "coral nail polish"],
  "bright-spring":  ["vivid coral lipstick", "warm pink blush", "bright coral lip", "golden bronze eyeshadow", "warm teal liner", "peach highlight"],
  "soft-spring":    ["warm nude lipstick", "peachy blush", "warm taupe eyeshadow", "peach lip balm", "bronze shimmer", "camel brown mascara"],
  "light-summer":   ["soft pink lipstick", "blush palette", "soft lavender eyeshadow", "rose lip gloss", "cool pink blush", "baby pink nail polish"],
  "true-summer":    ["dusty rose lipstick", "mauve blush", "dusty plum eyeshadow", "soft berry lip", "cool pink highlight", "rose mauve nail"],
  "soft-summer":    ["mauve lipstick", "dusty rose blush", "taupe eyeshadow palette", "muted berry lip", "cool nude lipstick", "dusty mauve nail"],
  "soft-autumn":    ["warm nude lip", "terracotta blush", "warm brown eyeshadow", "camel highlight", "golden nude lipstick", "warm taupe nail"],
  "true-autumn":    ["terracotta lipstick", "warm peach blush", "bronze eyeshadow palette", "copper highlight", "warm rust lip", "olive green liner"],
  "dark-autumn":    ["burgundy lipstick", "deep plum blush", "warm brown smoky eyeshadow", "bronze shimmer highlight", "rust lip liner", "wine nail polish"],
  "bright-winter":  ["bold red lipstick", "bright pink blush", "vivid fuchsia lip", "electric blue liner", "cool pink highlight", "red nail polish"],
  "true-winter":    ["red lipstick", "cool pink blush", "navy eyeliner", "icy highlight", "berry lip", "black mascara"],
  "dark-winter":    ["deep burgundy lipstick", "plum lip liner", "dark smoky eyeshadow", "cool plum blush", "wine nail polish", "charcoal liner"],
};

// Generic season fallbacks when no sub-season matches
const SEASON_CLOTHING: Record<string, string[]> = {
  spring:  ["peach", "coral", "warm blush", "ivory", "warm olive"],
  summer:  ["dusty rose", "mauve", "powder blue", "lavender", "soft pink"],
  autumn:  ["terracotta", "camel", "rust", "olive green", "warm brown"],
  winter:  ["navy", "cobalt blue", "black", "crimson", "emerald"],
};

const SEASON_MAKEUP: Record<string, string[]> = {
  spring:  ["coral lipstick", "peach blush", "warm nude lip", "bronze eyeshadow", "warm pink highlight"],
  summer:  ["dusty rose lipstick", "mauve blush", "lavender eyeshadow", "cool pink lip", "soft berry"],
  autumn:  ["terracotta lipstick", "warm bronze blush", "brown eyeshadow", "camel nude lip", "copper highlight"],
  winter:  ["red lipstick", "cool pink blush", "smoky eyeshadow", "berry lip", "icy highlight"],
};

const CATEGORY_TERMS: Record<string, string> = {
  tops:    "top shirt blouse",
  bottoms: "pants skirt trousers",
  shoes:   "shoes boots sneakers",
  "":      "clothing outfit",
};

const STYLE_TERMS: Record<string, string> = {
  classic:    "classic tailored",
  minimalist: "minimalist minimal",
  romantic:   "feminine flowy",
  edgy:       "edgy bold leather",
  bohemian:   "boho earthy",
  streetwear: "streetwear urban",
  office:     "smart work",
  casual:     "casual everyday",
};

function subSeasonKey(subSeason?: string): string {
  return (subSeason ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Pick 2 color terms from the list, rotating by page so infinite scroll shows variety
function pickColors(terms: string[], offset: number): string {
  const page = Math.floor(offset / 20);
  const start = (page * 2) % terms.length;
  const first = terms[start];
  const second = terms[(start + 1) % terms.length];
  return [first, second].filter(Boolean).join(" ");
}

function colorTerms(subSeason: string | undefined, season: string, category: string, offset: number): string {
  const key = subSeasonKey(subSeason);
  const isMakeup = category === "makeup";

  if (isMakeup) {
    const terms = SUB_SEASON_MAKEUP[key] ?? SEASON_MAKEUP[season] ?? SEASON_MAKEUP["spring"];
    return pickColors(terms, offset);
  }

  const terms = SUB_SEASON_CLOTHING[key] ?? SEASON_CLOTHING[season] ?? SEASON_CLOTHING["spring"];
  return pickColors(terms, offset);
}

export function buildShoppingQuery(params: {
  season: string;
  subSeason?: string;
  wardrobeType?: string;
  category?: string;
  styleDirections?: string[];
  offset?: number;
}): string {
  const { season, subSeason, wardrobeType, category = "", styleDirections = [], offset = 0 } = params;

  const colors = colorTerms(subSeason, season, category, offset);
  const gender = wardrobeType === "menswear" ? "men" : wardrobeType === "womenswear" ? "women" : "";
  const cat = category === "makeup" ? "makeup" : CATEGORY_TERMS[category] ?? "clothing";
  const style = styleDirections
    .slice(0, 1)
    .map((s) => STYLE_TERMS[s] ?? "")
    .filter(Boolean)
    .join(" ");

  return [colors, gender, cat, style].filter(Boolean).join(" ").trim();
}

export async function searchGoogleShopping(params: {
  query: string;
  num?: number;
  start?: number;
  gl?: string;
  hl?: string;
  siteOperators?: string;
}): Promise<SerpResult[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];

  // Append site: operators to the query string if provided (filters to specific stores)
  const q = params.siteOperators
    ? `${params.query} ${params.siteOperators}`
    : params.query;

  const qs = new URLSearchParams({
    engine: "google_shopping",
    q,
    api_key: key,
    num: String(params.num ?? 40),
    gl: params.gl ?? "us",
    hl: params.hl ?? "en",
  });

  if (params.start) qs.set("start", String(params.start));

  const res = await fetch(`https://serpapi.com/search?${qs}`, {
    next: { revalidate: 14400 }, // 4 hours — conserve API quota
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[serpapi] HTTP ${res.status} — ${body.slice(0, 300)}`);
    return [];
  }
  const data = (await res.json()) as SerpResponse;
  if (data.error) {
    console.error(`[serpapi] API error: ${data.error}`);
    return [];
  }
  const hits = data.shopping_results ?? [];
  if (hits.length === 0) {
    console.warn(`[serpapi] zero results for query: "${q.slice(0, 120)}"`);
  }
  return hits;
}

function scoreResult(title: string, colorKeywords: string[], position: number): number {
  const lower = title.toLowerCase();
  const colorMatch = colorKeywords.some((k) => k.length > 3 && lower.includes(k.toLowerCase()));
  const positionBoost = Math.max(0, (40 - position) / 40) * 0.08;
  // Color keyword in title = "great" territory (0.85+)
  // No keyword match = "maybe" territory (0.50) — do not award "good-with-styling" for unverified color
  return Math.min(0.97, (colorMatch ? 0.85 : 0.50) + positionBoost);
}

export function toFeedSerpProducts(
  results: SerpResult[],
  query: string,
  start = 0
): object[] {
  const colorKeywords = query.split(" ");

  return results
    .filter((r) => r.thumbnail)
    .map((r, index) => {
      const score = scoreResult(r.title, colorKeywords, r.position);
      const verdict = score >= 0.82 ? "great" : score >= 0.64 ? "good-with-styling" : "maybe";
      const id = `serp-${start + index}`;

      return {
        id,
        name: r.title,
        brandedName: r.source,
        price: r.extracted_price,
        priceLabel: r.price ?? "check price",
        salePrice: r.extracted_old_price,
        image: { sizes: { Best: { url: r.thumbnail ?? "" } } },
        clickUrl: r.product_link ?? r.link ?? "",
        match: Math.round(score * 100),
        score,
        source: "serpapi",
        merchant: r.source,
        verdict,
      };
    });
}
