import type { Season } from "@/lib/shared/landing-data";

export type ColorChroma = "muted" | "balanced" | "clear";

export type ColorTraits = {
  undertone: "warm" | "cool" | "neutral";
  contrast: "low" | "medium" | "high";
  depth: "light" | "medium" | "deep";
  chroma: ColorChroma;
};

export type FeatureNotes = {
  skin: string;
  hair: string;
  eyes: string;
};

export type ReportColor = {
  name: string;
  hex: string;
  reason: string;
};

export type AvoidColor = {
  name: string;
  reason: string;
};

export type ColorIntelligenceReport = {
  subSeason: string;
  bestColors: ReportColor[];
  avoidColors: AvoidColor[];
  neutralColors: ReportColor[];
  accentColors: ReportColor[];
  makeup: {
    blush: string[];
    lips: string[];
    eyes: string[];
  };
  jewelry: {
    metals: string[];
    guidance: string;
  };
  hair: {
    colors: string[];
    guidance: string;
  };
  shoppingRules: string[];
  contrastRule: string;
  featureSummary: string;
  scannerBestColors: string[];
};

export function buildColorIntelligenceReport({
  season,
  subSeason,
  traits,
  featureNotes,
  context,
}: {
  season: Season;
  subSeason?: string;
  traits: ColorTraits;
  featureNotes?: Partial<FeatureNotes>;
  context?: {
    styleGoal?: string;
    styleVibe?: string;
    naturalHairColor?: string;
  };
}): ColorIntelligenceReport {
  const warm = traits.undertone === "warm" || season.temps.includes("warm");
  const cool = traits.undertone === "cool" || season.temps.includes("cool");
  const soft = traits.chroma === "muted" || season.temps.includes("soft");
  const clear = traits.chroma === "clear" || season.temps.includes("clear");

  const bestColors = season.palette.map((hex, index) => ({
    name: `${season.name} color ${index + 1}`,
    hex,
    reason: `Matches your ${traits.undertone} undertone, ${traits.depth} depth, and ${traits.chroma} chroma.`,
  }));

  const neutralColors = bestColors.slice(0, 3);
  const accentColors = bestColors.slice(-3);
  const naturalHair = context?.naturalHairColor?.trim() || "your natural hair";

  return {
    subSeason: subSeason?.trim() || season.name,
    bestColors,
    avoidColors: buildAvoidColors(traits),
    neutralColors,
    accentColors,
    makeup: warm ? warmMakeup() : coolMakeup(),
    jewelry: warm ? warmJewelry() : coolJewelry(cool),
    hair: warm ? warmHair(naturalHair) : coolHair(naturalHair),
    shoppingRules: [
      `Shop ${traits.undertone} ${traits.depth} colors before trend, brand, or price.`,
      `Choose ${traits.chroma} colors that support your ${context?.styleGoal ?? "style goal"}.`,
      `For ${context?.styleVibe ?? "your style"}, repeat one palette color near the face.`,
    ],
    contrastRule: buildContrastRule(traits, soft, clear),
    featureSummary: buildFeatureSummary(traits, featureNotes),
    scannerBestColors: bestColors.map((color) => `${color.name} ${color.hex}`),
  };
}

export function getFreeColorPreview(report: ColorIntelligenceReport, count = 4): ReportColor[] {
  return report.bestColors.slice(0, Math.max(0, count));
}

function buildAvoidColors(traits: ColorTraits): AvoidColor[] {
  const avoid: AvoidColor[] = [];
  if (traits.undertone === "warm") {
    avoid.push({ name: "icy blue-gray", reason: "can make warm undertones look flat or tired" });
  } else {
    avoid.push({ name: "hot orange", reason: "orange heat can fight cool or neutral-cool undertones" });
  }

  if (traits.contrast === "low") {
    avoid.push({ name: "stark black-white contrast", reason: "black-white contrast can overpower low contrast coloring" });
  } else if (traits.contrast === "high") {
    avoid.push({ name: "dusty beige blends", reason: "can flatten high contrast coloring" });
  } else {
    avoid.push({ name: "extreme neon", reason: "can distract from balanced contrast" });
  }

  if (traits.chroma === "muted") {
    avoid.push({ name: "neon brights", reason: "can look separate from muted natural coloring" });
  } else if (traits.chroma === "clear") {
    avoid.push({ name: "muddy muted shades", reason: "can dull clear coloring" });
  } else {
    avoid.push({ name: "overly gray colors", reason: "can make balanced chroma look dull" });
  }

  return avoid;
}

function warmMakeup() {
  return {
    blush: ["peach", "coral", "warm apricot"],
    lips: ["coral rose", "warm pink", "soft terracotta"],
    eyes: ["champagne", "bronze", "warm taupe"],
  };
}

function coolMakeup() {
  return {
    blush: ["cool rose", "mauve pink", "soft berry"],
    lips: ["rose", "mauve", "berry"],
    eyes: ["soft gray", "plum taupe", "cool cocoa"],
  };
}

function warmJewelry() {
  return {
    metals: ["yellow gold", "champagne gold", "bronze", "warm rose gold"],
    guidance: "Gold-toned metals echo your warmth and keep the face looking alive.",
  };
}

function coolJewelry(cool: boolean) {
  return {
    metals: cool ? ["silver", "platinum", "white gold", "cool rose gold"] : ["soft gold", "silver", "rose gold"],
    guidance: cool
      ? "Cool metals support your undertone without adding yellow cast."
      : "Neutral coloring can mix metals; keep the finish soft rather than harsh.",
  };
}

function warmHair(naturalHair: string) {
  return {
    colors: ["honey", "golden brown", "chestnut", "copper gloss"],
    guidance: `Keep ${naturalHair} in a golden, honey, chestnut, or copper direction when coloring it.`,
  };
}

function coolHair(naturalHair: string) {
  return {
    colors: ["ash brown", "espresso", "cool beige", "soft black"],
    guidance: `Keep ${naturalHair} in an ash, espresso, cool beige, or neutral gloss direction when coloring it.`,
  };
}

function buildContrastRule(traits: ColorTraits, soft: boolean, clear: boolean): string {
  if (traits.contrast === "high" || clear) {
    return "Use crisp contrast: clear edges, defined light/dark pairings, and colors that hold their shape.";
  }
  if (traits.contrast === "low" || soft) {
    return "Use tonal, soft, blended contrast so the outfit does not overpower your natural coloring.";
  }
  return "Use medium contrast: one clear focal color with softer supporting neutrals.";
}

function buildFeatureSummary(traits: ColorTraits, featureNotes?: Partial<FeatureNotes>): string {
  const notes = [featureNotes?.skin, featureNotes?.hair, featureNotes?.eyes]
    .filter((value): value is string => Boolean(value?.trim()));

  if (notes.length > 0) return notes.join("; ");

  return `${traits.depth} depth, ${traits.contrast} contrast, ${traits.chroma} chroma, and ${traits.undertone} undertone.`;
}
