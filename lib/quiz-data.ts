import type { SeasonId } from "@/lib/analysis";

export type StylingGoal =
  | "clothing-colors"
  | "capsule"
  | "seasonal-palette"
  | "makeup-hair";

export type SunReaction = "burns" | "burns-tans" | "tans";
export type HairColor = "blonde" | "red" | "brown" | "black";
export type HeightRange = "under-160" | "160-170" | "over-170";
export type BodyShape = "hourglass" | "pear" | "rectangle" | "apple" | "petite";
export type StyleVibe = "minimalist" | "classic" | "casual" | "feminine" | "edgy";
export type StyleTrend = "y2k" | "old-money" | "boho" | "retro" | "goth-lite" | "none";

// Phase 1 — color quiz
export type VeinColor = "blue-purple" | "green" | "mix";
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
  // Phase 1 quiz path
  veinColor?: VeinColor;
  metalPref?: MetalPref;
  sunReaction?: SunReaction;
  naturalHair?: "yes" | "no";
  naturalHairColor?: HairColor;
  eyeFamily?: EyeFamily;
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
  // compat
  height?: HeightRange;
  bodyShape?: BodyShape;
};

// ─── Color quiz options ────────────────────────────────────────────────────

type Scores = Partial<Record<SeasonId, number>>;

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
    sub: "strong difference between skin, hair and eyes",
    scores: { winter: 2, spring: 1 },
  },
  {
    id: "medium",
    label: "Medium contrast",
    sub: "some visible difference",
    scores: { spring: 1, summer: 1, autumn: 1 },
  },
  {
    id: "low",
    label: "Low contrast",
    sub: "features blend together harmoniously",
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
    emoji: "🔴",
    label: "Burns easily, rarely tans",
    hint: "Cool undertone indicator",
    scores: { summer: 2, winter: 1 },
    undertone: "cool",
  },
  {
    id: "burns-tans",
    emoji: "🪵",
    label: "Burns first, then slowly tans",
    hint: "Neutral undertone indicator",
    scores: { spring: 1, summer: 1, autumn: 1, winter: 1 },
    undertone: "neutral",
  },
  {
    id: "tans",
    emoji: "☀️",
    label: "Tans easily, rarely burns",
    hint: "Warm undertone indicator",
    scores: { spring: 2, autumn: 1 },
    undertone: "warm",
  },
];

export const HAIR_NATURAL_OPTIONS = [
  { id: "yes" as const, emoji: "✅", label: "Yes, this is my natural hair color" },
  { id: "no" as const, emoji: "❌", label: "No, it's dyed / highlighted" },
];

export const HAIR_COLOR_OPTIONS: {
  id: HairColor;
  label: string;
  swatch: string;
  scores: Scores;
}[] = [
  { id: "blonde", label: "Blonde", swatch: "#E8C872", scores: { spring: 2 } },
  { id: "red", label: "Red / auburn", swatch: "#A0522D", scores: { autumn: 2, spring: 1 } },
  { id: "brown", label: "Brown", swatch: "#8B4513", scores: { autumn: 2, winter: 1 } },
  { id: "black", label: "Black", swatch: "#2C1810", scores: { winter: 2, autumn: 1 } },
];

export const HEIGHT_OPTIONS = [
  { id: "under-160" as const, label: "Under 160 cm", sub: "5'3\" and below" },
  { id: "160-170" as const, label: "160 – 170 cm", sub: "5'3\" – 5'7\"" },
  { id: "over-170" as const, label: "Over 170 cm", sub: "5'7\" and above" },
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
