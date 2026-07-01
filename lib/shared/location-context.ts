// Location and seasonal context for product recommendations.
// Localizes SerpAPI queries and ensures clothing matches current weather.

// ─── Season detection ──────────────────────────────────────────────────────────

export type ClothingSeason = "spring" | "summer" | "autumn" | "winter";

// Countries in the Southern Hemisphere (seasons are reversed)
const SOUTHERN_HEMISPHERE_COUNTRIES = new Set([
  "au", "nz", "za", "ar", "cl", "br", "uy", "py", "bo",
  "pe", "ec", "co", "tz", "mz", "mg", "zw", "bw", "na",
]);

export function getCurrentClothingSeason(countryCode: string): ClothingSeason {
  const month = new Date().getMonth() + 1; // 1–12
  const isSouthern = SOUTHERN_HEMISPHERE_COUNTRIES.has(countryCode.toLowerCase());

  let season: ClothingSeason;
  if (month >= 3 && month <= 5) season = "spring";
  else if (month >= 6 && month <= 8) season = "summer";
  else if (month >= 9 && month <= 11) season = "autumn";
  else season = "winter";

  // Flip for southern hemisphere
  if (isSouthern) {
    const flip: Record<ClothingSeason, ClothingSeason> = {
      spring: "autumn",
      summer: "winter",
      autumn: "spring",
      winter: "summer",
    };
    return flip[season];
  }

  return season;
}

// ─── Country → SerpAPI gl code ─────────────────────────────────────────────────

// Maps user-provided country names to SerpAPI `gl` (Google country) codes.
// SerpAPI gl codes: https://serpapi.com/google-countries
export const COUNTRY_TO_GL: Record<string, string> = {
  // Russian-speaking
  russia: "ru", россия: "ru", ru: "ru",
  ukraine: "ua", украина: "ua", ua: "ua",
  kazakhstan: "kz", казахстан: "kz", kz: "kz",
  belarus: "by", беларусь: "by", by: "by",

  // Europe
  uk: "gb", "united kingdom": "gb", england: "gb",
  germany: "de", deutschland: "de", de: "de",
  france: "fr", fr: "fr",
  spain: "es", españa: "es", es: "es",
  italy: "it", italia: "it", it: "it",
  netherlands: "nl", nl: "nl",
  poland: "pl", polska: "pl", pl: "pl",
  sweden: "se", se: "se",
  norway: "no", no: "no",
  denmark: "dk", dk: "dk",
  turkey: "tr", türkiye: "tr", tr: "tr",

  // Americas
  "united states": "us", usa: "us", us: "us",
  canada: "ca", ca: "ca",
  brazil: "br", brasil: "br", br: "br",
  mexico: "mx", méxico: "mx", mx: "mx",
  argentina: "ar", ar: "ar",

  // Asia-Pacific
  china: "cn", cn: "cn",
  japan: "jp", jp: "jp",
  "south korea": "kr", korea: "kr", kr: "kr",
  india: "in", in: "in",
  australia: "au", au: "au",
  "new zealand": "nz", nz: "nz",
  uae: "ae", emirates: "ae", ae: "ae",
  "saudi arabia": "sa", sa: "sa",
};

export function countryToGl(country: string): string {
  const key = country.toLowerCase().trim();
  return COUNTRY_TO_GL[key] ?? "us"; // default to US if unknown
}

// ─── Country → preferred marketplaces ─────────────────────────────────────────

type MarketplaceConfig = {
  // Site operators for SerpAPI — undefined when the stores aren't in Google Shopping
  siteOperators: string | undefined;
  // Human-readable names for the report
  names: string[];
  // Language for search queries (en = English queries, ru = Russian)
  queryLanguage: "en" | "ru";
};

export const COUNTRY_MARKETPLACES: Record<string, MarketplaceConfig> = {
  ru: {
    // Wildberries, Ozon, Lamoda are NOT indexed in Google Shopping (Yandex-based).
    // No site operators — rely on gl=ru geotargeting to show available products.
    siteOperators: undefined,
    names: ["Wildberries", "Ozon", "Lamoda"],
    queryLanguage: "ru",
  },
  ua: {
    siteOperators: undefined,
    names: ["Rozetka", "Kasta", "Answear"],
    queryLanguage: "ru",
  },
  kz: {
    // Wildberries KZ and Kaspi are NOT in Google Shopping merchant feed.
    // gl=kz + hl=ru is enough — Google Shopping returns what ships to KZ.
    siteOperators: undefined,
    names: ["Wildberries KZ", "Kaspi", "Lamoda"],
    queryLanguage: "ru",
  },
  by: {
    siteOperators: undefined,
    names: ["Wildberries BY", "Ozon BY"],
    queryLanguage: "ru",
  },
  gb: {
    // site: operators don't function as merchant filters in Google Shopping — gl=gb handles geo.
    siteOperators: undefined,
    names: ["ASOS", "Next", "M&S", "Zara"],
    queryLanguage: "en",
  },
  us: {
    siteOperators: undefined,
    names: ["ASOS", "Nordstrom", "Zara", "H&M"],
    queryLanguage: "en",
  },
  de: {
    siteOperators: undefined,
    names: ["Zalando", "ASOS", "Zara", "H&M"],
    queryLanguage: "en",
  },
  fr: {
    siteOperators: undefined,
    names: ["Zalando", "ASOS", "Zara", "Sandro"],
    queryLanguage: "en",
  },
  tr: {
    siteOperators: undefined,
    names: ["Trendyol", "Hepsiburada", "LC Waikiki"],
    queryLanguage: "en",
  },
  ae: {
    siteOperators: undefined,
    names: ["Namshi", "Ounass", "Sivvi"],
    queryLanguage: "en",
  },
  au: {
    siteOperators: undefined,
    names: ["The Iconic", "ASOS", "Glassons"],
    queryLanguage: "en",
  },
};

export function getMarketplaces(gl: string): MarketplaceConfig {
  return COUNTRY_MARKETPLACES[gl] ?? COUNTRY_MARKETPLACES.us;
}

export function isRussianMarket(gl: string): boolean {
  return ["ru", "kz", "by", "ua"].includes(gl.toLowerCase());
}

// Google Shopping has very limited coverage for kz/by/ua.
// Redirect CIS non-Russia codes to gl=ru which has full Wildberries/Ozon/Zara indexing.
export function getSerpApiGl(gl: string): string {
  const cis = new Set(["kz", "by", "ua"]);
  return cis.has(gl.toLowerCase()) ? "ru" : gl.toLowerCase();
}

// ─── Season-aware clothing vocabulary ─────────────────────────────────────────

// Appends season-appropriate fabric/weight keywords to a clothing search query
export function addSeasonToQuery(query: string, season: ClothingSeason): string {
  const seasonTerms: Record<ClothingSeason, string> = {
    winter: "warm wool knit",
    autumn: "lightweight layer",
    spring: "light cotton linen",
    summer: "linen cotton breathable",
  };
  // Only add if the query doesn't already mention a fabric
  const hasFabric = /wool|knit|linen|cotton|silk|cashmere|jersey/.test(query);
  if (hasFabric) return query;
  return `${query} ${seasonTerms[season]}`;
}

// Season context string for the report prompt
export function buildSeasonContext(
  season: ClothingSeason,
  gl: string,
  city?: string
): string {
  const marketplaces = getMarketplaces(gl);
  const locationLabel = city
    ? `${city} (${gl.toUpperCase()})`
    : gl.toUpperCase();

  const isRu = marketplaces.queryLanguage === "ru";
  const queryLangNote = isRu
    ? `QUERY LANGUAGE: Russian (ru). ALL search queries MUST be in Russian.
Every searchQuery field must use Russian words — this is required for results to appear on ${marketplaces.names.join(", ")}.
Examples: "платье миди терракота трикотаж", "широкие брюки высокая талия шерсть", "пальто оверсайз бежевый", "блузка льняная молочная".
Do NOT write English search queries for this user. Russian queries are mandatory.`
    : `QUERY LANGUAGE: English queries.`;

  return `LOCATION: ${locationLabel}
CURRENT SEASON: ${season} — all clothing recommendations must be wearable right now in this climate.
AVAILABLE MARKETPLACES: ${marketplaces.names.join(", ")} — search queries must work on these platforms.
${queryLangNote}`;
}
