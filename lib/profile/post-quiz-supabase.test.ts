import assert from "node:assert/strict";
import test from "node:test";
import { buildCompleteQuizPayload, buildCompleteQuizSupabaseRows } from "./post-quiz-supabase.ts";
import { buildQuizProfile, emptyScores } from "@/lib/quiz/quiz";
import type { StoredAnalysisResult } from "@/lib/analysis/analysis-storage";

test("builds a complete post-auth quiz payload for Supabase", () => {
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
    confidence: 88,
    summary: "Warm deep coloring.",
    tips: ["Wear olive."],
  };

  const payload = buildCompleteQuizPayload(profile, analysisResult);

  assert.deepEqual(payload.quizProfile, profile);
  assert.deepEqual(payload.quizColorEvidence, profile.quizColorEvidence);
  assert.equal(payload.quizConfidence, profile.quizConfidence);
  assert.equal(payload.subSeason, profile.subSeason);
  assert.equal(payload.colortype, profile.seasonId);
  assert.deepEqual(payload.fullQuizAnswers, profile.answers);
  assert.deepEqual(payload.analysisResult, analysisResult);
});

test("maps complete quiz payload into existing users and profiles table rows", () => {
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
      styleDirections: ["minimalist", "streetwear"],
      occasions: ["events"],
    },
    emptyScores()
  );

  const rows = buildCompleteQuizSupabaseRows({
    profile,
    analysisResult: null,
    user: { id: "auth-user-1", email: "ME@EXAMPLE.COM" },
    now: "2026-06-15T00:00:00.000Z",
  });

  assert.equal(rows.userRow.auth_id, "auth-user-1");
  assert.equal(rows.userRow.email, "me@example.com");
  assert.equal(rows.userRow.colortype, profile.seasonId);
  assert.equal(rows.userRow.colortype_confidence, profile.quizConfidence);
  assert.deepEqual(rows.userRow.quiz_answers.quizProfile, profile);
  assert.equal(rows.profileRow.id, "auth-user-1");
  assert.equal(rows.profileRow.color_season, profile.seasonId);
  assert.equal(rows.profileRow.sub_season, profile.subSeason);
  assert.deepEqual(rows.profileRow.style_vector.quizPayload.fullQuizAnswers, profile.answers);
  assert.equal(rows.profileRow.onboarding_completed, true);
});
