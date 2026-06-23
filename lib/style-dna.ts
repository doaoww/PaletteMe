// Season hex palettes — earth tones for warm seasons, cool for cool seasons
const SEASON_PALETTES: Record<string, string[]> = {
  "True Winter": ["#1C1C2E","#2D2D44","#4A3728","#8B7355","#C4A882","#E8DDD0","#6B8CAE","#A8B8D0"],
  "Dark Winter": ["#1A1A2E","#2C1810","#4A2C2A","#7B4F3A","#C4956A","#E8D5C0","#3D3D5C","#8B8BB0"],
  "Bright Winter": ["#0D0D1A","#1A0D26","#2D1B4E","#5C3D8F","#9B59B6","#E8D5F0","#0A3D62","#1A8FD8"],
  "True Summer": ["#8B9DC3","#B8C5E0","#D4DCF0","#C8A8C8","#E0C8E0","#F0E8F0","#7A8FA0","#A8BCC8"],
  "Light Summer": ["#B8C8E0","#D0DCF0","#E8EEF8","#C8B8D0","#E0D4E8","#F0EEF8","#9FAEC0","#BFD0E0"],
  "Soft Summer": ["#9AAAB8","#B8C4D0","#D0D8E0","#B0A8B8","#C8C0CC","#E0DCE4","#8090A0","#A8B4C0"],
  "True Autumn": ["#8B4513","#A0522D","#C67C32","#D4892A","#E8A838","#F0C868","#6B3D1E","#9B6040"],
  "Dark Autumn": ["#2C1810","#4A2C1A","#6B3D28","#8B5E3C","#C4956A","#D4AA80","#A0522D","#6B4226"],
  "Soft Autumn": ["#8B7355","#A08060","#C4A882","#D4BCA0","#E8D4B8","#B89070","#9B7B5B","#C0A070"],
  "True Spring": ["#D4892A","#E8A838","#F0C868","#E8D878","#A8D890","#68B888","#F08860","#D87850"],
  "Light Spring": ["#F0C878","#F8D898","#FFE8B0","#F0E8A0","#C8E8A8","#A0D898","#F8B8A0","#F0D0C0"],
  "Bright Spring": ["#F05C28","#F87840","#FCA050","#F0C040","#D8E830","#80D840","#40C8C0","#20A8E0"],
};

const STYLE_VOCABULARY: Record<string, { vocabulary: string[]; avoid: string[] }> = {
  streetwear: {
    vocabulary: ["oversized", "cargo", "bomber", "hoodie", "jogger", "track", "boxy tee", "clean sneaker", "sweatshirt", "wide-leg", "utility", "nylon"],
    avoid: ["fitted blazer", "midi skirt", "romantic detail", "stiletto", "bodycon", "floral", "lace", "chiffon"],
  },
  minimalist: {
    vocabulary: ["structured", "clean seam", "tonal", "tailored", "column", "straight-leg", "unembellished", "monochrome", "sharp"],
    avoid: ["loud pattern", "excessive detail", "frilly", "oversized logo", "mixed prints", "embellished"],
  },
  classic: {
    vocabulary: ["blazer", "slim trouser", "button-down", "loafer", "trench coat", "knit", "tailored", "timeless", "investment"],
    avoid: ["trendy", "statement", "fast fashion silhouette", "graphic", "distressed"],
  },
  romantic: {
    vocabulary: ["wrap", "bias cut", "floral", "gathered", "silk", "ruffle", "flowing", "delicate", "soft"],
    avoid: ["stiff", "angular", "oversized", "utility", "structured", "boxy"],
  },
  office: {
    vocabulary: ["tailored", "blouse", "wide-leg trouser", "blazer", "pump", "structured bag", "slim", "polished"],
    avoid: ["casual", "logo", "distressed", "athletic", "sheer without layer"],
  },
  eclectic: {
    vocabulary: ["mixed", "layered", "textured", "statement", "pattern", "asymmetric", "bold", "expressive"],
    avoid: ["matchy-matchy", "safe", "boring neutral only"],
  },
};

const BUDGET_SIGNALS: Record<string, string[]> = {
  budget: ["affordable", "budget", "under £50", "high street"],
  mid: ["mid-range", "quality", "under £150"],
  "no-limit": ["luxury", "designer", "investment piece"],
};

export type StyleDNA = {
  styleDirection: string;
  vocabulary: string[];
  avoidVocabulary: string[];
  paletteHexes: string[];
  neutralHexes: string[];
  scale: "small" | "medium" | "large";
  fabricSignals: string[];
  occasionMix: string[];
  budgetTier: "budget" | "mid" | "no-limit";
  budgetSignals: string[];
  gender: string;
  colorSeason: string;
  pinterestQuery: string;
};

const KIBBE_SCALE: Record<string, "small" | "medium" | "large"> = {
  "Dramatic": "large",
  "Soft Dramatic": "large",
  "Flamboyant Natural": "large",
  "Natural": "large",
  "Soft Natural": "medium",
  "Dramatic Classic": "medium",
  "Classic": "medium",
  "Soft Classic": "medium",
  "Theatrical Romantic": "small",
  "Romantic": "small",
  "Flamboyant Gamine": "small",
  "Soft Gamine": "small",
  "Gamine": "small",
};

export function buildStyleDNA(
  styleProfile: {
    kibbeType: string;
    bestFabrics: string[];
    colorSeasonFamily?: string;
  },
  quiz: Record<string, unknown>,
  colorSeason: string,
  gender: string,
): StyleDNA {
  const styleDirection = (quiz.styleDirection as string | undefined) ?? "classic";
  const vocab = STYLE_VOCABULARY[styleDirection] ?? STYLE_VOCABULARY.classic;

  const paletteHexes = SEASON_PALETTES[colorSeason] ?? SEASON_PALETTES["True Summer"];
  // Neutrals = lighter/muted palette colors (last 2 in each array are typically neutrals)
  const neutralHexes = paletteHexes.slice(-3);

  const scale = KIBBE_SCALE[styleProfile.kibbeType] ?? "medium";

  const rawOccasion = quiz.occasionPref ?? quiz.occasions;
  const occasionMix = Array.isArray(rawOccasion)
    ? rawOccasion as string[]
    : rawOccasion ? [rawOccasion as string] : ["casual"];

  const rawBudget = (quiz.budget as string | undefined) ?? "mid";
  const budgetTier = (["budget", "mid", "no-limit"].includes(rawBudget)
    ? rawBudget
    : "mid") as "budget" | "mid" | "no-limit";

  const pinterestQuery = `${styleDirection} outfit ${colorSeason} editorial ${occasionMix[0]} ${gender}`;

  return {
    styleDirection,
    vocabulary: vocab.vocabulary,
    avoidVocabulary: vocab.avoid,
    paletteHexes,
    neutralHexes,
    scale,
    fabricSignals: styleProfile.bestFabrics ?? [],
    occasionMix,
    budgetTier,
    budgetSignals: BUDGET_SIGNALS[budgetTier],
    gender,
    colorSeason,
    pinterestQuery,
  };
}
