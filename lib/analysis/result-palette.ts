import { SEASONS, type Season } from "@/lib/shared/landing-data";
import type { ColorIntelligenceReport, ReportColor } from "./color-intelligence.ts";
import { findSeasonPalette, type PaletteTier } from "@/lib/analysis/season-palettes";

export type ResultSwatch = {
  hex: string;
  name: string;
  border?: string;
  muted?: boolean;
  gradient?: string;
};

const METAL_HEX: Record<string, string> = {
  "silver": "#C0C0C0",
  "platinum": "#E5E4E2",
  "white gold": "#F0EFE0",
  "yellow gold": "#D4AF37",
  "gold": "#D4AF37",
  "rose gold": "#B76E79",
  "bronze": "#CD7F32",
  "copper": "#B87333",
  "antique gold": "#CFB53B",
  "dark gold": "#B8960C",
  "gunmetal": "#2C3539",
  "pewter": "#96A8A1",
  "champagne": "#F0E6C8",
  "bright silver": "#C0C0C0",
  "dark silver": "#A0A0A0",
  "brushed silver": "#B8B8B8",
};

const METAL_GRADIENT: Record<string, string> = {
  "silver": "linear-gradient(135deg, #E8E8E8, #C0C0C0, #A8A8A8, #D0D0D0)",
  "platinum": "linear-gradient(135deg, #F0F0F0, #E5E4E2, #D0D0D0, #ECECEC)",
  "white gold": "linear-gradient(135deg, #F8F8F0, #F0EFE0, #E0DED0, #F4F4E8)",
  "rose gold": "linear-gradient(135deg, #F4C2C2, #B76E79, #9E5A6A, #D4909A)",
  "bronze": "linear-gradient(135deg, #E8A060, #CD7F32, #A86020, #DDA050)",
  "copper": "linear-gradient(135deg, #E8A080, #B87333, #A06020, #D09060)",
  "champagne": "linear-gradient(135deg, #F8EDD0, #F0E6C8, #D4C090, #F4EAD4)",
  "gold": "linear-gradient(135deg, #FFD700, #D4AF37, #B8960C, #E8C84A)",
  "gunmetal": "linear-gradient(135deg, #4A4A4A, #2C3539, #1E2428, #3A3F44)",
  "pewter": "linear-gradient(135deg, #B0B8B4, #96A8A1, #7E9490, #AAB4B0)",
};

function resolveMetalHex(name: string): string {
  const lower = name.toLowerCase();
  if (METAL_HEX[lower]) return METAL_HEX[lower];
  for (const [key, hex] of Object.entries(METAL_HEX)) {
    if (lower.includes(key)) return hex;
  }
  return "#C0C0C0";
}

function resolveMetalGradient(name: string): string | undefined {
  const lower = name.toLowerCase();
  if (METAL_GRADIENT[lower]) return METAL_GRADIENT[lower];
  for (const [key, gradient] of Object.entries(METAL_GRADIENT)) {
    if (lower.includes(key)) return gradient;
  }
  return undefined;
}

type MakeupColumns = Record<"LIPS" | "CHEEK" | "EYES" | "BASE", ResultSwatch[]>;
const LIGHT_SWATCH_BORDER = "currentColor";

const SEASON_METAL_LABELS: Record<string, string[]> = {
  spring: ["yellow gold", "champagne gold", "bright rose gold", "light bronze"],
  summer: ["silver", "platinum", "white gold", "soft rose gold"],
  autumn: ["yellow gold", "antique gold", "bronze", "copper"],
  winter: ["silver", "platinum", "white gold", "cool rose gold"],
};

const SEASON_NEUTRAL_LABELS: Record<string, string[]> = {
  spring: ["warm ivory", "peach beige", "clear camel", "light navy"],
  summer: ["soft white", "cool taupe", "misty gray", "soft navy"],
  autumn: ["cream", "camel", "chocolate", "olive neutral"],
  winter: ["optic white", "black", "charcoal", "icy gray"],
};

const SEASON_AVOID_ORDER: Record<string, string[]> = {
  spring: ["summer", "winter"],
  summer: ["autumn", "spring"],
  autumn: ["summer", "winter"],
  winter: ["autumn", "spring"],
};

export function buildSeasonPaletteSwatches(season: Season, subSeason?: string): ResultSwatch[] {
  const sp = subSeason ? findSeasonPalette(subSeason) : undefined;
  const palette = sp?.palette ?? season.palette;
  const names = sp?.paletteNames ?? season.paletteNames;
  return palette.map((hex, index) => ({
    hex,
    name: names?.[index] ?? `${season.name} color ${index + 1}`,
    border: isLightSwatch(hex) ? LIGHT_SWATCH_BORDER : undefined,
  }));
}

export type TieredPalette = Record<PaletteTier, ResultSwatch[]>;

export function buildTieredPaletteSwatches(season: Season, subSeason?: string): TieredPalette {
  const sp = subSeason ? findSeasonPalette(subSeason) : undefined;
  const palette = sp?.palette ?? season.palette;
  const names = sp?.paletteNames ?? season.paletteNames;
  const context = sp?.paletteContext;

  const result: TieredPalette = { base: [], power: [], accent: [] };

  palette.forEach((hex, index) => {
    const tier: PaletteTier = context?.[index] ?? (index < 4 ? "base" : index < 8 ? "power" : "accent");
    result[tier].push({
      hex,
      name: names?.[index] ?? `${season.name} color ${index + 1}`,
      border: isLightSwatch(hex) ? LIGHT_SWATCH_BORDER : undefined,
    });
  });

  return result;
}

export function buildSeasonAvoidSwatches(
  season: Season,
  seasons: Season[] = SEASONS,
  count = 5,
  subSeason?: string
): ResultSwatch[] {
  const sp = subSeason ? findSeasonPalette(subSeason) : undefined;
  if (sp && sp.avoid.length > 0) {
    return sp.avoid.slice(0, count).map((hex, index) => ({
      hex,
      name: sp.avoidNames[index] ?? `Avoid color ${index + 1}`,
      border: isLightSwatch(hex) ? LIGHT_SWATCH_BORDER : undefined,
      muted: true,
    }));
  }
  const currentWarmth = season.temps.includes("warm") ? "warm" : "cool";
  const oppositeWarmth = currentWarmth === "warm" ? "cool" : "warm";
  const seasonOrder = SEASON_AVOID_ORDER[season.id] ?? [];
  const orderedSeasons = [
    ...seasonOrder
      .map((seasonId) => seasons.find((candidateSeason) => candidateSeason.id === seasonId))
      .filter((candidateSeason): candidateSeason is Season => Boolean(candidateSeason)),
    ...seasons.filter((candidateSeason) => !seasonOrder.includes(candidateSeason.id)),
  ];
  const seen = new Set<string>();
  const swatches: ResultSwatch[] = [];

  for (const candidateSeason of orderedSeasons) {
    if (candidateSeason.id === season.id || !candidateSeason.temps.includes(oppositeWarmth)) {
      continue;
    }

    for (const hex of candidateSeason.palette) {
      const key = hex.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const colorIndex = candidateSeason.palette.indexOf(hex);
      const colorName = colorIndex >= 0 && candidateSeason.paletteNames?.[colorIndex]
        ? candidateSeason.paletteNames[colorIndex]
        : `${candidateSeason.name} color ${swatches.length + 1}`;
      swatches.push(
        buildResultSwatch({
          hex,
          name: colorName,
          border: isLightSwatch(hex) ? LIGHT_SWATCH_BORDER : undefined,
          muted: true,
        })
      );

      if (swatches.length >= count) return swatches;
    }
  }

  return swatches;
}

export function buildSeasonMetalSwatches(
  season: Season,
  report: ColorIntelligenceReport,
  subSeason?: string
): ResultSwatch[] {
  const sp = subSeason ? findSeasonPalette(subSeason) : undefined;
  const labels = report.jewelry.metals.length > 0
    ? report.jewelry.metals
    : sp?.metals.best ?? SEASON_METAL_LABELS[season.id] ?? [`${season.name} metal`];

  return labels
    .slice(0, 4)
    .map((name) => ({
      name,
      hex: resolveMetalHex(name),
      gradient: resolveMetalGradient(name),
    }));
}

export function buildSeasonNeutralSwatches(
  season: Season,
  report: ColorIntelligenceReport,
  subSeason?: string
): ResultSwatch[] {
  const sp = subSeason ? findSeasonPalette(subSeason) : undefined;
  if (sp && sp.neutrals.length > 0) {
    return sp.neutrals.map(({ hex, name }) =>
      buildResultSwatch({
        name,
        hex,
        border: isLightSwatch(hex) ? LIGHT_SWATCH_BORDER : undefined,
      })
    );
  }

  const reportNeutrals = report.neutralColors.filter((color) => seasonHasColor(season, color));
  if (reportNeutrals.length > 0) {
    return reportNeutrals.map((color) =>
      buildResultSwatch({
        name: color.name,
        hex: color.hex,
        border: isLightSwatch(color.hex) ? LIGHT_SWATCH_BORDER : undefined,
      })
    );
  }

  const labels = SEASON_NEUTRAL_LABELS[season.id] ?? [`${season.name} neutral`];
  return labels
    .slice(0, Math.min(labels.length, season.palette.length))
    .map((name, index) =>
      buildResultSwatch({
        name,
        hex: season.palette[index],
        border: isLightSwatch(season.palette[index]) ? LIGHT_SWATCH_BORDER : undefined,
      })
    );
}

export function buildMakeupColumnsFromSeasonPalette(
  season: Season,
  report: ColorIntelligenceReport,
  subSeason?: string
): MakeupColumns {
  const sp = subSeason ? findSeasonPalette(subSeason) : undefined;

  if (sp) {
    const toSwatch = (e: { hex: string; name: string }): ResultSwatch => ({
      hex: e.hex,
      name: e.name,
      border: isLightSwatch(e.hex) ? LIGHT_SWATCH_BORDER : undefined,
    });
    const reportLips = report.makeup.lips.map((name, i) => ({ name, hex: sp.makeup.lips[i]?.hex ?? sp.palette[i] ?? season.palette[i] }));
    const reportBlush = report.makeup.blush.map((name, i) => ({ name, hex: sp.makeup.cheek[i]?.hex ?? sp.palette[i] ?? season.palette[i] }));
    const reportEyes = report.makeup.eyes.map((name, i) => ({ name, hex: sp.makeup.eyes[i]?.hex ?? sp.palette[i] ?? season.palette[i] }));
    return {
      LIPS: (reportLips.length > 0 ? reportLips : sp.makeup.lips).map(toSwatch),
      CHEEK: (reportBlush.length > 0 ? reportBlush : sp.makeup.cheek).map(toSwatch),
      EYES: (reportEyes.length > 0 ? reportEyes : sp.makeup.eyes).map(toSwatch),
      BASE: sp.makeup.base.map(toSwatch),
    };
  }

  let paletteIndex = 0;
  const nextSwatches = (names: string[], fallback: string): ResultSwatch[] => {
    const labels = names.length > 0 ? names : [fallback];
    return labels
      .slice(0, Math.max(1, Math.min(labels.length, remainingPaletteCount(season, paletteIndex))))
      .map((name) => {
        const hex = season.palette[paletteIndex % season.palette.length];
        paletteIndex += 1;
        return { name, hex };
      });
  };

  return {
    LIPS: nextSwatches(report.makeup.lips, `${report.subSeason || season.name} lip`),
    CHEEK: nextSwatches(report.makeup.blush, `${report.subSeason || season.name} cheek`),
    EYES: nextSwatches(report.makeup.eyes, `${report.subSeason || season.name} eye`),
    BASE: nextSwatches([], `${report.subSeason || season.name} base`),
  };
}

export function buildPreviewColors(season: Season, count = 5, subSeason?: string): string[] {
  const sp = subSeason ? findSeasonPalette(subSeason) : undefined;
  const palette = sp?.palette ?? season.palette;
  if (palette.length === 0) return [];
  return Array.from({ length: count }, (_, index) => palette[index % palette.length]);
}

function seasonHasColor(season: Season, color: ReportColor): boolean {
  const normalized = color.hex.toUpperCase();
  return season.palette.some((hex) => hex.toUpperCase() === normalized);
}

function remainingPaletteCount(season: Season, startIndex: number): number {
  return Math.max(1, season.palette.length - startIndex);
}

function buildResultSwatch(swatch: ResultSwatch): ResultSwatch {
  return {
    hex: swatch.hex,
    name: swatch.name,
    ...(swatch.border ? { border: swatch.border } : {}),
    ...(swatch.muted ? { muted: swatch.muted } : {}),
  };
}

function isLightSwatch(hex: string): boolean {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return false;

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.86;
}
