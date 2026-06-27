import { z } from "zod";

export const ColorFamilyDiagnosticSchema = z.object({
  id: z.enum(["warm", "cool", "bright", "muted", "light", "deep"]),
  comment: z.string(),
  isWinner: z.boolean(),
});

export const MakeupShadeSchema = z.object({
  hex: z.string(),
  name: z.string(),
  explanation: z.string(),
});

export const NeutralShadeSchema = z.object({
  hex: z.string(),
  name: z.string(),
  comment: z.string(),
});

export const ColorDiagnosticsSchema = z.object({
  families: z.array(ColorFamilyDiagnosticSchema),
  neutrals: z.array(NeutralShadeSchema),
  neutralsComment: z.string().nullish(),  // kept for backward compat with old localStorage data
  makeup: z.object({
    blush: z.array(MakeupShadeSchema),
    lips: z.array(MakeupShadeSchema),
    eyeshadowDay: z.array(MakeupShadeSchema),
    eyeshadowEvening: z.array(MakeupShadeSchema),
  }),
});

export type ColorFamilyDiagnostic = z.infer<typeof ColorFamilyDiagnosticSchema>;
export type MakeupShade = z.infer<typeof MakeupShadeSchema>;
export type NeutralShade = z.infer<typeof NeutralShadeSchema>;
export type ColorDiagnostics = z.infer<typeof ColorDiagnosticsSchema>;
