export const RESULT_ONBOARDING_SEEN_KEY_PREFIX = "paletteme_result_onboarding_seen";
export const RESULT_ONBOARDING_SEEN_VALUE = "1";

type OnboardingStorage = Pick<Storage, "getItem" | "setItem">;

export type ResultOnboardingCopyInput = {
  seasonId: string;
  seasonName: string;
  seasonWhy?: string | null;
  subSeason?: string | null;
};

export type ResultOnboardingCopy = {
  displaySeasonName: string;
  meaning: string;
  tip: string;
};

export function buildResultOnboardingStorageKey(userId?: string | null): string {
  const scope = userId?.trim() || "local";
  return `${RESULT_ONBOARDING_SEEN_KEY_PREFIX}:${scope}`;
}

export function hasSeenResultOnboarding(
  storage: OnboardingStorage,
  userId?: string | null
): boolean {
  return storage.getItem(buildResultOnboardingStorageKey(userId)) === RESULT_ONBOARDING_SEEN_VALUE;
}

export function markResultOnboardingSeen(
  storage: OnboardingStorage,
  userId?: string | null
): void {
  storage.setItem(buildResultOnboardingStorageKey(userId), RESULT_ONBOARDING_SEEN_VALUE);
}

export function buildResultOnboardingCopy(input: ResultOnboardingCopyInput): ResultOnboardingCopy {
  const displaySeasonName = input.subSeason?.trim() || input.seasonName;
  const meaning = input.seasonWhy?.trim() || fallbackMeaning(input.seasonId, input.seasonName);

  return {
    displaySeasonName,
    meaning,
    tip: buildSeasonTip(input.seasonId, displaySeasonName),
  };
}

function buildSeasonTip(seasonId: string, displaySeasonName: string): string {
  const season = seasonId.toLowerCase();
  const subSeason = displaySeasonName.toLowerCase();

  if (subSeason.includes("warm")) {
    return "Always wear warm tones near your face.";
  }
  if (subSeason.includes("bright") || subSeason.includes("clear")) {
    return "Keep your highest contrast and clearest colors near your face.";
  }
  if (subSeason.includes("dark") || subSeason.includes("deep")) {
    return "Anchor outfits with deeper colors near your face.";
  }
  if (subSeason.includes("soft") || subSeason.includes("muted")) {
    return "Choose softened colors near your face before anything stark.";
  }
  if (subSeason.includes("light")) {
    return "Keep your lightest, freshest colors near your face.";
  }

  if (season === "autumn") return "Always wear warm, earthy tones near your face.";
  if (season === "spring") return "Keep warm, bright colors close to your face.";
  if (season === "summer") return "Choose soft, cool tones near your face.";
  if (season === "winter") return "Use cool, crisp contrast near your face.";
  return `Start with your best ${displaySeasonName} colors near your face.`;
}

function fallbackMeaning(seasonId: string, seasonName: string): string {
  if (seasonId === "autumn") return "Your best colors are warm, rich, and grounded.";
  if (seasonId === "spring") return "Your best colors are warm, fresh, and clear.";
  if (seasonId === "summer") return "Your best colors are cool, soft, and refined.";
  if (seasonId === "winter") return "Your best colors are cool, crisp, and high contrast.";
  return `${seasonName} colors are the shades that work best with your natural coloring.`;
}
