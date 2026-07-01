import assert from "node:assert/strict";
import test from "node:test";
import {
  PREMIUM_STORAGE_KEY,
  canAccessPremium,
  getPaymentUrls,
  normalizePremiumLevel,
  resolvePremiumLevel,
  type PremiumLevel,
} from "./premium.ts";

function memoryStorage(initial?: PremiumLevel) {
  const data = new Map<string, string>();
  if (initial) data.set(PREMIUM_STORAGE_KEY, initial);
  return {
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    },
  };
}

test("normalizes only supported premium levels", () => {
  assert.equal(normalizePremiumLevel("free"), "free");
  assert.equal(normalizePremiumLevel("report"), "report");
  assert.equal(normalizePremiumLevel("pro"), "pro");
  assert.equal(normalizePremiumLevel("vip"), null);
  assert.equal(normalizePremiumLevel(null), null);
});

test("pro access includes report access", () => {
  assert.equal(canAccessPremium("free", "report"), false);
  assert.equal(canAccessPremium("report", "report"), true);
  assert.equal(canAccessPremium("report", "pro"), false);
  assert.equal(canAccessPremium("pro", "report"), true);
  assert.equal(canAccessPremium("pro", "pro"), true);
});

test("paid query param persists the highest local unlock", () => {
  const storage = memoryStorage();
  const env = { NEXT_PUBLIC_FREE_TESTING_MODE: "false" };

  assert.equal(resolvePremiumLevel(new URLSearchParams("paid=report"), storage, env), "report");
  assert.equal(storage.getItem(PREMIUM_STORAGE_KEY), "report");

  assert.equal(resolvePremiumLevel(new URLSearchParams("paid=pro"), storage, env), "pro");
  assert.equal(storage.getItem(PREMIUM_STORAGE_KEY), "pro");

  assert.equal(resolvePremiumLevel(new URLSearchParams("paid=report"), storage, env), "pro");
  assert.equal(storage.getItem(PREMIUM_STORAGE_KEY), "pro");
});

test("stored level is used when query param is missing or invalid", () => {
  const env = { NEXT_PUBLIC_FREE_TESTING_MODE: "false" };

  assert.equal(resolvePremiumLevel(new URLSearchParams(""), memoryStorage("report"), env), "report");
  assert.equal(resolvePremiumLevel(new URLSearchParams("paid=nope"), memoryStorage("pro"), env), "pro");
  assert.equal(resolvePremiumLevel(new URLSearchParams("paid=nope"), memoryStorage(), env), "free");
});

test("free testing mode grants pro access without storing a fake unlock", () => {
  const storage = memoryStorage();

  assert.equal(resolvePremiumLevel(new URLSearchParams(""), storage, {}), "pro");
  assert.equal(storage.getItem(PREMIUM_STORAGE_KEY), null);
});

test("free testing mode can be disabled to restore local payment unlocks", () => {
  const env = { NEXT_PUBLIC_FREE_TESTING_MODE: "false" };

  assert.equal(resolvePremiumLevel(new URLSearchParams(""), memoryStorage(), env), "free");
  assert.equal(resolvePremiumLevel(new URLSearchParams("paid=report"), memoryStorage(), env), "report");
});

test("payment urls are optional and trimmed", () => {
  assert.deepEqual(
    getPaymentUrls({
      NEXT_PUBLIC_FREE_TESTING_MODE: "false",
      NEXT_PUBLIC_PAID_REPORT_URL: " https://checkout.example/report ",
      NEXT_PUBLIC_SUBSCRIPTION_URL: "",
    }),
    {
      report: "https://checkout.example/report",
      pro: undefined,
    }
  );
});

test("payment urls are suppressed during free testing mode", () => {
  assert.deepEqual(
    getPaymentUrls({
      NEXT_PUBLIC_PAID_REPORT_URL: "https://checkout.example/report",
      NEXT_PUBLIC_SUBSCRIPTION_URL: "https://checkout.example/pro",
    }),
    {
      report: undefined,
      pro: undefined,
    }
  );
});
