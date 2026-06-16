import assert from "node:assert/strict";
import test from "node:test";
import { buildCompleteQuizPayload } from "./post-quiz-supabase.ts";
import { restoreQuizProfileFromSupabaseRows } from "./profile-restore.ts";
import { buildQuizProfile, emptyScores } from "./quiz.ts";
import type { StoredAnalysisResult } from "./analysis-storage.ts";

test("restores a full QuizProfile from the users table payload", () => {
  const profile = buildQuizProfile(
    {
      wardrobeType: "unisex",
      styleChallenge: "dont-know-buy",
      skinTone: "olive",
      veinColor: "green",
      naturalHairColor: "dark-brown",
      eyeColor: "hazel",
      contrastPref: "medium",
      sunReaction: "never-burns",
      styleDirections: ["classic"],
      occasions: ["work"],
    },
    emptyScores()
  );
  const analysisResult: StoredAnalysisResult = {
    seasonId: "autumn",
    subSeason: "Dark Autumn",
    traits: { undertone: "warm", contrast: "medium", depth: "deep" },
    confidence: 91,
    summary: "Warm deep coloring.",
    tips: ["Try olive."],
  };

  const restored = restoreQuizProfileFromSupabaseRows(
    {
      id: "anonymous-row-1",
      quiz_answers: buildCompleteQuizPayload(profile, analysisResult),
    },
    null
  );

  assert.deepEqual(restored?.profile, profile);
  assert.deepEqual(restored?.analysisResult, analysisResult);
  assert.equal(restored?.userId, "anonymous-row-1");
});

test("restores from profiles payload when users row only has lightweight quiz_answers", () => {
  const profile = buildQuizProfile(
    {
      wardrobeType: "womenswear",
      styleChallenge: "cant-combine",
      skinTone: "fair",
      veinColor: "blue-purple",
      naturalHairColor: "black",
      eyeColor: "blue",
      contrastPref: "high",
      sunReaction: "burns",
      styleDirections: ["minimalist"],
      occasions: ["events"],
    },
    emptyScores()
  );

  const restored = restoreQuizProfileFromSupabaseRows(
    {
      id: "anonymous-row-2",
      quiz_answers: {
        style: "classic",
        occasion: "everyday",
        body_concern: "none",
        budget: "mid",
      },
    },
    {
      id: "auth-user-1",
      color_season: profile.seasonId,
      style_vector: {
        quizPayload: buildCompleteQuizPayload(profile, null),
      },
      sub_season: profile.subSeason,
    }
  );

  assert.deepEqual(restored?.profile, profile);
  assert.equal(restored?.userId, "anonymous-row-2");
});

test("returns null when Supabase only has legacy lightweight data", () => {
  const restored = restoreQuizProfileFromSupabaseRows(
    {
      id: "anonymous-row-3",
      colortype: "autumn",
      quiz_answers: {
        style: "classic",
        occasion: "everyday",
        body_concern: "none",
        budget: "mid",
      },
    },
    null
  );

  assert.equal(restored, null);
});
