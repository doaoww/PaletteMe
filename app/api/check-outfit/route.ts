import { NextResponse } from "next/server";
import OpenAI from "openai";
import { insertOutfitCheck, isSupabaseConfigured } from "@/lib/supabase-db";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── Module-level singleton ───────────────────────────────────────────────────
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function buildOutfitPrompt(colortype: string, bestColors: string[]): string {
  return `You are a color analyst. The user's colortype is: ${colortype}.
Their best colors are: ${bestColors.length > 0 ? bestColors.join(", ") : "not specified"}.

Analyze the clothing item in this photo:
- What are the dominant colors in the garment?
- Do they match this person's colortype palette?
- Will this make their natural coloring look vibrant or washed out?

Respond ONLY in JSON:
{
  "match": true,
  "score": 78,
  "dominant_colors": ["dusty pink", "cream"],
  "reason": "The dusty pink aligns perfectly with your soft summer palette",
  "suggestion": "This would look great on you. Pair with soft gray accessories."
}`;
}

type OutfitJson = {
  match: boolean;
  score: number;
  dominant_colors: string[];
  reason: string;
  suggestion: string;
};

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}

export async function POST(request: Request) {
  if (!openai) {
    return NextResponse.json(
      { error: "Analysis is not configured. Contact the site owner." },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const colortype = formData.get("colortype");
    const bestColorsRaw = formData.get("best_colors");
    const userId = formData.get("user_id");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Please upload a photo of the clothing item." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, or WebP images are supported." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be 10 MB or smaller." },
        { status: 400 }
      );
    }

    if (!colortype || typeof colortype !== "string") {
      return NextResponse.json(
        {
          error:
            "Your color type is missing. Complete the color quiz first.",
        },
        { status: 400 }
      );
    }

    let bestColors: string[] = [];
    if (typeof bestColorsRaw === "string") {
      try {
        bestColors = JSON.parse(bestColorsRaw) as string[];
      } catch {
        bestColors = [];
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 400,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: buildOutfitPrompt(colortype, bestColors),
            },
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "low" },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "";
    let parsed: OutfitJson;

    try {
      parsed = JSON.parse(extractJson(raw)) as OutfitJson;
    } catch {
      return NextResponse.json(
        { error: "Couldn't analyze the outfit. Please try again." },
        { status: 500 }
      );
    }

    const result = {
      match: Boolean(parsed.match),
      score: Math.min(100, Math.max(0, Math.round(parsed.score ?? 50))),
      dominant_colors: Array.isArray(parsed.dominant_colors)
        ? parsed.dominant_colors
        : [],
      reason: parsed.reason ?? "",
      suggestion: parsed.suggestion ?? "",
    };

    // Persist to Supabase (fire-and-forget — never block the response)
    if (isSupabaseConfigured()) {
      const uid =
        typeof userId === "string" && userId.trim() ? userId.trim() : null;
      insertOutfitCheck({ user_id: uid, result }).catch(() => {});
    }

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[check-outfit]", error);
    return NextResponse.json(
      { error: "Outfit check failed. Please try again." },
      { status: 500 }
    );
  }
}
