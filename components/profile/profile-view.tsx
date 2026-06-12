"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SEASONS } from "@/lib/landing-data";
import { BODY_TYPE_TIPS } from "@/lib/quiz-data";
import { LS_USER_ID } from "@/lib/quiz";
import type { QuizProfile } from "@/lib/quiz";
import { createClient } from "@/lib/supabase";

// ─── Save banner — shown at the bottom of results ─────────────────────────────

type BannerMode = "checking" | "signed-in" | "choice" | "email" | "loading" | "check-email";

function SaveBanner() {
  const [mode, setMode] = useState<BannerMode>("checking");
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setMode("choice");
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setMode(user ? "signed-in" : "choice");
    });
  }, []);

  async function callLinkApi() {
    const userId = localStorage.getItem(LS_USER_ID);
    await fetch("/api/auth/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonymous_id: userId }),
    }).catch(() => {});
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/profile`,
      },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setMode("loading");
    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setErrorMsg(friendly(error.message)); setMode("email"); return; }
      await callLinkApi();
      setMode("check-email");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErrorMsg(friendly(error.message)); setMode("email"); return; }
    await callLinkApi();
    setMode("signed-in");
  }

  if (mode === "checking") return null;

  if (mode === "signed-in") {
    return (
      <section style={bannerCard}>
        <p className="kicker" style={{ fontSize: "0.56rem", marginBottom: 8 }}>your profile is saved</p>
        <p className="font-serif" style={{ fontSize: "clamp(1.3rem,2.5vw,1.7rem)", lineHeight: 1.2, marginBottom: 6 }}>
          You&apos;re all set.
        </p>
        <p style={bannerSub}>
          Your color season and style are saved. Sign in on any device to skip the quiz.
        </p>
        <Link href="/dashboard" className="btn" style={{ display: "inline-block", marginTop: 16 }}>
          explore my picks
        </Link>
      </section>
    );
  }

  if (mode === "check-email") {
    return (
      <section style={bannerCard}>
        <p style={{ fontSize: "1.5rem", margin: 0 }}>✉️</p>
        <p className="font-serif" style={{ fontSize: "clamp(1.3rem,2.5vw,1.7rem)", lineHeight: 1.2 }}>
          Check your email
        </p>
        <p style={bannerSub}>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
      </section>
    );
  }

  if (mode === "loading") {
    return (
      <section style={bannerCard}>
        <p style={bannerSub}>saving your profile…</p>
      </section>
    );
  }

  if (mode === "email") {
    return (
      <section style={bannerCard}>
        <p className="kicker" style={{ fontSize: "0.56rem", marginBottom: 8 }}>save your profile</p>
        <p className="font-serif" style={{ fontSize: "clamp(1.3rem,2.5vw,1.7rem)", lineHeight: 1.2, marginBottom: 16 }}>
          {isSignUp ? "create your account" : "welcome back"}
        </p>
        <button style={backBtn} onClick={() => setMode("choice")}>← back</button>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360 }}>
          <input style={inputSt} type="email" placeholder="email address" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          <input style={inputSt} type="password" placeholder={isSignUp ? "choose a password (6+ chars)" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          {errorMsg && <p style={{ fontSize: "0.82rem", color: "#e53e3e", margin: 0 }}>{errorMsg}</p>}
          <button type="submit" className="btn">{isSignUp ? "create account" : "sign in"}</button>
        </form>
        <button style={switchSt} onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }}>
          {isSignUp ? "already have an account? sign in" : "no account? sign up"}
        </button>
      </section>
    );
  }

  // choice
  return (
    <section style={bannerCard}>
      <p className="kicker" style={{ fontSize: "0.56rem", marginBottom: 8 }}>save your profile</p>
      <p className="font-serif" style={{ fontSize: "clamp(1.4rem,3vw,1.9rem)", lineHeight: 1.15, marginBottom: 8 }}>
        Never retake the quiz.
      </p>
      <p style={{ ...bannerSub, marginBottom: 20 }}>
        Create a free account to save your color season, body type, and style. Sign in from any device and pick up right where you left off.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360 }}>
        <button style={googleBtn} onClick={handleGoogle}>
          <GoogleIcon />
          continue with google
        </button>
        <button style={emailBtn} onClick={() => { setIsSignUp(true); setMode("email"); }}>
          sign up with email
        </button>
        <button style={signInBtn} onClick={() => { setIsSignUp(false); setMode("email"); }}>
          already have an account
        </button>
      </div>
    </section>
  );
}

function friendly(msg: string) {
  if (msg.includes("Invalid login")) return "Wrong email or password.";
  if (msg.includes("already registered")) return "That email is taken. Try signing in.";
  if (msg.includes("Password should")) return "Password must be at least 6 characters.";
  return "Something went wrong. Please try again.";
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

const bannerCard: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid var(--hair)",
  background: "color-mix(in srgb, var(--blush) 30%, transparent)",
  padding: "clamp(24px,4vw,40px)",
  marginBottom: "clamp(48px,8vh,80px)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const bannerSub: React.CSSProperties = {
  fontFamily: "var(--sans)",
  fontSize: "0.88rem",
  color: "var(--ink-soft)",
  lineHeight: 1.6,
  margin: 0,
  maxWidth: "46ch",
};

const googleBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  justifyContent: "center",
  padding: "12px 20px",
  borderRadius: 10,
  border: "1.5px solid var(--line)",
  background: "#fff",
  color: "var(--ink)",
  fontSize: "0.9rem",
  fontFamily: "var(--sans)",
  cursor: "pointer",
};

const emailBtn: React.CSSProperties = {
  padding: "12px 20px",
  borderRadius: 10,
  border: "none",
  background: "var(--accent)",
  color: "#fff",
  fontSize: "0.9rem",
  fontFamily: "var(--sans)",
  cursor: "pointer",
};

const signInBtn: React.CSSProperties = {
  ...emailBtn,
  background: "transparent",
  border: "1.5px solid var(--ink)",
  color: "var(--ink)",
};

const inputSt: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 10,
  border: "1.5px solid var(--line)",
  background: "#fff",
  fontSize: "0.9rem",
  fontFamily: "var(--sans)",
  color: "var(--ink)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const backBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--ink-soft)",
  fontSize: "0.82rem",
  cursor: "pointer",
  fontFamily: "var(--sans)",
  padding: 0,
  alignSelf: "flex-start",
};

const switchSt: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--ink-soft)",
  fontSize: "0.82rem",
  cursor: "pointer",
  fontFamily: "var(--sans)",
  textDecoration: "underline",
  padding: "4px 0",
};

export function ProfileView({ profile }: { profile: QuizProfile }) {
  const season = SEASONS.find((s) => s.id === profile.seasonId) ?? SEASONS[0];
  const bodyTips = profile.bodyType ? BODY_TYPE_TIPS[profile.bodyType] : null;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100svh" }}>

      {/* ── Top bar ── */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px var(--pad)",
        borderBottom: "1px solid var(--hair)",
      }}>
        <Link href="/" className="wordmark" style={{ color: "var(--ink)", fontSize: "1.2rem" }}>
          palette<span style={{ color: "var(--pink)" }}>me</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/login"
            style={{ fontFamily: "var(--sans)", fontSize: "0.82rem", color: "var(--ink-soft)", textDecoration: "none" }}
          >
            sign in
          </Link>
          <Link
            href="/quiz"
            style={{ fontFamily: "var(--sans)", fontSize: "0.82rem", color: "var(--ink-soft)", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            retake quiz
          </Link>
        </div>
      </header>

      <div className="wrap" style={{ paddingTop: "clamp(40px,7vh,72px)", paddingBottom: "clamp(48px,8vh,96px)" }}>

        {/* ── Season hero ── */}
        <section style={{ marginBottom: "clamp(48px,8vh,80px)" }}>
          <div className="eyebrow">
            <span className="kicker" style={{ fontSize: "0.58rem" }}>your color season</span>
          </div>
          <h1
            className="font-serif"
            style={{ fontSize: "clamp(3rem,8vw,5.5rem)", lineHeight: 0.92, marginTop: 14 }}
          >
            <span className="scr" style={{ color: "var(--pink)" }}>{season.name}</span>
          </h1>
          {profile.subSeason && (
            <p style={{ fontFamily: "var(--sans)", fontSize: "1.05rem", fontWeight: 600, color: "var(--ink-soft)", marginTop: 8 }}>
              {profile.subSeason}
            </p>
          )}
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-soft)", marginTop: 6, opacity: 0.7 }}>
            {profile.undertoneHint} undertone
          </p>

          {/* Palette */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
            {season.palette.map((color) => (
              <span
                key={color}
                title={color}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: color,
                  border: "1px solid var(--hair)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  display: "block",
                }}
              />
            ))}
          </div>

          <p style={{ fontFamily: "var(--sans)", fontSize: "0.96rem", lineHeight: 1.65, color: "var(--ink-soft)", marginTop: 20, maxWidth: "52ch" }}>
            {season.why}
          </p>
        </section>

        {/* ── 2-col: body type + style ── */}
        <style>{`
          @media (min-width: 700px) { .profile-cols { grid-template-columns: 1fr 1fr !important; } }
        `}</style>
        <section
          className="profile-cols"
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "clamp(24px,4vw,48px)", marginBottom: "clamp(48px,8vh,80px)" }}
        >
          {/* Body type */}
          {bodyTips && (
            <div style={{ borderRadius: 16, border: "1px solid var(--hair)", padding: "clamp(20px,3vw,32px)" }}>
              <p className="kicker" style={{ fontSize: "0.56rem", marginBottom: 12 }}>your body type</p>
              <p className="font-serif" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", lineHeight: 1.1 }}>
                {bodyTips.label}
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.82rem", color: "var(--ink-soft)", marginTop: 6, marginBottom: 16 }}>
                {bodyTips.desc}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {bodyTips.tips.map((tip) => (
                  <li key={tip} style={{ display: "flex", gap: 10, fontFamily: "var(--sans)", fontSize: "0.88rem", color: "var(--ink-soft)", lineHeight: 1.45 }}>
                    <span style={{ color: "var(--pink)", flexShrink: 0 }}>·</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Style vector */}
          {profile.styleVector && (
            <div style={{ borderRadius: 16, border: "1px solid var(--hair)", padding: "clamp(20px,3vw,32px)" }}>
              <p className="kicker" style={{ fontSize: "0.56rem", marginBottom: 12 }}>your style</p>
              <p className="font-serif" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", lineHeight: 1.1, marginBottom: 16 }}>
                {profile.styleVector.aesthetics.slice(0, 2).join(" + ") || "Eclectic"}
              </p>
              {profile.styleVector.aesthetics.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {profile.styleVector.aesthetics.map((a) => (
                    <span key={a} style={{ fontFamily: "var(--sans)", fontSize: "0.76rem", fontWeight: 700, border: "1px solid var(--hair)", borderRadius: 100, padding: "5px 12px", textTransform: "lowercase" }}>
                      {a}
                    </span>
                  ))}
                </div>
              )}
              {profile.styleVector.occasions.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {profile.styleVector.occasions.map((o) => (
                    <span key={o} style={{ fontFamily: "var(--sans)", fontSize: "0.72rem", color: "var(--ink-soft)", border: "1px solid var(--hair)", borderRadius: 100, padding: "4px 10px", textTransform: "lowercase" }}>
                      {o}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Save / auth CTA ── */}
        <SaveBanner />


      </div>
    </div>
  );
}
