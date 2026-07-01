import type {
  ShoppingIntentCategory,
  ShoppingPlacement,
  ShoppingSeasonId,
} from "./shopping-intents.ts";
import type {
  BodyType,
  BudgetPref,
  ClimatePref,
  HeightRange,
  OccasionPref,
  WardrobeType,
  WeightRange,
} from "@/lib/quiz/quiz-data";

export type CuratedRetailer = "UNIQLO" | "adidas" | "Sephora";

export type CuratedProduct = {
  id: string;
  title: string;
  brand: string;
  retailer: CuratedRetailer;
  productUrl: string;
  imageUrl?: string;
  productPageVerifiedAt: string;
  category: ShoppingIntentCategory;
  colorName: string;
  hex: string;
  seasonIds: ShoppingSeasonId[];
  subSeasonIds: string[];
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
  sourceType: "curated-product";
  reason: string;
  fitNote: string;
};

type ProductVariant = {
  key: string;
  colorName: string;
  hex: string;
  seasonIds: ShoppingSeasonId[];
  subSeasonIds: string[];
  styleTags?: string[];
  trendTags?: string[];
};

type ProductBase = {
  key: string;
  title: string;
  brand: string;
  retailer: CuratedRetailer;
  productUrl: string;
  imageUrl?: string;
  category: ShoppingIntentCategory;
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
  variants: ProductVariant[];
};

const VERIFIED_AT = "2026-06-17";

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

const NEUTRAL_WHITE: ProductVariant = {
  key: "white",
  colorName: "clean white",
  hex: "#F4F1EA",
  seasonIds: ["spring", "winter"],
  subSeasonIds: ["light-spring", "bright-spring", "true-winter", "bright-winter"],
};

const BLACK: ProductVariant = {
  key: "black",
  colorName: "black",
  hex: "#15151A",
  seasonIds: ["winter"],
  subSeasonIds: ["dark-winter", "true-winter", "bright-winter"],
};

const NAVY: ProductVariant = {
  key: "navy",
  colorName: "deep navy",
  hex: "#1B2A4A",
  seasonIds: ["winter", "summer"],
  subSeasonIds: ["dark-winter", "true-winter", "true-summer"],
};

const BROWN: ProductVariant = {
  key: "brown",
  colorName: "warm brown",
  hex: "#7A4A30",
  seasonIds: ["autumn"],
  subSeasonIds: ["soft-autumn", "true-autumn", "dark-autumn"],
};

const OLIVE: ProductVariant = {
  key: "olive",
  colorName: "olive green",
  hex: "#4F5B35",
  seasonIds: ["autumn"],
  subSeasonIds: ["soft-autumn", "true-autumn", "dark-autumn"],
};

const SOFT_PINK: ProductVariant = {
  key: "soft-pink",
  colorName: "soft pink",
  hex: "#D4A5A5",
  seasonIds: ["summer", "spring"],
  subSeasonIds: ["light-summer", "soft-summer", "light-spring"],
};

const COOL_GRAY: ProductVariant = {
  key: "cool-gray",
  colorName: "cool gray",
  hex: "#8A8F98",
  seasonIds: ["summer", "winter"],
  subSeasonIds: ["true-summer", "soft-summer", "dark-winter"],
};

const WARM_BEIGE: ProductVariant = {
  key: "warm-beige",
  colorName: "warm beige",
  hex: "#C2A477",
  seasonIds: ["spring", "autumn"],
  subSeasonIds: ["light-spring", "soft-autumn", "true-autumn"],
};

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function product(base: ProductBase, variant: ProductVariant): CuratedProduct {
  return {
    id: `curated-${slug(base.retailer)}-${slug(base.key)}-${slug(variant.key)}`,
    title: `${base.brand} ${base.title} - ${variant.colorName}`,
    brand: base.brand,
    retailer: base.retailer,
    productUrl: base.productUrl,
    imageUrl: base.imageUrl,
    productPageVerifiedAt: VERIFIED_AT,
    category: base.category,
    colorName: variant.colorName,
    hex: variant.hex,
    seasonIds: variant.seasonIds,
    subSeasonIds: variant.subSeasonIds,
    styleTags: [...base.styleTags, ...(variant.styleTags ?? [])],
    trendTags: [...base.trendTags, ...(variant.trendTags ?? [])],
    wardrobeTypes: base.wardrobeTypes,
    bodyTypes: base.bodyTypes,
    useCareBodyTypes: base.useCareBodyTypes ?? [],
    heightRanges: base.heightRanges ?? ALL_HEIGHTS,
    weightRanges: base.weightRanges ?? ALL_WEIGHTS,
    occasions: base.occasions,
    budgetPrefs: base.budgetPrefs ?? ALL_BUDGETS,
    climatePrefs: base.climatePrefs ?? ALL_CLIMATES,
    placement: base.placement,
    sourceType: "curated-product",
    reason: base.reason,
    fitNote: base.fitNote,
  };
}

const PRODUCT_BASES: ProductBase[] = [
  {
    key: "airism-oversized-tee",
    title: "AIRism Cotton Oversized T-Shirt",
    brand: "UNIQLO",
    retailer: "UNIQLO",
    productUrl: "https://www.uniqlo.com/us/en/products/E465185-000/00",
    imageUrl: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/465185/item/usgoods_00_465185_3x4.jpg",
    category: "tops",
    styleTags: ["minimalist", "casual", "streetwear", "classic"],
    trendTags: ["elevated-basics", "relaxed-tailoring", "capsule-basic"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["casual", "travel", "home", "everything"],
    budgetPrefs: ["budget", "mid"],
    climatePrefs: ["hot", "four-seasons"],
    placement: "near-face",
    reason: "A clean oversized tee is an easy first buy because it tests color close to the face without committing to a loud silhouette.",
    fitNote: "The boxy cut works best when balanced with straighter bottoms or a cleaner shoe.",
    variants: [
      NEUTRAL_WHITE,
      BLACK,
      BROWN,
      NAVY,
      SOFT_PINK,
      { key: "light-green", colorName: "light green", hex: "#AFCF9A", seasonIds: ["spring"], subSeasonIds: ["light-spring", "true-spring"] },
      { key: "soft-blue", colorName: "soft blue", hex: "#89A7C3", seasonIds: ["summer"], subSeasonIds: ["light-summer", "true-summer"] },
      COOL_GRAY,
    ],
  },
  {
    key: "airism-striped-tee",
    title: "AIRism Cotton Oversized Striped T-Shirt",
    brand: "UNIQLO",
    retailer: "UNIQLO",
    productUrl: "https://www.uniqlo.com/us/en/products/E461914-000/00",
    imageUrl: "https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/461914/item/goods_09_461914_3x4.jpg",
    category: "tops",
    styleTags: ["casual", "minimalist", "streetwear", "classic"],
    trendTags: ["stripe-basic", "90s-minimal", "capsule-basic"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ["rectangle", "hourglass", "pear", "apple"],
    useCareBodyTypes: ["inverted-triangle"],
    occasions: ["casual", "travel", "home", "everything"],
    budgetPrefs: ["budget", "mid"],
    climatePrefs: ["hot", "four-seasons"],
    placement: "near-face",
    reason: "A stripe makes a simple color feel more styled while still being easy to wear.",
    fitNote: "Horizontal stripes add visual width, so keep the rest of the outfit simple if your shoulders are already prominent.",
    variants: [
      BLACK,
      NEUTRAL_WHITE,
      WARM_BEIGE,
      BROWN,
      { key: "clear-blue", colorName: "clear blue", hex: "#407EC9", seasonIds: ["spring", "winter"], subSeasonIds: ["bright-spring", "bright-winter", "true-winter"] },
      NAVY,
    ],
  },
  {
    key: "pleated-wide-pants",
    title: "Pleated Wide Pants",
    brand: "UNIQLO",
    retailer: "UNIQLO",
    productUrl: "https://www.uniqlo.com/us/en/products/E460311-000/00",
    imageUrl: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/460311/item/usgoods_00_460311_3x4.jpg",
    category: "bottoms",
    styleTags: ["classic", "office", "minimalist", "quiet-luxury"],
    trendTags: ["relaxed-tailoring", "new-formality", "wide-leg"],
    wardrobeTypes: ["womenswear", "both", "unisex"],
    bodyTypes: ["rectangle", "hourglass", "apple", "inverted-triangle"],
    useCareBodyTypes: ["pear"],
    occasions: ["work", "casual", "travel", "everything"],
    budgetPrefs: ["budget", "mid"],
    climatePrefs: ["hot", "four-seasons"],
    placement: "away-from-face",
    reason: "Tailored wide pants make the recommendation feel more like a finished outfit than a random color pick.",
    fitNote: "Pleats add volume at the hip; pear shapes may prefer a softer front or a darker color.",
    variants: [
      BLACK,
      NEUTRAL_WHITE,
      COOL_GRAY,
      WARM_BEIGE,
      { key: "natural", colorName: "natural ivory", hex: "#DED2BD", seasonIds: ["spring", "autumn"], subSeasonIds: ["light-spring", "soft-autumn"] },
      { key: "green", colorName: "soft green", hex: "#7D8C4A", seasonIds: ["autumn"], subSeasonIds: ["soft-autumn", "true-autumn"] },
      OLIVE,
      NAVY,
    ],
  },
  {
    key: "heattech-tee",
    title: "HEATTECH T-Shirt",
    brand: "UNIQLO",
    retailer: "UNIQLO",
    productUrl: "https://www.uniqlo.com/us/en/products/E469742-000/00",
    imageUrl: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/469742/item/usgoods_00_469742_3x4.jpg",
    category: "tops",
    styleTags: ["minimalist", "classic", "casual", "office"],
    trendTags: ["layering", "capsule-basic"],
    wardrobeTypes: ["womenswear", "both"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["work", "casual", "home", "travel"],
    budgetPrefs: ["budget", "mid"],
    climatePrefs: ["four-seasons", "cold"],
    placement: "near-face",
    reason: "A fitted base layer is practical for cold seasons and makes palette-correct layering easier.",
    fitNote: "Keep it as a base layer under knits, shirts, and jackets if you prefer less body emphasis.",
    variants: [NEUTRAL_WHITE, COOL_GRAY, BLACK],
  },
  {
    key: "heattech-leggings",
    title: "HEATTECH Leggings",
    brand: "UNIQLO",
    retailer: "UNIQLO",
    productUrl: "https://www.uniqlo.com/us/en/products/E453166-000/00",
    imageUrl: "https://image.uniqlo.com/UQ/ST3/us/imagesgoods/453166/item/usgoods_00_453166_3x4.jpg",
    category: "bottoms",
    styleTags: ["minimalist", "casual", "classic"],
    trendTags: ["layering", "winter-basic"],
    wardrobeTypes: ["womenswear", "both"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["home", "travel", "casual"],
    budgetPrefs: ["budget", "mid"],
    climatePrefs: ["cold", "four-seasons"],
    placement: "away-from-face",
    reason: "Thermal leggings are a practical closet item that can support dresses, skirts, and long coats.",
    fitNote: "Use them as a warmth layer rather than a focal point if you want a more polished look.",
    variants: [BLACK, COOL_GRAY],
  },
  {
    key: "samba-og",
    title: "Samba OG Shoes",
    brand: "adidas",
    retailer: "adidas",
    productUrl: "https://www.adidas.com/us/samba-og-shoes/B75806.html",
    imageUrl: "https://assets.adidas.com/images/w_600,f_auto,q_auto/3bbecbdf584e40398446a8bf0117cf62_9366/Samba_OG_Shoes_White_B75806_01_00_standard.jpg",
    category: "shoes",
    styleTags: ["streetwear", "casual", "classic", "minimalist"],
    trendTags: ["samba", "low-profile-sneaker", "travel-uniform"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["casual", "travel", "everything"],
    budgetPrefs: ["mid", "no-limit"],
    climatePrefs: ALL_CLIMATES,
    placement: "accent",
    reason: "Low-profile sneakers are trend-relevant and let the palette show up through color accents.",
    fitNote: "A slim sneaker keeps outfits cleaner; choose a darker sole if you want less visual contrast at the feet.",
    variants: [
      NEUTRAL_WHITE,
      BLACK,
      NAVY,
      BROWN,
      OLIVE,
      { key: "clay-olive", colorName: "clay olive", hex: "#8B7355", seasonIds: ["autumn"], subSeasonIds: ["soft-autumn", "true-autumn", "dark-autumn"] },
      { key: "light-blue", colorName: "light blue", hex: "#89A7C3", seasonIds: ["summer"], subSeasonIds: ["light-summer", "true-summer"] },
      { key: "cream-green", colorName: "cream green", hex: "#D7D2B2", seasonIds: ["spring", "autumn"], subSeasonIds: ["light-spring", "soft-autumn"] },
    ],
  },
  {
    key: "gazelle",
    title: "Gazelle Shoes",
    brand: "adidas",
    retailer: "adidas",
    productUrl: "https://www.adidas.com/us/gazelle-shoes/BB5478.html",
    imageUrl: "https://assets.adidas.com/images/w_600,f_auto,q_auto/698e41ae0196408eb16aa7fb008046ad_9366/Gazelle_Shoes_Blue_BB5478_01_standard.jpg",
    category: "shoes",
    styleTags: ["classic", "streetwear", "casual", "retro"],
    trendTags: ["terrace-sneaker", "retro-sport", "low-profile-sneaker"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["casual", "travel", "everything"],
    budgetPrefs: ["mid", "no-limit"],
    climatePrefs: ALL_CLIMATES,
    placement: "accent",
    reason: "A suede sneaker can repeat palette color without taking over the outfit.",
    fitNote: "Use the shoe color as the outfit accent when the rest of the outfit is neutral.",
    variants: [
      NAVY,
      BLACK,
      { key: "burgundy", colorName: "burgundy", hex: "#5A1F1B", seasonIds: ["autumn", "winter"], subSeasonIds: ["dark-autumn", "dark-winter"] },
      COOL_GRAY,
      NEUTRAL_WHITE,
      BROWN,
    ],
  },
  {
    key: "campus-00s",
    title: "Campus 00s Shoes",
    brand: "adidas",
    retailer: "adidas",
    productUrl: "https://www.adidas.com/us/campus-00s-shoes/HQ8708.html",
    imageUrl: "https://assets.adidas.com/images/w_600,f_auto,q_auto/4659ee058ba34bd2a5d0af500104c17d_9366/Campus_00s_Shoes_Black_HQ8708_01_standard.jpg",
    category: "shoes",
    styleTags: ["streetwear", "casual", "eclectic"],
    trendTags: ["chunky-sneaker", "y2k", "campus"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ["pear", "hourglass", "rectangle", "apple"],
    useCareBodyTypes: ["inverted-triangle"],
    occasions: ["casual", "travel", "everything"],
    budgetPrefs: ["mid", "no-limit"],
    climatePrefs: ALL_CLIMATES,
    placement: "accent",
    reason: "A chunkier sneaker gives casual looks more intentional style energy.",
    fitNote: "Chunkier shoes balance wider hips well; if your shoulders are widest, pair them with a simpler top.",
    variants: [
      BLACK,
      OLIVE,
      { key: "scarlet", colorName: "scarlet red", hex: "#C20018", seasonIds: ["winter"], subSeasonIds: ["true-winter", "bright-winter"] },
      COOL_GRAY,
      NAVY,
      { key: "lucid-blue", colorName: "lucid blue", hex: "#5EA8D6", seasonIds: ["spring", "summer"], subSeasonIds: ["bright-spring", "light-summer"] },
    ],
  },
  {
    key: "handball-spezial",
    title: "Handball Spezial Shoes",
    brand: "adidas",
    retailer: "adidas",
    productUrl: "https://www.adidas.com/us/handball-spezial-shoes/IF6562.html",
    imageUrl: "https://assets.adidas.com/images/w_600,f_auto,q_auto/caa08574a1fc456c8021219bd1edad5a_9366/Handball_Spezial_Shoes_Beige_IF6562_01_standard.jpg",
    category: "shoes",
    styleTags: ["casual", "streetwear", "retro", "classic"],
    trendTags: ["terrace-sneaker", "low-profile-sneaker", "retro-sport"],
    wardrobeTypes: ["womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["casual", "travel", "dates", "everything"],
    budgetPrefs: ["mid", "no-limit"],
    climatePrefs: ALL_CLIMATES,
    placement: "accent",
    reason: "A Spezial-style sneaker gives a fashion-current shape with useful palette color options.",
    fitNote: "The lower profile is easy to style with wide pants, denim, or skirts.",
    variants: [
      WARM_BEIGE,
      COOL_GRAY,
      SOFT_PINK,
      { key: "royal-blue", colorName: "royal blue", hex: "#0047AB", seasonIds: ["winter"], subSeasonIds: ["true-winter", "bright-winter"] },
      OLIVE,
    ],
  },
  {
    key: "clinique-almost-lipstick",
    title: "Almost Lipstick",
    brand: "Clinique",
    retailer: "Sephora",
    productUrl: "https://www.sephora.com/product/almost-lipstick-P122751",
    imageUrl: "https://www.sephora.com/productimages/sku/s70680-main-zoom.jpg",
    category: "makeup",
    styleTags: ["classic", "minimalist", "romantic", "casual"],
    trendTags: ["tinted-balm", "soft-glam", "everyday-makeup"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["work", "casual", "dates", "everything"],
    budgetPrefs: ["mid", "no-limit"],
    climatePrefs: ALL_CLIMATES,
    placement: "near-face",
    reason: "A sheer lip color is an easy way to test palette harmony without a dramatic lipstick commitment.",
    fitNote: "Use one layer for daily softness or build it when the outfit needs more color near the face.",
    variants: [
      { key: "black-honey", colorName: "black honey berry", hex: "#5A1F1B", seasonIds: ["autumn", "winter"], subSeasonIds: ["dark-autumn", "dark-winter", "soft-autumn"] },
      { key: "pink-honey", colorName: "pink honey", hex: "#D4A5A5", seasonIds: ["summer", "spring"], subSeasonIds: ["light-summer", "soft-summer", "light-spring"] },
    ],
  },
  {
    key: "nars-radiant-creamy-concealer",
    title: "Radiant Creamy Concealer",
    brand: "NARS",
    retailer: "Sephora",
    productUrl: "https://www.sephora.com/product/radiant-creamy-concealer-P377873",
    imageUrl: "https://www.sephora.com/productimages/sku/s2172310-main-zoom.jpg",
    category: "makeup",
    styleTags: ["classic", "minimalist", "office", "soft-glam"],
    trendTags: ["skin-first", "base-makeup", "soft-glam"],
    wardrobeTypes: ["menswear", "womenswear", "both", "unisex"],
    bodyTypes: ALL_BODY_TYPES,
    occasions: ["work", "events", "dates", "everything"],
    budgetPrefs: ["mid", "no-limit"],
    climatePrefs: ALL_CLIMATES,
    placement: "near-face",
    reason: "A base product is not a season color, but it supports polished recommendations for users who want makeup guidance.",
    fitNote: "Shade match should be based on skin depth and undertone; PaletteMe should treat this as a retailer product page, not an exact shade diagnosis.",
    variants: [
      { key: "vanilla", colorName: "light neutral base", hex: "#D8B9A0", seasonIds: ["spring", "summer"], subSeasonIds: ["light-spring", "light-summer", "true-summer"] },
      { key: "custard", colorName: "medium warm base", hex: "#C99A68", seasonIds: ["spring", "autumn"], subSeasonIds: ["true-spring", "soft-autumn", "true-autumn"] },
      { key: "ginger", colorName: "medium golden base", hex: "#B47A55", seasonIds: ["autumn"], subSeasonIds: ["soft-autumn", "true-autumn", "dark-autumn"] },
      { key: "amande", colorName: "deep neutral base", hex: "#6F4733", seasonIds: ["autumn", "winter"], subSeasonIds: ["dark-autumn", "dark-winter"] },
    ],
  },
];

export const CURATED_PRODUCTS: CuratedProduct[] = PRODUCT_BASES.flatMap((base) =>
  base.variants.map((variant) => product(base, variant))
);

export const CURATED_PRODUCT_RETAILERS = new Set(CURATED_PRODUCTS.map((product) => product.retailer));
