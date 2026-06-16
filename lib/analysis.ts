import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { z } from "zod";
import {
  normalizeRawAnalysisResult,
  AnalysisRetakeError,
  type AnalysisResult,
  type RawAnalysis,
  type SeasonId,
} from "./analysis-normalizer.ts";
import { runStructuredStyleResponse } from "./server/openai.ts";

type Env = Record<string, string | undefined>;

export { AnalysisRetakeError, normalizeRawAnalysisResult };
export type {
  AnalysisEvidence,
  AnalysisQuality,
  AnalysisRetakeCode,
  AnalysisTraits,
  AnalysisResult,
  RawAnalysis,
  SeasonCandidate,
  SeasonId,
} from "./analysis-normalizer.ts";

export type QuizHint = {
  seasonId: SeasonId;
  seasonName: string;
  scores: Record<SeasonId, number>;
  undertoneHint?: "warm" | "cool" | "neutral";
  profileSummary?: string;
};

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
  "chroma": "muted" | "balanced" | "clear",
  "features": {
    "skin": "<short note about visible skin undertone/depth evidence>",
    "hair": "<short note about visible natural hair depth/warmth evidence>",
    "eyes": "<short note about visible eye color/clarity evidence>"
  },
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

export function getConfiguredColorAnalysisModel(env: Env = process.env): string {
  return env.OPENAI_COLOR_ANALYSIS_MODEL?.trim() || env.OPENAI_STYLE_MODEL?.trim() || "gpt-5.4";
}

const ACCURACY_GATE_PROMPT = `ACCURACY GATE V1 - REQUIRED:
Before assigning any color season, inspect whether the upload is a usable selfie of a human face.

If the image is not a human face, set:
- hasHumanFace: false
- faceCount: 0
- photoQuality.imageUsability: "unusable"
- photoQuality.issues includes "no_human_face"
- photoQuality.qualityScore: 0
- confidence: 0
Do not pretend the object has personal coloring.

If more than one face is visible, set faceCount to the number of visible faces and include "multiple_faces" in photoQuality.issues.

If exactly one face is visible but lighting, blur, filters, color cast, face size, or conditions are suboptimal, still analyze the coloring. Set photoQuality.qualityScore from 40 to 79, include the relevant issues, and use imageUsability "borderline" or "unusable" as appropriate.

If exactly one face is visible and photo quality is good, set photoQuality.qualityScore to 80 or above.

The JSON must include these additional fields:
{
  "hasHumanFace": true,
  "faceCount": 1,
  "photoQuality": {
    "lighting": "good" | "mixed" | "poor",
    "faceVisible": true,
    "naturalLight": true,
    "heavyFilter": false,
    "strongColorCast": false,
    "blurry": false,
    "qualityScore": 92,
    "imageUsability": "usable" | "borderline" | "unusable",
    "issues": [],
    "recommendation": "<specific retake guidance if the photo is not usable>"
  },
  "evidence": {
    "undertone": "<why undertone was chosen>",
    "contrast": "<why contrast was chosen>",
    "depth": "<why depth was chosen>",
    "chroma": "<why chroma was chosen>"
  },
  "alternatives": [
    { "season": "summer", "subSeason": "Soft Summer", "likelihood": 22, "reason": "<why considered but not chosen>" }
  ]
}`;

const RESPONSES_INSTRUCTIONS = `You are a calibrated personal color analysis vision system.
Extract factual visual evidence first: usable human face, photo quality, skin undertone/depth, hair depth/warmth, eye warmth/clarity, contrast, and chroma.
The app scores the final 12-season result in code, so do not let dark hair alone force Winter.
For deep coloring, separate Dark Autumn from Winter carefully:
- Dark Autumn / Deep Autumn = warm or neutral-warm, golden/olive skin, warm brown or chocolate hair, warm brown/olive eyes, earthy, smoky, rich.
- Winter = cool or neutral-cool, blue-black/ash hair, cool dark eyes, icy, sharp, crystalline, jewel-like.
Return only schema-valid structured data.`;

const RawAnalysisSchema = z.object({
  hasHumanFace: z.boolean(),
  faceCount: z.number().int().min(0),
  photoQuality: z.object({
    lighting: z.enum(["good", "mixed", "poor"]),
    faceVisible: z.boolean(),
    naturalLight: z.boolean(),
    heavyFilter: z.boolean(),
    strongColorCast: z.boolean(),
    blurry: z.boolean(),
    qualityScore: z.number().min(0).max(100),
    imageUsability: z.enum(["usable", "borderline", "unusable"]),
    issues: z.array(z.string()),
    recommendation: z.string(),
  }),
  season: z.enum(["spring", "summer", "autumn", "winter"]),
  subSeason: z.string(),
  undertone: z.enum(["warm", "cool", "neutral"]),
  contrast: z.enum(["low", "medium", "high"]),
  depth: z.enum(["light", "medium", "deep"]),
  chroma: z.enum(["muted", "balanced", "clear"]),
  features: z.object({
    skin: z.string(),
    hair: z.string(),
    eyes: z.string(),
  }),
  evidence: z.object({
    undertone: z.string(),
    contrast: z.string(),
    depth: z.string(),
    chroma: z.string(),
  }),
  alternatives: z.array(
    z.object({
      season: z.string(),
      subSeason: z.string(),
      likelihood: z.number().min(0).max(100),
      reason: z.string(),
    })
  ),
  confidence: z.number().min(0).max(100),
  summary: z.string(),
  tips: z.array(z.string()).max(3),
});

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

async function analyzeWithOpenAIResponses(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<RawAnalysis> {
  return runStructuredStyleResponse({
    schema: RawAnalysisSchema,
    schemaName: "color_analysis_evidence",
    instructions: RESPONSES_INSTRUCTIONS,
    prompt,
    image: { mimeType, base64: imageBase64, detail: "high" },
    model: getConfiguredColorAnalysisModel(),
    maxOutputTokens: 1500,
    promptCacheKey: "paletteme-color-analysis-v1",
  });
}

async function analyzeWithOpenAIChat(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("no openai key");

  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_COLOR_ANALYSIS_LEGACY_MODEL?.trim() || "gpt-4o",
    max_tokens: 1000,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: "high",
            },
          },
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
  const basePrompt = `${ANALYSIS_PROMPT}

${ACCURACY_GATE_PROMPT}`;

  if (!quizHint) return basePrompt;

  const profileBlock = quizHint.profileSummary
    ? quizHint.profileSummary
    : [
        `Preliminary season: ${quizHint.seasonName} (${quizHint.seasonId})`,
        `Scores: spring=${quizHint.scores.spring}, summer=${quizHint.scores.summer}, autumn=${quizHint.scores.autumn}, winter=${quizHint.scores.winter}`,
      ].join("\n");

  return `${basePrompt}

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
      const raw = await analyzeWithOpenAIResponses(imageBase64, mimeType, prompt);
      return normalizeRawAnalysisResult(raw);
    } catch (error) {
      if (error instanceof AnalysisRetakeError) throw error;
      console.warn("[analyze] OpenAI Responses failed, trying legacy OpenAI...", (error as Error).message);
      try {
        text = await analyzeWithOpenAIChat(imageBase64, mimeType, prompt);
      } catch (legacyError) {
        console.warn("[analyze] legacy OpenAI failed, trying Gemini...", (legacyError as Error).message);
        text = await analyzeWithGemini(imageBase64, mimeType, prompt);
      }
    }
  } else {
    text = await analyzeWithGemini(imageBase64, mimeType, prompt);
  }

  if (!text) throw new Error("Analysis failed.");

  const raw = parseRaw(text);
  return normalizeRawAnalysisResult(raw);
}
