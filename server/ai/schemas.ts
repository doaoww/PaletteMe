import { z } from "zod";

export const ScanTypeSchema = z.enum([
  "clothing_item",
  "outfit",
  "makeup",
  "product_screenshot",
]);

export type ScanType = z.infer<typeof ScanTypeSchema>;

export const ScanVerdictSchema = z.enum([
  "great",
  "works_with_styling",
  "skip_buying",
  "unclear",
]);

export type ScanVerdict = z.infer<typeof ScanVerdictSchema>;

export const CorrectionFieldSchema = z.enum([
  "category",
  "color",
  "fit",
  "body_goal",
  "style",
  "formality",
  "verdict",
  "makeup_shade",
]);

export type CorrectionField = z.infer<typeof CorrectionFieldSchema>;

export const CorrectionOptionSchema = z.object({
  field: CorrectionFieldSchema,
  label: z.string().min(1),
});

export type CorrectionOption = z.infer<typeof CorrectionOptionSchema>;

export const AnalyzedItemSchema = z.object({
  category: z.string().min(1),
  colors: z.array(z.string().min(1)).default([]),
  colorTemperature: z.enum(["warm", "cool", "neutral", "mixed", "unknown"]),
  formality: z.string().min(1).default("unknown"),
  pattern: z.string().nullable().default(null),
  material: z.string().nullable().default(null),
});

export const ScanResultSchema = z.object({
  scanType: ScanTypeSchema,
  verdict: ScanVerdictSchema,
  score: z.number().int().min(0).max(100),
  confidence: z.number().int().min(0).max(100),
  item: AnalyzedItemSchema,
  reason: z.string().min(8),
  nextAction: z.string().min(3),
  stylingTips: z.array(z.string().min(1)).default([]),
  betterAlternatives: z.array(z.string().min(1)).default([]),
  correctionOptions: z.array(CorrectionOptionSchema).min(1),
});

export type ScanResult = z.infer<typeof ScanResultSchema>;

export const ScanHistoryResultSchema = ScanResultSchema.extend({
  season_id: z.string().min(1).optional().nullable(),
  image_url: z.string().min(1).optional().nullable(),
  image: z
    .object({
      stored: z.boolean(),
      url: z.string().min(1).nullable(),
      mimeType: z.string().min(1).optional(),
    })
    .optional(),
});

export type ScanHistoryResult = z.infer<typeof ScanHistoryResultSchema>;

export const ScanHistoryRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1).optional().nullable(),
  scanType: ScanTypeSchema,
  result: ScanHistoryResultSchema,
  createdAt: z.string().min(1),
});

export type ScanHistoryRecord = z.infer<typeof ScanHistoryRecordSchema>;

export const WardrobeItemSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1).optional().nullable(),
  source: z.enum(["user_upload", "manual", "scan", "product"]),
  name: z.string().min(1),
  category: z.string().min(1),
  colors: z.array(z.string().min(1)).default([]),
  colorTemperature: z.enum(["warm", "cool", "neutral", "mixed", "unknown"]),
  seasonFit: z.array(z.string().min(1)).default([]),
  formality: z.string().min(1).default("unknown"),
  notes: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  correctedByUser: z.boolean().default(false),
});

export type WardrobeItem = z.infer<typeof WardrobeItemSchema>;

export const OutfitItemRoleSchema = z.enum([
  "top",
  "bottom",
  "dress",
  "outerwear",
  "shoe",
  "accessory",
  "makeup",
]);

export const OutfitControlSchema = z.enum([
  "lock_item",
  "swap_item",
  "remove_item",
  "save_outfit",
  "edit_labels",
]);

export const OutfitPlanSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  verdict: ScanVerdictSchema,
  score: z.number().int().min(0).max(100),
  confidence: z.number().int().min(0).max(100),
  reason: z.string().min(8),
  nextAction: z.string().min(3),
  items: z.array(
    z.object({
      wardrobeItemId: z.string().min(1),
      role: OutfitItemRoleSchema,
      locked: z.boolean().default(false),
    })
  ).min(1),
  controls: z.array(OutfitControlSchema).min(1),
});

export type OutfitPlan = z.infer<typeof OutfitPlanSchema>;

const correctionLabels: Record<CorrectionField, string> = {
  category: "wrong item type",
  color: "wrong color",
  fit: "wrong fit read",
  body_goal: "wrong body goal",
  style: "wrong style",
  formality: "wrong occasion",
  verdict: "wrong verdict",
  makeup_shade: "wrong makeup shade",
};

export function createCorrectionOptions(fields: CorrectionField[]): CorrectionOption[] {
  return fields.map((field) => ({
    field,
    label: correctionLabels[field],
  }));
}

export function normalizeConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeScanVerdict(value: string): ScanVerdict {
  const normalized = value.toLowerCase().trim();
  if (["great", "yes", "buy", "wear", "match"].includes(normalized)) return "great";
  if (["maybe", "style", "works", "works_with_styling"].includes(normalized)) {
    return "works_with_styling";
  }
  if (["no", "skip", "avoid", "skip_buying"].includes(normalized)) return "skip_buying";
  return "unclear";
}
