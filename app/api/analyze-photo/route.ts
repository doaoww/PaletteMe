import { NextResponse } from "next/server";
import OpenAI from "openai";
import { insertUser, updateUser, isSupabaseConfigured } from "@/lib/supabase-db";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── Module-level singleton ───────────────────────────────────────────────────
// Reused across warm Vercel invocations — avoids TCP handshake per request.
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const SYSTEM_PROMPT = `
You are a world-class color analyst with 20 years of experience in 12-season color theory.

IMPORTANT RULES:
- Mentally correct for artificial or warm lighting
- Focus on undertone, not surface color
- Look at the eye socket area and inner wrist if visible
- Consider the combination of ALL features together
- Never guess — if uncertain return low confidence

The 12 seasons:
SPRING: Bright Spring (high contrast, warm, clear), Light Spring (low contrast, warm, delicate), Warm Spring (medium contrast, very warm, golden)
SUMMER: Light Summer (low contrast, cool, soft), Soft Summer (medium contrast, cool, muted), Cool Summer (medium contrast, very cool, rose-toned)
AUTUMN: Soft Autumn (low contrast, warm, muted), Warm Autumn (medium contrast, very warm, earthy), Deep Autumn (high contrast, warm, rich)
WINTER: Deep Winter (high contrast, cool, dark), Cool Winter (medium contrast, very cool, icy), Bright Winter (high contrast, cool, clear)

First check if the image contains a human face. If not, set has_face to false.

Respond ONLY in this exact JSON, no extra text:
{
  "has_face": true,
  "colortype": "soft summer",
  "confidence": 82,
  "best_colors": ["dusty rose", "lavender", "soft gray", "powder blue", "mauve", "sage"],
  "avoid_colors": ["orange", "warm brown", "bright yellow", "tomato red"],
  "palette_description": "Muted, cool, and soft. Think foggy mornings and faded florals.",
  "reasoning": {
    "skin_undertone": "cool pink, slightly muted",
    "eye_color": "soft blue-gray, low intensity",
    "hair_color": "ash brown, no golden tones",
    "contrast": "low contrast between skin, eyes, hair"
  },
  "style_notes": "You look best in soft fabrics. Avoid anything too bright or warm-toned near your face."
}
`.trim();

type AnalysisJson = {
  has_face: boolean;
  colortype: string;
  confidence: number;
  best_colors: string[];
  avoid_colors: string[];
  palette_description: string;
  reasoning: {
    skin_undertone: string;
    eye_color: string;
    hair_color: string;
    contrast: string;
  };
  style_notes: string;
};

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}

function macroSeason(colortype: string): string {
  const ct = colortype.toLowerCase();
  if (ct.includes("spring")) return "spring";
  if (ct.includes("summer")) return "summer";
  if (ct.includes("autumn") || ct.includes("fall")) return "autumn";
  if (ct.includes("winter")) return "winter";
  return colortype;
}

export async function POST(request: Request) {
  if (!openai) {
    return NextResponse.json(
      { error: "Analysis is not configured. Contact the site owner." },
      { status: 503 }
    );
  }

  // ── Rate limiting: 3 analyses per IP per minute ────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
  const rl = await checkRateLimit(`analyze-photo:${ip}`, 3, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error:
          "You've analyzed a few photos already — wait a moment and try again.",
      },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const userId = formData.get("user_id");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Please upload a selfie image." },
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze my coloring and determine my seasonal color type.",
            },
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "";
    let parsed: AnalysisJson;

    try {
      parsed = JSON.parse(extractJson(raw)) as AnalysisJson;
    } catch {
      return NextResponse.json(
        { error: "Analysis didn't complete. Please try again." },
        { status: 500 }
      );
    }

    // Problem 3 — face validation
    if (!parsed.has_face) {
      return NextResponse.json(
        {
          error: "no_face",
          message:
            "We couldn't detect a face. Please upload a clear photo of yourself.",
        },
        { status: 422 }
      );
    }

    // Problem 4 — lighting / low confidence
    if (parsed.confidence < 65) {
      return NextResponse.json(
        {
          error: "low_confidence",
          message:
            "Lighting made this tricky. Try natural daylight, no filters, no heavy makeup.",
        },
        { status: 422 }
      );
    }

    const season = macroSeason(parsed.colortype);
    const dbData = {
      colortype: season,
      colortype_confidence: parsed.confidence,
      best_colors: parsed.best_colors,
      avoid_colors: parsed.avoid_colors,
    };

    // Persist to Supabase — update existing user or create new anonymous row
    let savedUserId: string | null =
      typeof userId === "string" && userId.trim() ? userId.trim() : null;

    if (isSupabaseConfigured()) {
      if (savedUserId) {
        await updateUser(savedUserId, dbData);
      } else {
        savedUserId = await insertUser(dbData);
      }
    }

    return NextResponse.json({
      ok: true,
      user_id: savedUserId,
      colortype: season,
      colortype_sub: parsed.colortype,
      confidence: parsed.confidence,
      best_colors: parsed.best_colors,
      avoid_colors: parsed.avoid_colors,
      palette_description: parsed.palette_description,
      reasoning: parsed.reasoning,
      style_notes: parsed.style_notes,
    });
  } catch (error) {
    console.error("[analyze-photo]", error);
    return NextResponse.json(
      { error: "Analysis didn't complete. Please try again." },
      { status: 500 }
    );
  }
}
