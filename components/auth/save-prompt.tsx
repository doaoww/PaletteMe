"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  AUTH_UNAVAILABLE_MESSAGE,
  buildAuthCallbackUrl,
  friendlyAuthError,
  friendlyProfileLinkError,
  getSignUpCompletionMode,
  isSupabaseAuthConfigured,
} from "@/lib/auth-flow";
import { LS_USER_ID } from "@/lib/quiz";

type Props = {
  onSkip: () => void;
};

type Mode = "choice" | "email" | "loading" | "check-email";

const SUPABASE_AUTH_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export function SavePrompt({ onSkip }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choice");
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const authConfigured = isSupabaseAuthConfigured(SUPABASE_AUTH_ENV);

  async function callLinkApi(): Promise<boolean> {
    const userId = localStorage.getItem(LS_USER_ID);
    const res = await fetch("/api/auth/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonymous_id: userId }),
    }).catch(() => null);

    if (!res) {
      setErrorMsg(friendlyProfileLinkError(null));
      return false;
    }

    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setErrorMsg(friendlyProfileLinkError(json.error));
      return false;
    }

    return true;
  }

  async function handleGoogle() {
    setErrorMsg("");
    if (!authConfigured) {
      setErrorMsg(AUTH_UNAVAILABLE_MESSAGE);
      setMode("choice");
      return;
    }

    const supabase = createClient();
    // Linking happens in /profile on mount (page navigates away here)
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
        // Email confirmation required — show check-email screen
        setMode("check-email");
        return;
      }
      const linked = await callLinkApi();
      if (!linked) {
        setMode("email");
        return;
      }
      router.push("/profile");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setErrorMsg(friendlyAuthError(error.message));
      setMode("email");
      return;
    }

    const linked = await callLinkApi();
    if (!linked) {
      setMode("email");
      return;
    }
    router.push("/profile");
  }

  if (mode === "check-email") {
    return (
      <div style={overlay}>
        <div style={card}>
          <p style={icon}>✉️</p>
          <h2 style={heading}>Check your email</h2>
          <p style={sub}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to
            activate your account, then come back here.
          </p>
          <button style={btnPrimary} onClick={() => router.push("/profile")}>
            continue for now
          </button>
        </div>
      </div>
    );
  }

  if (mode === "loading") {
    return (
      <div style={overlay}>
        <div style={card}>
          <p style={icon}>✨</p>
          <p style={sub}>saving your results…</p>
        </div>
      </div>
    );
  }

  if (mode === "email") {
    return (
      <div style={overlay}>
        <div style={card}>
          <button style={backBtn} onClick={() => setMode("choice")}>
            ← back
          </button>
          <h2 style={heading}>{isSignUp ? "create account" : "welcome back"}</h2>
          <form onSubmit={handleEmailSubmit} style={form}>
            <input
              style={input}
              type="email"
              placeholder="your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <input
              style={input}
              type="password"
              placeholder={isSignUp ? "choose a password" : "password"}
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
              : "don't have an account? sign up"}
          </button>
        </div>
      </div>
    );
  }

  // Default: choice screen
  return (
    <div style={overlay}>
      <div style={card}>
        <p style={icon}>🎨</p>
        <h2 style={heading}>save your palette?</h2>
        <p style={sub}>
          Create a free account so you never have to retake the quiz. Your
          season, colors, and style are waiting for you on every device.
        </p>

        <button style={btnGoogle} onClick={handleGoogle}>
          <GoogleIcon />
          continue with google
        </button>

        <button style={btnSecondary} onClick={() => setMode("email")}>
          continue with email
        </button>

        <button style={skipBtn} onClick={onSkip}>
          skip for now
        </button>
        {errorMsg && <p style={errorStyle}>{errorMsg}</p>}
      </div>
    </div>
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

// ─── Inline styles (no new CSS files) ────────────────────────────────────────

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(23,18,26,0.55)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "20px",
};

const card: React.CSSProperties = {
  background: "var(--cream)",
  borderRadius: "24px",
  padding: "40px 32px",
  maxWidth: "400px",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  textAlign: "center",
  boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
};

const icon: React.CSSProperties = {
  fontSize: "2.5rem",
  margin: 0,
};

const heading: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.75rem",
  fontWeight: 400,
  color: "var(--ink)",
  margin: 0,
};

const sub: React.CSSProperties = {
  fontSize: "0.95rem",
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
  borderRadius: "12px",
  border: "1.5px solid var(--line)",
  background: "#fff",
  color: "var(--ink)",
  fontSize: "0.95rem",
  fontFamily: "var(--sans)",
  cursor: "pointer",
  marginTop: "8px",
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: "13px 20px",
  borderRadius: "12px",
  border: "none",
  background: "var(--accent)",
  color: "#fff",
  fontSize: "0.95rem",
  fontFamily: "var(--sans)",
  cursor: "pointer",
  marginTop: "4px",
};

const btnSecondary: React.CSSProperties = {
  ...btnPrimary,
  background: "var(--ink)",
};

const skipBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--ink-soft)",
  fontSize: "0.875rem",
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

const form: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "100%",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1.5px solid var(--line)",
  background: "#fff",
  fontSize: "0.95rem",
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
};

const switchBtn: React.CSSProperties = {
  ...skipBtn,
  marginTop: "4px",
};
