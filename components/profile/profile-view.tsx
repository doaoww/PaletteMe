"use client";

import Link from "next/link";
import { ResultCarousel } from "@/components/profile/result-carousel";
import { BottomNav } from "@/components/nav/bottom-nav";
import { useEffect, useRef, useState } from "react";
import { SEASONS } from "@/lib/landing-data";
import { LS_USER_ID } from "@/lib/quiz";
import type { QuizProfile } from "@/lib/quiz";
import type { AnalysisResult } from "@/lib/analysis";
import {
  buildColorIntelligenceReport,
  getFreeColorPreview,
  type ColorTraits,
} from "@/lib/color-intelligence";
import { canAccessPremium, type PremiumLevel } from "@/lib/premium";
import {
  adaptAiScanResultToOutfitScanResult,
  buildOutfitScanFormData,
  requestAiScanResult,
  validateOutfitImage,
  type OutfitScanResult,
} from "@/lib/outfit-scan";
import { createClient } from "@/lib/supabase";
import {
  AUTH_UNAVAILABLE_MESSAGE,
  buildAuthCallbackUrl,
  friendlyAuthError,
  friendlyProfileLinkError,
  getSignUpCompletionMode,
  isSupabaseAuthConfigured,
} from "@/lib/auth-flow";
import { getScanComingSoonCopy, isScanFeatureEnabled } from "@/lib/scan-feature";

// ─── Save banner — shown at the bottom of results ─────────────────────────────

type BannerMode = "checking" | "signed-in" | "choice" | "email" | "loading" | "check-email";

const SUPABASE_AUTH_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

function SaveBanner() {
  const [mode, setMode] = useState<BannerMode>("checking");
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const authConfigured = isSupabaseAuthConfigured(SUPABASE_AUTH_ENV);

  useEffect(() => {
    if (!authConfigured) {
      setMode("choice");
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setMode(user ? "signed-in" : "choice");
    });
  }, [authConfigured]);

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

  async function handleSubmit(e: React.FormEvent) {
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
      if (error) { setErrorMsg(friendlyAuthError(error.message)); setMode("email"); return; }
      if (getSignUpCompletionMode(data) === "signed-in") {
        const linked = await callLinkApi();
        setMode(linked ? "signed-in" : "email");
        return;
      }
      setMode("check-email");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErrorMsg(friendlyAuthError(error.message)); setMode("email"); return; }
    const linked = await callLinkApi();
    setMode(linked ? "signed-in" : "email");
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
        <Link href="/feed" className="btn" style={{ display: "inline-block", marginTop: 16 }}>
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
      {errorMsg && (
        <p style={{ fontSize: "0.82rem", color: "#e53e3e", margin: 0 }}>
          {errorMsg}
        </p>
      )}
    </section>
  );
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

type PaymentUrls = {
  report?: string;
  pro?: string;
};

function CheckoutButton({
  href,
  children,
  muted,
}: {
  href?: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  if (!href) {
    return (
      <button type="button" style={disabledCheckoutBtn} disabled>
        payment link coming soon
      </button>
    );
  }

  return (
    <a
      href={href}
      className={muted ? "btn btn--ghost" : "btn"}
      style={{ display: "inline-block", textAlign: "center" }}
    >
      {children}
    </a>
  );
}

function UpgradePanel({ paymentUrls, compact = false }: { paymentUrls: PaymentUrls; compact?: boolean }) {
  return (
    <div style={{ ...upgradePanel, marginTop: compact ? 18 : 0 }}>
      <div>
        <p className="kicker" style={{ fontSize: "0.54rem", marginBottom: 8 }}>unlock full report</p>
        <p className="font-serif" style={{ fontSize: compact ? "1.25rem" : "clamp(1.45rem,3vw,2rem)", lineHeight: 1.15 }}>
          Full palette, fit notes, and shopping rules.
        </p>
        <p style={{ ...bannerSub, marginTop: 8 }}>
          Keep the core result free, then unlock the deeper color report for a small one-time payment.
        </p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <CheckoutButton href={paymentUrls.report}>unlock report - $2.99</CheckoutButton>
        <CheckoutButton href={paymentUrls.pro} muted>upgrade to pro</CheckoutButton>
      </div>
    </div>
  );
}

function LockedReportPreview({ paymentUrls }: { paymentUrls: PaymentUrls }) {
  return (
    <div style={{ ...lockedPanel, gridColumn: "1 / -1" }}>
      <div>
        <p className="kicker" style={{ fontSize: "0.56rem", marginBottom: 10 }}>paid report</p>
        <p className="font-serif" style={{ fontSize: "clamp(1.55rem,3vw,2.2rem)", lineHeight: 1.1 }}>
          Your deeper style map is ready.
        </p>
        <p style={{ ...bannerSub, marginTop: 10 }}>
          Unlock your full 8-color palette, body-shape dressing notes, style direction, and clear shopping do/don&apos;ts.
        </p>
      </div>
      <div style={lockedMiniGrid}>
        {["8-color palette", "body + fit notes", "shopping rules", "outfit scanner upsell"].map((item) => (
          <span key={item} style={lockedChip}>{item}</span>
        ))}
      </div>
      <CheckoutButton href={paymentUrls.report}>get my full report - $2.99</CheckoutButton>
    </div>
  );
}

type ScannerPhase = "idle" | "ready" | "scanning" | "done" | "error";

function ProScannerCard({
  hasPro,
  paymentUrls,
  profile,
  freeTestingMode,
}: {
  hasPro: boolean;
  paymentUrls: PaymentUrls;
  profile: QuizProfile;
  freeTestingMode: boolean;
}) {
  const scanFeatureEnabled = isScanFeatureEnabled();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<ScannerPhase>("idle");
  const [result, setResult] = useState<OutfitScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pickFile(next: File) {
    const validation = validateOutfitImage(next);
    if (validation) {
      setError(validation);
      setPhase("error");
      setFile(null);
      setResult(null);
      return;
    }
    setFile(next);
    setResult(null);
    setError(null);
    setPhase("ready");
  }

  async function scanOutfit() {
    if (!file) return;
    setPhase("scanning");
    setError(null);

    try {
      const formData = buildOutfitScanFormData({
        file,
        scanType: "outfit",
        profile,
      });
      const data = await requestAiScanResult(formData);
      setResult(adaptAiScanResultToOutfitScanResult(data));
      setPhase("done");
    } catch (err) {
      console.error("[profile-scan] Outfit scan failed", err);
      setError(err instanceof Error ? err.message : "Outfit check failed. Please try again.");
      setPhase("error");
    }
  }

  if (!scanFeatureEnabled) {
    const copy = getScanComingSoonCopy();

    return (
      <section id="scanner" style={{ ...bannerCard, background: "var(--ink)", color: "var(--cream)" }}>
        <p className="kicker" style={{ fontSize: "0.56rem", marginBottom: 8 }}>
          {copy.kicker}
        </p>
        <p className="font-serif" style={{ fontSize: "clamp(1.45rem,3vw,2rem)", lineHeight: 1.15 }}>
          {copy.title}
        </p>
        <p style={{ ...bannerSub, color: "color-mix(in srgb, var(--cream) 82%, transparent)" }}>
          We are keeping your color report live, but pausing item and outfit scans until the results are reliable enough to ship.
        </p>
        <div style={scannerResultBox}>
          <p style={{ ...bannerSub, color: "color-mix(in srgb, var(--cream) 86%, transparent)" }}>
            {copy.note}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="scanner" style={{ ...bannerCard, background: "var(--ink)", color: "var(--cream)" }}>
      <p className="kicker" style={{ fontSize: "0.56rem", marginBottom: 8 }}>
        {freeTestingMode ? "free scanner" : "pro scanner"}
      </p>
      <p className="font-serif" style={{ fontSize: "clamp(1.45rem,3vw,2rem)", lineHeight: 1.15 }}>
        {hasPro
          ? freeTestingMode
            ? "Outfit scanner is open for testing."
            : "Outfit scanner unlocked."
          : "Want to check clothes before buying?"}
      </p>
      <p style={{ ...bannerSub, color: "color-mix(in srgb, var(--cream) 82%, transparent)" }}>
        {hasPro
          ? freeTestingMode
            ? "All scanner checks are free while we test accuracy. Try outfit or product photos and compare the verdict."
            : "Your Pro access is active. The scanner area is ready for outfit and product photo checks."
          : "Pro adds outfit and product photo checks so you can ask whether a piece fits your palette before you spend."}
      </p>
      {!hasPro && (
        <div style={{ marginTop: 8 }}>
          <CheckoutButton href={paymentUrls.pro}>unlock pro scanner</CheckoutButton>
        </div>
      )}
      {hasPro && (
        <div style={{ display: "grid", gap: 14, marginTop: 8 }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={(event) => {
              const next = event.target.files?.[0];
              if (next) pickFile(next);
            }}
          />
          <div style={scannerUploadBox} role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
          }}>
            <span style={{ fontFamily: "var(--sans)", fontSize: "0.86rem", fontWeight: 700 }}>
              {file ? file.name : "upload outfit or product photo"}
            </span>
            <span style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", opacity: 0.7 }}>
              JPG, PNG, or WebP up to 10 MB
            </span>
          </div>

          {file && phase !== "scanning" && (
            <button type="button" className="btn" style={{ justifySelf: "start" }} onClick={scanOutfit}>
              scan against my palette
            </button>
          )}

          {phase === "scanning" && (
            <p style={{ ...bannerSub, color: "color-mix(in srgb, var(--cream) 78%, transparent)" }}>
              Checking color match, undertone fit, and styling suggestion...
            </p>
          )}

          {error && (
            <p style={{ ...bannerSub, color: "var(--blush)" }}>
              {error}
            </p>
          )}

          {result && (
            <div style={scannerResultBox}>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.78rem", fontWeight: 800, margin: 0 }}>
                {result.match ? "good palette match" : "palette caution"} · {result.score}% score
              </p>
              {result.dominant_colors.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.dominant_colors.map((color) => (
                    <span key={color} style={scannerChip}>{color}</span>
                  ))}
                </div>
              )}
              <p style={{ ...bannerSub, color: "color-mix(in srgb, var(--cream) 86%, transparent)" }}>
                {result.reason}
              </p>
              <p style={{ ...bannerSub, color: "color-mix(in srgb, var(--cream) 86%, transparent)" }}>
                {result.suggestion}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

const disabledCheckoutBtn: React.CSSProperties = {
  padding: "11px 22px",
  borderRadius: 100,
  border: "1.5px solid var(--hair)",
  background: "color-mix(in srgb, var(--cream-2) 70%, transparent)",
  color: "var(--ink-soft)",
  fontFamily: "var(--sans)",
  fontSize: "0.9rem",
  cursor: "not-allowed",
  textTransform: "lowercase",
};

const scannerUploadBox: React.CSSProperties = {
  borderRadius: 14,
  border: "1px dashed color-mix(in srgb, var(--cream) 48%, transparent)",
  background: "color-mix(in srgb, var(--cream) 8%, transparent)",
  padding: "clamp(18px,3vw,24px)",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  cursor: "pointer",
};

const scannerResultBox: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid color-mix(in srgb, var(--cream) 24%, transparent)",
  background: "color-mix(in srgb, var(--cream) 8%, transparent)",
  padding: "clamp(16px,3vw,22px)",
  display: "grid",
  gap: 12,
};

const scannerChip: React.CSSProperties = {
  fontFamily: "var(--sans)",
  fontSize: "0.72rem",
  border: "1px solid color-mix(in srgb, var(--cream) 28%, transparent)",
  borderRadius: 100,
  padding: "4px 10px",
  color: "var(--cream)",
};

const upgradePanel: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid var(--hair)",
  background: "color-mix(in srgb, var(--blush) 34%, transparent)",
  padding: "clamp(18px,3vw,26px)",
  display: "grid",
  gap: 18,
};

const lockedPanel: React.CSSProperties = {
  ...upgradePanel,
  background: "color-mix(in srgb, var(--cream-2) 72%, transparent)",
};

const lockedMiniGrid: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const lockedChip: React.CSSProperties = {
  fontFamily: "var(--sans)",
  fontSize: "0.76rem",
  fontWeight: 700,
  border: "1px solid var(--hair)",
  borderRadius: 100,
  padding: "5px 12px",
  color: "var(--ink-soft)",
};

export function ProfileView({
  profile,
  analysisResult,
  premiumLevel,
  paymentUrls,
  freeTestingMode,
}: {
  profile: QuizProfile;
  analysisResult?: AnalysisResult | null;
  premiumLevel: PremiumLevel;
  paymentUrls: PaymentUrls;
  freeTestingMode: boolean;
}) {
  const season = SEASONS.find((s) => s.id === profile.seasonId) ?? SEASONS[0];
  const hasReport = freeTestingMode || canAccessPremium(premiumLevel, "report");
  const hasPro = freeTestingMode || canAccessPremium(premiumLevel, "pro");
  const traits: ColorTraits = {
    undertone: analysisResult?.traits?.undertone ?? profile.undertoneHint,
    contrast: analysisResult?.traits?.contrast ?? "medium",
    depth: analysisResult?.traits?.depth ?? "medium",
    chroma: analysisResult?.traits?.chroma ?? "balanced",
  };
  const displaySubSeason = analysisResult?.subSeason ?? profile.subSeason ?? season.name;
  const report = analysisResult?.report ?? buildColorIntelligenceReport({
    season,
    subSeason: displaySubSeason,
    traits,
    featureNotes: analysisResult?.features,
    context: {
      styleGoal: profile.answers.goal,
      styleVibe: profile.answers.styleVibe ?? profile.styleVector?.aesthetics[0],
      naturalHairColor: profile.answers.naturalHairColor,
    },
  });
  const visiblePalette = hasReport ? report.bestColors : getFreeColorPreview(report, 4);

  return (
    <div className={`app-shell profile-shell${hasReport ? " profile-shell--result" : ""}`}>

      {!hasReport && (
      <header className="app-topbar glass-nav" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px var(--pad)",
      }}>
        <Link href="/home" className="wordmark" style={{ color: "var(--ink)", fontSize: "1.2rem" }}>
          palette<span style={{ color: "var(--pink)" }}>me</span>
        </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {freeTestingMode && (
              <span style={{ fontFamily: "var(--sans)", fontSize: "0.72rem", color: "var(--pink)", fontWeight: 700 }}>
                all features free
              </span>
            )}
            {!freeTestingMode && premiumLevel !== "free" && (
              <span style={{ fontFamily: "var(--sans)", fontSize: "0.72rem", color: "var(--pink)", fontWeight: 700 }}>
                {premiumLevel} unlocked
              </span>
            )}
          </div>
      </header>
      )}

      <div className={hasReport ? "profile-result-wrap" : "wrap"} style={hasReport ? undefined : { paddingTop: "clamp(40px,7vh,72px)", paddingBottom: "clamp(48px,8vh,96px)" }}>

        {hasReport ? (
          <ResultCarousel
            profile={profile}
            season={season}
            report={report}
            subSeason={displaySubSeason}
            confidence={analysisResult?.confidence ?? profile.quizConfidence}
          />
        ) : (
          <>
        {/* ── Season hero (free preview) ── */}
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
          {hasReport && displaySubSeason && (
            <p style={{ fontFamily: "var(--sans)", fontSize: "1.05rem", fontWeight: 600, color: "var(--ink-soft)", marginTop: 8 }}>
              {displaySubSeason}
            </p>
          )}
          {!hasReport && displaySubSeason && (
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.92rem", color: "var(--ink-soft)", marginTop: 8 }}>
              exact sub-season available in the full report
            </p>
          )}
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-soft)", marginTop: 6, opacity: 0.7 }}>
            {traits.undertone} undertone · {traits.contrast} contrast · {traits.chroma} chroma
          </p>

          {/* Palette */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
            {visiblePalette.map((color) => (
              <span
                key={color.hex}
                title={color.name}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: color.hex,
                  border: "1px solid var(--hair)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  display: "block",
                }}
              />
            ))}
          </div>

          <p style={{ fontFamily: "var(--sans)", fontSize: "0.96rem", lineHeight: 1.65, color: "var(--ink-soft)", marginTop: 20, maxWidth: "52ch" }}>
            {analysisResult?.summary ?? season.why}
          </p>
          {!hasReport && (
            <>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.84rem", color: "var(--ink-soft)", marginTop: 12 }}>
                Free preview: season result and first palette colors. The full report unlocks all colors and shopping guidance.
              </p>
              <UpgradePanel paymentUrls={paymentUrls} compact />
            </>
          )}
        </section>

        <section
          className="profile-cols"
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "clamp(24px,4vw,48px)", marginBottom: "clamp(48px,8vh,80px)" }}
        >
          <LockedReportPreview paymentUrls={paymentUrls} />
        </section>
          </>
        )}

        {!hasReport && (
        <>
        <ProScannerCard
          hasPro={hasPro}
          paymentUrls={paymentUrls}
          profile={profile}
          freeTestingMode={freeTestingMode}
        />
        <SaveBanner />
        </>
        )}

      </div>

      {!hasReport && <BottomNav />}
    </div>
  );
}
