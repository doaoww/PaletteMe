import type { ScanRequestType } from "./outfit-scan.ts";

type CreditStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const DEFAULT_WEEKLY_SCAN_CREDITS = 3;
export const SCAN_CREDIT_STORAGE_KEY = "paletteme_weekly_scan_credits";

export type ScanCreditState = {
  periodKey: string;
  allowance: number;
  remaining: number;
  used: number;
};

export type ScanCreditAttempt = ScanCreditState & {
  ok: boolean;
  cost: number;
  message?: string;
};

type StoredScanCreditState = {
  periodKey?: string;
  allowance?: number;
  remaining?: number;
  used?: number;
};

export function getScanCreditCost(scanType: ScanRequestType): number {
  return scanType === "outfit" ? 2 : 1;
}

export function getScanCreditState(
  storage = getBrowserStorage(),
  now = new Date()
): ScanCreditState {
  const periodKey = getWeeklyCreditPeriodKey(now);
  if (!storage) return createFreshState(periodKey);

  const stored = readStoredState(storage);
  if (!stored || stored.periodKey !== periodKey) {
    const fresh = createFreshState(periodKey);
    writeStoredState(storage, fresh);
    return fresh;
  }

  const allowance = normalizeCount(stored.allowance, DEFAULT_WEEKLY_SCAN_CREDITS);
  const remaining = clampCount(normalizeCount(stored.remaining, allowance), 0, allowance);
  const used = clampCount(normalizeCount(stored.used, allowance - remaining), 0, allowance);

  return {
    periodKey,
    allowance,
    remaining,
    used,
  };
}

export function consumeScanCredits(
  storage: CreditStorage | undefined,
  scanType: ScanRequestType,
  now = new Date()
): ScanCreditAttempt {
  const cost = getScanCreditCost(scanType);
  const state = getScanCreditState(storage, now);

  if (state.remaining < cost) {
    return {
      ...state,
      ok: false,
      cost,
      message:
        "Your free weekly style checks are used for this week. They refresh next Monday. More usage options will come later.",
    };
  }

  const next = {
    ...state,
    remaining: state.remaining - cost,
    used: state.used + cost,
  };

  if (storage) writeStoredState(storage, next);
  return {
    ...next,
    ok: true,
    cost,
  };
}

export function refundScanCredits(
  storage: CreditStorage | undefined,
  scanType: ScanRequestType,
  now = new Date()
): ScanCreditState {
  const cost = getScanCreditCost(scanType);
  const state = getScanCreditState(storage, now);
  const next = {
    ...state,
    remaining: clampCount(state.remaining + cost, 0, state.allowance),
    used: clampCount(state.used - cost, 0, state.allowance),
  };

  if (storage) writeStoredState(storage, next);
  return next;
}

export function getBrowserScanCreditState(now = new Date()): ScanCreditState {
  return getScanCreditState(getBrowserStorage(), now);
}

export function consumeBrowserScanCredits(
  scanType: ScanRequestType,
  now = new Date()
): ScanCreditAttempt {
  return consumeScanCredits(getBrowserStorage(), scanType, now);
}

export function refundBrowserScanCredits(
  scanType: ScanRequestType,
  now = new Date()
): ScanCreditState {
  return refundScanCredits(getBrowserStorage(), scanType, now);
}

function getWeeklyCreditPeriodKey(date: Date): string {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (utc.getUTCDay() + 6) % 7;
  utc.setUTCDate(utc.getUTCDate() - daysSinceMonday);
  return utc.toISOString().slice(0, 10);
}

function createFreshState(periodKey: string): ScanCreditState {
  return {
    periodKey,
    allowance: DEFAULT_WEEKLY_SCAN_CREDITS,
    remaining: DEFAULT_WEEKLY_SCAN_CREDITS,
    used: 0,
  };
}

function readStoredState(storage: CreditStorage): StoredScanCreditState | null {
  const raw = storage.getItem(SCAN_CREDIT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredScanCreditState;
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    storage.removeItem(SCAN_CREDIT_STORAGE_KEY);
    return null;
  }
}

function writeStoredState(storage: CreditStorage, state: ScanCreditState): void {
  storage.setItem(SCAN_CREDIT_STORAGE_KEY, JSON.stringify(state));
}

function normalizeCount(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? Math.round(value ?? fallback) : fallback;
}

function clampCount(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getBrowserStorage(): CreditStorage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}
