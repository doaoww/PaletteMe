// Google Shopping via Serpapi
// Activate by setting SERPAPI_KEY in .env.local

type SerpResult = {
  position: number;
  title: string;
  link: string;
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

// Color keywords per sub-season for building search queries
const SUB_SEASON_COLORS: Record<string, string> = {
  "light-spring":   "peach blush ivory cream mint soft pink",
  "true-spring":    "coral warm golden yellow turquoise orange",
  "bright-spring":  "bright coral vivid pink lime yellow",
  "light-summer":   "powder blue soft pink lavender blush rose",
  "true-summer":    "dusty rose mauve soft lavender steel blue",
  "soft-summer":    "muted mauve dusty blush lavender taupe",
  "soft-autumn":    "camel warm beige sage olive muted brown",
  "true-autumn":    "terracotta rust copper golden brown warm",
  "dark-autumn":    "burgundy deep olive chocolate dark brown",
  "bright-winter":  "bright red electric blue hot pink bold white",
  "true-winter":    "cobalt blue crimson red black white jewel",
  "dark-winter":    "deep burgundy dark navy forest plum charcoal",
};

const SEASON_COLORS: Record<string, string> = {
  spring:  "peach coral mint warm golden blush",
  summer:  "dusty rose lavender soft blue mauve pink",
  autumn:  "terracotta rust camel olive warm brown",
  winter:  "navy cobalt burgundy black white jewel",
};

const CATEGORY_TERMS: Record<string, string> = {
  tops:    "top blouse shirt",
  bottoms: "pants skirt trousers",
  shoes:   "shoes sneakers boots",
  makeup:  "makeup lipstick blush palette",
  "":      "clothing",
};

const STYLE_TERMS: Record<string, string> = {
  classic:    "classic tailored",
  minimalist: "minimalist minimal clean",
  romantic:   "floral feminine flowy",
  edgy:       "edgy bold leather",
  bohemian:   "boho earthy flowy",
  streetwear: "streetwear urban casual",
  office:     "office smart work",
  casual:     "casual everyday relaxed",
};

export function buildShoppingQuery(params: {
  season: string;
  subSeason?: string;
  wardrobeType?: string;
  category?: string;
  styleDirections?: string[];
}): string {
  const { season, subSeason, wardrobeType, category = "", styleDirections = [] } = params;

  const key = subSeason?.toLowerCase().replace(/\s+/g, "-");
  const colors = (key && SUB_SEASON_COLORS[key]) ? SUB_SEASON_COLORS[key] : (SEASON_COLORS[season] ?? "neutral");

  const gender = wardrobeType === "menswear" ? "men" : wardrobeType === "womenswear" ? "women" : "";
  const cat = CATEGORY_TERMS[category] ?? "clothing";
  const style = styleDirections
    .slice(0, 2)
    .map((s) => STYLE_TERMS[s] ?? "")
    .filter(Boolean)
    .join(" ");

  return [colors, gender, cat, style].filter(Boolean).join(" ").trim();
}

export async function searchGoogleShopping(params: {
  query: string;
  num?: number;
  start?: number;
}): Promise<SerpResult[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];

  const qs = new URLSearchParams({
    engine: "google_shopping",
    q: params.query,
    api_key: key,
    num: String(params.num ?? 40),
    gl: "us",
    hl: "en",
  });

  if (params.start) qs.set("start", String(params.start));

  const res = await fetch(`https://serpapi.com/search?${qs}`, {
    next: { revalidate: 14400 }, // 4 hours — conserve API quota
  });

  if (!res.ok) return [];
  const data = (await res.json()) as SerpResponse;
  return data.shopping_results ?? [];
}

function scoreResult(title: string, colorKeywords: string[], position: number): number {
  const lower = title.toLowerCase();
  const colorMatch = colorKeywords.some((k) => k.length > 3 && lower.includes(k));
  const positionBoost = Math.max(0, (40 - position) / 40) * 0.08;
  return Math.min(0.97, (colorMatch ? 0.85 : 0.72) + positionBoost);
}

export function toFeedSerpProducts(
  results: SerpResult[],
  query: string
): object[] {
  const colorKeywords = query.split(" ");

  return results
    .filter((r) => r.thumbnail)
    .map((r) => {
      const score = scoreResult(r.title, colorKeywords, r.position);
      const verdict = score >= 0.82 ? "great" : score >= 0.64 ? "good-with-styling" : "maybe";
      const id = `serp-${r.position}-${r.source.replace(/\W/g, "").slice(0, 8).toLowerCase()}`;

      return {
        id,
        name: r.title,
        brandedName: r.source,
        price: r.extracted_price,
        priceLabel: r.price ?? "check price",
        salePrice: r.extracted_old_price,
        image: { sizes: { Best: { url: r.thumbnail ?? "" } } },
        clickUrl: r.link,
        match: Math.round(score * 100),
        score,
        source: "serpapi",
        merchant: r.source,
        verdict,
      };
    });
}
