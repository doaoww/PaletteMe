import { SEASONS, type Season } from "@/lib/landing-data";
import type { SeasonId } from "@/lib/analysis";
import {
  GOAL_LABELS,
  STYLE_LABELS,
  SUN_OPTIONS,
  type QuizAnswers,
  type StyleTrend,
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
};

/** @deprecated Use QuizProfile — kept for gradual migration */
export type QuizResult = QuizProfile;

export function emptyScores(): QuizScores {
  return { spring: 0, summer: 0, autumn: 0, winter: 0 };
}

export function applyAnswer(
  scores: QuizScores,
  delta: Partial<QuizScores>
): QuizScores {
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
  const sun = SUN_OPTIONS.find((o) => o.id === answers.sunReaction);
  return sun?.undertone ?? "neutral";
}

export function buildQuizProfile(
  answers: QuizAnswers,
  scores: QuizScores
): QuizProfile {
  const winner = getWinningSeason(scores);
  return {
    answers,
    scores,
    seasonId: winner.id as SeasonId,
    seasonName: winner.name,
    undertoneHint: getUndertoneHint(answers),
    completedAt: new Date().toISOString(),
  };
}

export function formatProfileForAI(profile: QuizProfile): string {
  const { answers } = profile;
  const lines = [
    `Preliminary season from lifestyle signals: ${profile.seasonName} (${profile.seasonId})`,
    `Undertone hint from sun test: ${profile.undertoneHint}`,
    `Styling goal: ${answers.goal ? GOAL_LABELS[answers.goal] : "not specified"}`,
    `Sun reaction: ${answers.sunReaction ?? "not specified"}`,
    `Natural hair in photo: ${answers.naturalHair ?? "not specified"}`,
  ];

  if (answers.naturalHairColor) {
    lines.push(`Natural hair color (self-reported): ${answers.naturalHairColor}`);
  }
  if (answers.height) lines.push(`Height range: ${answers.height}`);
  if (answers.bodyShape) lines.push(`Body shape: ${answers.bodyShape}`);
  if (answers.styleVibe) {
    lines.push(`Style vibe: ${STYLE_LABELS[answers.styleVibe]}`);
  }
  if (answers.trends?.length) {
    lines.push(`Trend interests: ${answers.trends.join(", ")}`);
  }

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

/** Back-compat aliases */
export const buildQuizResult = buildQuizProfile;
export const saveQuizResult = saveQuizProfile;
export const loadQuizResult = loadQuizProfile;
export const clearQuizResult = clearQuizProfile;

export function toggleTrend(
  current: StyleTrend[] | undefined,
  trend: StyleTrend
): StyleTrend[] {
  const list = current ?? [];
  if (trend === "none") return ["none"];
  const withoutNone = list.filter((t) => t !== "none");
  if (withoutNone.includes(trend)) {
    return withoutNone.filter((t) => t !== trend);
  }
  return [...withoutNone, trend];
}
