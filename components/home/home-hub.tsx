"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppChrome } from "@/components/nav/app-chrome";
import { ScanPaywallModal } from "@/components/billing/scan-paywall-modal";
import { loadQuizProfile, type QuizProfile } from "@/lib/quiz";
import { SEASONS } from "@/lib/landing-data";
import { buildPreviewColors } from "@/lib/result-palette";
import { loadLocalAnalysisResultForProfile } from "@/lib/profile-restore";
import type { AnalysisResult } from "@/lib/analysis";
import { isSupabaseAuthConfigured } from "@/lib/auth-flow";
import { getScanComingSoonCopy, isScanFeatureEnabled } from "@/lib/scan-feature";
import {
  SCAN_API_ENDPOINT,
  formatScanHistoryItems,
  type ScanHistoryApiRecord,
  type ScanHistoryItemForUi,
} from "@/lib/outfit-scan";
import {
  DEFAULT_WEEKLY_SCAN_CREDITS,
  getBrowserScanCreditState,
} from "@/lib/scan-credits";
import { createClient } from "@/lib/supabase";

const AUTH_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const COMING_SOON = [
  {
    title: "Wardrobe analysis",
    desc: "Upload your clothes, see what matches",
    icon: "wardrobe",
  },
  {
    title: "Virtual try-on",
    desc: "Build outfits and plan what to wear",
    icon: "outfit",
  },
] as const;

function displayNameFromEmail(email?: string | null): string {
  if (!email) return "there";
  const local = email.split("@")[0]?.trim();
  if (!local) return "there";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function homeSubtitles(name: string): string[] {
  return [
    "Your palette is ready to work for you",
    `What are we checking today, ${name}?`,
    "Dress like you know your colors — because you do",
  ];
}

function seasonDescriptor(profile: QuizProfile): string {
  const undertone =
    profile.undertoneHint === "warm"
      ? "warm"
      : profile.undertoneHint === "cool"
        ? "cool"
        : "neutral";
  const sub = profile.subSeason?.toLowerCase() ?? "";
  if (sub.includes("soft")) return `soft ${undertone}`;
  if (sub.includes("bright")) return `bright ${undertone}`;
  if (sub.includes("light")) return `light ${undertone}`;
  if (sub.includes("dark") || sub.includes("deep")) return `deep ${undertone}`;
  return undertone;
}

export function HomeHub() {
  const router = useRouter();
  const authConfigured = isSupabaseAuthConfigured(AUTH_ENV);
  const scanEnabled = isScanFeatureEnabled();
  const scanCopy = getScanComingSoonCopy();
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [displayName, setDisplayName] = useState("there");
  const [greeting, setGreeting] = useState("Hello");
  const [subtitle, setSubtitle] = useState("");
  const [scansLeft, setScansLeft] = useState(DEFAULT_WEEKLY_SCAN_CREDITS);
  const [recentScans, setRecentScans] = useState<ScanHistoryItemForUi[]>([]);
  const [paywallOpen, setPaywallOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const quizProfile = loadQuizProfile();
      if (!quizProfile) {
        router.replace("/quiz");
        return;
      }

      let name = "there";
      if (authConfigured) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        name = displayNameFromEmail(user?.email);
        if (!cancelled) setDisplayName(name);

        if (user && scanEnabled) {
          try {
            const res = await fetch(SCAN_API_ENDPOINT);
            if (res.ok) {
              const data = (await res.json()) as { scans?: ScanHistoryApiRecord[] };
              if (!cancelled) {
                setRecentScans(formatScanHistoryItems(data.scans ?? []).slice(0, 4));
              }
            }
          } catch {
            if (!cancelled) setRecentScans([]);
          }
        }
      } else if (!cancelled) {
        setDisplayName("there");
      }

      if (!cancelled) {
        setProfile(quizProfile);
        setAnalysisResult(loadLocalAnalysisResultForProfile<AnalysisResult>());
        setScansLeft(getBrowserScanCreditState().remaining);
        const hour = new Date().getHours();
        setGreeting(greetingFor(hour));
        const subs = homeSubtitles(name);
        setSubtitle(subs[Math.floor(Math.random() * subs.length)] ?? subs[0]!);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [router, authConfigured, scanEnabled]);

  if (!profile) {
    return (
      <AppChrome className="app-chrome--home">
        <div className="app-shell home-hub">
          <p className="home-hub__loading">Loading…</p>
        </div>
      </AppChrome>
    );
  }

  const seasonId = analysisResult?.seasonId ?? profile.seasonId;
  const season = SEASONS.find((s) => s.id === seasonId) ?? SEASONS[0];
  const subSeason = analysisResult?.subSeason ?? profile.subSeason ?? season.name;
  const palette = buildPreviewColors(season, 5, subSeason);
  const outOfScans = scansLeft <= 0;

  return (
    <AppChrome className="app-chrome--home">
      <ScanPaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
      <div className="app-shell home-hub">
        <main className="home-hub__main">
          <section className="home-hub__intro">
            <p className="home-hub__eyebrow">
              {greeting.toLowerCase()}, {displayName.toLowerCase()} <span aria-hidden>✦</span>
            </p>
            <h1 className="home-hub__headline">
              {greeting},{" "}
              <span className="home-hub__headline-script">{displayName}</span>
            </h1>
            <p className="home-hub__subtitle">{subtitle}</p>
          </section>

          <div className="home-hub__cards-grid">
          <section className="home-hub__profile-card">
            <div className="home-hub__card-head">
              <p className="home-hub__card-kicker">your color season</p>
              <span className="home-hub__season-tag">{seasonDescriptor(profile)}</span>
            </div>
            <h2 className="home-hub__profile-title">
              You&apos;re a{" "}
              <span className="home-hub__profile-script">{subSeason}</span>
            </h2>
            <div className="home-hub__swatches" aria-hidden>
              {palette.map((hex) => (
                <span key={hex} className="home-hub__swatch" style={{ background: hex }} />
              ))}
            </div>
            <Link href="/profile" className="home-hub__report-link">
              see full color report
              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </section>

          <section className="home-hub__scan-card">
            <p className="home-hub__card-kicker">today&apos;s scan</p>
            <h2 className="home-hub__scan-title">Scan a clothing item</h2>
            <p className="home-hub__scan-sub">
              See if it works for your palette before you buy.
            </p>
            {scanEnabled ? (
              outOfScans ? (
                <button type="button" className="home-hub__scan-cta" onClick={() => setPaywallOpen(true)}>
                  get more scans <span aria-hidden>→</span>
                </button>
              ) : (
                <Link href="/scan" className="home-hub__scan-cta">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="4" y="7" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M9 7V5.5A2.5 2.5 0 0 1 11.5 3h1A2.5 2.5 0 0 1 15 5.5V7" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  start scanning
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )
            ) : (
              <span className="home-hub__scan-soon">{scanCopy.title}</span>
            )}
            <p className="home-hub__scan-note">
              {scanEnabled
                ? outOfScans
                  ? "You've used all your free scans this week."
                  : `Uses 1 of your ${scansLeft} free scans`
                : scanCopy.note}
            </p>
          </section>
          </div>

          {scanEnabled && recentScans.length > 0 ? (
            <section className="home-hub__section home-hub__section--recent">
              <div className="home-hub__section-head home-hub__section-head--recent">
                <h3 className="home-hub__section-title">Recent scans</h3>
                <Link href="/profile" className="home-hub__text-link home-hub__text-link--primary">
                  See all
                </Link>
              </div>
              <div className="home-hub__recent-scroll-wrap">
                <ul className="home-hub__recent-list">
                  {recentScans.map((scan) => (
                    <li key={scan.id} className="home-hub__recent-card">
                      <div
                        className="home-hub__recent-thumb"
                        style={{
                          background: scan.thumbnailUrl
                            ? undefined
                            : scan.colorHex ?? "linear-gradient(145deg, var(--blush), var(--cream-2))",
                        }}
                      >
                        {scan.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={scan.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" aria-hidden style={{ width: 24, height: 24, opacity: 0.4 }}>
                            <rect x="4" y="7" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                            <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.6" />
                            <path d="M9 7V5.5A2.5 2.5 0 0 1 11.5 3h1A2.5 2.5 0 0 1 15 5.5V7" stroke="currentColor" strokeWidth="1.6" />
                          </svg>
                        )}
                      </div>
                      <div className="home-hub__recent-body">
                        <span
                          className={`home-hub__recent-verdict home-hub__recent-verdict--${scan.verdictTone}`}
                        >
                          {scan.verdictTone === "yes" ? (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              yes
                            </>
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              skip
                            </>
                          )}
                        </span>
                        <p className="home-hub__recent-label">{scan.colorLabel}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          <section className="home-hub__section home-hub__section--picks">
            <div className="home-hub__section-head">
              <h3 className="home-hub__section-title">your picks</h3>
              <Link href="/feed" className="home-hub__text-link home-hub__text-link--primary">
                see all
              </Link>
            </div>
            <Link href="/feed" className="home-hub__picks-card">
              <div className="home-hub__picks-swatches" aria-hidden>
                {palette.map((hex) => (
                  <span key={hex} className="home-hub__picks-swatch" style={{ background: hex }} />
                ))}
              </div>
              <div className="home-hub__picks-body">
                <p className="home-hub__picks-label">
                  Curated for <strong>{subSeason}</strong>
                </p>
                <p className="home-hub__picks-sub">
                  Real products from UNIQLO, adidas, Sephora — ranked by color match.
                </p>
                <span className="home-hub__picks-cta">
                  shop your palette
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </Link>
          </section>

          <section className="home-hub__coming">
            <h3 className="home-hub__coming-title">Coming soon</h3>
            <ul className="home-hub__coming-grid">
              {COMING_SOON.map((item) => (
                <li key={item.title} className="home-hub__coming-card">
                  <span className="home-hub__coming-lock" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </span>
                  <span className="home-hub__coming-icon" aria-hidden>
                    {item.icon === "wardrobe" ? (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M6 4h12v16H6zM9 4V2h6v2" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    ) : item.icon === "outfit" ? (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 3l3 4 4 1-2 4v9H7v-9l-2-4 4-1 3-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M6 7h15l-1.5 12H7.5L6 7zM9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <p className="home-hub__coming-name">{item.title}</p>
                  <p className="home-hub__coming-desc">{item.desc}</p>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </AppChrome>
  );
}
