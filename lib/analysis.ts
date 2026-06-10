import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { SEASONS, type Season } from "@/lib/landing-data";

export type SeasonId = "spring" | "summer" | "autumn" | "winter";

export type AnalysisTraits = {
  undertone: "warm" | "cool" | "neutral";
  contrast: "low" | "medium" | "high";
  depth: "light" | "medium" | "deep";
};

export type QuizHint = {
  seasonId: SeasonId;
  seasonName: string;
  scores: Record<SeasonId, number>;
  undertoneHint?: "warm" | "cool" | "neutral";
  profileSummary?: string;
};

export type AnalysisResult = {
  seasonId: SeasonId;
  subSeason: string;
  traits: AnalysisTraits;
  confidence: number;
  summary: string;
  tips: string[];
  season: Season;
};

type RawAnalysis = {
  season: string;
  subSeason: string;
  undertone: string;
  contrast: string;
  depth: string;
  confidence: number;
  summary: string;
  tips: string[];
};

const SEASON_IDS = new Set<string>(["spring", "summer", "autumn", "winter"]);

const GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
] as const;

const ANALYSIS_PROMPT = `You are a certified personal color analyst with deep expertise in the Sci/ART 12-season system.

Analyze this selfie using this exact method:

━━ STEP 1: OBSERVE RAW FEATURES ━━
Examine carefully:
• SKIN — base undertone: warm (golden/peachy/yellow/olive) OR cool (pink/rosy/ashy/bluish)? How light or deep overall?
• HAIR — natural depth: light / medium / dark. Warmth: warm (golden/red/auburn/chocolate) OR cool (ash/silver/blue-black)?
• EYES — color and clarity: do they spark brightly or appear muted/soft?
• OVERALL CONTRAST — are features blended (hair/skin similar = low contrast) or strikingly different (dark hair + light skin = high contrast)?

━━ STEP 2: MATCH TO ONE OF THESE 12 SUB-SEASONS ━━

🌸 SPRING — warm undertone, clear coloring (never muted):
• "True Spring"   → warm medium skin, golden/chestnut hair, clear hazel/green/golden-brown eyes, medium contrast
• "Light Spring"  → fair warm skin, light golden/strawberry-blonde hair, light blue/green eyes, very low contrast
• "Bright Spring" → warm skin, dark warm hair, bright vivid eyes (blue/teal/green), high contrast + very clear

☀️ SUMMER — cool undertone, soft/muted coloring:
• "True Summer"   → cool rosy skin, ash-blonde/light ash-brown hair, blue/grey-blue/grey eyes, low-medium contrast
• "Light Summer"  → very fair cool skin, pale ash-blonde hair, pale blue/grey eyes, extremely low contrast
• "Soft Summer"   → cool-neutral, medium ash-brown hair, muted blue-grey/soft hazel eyes, low contrast, most muted of all

🍂 AUTUMN — warm undertone, muted/rich coloring:
• "True Autumn"   → warm golden/olive skin, rich auburn/copper/chestnut hair, amber/hazel/golden-green eyes, medium contrast
• "Soft Autumn"   → warm-neutral, mousy/warm medium-brown hair, muted hazel/green/warm brown eyes, very low contrast
• "Dark Autumn"   → deep warm skin, dark chocolate/warm-black hair, dark brown/olive eyes, medium-high contrast

❄️ WINTER — cool undertone, clear OR deep coloring:
• "True Winter"   → cool skin (rosy or cool-olive), dark ash-brown/black hair, dark cool-brown eyes, high contrast
• "Bright Winter" → cool skin, very dark hair, strikingly bright eyes (icy blue/vivid green/clear hazel), extremely high contrast
• "Dark Winter"   → cool-neutral, very dark hair, very dark eyes, deep/dramatic overall

━━ STEP 3: SCORE CONFIDENCE ━━
90-100 → clear photo, natural light, features obvious
70-89  → most features readable, minor ambiguity
50-69  → heavy filter, poor lighting, or genuinely borderline
< 50   → cannot determine reliably — say so in summary

━━ OUTPUT ━━
Return ONLY this JSON — no markdown, no extra text:
{
  "season": "spring" | "summer" | "autumn" | "winter",
  "subSeason": <exact name from the 12 above>,
  "undertone": "warm" | "cool" | "neutral",
  "contrast": "low" | "medium" | "high",
  "depth": "light" | "medium" | "deep",
  "confidence": <number 0-100>,
  "summary": "<2-3 sentences: name the specific features you observed and WHY they point to this season>",
  "tips": [
    "<specific color to wear and why>",
    "<specific color/metal to avoid and why>",
    "<one actionable styling tip for this sub-season>"
  ]
}`;

export class AnalysisQuotaError extends Error {
  constructor() {
    super("quota");
    this.name = "AnalysisQuotaError";
  }
}

function isRetryableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("quota") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("Service Unavailable") ||
    msg.includes("high demand") ||
    msg.includes("overloaded")
  );
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}

function parseRaw(text: string): RawAnalysis {
  try {
    return JSON.parse(extractJson(text)) as RawAnalysis;
  } catch {
    throw new Error("invalid response");
  }
}

async function analyzeWithOpenAI(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("no openai key");

  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 700,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  return response.choices[0]?.message?.content ?? "";
}

async function analyzeWithGemini(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const preferred = process.env.GEMINI_MODEL?.trim();
  const models = preferred
    ? [preferred, ...GEMINI_MODELS.filter((m) => m !== preferred)]
    : [...GEMINI_MODELS];

  let lastError: unknown;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json", temperature: 0 },
      });

      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { mimeType, data: imageBase64 } },
      ]);

      const text = result.response.text();
      if (text) return text;
    } catch (error) {
      lastError = error;
      if (isRetryableError(error)) {
        console.warn(`[analyze] ${modelName} unavailable, trying next…`);
        continue;
      }
      throw error;
    }
  }

  if (lastError && isRetryableError(lastError)) throw new AnalysisQuotaError();
  throw lastError instanceof Error ? lastError : new Error("Analysis failed.");
}

function buildPrompt(quizHint?: QuizHint): string {
  if (!quizHint) return ANALYSIS_PROMPT;

  const profileBlock = quizHint.profileSummary
    ? quizHint.profileSummary
    : [
        `Preliminary season: ${quizHint.seasonName} (${quizHint.seasonId})`,
        `Scores: spring=${quizHint.scores.spring}, summer=${quizHint.scores.summer}, autumn=${quizHint.scores.autumn}, winter=${quizHint.scores.winter}`,
      ].join("\n");

  return `${ANALYSIS_PROMPT}

━━ ONBOARDING QUIZ (soft prior — photo evidence wins) ━━
${profileBlock}
${quizHint.undertoneHint ? `Undertone hint from sun test: ${quizHint.undertoneHint}` : ""}

Use quiz goals, style vibe, body shape, and trends to personalize tips and outfit suggestions.
Trust the selfie for undertone, contrast, depth, and final season. Note briefly if quiz and photo align.`;
}

export async function analyzeFaceImage(
  imageBase64: string,
  mimeType: string,
  quizHint?: QuizHint
): Promise<AnalysisResult> {
  const prompt = buildPrompt(quizHint);
  let text = "";

  // OpenAI first if key is available (more reliable), otherwise Gemini
  if (process.env.OPENAI_API_KEY) {
    try {
      text = await analyzeWithOpenAI(imageBase64, mimeType, prompt);
    } catch (error) {
      console.warn("[analyze] OpenAI failed, trying Gemini…", (error as Error).message);
      text = await analyzeWithGemini(imageBase64, mimeType, prompt);
    }
  } else {
    text = await analyzeWithGemini(imageBase64, mimeType, prompt);
  }

  if (!text) throw new Error("Analysis failed.");

  const raw = parseRaw(text);

  const seasonId = raw.season?.toLowerCase().trim();
  if (!seasonId || !SEASON_IDS.has(seasonId)) {
    throw new Error("unclear");
  }

  const season = SEASONS.find((s) => s.id === seasonId) ?? SEASONS[0];

  return {
    seasonId: seasonId as SeasonId,
    subSeason: titleCase(raw.subSeason) || season.name,
    traits: {
      undertone: normalizeTrait(raw.undertone, ["warm", "cool", "neutral"], "neutral"),
      contrast: normalizeTrait(raw.contrast, ["low", "medium", "high"], "medium"),
      depth: normalizeTrait(raw.depth, ["light", "medium", "deep"], "medium"),
    },
    confidence: clamp(Math.round(raw.confidence ?? 70), 0, 100),
    summary: raw.summary || season.why,
    tips: Array.isArray(raw.tips) ? raw.tips.slice(0, 3) : [],
    season,
  };
}

function titleCase(s: string): string {
  return s?.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) ?? "";
}

function normalizeTrait<T extends string>(value: string, allowed: T[], fallback: T): T {
  const v = value?.toLowerCase().trim();
  return (allowed.find((a) => a === v) ?? fallback) as T;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
