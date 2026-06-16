"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  AUTH_UNAVAILABLE_MESSAGE,
  buildAuthCallbackUrl,
  friendlyAuthError,
  friendlyProfileLinkError,
  getSignUpCompletionMode,
  isSupabaseAuthConfigured,
} from "@/lib/auth-flow";
import { saveCompleteQuizResultToSupabase } from "@/lib/post-quiz-supabase";
import type { QuizProfile } from "@/lib/quiz";
import { syncLocalWardrobeAfterAuth } from "@/lib/wardrobe-store";

type Props = {
  profile: QuizProfile;
  onComplete: () => void;
  onSkip?: () => void;
};

type Mode = "choice" | "email" | "loading" | "check-email";

const SUPABASE_AUTH_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export function PostQuizAuthScreen({ profile, onComplete, onSkip }: Props) {
  const [mode, setMode] = useState<Mode>("choice");
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const authConfigured = isSupabaseAuthConfigured(SUPABASE_AUTH_ENV);

  async function handleGoogle() {
    setErrorMsg("");
    if (!authConfigured) {
      setErrorMsg(AUTH_UNAVAILABLE_MESSAGE);
      setMode("choice");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildAuthCallbackUrl(window.location.origin, "/profile"),
      },
    });

    if (error) {
      setErrorMsg(friendlyAuthError(error.message));
      setMode("choice");
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!authConfigured) {
      setErrorMsg(AUTH_UNAVAILABLE_MESSAGE);
      setMode("email");
      return;
    }

    setMode("loading");
    const supabase = createClient();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: buildAuthCallbackUrl(window.location.origin, "/profile"),
        },
      });

      if (error) {
        setErrorMsg(friendlyAuthError(error.message));
        setMode("email");
        return;
      }

      if (getSignUpCompletionMode(data) === "check-email") {
        setMode("check-email");
        return;
      }

      const saved = await saveAuthedQuizResult(supabase, data.user);
      if (!saved) return;
      onComplete();
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(friendlyAuthError(error.message));
      setMode("email");
      return;
    }

    const saved = await saveAuthedQuizResult(supabase, data.user);
    if (!saved) return;
    onComplete();
  }

  async function saveAuthedQuizResult(
    supabase: ReturnType<typeof createClient>,
    user: { id: string; email?: string | null } | null
  ): Promise<boolean> {
    if (!user) {
      setErrorMsg(friendlyProfileLinkError("not_authenticated"));
      setMode("email");
      return false;
    }

    void syncLocalWardrobeAfterAuth(user.id).catch(() => {});

    const result = await saveCompleteQuizResultToSupabase({
      supabase,
      user,
      profile,
    });

    if (!result.ok) {
      setErrorMsg(friendlyProfileLinkError("profile_link_failed"));
      setMode("email");
      return false;
    }

    return true;
  }

  if (mode === "loading") {
    return (
      <main style={screen}>
        <section style={card}>
          <h1 style={heading}>Save your results</h1>
          <p style={sub}>signing you in...</p>
        </section>
      </main>
    );
  }

  if (mode === "check-email") {
    return (
      <main style={screen}>
        <section style={card}>
          <h1 style={heading}>Confirm your email</h1>
          <p style={sub}>
            We sent a confirmation link to <strong>{email}</strong>. Open it to
            save your palette across devices.
          </p>
          {onSkip ? (
            <button type="button" style={btnPrimary} onClick={onSkip}>
              view results on this device
            </button>
          ) : null}
        </section>
      </main>
    );
  }

  if (mode === "email") {
    return (
      <main style={screen}>
        <section style={card}>
          <button type="button" style={backBtn} onClick={() => setMode("choice")}>
            back
          </button>
          <h1 style={heading}>Save your results</h1>
          <p style={sub}>
            {isSignUp ? "Create a free account" : "Sign in"} to see your palette
            and keep it on any device.
          </p>
          <form onSubmit={handleEmailSubmit} style={form}>
            <input
              style={inputStyle}
              type="email"
              placeholder="email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <input
              style={inputStyle}
              type="password"
              placeholder={isSignUp ? "choose a password" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {errorMsg && <p style={errorStyle}>{errorMsg}</p>}
            <button type="submit" style={btnPrimary}>
              {isSignUp ? "create account" : "sign in"}
            </button>
          </form>
          <button
            type="button"
            style={switchBtn}
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
            }}
          >
            {isSignUp ? "already have an account? sign in" : "no account? create one"}
          </button>
          {onSkip ? (
            <button type="button" style={skipBtn} onClick={onSkip}>
              skip for now
            </button>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main style={screen}>
      <section style={card}>
        <p style={kicker}>one last step</p>
        <h1 style={heading}>Save your results</h1>
        <p style={sub}>
          Create a free account to see your palette, quiz answers, and style
          profile — and keep them with you on any device.
        </p>

        <button type="button" style={btnGoogle} onClick={handleGoogle}>
          <GoogleIcon />
          continue with google
        </button>

        <button type="button" style={btnPrimary} onClick={() => setMode("email")}>
          continue with email
        </button>

        {onSkip ? (
          <button type="button" style={skipBtn} onClick={onSkip}>
            skip for now
          </button>
        ) : null}
        {errorMsg && <p style={errorStyle}>{errorMsg}</p>}
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

const screen: React.CSSProperties = {
  minHeight: "100vh",
  background: "#FFF0F5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  fontFamily: "var(--sans)",
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: "20px",
  padding: "36px 28px",
  width: "100%",
  maxWidth: "400px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "14px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
  textAlign: "center",
};

const kicker: React.CSSProperties = {
  fontFamily: "var(--sans)",
  fontSize: "0.62rem",
  fontWeight: 800,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "var(--pink-deep)",
  margin: 0,
};

const heading: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.6rem",
  fontWeight: 400,
  color: "var(--ink)",
  margin: 0,
};

const sub: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "var(--ink-soft)",
  lineHeight: 1.6,
  margin: 0,
};

const btnGoogle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  justifyContent: "center",
  width: "100%",
  padding: "13px 20px",
  borderRadius: "999px",
  border: "1.5px solid var(--line)",
  background: "#fff",
  color: "var(--ink)",
  fontSize: "0.9rem",
  fontFamily: "var(--sans)",
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: "13px 20px",
  borderRadius: "999px",
  border: "none",
  background: "#E8176A",
  color: "#fff",
  fontSize: "0.9rem",
  fontFamily: "var(--sans)",
  cursor: "pointer",
};

const form: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "100%",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1.5px solid var(--line)",
  background: "#fff",
  fontSize: "0.9rem",
  fontFamily: "var(--sans)",
  color: "var(--ink)",
  outline: "none",
  boxSizing: "border-box",
};

const skipBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--ink-soft)",
  fontSize: "0.85rem",
  cursor: "pointer",
  fontFamily: "var(--sans)",
  textDecoration: "underline",
  padding: "4px",
};

const backBtn: React.CSSProperties = {
  ...skipBtn,
  alignSelf: "flex-start",
  textDecoration: "none",
};

const switchBtn: React.CSSProperties = {
  ...skipBtn,
};

const errorStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#e53e3e",
  margin: 0,
  textAlign: "left",
  width: "100%",
};
