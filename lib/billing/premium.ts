export type PremiumLevel = "free" | "report" | "pro";

type PremiumStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type SearchParamsLike = Pick<URLSearchParams, "get">;
type PaymentEnv = {
  NEXT_PUBLIC_FREE_TESTING_MODE?: string;
  NEXT_PUBLIC_PAID_REPORT_URL?: string;
  NEXT_PUBLIC_SUBSCRIPTION_URL?: string;
};

export const PREMIUM_STORAGE_KEY = "paletteme_premium_level";

const LEVEL_WEIGHT: Record<PremiumLevel, number> = {
  free: 0,
  report: 1,
  pro: 2,
};

export function normalizePremiumLevel(value: string | null | undefined): PremiumLevel | null {
  if (value === "free" || value === "report" || value === "pro") return value;
  return null;
}

export function canAccessPremium(current: PremiumLevel, required: Exclude<PremiumLevel, "free">): boolean {
  return LEVEL_WEIGHT[current] >= LEVEL_WEIGHT[required];
}

export function isFreeTestingMode(env: PaymentEnv = process.env as PaymentEnv): boolean {
  const value = env.NEXT_PUBLIC_FREE_TESTING_MODE?.trim().toLowerCase();
  return value !== "false" && value !== "0" && value !== "no" && value !== "off";
}

export function getPaymentUrls(env: PaymentEnv = process.env as PaymentEnv): {
  report?: string;
  pro?: string;
} {
  if (isFreeTestingMode(env)) {
    return {
      report: undefined,
      pro: undefined,
    };
  }

  const report = env.NEXT_PUBLIC_PAID_REPORT_URL?.trim();
  const pro = env.NEXT_PUBLIC_SUBSCRIPTION_URL?.trim();
  return {
    report: report || undefined,
    pro: pro || undefined,
  };
}

export function getStoredPremiumLevel(storage = getBrowserStorage()): PremiumLevel {
  if (!storage) return "free";
  return normalizePremiumLevel(storage.getItem(PREMIUM_STORAGE_KEY)) ?? "free";
}

export function setStoredPremiumLevel(level: PremiumLevel, storage = getBrowserStorage()): void {
  if (!storage) return;
  if (level === "free") {
    storage.removeItem(PREMIUM_STORAGE_KEY);
    return;
  }
  storage.setItem(PREMIUM_STORAGE_KEY, level);
}

export function resolvePremiumLevel(
  searchParams: SearchParamsLike,
  storage = getBrowserStorage(),
  env: PaymentEnv = process.env as PaymentEnv
): PremiumLevel {
  if (isFreeTestingMode(env)) return "pro";

  const stored = getStoredPremiumLevel(storage);
  const paid = normalizePremiumLevel(searchParams.get("paid"));
  if (!paid || paid === "free") return stored;

  const next = LEVEL_WEIGHT[paid] > LEVEL_WEIGHT[stored] ? paid : stored;
  setStoredPremiumLevel(next, storage);
  return next;
}

function getBrowserStorage(): PremiumStorage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}
