import { SEASONS, type Season } from "@/lib/landing-data";
import type { SeasonId } from "@/lib/analysis";
import type { QuizAnswersSnapshot } from "@/lib/supabase-db";
import {
  GOAL_LABELS,
  STYLE_LABELS,
  SUN_OPTIONS,
  VEIN_OPTIONS,
  STYLE_PAIRS,
  type BodyType,
  type QuizAnswers,
  type StyleSwipePick,
  type StyleTrend,
  type StyleVector,
} from "@/lib/quiz-data";

export const QUIZ_STORAGE_KEY = "paletteme_quiz_result";

export type QuizScores = Record<SeasonId, number>;

export type QuizProfile = {
  answers: QuizAnswers;
  scores: QuizScores;
  seasonId: SeasonId;
  seasonName: string;
  undertoneHint: "warm" | "cool" | "neutral";
  completedAt: string;
  // Phase 2 + 3 fields
  bodyType?: BodyType;
  styleVector?: StyleVector;
  subSeason?: string;
};

/** @deprecated Use QuizProfile */
export type QuizResult = QuizProfile;

export function emptyScores(): QuizScores {
  return { spring: 0, summer: 0, autumn: 0, winter: 0 };
}

export function applyAnswer(scores: QuizScores, delta: Partial<QuizScores>): QuizScores {
  const next = { ...scores };
  for (const [key, value] of Object.entries(delta)) {
    if (value) next[key as SeasonId] = (next[key as SeasonId] ?? 0) + value;
  }
  return next;
}

export function getWinningSeason(scores: QuizScores): Season {
  return SEASONS.reduce(
    (best, season) =>
      scores[season.id as SeasonId] > scores[best.id as SeasonId] ? season : best,
    SEASONS[0]
  );
}

export function getUndertoneHint(answers: QuizAnswers): "warm" | "cool" | "neutral" {
  // Prefer vein color test, fall back to sun reaction
  if (answers.veinColor) {
    const opt = VEIN_OPTIONS.find((o) => o.id === answers.veinColor);
    if (opt) return opt.undertone;
  }
  const sun = SUN_OPTIONS.find((o) => o.id === answers.sunReaction);
  return sun?.undertone ?? "neutral";
}

export function deriveBodyType(answers: QuizAnswers): BodyType {
  const { shoulderHipRatio, waistDefinition, weightGain } = answers;
  if (weightGain === "middle") return "apple";
  if (shoulderHipRatio === "shoulders") return "inverted-triangle";
  if (shoulderHipRatio === "hips") {
    return waistDefinition === "defined" ? "pear" : "apple";
  }
  if (waistDefinition === "defined") return "hourglass";
  return "rectangle";
}

export function deriveStyleVector(picks: StyleSwipePick[]): StyleVector {
  const aesthetics = new Set<string>();
  const fit = new Set<string>();
  const occasions = new Set<string>();

  picks.forEach((pick, i) => {
    const pair = STYLE_PAIRS[i];
    if (!pair) return;
    const tags = pick === "a" ? pair.a.tags : pair.b.tags;
    tags.aesthetics?.forEach((a) => aesthetics.add(a));
    tags.fit?.forEach((f) => fit.add(f));
    tags.occasions?.forEach((o) => occasions.add(o));
  });

  return {
    aesthetics: [...aesthetics],
    fit: [...fit],
    occasions: [...occasions],
  };
}

export function buildQuizProfile(
  answers: QuizAnswers,
  scores: QuizScores,
  overrides?: Partial<Pick<QuizProfile, "seasonId" | "seasonName" | "undertoneHint" | "bodyType" | "styleVector" | "subSeason">>
): QuizProfile {
  const winner = getWinningSeason(scores);
  return {
    answers,
    scores,
    seasonId: overrides?.seasonId ?? (winner.id as SeasonId),
    seasonName: overrides?.seasonName ?? winner.name,
    undertoneHint: overrides?.undertoneHint ?? getUndertoneHint(answers),
    completedAt: new Date().toISOString(),
    bodyType: overrides?.bodyType,
    styleVector: overrides?.styleVector,
    subSeason: overrides?.subSeason,
  };
}

export function formatProfileForAI(profile: QuizProfile): string {
  const { answers } = profile;
  const lines = [
    `Preliminary season: ${profile.seasonName} (${profile.seasonId})`,
    `Undertone: ${profile.undertoneHint}`,
    `Styling goal: ${answers.goal ? GOAL_LABELS[answers.goal] : "not specified"}`,
    `Sun reaction: ${answers.sunReaction ?? "not specified"}`,
    `Natural hair in photo: ${answers.naturalHair ?? "not specified"}`,
  ];

  if (answers.naturalHairColor) lines.push(`Natural hair color: ${answers.naturalHairColor}`);
  if (profile.bodyType) {
    lines.push(`Body type: ${profile.bodyType}`);
  }
  if (answers.styleVibe) lines.push(`Style vibe: ${STYLE_LABELS[answers.styleVibe]}`);
  if (profile.styleVector?.aesthetics.length) {
    lines.push(`Style aesthetics: ${profile.styleVector.aesthetics.join(", ")}`);
  }
  if (answers.trends?.length) lines.push(`Trend interests: ${answers.trends.join(", ")}`);

  lines.push(
    `Season scores — spring: ${profile.scores.spring}, summer: ${profile.scores.summer}, autumn: ${profile.scores.autumn}, winter: ${profile.scores.winter}`
  );

  return lines.join("\n");
}

export function saveQuizProfile(profile: QuizProfile): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(profile));
}

export function loadQuizProfile(): QuizProfile | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as QuizProfile;
    if (!parsed.answers || !parsed.scores) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearQuizProfile(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(QUIZ_STORAGE_KEY);
}

export function toggleTrend(
  current: StyleTrend[] | undefined,
  trend: StyleTrend
): StyleTrend[] {
  const list = current ?? [];
  if (trend === "none") return ["none"];
  const withoutNone = list.filter((t) => t !== "none");
  if (withoutNone.includes(trend)) return withoutNone.filter((t) => t !== trend);
  return [...withoutNone, trend];
}

/** Back-compat aliases */
export const buildQuizResult = buildQuizProfile;
export const saveQuizResult = saveQuizProfile;
export const loadQuizResult = loadQuizProfile;
export const clearQuizResult = clearQuizProfile;

// ─── localStorage keys (Problem 9) ────────────────────────────────────────────

export const LS_USER_ID = "palette_user_id";
export const LS_QUIZ    = "palette_quiz";
export const LS_COLORTYPE    = "palette_colortype";
export const LS_BEST_COLORS  = "palette_best_colors";

// ─── Derive quiz answer snapshot for Supabase / localStorage ──────────────────

function mapStyle(aesthetics: string[] | undefined): QuizAnswersSnapshot["style"] {
  const first = aesthetics?.[0]?.toLowerCase() ?? "";
  const map: Record<string, QuizAnswersSnapshot["style"]> = {
    minimalist: "minimalist",
    classic: "classic",
    edgy: "edgy",
    romantic: "romantic",
    bohemian: "bohemian",
    feminine: "romantic",
    casual: "classic",
    preppy: "classic",
    sporty: "classic",
  };
  return map[first] ?? "classic";
}

function mapOccasion(occasions: string[] | undefined): QuizAnswersSnapshot["occasion"] {
  const occ = occasions?.[0]?.toLowerCase() ?? "";
  const map: Record<string, QuizAnswersSnapshot["occasion"]> = {
    office: "work",
    work: "work",
    evening: "going_out",
    weekend: "everyday",
    activewear: "everyday",
    special: "special",
  };
  return map[occ] ?? "everyday";
}

function mapBodyConcern(bodyType: string | undefined): QuizAnswersSnapshot["body_concern"] {
  const map: Record<string, QuizAnswersSnapshot["body_concern"]> = {
    pear: "hips",
    apple: "waist",
    "inverted-triangle": "shoulders",
    hourglass: "none",
    rectangle: "none",
  };
  return map[bodyType ?? ""] ?? "none";
}

export function buildQuizSnapshot(profile: QuizProfile): QuizAnswersSnapshot {
  return {
    style: mapStyle(profile.styleVector?.aesthetics),
    occasion: mapOccasion(profile.styleVector?.occasions),
    body_concern: mapBodyConcern(profile.bodyType),
    budget: "mid",
  };
}

// ─── Save quiz to localStorage ─────────────────────────────────────────────────

export function saveQuizToLocalStorage(profile: QuizProfile): void {
  if (typeof window === "undefined") return;
  const snapshot = buildQuizSnapshot(profile);
  localStorage.setItem(LS_QUIZ, JSON.stringify(snapshot));
}

// ─── Save quiz to Supabase users table ────────────────────────────────────────
// Returns the new user_id and also writes it + palette_quiz to localStorage.

export async function saveQuizToSupabase(profile: QuizProfile): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  const snapshot = buildQuizSnapshot(profile);

  try {
    const { createClient } = await import("@/lib/supabase");
    const db = createClient();

    const { data, error } = await db
      .from("users")
      .insert({
        colortype: profile.seasonId,
        quiz_answers: snapshot,
      })
      .select("id")
      .single();

    if (error || !data) return null;

    const userId = (data as { id: string }).id;
    localStorage.setItem(LS_USER_ID, userId);
    localStorage.setItem(LS_QUIZ, JSON.stringify(snapshot));
    return userId;
  } catch {
    return null;
  }
}
