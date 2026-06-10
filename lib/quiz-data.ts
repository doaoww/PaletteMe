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

export type StyleVibe =
  | "minimalist"
  | "classic"
  | "casual"
  | "feminine"
  | "edgy";

export type StyleTrend =
  | "y2k"
  | "old-money"
  | "boho"
  | "retro"
  | "goth-lite"
  | "none";

export type QuizAnswers = {
  goal?: StylingGoal;
  sunReaction?: SunReaction;
  naturalHair?: "yes" | "no";
  naturalHairColor?: HairColor;
  height?: HeightRange;
  bodyShape?: BodyShape;
  styleVibe?: StyleVibe;
  trends?: StyleTrend[];
};

export const GOAL_OPTIONS = [
  {
    id: "clothing-colors" as const,
    emoji: "🛍️",
    label: "Find clothing colors that don't wash me out",
  },
  {
    id: "capsule" as const,
    emoji: "👚",
    label: "Build a minimalist capsule wardrobe",
  },
  {
    id: "seasonal-palette" as const,
    emoji: "🎨",
    label: "Discover my seasonal color palette",
  },
  {
    id: "makeup-hair" as const,
    emoji: "💄",
    label: "Match my makeup and hair tones",
  },
];

export const SUN_OPTIONS = [
  {
    id: "burns" as const,
    emoji: "🔴",
    label: "Burns easily, rarely tans",
    hint: "Cool undertone indicator",
    scores: { summer: 2, winter: 1 } satisfies Partial<Record<SeasonId, number>>,
    undertone: "cool" as const,
  },
  {
    id: "burns-tans" as const,
    emoji: "🪵",
    label: "Burns first, then slowly tans",
    hint: "Neutral undertone indicator",
    scores: { spring: 1, summer: 1, autumn: 1, winter: 1 } satisfies Partial<Record<SeasonId, number>>,
    undertone: "neutral" as const,
  },
  {
    id: "tans" as const,
    emoji: "☀️",
    label: "Tans easily, rarely burns",
    hint: "Warm undertone indicator",
    scores: { spring: 2, autumn: 1 } satisfies Partial<Record<SeasonId, number>>,
    undertone: "warm" as const,
  },
];

export const HAIR_NATURAL_OPTIONS = [
  { id: "yes" as const, emoji: "✅", label: "Yes, this is my natural hair color" },
  { id: "no" as const, emoji: "❌", label: "No, it's dyed / highlighted" },
];

export const HAIR_COLOR_OPTIONS = [
  {
    id: "blonde" as const,
    label: "Blonde",
    swatch: "#E8C872",
    scores: { spring: 2 } satisfies Partial<Record<SeasonId, number>>,
  },
  {
    id: "red" as const,
    label: "Red",
    swatch: "#A0522D",
    scores: { autumn: 2, spring: 1 } satisfies Partial<Record<SeasonId, number>>,
  },
  {
    id: "brown" as const,
    label: "Brown",
    swatch: "#8B4513",
    scores: { autumn: 2, winter: 1 } satisfies Partial<Record<SeasonId, number>>,
  },
  {
    id: "black" as const,
    label: "Black",
    swatch: "#2C1810",
    scores: { winter: 2, autumn: 1 } satisfies Partial<Record<SeasonId, number>>,
  },
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
  {
    id: "minimalist" as const,
    emoji: "✨",
    title: "Modern Minimalist",
    desc: "Sleek, simple lines, neutral palettes, effortless basics.",
  },
  {
    id: "classic" as const,
    emoji: "💼",
    title: "Classic & Tailored",
    desc: "Timeless, polished, elegant — blazers, trousers, crisp shirts.",
  },
  {
    id: "casual" as const,
    emoji: "👟",
    title: "Casual & Everyday",
    desc: "Relaxed, comfortable denim, soft knits, great basics.",
  },
  {
    id: "feminine" as const,
    emoji: "🌸",
    title: "Chic & Feminine",
    desc: "Soft fabrics, flattering silhouettes, dresses, delicate details.",
  },
  {
    id: "edgy" as const,
    emoji: "🎸",
    title: "Edgy & Contemporary",
    desc: "Bold cuts, leather accents, modern unique pieces.",
  },
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
