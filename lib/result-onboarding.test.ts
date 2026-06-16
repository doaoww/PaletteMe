import assert from "node:assert/strict";
import test from "node:test";
import {
  buildResultOnboardingCopy,
  buildResultOnboardingStorageKey,
  hasSeenResultOnboarding,
  markResultOnboardingSeen,
  RESULT_ONBOARDING_SEEN_VALUE,
} from "./result-onboarding.ts";

test("scopes the result onboarding flag to the current user when one exists", () => {
  assert.equal(buildResultOnboardingStorageKey("auth-user-1"), "paletteme_result_onboarding_seen:auth-user-1");
  assert.equal(buildResultOnboardingStorageKey("  "), "paletteme_result_onboarding_seen:local");
  assert.equal(buildResultOnboardingStorageKey(null), "paletteme_result_onboarding_seen:local");
});

test("reads and writes the result onboarding localStorage flag", () => {
  const storage = memoryStorage();

  assert.equal(hasSeenResultOnboarding(storage, "auth-user-1"), false);

  markResultOnboardingSeen(storage, "auth-user-1");

  assert.equal(
    storage.getItem("paletteme_result_onboarding_seen:auth-user-1"),
    RESULT_ONBOARDING_SEEN_VALUE
  );
  assert.equal(hasSeenResultOnboarding(storage, "auth-user-1"), true);
  assert.equal(hasSeenResultOnboarding(storage, "auth-user-2"), false);
});

test("builds onboarding copy from the user's season and sub-season", () => {
  assert.deepEqual(
    buildResultOnboardingCopy({
      seasonId: "autumn",
      seasonName: "Autumn",
      seasonWhy: "Autumns have warm undertones with rich, deep coloring.",
      subSeason: "Warm Autumn",
    }),
    {
      displaySeasonName: "Warm Autumn",
      meaning: "Autumns have warm undertones with rich, deep coloring.",
      tip: "Always wear warm tones near your face.",
    }
  );

  assert.equal(
    buildResultOnboardingCopy({
      seasonId: "winter",
      seasonName: "Winter",
      seasonWhy: "Winters have cool undertones with high contrast.",
      subSeason: "Bright Winter",
    }).tip,
    "Keep your highest contrast and clearest colors near your face."
  );
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
