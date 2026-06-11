import { SEASONS, type Season } from "@/lib/landing-data";
import type { SeasonId } from "@/lib/analysis";
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
