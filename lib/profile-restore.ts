import type { SupabaseClient } from "@supabase/supabase-js";
import {
  loadAnalysisResult,
  saveAnalysisResult,
  type StoredAnalysisResult,
} from "./analysis-storage.ts";
import { SEASONS } from "./landing-data.ts";
import {
  buildQuizProfile,
  emptyScores,
  LS_USER_ID,
  saveQuizProfile,
  saveQuizToLocalStorage,
  scoreQuizColorEvidence,
  type QuizProfile,
  type QuizScores,
} from "./quiz.ts";
import type { BodyType, QuizAnswers, StyleVector } from "./quiz-data.ts";

type UnknownRecord = Record<string, unknown>;

export type SupabaseRestoreUserRow = {
  id?: string | null;
  colortype?: string | null;
  colortype_confidence?: number | null;
  quiz_answers?: unknown;
  best_colors?: string[] | null;
  avoid_colors?: string[] | null;
};

export type SupabaseRestoreProfileRow = {
  id?: string | null;
  color_season?: string | null;
  undertone?: string | null;
  contrast?: string | null;
  intensity?: string | null;
  body_type?: string | null;
  style_vector?: unknown;
  sub_season?: string | null;
};

export type RestoredQuizProfile = {
  profile: QuizProfile;
  analysisResult: StoredAnalysisResult | null;
  userId: string | null;
};

export async function loadSupabaseQuizProfile(
  supabase: SupabaseClient,
  authId: string
): Promise<RestoredQuizProfile | null> {
  const [userResult, profileResult] = await Promise.all([
    supabase.from("users").select("*").eq("auth_id", authId).maybeSingle(),
    supabase.from("profiles").select("*").eq("id", authId).maybeSingle(),
  ]);

  const userRow = userResult.error ? null : (userResult.data as SupabaseRestoreUserRow | null);
  const profileRow = profileResult.error
    ? null
    : (profileResult.data as SupabaseRestoreProfileRow | null);

  return restoreQuizProfileFromSupabaseRows(userRow, profileRow);
}

export function restoreQuizProfileFromSupabaseRows(
  userRow: SupabaseRestoreUserRow | null | undefined,
  profileRow: SupabaseRestoreProfileRow | null | undefined
): RestoredQuizProfile | null {
  const userPayload = getPayloadRecord(userRow?.quiz_answers);
  const profileStyleVector = asRecord(profileRow?.style_vector);
  const profilePayload = getPayloadRecord(profileStyleVector);
  const payload = userPayload ?? profilePayload;
  const profile =
    normalizeQuizProfile(userPayload?.quizProfile) ??
    normalizeQuizProfile(profilePayload?.quizProfile) ??
    rebuildProfileFromPayload(payload, userRow, profileRow);

  if (!profile) return null;

  return {
    profile: mergeProfileRow(profile, profileRow),
    analysisResult:
      normalizeStoredAnalysisResult(userPayload?.analysisResult) ??
      normalizeStoredAnalysisResult(profilePayload?.analysisResult) ??
      normalizeStoredAnalysisResult(profileStyleVector?.analysisResult),
    userId: typeof userRow?.id === "string" ? userRow.id : null,
  };
}

export function saveRestoredQuizProfileToBrowserStorage(restored: RestoredQuizProfile): void {
  saveQuizProfile(restored.profile);
  saveQuizToLocalStorage(restored.profile);
  if (restored.analysisResult) saveAnalysisResult(restored.analysisResult);
  if (restored.userId && typeof window !== "undefined") {
    window.localStorage.setItem(LS_USER_ID, restored.userId);
  }
}

export function loadLocalAnalysisResultForProfile<T extends StoredAnalysisResult>(): T | null {
  const localResult = loadAnalysisResult<T>();
  if (localResult) return localResult;
  if (typeof window === "undefined") return null;
  return loadAnalysisResult<T>(window.sessionStorage);
}

function rebuildProfileFromPayload(
  payload: UnknownRecord | null,
  userRow: SupabaseRestoreUserRow | null | undefined,
  profileRow: SupabaseRestoreProfileRow | null | undefined
): QuizProfile | null {
  const answers = normalizeQuizAnswers(payload?.fullQuizAnswers);
  if (!answers) return null;

  const scores = normalizeQuizScores(asRecord(payload?.quizProfile)?.scores);
  const evidence = scoreQuizColorEvidence(answers);
  const seasonId = normalizeSeasonId(userRow?.colortype ?? profileRow?.color_season ?? evidence.seasonId);
  const season = SEASONS.find((item) => item.id === seasonId);

  return buildQuizProfile(answers, scores, {
    seasonId,
    seasonName: season?.name,
    undertoneHint: normalizeUndertone(profileRow?.undertone),
    bodyType: normalizeBodyType(profileRow?.body_type),
    styleVector: normalizeStyleVector(profileRow?.style_vector),
    subSeason:
      (typeof profileRow?.sub_season === "string" && profileRow.sub_season) ||
      (typeof payload?.subSeason === "string" ? payload.subSeason : evidence.subSeason),
  });
}

function mergeProfileRow(
  profile: QuizProfile,
  profileRow: SupabaseRestoreProfileRow | null | undefined
): QuizProfile {
  const seasonId = normalizeSeasonId(profileRow?.color_season) ?? profile.seasonId;
  const season = SEASONS.find((item) => item.id === seasonId);
  return {
    ...profile,
    seasonId,
    seasonName: season?.name ?? profile.seasonName,
    undertoneHint: normalizeUndertone(profileRow?.undertone) ?? profile.undertoneHint,
    bodyType: normalizeBodyType(profileRow?.body_type) ?? profile.bodyType,
    styleVector: normalizeStyleVector(profileRow?.style_vector) ?? profile.styleVector,
    subSeason:
      (typeof profileRow?.sub_season === "string" && profileRow.sub_season) || profile.subSeason,
  };
}

function normalizeQuizProfile(value: unknown): QuizProfile | null {
  const record = asRecord(value);
  const answers = normalizeQuizAnswers(record?.answers);
  if (!record || !answers) return null;

  const scores = normalizeQuizScores(record.scores);
  const evidence =
    isRecord(record.quizColorEvidence) ? (record.quizColorEvidence as QuizProfile["quizColorEvidence"]) : scoreQuizColorEvidence(answers);
  const seasonId = normalizeSeasonId(record.seasonId ?? evidence.seasonId);
  const season = SEASONS.find((item) => item.id === seasonId);

  return {
    ...(record as unknown as QuizProfile),
    answers,
    scores,
    seasonId,
    seasonName: typeof record.seasonName === "string" ? record.seasonName : season?.name ?? "Autumn",
    undertoneHint: normalizeUndertone(record.undertoneHint) ?? "neutral",
    completedAt:
      typeof record.completedAt === "string" ? record.completedAt : new Date().toISOString(),
    quizColorEvidence: evidence,
    quizConfidence: typeof record.quizConfidence === "number" ? record.quizConfidence : evidence.confidence,
    subSeason:
      (typeof record.subSeason === "string" && record.subSeason) ||
      (typeof evidence.subSeason === "string" ? evidence.subSeason : undefined),
  };
}

function getPayloadRecord(value: unknown): UnknownRecord | null {
  const record = asRecord(value);
  if (!record) return null;

  const nestedPayload = asRecord(record.quizPayload);
  if (nestedPayload) return nestedPayload;

  if (record.quizProfile || record.fullQuizAnswers || record.quizColorEvidence) {
    return record;
  }

  return null;
}

function normalizeStoredAnalysisResult(value: unknown): StoredAnalysisResult | null {
  const record = asRecord(value);
  const traits = asRecord(record?.traits);
  if (
    !record ||
    typeof record.seasonId !== "string" ||
    typeof record.subSeason !== "string" ||
    !traits ||
    typeof traits.undertone !== "string" ||
    typeof traits.contrast !== "string" ||
    typeof traits.depth !== "string" ||
    typeof record.confidence !== "number" ||
    typeof record.summary !== "string" ||
    !Array.isArray(record.tips)
  ) {
    return null;
  }

  return record as unknown as StoredAnalysisResult;
}

function normalizeQuizAnswers(value: unknown): QuizAnswers | null {
  return isRecord(value) ? (value as unknown as QuizAnswers) : null;
}

function normalizeQuizScores(value: unknown): QuizScores {
  const record = asRecord(value);
  const fallback = emptyScores();
  if (!record) return fallback;
  return {
    spring: typeof record.spring === "number" ? record.spring : fallback.spring,
    summer: typeof record.summer === "number" ? record.summer : fallback.summer,
    autumn: typeof record.autumn === "number" ? record.autumn : fallback.autumn,
    winter: typeof record.winter === "number" ? record.winter : fallback.winter,
  };
}

function normalizeStyleVector(value: unknown): StyleVector | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  if (
    !Array.isArray(record.aesthetics) &&
    !Array.isArray(record.fit) &&
    !Array.isArray(record.occasions)
  ) {
    return undefined;
  }
  return {
    aesthetics: normalizeStringArray(record.aesthetics),
    fit: normalizeStringArray(record.fit),
    occasions: normalizeStringArray(record.occasions),
  };
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeSeasonId(value: unknown): QuizProfile["seasonId"] {
  return value === "spring" || value === "summer" || value === "autumn" || value === "winter"
    ? value
    : "autumn";
}

function normalizeUndertone(value: unknown): QuizProfile["undertoneHint"] | undefined {
  return value === "warm" || value === "cool" || value === "neutral" ? value : undefined;
}

function normalizeBodyType(value: unknown): BodyType | undefined {
  return value === "hourglass" ||
    value === "pear" ||
    value === "apple" ||
    value === "rectangle" ||
    value === "inverted-triangle"
    ? value
    : undefined;
}

function asRecord(value: unknown): UnknownRecord | null {
  return isRecord(value) ? value : null;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
