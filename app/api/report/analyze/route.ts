export const runtime = "nodejs";
export const maxDuration = 30;

import { z } from "zod";
import { runStructuredStyleResponse } from "@/server/services/openai";
import { scoreColorSeasonCandidates } from "@/lib/analysis/color-season-scoring";
import { SEASON_PALETTE_REFERENCE } from "@/lib/report/season-palettes";
import { EXTRACTION_INSTRUCTIONS } from "./prompts";
import { createClient } from "@/lib/db/supabase-server";
import { checkRateLimit } from "@/lib/shared/rate-limit";
import { ExtractionSchema, buildSeasonId, normalizeContrastForScoring } from "../shared";

// Free mini-result phase: trait extraction + deterministic season scoring only.
// Does NOT call generateReport() or touch style_reports — that's /api/report/full,
// triggered explicitly by the user unlocking (paywall), never generated eagerly here.

const RequestSchema = z.object({
  photoDataUrl: z.string(),
});

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

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const rate = await checkRateLimit(`report-analyze:${user.id}`, 5, 60 * 60 * 1000);
  if (!rate.allowed) {
    return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { photoDataUrl } = parsed.data;

  const match = photoDataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return Response.json({ error: "Invalid photo format" }, { status: 400 });
  }
  const [, mimeType, base64] = match;
  const image = { mimeType: mimeType!, base64: base64!, detail: "high" as const };

  let traits: z.infer<typeof ExtractionSchema>;
  try {
    traits = await extractTraits(image);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/report/analyze] trait extraction failed:", message);
    return Response.json(
      { error: "Analysis failed. Please try again.", detail: message },
      { status: 500 },
    );
  }

  if (traits.photoQuality === "unusable") {
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
  const palette8 = (SEASON_PALETTE_REFERENCE[topId] ?? []).slice(0, 8).map(c => c.hex);

  return Response.json({
    seasonId: topId,
    seasonName: top.subSeason,
    palette: palette8,
    traits,
    scoredTop3: [top, alts[0]!, alts[1]!],
  });
}
