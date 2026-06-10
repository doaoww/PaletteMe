import { SEASONS } from "@/lib/landing-data";
import type { StylingGoal, StyleVibe } from "@/lib/quiz-data";

export type ProductSearchContext = {
  seasonId: string;
  styleVibe?: StyleVibe;
  goal?: StylingGoal;
  subSeason?: string;
};

/** Map common product color words → nearest palette hex for match scoring */
const COLOR_ALIASES: Record<string, string[]> = {
  coral: ["coral", "peach", "apricot", "salmon"],
  peach: ["peach", "apricot", "coral"],
  rose: ["rose", "pink", "blush", "dusty rose", "mauve"],
  lavender: ["lavender", "lilac", "mauve", "purple"],
  blue: ["blue", "navy", "cobalt", "azure", "teal"],
  mint: ["mint", "sage", "green"],
  terracotta: ["terracotta", "rust", "brick", "copper"],
  camel: ["camel", "tan", "beige", "sand", "khaki"],
  olive: ["olive", "khaki", "army"],
  brown: ["brown", "chocolate", "espresso"],
  black: ["black", "onyx", "charcoal"],
  white: ["white", "ivory", "cream", "off-white"],
  burgundy: ["burgundy", "wine", "maroon", "ruby"],
  gold: ["gold", "golden", "mustard", "yellow"],
};

const SEASON_SEARCH_BASE: Record<string, string> = {
  spring: "coral peach mint blouse",
  summer: "dusty rose lavender soft blue dress",
  autumn: "terracotta rust camel knit",
  winter: "navy cobalt jewel black blazer",
};

const STYLE_SEARCH_TERMS: Record<StyleVibe, string> = {
  minimalist: "minimal neutral basics",
  classic: "tailored blazer trousers",
  casual: "denim knit relaxed",
  feminine: "midi dress soft feminine",
  edgy: "leather contemporary bold",
};

const GOAL_SEARCH_TERMS: Record<StylingGoal, string> = {
  "clothing-colors": "flattering top dress",
  capsule: "versatile wardrobe essentials",
  "seasonal-palette": "color coordinated outfit",
  "makeup-hair": "accessories scarf top",
};

export function buildMarketplaceSearchUrl(ctx: ProductSearchContext): string {
  const base = SEASON_SEARCH_BASE[ctx.seasonId] ?? "women clothing";
  const style = ctx.styleVibe ? STYLE_SEARCH_TERMS[ctx.styleVibe] : "";
  const goal = ctx.goal ? GOAL_SEARCH_TERMS[ctx.goal] : "";
  const query = [base, style, goal, "women"].filter(Boolean).join(" ");
  return `https://www.asos.com/search/?q=${encodeURIComponent(query)}`;
}

export function getSeasonPalette(seasonId: string): string[] {
  return SEASONS.find((s) => s.id === seasonId)?.palette ?? SEASONS[0].palette;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function colorDistance(a: string, b: string): number {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return 999;
  return Math.sqrt(
    (ra[0] - rb[0]) ** 2 + (ra[1] - rb[1]) ** 2 + (ra[2] - rb[2]) ** 2
  );
}

function guessHexFromColorName(colorName: string, palette: string[]): string | undefined {
  const lower = colorName.toLowerCase();
  for (const [hexKey, aliases] of Object.entries(COLOR_ALIASES)) {
    if (aliases.some((a) => lower.includes(a))) {
      const paletteMatch = palette.find((p) =>
        colorDistance(p, hexKey.startsWith("#") ? hexKey : `#${hexKey}`) < 80
      );
      if (paletteMatch) return paletteMatch;
    }
  }
  return undefined;
}

/** Score 0–100: how well a product color fits the season palette */
export function scoreProductMatch(
  colorName: string | undefined,
  productName: string,
  palette: string[]
): { match: number; hex?: string } {
  const text = `${colorName ?? ""} ${productName}`.toLowerCase();

  let bestDist = Infinity;
  let bestHex: string | undefined;

  for (const hex of palette) {
    for (const aliases of Object.values(COLOR_ALIASES)) {
      if (aliases.some((a) => text.includes(a))) {
        const d = colorDistance(hex, guessHexFromColorName(aliases[0], palette) ?? hex);
        if (d < bestDist) {
          bestDist = d;
          bestHex = hex;
        }
      }
    }
  }

  if (bestHex) {
    const match = Math.round(Math.max(72, 100 - bestDist / 4));
    return { match, hex: bestHex };
  }

  // Season-relevant search but unknown color — moderate default
  return { match: 82, hex: palette[0] };
}

export function cacheKeyForContext(ctx: ProductSearchContext): string {
  return [ctx.seasonId, ctx.styleVibe ?? "", ctx.goal ?? ""].join("|");
}
