export const runtime = "nodejs";
export const maxDuration = 90;

import { z } from "zod";
import { runStructuredStyleResponse } from "@/server/services/openai";
import { AnalysisResultSchema } from "@/lib/report/report-schema";
import { applyConfirmedSeasonToReport } from "@/lib/report/confirmed-season";
import { SEASON_PALETTE_REFERENCE } from "@/lib/report/season-palettes";
import { REPORT_INSTRUCTIONS } from "../analyze/prompts";
import { validateGeneratedReport } from "@/lib/report/validate-report";
import { createClient } from "@/lib/db/supabase-server";
import { claimGenerationRow, finalizeGeneration, type LockRow } from "@/lib/server/generation-lock";
import { checkRateLimit } from "@/lib/shared/rate-limit";
import { isFreeTestingMode } from "@/lib/billing/premium";
import {
  QuizAnswersSchema,
  ExtractionSchema,
  ScoredSeasonSchema,
  buildSeasonId,
} from "../shared";

async function hasPolarEntitlement(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("report_entitlements")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

// Paid full-report phase: only reachable after the user unlocks past the mini-result
// paywall. Never fires automatically — the client explicitly calls this once, after
// /api/report/analyze already showed the free season/celebrity preview. Reuses the
// exact traits + scored-season data the mini phase already computed (sent back by the
// client) instead of re-running trait extraction, so this call is pure incremental cost
// on top of the mini phase, never a duplicate of it.

const RequestSchema = z.object({
  photoDataUrl: z.string(),
  wardrobeType: z.enum(["woman", "man", "other"]),
  quizAnswers: QuizAnswersSchema.nullish(),
  traits: ExtractionSchema,
  scoredTop3: z.tuple([ScoredSeasonSchema, ScoredSeasonSchema, ScoredSeasonSchema]),
});

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

  const rate = await checkRateLimit(`report-full:${user.id}`, 5, 60 * 60 * 1000);
  if (!rate.allowed) {
    return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { photoDataUrl, wardrobeType, quizAnswers, traits, scoredTop3 } = parsed.data;

  // Server-side entitlement gate. In free-testing-mode (ADR-007) everyone is
  // unlocked. Otherwise, require a real Polar purchase: report_entitlements is
  // only ever written by the signature-verified webhook in
  // /api/billing/polar/webhook, so this is not client-trusted.
  const entitled = isFreeTestingMode() || (await hasPolarEntitlement(supabase, user.id));
  if (!entitled) {
    return Response.json({ error: "Payment required to unlock the full report." }, { status: 402 });
  }

  const match = photoDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return Response.json({ error: "Invalid photo format" }, { status: 400 });
  }
  const [, mimeType, base64] = match;
  const image = { mimeType: mimeType!, base64: base64!, detail: "high" as const };

  // ── Claim the style_reports row before spending anything ────────────────────
  const claim = await claimGenerationRow<LockRow & { full_report?: unknown }>({
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
    const cached = claim.row.full_report;
    if (!cached) {
      return Response.json({ error: "Report not ready yet. Please try again shortly." }, { status: 409 });
    }
    return Response.json({ data: cached });
  }

  // claim.outcome === "owned" -> we hold the lock, proceed to generate.

  const [top, alt1, alt2] = scoredTop3;
  const topId = buildSeasonId(top.subSeason);
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

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await generateReport(image, reportPrompt);
      const final  = applyConfirmedSeasonToReport(result, confirmedSeason);
      const validation = validateGeneratedReport(final, { wardrobeType });

      if (validation.warnings.length > 0) {
        console.warn(`[/api/report/full] quality warnings (attempt ${attempt}):`, validation.warnings);
      }

      if (!validation.valid) {
        console.error(`[/api/report/full] CRITICAL quality failures (attempt ${attempt}):`, validation.critical);
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }
        console.error("[/api/report/full] proceeding with quality-failed report after retry exhausted");
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

      return Response.json({ data: final });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack   = err instanceof Error ? err.stack : undefined;
      console.error(`[/api/report/full] report attempt ${attempt} failed:`, message);
      if (stack) console.error(stack.slice(0, 800));

      if (attempt === 2) {
        await finalizeGeneration({ supabase, table: "style_reports", match: { user_id: user.id }, patch: { status: "failed" } });
        return Response.json({ error: "Report generation failed. Please try again." }, { status: 500 });
      }
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // Unreachable — the loop always returns.
  return Response.json({ error: "Report generation failed. Please try again." }, { status: 500 });
}
