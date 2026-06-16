import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient as createServerSupabaseClient } from "@/lib/supabase-server";
import { isSupabaseConfigured } from "@/lib/supabase-db";
import { createAiJob, getPublicAiJob } from "@/lib/server/ai/jobs";
import { SCAN_DISABLED_RESPONSE, isScanFeatureEnabled } from "@/lib/scan-feature";
import {
  parseScanType,
  readScanProfileSummaryFromFormData,
  runScanAnalysis,
  validateScanImage,
  type ScanAnalysisInput,
} from "@/lib/server/ai/scan";
import { listScanHistory, saveAuthenticatedScanHistory } from "@/lib/server/scan-history";

export const runtime = "nodejs";
export const maxDuration = 60;

type ScanHistoryContext = {
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  userId: string;
} | null;

type ScanHistoryMetadata = {
  seasonId?: string;
  imageUrl?: string;
  mimeType?: string;
};

export async function GET() {
  if (!isScanFeatureEnabled()) {
    return NextResponse.json({ ok: true, disabled: true, scans: [] });
  }

  const historyContext = await getScanHistoryContext();
  if (!historyContext) {
    logScanRouteError("history.empty", "Returning empty scan history because no authenticated user context is available.");
    return NextResponse.json({ ok: true, scans: [] });
  }

  return NextResponse.json({
    ok: true,
    scans: await listScanHistory(historyContext.userId),
  });
}

export async function POST(request: Request) {
  try {
    if (!isScanFeatureEnabled()) {
      logScanRouteError("feature_flag", "Scan feature is disabled for launch.");
      return NextResponse.json(SCAN_DISABLED_RESPONSE, { status: 503 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
    const limit = await checkRateLimit(`ai-scan:${ip}`, 15, 60_000);
    if (!limit.allowed) {
      logScanRouteError("rate_limit", "Scan request blocked by rate limit.", { ip });
      return NextResponse.json(
        {
          ok: false,
          error: "You've scanned a few items already. Wait a moment and try again.",
          code: "RATE_LIMITED",
          stage: "rate_limit",
        },
        { status: 429 }
      );
    }

    if (!process.env.OPENAI_API_KEY?.trim()) {
      logScanRouteError("env", "OPENAI_API_KEY is missing or blank.");
      return NextResponse.json(
        {
          ok: false,
          error: "Scan service is missing OPENAI_API_KEY.",
          code: "OPENAI_KEY_MISSING",
          stage: "env",
        },
        { status: 500 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      logScanRouteError("form_data", "Could not parse scan multipart form data.", {
        error: getErrorMessage(error),
      });
      return NextResponse.json(
        {
          ok: false,
          error: "Could not read the scan upload. Please try uploading the image again.",
          code: "SCAN_FORM_DATA_INVALID",
          stage: "form_data",
          details: getClientSafeErrorDetails(error),
        },
        { status: 400 }
      );
    }

    const image = formData.get("image");
    if (!image || !(image instanceof Blob)) {
      logScanRouteError("image_missing", "Scan form data did not include a Blob image.", {
        imageType: typeof image,
      });
      return NextResponse.json(
        {
          ok: false,
          error: "Please upload an image to scan.",
          code: "SCAN_IMAGE_MISSING",
          stage: "form_data",
        },
        { status: 400 }
      );
    }

    const imageError = validateScanImage(image);
    if (imageError) {
      logScanRouteError("image_invalid", "Scan image validation failed.", {
        imageError,
        mimeType: image.type,
        size: image.size,
      });
      return NextResponse.json(
        {
          ok: false,
          error: imageError,
          code: "SCAN_IMAGE_INVALID",
          stage: "image_validation",
        },
        { status: 400 }
      );
    }

    const rawScanType = formData.get("scanType");
    const parsedScanType = parseScanType(rawScanType);
    if (typeof rawScanType !== "string" || rawScanType !== parsedScanType) {
      logScanRouteError("scan_type", "Scan type was missing or invalid; using fallback scan type.", {
        rawScanType: typeof rawScanType === "string" ? rawScanType : null,
        parsedScanType,
      });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const input: ScanAnalysisInput = {
      scanType: parsedScanType,
      imageBase64: buffer.toString("base64"),
      mimeType: image.type,
      profileSummary: readScanProfileSummaryFromFormData(formData),
      userGoal: readOptionalString(formData.get("userGoal")),
      wardrobeSummary: readOptionalString(formData.get("wardrobeSummary")),
    };
    const historyContext = await getScanHistoryContext();
    const historyMetadata: ScanHistoryMetadata = {
      seasonId:
        readOptionalString(formData.get("seasonId")) ??
        readOptionalString(formData.get("colortype")),
      imageUrl:
        readOptionalString(formData.get("imageUrl")) ??
        readOptionalString(formData.get("image_url")),
      mimeType: image.type,
    };

    if (formData.get("mode") === "sync") {
      const result = await runAndSaveScan(input, historyContext, historyMetadata);
      return NextResponse.json({ ok: true, mode: "sync", result });
    }

    const job = createAiJob({
      kind: `scan:${input.scanType}`,
      input,
      run: (jobInput) => runAndSaveScan(jobInput, historyContext, historyMetadata),
    });

    return NextResponse.json(
      { ok: true, mode: "async", jobId: job.id, job: getPublicAiJob(job.id) },
      { status: 202 }
    );
  } catch (error) {
    logScanRouteError("unhandled", "Scan route failed before returning a result.", {
      error: getErrorMessage(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        ok: false,
        error: "Scan did not start. Please try again.",
        code: "SCAN_START_FAILED",
        stage: "unhandled",
        details: getClientSafeErrorDetails(error),
      },
      { status: 500 }
    );
  }
}

function readOptionalString(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

async function getScanHistoryContext(): Promise<ScanHistoryContext> {
  if (!isSupabaseConfigured()) {
    logScanRouteError("history_context", "Supabase is not configured; scan history is unavailable.");
    return null;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logScanRouteError("history_context", "No authenticated Supabase user; scan history is skipped.");
      return null;
    }

    return { supabase, userId: user.id };
  } catch (error) {
    logScanRouteError("history_context", "Could not read Supabase auth user for scan history.", {
      error: getErrorMessage(error),
    });
    return null;
  }
}

async function runAndSaveScan(
  input: ScanAnalysisInput,
  historyContext: ScanHistoryContext,
  metadata: ScanHistoryMetadata
) {
  const result = await runScanAnalysis(input);
  if (historyContext) {
    await saveAuthenticatedScanHistory({
      supabase: historyContext.supabase,
      userId: historyContext.userId,
      scanType: input.scanType,
      result,
      seasonId: metadata.seasonId,
      imageUrl: metadata.imageUrl,
      mimeType: metadata.mimeType,
    }).catch((error) => {
      logScanRouteError("history_save", "Scan history was not saved.", {
        error: getErrorMessage(error),
      });
    });
  }
  return result;
}

function logScanRouteError(stage: string, message: string, details?: Record<string, unknown>): void {
  console.error(`[api/ai/scan] ${stage}: ${message}`, details ?? {});
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getClientSafeErrorDetails(error: unknown): string {
  return redactSecrets(getErrorMessage(error));
}

function redactSecrets(value: string): string {
  return value.replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]");
}
