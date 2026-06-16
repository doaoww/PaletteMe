import type { BodyShape, BodyType, StyleChallenge } from "@/lib/quiz-data";
import type { QuizProfile } from "@/lib/quiz";
import type { ColorIntelligenceReport } from "@/lib/color-intelligence";
import type { Season } from "@/lib/landing-data";

export const STYLE_CHALLENGE_STARTING_COPY: Record<StyleChallenge, string> = {
  "dont-know-buy":
    "Start with 3 anchor pieces in your best neutrals — camel, warm ivory, and chocolate brown. Every piece you buy from here should connect to at least one of them. I'll guide you on every purchase.",
  "never-wear":
    "Your wardrobe probably has pieces that don't talk to each other. The fix is a color anchor — a few core shades everything connects back to. Let's audit what you have and build from there.",
  "cant-combine":
    "The issue is usually color temperature or proportion mismatch, not the clothes themselves. Once you add your wardrobe, I'll show you combinations you already own that you haven't tried yet.",
  "style-refresh":
    "You're starting with the most powerful tool — knowing your palette. Every piece you add from here will be intentional. Let's build something that feels completely like you.",
};

const BODY_CUT_COPY: Partial<Record<BodyShape | BodyType, string>> = {
  hourglass: "defined waists, wrap silhouettes, and balanced top-and-bottom volume",
  pear: "statement tops, A-line bottoms, and shoulder detail",
  apple: "vertical lines, V-necks, and easy structure through the midsection",
  rectangle: "waist definition, texture, and gentle shaping through the torso",
  "inverted-triangle": "volume through the lower half and softer shoulder lines",
  trapezoid: "clean tailored lines that follow your natural V-shape",
  oval: "longer vertical lines and lightly structured layers",
  triangle: "shoulder structure and balanced lower-half volume",
};

export type WardrobeGuidanceRow = {
  icon: string;
  category: string;
  yes: { label: string; hex: string }[];
  no: { label: string; hex: string }[];
};

export type AvoidSwatch = {
  name: string;
  hex: string;
};

const WARM_AVOID: AvoidSwatch[] = [
  { name: "Icy pink", hex: "#F0D4DC" },
  { name: "Cool grey", hex: "#B8BCC4" },
  { name: "Bright white", hex: "#FFFFFF" },
  { name: "Lavender", hex: "#C8B4E8" },
  { name: "Neon yellow", hex: "#E8FF3A" },
  { name: "Pastel blue", hex: "#A8D4F0" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Cool black", hex: "#1A1A24" },
];

const COOL_AVOID: AvoidSwatch[] = [
  { name: "Rust orange", hex: "#B5522A" },
  { name: "Mustard", hex: "#C4A035" },
  { name: "Warm camel", hex: "#C19A6B" },
  { name: "Terracotta", hex: "#C86B4A" },
  { name: "Golden yellow", hex: "#E6BE3A" },
  { name: "Peach", hex: "#FFCBA4" },
  { name: "Copper", hex: "#B87333" },
  { name: "Warm beige", hex: "#D4B896" },
];

export function seasonRevealWash(seasonId: string): string {
  const base = seasonId.includes("autumn")
    ? "autumn"
    : seasonId.includes("summer")
      ? "summer"
      : seasonId.includes("spring")
        ? "spring"
        : seasonId.includes("winter")
          ? "winter"
          : seasonId;
  const washes: Record<string, string> = {
    autumn: "#FDF0E8",
    summer: "#F0F4FF",
    spring: "#FFF8F0",
    winter: "#F0F0F8",
  };
  return washes[base] ?? washes.autumn;
}

export function seasonAccentColor(seasonId: string): string {
  const base = seasonId.includes("autumn")
    ? "autumn"
    : seasonId.includes("summer")
      ? "summer"
      : seasonId.includes("spring")
        ? "spring"
        : seasonId.includes("winter")
          ? "winter"
          : seasonId;
  const accents: Record<string, string> = {
    autumn: "#C4783A",
    summer: "#9B8EC4",
    spring: "#E8A87C",
    winter: "#6B5B95",
  };
  return accents[base] ?? accents.autumn;
}

export function seasonChipEmoji(seasonId: string): string {
  const base = seasonId.includes("autumn")
    ? "autumn"
    : seasonId.includes("summer")
      ? "summer"
      : seasonId.includes("spring")
        ? "spring"
        : seasonId.includes("winter")
          ? "winter"
          : seasonId;
  const emojis: Record<string, string> = {
    autumn: "🍂",
    summer: "☀️",
    spring: "🌸",
    winter: "❄️",
  };
  return emojis[base] ?? "✦";
}

export function seasonRevealOneLiner(season: Season): string {
  if (season.id === "autumn") {
    return "You carry depth and warmth. Rich earth tones were made for you.";
  }
  if (season.id === "spring") {
    return "You glow in clarity and warmth. Fresh, luminous color feels native to you.";
  }
  if (season.id === "summer") {
    return "You shine in softness and cool elegance. Dusty rose and muted blue sit beautifully on you.";
  }
  return "You thrive on contrast and cool clarity. Jewel tones and crisp neutrals look intentional on you.";
}

export function seasonTagline(season: Season, subSeason?: string): string {
  const label = subSeason ?? season.name;
  if (season.id === "autumn") {
    return `You carry depth and warmth. Rich earth tones, golden metallics, and complex layered prints were made for you — your ${label} palette proves it.`;
  }
  if (season.id === "spring") {
    return `You glow in clarity and warmth. Fresh coral, clear mint, and golden light feel native to your coloring — that's your ${label} strength.`;
  }
  if (season.id === "summer") {
    return `You shine in softness and cool elegance. Dusty rose, muted blue, and gentle greyed tones sit beautifully on you as a ${label}.`;
  }
  return `You thrive on contrast and cool clarity. Jewel tones, crisp neutrals, and high-impact color reads look intentional on you as ${label}.`;
}

export function bodyStartingLine(bodyShape?: BodyShape, bodyType?: BodyType): string | null {
  const key = bodyShape ?? bodyType;
  if (!key) return null;
  const direction = BODY_CUT_COPY[key];
  if (!direction) return null;
  return `For your proportions, we'll lean into ${direction} — you'll see this reflected in every outfit we build.`;
}

export function buildWardrobeGuidance(
  profile: QuizProfile,
  report: ColorIntelligenceReport
): WardrobeGuidanceRow[] {
  const warm =
    profile.undertoneHint === "warm" ||
    profile.seasonId === "spring" ||
    profile.seasonId === "autumn";

  const metals = warm
    ? {
        yes: [
          { label: "Gold", hex: "#D4AF37" },
          { label: "Bronze", hex: "#B8860B" },
        ],
        no: [
          { label: "Silver", hex: "#C0C0C0" },
          { label: "Rose gold", hex: "#E8B4B8" },
        ],
      }
    : {
        yes: [
          { label: "Silver", hex: "#C0C0C0" },
          { label: "Platinum", hex: "#E5E4E2" },
        ],
        no: [
          { label: "Gold", hex: "#D4AF37" },
          { label: "Bronze", hex: "#B8860B" },
        ],
      };

  const denim = warm
    ? {
        yes: [
          { label: "Dark indigo", hex: "#1B2A4A" },
          { label: "Brown-toned", hex: "#5C4033" },
        ],
        no: [
          { label: "Light grey wash", hex: "#B8B8B8" },
          { label: "Cool black", hex: "#1A1A24" },
        ],
      }
    : {
        yes: [
          { label: "Cool black", hex: "#1A1A24" },
          { label: "Grey wash", hex: "#8E9AAF" },
        ],
        no: [
          { label: "Rust wash", hex: "#A0522D" },
          { label: "Warm brown", hex: "#8B6914" },
        ],
      };

  const neutrals = warm
    ? {
        yes: [
          { label: "Warm beige", hex: "#D4B896" },
          { label: "Camel", hex: "#C19A6B" },
          { label: "Warm white", hex: "#FFF8F0" },
        ],
        no: [
          { label: "Bright white", hex: "#FFFFFF" },
          { label: "Cool grey", hex: "#B8BCC4" },
        ],
      }
    : {
        yes: [
          { label: "Soft white", hex: "#F5F5F5" },
          { label: "Cool grey", hex: "#B8BCC4" },
          { label: "Charcoal", hex: "#36454F" },
        ],
        no: [
          { label: "Warm camel", hex: "#C19A6B" },
          { label: "Rust", hex: "#B5522A" },
        ],
      };

  const prints = warm
    ? {
        yes: [
          { label: "Earth-toned", hex: "#8B6914" },
          { label: "Warm geometric", hex: "#A0522D" },
          { label: "Animal print", hex: "#6B4423" },
        ],
        no: [
          { label: "Cool pastels", hex: "#C8B4E8" },
          { label: "Neon", hex: "#E8FF3A" },
        ],
      }
    : {
        yes: [
          { label: "Cool graphic", hex: "#4A5568" },
          { label: "Monochrome", hex: "#2D3748" },
          { label: "Jewel print", hex: "#6B5B95" },
        ],
        no: [
          { label: "Warm earth", hex: "#8B6914" },
          { label: "Neon", hex: "#E8FF3A" },
        ],
      };

  const rows: WardrobeGuidanceRow[] = [
    { icon: "👔", category: "Metals", ...metals },
    { icon: "👖", category: "Denim", ...denim },
    { icon: "🎨", category: "Neutrals", ...neutrals },
    { icon: "🖨", category: "Prints", ...prints },
  ];

  if (profile.answers.makeupPref === "yes" || profile.answers.makeupPref === "sometimes") {
    rows.splice(3, 0, {
      icon: "💄",
      category: "Lipstick",
      yes: warm
        ? [
            { label: "Terracotta", hex: "#C86B4A" },
            { label: "Peach", hex: "#FFCBA4" },
            { label: "Warm nude", hex: "#D4A574" },
          ]
        : [
            { label: "Rose", hex: "#E8B4B8" },
            { label: "Mauve", hex: "#C8A2C8" },
            { label: "Berry", hex: "#8B4557" },
          ],
      no: warm
        ? [
            { label: "Cool pink", hex: "#F0A8C8" },
            { label: "Berry", hex: "#8B4557" },
          ]
        : [
            { label: "Orange coral", hex: "#FF7F50" },
            { label: "Warm nude", hex: "#D4A574" },
          ],
    });
  }

  return rows;
}

export function getAvoidSwatches(profile: QuizProfile): AvoidSwatch[] {
  const warm =
    profile.undertoneHint === "warm" ||
    profile.seasonId === "spring" ||
    profile.seasonId === "autumn";
  return warm ? WARM_AVOID : COOL_AVOID;
}

export function namedBestColors(report: ColorIntelligenceReport): { name: string; hex: string }[] {
  const names = [
    "Terracotta",
    "Camel",
    "Warm olive",
    "Rust",
    "Burnt orange",
    "Deep teal",
    "Warm ivory",
    "Chocolate brown",
    "Mustard",
    "Forest green",
    "Burgundy",
    "Copper",
    "Bronze",
    "Warm tan",
    "Brick red",
    "Dark moss",
  ];

  return report.bestColors.map((color, index) => ({
    name: names[index] ?? color.name,
    hex: color.hex,
  }));
}
