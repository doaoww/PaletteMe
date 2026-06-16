import { NextResponse } from "next/server";
import { z } from "zod";
import { createAiJob, getPublicAiJob } from "@/lib/server/ai/jobs";
import { buildOutfitPrompt, STYLE_DECISION_SYSTEM_PROMPT } from "@/lib/server/ai/prompts";
import { OutfitPlanSchema } from "@/lib/server/ai/schemas";
import { runStructuredStyleResponse } from "@/lib/server/openai";
import { listPersistedWardrobeItems } from "@/lib/server/wardrobe";

export const runtime = "nodejs";
export const maxDuration = 60;

const OutfitResponseSchema = z.object({
  outfits: z.array(OutfitPlanSchema).min(1).max(3),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = typeof body?.userId === "string" ? body.userId : null;
    const wardrobeItems = await listPersistedWardrobeItems(userId);

    if (wardrobeItems.length < 2) {
      return NextResponse.json(
        { error: "Add at least 2 wardrobe items before building outfits." },
        { status: 400 }
      );
    }

    const prompt = buildOutfitPrompt({
      wardrobeItems,
      profileSummary: typeof body?.profileSummary === "string" ? body.profileSummary : undefined,
      occasion: typeof body?.occasion === "string" ? body.occasion : undefined,
      goal: typeof body?.goal === "string" ? body.goal : undefined,
    });

    const job = createAiJob({
      kind: "outfits",
      input: { prompt },
      run: async ({ prompt: jobPrompt }) => runStructuredStyleResponse({
        schema: OutfitResponseSchema,
        schemaName: "paletteme_outfit_plans",
        instructions: STYLE_DECISION_SYSTEM_PROMPT,
        prompt: jobPrompt,
        promptCacheKey: "outfit-builder",
        maxOutputTokens: 1800,
      }),
    });

    return NextResponse.json(
      { ok: true, mode: "async", jobId: job.id, job: getPublicAiJob(job.id) },
      { status: 202 }
    );
  } catch (error) {
    console.error("[outfits]", error);
    return NextResponse.json({ error: "Could not start outfit builder." }, { status: 500 });
  }
}
