type AnalysisStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const ANALYSIS_STORAGE_KEY = "paletteme_analysis_result";

export type StoredAnalysisResult = {
  seasonId: string;
  subSeason: string;
  traits: {
    undertone: string;
    contrast: string;
    depth: string;
    chroma?: string;
  };
  confidence: number;
  summary: string;
  tips: string[];
  features?: {
    skin?: string;
    hair?: string;
    eyes?: string;
  };
  evidence?: {
    undertone?: string;
    contrast?: string;
    depth?: string;
    chroma?: string;
  };
  quality?: unknown;
  alternatives?: unknown[];
  accuracyNote?: string;
  needsRetake?: false;
  report?: unknown;
  season?: unknown;
};

export function saveAnalysisResult(result: StoredAnalysisResult, storage = getBrowserStorage()): void {
  if (!storage) return;
  storage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(result));
}

export function loadAnalysisResult<T extends StoredAnalysisResult = StoredAnalysisResult>(
  storage = getBrowserStorage()
): T | null {
  if (!storage) return null;
  const raw = storage.getItem(ANALYSIS_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAnalysisResult;
    if (!isStoredAnalysisResult(parsed)) return null;
    return parsed as T;
  } catch {
    return null;
  }
}

export function clearAnalysisResult(storage = getBrowserStorage()): void {
  storage?.removeItem(ANALYSIS_STORAGE_KEY);
}

function isStoredAnalysisResult(value: StoredAnalysisResult): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.seasonId === "string" &&
    typeof value.subSeason === "string" &&
    typeof value.traits === "object" &&
    value.traits !== null &&
    typeof value.traits.undertone === "string" &&
    typeof value.traits.contrast === "string" &&
    typeof value.traits.depth === "string" &&
    typeof value.confidence === "number" &&
    typeof value.summary === "string" &&
    Array.isArray(value.tips)
  );
}

function getBrowserStorage(): AnalysisStorage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}
