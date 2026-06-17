import { SUB_SEASONS } from "./landing-data.ts";
import type {
  BodyType,
  BudgetPref,
  ClimatePref,
  HeightRange,
  OccasionPref,
  WardrobeType,
  WeightRange,
} from "./quiz-data.ts";

export type ShoppingSeasonId = "spring" | "summer" | "autumn" | "winter";
export type ShoppingMerchant = "ASOS" | "H&M" | "Nordstrom" | "Amazon" | "Sephora";
export type ShoppingIntentCategory =
  | "tops"
  | "bottoms"
  | "jackets"
  | "coats"
  | "dresses"
  | "shoes"
  | "bags"
  | "jewelry"
  | "makeup"
  | "accessories";
export type ShoppingPlacement = "near-face" | "away-from-face" | "full-look" | "accent";
export type ShoppingVerdict = "great" | "good-with-styling" | "maybe";

export type ShoppingIntent = {
  id: string;
  title: string;
  category: ShoppingIntentCategory;
  merchant: ShoppingMerchant;
  merchantSearchUrl: string;
  searchQuery: string;
  colorName: string;
  hex: string;
  seasonIds: ShoppingSeasonId[];
  subSeasonIds: string[];
  subSeasonNames: string[];
  styleTags: string[];
  trendTags: string[];
  wardrobeTypes: WardrobeType[];
  bodyTypes: BodyType[];
  useCareBodyTypes: BodyType[];
  heightRanges: HeightRange[];
  weightRanges: WeightRange[];
  occasions: OccasionPref[];
  budgetPrefs: BudgetPref[];
  climatePrefs: ClimatePref[];
  placement: ShoppingPlacement;
  sourceType: "search-intent";
  reason: string;
  fitNote: string;
};

type ColorDirection = {
  seasonId: ShoppingSeasonId;
  subSeasonId: string;
  colorName: string;
  hex: string;
  words: string[];
};

type IntentTemplate = {
  key: string;
  noun: string;
  queryNoun: string;
  category: ShoppingIntentCategory;
  merchant: ShoppingMerchant;
  styleTags: string[];
  trendTags: string[];
  wardrobeTypes: WardrobeType[];
  bodyTypes: BodyType[];
  useCareBodyTypes?: BodyType[];
  heightRanges?: HeightRange[];
  weightRanges?: WeightRange[];
  occasions: OccasionPref[];
  budgetPrefs?: BudgetPref[];
  climatePrefs?: ClimatePref[];
  placement: ShoppingPlacement;
  reason: string;
  fitNote: string;
};

const ALL_HEIGHTS: HeightRange[] = ["under-160", "160-170", "over-170"];
const ALL_WEIGHTS: WeightRange[] = ["under-55", "55-75", "over-75"];
const ALL_BUDGETS: BudgetPref[] = ["budget", "mid", "no-limit"];
const ALL_CLIMATES: ClimatePref[] = ["hot", "four-seasons", "cold"];
const ALL_BODY_TYPES: BodyType[] = [
  "hourglass",
  "pear",
  "apple",
  "rectangle",
  "inverted-triangle",
];

const COLOR_DIRECTIONS: ColorDirection[] = [
  { seasonId: "spring", subSeasonId: "light-spring", colorName: "peach cream", hex: "#FFDAB9", words: ["light", "warm", "fresh"] },
  { seasonId: "spring", subSeasonId: "light-spring", colorName: "honey ivory", hex: "#FFE4B5", words: ["soft", "warm", "clear"] },
  { seasonId: "spring", subSeasonId: "light-spring", colorName: "clear aqua", hex: "#7DDDE2", words: ["light", "clear", "playful"] },
  { seasonId: "spring", subSeasonId: "light-spring", colorName: "warm petal pink", hex: "#FD9FAF", words: ["warm", "light", "lively"] },
  { seasonId: "spring", subSeasonId: "true-spring", colorName: "warm coral", hex: "#F4936A", words: ["warm", "clear", "glowing"] },
  { seasonId: "spring", subSeasonId: "true-spring", colorName: "butter yellow", hex: "#F7DC6F", words: ["sunny", "warm", "fresh"] },
  { seasonId: "spring", subSeasonId: "true-spring", colorName: "marigold", hex: "#C09B30", words: ["golden", "warm", "clean"] },
  { seasonId: "spring", subSeasonId: "true-spring", colorName: "clear turquoise", hex: "#7DDDE2", words: ["clear", "warm", "bright"] },
  { seasonId: "spring", subSeasonId: "bright-spring", colorName: "mandarin", hex: "#F4784A", words: ["bright", "warm", "bold"] },
  { seasonId: "spring", subSeasonId: "bright-spring", colorName: "hot coral", hex: "#FF6F61", words: ["vivid", "warm", "clean"] },
  { seasonId: "spring", subSeasonId: "bright-spring", colorName: "clear apple green", hex: "#76B947", words: ["clear", "lively", "warm"] },
  { seasonId: "spring", subSeasonId: "bright-spring", colorName: "bright teal", hex: "#00A6A6", words: ["vivid", "clear", "fresh"] },

  { seasonId: "summer", subSeasonId: "light-summer", colorName: "powder blue", hex: "#AECBCB", words: ["cool", "light", "soft"] },
  { seasonId: "summer", subSeasonId: "light-summer", colorName: "pale lilac", hex: "#D5C6E0", words: ["cool", "light", "delicate"] },
  { seasonId: "summer", subSeasonId: "light-summer", colorName: "soft rose", hex: "#D4A5A5", words: ["cool", "soft", "gentle"] },
  { seasonId: "summer", subSeasonId: "light-summer", colorName: "misty blue", hex: "#C6D7E5", words: ["airy", "cool", "quiet"] },
  { seasonId: "summer", subSeasonId: "true-summer", colorName: "muted blue", hex: "#89A7C3", words: ["cool", "balanced", "soft"] },
  { seasonId: "summer", subSeasonId: "true-summer", colorName: "cool mauve", hex: "#B8A9C9", words: ["cool", "polished", "muted"] },
  { seasonId: "summer", subSeasonId: "true-summer", colorName: "rose taupe", hex: "#9E8080", words: ["cool", "subtle", "elegant"] },
  { seasonId: "summer", subSeasonId: "true-summer", colorName: "steel blue", hex: "#9DB4C0", words: ["cool", "classic", "muted"] },
  { seasonId: "summer", subSeasonId: "soft-summer", colorName: "dusty rose", hex: "#D4A5A5", words: ["muted", "cool", "soft"] },
  { seasonId: "summer", subSeasonId: "soft-summer", colorName: "smoky lavender", hex: "#B8A9C9", words: ["muted", "cool", "low-contrast"] },
  { seasonId: "summer", subSeasonId: "soft-summer", colorName: "soft teal grey", hex: "#7FA3A0", words: ["muted", "cool", "complex"] },
  { seasonId: "summer", subSeasonId: "soft-summer", colorName: "mushroom rose", hex: "#A58E8E", words: ["muted", "neutral-cool", "quiet"] },

  { seasonId: "autumn", subSeasonId: "soft-autumn", colorName: "mushroom taupe", hex: "#8B7355", words: ["muted", "warm", "soft"] },
  { seasonId: "autumn", subSeasonId: "soft-autumn", colorName: "soft olive", hex: "#7D8C4A", words: ["muted", "earthy", "warm"] },
  { seasonId: "autumn", subSeasonId: "soft-autumn", colorName: "clay rose", hex: "#A05C3C", words: ["muted", "warm", "earthy"] },
  { seasonId: "autumn", subSeasonId: "soft-autumn", colorName: "warm sand", hex: "#C2A477", words: ["soft", "warm", "easy"] },
  { seasonId: "autumn", subSeasonId: "true-autumn", colorName: "terracotta", hex: "#C4622D", words: ["warm", "earthy", "rich"] },
  { seasonId: "autumn", subSeasonId: "true-autumn", colorName: "dark gold", hex: "#B8860B", words: ["golden", "warm", "rich"] },
  { seasonId: "autumn", subSeasonId: "true-autumn", colorName: "moss green", hex: "#7D8C4A", words: ["earthy", "warm", "grounded"] },
  { seasonId: "autumn", subSeasonId: "true-autumn", colorName: "burnt sienna", hex: "#A05C3C", words: ["warm", "rustic", "saturated"] },
  { seasonId: "autumn", subSeasonId: "dark-autumn", colorName: "chocolate brown", hex: "#7A4A30", words: ["deep", "warm", "smoky"] },
  { seasonId: "autumn", subSeasonId: "dark-autumn", colorName: "deep olive", hex: "#4F5B35", words: ["deep", "earthy", "warm"] },
  { seasonId: "autumn", subSeasonId: "dark-autumn", colorName: "oxblood", hex: "#5A1F1B", words: ["deep", "warm", "dramatic"] },
  { seasonId: "autumn", subSeasonId: "dark-autumn", colorName: "espresso", hex: "#3B2416", words: ["deep", "warm", "rich"] },

  { seasonId: "winter", subSeasonId: "dark-winter", colorName: "deep navy", hex: "#1B2A4A", words: ["deep", "cool", "crisp"] },
  { seasonId: "winter", subSeasonId: "dark-winter", colorName: "dark plum", hex: "#5F2566", words: ["deep", "cool", "dramatic"] },
  { seasonId: "winter", subSeasonId: "dark-winter", colorName: "black cherry", hex: "#4A0E1B", words: ["deep", "cool", "clear"] },
  { seasonId: "winter", subSeasonId: "dark-winter", colorName: "charcoal black", hex: "#15151A", words: ["deep", "neutral-cool", "sharp"] },
  { seasonId: "winter", subSeasonId: "true-winter", colorName: "true red", hex: "#C20018", words: ["cool", "clear", "classic"] },
  { seasonId: "winter", subSeasonId: "true-winter", colorName: "icy white", hex: "#F0F4F8", words: ["cool", "icy", "clean"] },
  { seasonId: "winter", subSeasonId: "true-winter", colorName: "royal blue", hex: "#0047AB", words: ["cool", "clear", "saturated"] },
  { seasonId: "winter", subSeasonId: "true-winter", colorName: "blue-based raspberry", hex: "#C7338A", words: ["cool", "vivid", "polished"] },
  { seasonId: "winter", subSeasonId: "bright-winter", colorName: "cobalt", hex: "#0047AB", words: ["bright", "cool", "electric"] },
  { seasonId: "winter", subSeasonId: "bright-winter", colorName: "fuchsia", hex: "#C7338A", words: ["bright", "cool", "bold"] },
  { seasonId: "winter", subSeasonId: "bright-winter", colorName: "icy lavender", hex: "#D8C8E8", words: ["icy", "bright", "cool"] },
  { seasonId: "winter", subSeasonId: "bright-winter", colorName: "patent black", hex: "#0A0A0A", words: ["sharp", "bright", "high-contrast"] },
];

const TEMPLATES: IntentTemplate[] = [
  {
    key: "structured-blazer",
    noun: "structured blazer",
    queryNoun: "structured blazer",
    category: "jackets",
    merchant: "Nordstrom",
    styleTags: ["classic", "office", "minimalist", "quiet-luxury"],
    trendTags: ["new-formality", "old-money", "quiet-luxury"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ["hourglass", "pear", "rectangle", "apple"],
    useCareBodyTypes: ["inverted-triangle"],
    occasions: ["work", "events", "everything"],
    placement: "near-face",
    reason: "A blazer gives the color high visibility near the face, so palette fit matters.",
    fitNote: "Choose a softer shoulder if your shoulders are already the widest point.",
  },
  {
    key: "ribbed-knit",
    noun: "ribbed knit top",
    queryNoun: "ribbed knit top",
    category: "tops",
    merchant: "ASOS",
    styleTags: ["minimalist", "classic", "casual", "romantic"],
    trendTags: ["elevated-basics", "quiet-luxury"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["casual", "work", "home", "everything"],
    placement: "near-face",
    reason: "A knit top is an easy palette anchor because it sits close to the skin.",
    fitNote: "Rib texture adds shape without needing a tight fit.",
  },
  {
    key: "wide-leg-trousers",
    noun: "wide-leg tailored trousers",
    queryNoun: "wide leg tailored trousers",
    category: "bottoms",
    merchant: "H&M",
    styleTags: ["classic", "office", "minimalist", "streetwear"],
    trendTags: ["new-formality", "relaxed-tailoring"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ["inverted-triangle", "rectangle", "hourglass", "apple"],
    useCareBodyTypes: ["pear"],
    occasions: ["work", "casual", "travel", "everything"],
    placement: "away-from-face",
    reason: "Trousers can carry a trend color even when the shade is slightly outside the user's safest face colors.",
    fitNote: "Wide legs balance stronger shoulders and skim the midsection.",
  },
  {
    key: "straight-leg-denim",
    noun: "straight-leg denim",
    queryNoun: "straight leg denim jeans",
    category: "bottoms",
    merchant: "ASOS",
    styleTags: ["casual", "streetwear", "classic", "minimalist"],
    trendTags: ["dark-denim", "90s-minimal"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["casual", "travel", "everything"],
    placement: "away-from-face",
    reason: "Straight-leg denim is versatile and lets the palette show through styling instead of a loud silhouette.",
    fitNote: "Straight legs are the safest first denim cut across most body shapes.",
  },
  {
    key: "silk-shirt",
    noun: "silk-effect shirt",
    queryNoun: "silk shirt",
    category: "tops",
    merchant: "Nordstrom",
    styleTags: ["classic", "office", "minimalist", "romantic"],
    trendTags: ["quiet-luxury", "literary-chic"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["work", "dates", "events", "everything"],
    placement: "near-face",
    reason: "A smooth shirt reflects light near the face, so the color should harmonize with undertone and contrast.",
    fitNote: "A fluid shirt can soften angular lines or skim the waist without clinging.",
  },
  {
    key: "relaxed-overshirt",
    noun: "relaxed overshirt",
    queryNoun: "relaxed overshirt",
    category: "jackets",
    merchant: "ASOS",
    styleTags: ["streetwear", "casual", "eclectic", "minimalist"],
    trendTags: ["workwear", "layered-basics"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ["pear", "rectangle", "hourglass", "apple"],
    useCareBodyTypes: ["inverted-triangle"],
    occasions: ["casual", "travel", "home", "everything"],
    placement: "near-face",
    reason: "An overshirt is a practical color layer that can make basics feel intentional.",
    fitNote: "Keep the shoulder line easy rather than bulky if you want less width on top.",
  },
  {
    key: "slip-skirt",
    noun: "satin slip skirt",
    queryNoun: "satin slip skirt",
    category: "bottoms",
    merchant: "ASOS",
    styleTags: ["romantic", "classic", "eclectic", "minimalist"],
    trendTags: ["90s-minimal", "soft-polish"],
    wardrobeTypes: ["womenswear", "both", "unisex"],
    bodyTypes: ["rectangle", "hourglass", "inverted-triangle"],
    useCareBodyTypes: ["pear", "apple"],
    occasions: ["dates", "events", "work", "everything"],
    placement: "away-from-face",
    reason: "A slip skirt gives a trend color movement without forcing it close to the face.",
    fitNote: "Bias-cut satin can cling at the hip, so pear shapes may prefer heavier satin or an A-line skirt.",
  },
  {
    key: "midi-dress",
    noun: "midi dress",
    queryNoun: "midi dress",
    category: "dresses",
    merchant: "ASOS",
    styleTags: ["romantic", "classic", "bohemian", "office"],
    trendTags: ["day-to-night", "resort-polish"],
    wardrobeTypes: ["womenswear", "both"],
    bodyTypes: ["hourglass", "pear", "rectangle", "apple"],
    occasions: ["dates", "events", "work", "everything"],
    placement: "full-look",
    reason: "A dress is a full color statement, so palette fit creates an immediate impression.",
    fitNote: "Wrap, column, and gentle A-line shapes are the safest first dress cuts.",
  },
  {
    key: "utility-jacket",
    noun: "utility jacket",
    queryNoun: "utility jacket",
    category: "jackets",
    merchant: "H&M",
    styleTags: ["streetwear", "casual", "eclectic", "classic"],
    trendTags: ["workwear", "utility", "city-outdoor"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ["pear", "rectangle", "hourglass", "apple"],
    useCareBodyTypes: ["inverted-triangle"],
    occasions: ["casual", "travel", "everything"],
    placement: "near-face",
    reason: "A utility jacket is trend-relevant but still wearable when the color belongs to the palette.",
    fitNote: "Use a drawstring or shorter length if you need more waist definition.",
  },
  {
    key: "fine-knit-polo",
    noun: "fine knit polo",
    queryNoun: "fine knit polo",
    category: "tops",
    merchant: "H&M",
    styleTags: ["classic", "office", "minimalist", "casual"],
    trendTags: ["literary-chic", "preppy", "quiet-luxury"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["work", "casual", "travel", "everything"],
    placement: "near-face",
    reason: "A knit polo makes a palette color look considered instead of basic.",
    fitNote: "A flat knit is easier than chunky texture when you want a cleaner torso line.",
  },
  {
    key: "column-skirt",
    noun: "column skirt",
    queryNoun: "column skirt",
    category: "bottoms",
    merchant: "Nordstrom",
    styleTags: ["office", "classic", "minimalist", "romantic"],
    trendTags: ["new-formality", "90s-minimal"],
    wardrobeTypes: ["womenswear", "both"],
    bodyTypes: ["rectangle", "hourglass", "inverted-triangle"],
    useCareBodyTypes: ["pear", "apple"],
    occasions: ["work", "events", "dates"],
    placement: "away-from-face",
    reason: "A column skirt is a polished way to use palette color below the face.",
    fitNote: "Choose stretch or a back slit if you need more hip room.",
  },
  {
    key: "clean-sneakers",
    noun: "clean sneakers",
    queryNoun: "clean sneakers",
    category: "shoes",
    merchant: "Amazon",
    styleTags: ["casual", "streetwear", "minimalist", "classic"],
    trendTags: ["90s-minimal", "travel-uniform"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["casual", "travel", "gym", "everything"],
    placement: "accent",
    reason: "Shoes can repeat the palette without overpowering the face.",
    fitNote: "A low-profile sole keeps the look clean; a chunkier sole adds balance for broader shoulders.",
  },
  {
    key: "loafers",
    noun: "sleek loafers",
    queryNoun: "sleek loafers",
    category: "shoes",
    merchant: "Nordstrom",
    styleTags: ["classic", "office", "minimalist", "literary-chic"],
    trendTags: ["literary-chic", "old-money", "quiet-luxury"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["work", "casual", "travel", "everything"],
    placement: "accent",
    reason: "Loafers make the palette feel intentional in an outfit without needing another top.",
    fitNote: "Pointed or almond toes elongate; round toes feel softer and more casual.",
  },
  {
    key: "crossbody-bag",
    noun: "compact crossbody bag",
    queryNoun: "crossbody bag",
    category: "bags",
    merchant: "Nordstrom",
    styleTags: ["classic", "minimalist", "streetwear", "eclectic"],
    trendTags: ["hands-free", "quiet-luxury"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["casual", "travel", "dates", "everything"],
    placement: "accent",
    reason: "A bag is a low-risk way to test a palette color before buying a larger piece.",
    fitNote: "Adjust strap length so the bag does not stop at the body area you prefer not to emphasize.",
  },
  {
    key: "belt",
    noun: "minimal belt",
    queryNoun: "minimal belt",
    category: "accessories",
    merchant: "Amazon",
    styleTags: ["classic", "minimalist", "office", "casual"],
    trendTags: ["quiet-luxury", "capsule-basic"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ["hourglass", "rectangle", "pear", "inverted-triangle"],
    useCareBodyTypes: ["apple"],
    occasions: ["work", "casual", "everything"],
    placement: "accent",
    reason: "A belt repeats the palette and can make an outfit feel finished.",
    fitNote: "Use a lower-contrast belt if you do not want the waist to be the focal point.",
  },
  {
    key: "hoops",
    noun: "polished hoop earrings",
    queryNoun: "hoop earrings",
    category: "jewelry",
    merchant: "Amazon",
    styleTags: ["classic", "romantic", "minimalist", "eclectic"],
    trendTags: ["everyday-jewelry", "quiet-luxury"],
    wardrobeTypes: ["womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["work", "dates", "events", "everything"],
    placement: "near-face",
    reason: "Earrings sit beside the face, so metal warmth and color temperature matter.",
    fitNote: "Scale the hoop to your features: smaller for subtle polish, larger for statement balance.",
  },
  {
    key: "lip-color",
    noun: "lip color",
    queryNoun: "lipstick tinted balm",
    category: "makeup",
    merchant: "Sephora",
    styleTags: ["classic", "romantic", "minimalist", "eclectic", "office"],
    trendTags: ["soft-glam", "shade-matching"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["work", "dates", "events", "everything"],
    placement: "near-face",
    reason: "Lip color is the fastest way to test whether a palette shade works with undertone.",
    fitNote: "Choose a sheerer finish if the shade feels intense for daily wear.",
  },
  {
    key: "cream-blush",
    noun: "cream blush",
    queryNoun: "cream blush",
    category: "makeup",
    merchant: "Sephora",
    styleTags: ["romantic", "minimalist", "classic", "casual"],
    trendTags: ["skin-first", "soft-glam"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["work", "casual", "dates", "everything"],
    placement: "near-face",
    reason: "Blush must match temperature and chroma because it blends directly into the skin.",
    fitNote: "Cream formulas are forgiving when you are testing a new shade family.",
  },
  {
    key: "textured-crochet",
    noun: "textured crochet knit",
    queryNoun: "textured crochet knit",
    category: "tops",
    merchant: "ASOS",
    styleTags: ["bohemian", "romantic", "eclectic", "casual"],
    trendTags: ["crochet", "resort", "summer-texture"],
    wardrobeTypes: ["womenswear", "both", "unisex"],
    bodyTypes: ["hourglass", "rectangle", "inverted-triangle"],
    useCareBodyTypes: ["pear", "apple"],
    heightRanges: ["160-170", "over-170"],
    climatePrefs: ["hot", "four-seasons"],
    occasions: ["casual", "travel", "events"],
    placement: "near-face",
    reason: "Crochet and open texture feel current when the color still belongs to the user's palette.",
    fitNote: "Open texture draws attention, so place it where you want the eye to go.",
  },
];

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function merchantSearchUrl(merchant: ShoppingMerchant, query: string): string {
  const encoded = encodeURIComponent(query);
  if (merchant === "ASOS") return `https://www.asos.com/search/?q=${encoded}`;
  if (merchant === "H&M") return `https://www2.hm.com/en_us/search-results.html?q=${encoded}`;
  if (merchant === "Nordstrom") return `https://www.nordstrom.com/sr?origin=keywordsearch&keyword=${encoded}`;
  if (merchant === "Sephora") return `https://www.sephora.com/search?keyword=${encoded}`;
  return `https://www.amazon.com/s?k=${encoded}`;
}

const subSeasonById = new Map(SUB_SEASONS.map((subSeason) => [subSeason.id, subSeason]));

function buildIntent(color: ColorDirection, template: IntentTemplate): ShoppingIntent {
  const subSeason = subSeasonById.get(color.subSeasonId);
  const title = `${color.colorName} ${template.noun}`;
  const searchQuery = `${color.colorName} ${template.queryNoun}`;
  const colorWords = color.words.join(", ");
  return {
    id: `${color.subSeasonId}-${slug(template.key)}-${slug(color.colorName)}`,
    title,
    category: template.category,
    merchant: template.merchant,
    merchantSearchUrl: merchantSearchUrl(template.merchant, searchQuery),
    searchQuery,
    colorName: color.colorName,
    hex: color.hex,
    seasonIds: [color.seasonId],
    subSeasonIds: [color.subSeasonId],
    subSeasonNames: subSeason ? [subSeason.name, ...subSeason.aliases] : [],
    styleTags: template.styleTags,
    trendTags: template.trendTags,
    wardrobeTypes: template.wardrobeTypes,
    bodyTypes: template.bodyTypes,
    useCareBodyTypes: template.useCareBodyTypes ?? [],
    heightRanges: template.heightRanges ?? ALL_HEIGHTS,
    weightRanges: template.weightRanges ?? ALL_WEIGHTS,
    occasions: template.occasions,
    budgetPrefs: template.budgetPrefs ?? ALL_BUDGETS,
    climatePrefs: template.climatePrefs ?? ALL_CLIMATES,
    placement: template.placement,
    sourceType: "search-intent",
    reason: `${template.reason} ${color.colorName} is ${colorWords}, which is why it belongs in ${subSeason?.name ?? color.seasonId} shopping directions.`,
    fitNote: template.fitNote,
  };
}

export const SHOPPING_INTENTS: ShoppingIntent[] = COLOR_DIRECTIONS.flatMap((color) =>
  TEMPLATES.map((template) => buildIntent(color, template))
);

export const SHOPPING_INTENT_CATEGORIES = new Set(SHOPPING_INTENTS.map((intent) => intent.category));
export const SHOPPING_INTENT_STYLE_TAGS = new Set(SHOPPING_INTENTS.flatMap((intent) => intent.styleTags));
