export const AUTH_DEFAULT_NEXT = "/profile";
export const AUTH_UNAVAILABLE_MESSAGE =
  "Sign-in is unavailable right now. Keep using PaletteMe without an account, or try again in a little while.";

const INTERNAL_ORIGIN = "https://paletteme.local";

export type SupabaseAuthPublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

export function isSupabaseAuthConfigured(env: SupabaseAuthPublicEnv): boolean {
  return !!(
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

export function normalizeAuthNext(value: string | null | undefined): string {
  const candidate = typeof value === "string" ? value.trim() : "";

  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(candidate)
  ) {
    return AUTH_DEFAULT_NEXT;
  }

  try {
    const url = new URL(candidate, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN) return AUTH_DEFAULT_NEXT;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return AUTH_DEFAULT_NEXT;
  }
}

export function buildAuthCallbackUrl(origin: string, next: string | null | undefined): string {
  const callbackUrl = new URL("/api/auth/callback", origin);
  callbackUrl.searchParams.set("next", normalizeAuthNext(next));
  return callbackUrl.toString();
}

export type SignUpCompletionMode = "signed-in" | "check-email";

export type PostQuizAuthAction = "continue-to-profile" | "show-auth-prompt";

export function resolvePostQuizAuthAction(
  user: { id?: string | null } | null | undefined
): PostQuizAuthAction {
  return user?.id ? "continue-to-profile" : "show-auth-prompt";
}

export function canAccessColorResults(
  user: { id?: string | null } | null | undefined,
  authConfigured: boolean
): boolean {
  if (!authConfigured) return false;
  return Boolean(user?.id);
}

export function getSignUpCompletionMode(
  data: { session?: unknown | null } | null | undefined
): SignUpCompletionMode {
  return data?.session ? "signed-in" : "check-email";
}

export function friendlyAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login")) {
    return "Wrong email or password. Try again.";
  }
  if (normalized.includes("already registered") || normalized.includes("user already")) {
    return "That email is already registered. Sign in instead.";
  }
  if (normalized.includes("password should") || normalized.includes("password must")) {
    return "Password must be at least 6 characters.";
  }
  if (normalized.includes("rate limit")) {
    return "Email signups are temporarily rate limited. Try again in a little while, or sign in if you already have an account.";
  }
  if (
    normalized.includes("invalid email") ||
    (normalized.includes("email address") && normalized.includes("invalid"))
  ) {
    return "Use a real email address. Some test domains are blocked by Supabase.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  if (
    normalized.includes("network") ||
    normalized.includes("fetch failed") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("network access denied")
  ) {
    return AUTH_UNAVAILABLE_MESSAGE;
  }
  if (normalized.includes("provider") && normalized.includes("not enabled")) {
    return "Google sign-in is not configured yet. Use email sign-in for now.";
  }
  if (
    normalized.includes("redirect_to") ||
    normalized.includes("redirect url") ||
    normalized.includes("redirect_uri") ||
    normalized.includes("not allowed")
  ) {
    return "Sign-in needs a Supabase redirect URL update. Use email sign-in for now.";
  }

  return "Something went wrong. Please try again.";
}

export function friendlyProfileLinkError(error: string | null | undefined): string {
  if (error === "Not configured") {
    return AUTH_UNAVAILABLE_MESSAGE;
  }
  if (error === "profile_link_failed") {
    return "You are signed in, but PaletteMe could not save or restore your profile yet. Your result is still available on this device.";
  }
  if (error === "not_authenticated" || error === "Not authenticated") {
    return "Sign-in did not finish. Please try again.";
  }
  return "You are signed in, but PaletteMe could not restore your profile. Try again from the quiz.";
}
