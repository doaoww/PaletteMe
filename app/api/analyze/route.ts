import { NextResponse } from "next/server";
import {
  AnalysisQuotaError,
  AnalysisRetakeError,
  analyzeFaceImage,
  type QuizHint,
  type SeasonId,
} from "@/lib/analysis";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Rate limit: 5 analyses per IP per minute
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      "127.0.0.1";
    const rl = await checkRateLimit(ip, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "You've analyzed a few photos already — wait a moment and try again." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");

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

    const quizHint = parseQuizHint(formData.get("quizHint"));
    const result = await analyzeFaceImage(base64, file.type, quizHint);

    return NextResponse.json({
      ok: true,
      result,
      warning: result.qualityWarning ?? null,
    });
  } catch (error) {
    if (error instanceof AnalysisQuotaError) {
      return NextResponse.json(
        { error: "Analysis is at capacity right now. Try again in a minute." },
        { status: 429 }
      );
    }

    if (error instanceof AnalysisRetakeError) {
      return NextResponse.json(
        {
          error: error.code,
          message: error.userMessage,
          issues: error.issues,
        },
        { status: 422 }
      );
    }

    console.error("[analyze] POST error:", error);

    const raw = error instanceof Error ? error.message : "";
    const isBadPhoto = raw.includes("unclear") || raw.includes("valid season") || raw.includes("invalid response");
    const userMessage = isBadPhoto
      ? "Couldn't read your coloring clearly — try a photo in natural light with no filters."
      : "Analysis didn't complete. Please try again.";

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}

function parseQuizHint(raw: FormDataEntryValue | null): QuizHint | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  try {
    const parsed = JSON.parse(raw) as QuizHint;
    const ids = new Set<SeasonId>(["spring", "summer", "autumn", "winter"]);
    if (!parsed.seasonId || !ids.has(parsed.seasonId)) return undefined;
    return {
      seasonId: parsed.seasonId,
      seasonName: parsed.seasonName ?? parsed.seasonId,
      scores: parsed.scores ?? {
        spring: 0,
        summer: 0,
        autumn: 0,
        winter: 0,
      },
      undertoneHint: parsed.undertoneHint,
      profileSummary: parsed.profileSummary,
    };
  } catch {
    return undefined;
  }
}
