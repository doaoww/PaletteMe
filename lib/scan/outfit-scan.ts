import { SEASONS } from "@/lib/shared/landing-data";
import { formatProfileForAI, type QuizProfile } from "@/lib/quiz/quiz";
import { findSeasonPalette } from "@/lib/analysis/season-palettes";

const MAX_OUTFIT_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_OUTFIT_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const SCAN_API_ENDPOINT = "/api/ai/scan";

export type ScanRequestType = "clothing_item" | "outfit" | "makeup" | "product_screenshot";

export type ScanProfilePayload = {
  colortype: string;
  seasonId: string;
  bestColors: string[];
  colorsToAvoid: string[];
  subSeason?: string;
  profileSummary: string;
};

export type OutfitScanResult = {
  verdict?: AiScanResultForUi["verdict"];
  match: boolean;
  score: number;
  confidence?: number;
  dominant_colors: string[];
  category?: string;
  colorTemperature?: string;
  reason: string;
  suggestion: string;
  stylingTips: string[];
  betterAlternatives: string[];
};

export type AiScanResultForUi = {
  verdict?: string;
  score?: number;
  confidence?: number;
  item?: {
    category?: string;
    colors?: string[];
    colorTemperature?: string;
    formality?: string;
    pattern?: string;
    material?: string;
  };
  reason?: string;
  nextAction?: string;
  stylingTips?: string[];
  betterAlternatives?: string[];
};

type AiScanJobForUi = {
  id?: string;
  status?: "queued" | "running" | "succeeded" | "failed";
  result?: AiScanResultForUi;
  error?: string;
};

type AiScanApiResponse = {
  ok?: boolean;
  mode?: "sync" | "async";
  result?: AiScanResultForUi;
  jobId?: string;
  job?: AiScanJobForUi;
  error?: string;
  code?: string;
  stage?: string;
  details?: string;
};

type ScanFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

type RequestAiScanResultOptions = {
  endpoint?: string;
  fetcher?: ScanFetch;
  maxPolls?: number;
  pollIntervalMs?: number;
};

export type ScanHistoryApiRecord = {
  id?: string;
  scanType?: string;
  createdAt?: string;
  result?: AiScanResultForUi & {
    scanType?: string;
    image_url?: string | null;
    image?: {
      url?: string | null;
    };
  };
};

export type ScanHistoryItemForUi = {
  id: string;
  thumbnailUrl: string | null;
  verdictLabel: "Works for you" | "Skip this";
  verdictTone: "yes" | "no";
  scoreText: string;
  scanTypeLabel: string;
  colorLabel: string;
  colorHex: string | null;
  dateScanned: string;
};

export function validateOutfitImage(file: File): string | null {
  if (!ALLOWED_OUTFIT_IMAGE_TYPES.has(file.type)) {
    return "Only JPG, PNG, or WebP images are supported.";
  }
  if (file.size > MAX_OUTFIT_IMAGE_BYTES) {
    return "Image must be 10 MB or smaller.";
  }
  return null;
}

export function buildOutfitScanFormData({
  file,
  scanType,
  profile,
  colortype,
  seasonId,
  bestColors,
  colorsToAvoid,
  subSeason,
  profileSummary,
  userId,
}: {
  file: File;
  scanType: ScanRequestType;
  profile?: QuizProfile;
  colortype?: string;
  seasonId?: string | null;
  bestColors?: string[];
  colorsToAvoid?: string[];
  subSeason?: string | null;
  profileSummary?: string | null;
  userId?: string | null;
}): FormData {
  const formData = new FormData();
  const profilePayload = profile ? buildScanProfilePayload(profile) : null;
  const resolvedColortype = colortype?.trim() || profilePayload?.colortype || "";
  const resolvedSeasonId = seasonId?.trim() || profilePayload?.seasonId || resolvedColortype;
  const resolvedBestColors = bestColors ?? profilePayload?.bestColors ?? [];
  const avoidColors = colorsToAvoid ?? profilePayload?.colorsToAvoid ?? [];
  const resolvedSubSeason = subSeason ?? profilePayload?.subSeason;
  const resolvedProfileSummary = profileSummary ?? profilePayload?.profileSummary;
  formData.append("image", file);
  formData.append("scanType", scanType);
  formData.append("colortype", resolvedColortype);
  formData.append("seasonId", resolvedSeasonId);
  formData.append("best_colors", JSON.stringify(resolvedBestColors));
  formData.append("bestColors", JSON.stringify(resolvedBestColors));
  formData.append("colors_to_avoid", JSON.stringify(avoidColors));
  formData.append("colorsToAvoid", JSON.stringify(avoidColors));
  if (resolvedSubSeason?.trim()) {
    formData.append("subSeason", resolvedSubSeason.trim());
  }
  if (resolvedProfileSummary?.trim()) {
    formData.append("profileSummary", resolvedProfileSummary.trim());
  }
  formData.append("mode", "sync");
  if (userId?.trim()) {
    formData.append("user_id", userId.trim());
  }
  return formData;
}

const SCAN_FETCH_TIMEOUT_MS = 55_000;

async function fetchScanPost(
  endpoint: string,
  formData: FormData,
  fetcher: ScanFetch
): Promise<Response> {
  const attempt = async () => {
    const controller = new AbortController();
    const timer = globalThis.setTimeout(() => controller.abort(), SCAN_FETCH_TIMEOUT_MS);
    try {
      return await fetcher(endpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
    } finally {
      globalThis.clearTimeout(timer);
    }
  };

  try {
    return await attempt();
  } catch (firstError) {
    if (firstError instanceof Error && firstError.name === "AbortError") {
      throw new Error("Scan timed out. Check your connection and try again.");
    }
    // Network error — retry once after a short delay
    await sleep(2000);
    try {
      return await attempt();
    } catch (retryError) {
      throw new Error(
        retryError instanceof Error && retryError.name === "AbortError"
          ? "Scan timed out. Check your connection and try again."
          : "Could not connect. Check your internet connection and try again."
      );
    }
  }
}

export async function requestAiScanResult(
  formData: FormData,
  {
    endpoint = SCAN_API_ENDPOINT,
    fetcher = fetch,
    maxPolls = 90,
    pollIntervalMs = 1000,
  }: RequestAiScanResultOptions = {}
): Promise<AiScanResultForUi> {
  const response = await fetchScanPost(endpoint, formData, fetcher);
  const data = await readAiScanApiResponse(response);

  if (!response.ok) {
    logScanClientError("Scan API request failed", response, data);
    throw new Error(buildScanClientErrorMessage(data, response.status));
  }

  if (data.result) return data.result;

  const jobId = data.jobId ?? data.job?.id;
  if (!jobId) {
    logScanClientError("Scan API returned no result or job id", response, data);
    throw new Error(buildScanClientErrorMessage(data, response.status, "Scan did not return a result."));
  }

  return pollAiScanJob(jobId, { fetcher, maxPolls, pollIntervalMs });
}

export function buildScanProfilePayload(profile: QuizProfile): ScanProfilePayload {
  const season = SEASONS.find((item) => item.id === profile.seasonId) ?? SEASONS[0];
  const subSeason = profile.subSeason ?? profile.quizColorEvidence?.subSeason;
  const subSeasonPalette = subSeason ? findSeasonPalette(subSeason) : undefined;
  const bestColors = formatNamedColors(
    subSeasonPalette?.palette ?? season.palette,
    subSeasonPalette?.paletteNames ?? season.paletteNames
  );
  const colorsToAvoid = subSeasonPalette
    ? formatNamedColors(subSeasonPalette.avoid, subSeasonPalette.avoidNames)
    : getColorsToAvoid(profile);
  const profileSummary = [
    `Color family: ${season.name}`,
    subSeason ? `Exact sub-season: ${subSeason}` : null,
    subSeasonPalette
      ? `Palette traits: ${subSeasonPalette.undertone} undertone, ${subSeasonPalette.depth} depth, ${subSeasonPalette.chroma} chroma`
      : null,
    formatProfileForAI(profile),
    `Best colors near the face: ${bestColors.join(", ")}`,
    `Colors to use carefully or away from face: ${colorsToAvoid.join(", ")}`,
  ].filter(Boolean).join("\n");

  return {
    colortype: profile.seasonId,
    seasonId: profile.seasonId,
    bestColors,
    colorsToAvoid,
    subSeason,
    profileSummary,
  };
}

export function adaptAiScanResultToOutfitScanResult(
  result: AiScanResultForUi
): OutfitScanResult {
  const score = clampScore(result.score);
  const verdict = result.verdict ?? "";
  const positiveVerdict = verdict === "great" || verdict === "works_with_styling";
  return {
    verdict: result.verdict,
    match: positiveVerdict || (!verdict && score >= 60),
    score,
    confidence: clampOptionalScore(result.confidence),
    dominant_colors: result.item?.colors ?? [],
    category: result.item?.category,
    colorTemperature: result.item?.colorTemperature,
    reason: result.reason ?? "",
    suggestion: result.nextAction ?? result.stylingTips?.[0] ?? "",
    stylingTips: result.stylingTips ?? [],
    betterAlternatives: result.betterAlternatives ?? [],
  };
}

export function formatScanHistoryItems(
  records: ScanHistoryApiRecord[],
  locale?: string
): ScanHistoryItemForUi[] {
  return [...records]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 5)
    .map((record, index) => {
      const result = record.result ?? {};
      const score = clampScore(result.score);
      const works = result.verdict === "great" || result.verdict === "works_with_styling" || score >= 60;
      const parsedColor = parseDetectedColorToken(result.item?.colors?.[0]);
      return {
        id: record.id ?? `${record.createdAt ?? "scan"}-${index}`,
        thumbnailUrl: result.image_url ?? result.image?.url ?? null,
        verdictLabel: works ? "Works for you" : "Skip this",
        verdictTone: works ? "yes" : "no",
        scoreText: `${(score / 10).toFixed(1)} / 10`,
        scanTypeLabel: scanTypeLabel(record.scanType ?? result.scanType),
        colorLabel: parsedColor.name,
        colorHex: parsedColor.hex,
        dateScanned: formatScanDate(record.createdAt, locale),
      };
    });
}

function clampScore(value: number | undefined): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value ?? 50)));
}

function clampOptionalScore(value: number | undefined): number | undefined {
  if (value == null) return undefined;
  return clampScore(value);
}

function formatNamedColors(hexes: string[], names: string[] = []): string[] {
  return hexes.map((hex, index) => {
    const name = names[index]?.trim();
    return name ? `${name} ${hex}` : hex;
  });
}

export function parseDetectedColorToken(raw: string | undefined): { name: string; hex: string | null } {
  if (!raw?.trim()) {
    return { name: "Detected color", hex: null };
  }

  const hexMatch = raw.match(/#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b/);
  const hex = hexMatch?.[0] ?? (raw.trim().startsWith("#") ? raw.trim() : null);
  const name = raw.replace(/#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b/g, "").trim() || raw.trim();
  return { name, hex };
}

function scanTypeLabel(value: string | undefined): string {
  if (value === "clothing_item") return "Clothing item";
  if (value === "outfit") return "Full outfit";
  if (value === "makeup") return "Makeup product";
  if (value === "product_screenshot") return "Shopping find";
  return "Scan";
}

function formatScanDate(value: string | undefined, locale?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getColorsToAvoid(profile: QuizProfile): string[] {
  const warm =
    profile.undertoneHint === "warm" ||
    profile.seasonId === "spring" ||
    profile.seasonId === "autumn";

  return warm
    ? [
        "Icy pink #F0D4DC",
        "Cool grey #B8BCC4",
        "Bright white #FFFFFF",
        "Lavender #C8B4E8",
        "Neon yellow #E8FF3A",
        "Pastel blue #A8D4F0",
        "Silver #C0C0C0",
        "Cool black #1A1A24",
      ]
    : [
        "Rust orange #B5522A",
        "Mustard #C4A035",
        "Warm camel #C19A6B",
        "Terracotta #C86B4A",
        "Golden yellow #E6BE3A",
        "Peach #FFCBA4",
        "Copper #B87333",
        "Warm beige #D4B896",
      ];
}

async function pollAiScanJob(
  jobId: string,
  {
    fetcher,
    maxPolls,
    pollIntervalMs,
  }: Required<Pick<RequestAiScanResultOptions, "fetcher" | "maxPolls" | "pollIntervalMs">>
): Promise<AiScanResultForUi> {
  const jobUrl = `/api/ai/jobs/${encodeURIComponent(jobId)}`;

  for (let attempt = 0; attempt < maxPolls; attempt += 1) {
    if (attempt > 0) await sleep(pollIntervalMs);

    const response = await fetcher(jobUrl);
    const data = await readAiScanApiResponse(response);

    if (!response.ok) {
      logScanClientError("Scan job poll failed", response, data);
      throw new Error(buildScanClientErrorMessage(data, response.status));
    }

    if (data.job?.status === "succeeded" && data.job.result) {
      return data.job.result;
    }

    if (data.job?.status === "failed") {
      logScanClientError("Scan job failed", response, data);
      throw new Error(data.job.error ? `AI_SCAN_JOB_FAILED: ${data.job.error}` : "AI_SCAN_JOB_FAILED: Scan failed.");
    }
  }

  console.error("[scan] Scan job timed out", { jobId, maxPolls, pollIntervalMs });
  throw new Error("AI_SCAN_JOB_TIMEOUT: Scan took too long. Please try again.");
}

async function readAiScanApiResponse(response: Response): Promise<AiScanApiResponse> {
  try {
    return (await response.json()) as AiScanApiResponse;
  } catch (error) {
    console.error("[scan] Could not parse scan API JSON response", {
      status: response.status,
      statusText: response.statusText,
      error,
    });
    return {};
  }
}

function buildScanClientErrorMessage(
  data: AiScanApiResponse,
  status: number,
  fallback = "Scan failed."
): string {
  const message = data.error?.trim() || data.details?.trim() || fallback;
  return data.code ? `${data.code}: ${message}` : `${message} (${status})`;
}

function logScanClientError(message: string, response: Response, data: AiScanApiResponse): void {
  console.error(`[scan] ${message}`, {
    status: response.status,
    statusText: response.statusText,
    code: data.code,
    stage: data.stage,
    error: data.error,
    details: data.details,
    mode: data.mode,
    jobId: data.jobId ?? data.job?.id,
    jobStatus: data.job?.status,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}
