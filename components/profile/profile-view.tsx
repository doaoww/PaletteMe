"use client";

import Link from "next/link";
import { useState } from "react";
import { SEASONS } from "@/lib/landing-data";
import { BODY_TYPE_TIPS } from "@/lib/quiz-data";
import type { QuizProfile } from "@/lib/quiz";

function WaitlistInline() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p style={{ fontFamily: "var(--sans)", fontSize: "0.9rem", color: "var(--ink-soft)" }}>
        You&apos;re on the list. We&apos;ll email you when it&apos;s ready.
      </p>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        style={{
          flex: "1 1 220px",
          fontFamily: "var(--sans)",
          fontSize: "0.9rem",
          border: "1px solid var(--hair)",
          borderRadius: 8,
          padding: "12px 16px",
          background: "#fff",
          color: "var(--ink)",
          outline: "none",
        }}
      />
      <button
        type="submit"
        className="btn"
        style={{ flex: "0 0 auto" }}
        disabled={state === "loading"}
      >
        {state === "loading" ? "saving…" : "save my profile"}
      </button>
      {state === "error" && (
        <p style={{ width: "100%", fontFamily: "var(--sans)", fontSize: "0.8rem", color: "var(--pink)" }}>
          Something went wrong — try again.
        </p>
      )}
    </form>
  );
}

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
        <Link
          href="/quiz"
          style={{ fontFamily: "var(--sans)", fontSize: "0.82rem", color: "var(--ink-soft)", textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          retake quiz
        </Link>
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

        {/* ── Waitlist CTA ── */}
        <section style={{
          borderRadius: 16,
          border: "1px solid var(--hair)",
          background: "color-mix(in srgb, var(--blush) 30%, transparent)",
          padding: "clamp(24px,4vw,40px)",
          marginBottom: "clamp(48px,8vh,80px)",
        }}>
          <p className="kicker" style={{ fontSize: "0.56rem", marginBottom: 10 }}>save your profile</p>
          <p className="font-serif" style={{ fontSize: "clamp(1.4rem,3vw,1.9rem)", lineHeight: 1.15, marginBottom: 8 }}>
            Like your results? Keep them.
          </p>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.88rem", color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 20, maxWidth: "46ch" }}>
            Join the waitlist to save your palette, get real shoppable picks matched to your colors, and unlock the outfit scanner.
          </p>
          <WaitlistInline />
        </section>


      </div>
    </div>
  );
}
