import assert from "node:assert/strict";
import test from "node:test";
import * as authFlow from "./auth-flow.ts";
import {
  AUTH_DEFAULT_NEXT,
  buildAuthCallbackUrl,
  friendlyAuthError,
  friendlyProfileLinkError,
  getSignUpCompletionMode,
  isSupabaseAuthConfigured,
  normalizeAuthNext,
} from "./auth-flow.ts";

test("normalizes safe internal auth destinations", () => {
  assert.equal(normalizeAuthNext("/profile"), "/profile");
  assert.equal(normalizeAuthNext("/profile?paid=report"), "/profile?paid=report");
  assert.equal(normalizeAuthNext(" /saved "), "/saved");
});

test("rejects unsafe auth destinations", () => {
  assert.equal(normalizeAuthNext(null), AUTH_DEFAULT_NEXT);
  assert.equal(normalizeAuthNext(""), AUTH_DEFAULT_NEXT);
  assert.equal(normalizeAuthNext("https://evil.example/profile"), AUTH_DEFAULT_NEXT);
  assert.equal(normalizeAuthNext("//evil.example/profile"), AUTH_DEFAULT_NEXT);
  assert.equal(normalizeAuthNext("/\\evil"), AUTH_DEFAULT_NEXT);
});

test("builds canonical auth callback urls with normalized next path", () => {
  const safe = buildAuthCallbackUrl("https://paletteme.example", "/profile?paid=pro");
  const safeUrl = new URL(safe);
  assert.equal(safeUrl.origin, "https://paletteme.example");
  assert.equal(safeUrl.pathname, "/api/auth/callback");
  assert.equal(safeUrl.searchParams.get("next"), "/profile?paid=pro");

  const unsafe = buildAuthCallbackUrl("https://paletteme.example/", "https://evil.example");
  assert.equal(new URL(unsafe).searchParams.get("next"), AUTH_DEFAULT_NEXT);
});

test("maps Supabase auth failures to actionable messages", () => {
  assert.equal(
    friendlyAuthError('Email address "tester@example.com" is invalid'),
    "Use a real email address. Some test domains are blocked by Supabase."
  );
  assert.equal(
    friendlyAuthError("email rate limit exceeded"),
    "Email signups are temporarily rate limited. Try again in a little while, or sign in if you already have an account."
  );
  assert.equal(
    friendlyAuthError("Invalid login credentials"),
    "Wrong email or password. Try again."
  );
  assert.equal(
    friendlyAuthError("TypeError: Failed to fetch"),
    "Sign-in is unavailable right now. Keep using PaletteMe without an account, or try again in a little while."
  );
  assert.equal(
    friendlyAuthError("Unsupported provider: provider is not enabled"),
    "Google sign-in is not configured yet. Use email sign-in for now."
  );
  assert.equal(
    friendlyAuthError("redirect_to is not allowed"),
    "Sign-in needs a Supabase redirect URL update. Use email sign-in for now."
  );
});

test("detects whether sign-up returned an active session", () => {
  assert.equal(getSignUpCompletionMode({ session: { access_token: "token" } }), "signed-in");
  assert.equal(getSignUpCompletionMode({ session: null }), "check-email");
  assert.equal(getSignUpCompletionMode({}), "check-email");
});

test("detects whether Supabase public auth config is available", () => {
  assert.equal(
    isSupabaseAuthConfigured({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    }),
    true
  );
  assert.equal(
    isSupabaseAuthConfigured({
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    }),
    false
  );
  assert.equal(
    isSupabaseAuthConfigured({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
    }),
    false
  );
});

test("maps profile-link failures to setup-aware messages", () => {
  assert.equal(
    friendlyProfileLinkError("profile_link_failed"),
    "You are signed in, but PaletteMe could not save or restore your profile yet. Your result is still available on this device."
  );
  assert.equal(
    friendlyProfileLinkError("not_authenticated"),
    "Sign-in did not finish. Please try again."
  );
  assert.equal(
    friendlyProfileLinkError("Not configured"),
    "Sign-in is unavailable right now. Keep using PaletteMe without an account, or try again in a little while."
  );
});

test("resolves post-quiz auth gate from the current session user", () => {
  assert.equal(
    authFlow.resolvePostQuizAuthAction?.({ id: "auth-user-1" }),
    "continue-to-profile"
  );
  assert.equal(authFlow.resolvePostQuizAuthAction?.(null), "show-auth-prompt");
  assert.equal(authFlow.resolvePostQuizAuthAction?.({ id: "" }), "show-auth-prompt");
});

test("requires an authenticated session before color results when auth is configured", () => {
  assert.equal(authFlow.canAccessColorResults({ id: "auth-user-1" }, true), true);
  assert.equal(authFlow.canAccessColorResults(null, true), false);
  assert.equal(authFlow.canAccessColorResults({ id: "auth-user-1" }, false), false);
});
