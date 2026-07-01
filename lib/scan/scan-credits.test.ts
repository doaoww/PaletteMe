import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_WEEKLY_SCAN_CREDITS,
  consumeScanCredits,
  getScanCreditCost,
  getScanCreditState,
  refundScanCredits,
} from "./scan-credits.ts";

class MemoryStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

test("assigns higher cost to full outfit scans", () => {
  assert.equal(getScanCreditCost("clothing_item"), 1);
  assert.equal(getScanCreditCost("makeup"), 1);
  assert.equal(getScanCreditCost("product_screenshot"), 1);
  assert.equal(getScanCreditCost("outfit"), 2);
});

test("starts each new weekly period with the default allowance", () => {
  const storage = new MemoryStorage();
  const firstWeek = new Date("2026-06-15T10:00:00.000Z");
  const nextWeek = new Date("2026-06-22T10:00:00.000Z");

  assert.equal(getScanCreditState(storage, firstWeek).remaining, DEFAULT_WEEKLY_SCAN_CREDITS);
  assert.equal(consumeScanCredits(storage, "outfit", firstWeek).remaining, 1);
  assert.equal(getScanCreditState(storage, firstWeek).remaining, 1);
  assert.equal(getScanCreditState(storage, nextWeek).remaining, DEFAULT_WEEKLY_SCAN_CREDITS);
});

test("blocks scans when the weekly bucket cannot cover the scan cost", () => {
  const storage = new MemoryStorage();
  const now = new Date("2026-06-15T10:00:00.000Z");

  consumeScanCredits(storage, "outfit", now);
  consumeScanCredits(storage, "outfit", now);
  const finalAttempt = consumeScanCredits(storage, "outfit", now);

  assert.equal(finalAttempt.ok, false);
  assert.equal(finalAttempt.remaining, 1);
  assert.match(finalAttempt.message ?? "", /weekly style checks/i);
});

test("refunds consumed credits without exceeding the weekly allowance", () => {
  const storage = new MemoryStorage();
  const now = new Date("2026-06-15T10:00:00.000Z");

  assert.equal(consumeScanCredits(storage, "outfit", now).remaining, 1);
  assert.equal(refundScanCredits(storage, "outfit", now).remaining, 3);
  assert.equal(refundScanCredits(storage, "outfit", now).remaining, 3);
});
