"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/db/supabase";
import {
  AUTH_UNAVAILABLE_MESSAGE,
  buildAuthCallbackUrl,
  friendlyAuthError,
  friendlyProfileLinkError,
  getSignUpCompletionMode,
  isSupabaseAuthConfigured,
  normalizeAuthNext,
} from "@/lib/auth/auth-flow";
import { LS_USER_ID, LS_COLORTYPE, LS_BEST_COLORS, LS_QUIZ } from "@/lib/quiz/quiz";
import { syncLocalWardrobeAfterAuth } from "@/lib/wardrobe/wardrobe-store";
import Link from "next/link";

type Mode = "choice" | "email" | "loading" | "check-email";

const SUPABASE_AUTH_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = normalizeAuthNext(searchParams.get("next"));
  const errorParam = searchParams.get("error");
  const hasError = errorParam === "auth_failed";
  const hasUnavailableError = errorParam === "auth_unavailable";
  const authConfigured = isSupabaseAuthConfigured(SUPABASE_AUTH_ENV);

  const [mode, setMode] = useState<Mode>("choice");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(
    hasUnavailableError
      ? AUTH_UNAVAILABLE_MESSAGE
      : hasError
        ? "Sign in failed. Please try again."
        : ""
  );

  async function restoreFromSupabase(): Promise<boolean> {
    // Called after login — tries to restore data for returning users
    try {
      const res = await fetch("/api/auth/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymous_id: localStorage.getItem(LS_USER_ID) ?? null,
        }),
      });
      const json = (await res.json()) as {
        mode?: string;
        user_id?: string;
        colortype?: string;
        best_colors?: string[];
        quiz_answers?: Record<string, string>;
        error?: string;
      };

      if (!res.ok) {
        setErrorMsg(friendlyProfileLinkError(json.error));
        setMode("email");
        return false;
      }

      if (json.mode === "restored" && json.user_id) {
        // Returning user — restore data and go home
        localStorage.setItem(LS_USER_ID, json.user_id);
        if (json.colortype) localStorage.setItem(LS_COLORTYPE, json.colortype);
        if (json.best_colors?.length)
          localStorage.setItem(LS_BEST_COLORS, JSON.stringify(json.best_colors));
        if (json.quiz_answers)
          localStorage.setItem(LS_QUIZ, JSON.stringify(json.quiz_answers));
        router.push("/home");
      } else {
        // New user — send to quiz
        router.push("/quiz");
      }
      return true;
    } catch {
      setErrorMsg(friendlyProfileLinkError(null));
      setMode("email");
      return false;
    }
  }

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
        redirectTo: buildAuthCallbackUrl(window.location.origin, next),
      },
    });
    if (error) {
      setErrorMsg(friendlyAuthError(error.message));
      setMode("choice");
    }
    // Page navigates away — restoreFromSupabase runs in the target page
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
          emailRedirectTo: buildAuthCallbackUrl(window.location.origin, next),
        },
      });
      if (error) {
        setErrorMsg(friendlyAuthError(error.message));
        setMode("email");
        return;
      }
      if (getSignUpCompletionMode(data) === "signed-in") {
        void syncLocalWardrobeAfterAuth(data.user?.id).catch(() => {});
        await restoreFromSupabase();
        return;
      }
      setMode("check-email");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(friendlyAuthError(error.message));
      setMode("email");
      return;
    }

    void syncLocalWardrobeAfterAuth(data.user?.id).catch(() => {});
    await restoreFromSupabase();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "var(--sans)",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Wordmark */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.75rem",
              color: "var(--ink)",
              letterSpacing: 0,
            }}
          >
            PaletteMe
          </span>
        </Link>

        {mode === "check-email" && (
          <div style={card}>
            <p style={iconStyle}>✉️</p>
            <h1 style={heading}>check your email</h1>
            <p style={sub}>
              We sent a link to <strong>{email}</strong>. Click it to save your
              palette across devices.
            </p>
            <button style={btnPrimary} onClick={() => router.push(next)}>
              view results on this device
            </button>
          </div>
        )}

        {mode === "loading" && (
          <div style={card}>
            <p style={iconStyle}>✨</p>
            <p style={sub}>signing you in…</p>
          </div>
        )}

        {mode === "choice" && (
          <div style={card}>
            <h1 style={heading}>welcome back</h1>
            <p style={sub}>
              Sign in to see your color palette and picks without retaking the
              quiz.
            </p>

            <button style={btnGoogle} onClick={handleGoogle}>
              <GoogleIcon />
              continue with google
            </button>

            <div style={divider}>
              <span style={dividerLine} />
              <span style={dividerText}>or</span>
              <span style={dividerLine} />
            </div>

            <button
              style={btnSecondary}
              onClick={() => {
                setIsSignUp(false);
                setMode("email");
              }}
            >
              sign in with email
            </button>

            <button
              style={btnOutline}
              onClick={() => {
                setIsSignUp(true);
                setMode("email");
              }}
            >
              create account
            </button>

            {errorMsg && <p style={errorStyle}>{errorMsg}</p>}
          </div>
        )}

        {mode === "email" && (
          <div style={card}>
            <button style={backBtn} onClick={() => setMode("choice")}>
              ← back
            </button>
            <h1 style={heading}>{isSignUp ? "create account" : "sign in"}</h1>
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
                placeholder={isSignUp ? "choose a password (6+ chars)" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {errorMsg && <p style={errorStyle}>{errorMsg}</p>}
              <button style={btnPrimary} type="submit">
                {isSignUp ? "create account" : "sign in"}
              </button>
            </form>
            <button
              style={switchBtn}
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg("");
              }}
            >
              {isSignUp
                ? "already have an account? sign in"
                : "no account? create one"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: "20px",
  padding: "36px 28px",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "14px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
  textAlign: "center",
};

const iconStyle: React.CSSProperties = { fontSize: "2rem", margin: 0 };

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
  borderRadius: "10px",
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
  borderRadius: "10px",
  border: "none",
  background: "var(--accent)",
  color: "#fff",
  fontSize: "0.9rem",
  fontFamily: "var(--sans)",
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  ...btnPrimary,
  background: "var(--ink)",
};

const btnOutline: React.CSSProperties = {
  ...btnPrimary,
  background: "transparent",
  border: "1.5px solid var(--ink)",
  color: "var(--ink)",
};

const divider: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  width: "100%",
};

const dividerLine: React.CSSProperties = {
  flex: 1,
  height: "1px",
  background: "var(--line)",
};

const dividerText: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--ink-soft)",
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

const errorStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#e53e3e",
  margin: 0,
  textAlign: "left",
  width: "100%",
};


const backBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--ink-soft)",
  fontSize: "0.85rem",
  cursor: "pointer",
  fontFamily: "var(--sans)",
  padding: "0",
  alignSelf: "flex-start",
};

const switchBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--ink-soft)",
  fontSize: "0.85rem",
  cursor: "pointer",
  fontFamily: "var(--sans)",
  textDecoration: "underline",
  padding: "4px",
};
