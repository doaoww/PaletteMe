import { z } from "zod";
import { ColorDiagnosticsSchema } from "./color-diagnostics-schema";
export { ColorDiagnosticsSchema };
export type { ColorDiagnostics, ColorFamilyDiagnostic, MakeupShade } from "./color-diagnostics-schema";

// ── Season ranking ────────────────────────────────────────────────────────────

export const SeasonRankSchema = z.object({
  id: z.string(),          // must match SEASON_PALETTES id e.g. "soft-summer"
  name: z.string(),        // "Soft Summer"
  percentage: z.number(),  // 0-100 match score
  reason: z.string(),      // 1-2 sentences of evidence
});

export const BestColorSchema = z.object({
  hex: z.string(),      // "#C4A882"
  name: z.string(),     // "Warm Camel"
  isBest: z.boolean(),  // top 5 = true, gets highlight ring in UI
  explanation: z.string().nullish(),
});

// ── Makeup ────────────────────────────────────────────────────────────────────

export const MakeupComparisonSchema = z.object({
  category: z.enum(["lips", "blush", "eyeshadow", "contour"]),
  categoryLabel: z.string(), // "Lip colour"
  goodShade: z.object({
    hex: z.string(),
    name: z.string(),
    imagePrompt: z.string(), // gpt-image-1 prompt — apply only this shade, keep everything else identical
  }),
  badShade: z.object({
    hex: z.string(),
    name: z.string(),
    imagePrompt: z.string(),
  }),
  explanation: z.string(), // why good works, why bad clashes — plain english, 1-2 sentences
});

// ── Hair ──────────────────────────────────────────────────────────────────────

export const HairOptionSchema = z.object({
  name: z.string(),
  color: z.string().nullish(), // color only, e.g. "Warm Auburn"
  style: z.string().nullish(), // cut/style only, e.g. "soft layers, curtain bangs"
  description: z.string(),
  imagePrompt: z.string(),
});

// ── Mini result (free hook shown before paywall) ──────────────────────────────

export const MiniResultSchema = z.object({
  seasonName: z.string(),
  tagline: z.string(),   // e.g. "Warm · Muted · Medium depth"
  headline: z.string(),  // e.g. "You are a Soft Autumn"
  summary: z.string(),   // 2-3 sentences, personal, specific to what AI sees
  imagePrompt: z.string(),
  imageUrl: z.string().nullish(),
});

// ── Contrast ──────────────────────────────────────────────────────────────────

export const ContrastSchema = z.object({
  level: z.enum(["low", "medium-low", "medium", "medium-high", "high"]),
  explanation: z.string(),
});

// ── Full report ────────────────────────────────────────────────────────────────

export const FullReportSchema = z.object({
  contrast: ContrastSchema.nullish(),
  colorAnalysis: z.object({
    topSeason: SeasonRankSchema,
    alternativeSeasons: z.array(SeasonRankSchema), // 3 close alternatives
    bestColors: z.array(BestColorSchema),           // 8-12 colours
    // AI generates one neutral-draping base image; CSS handles colour overlay
    neutralDrapingPrompt: z.string(),
  }),
  makeupComparisons: z.array(MakeupComparisonSchema), // 3-4 categories
  hairOptions: z.array(HairOptionSchema),             // 2-3 options
  finalLook: z.object({
    description: z.string(),
    outfit: z.string().nullish(),  // e.g. "warm terracotta midi dress, camel coat"
    jewelry: z.string().nullish(), // e.g. "gold and warm bronze tones"
    imagePrompt: z.string(),
  }),
  colorDiagnostics: ColorDiagnosticsSchema.nullish(),
});

export const AnalysisResultSchema = z.object({
  miniResult: MiniResultSchema,
  fullReport: FullReportSchema,
});

export type SeasonRank       = z.infer<typeof SeasonRankSchema>;
export type BestColor        = z.infer<typeof BestColorSchema>;
export type MakeupComparison = z.infer<typeof MakeupComparisonSchema>;
export type HairOption       = z.infer<typeof HairOptionSchema>;
export type MiniResult       = z.infer<typeof MiniResultSchema>;
export type FullReport       = z.infer<typeof FullReportSchema>;
export type AnalysisResult   = z.infer<typeof AnalysisResultSchema>;
