import { z } from "zod";
import { ColorDiagnosticsSchema } from "./color-diagnostics-schema";
export { ColorDiagnosticsSchema };
export type { ColorDiagnostics, ColorFamilyDiagnostic, MakeupShade } from "./color-diagnostics-schema";

// ── Season ranking ────────────────────────────────────────────────────────────

export const SeasonRankSchema = z.object({
  id: z.string(),
  name: z.string(),
  percentage: z.number(),
  reason: z.string(),
});

export const BestColorSchema = z.object({
  hex: z.string(),
  name: z.string(),
  isBest: z.boolean(),
  explanation: z.string().nullish(),
});

export const AvoidColorSchema = z.object({
  hex: z.string(),
  name: z.string(),
  explanation: z.string(),
});

// ── Makeup ────────────────────────────────────────────────────────────────────

export const MakeupComparisonSchema = z.object({
  category: z.enum(["lips", "blush", "eyeshadow", "contour"]),
  categoryLabel: z.string(),
  goodShade: z.object({
    hex: z.string(),
    name: z.string(),
    imagePrompt: z.string(),
  }),
  badShade: z.object({
    hex: z.string(),
    name: z.string(),
    imagePrompt: z.string(),
  }),
  explanation: z.string(),
  avoidShades: z.array(z.object({
    hex: z.string(),
    name: z.string(),
    reason: z.string(),
  })).nullish(),
});

// ── Hair ──────────────────────────────────────────────────────────────────────

export const HairOptionSchema = z.object({
  name: z.string(),
  color: z.string().nullish(),
  style: z.string().nullish(),
  description: z.string(),
  imagePrompt: z.string(),
});

// ── Mini result ───────────────────────────────────────────────────────────────

export const MiniResultSchema = z.object({
  seasonName: z.string(),
  tagline: z.string(),
  headline: z.string(),
  summary: z.string(),
  imagePrompt: z.string(),
  imageUrl: z.string().nullish(),
});

// ── Contrast ──────────────────────────────────────────────────────────────────

export const ContrastSchema = z.object({
  level: z.enum(["low", "medium-low", "medium", "medium-high", "high"]),
  explanation: z.string(),
});

// ── Glasses ───────────────────────────────────────────────────────────────────

export const GlassesCardSchema = z.object({
  shape: z.string(),    // "Soft rounded acetate"
  why: z.string(),      // 1-2 sentences: why this works for this face
  colors: z.string(),   // recommended frame colors
  avoid: z.string(),    // one thing to avoid with this style
});

export const GlassesSchema = z.object({
  bestShapes: z.array(z.string()),  // e.g. ["oval", "round", "soft cat-eye"]
  frameThickness: z.string(),       // "thin to medium"
  frameColors: z.string(),          // "warm tortoise, gold, warm brown"
  material: z.string(),             // "acetate or thin metal"
  avoid: z.string(),                // "heavy square frames, stark black"
  cards: z.array(GlassesCardSchema), // 3-4 cards
});

// ── Face Style Archetype ──────────────────────────────────────────────────────

export const ArchetypeInfluenceSchema = z.object({
  name: z.string(),
  percentage: z.number(),
});

export const FaceArchetypeSchema = z.object({
  primary: z.string(),                                  // "Soft Gamine"
  tagline: z.string(),                                  // 1 sentence description
  reason: z.string(),                                   // 2-3 sentences why, based on features
  facialFeatures: z.array(z.string()),                  // ["expressive eyes", "compact proportions"]
  secondaryInfluences: z.array(ArchetypeInfluenceSchema), // [{name:"Romantic", percentage:62}]
  stylingNotes: z.object({
    hair: z.string(),
    glasses: z.string(),
    accessories: z.string(),
    makeup: z.string(),
    outfits: z.string(),
  }),
});

// ── Signature Summary ─────────────────────────────────────────────────────────

export const SignatureSummarySchema = z.object({
  colors: z.string(),       // "warm muted earth tones — terracotta, camel, olive"
  neutral: z.string(),      // "warm camel or soft ivory"
  makeup: z.string(),       // "peachy blush, warm brown lids, nude-rose lip"
  hair: z.string(),         // "warm caramel tones, soft layers"
  glasses: z.string(),      // "oval or rounded, warm tortoise acetate"
  archetype: z.string(),    // "Soft Natural-inspired"
  aesthetic: z.string(),    // "Warm editorial, effortlessly relaxed"
  summary: z.string(),      // one sentence style identity
});

// ── Jewelry / Metals ─────────────────────────────────────────────────────────

export const MetalOptionSchema = z.object({
  metal:  z.enum(["Silver", "Yellow Gold", "White Gold", "Rose Gold"]),
  reason: z.string(),
});

export const MetalRecsSchema = z.object({
  best:        z.array(MetalOptionSchema),
  avoid:       z.array(MetalOptionSchema),
  explanation: z.string(),
});

// ── Grooming (men only) ───────────────────────────────────────────────────────

export const GroomingOptionSchema = z.object({
  style:   z.string(),
  why:     z.string(),
  verdict: z.enum(["best", "okay", "avoid"]),
});

export const GroomingSchema = z.object({
  beardShape:     z.string(),
  beardShapeWhy:  z.string(),
  beardColor:     z.string(),
  beardColorHex:  z.string().nullish(),
  beardColorWhy:  z.string(),
  skinNote:       z.string(),
  options:        z.array(GroomingOptionSchema),
});

// ── Full report ────────────────────────────────────────────────────────────────

export const FullReportSchema = z.object({
  contrast: ContrastSchema.nullish(),
  colorAnalysis: z.object({
    topSeason: SeasonRankSchema,
    alternativeSeasons: z.array(SeasonRankSchema),
    bestColors: z.array(BestColorSchema),
    avoidColors: z.array(AvoidColorSchema).nullish(),
    neutralDrapingPrompt: z.string().nullish(),
  }),
  makeupComparisons: z.array(MakeupComparisonSchema),
  hairOptions: z.array(HairOptionSchema),
  finalLook: z.object({
    description: z.string(),
    outfit: z.string().nullish(),
    jewelry: z.string().nullish(),
    imagePrompt: z.string(),
  }),
  colorDiagnostics: ColorDiagnosticsSchema.nullish(),
  glasses: GlassesSchema.nullish(),
  faceArchetype: FaceArchetypeSchema.nullish(),
  signatureSummary: SignatureSummarySchema.nullish(),
  grooming: GroomingSchema.nullish(),
  metals: MetalRecsSchema.nullish(),
});

export const AnalysisResultSchema = z.object({
  miniResult: MiniResultSchema,
  fullReport: FullReportSchema,
});

export type SeasonRank          = z.infer<typeof SeasonRankSchema>;
export type BestColor           = z.infer<typeof BestColorSchema>;
export type AvoidColor          = z.infer<typeof AvoidColorSchema>;
export type MakeupComparison    = z.infer<typeof MakeupComparisonSchema>;
export type HairOption          = z.infer<typeof HairOptionSchema>;
export type MiniResult          = z.infer<typeof MiniResultSchema>;
export type GlassesCard         = z.infer<typeof GlassesCardSchema>;
export type Glasses             = z.infer<typeof GlassesSchema>;
export type ArchetypeInfluence  = z.infer<typeof ArchetypeInfluenceSchema>;
export type FaceArchetype       = z.infer<typeof FaceArchetypeSchema>;
export type SignatureSummary    = z.infer<typeof SignatureSummarySchema>;
export type GroomingOption      = z.infer<typeof GroomingOptionSchema>;
export type Grooming            = z.infer<typeof GroomingSchema>;
export type MetalOption         = z.infer<typeof MetalOptionSchema>;
export type MetalRecs           = z.infer<typeof MetalRecsSchema>;
export type FullReport          = z.infer<typeof FullReportSchema>;
export type AnalysisResult      = z.infer<typeof AnalysisResultSchema>;
