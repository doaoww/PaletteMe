import type { SupabaseClient } from "@supabase/supabase-js";
import { ANALYSIS_STORAGE_KEY, loadAnalysisResult, type StoredAnalysisResult } from "@/lib/analysis/analysis-storage";
import { SEASONS } from "@/lib/shared/landing-data";
import { LS_USER_ID, type QuizProfile } from "@/lib/quiz/quiz";

export type CompleteQuizPayload = {
  quizProfile: QuizProfile;
  quizColorEvidence: QuizProfile["quizColorEvidence"];
  quizConfidence: number;
  subSeason: string | null;
  colortype: QuizProfile["seasonId"];
  fullQuizAnswers: QuizProfile["answers"];
  analysisResult: StoredAnalysisResult | null;
};

export type PostQuizAuthUser = {
  id: string;
  email?: string | null;
};

export type CompleteQuizUsersRow = {
  auth_id: string;
  email: string | null;
  colortype: string;
  colortype_confidence: number;
  quiz_answers: CompleteQuizPayload;
  best_colors: string[];
  avoid_colors: string[];
};

export type CompleteQuizProfilesRow = {
  id: string;
  color_season: string;
  undertone: string | null;
  contrast: string | null;
  intensity: string | null;
  best_colors: string[];
  avoid_colors: string[];
  neutrals: string[];
  body_type: string | null;
  style_vector: Record<string, unknown> & { quizPayload: CompleteQuizPayload };
  sub_season: string | null;
  onboarding_completed: boolean;
  updated_at: string;
};

export type CompleteQuizSupabaseRows = {
  userRow: CompleteQuizUsersRow;
  profileRow: CompleteQuizProfilesRow;
};

type BuildRowsInput = {
  profile: QuizProfile;
  analysisResult?: StoredAnalysisResult | null;
  user: PostQuizAuthUser;
  now?: string;
};

type SaveInput = BuildRowsInput & {
  supabase: SupabaseClient;
  anonymousId?: string | null;
};

export type SaveCompleteQuizResult =
  | { ok: true; userId: string | null }
  | { ok: false; error: string };

export function buildCompleteQuizPayload(
  profile: QuizProfile,
  analysisResult: StoredAnalysisResult | null = null
): CompleteQuizPayload {
  return {
    quizProfile: profile,
    quizColorEvidence: profile.quizColorEvidence,
    quizConfidence: profile.quizConfidence,
    subSeason: profile.subSeason ?? profile.quizColorEvidence.subSeason ?? null,
    colortype: profile.seasonId,
    fullQuizAnswers: profile.answers,
    analysisResult,
  };
}

export function buildCompleteQuizSupabaseRows({
  profile,
  analysisResult = null,
  user,
  now = new Date().toISOString(),
}: BuildRowsInput): CompleteQuizSupabaseRows {
  const payload = buildCompleteQuizPayload(profile, analysisResult);
  const palette = getSeasonPalette(profile);
  const avoidColors = getAvoidColors(analysisResult);

  return {
    userRow: {
      auth_id: user.id,
      email: user.email?.toLowerCase() ?? null,
      colortype: profile.seasonId,
      colortype_confidence: Math.round(profile.quizConfidence),
      quiz_answers: payload,
      best_colors: palette,
      avoid_colors: avoidColors,
    },
    profileRow: {
      id: user.id,
      color_season: profile.seasonId,
      undertone: analysisResult?.traits.undertone ?? profile.undertoneHint ?? null,
      contrast: analysisResult?.traits.contrast ?? null,
      intensity: profile.quizColorEvidence.clarity.winner,
      best_colors: palette,
      avoid_colors: avoidColors,
      neutrals: [],
      body_type: profile.bodyType ?? null,
      style_vector: {
        ...(profile.styleVector ?? {}),
        quizProfile: profile,
        quizPayload: payload,
        fullQuizAnswers: profile.answers,
        quizColorEvidence: profile.quizColorEvidence,
        quizConfidence: profile.quizConfidence,
        analysisResult,
      },
      sub_season: payload.subSeason,
      onboarding_completed: true,
      updated_at: now,
    },
  };
}

export async function saveCompleteQuizResultToSupabase({
  supabase,
  profile,
  analysisResult = loadStoredAnalysisResultForPostQuiz(),
  user,
  anonymousId = getStoredAnonymousId(),
}: SaveInput): Promise<SaveCompleteQuizResult> {
  const rows = buildCompleteQuizSupabaseRows({ profile, analysisResult, user });
  const userResult = await saveUsersRow(supabase, rows.userRow, anonymousId);
  if (!userResult.ok) return userResult;

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(rows.profileRow, { onConflict: "id" });

  if (profileError) {
    return { ok: false, error: "profiles_save_failed" };
  }

  if (userResult.userId && typeof window !== "undefined") {
    window.localStorage.setItem(LS_USER_ID, userResult.userId);
  }

  return userResult;
}

export function loadStoredAnalysisResultForPostQuiz(): StoredAnalysisResult | null {
  const localResult = loadAnalysisResult<StoredAnalysisResult>();
  if (localResult) return localResult;
  if (typeof window === "undefined") return null;
  return loadAnalysisResult<StoredAnalysisResult>(window.sessionStorage);
}

function getStoredAnonymousId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LS_USER_ID);
}

async function saveUsersRow(
  supabase: SupabaseClient,
  userRow: CompleteQuizUsersRow,
  anonymousId?: string | null
): Promise<SaveCompleteQuizResult> {
  const id = anonymousId?.trim();

  if (id) {
    const { data, error } = await supabase
      .from("users")
      .update(userRow)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) return { ok: false, error: "users_save_failed" };
    if (data?.id) return { ok: true, userId: data.id as string };
  }

  const { data, error } = await supabase
    .from("users")
    .insert(userRow)
    .select("id")
    .single();

  if (error) return { ok: false, error: "users_save_failed" };
  return { ok: true, userId: data?.id ? String(data.id) : null };
}

function getSeasonPalette(profile: QuizProfile): string[] {
  return SEASONS.find((season) => season.id === profile.seasonId)?.palette ?? [];
}

function getAvoidColors(analysisResult: StoredAnalysisResult | null): string[] {
  if (!analysisResult?.report || typeof analysisResult.report !== "object") return [];
  const report = analysisResult.report as { avoidColors?: unknown; avoid?: unknown };
  const colors = Array.isArray(report.avoidColors) ? report.avoidColors : report.avoid;
  return Array.isArray(colors) ? colors.filter((color): color is string => typeof color === "string") : [];
}

export function copyAnalysisResultToSessionStorage(): void {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(ANALYSIS_STORAGE_KEY);
  if (raw) window.sessionStorage.setItem(ANALYSIS_STORAGE_KEY, raw);
}
