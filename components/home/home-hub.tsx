"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/nav/bottom-nav";
import { loadQuizProfile, type QuizProfile } from "@/lib/quiz";
import { SEASONS } from "@/lib/landing-data";
import { buildPreviewColors } from "@/lib/result-palette";
import { wardrobeItemCount } from "@/lib/wardrobe-store";
import { isSupabaseAuthConfigured } from "@/lib/auth-flow";
import { getScanComingSoonCopy, isScanFeatureEnabled } from "@/lib/scan-feature";
import { createClient } from "@/lib/supabase";

const AUTH_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const COMING_SOON = [
  {
    title: "analyze my wardrobe",
    sub: "See which pieces already match your palette",
    icon: "wardrobe",
  },
  {
    title: "outfit recommendations",
    sub: "Build looks from what you own",
    icon: "outfit",
  },
  {
    title: "smart shopping list",
    sub: "Shop colors that suit you before you buy",
    icon: "shop",
  },
] as const;

function displayNameFromEmail(email?: string | null): string {
  if (!email) return "there";
  const local = email.split("@")[0]?.trim();
  if (!local) return "there";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function seasonDescriptor(profile: QuizProfile): string {
  const undertone = profile.undertoneHint === "warm"
    ? "warm"
    : profile.undertoneHint === "cool"
      ? "cool"
      : "neutral";
  const sub = profile.subSeason?.toLowerCase() ?? "";
  if (sub.includes("soft")) return `Soft ${undertone}`;
  if (sub.includes("bright")) return `Bright ${undertone}`;
  if (sub.includes("light")) return `Light ${undertone}`;
  if (sub.includes("dark") || sub.includes("deep")) return `Deep ${undertone}`;
  return undertone;
}

export function HomeHub() {
  const router = useRouter();
  const authConfigured = isSupabaseAuthConfigured(AUTH_ENV);
  const scanEnabled = isScanFeatureEnabled();
  const scanCopy = getScanComingSoonCopy();
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [displayName, setDisplayName] = useState("there");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState<string | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  async function joinWaitlist(feature: string) {
    if (!userEmail) {
      router.push("/login?next=/home");
      return;
    }
    if (waitlistJoined || waitlistLoading) return;
    setWaitlistError(null);
    setWaitlistLoading(feature);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, feature }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setWaitlistError(data.error ?? "Could not join the waitlist. Try again.");
        return;
      }
      setWaitlistJoined(true);
    } catch {
      setWaitlistError("Network error. Try again in a moment.");
    } finally {
      setWaitlistLoading(null);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const quizProfile = loadQuizProfile();
      if (!quizProfile) {
        router.replace("/quiz");
        return;
      }

      if (authConfigured) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!cancelled) {
          setDisplayName(displayNameFromEmail(user?.email));
          setUserEmail(user?.email ?? null);
        }
      } else if (!cancelled) {
        setDisplayName("there");
      }

      if (!cancelled) {
        setProfile(quizProfile);
        setWardrobeCount(wardrobeItemCount());
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [router, authConfigured]);

  if (!profile) {
    return (
      <div className="app-shell home-hub">
        <p className="home-hub__loading">Loading…</p>
      </div>
    );
  }

  const season = SEASONS.find((s) => s.id === profile.seasonId) ?? SEASONS[0];
  const subSeason = profile.subSeason ?? season.name;
  const palette = buildPreviewColors(season, 4, subSeason);
  const matchLabel = `${profile.quizConfidence ?? 90}% match`;

  return (
    <div className="app-shell home-hub">
      <header className="home-hub__topbar glass-nav">
        <Link href="/profile" className="home-hub__icon-btn" aria-label="Your palette report">
          <span aria-hidden>☰</span>
        </Link>
        <Link href="/home" className="home-hub__wordmark">
          palette<span>me</span>
        </Link>
        <Link href="/profile" className="home-hub__avatar" aria-label="Your profile">
          {displayName.charAt(0)}
        </Link>
      </header>

      <main className="home-hub__main">
        <p className="home-hub__greeting">
          Hi, {displayName} <span aria-hidden>✦</span>
        </p>

        <article className="home-hub__profile-card">
          <p className="home-hub__card-kicker">current profile</p>
          <h1 className="home-hub__profile-title">
            You&apos;re a {subSeason}
            <span> · {seasonDescriptor(profile)}</span>
          </h1>
          <div className="home-hub__swatches" aria-hidden>
            {palette.map((hex) => (
              <span key={hex} className="home-hub__swatch" style={{ background: hex }} />
            ))}
          </div>
        </article>

        <div className="home-hub__stats">
          <span>{wardrobeCount} items scanned</span>
          <span>{matchLabel}</span>
          <span>{subSeason.split(" ")[0]}</span>
        </div>

        <section className="home-hub__section">
          <h2 className="home-hub__section-title">What do you want to do?</h2>
          {scanEnabled ? (
            <>
              <Link href="/scan" className="home-hub__action-card">
                <span className="home-hub__action-icon" aria-hidden>
                  <svg viewBox="0 0 48 48" fill="none">
                    <rect x="6" y="14" width="36" height="26" rx="4" stroke="currentColor" strokeWidth="2" />
                    <circle cx="24" cy="27" r="7" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </span>
                <span>
                  <strong>Scan an item</strong>
                  <small>Check if it matches your colors</small>
                </span>
              </Link>
              <Link href="/scan" className="home-hub__cta">
                scan now →
              </Link>
            </>
          ) : (
            <article className="home-hub__action-card home-hub__action-card--muted">
              <span className="home-hub__action-icon" aria-hidden>
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="14" width="36" height="26" rx="4" stroke="currentColor" strokeWidth="2" />
                  <circle cx="24" cy="27" r="7" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
              <span>
                <strong>{scanCopy.title}</strong>
                <small>{scanCopy.body}</small>
              </span>
            </article>
          )}
          <div className="home-hub__quick-links">
            <Link href="/feed">shop picks</Link>
            <Link href="/saved">saved items</Link>
            <Link href="/wardrobe">my wardrobe</Link>
          </div>
        </section>

        <section className="home-hub__section">
          <div className="home-hub__section-head">
            <p className="home-hub__card-kicker">recent scans</p>
            {scanEnabled ? (
              <Link href="/scan" className="home-hub__text-link">view all</Link>
            ) : null}
          </div>
          <div className="home-hub__recent-scroll">
            <article className="home-hub__recent-empty">
              <p>
                {scanEnabled
                  ? "Your scan history will appear here after your first check."
                  : scanCopy.note}
              </p>
              {scanEnabled ? <Link href="/scan">scan something</Link> : null}
            </article>
          </div>
        </section>

        <section className="home-hub__soon-stack">
          <p className="home-hub__soon-intro">
            These tools are on the way. Join the waitlist and we&apos;ll email you when they open.
          </p>
          {COMING_SOON.map((item) => (
            <article key={item.title} className="home-hub__soon-card">
              <span className="home-hub__soon-badge">coming soon</span>
              <span className="home-hub__soon-icon" aria-hidden>
                {item.icon === "wardrobe" ? "◫" : item.icon === "outfit" ? "◇" : "◎"}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.sub}</p>
              </div>
              <button
                type="button"
                className={`home-hub__waitlist-btn${waitlistJoined ? " home-hub__waitlist-btn--joined" : ""}`}
                disabled={waitlistJoined || waitlistLoading != null}
                onClick={() => void joinWaitlist(item.title)}
              >
                {waitlistJoined
                  ? "on the list"
                  : !userEmail
                    ? "sign in to join"
                    : waitlistLoading === item.title
                      ? "joining…"
                      : "join waitlist"}
              </button>
            </article>
          ))}
          {waitlistError ? (
            <p className="home-hub__waitlist-error" role="alert">{waitlistError}</p>
          ) : null}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
