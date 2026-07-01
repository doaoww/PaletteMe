import { z } from "zod";

const VerdictSchema = z.enum(["best", "okay", "avoid"]);
const ContrastLevelSchema = z.enum(["low", "medium-low", "medium", "medium-high", "high"]);

const SeasonCardSchema = z.object({
  season: z.string(),
  confidence: z.number(),
  drapingHex: z.string(),
  explanation: z.string(),
});

const ColorOptionSchema = z.object({
  name: z.string(),
  hex: z.string(),
  verdict: VerdictSchema,
  explanation: z.string(),
});

const HairstyleSchema = z.object({
  name: z.string(),
  description: z.string(),
  faceShapeReason: z.string(),
  verdict: VerdictSchema,
  generatedImageUrl: z.string().nullish(),
});

export const LookLabSchema = z.object({
  colorSeason: z.object({
    best: SeasonCardSchema,
    alternatives: z.array(SeasonCardSchema),
  }),
  metals: z.object({
    gold: z.object({ score: z.number(), explanation: z.string() }),
    silver: z.object({ score: z.number(), explanation: z.string() }),
  }),
  contrast: z.object({
    level: ContrastLevelSchema,
    explanation: z.string(),
  }),
  blush: z.array(ColorOptionSchema),
  lips: z.array(ColorOptionSchema),
  eyeshadow: z.array(ColorOptionSchema),
  hairColor: z.array(ColorOptionSchema),
  hairstyles: z.array(HairstyleSchema),
});

export type LookLabData = z.infer<typeof LookLabSchema>;
export type SeasonCard = z.infer<typeof SeasonCardSchema>;
export type ColorOption = z.infer<typeof ColorOptionSchema>;
export type Hairstyle = z.infer<typeof HairstyleSchema>;
