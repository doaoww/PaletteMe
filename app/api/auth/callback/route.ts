import { createClient } from "@/lib/supabase-server";
import { isSupabaseAuthConfigured, normalizeAuthNext } from "@/lib/auth-flow";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SUPABASE_AUTH_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = normalizeAuthNext(searchParams.get("next"));
  const authConfigured = isSupabaseAuthConfigured(SUPABASE_AUTH_ENV);

  if (code && authConfigured) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, origin));
      }
    } catch {
      // Fall through to the same safe login redirect used for Supabase auth errors.
    }
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", authConfigured ? "auth_failed" : "auth_unavailable");
  loginUrl.searchParams.set("next", next);
  return NextResponse.redirect(loginUrl);
}
