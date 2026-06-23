// Stage 1 of two-stage analysis.
// Runs steps 1-4 (quality gate, face, body, style profile) + mini-result generation.
// Returns fast (~15-20 sec) so the user sees results immediately.
// The client then calls /api/style-analysis/full with the returned profileData.

import { NextResponse } from "next/server";
import { runStructuredStyleResponse, getConfiguredStyleModel } from "@/lib/server/openai";
import { computeStyleScores } from "@/lib/style-features-scoring";
import { deriveColorSeason } from "@/lib/style-analysis-color-bridge";
import { PhotoQualitySchema, RawFaceFeaturesSchema } from "@/lib/style-features-schema";
import { BodyAnalysisSchema, StyleProfileSchema, MiniResultSchema } from "@/lib/style-analysis-schema";
import { PHOTO_QUALITY_INSTRUCTIONS } from "@/lib/prompts/photo-quality";
import { FACE_ANALYSIS_INSTRUCTIONS } from "@/lib/prompts/face-analysis";
import {
  BODY_ANALYSIS_VISION_INSTRUCTIONS,
  buildBodyAnalysisTextPrompt,
} from "@/lib/prompts/body-analysis";
import {
  buildStyleProfileInstructions,
  buildStyleProfilePrompt,
} from "@/lib/prompts/style-profile";
import {
  buildMiniResultInstructions,
  buildMiniResultPrompt,
} from "@/lib/prompts/mini-result-composer";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

function validateImage(file: Blob, fieldName: string): NextResponse | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: `${fieldName}: only JPG, PNG, or WebP supported.` }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `${fieldName}: image must be 10 MB or smaller.` }, { status: 400 });
  }
  return null;
}

const QuizSchema = z.object({
  gender: z.enum(["woman", "man", "other"]).optional(),
  bodyType: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  bodyFocusArea: z.string().optional(),
  styleGoal: z.string().optional(),
  styleWords: z.array(z.string()).optional(),
  occasions: z.array(z.string()).optional(),
  currentChallenges: z.array(z.string()).optional(),
  budget: z.string().optional(),
  ageRange: z.string().optional(),
  styleMood: z.string().optional(),
  adventureLevel: z.enum(["safe", "balanced", "bold"]).optional(),
  countryCode: z.string().optional(),
  city: z.string().optional(),
}).passthrough();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const faceFile = formData.get("facePhoto");
    const bodyFile = formData.get("bodyPhoto");
    const quizRaw = formData.get("quiz");

    if (!faceFile || !(faceFile instanceof Blob)) {
      return NextResponse.json({ error: "A face photo is required." }, { status: 400 });
    }
    const faceValidation = validateImage(faceFile, "Face photo");
    if (faceValidation) return faceValidation;

    let parsedQuiz: z.infer<typeof QuizSchema>;
    try {
      parsedQuiz = QuizSchema.parse(JSON.parse(quizRaw as string));
    } catch {
      return NextResponse.json({ error: "Invalid quiz data." }, { status: 400 });
    }

    const hasBodyPhoto = bodyFile instanceof Blob && bodyFile.size > 0;
    if (hasBodyPhoto) {
      const bodyValidation = validateImage(bodyFile, "Body photo");
      if (bodyValidation) return bodyValidation;
    }

    const faceBase64 = await blobToBase64(faceFile);
    const faceImage = { mimeType: faceFile.type, base64: faceBase64, detail: "high" as const };
    const model = getConfiguredStyleModel();

    const rawWardrobeType = (parsedQuiz as Record<string, unknown>).wardrobeType as string | undefined;
    const gender: "woman" | "man" | "other" =
      parsedQuiz.gender ??
      (rawWardrobeType === "menswear" || rawWardrobeType === "men" ? "man"
        : rawWardrobeType === "womenswear" || rawWardrobeType === "women" ? "woman"
        : "other");

    const bodyType: string =
      parsedQuiz.bodyType ??
      ((parsedQuiz as Record<string, unknown>).bodyShape as string | undefined) ??
      "unknown";

    // ── Step 1: Quality gate ──────────────────────────────────────────────────
    const quality = await runStructuredStyleResponse({
      schema: PhotoQualitySchema,
      schemaName: "PhotoQuality",
      instructions: PHOTO_QUALITY_INSTRUCTIONS,
      prompt: "Assess this photo for face analysis suitability.",
      image: faceImage,
      model,
      maxOutputTokens: 400,
    });

    if (quality.imageUsability === "unusable") {
      return NextResponse.json(
        { error: "retake", retakeReason: quality.recommendation, issues: quality.issues },
        { status: 422 }
      );
    }

    const retakeSuggestion = quality.imageUsability === "borderline"
      ? (quality.retakeSuggestion ?? "Your photo could be a bit clearer — a retake might sharpen the results.")
      : null;

    // ── Steps 2+3: Face + body in parallel ───────────────────────────────────
    const bodyAnalysisPromise: Promise<z.infer<typeof BodyAnalysisSchema>> = hasBodyPhoto
      ? blobToBase64(bodyFile).then((bodyBase64) =>
          runStructuredStyleResponse({
            schema: BodyAnalysisSchema,
            schemaName: "BodyAnalysis",
            instructions: BODY_ANALYSIS_VISION_INSTRUCTIONS,
            prompt: "Analyze body proportions. Report only structural observations.",
            image: { mimeType: bodyFile.type, base64: bodyBase64, detail: "high" as const },
            model,
            maxOutputTokens: 500,
          })
        )
      : runStructuredStyleResponse({
          schema: BodyAnalysisSchema,
          schemaName: "BodyAnalysis",
          instructions: "Infer body proportions from self-reported data only. Keep confidence low (50-65).",
          prompt: buildBodyAnalysisTextPrompt({
            bodyType,
            height: ((parsedQuiz as Record<string, unknown>).heightCm as string | undefined) ?? parsedQuiz.height ?? "",
            weight: ((parsedQuiz as Record<string, unknown>).weightKg as string | undefined) ?? parsedQuiz.weight,
            bodyFocusArea: parsedQuiz.bodyFocusArea ?? ((parsedQuiz as Record<string, unknown>).styleChallenge as string | undefined) ?? "",
            gender,
          }),
          model,
          maxOutputTokens: 400,
        });

    const [faceFeatures, bodyAnalysis] = await Promise.all([
      runStructuredStyleResponse({
        schema: RawFaceFeaturesSchema,
        schemaName: "RawFaceFeatures",
        instructions: FACE_ANALYSIS_INSTRUCTIONS,
        prompt: "Extract all facial features. Report only what you observe — no style advice.",
        image: faceImage,
        model,
        maxOutputTokens: 900,
      }),
      bodyAnalysisPromise,
    ]);

    if (faceFeatures.confidence < 45) {
      return NextResponse.json(
        { error: "retake", retakeReason: "Photo wasn't clear enough. Try a well-lit photo facing the camera directly.", issues: ["low confidence"] },
        { status: 422 }
      );
    }

    const computedScores = computeStyleScores(faceFeatures);

    // ── Step 1.5: Deterministic color season ─────────────────────────────────
    const colorBridge = deriveColorSeason(
      {
        hairDarkness: faceFeatures.hairDarkness,
        skinBrightness: faceFeatures.skinBrightness,
        eyeIntensity: faceFeatures.eyeIntensity,
        hairColorDesc: faceFeatures.hairColorDesc,
        skinToneDesc: faceFeatures.skinToneDesc,
        eyeColorDesc: faceFeatures.eyeColorDesc,
      },
      {
        contrastScore: computedScores.contrastScore,
        contrastLevel: computedScores.contrastLevel,
      },
    );

    // ── Step 4: Style profile ─────────────────────────────────────────────────
    const styleProfile = await runStructuredStyleResponse({
      schema: StyleProfileSchema,
      schemaName: "StyleProfile",
      instructions: buildStyleProfileInstructions(gender),
      prompt: buildStyleProfilePrompt({
        faceFeatures,
        computedScores,
        bodyAnalysis,
        quiz: parsedQuiz,
        lockedSeason: colorBridge.locked ? colorBridge.season : undefined,
        derivedUndertone: colorBridge.derivedUndertone,
      }),
      model,
      maxOutputTokens: 1800,
    });

    // ── Step 4b: Mini-result (small fast call) ────────────────────────────────
    const miniResult = await runStructuredStyleResponse({
      schema: MiniResultSchema,
      schemaName: "MiniResult",
      instructions: buildMiniResultInstructions(gender),
      prompt: buildMiniResultPrompt({
        styleProfile: styleProfile as unknown as Record<string, unknown>,
        faceFeatures: faceFeatures as unknown as Record<string, unknown>,
        computedScores: computedScores as unknown as Record<string, unknown>,
        bodyAnalysis: bodyAnalysis as unknown as Record<string, unknown>,
        quiz: parsedQuiz as unknown as Record<string, unknown>,
      }),
      model,
      maxOutputTokens: 1800,
    });

    // ── Return mini-result + profile data for full report call ─────────────────
    // profileData is stored client-side and passed to /api/style-analysis/full
    return NextResponse.json({
      miniResult,
      profileData: {
        styleProfile,
        faceFeatures,
        bodyAnalysis,
        computedScores,
        gender,
        colorBridgeResult: colorBridge,
      },
      meta: {
        kibbeType: styleProfile.kibbeType,
        kibbeConfidence: styleProfile.kibbeConfidence,
        colorSeason: colorBridge.locked ? colorBridge.season : styleProfile.colorSeasonFamily,
        colorSeasonLocked: colorBridge.locked,
        colorSeasonConfidence: colorBridge.confidence,
        contrastLevel: computedScores.contrastLevel,
        softnessLevel: computedScores.softnessLevel,
        facePhotoQuality: quality.qualityScore,
        bodyPhotoUsed: hasBodyPhoto,
        skinType: faceFeatures.skinType,
        skinConcerns: faceFeatures.skinConcerns,
        location: { countryCode: parsedQuiz.countryCode, city: parsedQuiz.city },
      },
      retakeSuggestion,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[style-analysis/mini] FAILED:", message);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "development"
          ? `Analysis error: ${message}`
          : "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
