export const runtime = "nodejs";
export const maxDuration = 90;

import { z } from "zod";
import { runStructuredStyleResponse } from "@/server/services/openai";
import { AnalysisResultSchema } from "@/lib/report/report-schema";
import { scoreColorSeasonCandidates } from "@/lib/analysis/color-season-scoring";
import { applyConfirmedSeasonToReport } from "@/lib/report/confirmed-season";
import { SEASON_PALETTE_REFERENCE } from "@/lib/report/season-palettes";
import { EXTRACTION_INSTRUCTIONS, REPORT_INSTRUCTIONS } from "./prompts";
import { validateGeneratedReport } from "@/lib/report/validate-report";
import { createClient } from "@/lib/db/supabase-server";
import { claimGenerationRow, finalizeGeneration, type LockRow } from "@/lib/server/generation-lock";
import { checkRateLimit } from "@/lib/shared/rate-limit";

export const REPORT_SECTION_VALUES = ["colors", "hair", "makeup", "glasses", "outfits"] as const;
export type ReportSection = typeof REPORT_SECTION_VALUES[number];

const QuizAnswersSchema = z.object({
  occasion:       z.enum(["everyday", "work", "events", "everything"]).nullish(),
  styleConcern:   z.enum(["buy-wrong", "cant-combine", "want-refresh", "understand-colors"]).nullish(),
  reportSections: z.array(z.enum(REPORT_SECTION_VALUES)).nullish(),
});

const RequestSchema = z.object({
  photoDataUrl: z.string(),
  wardrobeType: z.enum(["woman", "man", "other"]),
  quizAnswers:  QuizAnswersSchema.nullish(),
});

const SEASON_SUGGESTION_VALUES = [
  "Light Spring", "True Spring", "Bright Spring",
  "Light Summer", "True Summer", "Soft Summer",
  "Soft Autumn", "True Autumn", "Dark Autumn",
  "Dark Winter", "True Winter", "Bright Winter",
] as const;

const ExtractionSchema = z.object({
  undertone: z.enum(["warm", "cool", "neutral"]),
  depth: z.enum(["light", "medium", "deep"]),
  contrast: z.enum(["low", "medium-low", "medium", "medium-high", "high"]),
  chroma: z.enum(["muted", "balanced", "clear"]),
  hairColor: z.string(),
  eyeColor: z.string(),
  skinDescription: z.string(),
  photoQuality: z.enum(["usable", "borderline", "unusable"]),
  qualityNote: z.string().nullish(),
  seasonSuggestion: z.enum(SEASON_SUGGESTION_VALUES).nullish(),
  seasonSuggestionConfidence: z.enum(["strong", "moderate", "uncertain"]).nullish(),
  faceShape: z.enum(["oval", "round", "square", "heart", "oblong", "diamond", "triangle"]).nullish(),
  foreheadWidth: z.enum(["narrow", "medium", "wide"]).nullish(),
  jawLine: z.enum(["soft", "defined", "angular"]).nullish(),
  chinShape: z.enum(["pointed", "round", "square"]).nullish(),
  featureScale: z.enum(["delicate", "medium", "bold"]).nullish(),
  hairTexture: z.enum(["fine", "medium", "thick"]).nullish(),
  hairWave: z.enum(["straight", "wavy", "curly", "coily"]).nullish(),
  eyeShape: z.enum(["almond", "round", "hooded", "monolid"]).nullish(),
  eyeSet: z.enum(["wide-set", "average", "close-set"]).nullish(),
  lipFullness: z.enum(["thin", "medium", "full"]).nullish(),
});

function buildSeasonId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function normalizeContrastForScoring(c: string): "low" | "medium" | "high" {
  if (c === "low" || c === "medium-low") return "low";
  if (c === "medium" || c === "medium-high") return "medium";
  return "high";
}

async function extractTraits(image: { mimeType: string; base64: string; detail: "high" }) {
  return runStructuredStyleResponse({
    schema: ExtractionSchema,
    schemaName: "TraitExtraction",
    instructions: EXTRACTION_INSTRUCTIONS,
    prompt: "Observe and record the physical traits of the person in this photo. Report only what you literally see.",
    image,
    maxOutputTokens: 1200,
    promptCacheKey: "trait-extract-v5",
  });
}

async function generateReport(
  image: { mimeType: string; base64: string; detail: "high" },
  prompt: string,
) {
  return runStructuredStyleResponse({
    schema: AnalysisResultSchema,
    schemaName: "AnalysisResult",
    instructions: REPORT_INSTRUCTIONS,
    prompt,
    image,
    maxOutputTokens: 16000,
    promptCacheKey: "report-generate-v16",
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const rate = await checkRateLimit(`report-analyze:${user.id}`, 5, 60 * 60 * 1000);
  if (!rate.allowed) {
    return Response.json({ error: "Too many report attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { photoDataUrl, wardrobeType, quizAnswers } = parsed.data;

  const match = photoDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return Response.json({ error: "Invalid photo format" }, { status: 400 });
  }
  const [, mimeType, base64] = match;
  const image = { mimeType: mimeType!, base64: base64!, detail: "high" as const };

  // ── Claim the style_reports row before spending anything ────────────────────
  const claim = await claimGenerationRow<LockRow & { full_report?: unknown; mini_result?: unknown }>({
    supabase,
    table: "style_reports",
    match: { user_id: user.id },
  });

  if (claim.outcome === "still-generating") {
    return Response.json({ error: "Your report is already being generated. Please wait a moment." }, { status: 409 });
  }
  if (claim.outcome === "attempts-exhausted") {
    return Response.json({ error: "Too many failed attempts. Please contact support." }, { status: 429 });
  }
  if (claim.outcome === "use-cached") {
    const cached = claim.row.full_report as z.infer<typeof AnalysisResultSchema> | undefined;
    if (!cached) {
      return Response.json({ error: "Report not ready yet. Please try again shortly." }, { status: 409 });
    }
    const enc = new TextEncoder();
    const topId = cached.fullReport.colorAnalysis.topSeason.id;
    const palette8 = (SEASON_PALETTE_REFERENCE[topId] ?? []).slice(0, 8).map(c => c.hex);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(enc.encode(JSON.stringify({
          type: "season",
          seasonId: topId,
          seasonName: cached.fullReport.colorAnalysis.topSeason.name,
          palette: palette8,
        }) + "\n"));
        controller.enqueue(enc.encode(JSON.stringify({ type: "report", data: cached }) + "\n"));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache, no-store" },
    });
  }

  // claim.outcome === "owned" -> we hold the lock, proceed to generate.

  let traits: z.infer<typeof ExtractionSchema>;
  try {
    traits = await extractTraits(image);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/report/analyze] trait extraction failed:", message);
    await finalizeGeneration({ supabase, table: "style_reports", match: { user_id: user.id }, patch: { status: "failed" } });
    return Response.json({ error: "Analysis failed. Please try again.", detail: message }, { status: 500 });
  }

  if (traits.photoQuality === "unusable") {
    await finalizeGeneration({ supabase, table: "style_reports", match: { user_id: user.id }, patch: { status: "failed" } });
    return Response.json(
      {
        error: "Photo unusable",
        retake: true,
        detail: traits.qualityNote ?? "Please upload a clear, well-lit photo with your face visible and unobstructed.",
      },
      { status: 422 },
    );
  }

  const scored = scoreColorSeasonCandidates({
    traits: {
      undertone: traits.undertone,
      depth: traits.depth,
      contrast: normalizeContrastForScoring(traits.contrast),
      chroma: traits.chroma,
    },
    evidence: {
      skin: traits.skinDescription,
      hair: traits.hairColor,
      eyes: traits.eyeColor,
    },
    modelSubSeason: traits.seasonSuggestion ?? undefined,
    modelSeasonConfidence: traits.seasonSuggestionConfidence ?? undefined,
  });

  const top = scored[0]!;
  const alts = scored.slice(1, 3);
  const topId = buildSeasonId(top.subSeason);
  const alt1 = alts[0]!;
  const alt2 = alts[1]!;
  const confirmedSeason = {
    topSeason: { id: topId, name: top.subSeason, percentage: top.likelihood, reason: top.reason },
    alternativeSeasons: [
      { id: buildSeasonId(alt1.subSeason), name: alt1.subSeason, percentage: alt1.likelihood, reason: alt1.reason },
      { id: buildSeasonId(alt2.subSeason), name: alt2.subSeason, percentage: alt2.likelihood, reason: alt2.reason },
    ],
  };

  const paletteRef = (SEASON_PALETTE_REFERENCE[topId] ?? []).map(c => `${c.name} ${c.hex}`).join(" · ");

  const faceGeoLines = [
    `Face shape: ${traits.faceShape ?? "assess from photo"}`,
    `Forehead: ${traits.foreheadWidth ?? "assess from photo"} | Jaw: ${traits.jawLine ?? "assess from photo"} | Chin: ${traits.chinShape ?? "assess from photo"}`,
    `Feature scale: ${traits.featureScale ?? "assess from photo"}`,
    traits.hairTexture || traits.hairWave
      ? `Hair texture: ${[traits.hairTexture, traits.hairWave].filter(Boolean).join(", ")}`
      : `Hair texture: assess from photo`,
    `Eye shape: ${traits.eyeShape ?? "assess from photo"} | Eye set: ${traits.eyeSet ?? "assess from photo"}`,
    `Lip fullness: ${traits.lipFullness ?? "assess from photo"}`,
  ].join("\n");

  const reportPrompt = `CONFIRMED SEASON AND TRAITS (use these exactly — do not change):
Season: ${top.subSeason} (id: "${topId}", family: ${top.seasonId})
Undertone: ${traits.undertone}
Depth: ${traits.depth}
Contrast: ${traits.contrast} ← CONFIRMED. Use this EXACT value as the "level" field in PART 2 (contrast section). Do not re-assess contrast from the photo.
Chroma: ${traits.chroma}
Current hair colour: ${traits.hairColor}
Eye colour: ${traits.eyeColor}
Skin: ${traits.skinDescription}

CONFIRMED FACE GEOMETRY — single source of truth for PART 6 (hair) and PART 10 (glasses). Do not re-derive these from the photo. Use them verbatim in every section that references face structure:
${faceGeoLines}

Season palette reference (anchor these hex values for PART 3 bestColors — expand from them, stay within this colour temperature and saturation range):
${paletteRef}

In colorAnalysis output you MUST use exactly:
- topSeason.id = "${confirmedSeason.topSeason.id}"
- topSeason.name = "${confirmedSeason.topSeason.name}"
- topSeason.percentage = ${confirmedSeason.topSeason.percentage}
- topSeason.reason = "${confirmedSeason.topSeason.reason}"
- alternativeSeasons[0]: { id: "${confirmedSeason.alternativeSeasons[0]!.id}", name: "${confirmedSeason.alternativeSeasons[0]!.name}", percentage: ${confirmedSeason.alternativeSeasons[0]!.percentage}, reason: "${confirmedSeason.alternativeSeasons[0]!.reason}" }
- alternativeSeasons[1]: { id: "${confirmedSeason.alternativeSeasons[1]!.id}", name: "${confirmedSeason.alternativeSeasons[1]!.name}", percentage: ${confirmedSeason.alternativeSeasons[1]!.percentage}, reason: "${confirmedSeason.alternativeSeasons[1]!.reason}" }

Wardrobe type: ${wardrobeType}
${wardrobeType === "man" ? `IMPORTANT — wardrobeType is "man": (1) return makeupComparisons as an empty array []; set colorDiagnostics.makeup to null — do NOT generate any makeup or cosmetics content. (2) DO generate the grooming section (PART 13) — beard shape, beard color, skin note, and 3 options. This replaces makeup for men. (3) If a required schema key is named "makeup" inside faceArchetype.stylingNotes or signatureSummary, fill it with grooming / beard guidance, not cosmetics.` : ""}
${wardrobeType !== "man" ? `wardrobeType is "${wardrobeType}" — return grooming as null.` : ""}
${quizAnswers?.occasion ? `Primary occasion: ${quizAnswers.occasion} — tailor clothing and accessory recommendations to this context.` : ""}
${quizAnswers?.styleConcern ? `Style challenge: ${quizAnswers.styleConcern} — address this explicitly in the relevant report sections. Make the person feel understood.` : ""}

Generate the complete personal style report for a confirmed ${top.subSeason}. Apply the LANGUAGE RULES from your instructions — plain English, no technical terms, every recommendation includes a "because" referencing something you observed.`;

  const enc = new TextEncoder();
  const palette8 = (SEASON_PALETTE_REFERENCE[topId] ?? []).slice(0, 8).map(c => c.hex);

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(enc.encode(JSON.stringify({
        type: "season",
        seasonId: topId,
        seasonName: top.subSeason,
        palette: palette8,
      }) + "\n"));

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const result = await generateReport(image, reportPrompt);
          const final  = applyConfirmedSeasonToReport(result, confirmedSeason);
          const validation = validateGeneratedReport(final, { wardrobeType });

          if (validation.warnings.length > 0) {
            console.warn(`[/api/report/analyze] quality warnings (attempt ${attempt}):`, validation.warnings);
          }

          if (!validation.valid) {
            console.error(`[/api/report/analyze] CRITICAL quality failures (attempt ${attempt}):`, validation.critical);
            if (attempt < 2) {
              await new Promise(r => setTimeout(r, 1500));
              continue;
            }
            console.error("[/api/report/analyze] proceeding with quality-failed report after retry exhausted");
          }

          await finalizeGeneration({
            supabase,
            table: "style_reports",
            match: { user_id: user.id },
            patch: {
              status: "done",
              full_report: final,
              mini_result: final.miniResult,
              wardrobe_type: wardrobeType,
              quiz_answers: quizAnswers ?? null,
            },
          });

          controller.enqueue(enc.encode(JSON.stringify({ type: "report", data: final }) + "\n"));
          break;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const stack   = err instanceof Error ? err.stack : undefined;
          console.error(`[/api/report/analyze] report attempt ${attempt} failed:`, message);
          if (stack) console.error(stack.slice(0, 800));

          if (attempt === 2) {
            await finalizeGeneration({ supabase, table: "style_reports", match: { user_id: user.id }, patch: { status: "failed" } });
            controller.enqueue(enc.encode(JSON.stringify({
              type: "error",
              message: "Report generation failed. Please try again.",
            }) + "\n"));
          } else {
            await new Promise(r => setTimeout(r, 1500));
          }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache, no-store" },
  });
}
