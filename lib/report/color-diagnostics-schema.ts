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

export const ColorDiagnosticsSchema = z.object({
  families: z.array(ColorFamilyDiagnosticSchema),
  neutralsComment: z.string(),
  makeup: z.object({
    blush: z.array(MakeupShadeSchema),
    lips: z.array(MakeupShadeSchema),
    eyeshadowDay: z.array(MakeupShadeSchema),
    eyeshadowEvening: z.array(MakeupShadeSchema),
  }),
});

export type ColorFamilyDiagnostic = z.infer<typeof ColorFamilyDiagnosticSchema>;
export type MakeupShade = z.infer<typeof MakeupShadeSchema>;
export type ColorDiagnostics = z.infer<typeof ColorDiagnosticsSchema>;
