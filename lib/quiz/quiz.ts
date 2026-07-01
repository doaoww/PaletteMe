import { SEASONS, type Season } from "@/lib/shared/landing-data";
import type { SeasonId } from "@/lib/analysis/analysis";
import type { QuizAnswersSnapshot } from "@/lib/db/supabase-db";
import {
  GOAL_LABELS,
  STYLE_LABELS,
  STYLE_CHALLENGE_LABELS,
  SUN_OPTIONS,
  VEIN_OPTIONS,
  WARDROBE_TYPE_LABELS,
  STYLE_PAIRS,
  type BodyShape,
  type BodyType,
  type ContrastPref,
  type HairColor,
  type QuizAnswers,
  type SkinTone,
  type StyleSwipePick,
  type StyleTrend,
  type StyleVector,
} from "@/lib/quiz/quiz-data";

export const QUIZ_STORAGE_KEY = "paletteme_quiz_result";

export type QuizScores = Record<SeasonId, number>;

type WarmCoolWinner = "warm" | "cool" | "neutral";
type DepthWinner = "light" | "deep" | "medium";
type ClarityWinner = "bright" | "muted" | "balanced";

export type QuizAxisScore<TWinner extends string> = {
  first: number;
  second: number;
  winner: TWinner;
  confidence: number;
};

export type QuizColorEvidence = {
  warmCool: QuizAxisScore<WarmCoolWinner> & { warm: number; cool: number };
  depth: QuizAxisScore<DepthWinner> & { light: number; deep: number };
  clarity: QuizAxisScore<ClarityWinner> & { bright: number; muted: number };
  seasonId: SeasonId;
  subSeason: string;
  confidence: number;
  evidenceCount: number;
  reasons: string[];
};

export type QuizProfile = {
  answers: QuizAnswers;
  scores: QuizScores;
  seasonId: SeasonId;
  seasonName: string;
  undertoneHint: "warm" | "cool" | "neutral";
  completedAt: string;
  quizColorEvidence: QuizColorEvidence;
  quizConfidence: number;
  // Phase 2 + 3 fields
  bodyType?: BodyType;
  styleVector?: StyleVector;
  subSeason?: string;
  faceShape?: string;
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

function addEvidence(
  reasons: string[],
  reason: string,
  add: () => void
): number {
  add();
  reasons.push(reason);
  return 1;
}

function confidenceFromScores(first: number, second: number): number {
  const total = first + second;
  if (total <= 0) return 50;
  const diff = Math.abs(first - second);
  return Math.round(50 + (diff / total) * 50);
}

function warmCoolScore(warm: number, cool: number): QuizAxisScore<WarmCoolWinner> & { warm: number; cool: number } {
  const winner: WarmCoolWinner = warm === cool ? "neutral" : warm > cool ? "warm" : "cool";
  return {
    first: warm,
    second: cool,
    warm,
    cool,
    winner,
    confidence: confidenceFromScores(warm, cool),
  };
}

function depthScore(light: number, deep: number): QuizAxisScore<DepthWinner> & { light: number; deep: number } {
  const winner: DepthWinner = light === deep ? "medium" : light > deep ? "light" : "deep";
  return {
    first: light,
    second: deep,
    light,
    deep,
    winner,
    confidence: confidenceFromScores(light, deep),
  };
}

function clarityScore(bright: number, muted: number): QuizAxisScore<ClarityWinner> & { bright: number; muted: number } {
  const winner: ClarityWinner = bright === muted ? "balanced" : bright > muted ? "bright" : "muted";
  return {
    first: bright,
    second: muted,
    bright,
    muted,
    winner,
    confidence: confidenceFromScores(bright, muted),
  };
}

function scoreSkinTone(
  skinTone: SkinTone,
  scores: { light: number; deep: number; bright: number; muted: number }
): void {
  if (skinTone === "very-fair" || skinTone === "fair") scores.light += 2;
  if (skinTone === "medium") {
    scores.light += 1;
    scores.deep += 1;
  }
  if (skinTone === "olive") {
    scores.deep += 1;
    scores.muted += 1;
  }
  if (skinTone === "deep" || skinTone === "very-deep") scores.deep += 2;
}

function scoreHairColor(
  hairColor: HairColor,
  scores: { warm: number; cool: number; light: number; deep: number }
): void {
  if (hairColor === "black") {
    scores.cool += 1;
    scores.deep += 2;
  }
  if (hairColor === "dark-brown") {
    scores.warm += 0.5;
    scores.deep += 2;
  }
  if (hairColor === "brown" || hairColor === "medium-brown") {
    scores.warm += 1;
    scores.deep += 1;
  }
  if (hairColor === "light-brown") scores.light += 0.5;
  if (hairColor === "warm-blonde" || hairColor === "blonde") {
    scores.warm += 1;
    scores.light += 2;
  }
  if (hairColor === "cool-blonde") {
    scores.cool += 1;
    scores.light += 2;
  }
  if (hairColor === "red") {
    scores.warm += 1.5;
    scores.deep += 1;
  }
  if (hairColor === "grey-white") {
    scores.cool += 0.5;
    scores.light += 1;
  }
}

function scoreContrast(
  contrast: ContrastPref,
  scores: { light: number; deep: number; bright: number; muted: number }
): void {
  if (contrast === "high") {
    scores.deep += 1;
    scores.bright += 1;
  }
  if (contrast === "medium") {
    scores.deep += 0.5;
    scores.light += 0.5;
  }
  if (contrast === "low") {
    scores.light += 1;
    scores.muted += 1;
  }
}

function mapAxesToSeason(
  warmCool: WarmCoolWinner,
  depth: DepthWinner,
  clarity: ClarityWinner,
  contrast?: ContrastPref
): { seasonId: SeasonId; subSeason: string } {
  // ── WARM ──────────────────────────────────────────────────────────────────
  if (warmCool === "warm") {
    if (depth === "deep") {
      // Warm + deep is always the database's single deep-autumn entry.
      return { seasonId: "autumn", subSeason: "Dark Autumn" };
    }
    if (depth === "medium") {
      // Warm medium + low contrast or muted = autumn territory
      if (contrast === "low") return { seasonId: "autumn", subSeason: "Soft Autumn" };
      if (clarity === "muted") return { seasonId: "autumn", subSeason: "True Autumn" };
      // Warm medium + bright or balanced = spring
      if (clarity === "bright") return { seasonId: "spring", subSeason: "Bright Spring" };
      return { seasonId: "spring", subSeason: "True Spring" };
    }
    // Warm + light
    if (contrast === "high") return { seasonId: "spring", subSeason: "Bright Spring" };
    if (contrast === "medium" && clarity === "bright") return { seasonId: "spring", subSeason: "True Spring" };
    if (contrast === "low" && clarity === "muted") return { seasonId: "spring", subSeason: "Light Spring" };
    if (clarity === "bright") return { seasonId: "spring", subSeason: "Bright Spring" };
    return { seasonId: "spring", subSeason: "True Spring" };
  }

  // ── COOL ──────────────────────────────────────────────────────────────────
  if (warmCool === "cool") {
    if (depth === "deep") {
      // Cool deep + high contrast + bright = Bright Winter (vivid cool)
      if (contrast === "high" && clarity === "bright") {
        return { seasonId: "winter", subSeason: "Bright Winter" };
      }
      return { seasonId: "winter", subSeason: "Dark Winter" };
    }
    // Cool + high contrast + clear = True Winter even at lighter depth
    if (contrast === "high" && clarity === "bright") {
      return { seasonId: "winter", subSeason: "True Winter" };
    }
    // Cool + light + clear = Bright Winter (cool person with vivid bright coloring)
    if (depth === "light" && clarity === "bright") {
      return { seasonId: "winter", subSeason: "Bright Winter" };
    }
    // Cool + medium depth or medium contrast = True Summer
    if (depth === "medium" || contrast === "medium") {
      return { seasonId: "summer", subSeason: "True Summer" };
    }
    // Cool + light + low contrast = Light Summer; muted = Soft Summer
    if (clarity === "muted") return { seasonId: "summer", subSeason: "Soft Summer" };
    return { seasonId: "summer", subSeason: "Light Summer" };
  }

  // ── NEUTRAL ───────────────────────────────────────────────────────────────
  if (depth === "deep") {
    return clarity === "bright"
      ? { seasonId: "winter", subSeason: "Dark Winter" }
      : { seasonId: "autumn", subSeason: "Dark Autumn" };
  }
  if (depth === "light") {
    return clarity === "bright"
      ? { seasonId: "spring", subSeason: "Light Spring" }
      : { seasonId: "summer", subSeason: "Light Summer" };
  }
  // Neutral + medium: muted → Soft Summer; balanced/clear → True Spring
  if (clarity === "muted") return { seasonId: "summer", subSeason: "Soft Summer" };
  return { seasonId: "spring", subSeason: "True Spring" };
}

export function scoreQuizColorEvidence(answers: QuizAnswers): QuizColorEvidence {
  const scores = {
    warm: 0,
    cool: 0,
    light: 0,
    deep: 0,
    bright: 0,
    muted: 0,
  };
  const reasons: string[] = [];
  let evidenceCount = 0;

  if (answers.veinColor === "blue-purple") {
    evidenceCount += addEvidence(reasons, "blue or purple veins point cool", () => {
      scores.cool += 2;
    });
  }
  if (answers.veinColor === "green") {
    evidenceCount += addEvidence(reasons, "green veins point warm", () => {
      scores.warm += 2;
    });
  }
  if (answers.veinColor === "greenish") {
    evidenceCount += addEvidence(reasons, "greenish veins point warm", () => {
      scores.warm += 2;
    });
  }
  if (answers.veinColor === "mix") {
    evidenceCount += addEvidence(reasons, "mixed veins keep undertone neutral", () => {
      scores.warm += 1;
      scores.cool += 1;
    });
  }

  if (answers.metalPref === "gold") {
    evidenceCount += addEvidence(reasons, "gold preference supports warmth", () => {
      scores.warm += 1;
    });
  }
  if (answers.metalPref === "silver") {
    evidenceCount += addEvidence(reasons, "silver preference supports coolness", () => {
      scores.cool += 1;
    });
  }
  if (answers.metalPref === "both") {
    evidenceCount += addEvidence(reasons, "both metals keep undertone balanced", () => {
      scores.warm += 0.5;
      scores.cool += 0.5;
    });
  }

  if (answers.sunReaction === "burns") {
    evidenceCount += addEvidence(reasons, "burning easily supports coolness", () => {
      scores.cool += 2;
    });
  }
  if (answers.sunReaction === "burns-tans") {
    evidenceCount += addEvidence(reasons, "burning then tanning is neutral", () => {
      scores.warm += 1;
      scores.cool += 1;
    });
  }
  if (answers.sunReaction === "tans") {
    evidenceCount += addEvidence(reasons, "tanning easily supports warmth", () => {
      scores.warm += 1;
    });
  }
  if (answers.sunReaction === "never-burns") {
    evidenceCount += addEvidence(reasons, "never burning supports warmth and depth", () => {
      scores.warm += 2;
      scores.deep += 1;
    });
  }

  if (answers.skinTone) {
    evidenceCount += addEvidence(reasons, `${answers.skinTone} skin tone informs depth`, () => {
      scoreSkinTone(answers.skinTone as SkinTone, scores);
    });
  }

  if (answers.naturalHairColor) {
    evidenceCount += addEvidence(reasons, `${answers.naturalHairColor} hair informs temperature and depth`, () => {
      scoreHairColor(answers.naturalHairColor as HairColor, scores);
    });
  }

  if (answers.eyeColor) {
    evidenceCount += addEvidence(reasons, `${answers.eyeColor} eyes inform temperature and chroma`, () => {
      if (answers.eyeColor === "blue" || answers.eyeColor === "blue-green") {
        scores.cool += 1;
        scores.bright += 2;
      }
      if (answers.eyeColor === "green") {
        scores.warm += 0.5;
        scores.bright += 1;
      }
      if (answers.eyeColor === "grey") {
        scores.cool += 1;
        scores.muted += 1;
      }
      if (answers.eyeColor === "hazel") {
        scores.warm += 1;
        scores.muted += 1;
      }
      if (answers.eyeColor === "warm-brown") {
        scores.warm += 1;
        scores.deep += 0.5;
        scores.muted += 1;
      }
      if (answers.eyeColor === "dark-brown") {
        scores.deep += 1;
        scores.muted += 1;
      }
    });
  } else if (answers.eyeFamily) {
    evidenceCount += addEvidence(reasons, `${answers.eyeFamily} eye family informs temperature`, () => {
      if (answers.eyeFamily === "cool") scores.cool += 1;
      if (answers.eyeFamily === "warm") scores.warm += 1;
      if (answers.eyeFamily === "both") {
        scores.warm += 0.5;
        scores.cool += 0.5;
      }
    });
  }

  if (answers.whitePref === "white") {
    evidenceCount += addEvidence(reasons, "pure white preference supports cool brightness", () => {
      scores.cool += 0.5;
      scores.bright += 1;
    });
  }
  if (answers.whitePref === "cream") {
    evidenceCount += addEvidence(reasons, "cream preference supports warm softness", () => {
      scores.warm += 0.5;
      scores.muted += 0.5;
    });
  }

  if (answers.contrastPref) {
    evidenceCount += addEvidence(reasons, `${answers.contrastPref} contrast informs depth and clarity`, () => {
      scoreContrast(answers.contrastPref as ContrastPref, scores);
    });
  }

  if (answers.intensityPref === "vivid") {
    evidenceCount += addEvidence(reasons, "vivid colors support bright clarity", () => {
      scores.bright += 2;
    });
  }
  if (answers.intensityPref === "muted") {
    evidenceCount += addEvidence(reasons, "muted colors support soft earthy clarity", () => {
      scores.muted += 2;
    });
  }

  const warmCool = warmCoolScore(scores.warm, scores.cool);
  const depth = depthScore(scores.light, scores.deep);
  const clarity = clarityScore(scores.bright, scores.muted);
  const mapped = mapAxesToSeason(
    warmCool.winner,
    depth.winner,
    clarity.winner,
    answers.contrastPref
  );

  const confidence = Math.max(
    50,
    Math.min(
      95,
      Math.round(
        (warmCool.confidence + depth.confidence + clarity.confidence) / 3 +
          Math.min(evidenceCount, 10)
      )
    )
  );

  return {
    warmCool,
    depth,
    clarity,
    seasonId: mapped.seasonId,
    subSeason: mapped.subSeason,
    confidence,
    evidenceCount,
    reasons,
  };
}

export function enrichColorAnswers(answers: QuizAnswers): QuizAnswers {
  const next = { ...answers };
  if (!next.intensityPref && next.contrastPref) {
    next.intensityPref = next.contrastPref === "high" ? "vivid" : "muted";
  }
  if (!next.whitePref && next.veinColor) {
    next.whitePref = next.veinColor === "blue-purple" ? "white" : "cream";
  }
  return next;
}

export function deriveBodyType(answers: QuizAnswers): BodyType {
  if (answers.bodyShape) {
    const map: Partial<Record<BodyShape, BodyType>> = {
      hourglass: "hourglass",
      pear: "pear",
      rectangle: "rectangle",
      apple: "apple",
      "inverted-triangle": "inverted-triangle",
      trapezoid: "inverted-triangle",
      oval: "apple",
      triangle: "pear",
      petite: "rectangle",
    };
    return map[answers.bodyShape] ?? "rectangle";
  }

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

export function deriveStyleVectorFromAnswers(answers: QuizAnswers): StyleVector {
  return {
    aesthetics: answers.styleDirections ?? [],
    fit: [],
    occasions: answers.occasions ?? [],
  };
}

export function buildQuizProfile(
  answers: QuizAnswers,
  scores: QuizScores,
  overrides?: Partial<Pick<QuizProfile, "seasonId" | "seasonName" | "undertoneHint" | "bodyType" | "styleVector" | "subSeason" | "faceShape">>
): QuizProfile {
  const enriched = enrichColorAnswers(answers);
  const winner = getWinningSeason(scores);
  const quizColorEvidence = scoreQuizColorEvidence(enriched);
  const useQuizPrior = quizColorEvidence.evidenceCount >= 4 && quizColorEvidence.confidence >= 65;
  const seasonId = overrides?.seasonId ?? (useQuizPrior ? quizColorEvidence.seasonId : (winner.id as SeasonId));
  const season = SEASONS.find((item) => item.id === seasonId) ?? winner;
  return {
    answers: enriched,
    scores,
    seasonId,
    seasonName: overrides?.seasonName ?? season.name,
    undertoneHint: overrides?.undertoneHint ?? getUndertoneHint(enriched),
    completedAt: new Date().toISOString(),
    quizColorEvidence,
    quizConfidence: quizColorEvidence.confidence,
    bodyType: overrides?.bodyType,
    styleVector: overrides?.styleVector,
    subSeason: overrides?.subSeason ?? (useQuizPrior ? quizColorEvidence.subSeason : undefined),
    faceShape: overrides?.faceShape,
  };
}

export function formatProfileForAI(profile: QuizProfile): string {
  const { answers } = profile;
  const evidence = profile.quizColorEvidence ?? scoreQuizColorEvidence(answers);
  const quizConfidence = profile.quizConfidence ?? evidence.confidence;
  const lines = [
    `Preliminary season: ${profile.seasonName} (${profile.seasonId})`,
    `Quiz sub-season prior: ${profile.subSeason ?? evidence.subSeason}`,
    `Quiz confidence: ${quizConfidence}%`,
    `Quiz color evidence: ${evidence.warmCool.winner}, ${evidence.depth.winner}, ${evidence.clarity.winner}`,
    `Undertone: ${profile.undertoneHint}`,
    `Styling goal: ${answers.goal ? GOAL_LABELS[answers.goal] : "not specified"}`,
    `Wardrobe type: ${answers.wardrobeType ? WARDROBE_TYPE_LABELS[answers.wardrobeType] : "not specified"}`,
    `Style challenge: ${answers.styleChallenge ? STYLE_CHALLENGE_LABELS[answers.styleChallenge] : "not specified"}`,
    `Sun reaction: ${answers.sunReaction ?? "not specified"}`,
    `Natural hair in photo: ${answers.naturalHair ?? "not specified"}`,
  ];

  if (answers.naturalHairColor) lines.push(`Natural hair color: ${answers.naturalHairColor}`);
  if (answers.skinTone) lines.push(`Skin tone: ${answers.skinTone}`);
  if (answers.eyeColor) lines.push(`Eye color: ${answers.eyeColor}`);
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
  const serialized = JSON.stringify(profile);
  sessionStorage.setItem(QUIZ_STORAGE_KEY, serialized);
  localStorage.setItem(QUIZ_STORAGE_KEY, serialized);
}

export function loadQuizProfile(): QuizProfile | null {
  if (typeof window === "undefined") return null;
  const raw =
    sessionStorage.getItem(QUIZ_STORAGE_KEY) ??
    localStorage.getItem(QUIZ_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as QuizProfile;
    if (!parsed.answers || !parsed.scores) return null;
    const quizColorEvidence = parsed.quizColorEvidence ?? scoreQuizColorEvidence(parsed.answers);
    return {
      ...parsed,
      quizColorEvidence,
      quizConfidence: parsed.quizConfidence ?? quizColorEvidence.confidence,
      subSeason: parsed.subSeason ?? quizColorEvidence.subSeason,
    };
  } catch {
    return null;
  }
}

export function clearQuizProfile(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(QUIZ_STORAGE_KEY);
  localStorage.removeItem(QUIZ_STORAGE_KEY);
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
    const { createClient } = await import("@/lib/db/supabase");
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
