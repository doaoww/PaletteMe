import { runStructuredStyleResponse, type StyleImageInput } from "../openai.ts";
import { buildScanPrompt, STYLE_DECISION_SYSTEM_PROMPT } from "./prompts.ts";
import { ScanResultSchema, ScanTypeSchema, type ScanResult, type ScanType } from "./schemas.ts";

export const MAX_SCAN_IMAGE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_SCAN_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ScanAnalysisInput = {
  scanType: ScanType;
  imageBase64: string;
  mimeType: string;
  profileSummary?: string;
  userGoal?: string;
  wardrobeSummary?: string;
};

type FormDataReader = {
  get(name: string): FormDataEntryValue | null;
};

export function parseScanType(value: FormDataEntryValue | string | null): ScanType {
  if (typeof value !== "string") return "clothing_item";
  const parsed = ScanTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : "clothing_item";
}

export function validateScanImage(file: Blob): string | null {
  if (!ALLOWED_SCAN_IMAGE_TYPES.has(file.type)) {
    return "Only JPG, PNG, or WebP images are supported.";
  }
  if (file.size > MAX_SCAN_IMAGE_BYTES) {
    return "Image must be 10 MB or smaller.";
  }
  return null;
}

export function readScanProfileSummaryFromFormData(formData: FormDataReader): string | undefined {
  const explicit = readOptionalString(formData.get("profileSummary"));
  if (explicit) return explicit;

  const seasonId =
    readOptionalString(formData.get("seasonId")) ??
    readOptionalString(formData.get("colortype"));
  const subSeason = readOptionalString(formData.get("subSeason"));
  const bestColors = readStringArrayFromFields(formData, "bestColors", "best_colors");
  const colorsToAvoid = readStringArrayFromFields(formData, "colorsToAvoid", "colors_to_avoid");
  const lines = [
    seasonId ? `Season: ${seasonId}` : null,
    subSeason ? `Sub-season: ${subSeason}` : null,
    bestColors.length ? `Best colors: ${bestColors.join(", ")}` : null,
    colorsToAvoid.length ? `Colors to avoid: ${colorsToAvoid.join(", ")}` : null,
  ].filter((line): line is string => Boolean(line));

  return lines.length ? lines.join("\n") : undefined;
}

export function buildScanAnalysisInput(input: ScanAnalysisInput): {
  schema: typeof ScanResultSchema;
  schemaName: string;
  instructions: string;
  prompt: string;
  image: StyleImageInput;
  promptCacheKey: string;
} {
  return {
    schema: ScanResultSchema,
    schemaName: "paletteme_scan_result",
    instructions: STYLE_DECISION_SYSTEM_PROMPT,
    prompt: buildScanPrompt(input),
    image: {
      mimeType: input.mimeType,
      base64: input.imageBase64,
      detail: "high",
    },
    promptCacheKey: `scan:${input.scanType}`,
  };
}

export async function runScanAnalysis(input: ScanAnalysisInput): Promise<ScanResult> {
  return runStructuredStyleResponse(buildScanAnalysisInput(input));
}

function readOptionalString(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readStringArrayFromFields(formData: FormDataReader, ...fields: string[]): string[] {
  for (const field of fields) {
    const parsed = parseStringArray(formData.get(field));
    if (parsed.length > 0) return parsed;
  }
  return [];
}

function parseStringArray(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}
