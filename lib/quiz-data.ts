import type { SeasonId } from "./analysis.ts";

export type StylingGoal =
  | "clothing-colors"
  | "capsule"
  | "seasonal-palette"
  | "makeup-hair";

export type WardrobeType = "menswear" | "womenswear" | "both" | "unisex";
export type StyleChallenge =
  | "dont-know-buy"
  | "never-wear"
  | "cant-combine"
  | "style-refresh";
export type SkinTone = "very-fair" | "fair" | "medium" | "olive" | "deep" | "very-deep";
export type SunReaction = "burns" | "burns-tans" | "tans" | "never-burns";
export type HairColor =
  | "black"
  | "dark-brown"
  | "brown"
  | "medium-brown"
  | "light-brown"
  | "warm-blonde"
  | "cool-blonde"
  | "blonde"
  | "red"
  | "grey-white";
export type EyeColor =
  | "dark-brown"
  | "warm-brown"
  | "hazel"
  | "green"
  | "blue-green"
  | "blue"
  | "grey";
export type HeightRange = "under-160" | "160-170" | "over-170";
export type WeightRange = "under-55" | "55-75" | "over-75";
export type ClimatePref = "hot" | "four-seasons" | "cold";
export type BodyShape =
  | "hourglass"
  | "bottom-hourglass"
  | "triangle"
  | "inverted-triangle"
  | "pear"
  | "rectangle"
  | "apple"
  | "diamond"
  | "athletic"
  | "trapezoid"
  | "oval"
  | "petite";
export type StyleDirection =
  | "minimalist"
  | "classic"
  | "streetwear"
  | "romantic"
  | "office"
  | "eclectic";
export type OccasionPref = "work" | "casual" | "dates" | "events" | "everything" | "nights-out" | "travel" | "gym" | "home";
export type MakeupPref = "yes" | "no" | "sometimes";
export type BudgetPref = "budget" | "mid" | "no-limit";
export type StyleVibe = "minimalist" | "classic" | "casual" | "feminine" | "edgy";
export type StyleTrend = "y2k" | "old-money" | "boho" | "retro" | "goth-lite" | "none";

// Phase 1 — color quiz
export type VeinColor = "blue-purple" | "green" | "greenish" | "mix";
export type MetalPref = "gold" | "silver" | "both";
export type EyeFamily = "cool" | "warm" | "both";
export type WhitePref = "white" | "cream";
export type ContrastPref = "high" | "medium" | "low";
export type IntensityPref = "vivid" | "muted";

// Phase 2 — body type
export type ShoulderHipRatio = "shoulders" | "same" | "hips";
export type WaistDefinition = "defined" | "soft" | "straight";
export type WeightGain = "upper" | "lower" | "middle" | "evenly";
export type BodyType =
  | "hourglass"
  | "pear"
  | "apple"
  | "rectangle"
  | "inverted-triangle";

// Phase 3 — style swipe
export type StyleSwipePick = "a" | "b";
export type StyleVector = {
  aesthetics: string[];
  fit: string[];
  occasions: string[];
};

export type QuizAnswers = {
  goal?: StylingGoal;
  wardrobeType?: WardrobeType;
  styleChallenge?: StyleChallenge;
  // Phase 1 quiz path
  skinTone?: SkinTone;
  veinColor?: VeinColor;
  metalPref?: MetalPref;
  sunReaction?: SunReaction;
  naturalHair?: "yes" | "no";
  naturalHairColor?: HairColor;
  eyeFamily?: EyeFamily;
  eyeColor?: EyeColor;
  whitePref?: WhitePref;
  contrastPref?: ContrastPref;
  intensityPref?: IntensityPref;
  // Phase 2
  shoulderHipRatio?: ShoulderHipRatio;
  waistDefinition?: WaistDefinition;
  weightGain?: WeightGain;
  // Phase 3
  styleVibe?: StyleVibe;
  stylePicks?: StyleSwipePick[];
  trends?: StyleTrend[];
  styleDirections?: StyleDirection[];
  occasions?: OccasionPref[];
  makeupPref?: MakeupPref;
  budgetPref?: BudgetPref;
  weightSkipped?: boolean;
  weightRange?: WeightRange;
  city?: string;
  climatePref?: ClimatePref;
  locationSkipped?: boolean;
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherUv?: number;
  // compat
  height?: HeightRange;
  bodyShape?: BodyShape;
};

// ─── Color quiz options ────────────────────────────────────────────────────

type Scores = Partial<Record<SeasonId, number>>;

const STITCH_WARDROBE_IMAGES = {
  womenswear:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDtqTgG5wQdYAvWKgkQGsB9VpO1azWYwuJtN34Oas_Ilk1f5LwIPMHPdRsWGHUHNn6GcaJj1KYMADHPNDwctPjHz2S1guTxgOizHSm9edA9bi-Fz6g04lZQGbTK-SQpzWyJ6ipgOXs_wytyJ5YNB8xp0LrJqSwQSTVGmu-KQ7-TauR5ZmRg6UwKaMY8Wd046cTlkNUtcjlm8Ch4MVV81ms3XA072eglQaYAMOOPImDIsyB_GYdg_UJIsM615PPHqJMFpdz_Vbw0dbLt",
  menswear:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBGzOoJrSttl0U6R1u8pQAjIsbtYOvN7MjnZZMz5ltxkpd9vhAmbourSVzHmxL49aAFO8TVq4MgesAcSjJHQWi0TfnVebIEef4121NXyoKj7gtNgd9hiuhp3N83ayoup2cC_ta5Kj92XLopVMM3dQnT9n8RoJ1XqqWO_uUH4yJ6pTpikDu1y4NSrlbJVMnYF7HpdlFFQrUNz9FwDwNfnWew1VdHYCMy0N2AyCrmk2z-1hRR5-WZnWzscbkc0JsC12aJcLWyAEYsO6ig",
} as const;

export const WARDROBE_TYPE_OPTIONS: {
  id: WardrobeType;
  label: string;
  sub: string;
  image?: string;
  frameTilt?: "left" | "right";
}[] = [
  {
    id: "menswear",
    label: "Menswear",
    sub: "shirts, trousers, suits, sneakers",
    image: STITCH_WARDROBE_IMAGES.menswear,
    frameTilt: "right",
  },
  {
    id: "womenswear",
    label: "Womenswear",
    sub: "dresses, blouses, skirts, heels",
    image: STITCH_WARDROBE_IMAGES.womenswear,
    frameTilt: "left",
  },
  { id: "both", label: "Both", sub: "I wear from both categories", frameTilt: "left" },
  {
    id: "unisex",
    label: "Unisex / Gender-neutral",
    sub: "I prefer styles that aren't gendered",
    frameTilt: "right",
  },
];

export const WARDROBE_TYPE_LABELS: Record<WardrobeType, string> = {
  menswear: "menswear",
  womenswear: "womenswear",
  both: "both menswear and womenswear",
  unisex: "unisex or gender-neutral",
};

export const STYLE_CHALLENGE_OPTIONS: {
  id: StyleChallenge;
  label: string;
  sub: string;
}[] = [
  {
    id: "dont-know-buy",
    label: "I don't know what to buy",
    sub: "I shop but nothing feels right",
  },
  {
    id: "never-wear",
    label: "I buy things but never wear them",
    sub: "My wardrobe is full but I feel stuck",
  },
  {
    id: "cant-combine",
    label: "I can't put outfits together",
    sub: "I have pieces but can't combine them",
  },
  {
    id: "style-refresh",
    label: "I want a full style refresh",
    sub: "I'm ready to change my whole look",
  },
];

export const STYLE_CHALLENGE_LABELS: Record<StyleChallenge, string> = {
  "dont-know-buy": "do not know what to buy",
  "never-wear": "buy things but never wear them",
  "cant-combine": "cannot put outfits together",
  "style-refresh": "full style refresh",
};

export const STYLE_CHALLENGE_RESULT_COPY: Record<StyleChallenge, string> = {
  "dont-know-buy":
    "Start with three anchor colors from your palette, then make every new item connect to at least one of them.",
  "never-wear":
    "Your next win is making the closet talk to itself. We will use your palette as the connector between pieces you already own.",
  "cant-combine":
    "The issue is usually temperature, contrast, or proportion mismatch. Once your wardrobe is added, PaletteMe can build combinations from what you already own.",
  "style-refresh":
    "Your palette becomes the base for a cleaner direction, so every new piece feels intentional instead of random.",
};

export const SKIN_TONE_OPTIONS: {
  id: SkinTone;
  label: string;
  sub: string;
  swatch: string;
}[] = [
  { id: "very-fair", label: "Very fair", sub: "porcelain, often cool-toned", swatch: "#F5D6C8" },
  { id: "fair", label: "Fair", sub: "light beige, warm or neutral", swatch: "#EBC2A6" },
  { id: "medium", label: "Medium", sub: "warm beige to light tan", swatch: "#C98F63" },
  { id: "olive", label: "Olive", sub: "yellow-green, tans easily", swatch: "#B9895F" },
  { id: "deep", label: "Deep", sub: "rich brown tones", swatch: "#754326" },
  { id: "very-deep", label: "Very deep", sub: "deep espresso to ebony", swatch: "#3D2115" },
];

export const VEIN_OPTIONS: {
  id: VeinColor;
  label: string;
  sub: string;
  swatch: string;
  scores: Scores;
  undertone: "warm" | "cool" | "neutral";
}[] = [
  {
    id: "blue-purple",
    label: "Blue or purple",
    sub: "cool undertone",
    swatch: "#8B89C8",
    scores: { summer: 2, winter: 2 },
    undertone: "cool",
  },
  {
    id: "green",
    label: "Greenish",
    sub: "warm undertone",
    swatch: "#6B8E4E",
    scores: { spring: 2, autumn: 2 },
    undertone: "warm",
  },
  {
    id: "mix",
    label: "Both / hard to tell",
    sub: "neutral",
    swatch: "#9B96A8",
    scores: { spring: 1, summer: 1, autumn: 1, winter: 1 },
    undertone: "neutral",
  },
];

export const METAL_OPTIONS: {
  id: MetalPref;
  label: string;
  swatch: string;
  scores: Scores;
}[] = [
  { id: "gold", label: "Gold", swatch: "#D4A574", scores: { spring: 2, autumn: 2 } },
  { id: "silver", label: "Silver", swatch: "#C0C0C0", scores: { summer: 2, winter: 2 } },
  {
    id: "both",
    label: "Both suit me equally",
    swatch: "#B8A89A",
    scores: { spring: 1, summer: 1, autumn: 1, winter: 1 },
  },
];

export const EYE_OPTIONS: {
  id: EyeFamily;
  label: string;
  sub: string;
  scores: Scores;
}[] = [
  {
    id: "cool",
    label: "Blue, grey or green",
    sub: "cool tones",
    scores: { summer: 2, winter: 1 },
  },
  {
    id: "warm",
    label: "Brown, hazel or amber",
    sub: "warm tones",
    scores: { spring: 1, autumn: 2 },
  },
  {
    id: "both",
    label: "Mixed / hard to tell",
    sub: "",
    scores: { spring: 1, summer: 1, autumn: 1, winter: 1 },
  },
];

export const EYE_COLOR_OPTIONS: {
  id: EyeColor;
  label: string;
  swatch: string;
}[] = [
  { id: "dark-brown", label: "Dark brown", swatch: "#2B170D" },
  { id: "warm-brown", label: "Warm brown", swatch: "#6B3F1D" },
  { id: "hazel", label: "Hazel", swatch: "#7C6A2D" },
  { id: "green", label: "Green", swatch: "#5F7D4A" },
  { id: "blue-green", label: "Blue-green", swatch: "#4E8C8A" },
  { id: "blue", label: "Blue", swatch: "#6E9BC8" },
  { id: "grey", label: "Grey", swatch: "#8D9297" },
];

export const WHITE_TEST_OPTIONS: {
  id: WhitePref;
  label: string;
  sub: string;
  scores: Scores;
}[] = [
  {
    id: "white",
    label: "Pure white",
    sub: "crisp and bright — glows next to my skin",
    scores: { winter: 2, summer: 1 },
  },
  {
    id: "cream",
    label: "Warm cream / ivory",
    sub: "softer, more natural on me",
    scores: { autumn: 2, spring: 1 },
  },
];

export const CONTRAST_OPTIONS: {
  id: ContrastPref;
  label: string;
  sub: string;
  scores: Scores;
}[] = [
  {
    id: "high",
    label: "High contrast",
    sub: "Dark hair with light skin, or very light hair with dark skin",
    scores: { winter: 2, spring: 1 },
  },
  {
    id: "medium",
    label: "Medium contrast",
    sub: "Some difference but not dramatic",
    scores: { spring: 1, summer: 1, autumn: 1 },
  },
  {
    id: "low",
    label: "Low contrast",
    sub: "Hair and skin are close in tone — both light, or both deep",
    scores: { summer: 2, autumn: 1 },
  },
];

export const INTENSITY_OPTIONS: {
  id: IntensityPref;
  label: string;
  sub: string;
  scores: Scores;
}[] = [
  {
    id: "vivid",
    label: "Vivid, saturated colors look great on me",
    sub: "bright colors feel energizing and flattering",
    scores: { spring: 2, winter: 2 },
  },
  {
    id: "muted",
    label: "Soft, muted tones suit me better",
    sub: "dusty or earthy shades feel more right",
    scores: { summer: 2, autumn: 2 },
  },
];

// ─── Body type options ─────────────────────────────────────────────────────

export const SHOULDER_HIP_OPTIONS: {
  id: ShoulderHipRatio;
  label: string;
  sub: string;
}[] = [
  { id: "shoulders", label: "Shoulders wider", sub: "shoulders broader than hips" },
  { id: "same", label: "About the same", sub: "balanced, even frame" },
  { id: "hips", label: "Hips wider", sub: "hips fuller than shoulders" },
];

export const WAIST_OPTIONS: {
  id: WaistDefinition;
  label: string;
  sub: string;
}[] = [
  { id: "defined", label: "Clearly defined", sub: "visible narrowing at the waist" },
  { id: "soft", label: "Slightly curved", sub: "subtle definition" },
  { id: "straight", label: "Little definition", sub: "straighter up and down" },
];

export const WEIGHT_GAIN_OPTIONS: {
  id: WeightGain;
  label: string;
  sub: string;
}[] = [
  { id: "upper", label: "Upper body", sub: "chest, arms, upper back" },
  { id: "lower", label: "Lower body", sub: "hips, thighs, rear" },
  { id: "middle", label: "Belly / middle", sub: "waist and tummy first" },
  { id: "evenly", label: "Evenly", sub: "distributed all over" },
];

export const BODY_TYPE_TIPS: Record<
  BodyType,
  { label: string; desc: string; tips: string[] }
> = {
  hourglass: {
    label: "Hourglass",
    desc: "Balanced shoulders and hips with a defined waist",
    tips: [
      "Fitted waist — wrap dresses and belted styles",
      "High-waisted bottoms to highlight your shape",
      "Avoid boxy or shapeless silhouettes",
    ],
  },
  pear: {
    label: "Pear",
    desc: "Hips wider than shoulders with definition at the waist",
    tips: [
      "A-line and flared skirts to balance proportions",
      "Statement tops and off-shoulder styles",
      "Wide-leg or straight-leg trousers",
    ],
  },
  apple: {
    label: "Apple",
    desc: "Fuller midsection with narrower hips",
    tips: [
      "Empire waist and V-neck styles lengthen",
      "Flowy tunics and wrap tops",
      "Straight-leg and bootcut to balance",
    ],
  },
  rectangle: {
    label: "Rectangle",
    desc: "Shoulders and hips roughly the same width",
    tips: [
      "Ruffles, peplums and texture create curves",
      "Belted and wrap styles define the waist",
      "High-waisted bottoms and cropped tops",
    ],
  },
  "inverted-triangle": {
    label: "Inverted Triangle",
    desc: "Shoulders wider than hips",
    tips: [
      "A-line and full skirts add volume below",
      "Wide-leg trousers to balance proportions",
      "V-necks and soft necklines to soften shoulders",
    ],
  },
};

// ─── Style swipe pairs ─────────────────────────────────────────────────────

export type StylePair = {
  id: number;
  a: { label: string; sub: string; image: string; tags: Partial<StyleVector> };
  b: { label: string; sub: string; image: string; tags: Partial<StyleVector> };
};

export const STYLE_PAIRS: StylePair[] = [
  {
    id: 1,
    a: {
      label: "Clean & minimal",
      sub: "neutral tones, simple lines",
      image: "/images/style-1a.jpg",
      tags: { aesthetics: ["minimalist"], fit: ["tailored"] },
    },
    b: {
      label: "Soft & feminine",
      sub: "delicate fabrics, romantic details",
      image: "/images/style-1b.jpg",
      tags: { aesthetics: ["romantic", "feminine"], fit: ["relaxed"] },
    },
  },
  {
    id: 2,
    a: {
      label: "Classic & tailored",
      sub: "blazers, structured silhouettes",
      image: "/images/style-2a.jpg",
      tags: { aesthetics: ["classic"], fit: ["tailored"], occasions: ["office"] },
    },
    b: {
      label: "Casual & relaxed",
      sub: "soft knits, denim, easy basics",
      image: "/images/style-2b.jpg",
      tags: { aesthetics: ["casual"], fit: ["relaxed"], occasions: ["weekend"] },
    },
  },
  {
    id: 3,
    a: {
      label: "Bohemian & flowy",
      sub: "maxi dresses, earthy tones",
      image: "/images/style-3a.jpg",
      tags: { aesthetics: ["bohemian"], fit: ["oversized"], occasions: ["weekend"] },
    },
    b: {
      label: "Edgy & bold",
      sub: "leather, dark tones, structure",
      image: "/images/style-3b.jpg",
      tags: { aesthetics: ["edgy"], fit: ["tailored"] },
    },
  },
  {
    id: 4,
    a: {
      label: "Cozy & oversized",
      sub: "chunky knits, loose comfortable fits",
      image: "/images/style-4a.jpg",
      tags: { aesthetics: ["casual"], fit: ["oversized"], occasions: ["weekend"] },
    },
    b: {
      label: "Chic & fitted",
      sub: "sleek dresses, polished silhouettes",
      image: "/images/style-4b.jpg",
      tags: {
        aesthetics: ["classic", "feminine"],
        fit: ["bodycon"],
        occasions: ["evening"],
      },
    },
  },
  {
    id: 5,
    a: {
      label: "Polished & refined",
      sub: "elevated, office-to-dinner ready",
      image: "/images/style-5a.jpg",
      tags: {
        aesthetics: ["classic"],
        fit: ["tailored"],
        occasions: ["office", "evening"],
      },
    },
    b: {
      label: "Sporty & active",
      sub: "athleisure, modern movement",
      image: "/images/style-5b.jpg",
      tags: {
        aesthetics: ["sporty"],
        fit: ["relaxed"],
        occasions: ["activewear", "weekend"],
      },
    },
  },
  {
    id: 6,
    a: {
      label: "Preppy & classic",
      sub: "structured details, timeless pieces",
      image: "/images/style-6a.jpg",
      tags: {
        aesthetics: ["preppy", "classic"],
        occasions: ["office", "weekend"],
      },
    },
    b: {
      label: "Bold & contemporary",
      sub: "statement pieces, unexpected combinations",
      image: "/images/style-6b.jpg",
      tags: { aesthetics: ["edgy", "bohemian"], fit: ["relaxed"] },
    },
  },
];

// ─── Kept for compat / AI context ─────────────────────────────────────────

export const GOAL_OPTIONS = [
  { id: "clothing-colors" as const, emoji: "🛍️", label: "Find clothing colors that don't wash me out" },
  { id: "capsule" as const, emoji: "👚", label: "Build a minimalist capsule wardrobe" },
  { id: "seasonal-palette" as const, emoji: "🎨", label: "Discover my seasonal color palette" },
  { id: "makeup-hair" as const, emoji: "💄", label: "Match my makeup and hair tones" },
];

export const SUN_OPTIONS: {
  id: SunReaction;
  emoji: string;
  label: string;
  hint: string;
  scores: Scores;
  undertone: "warm" | "cool" | "neutral";
}[] = [
  {
    id: "burns",
    emoji: "",
    label: "Burns quickly, barely tans",
    hint: "I always need SPF, I rarely get color",
    scores: { summer: 2, winter: 1 },
    undertone: "cool",
  },
  {
    id: "burns-tans",
    emoji: "",
    label: "Burns first, then tans",
    hint: "Takes time but I eventually tan",
    scores: { spring: 1, summer: 1, autumn: 1, winter: 1 },
    undertone: "neutral",
  },
  {
    id: "tans",
    emoji: "",
    label: "Tans easily, rarely burns",
    hint: "Sun doesn't bother me much",
    scores: { spring: 2, autumn: 1 },
    undertone: "warm",
  },
  {
    id: "never-burns",
    emoji: "",
    label: "Never burns, always tans",
    hint: "My skin handles sun very well",
    scores: { autumn: 2, spring: 1 },
    undertone: "warm",
  },
];

export const HAIR_NATURAL_OPTIONS = [
  { id: "yes" as const, label: "Yes — this is my natural color" },
  { id: "no" as const, label: "No — it's dyed or highlighted" },
];

export const HAIR_COLOR_OPTIONS: {
  id: HairColor;
  label: string;
  swatch: string;
  scores: Scores;
}[] = [
  { id: "black", label: "Black", swatch: "#17110E", scores: { winter: 2, autumn: 1 } },
  { id: "dark-brown", label: "Dark brown", swatch: "#2C1810", scores: { autumn: 2, winter: 1 } },
  { id: "medium-brown", label: "Medium brown", swatch: "#6B3F1D", scores: { autumn: 2 } },
  { id: "light-brown", label: "Light brown", swatch: "#9A6A3A", scores: { spring: 1, autumn: 1 } },
  { id: "warm-blonde", label: "Warm blonde", swatch: "#E8C872", scores: { spring: 2 } },
  { id: "cool-blonde", label: "Cool or ash blonde", swatch: "#C9BFA8", scores: { summer: 2 } },
  { id: "blonde", label: "Blonde", swatch: "#E8C872", scores: { spring: 2 } },
  { id: "red", label: "Red / auburn", swatch: "#A0522D", scores: { autumn: 2, spring: 1 } },
  { id: "brown", label: "Brown", swatch: "#8B4513", scores: { autumn: 2, winter: 1 } },
  { id: "grey-white", label: "Grey or white", swatch: "#D7D1C8", scores: { summer: 1, winter: 1 } },
];

export const HAIR_COLOR_OPTIONS_UI = HAIR_COLOR_OPTIONS.filter((opt) =>
  (
    [
      "black",
      "dark-brown",
      "medium-brown",
      "light-brown",
      "warm-blonde",
      "cool-blonde",
      "red",
      "grey-white",
    ] as HairColor[]
  ).includes(opt.id)
);

export const HEIGHT_OPTIONS = [
  { id: "under-160" as const, label: "Under 160 cm", sub: "5'3\" and below" },
  { id: "160-170" as const, label: "160 – 170 cm", sub: "5'3\" – 5'7\"" },
  { id: "over-170" as const, label: "Over 170 cm", sub: "5'7\" and above" },
];

export const WEIGHT_OPTIONS = [
  { id: "under-55" as const, label: "Under 55 kg", sub: "121 lbs and below" },
  { id: "55-75" as const, label: "55 – 75 kg", sub: "121 – 165 lbs" },
  { id: "over-75" as const, label: "Over 75 kg", sub: "165 lbs and above" },
];

export const CLIMATE_OPTIONS: {
  id: ClimatePref;
  label: string;
  sub: string;
}[] = [
  { id: "hot", label: "Hot most of the year", sub: "I rarely need heavy layers" },
  { id: "four-seasons", label: "Four seasons", sub: "Cold winters, warm summers" },
  { id: "cold", label: "Cold climate", sub: "I layer a lot, winter is long" },
];

export const WOMENSWEAR_BODY_SHAPES: {
  id: BodyShape;
  label: string;
  sub: string;
}[] = [
  { id: "hourglass", label: "Hourglass", sub: "Shoulders and hips similar, clearly defined waist" },
  { id: "bottom-hourglass", label: "Bottom Hourglass", sub: "Similar to hourglass but hips slightly fuller than shoulders" },
  { id: "triangle", label: "Triangle", sub: "Hips noticeably wider than shoulders" },
  { id: "inverted-triangle", label: "Inverted Triangle", sub: "Shoulders wider than hips" },
  { id: "pear", label: "Pear", sub: "Hips wider than shoulders, fuller lower body" },
  { id: "rectangle", label: "Rectangle", sub: "Shoulders and hips similar width, less defined waist" },
];

export const MENSWEAR_BODY_SHAPES: {
  id: BodyShape;
  label: string;
  sub: string;
}[] = [
  { id: "rectangle", label: "Rectangle", sub: "Even proportions top to bottom" },
  { id: "trapezoid", label: "Trapezoid", sub: "Broader shoulders, narrower waist — V-shape" },
  { id: "oval", label: "Oval", sub: "Fuller midsection, slimmer limbs" },
  { id: "triangle", label: "Triangle", sub: "Narrower shoulders, wider hips or thighs" },
];

export const STYLE_DIRECTION_OPTIONS: {
  id: StyleDirection;
  label: string;
  sub: string;
}[] = [
  { id: "minimalist", label: "Minimalist", sub: "Clean lines, quiet colors, nothing unnecessary" },
  { id: "classic", label: "Classic", sub: "Timeless pieces, quality fabrics, polished always" },
  { id: "streetwear", label: "Streetwear", sub: "Sneakers, oversized, bold, expressive" },
  { id: "romantic", label: "Romantic", sub: "Soft fabrics, delicate details, feminine or dreamy" },
  { id: "office", label: "Office / Smart", sub: "Structured, professional, put-together" },
  { id: "eclectic", label: "Eclectic", sub: "I mix everything and make it mine" },
];

export const OCCASION_OPTIONS: { id: OccasionPref; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "casual", label: "Everyday casual" },
  { id: "dates", label: "Dates" },
  { id: "events", label: "Events & parties" },
  { id: "nights-out", label: "Nights out" },
  { id: "travel", label: "Traveling" },
  { id: "gym", label: "Gym & active days" },
  { id: "home", label: "Home & WFH" },
  { id: "everything", label: "Everything equally" },
];

export const MAKEUP_PREF_OPTIONS: {
  id: MakeupPref;
  label: string;
  sub: string;
}[] = [
  { id: "yes", label: "Yes please", sub: "Include lipstick, blush, foundation, eyeshadow tips" },
  { id: "no", label: "No thanks", sub: "Clothes and accessories only for me" },
  { id: "sometimes", label: "Sometimes", sub: "Mention it occasionally, keep it light" },
];

export const BUDGET_PREF_OPTIONS: {
  id: BudgetPref;
  label: string;
  sub: string;
}[] = [
  { id: "budget", label: "Budget-friendly", sub: "I love a good find, value matters" },
  { id: "mid", label: "Mid-range", sub: "I invest in pieces I'll wear for years" },
  { id: "no-limit", label: "No limit", sub: "I buy what I love when I love it" },
];

export const BODY_SHAPE_OPTIONS = [
  { id: "hourglass" as const, label: "Hourglass", shape: "hourglass" },
  { id: "pear" as const, label: "Pear", shape: "pear" },
  { id: "rectangle" as const, label: "Rectangle", shape: "rect" },
  { id: "apple" as const, label: "Apple", shape: "apple" },
  { id: "petite" as const, label: "Petite", shape: "petite" },
];

export const STYLE_VIBE_OPTIONS = [
  { id: "minimalist" as const, emoji: "✨", title: "Modern Minimalist", desc: "Sleek, simple lines, neutral palettes." },
  { id: "classic" as const, emoji: "💼", title: "Classic & Tailored", desc: "Timeless, polished, elegant." },
  { id: "casual" as const, emoji: "👟", title: "Casual & Everyday", desc: "Relaxed, comfortable, great basics." },
  { id: "feminine" as const, emoji: "🌸", title: "Chic & Feminine", desc: "Soft fabrics, flattering silhouettes." },
  { id: "edgy" as const, emoji: "🎸", title: "Edgy & Contemporary", desc: "Bold cuts, leather, modern pieces." },
];

export const TREND_OPTIONS = [
  { id: "y2k" as const, emoji: "🦋", label: "Y2K / 2000s nostalgia" },
  { id: "old-money" as const, emoji: "🥂", label: "Old money / quiet luxury" },
  { id: "boho" as const, emoji: "🌾", label: "Boho / free-spirited" },
  { id: "retro" as const, emoji: "🍒", label: "Retro / vintage-inspired" },
  { id: "goth-lite" as const, emoji: "🖤", label: "Goth-lite / grunge" },
  { id: "none" as const, emoji: "➖", label: "None — just classic pieces" },
];

export const QUIZ_STEP_LABELS = [
  "your goal",
  "undertone",
  "hair color",
  "height",
  "body shape",
  "style vibe",
  "trends",
  "selfie",
] as const;

export const GOAL_LABELS: Record<StylingGoal, string> = {
  "clothing-colors": "clothing colors that flatter",
  capsule: "minimalist capsule wardrobe",
  "seasonal-palette": "seasonal color palette",
  "makeup-hair": "makeup and hair tones",
};

export const STYLE_LABELS: Record<StyleVibe, string> = {
  minimalist: "Modern Minimalist",
  classic: "Classic & Tailored",
  casual: "Casual & Everyday",
  feminine: "Chic & Feminine",
  edgy: "Edgy & Contemporary",
};
