import assert from "node:assert/strict";
import test from "node:test";
import {
  buildQuizProfile,
  clearQuizProfile,
  emptyScores,
  formatProfileForAI,
  loadQuizProfile,
  QUIZ_STORAGE_KEY,
  scoreQuizColorEvidence,
} from "@/lib/quiz/quiz";
import type { QuizAnswers } from "@/lib/quiz/quiz-data";

test("quiz color evidence prefers Dark Autumn for warm deep muted answers", () => {
  const answers: QuizAnswers = {
    wardrobeType: "womenswear",
    styleChallenge: "cant-combine",
    veinColor: "green",
    metalPref: "gold",
    sunReaction: "never-burns",
    skinTone: "olive",
    naturalHairColor: "dark-brown",
    eyeColor: "hazel",
    whitePref: "cream",
    contrastPref: "medium",
    intensityPref: "muted",
  };

  const evidence = scoreQuizColorEvidence(answers);

  assert.equal(evidence.warmCool.winner, "warm");
  assert.equal(evidence.depth.winner, "deep");
  assert.equal(evidence.clarity.winner, "muted");
  assert.equal(evidence.seasonId, "autumn");
  assert.equal(evidence.subSeason, "Dark Autumn");
  assert.ok(evidence.confidence >= 80);
});

test("quiz color evidence prefers Winter for cool deep bright answers", () => {
  const evidence = scoreQuizColorEvidence({
    wardrobeType: "menswear",
    styleChallenge: "dont-know-buy",
    veinColor: "blue-purple",
    metalPref: "silver",
    sunReaction: "burns",
    skinTone: "fair",
    naturalHairColor: "black",
    eyeColor: "blue",
    whitePref: "white",
    contrastPref: "high",
    intensityPref: "vivid",
  });

  assert.equal(evidence.warmCool.winner, "cool");
  assert.equal(evidence.depth.winner, "deep");
  assert.equal(evidence.clarity.winner, "bright");
  assert.equal(evidence.seasonId, "winter");
  assert.equal(evidence.subSeason, "Bright Winter");
  assert.ok(evidence.confidence >= 80);
});

test("buildQuizProfile stores the quiz prior when answers are more specific than macro scores", () => {
  const profile = buildQuizProfile(
    {
      wardrobeType: "unisex",
      styleChallenge: "never-wear",
      veinColor: "green",
      metalPref: "gold",
      sunReaction: "tans",
      skinTone: "deep",
      naturalHairColor: "dark-brown",
      eyeColor: "warm-brown",
      whitePref: "cream",
      contrastPref: "high",
      intensityPref: "muted",
    },
    emptyScores()
  );

  assert.equal(profile.seasonId, "autumn");
  assert.equal(profile.seasonName, "Autumn");
  assert.equal(profile.subSeason, "Dark Autumn");
  assert.equal(profile.quizColorEvidence.seasonId, "autumn");
});

test("formatProfileForAI includes wardrobe type, style challenge, and quiz prior evidence", () => {
  const profile = buildQuizProfile(
    {
      wardrobeType: "both",
      styleChallenge: "style-refresh",
      veinColor: "blue-purple",
      metalPref: "silver",
      sunReaction: "burns",
      skinTone: "fair",
      naturalHairColor: "black",
      eyeColor: "blue",
      whitePref: "white",
      contrastPref: "high",
      intensityPref: "vivid",
    },
    emptyScores()
  );

  const promptContext = formatProfileForAI(profile);

  assert.match(promptContext, /Wardrobe type: both menswear and womenswear/i);
  assert.match(promptContext, /Style challenge: full style refresh/i);
  assert.match(promptContext, /Quiz sub-season prior: Bright Winter/i);
  assert.match(promptContext, /Quiz color evidence: cool, deep, bright/i);
});

test("loadQuizProfile falls back to localStorage when sessionStorage is empty", () => {
  const profile = buildQuizProfile(
    {
      wardrobeType: "unisex",
      styleChallenge: "style-refresh",
      veinColor: "green",
      sunReaction: "tans",
      naturalHairColor: "brown",
      eyeColor: "hazel",
      contrastPref: "medium",
    },
    emptyScores()
  );
  const sessionStorage = memoryStorage();
  const localStorage = memoryStorage();
  const globals = globalThis as unknown as {
    window?: unknown;
    sessionStorage?: Storage;
    localStorage?: Storage;
  };
  const previousWindow = globals.window;
  const previousSessionStorage = globals.sessionStorage;
  const previousLocalStorage = globals.localStorage;

  globals.window = {};
  globals.sessionStorage = sessionStorage;
  globals.localStorage = localStorage;
  localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(profile));

  try {
    const restored = loadQuizProfile();
    assert.deepEqual(restored?.answers, profile.answers);
    assert.deepEqual(restored?.scores, profile.scores);
    assert.equal(restored?.seasonId, profile.seasonId);
    assert.equal(restored?.subSeason, profile.subSeason);
    assert.deepEqual(restored?.quizColorEvidence, profile.quizColorEvidence);
    clearQuizProfile();
    assert.equal(localStorage.getItem(QUIZ_STORAGE_KEY), null);
  } finally {
    globals.window = previousWindow;
    globals.sessionStorage = previousSessionStorage;
    globals.localStorage = previousLocalStorage;
  }
});

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    key(index: number) {
      return [...data.keys()][index] ?? null;
    },
    removeItem(key: string) {
      data.delete(key);
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
  };
}
