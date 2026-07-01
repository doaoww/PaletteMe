"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SelfieCapture } from "@/components/selfie/selfie-capture";
import { PostQuizAuthScreen } from "@/components/auth/post-quiz-auth-screen";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type WardrobeType   = "woman" | "man" | "other";
type Occasion       = "everyday" | "work" | "events" | "everything";
type StyleConcern   = "buy-wrong" | "cant-combine" | "want-refresh" | "understand-colors";
type ReportSection  = "colors" | "hair" | "makeup" | "glasses" | "outfits";

const ALL_SECTIONS: ReportSection[] = ["colors", "hair", "makeup", "glasses", "outfits"];

type Step = "photo" | "wardrobe" | "occasion" | "concern" | "sections" | "auth" | "analyzing" | "season-reveal";

const TOTAL_STEPS = 5;

const STEP_INDEX: Record<Step, number> = {
  photo:           1,
  wardrobe:        2,
  occasion:        3,
  concern:         4,
  sections:        5,
  auth:            5,
  analyzing:       5,
  "season-reveal": 5,
};

type SeasonPreview = { id: string; name: string; palette: string[] };

// Round-tripped verbatim from /api/report/analyze so /api/report/full can rebuild the
// report prompt without re-running trait extraction when the user unlocks.
type Traits = Record<string, unknown>;
type ScoredSeason = { subSeason: string; seasonId: string; likelihood: number; reason: string };
type MiniData = { traits: Traits; scoredTop3: [ScoredSeason, ScoredSeason, ScoredSeason] };

const SEASON_CELEBS: Record<string, string[]> = {
  "light-spring":  ["Reese Witherspoon", "Cameron Diaz", "Emma Stone"],
  "true-spring":   ["Kate Middleton", "Julianne Hough", "Gisele Bündchen"],
  "bright-spring": ["Mila Kunis", "Olivia Wilde", "Jennifer Lopez"],
  "light-summer":  ["Gwyneth Paltrow", "Sienna Miller", "Kirsten Dunst"],
  "true-summer":   ["Blake Lively", "Jessica Alba", "Margot Robbie"],
  "soft-summer":   ["Katie Holmes", "Keira Knightley", "Natalie Portman"],
  "soft-autumn":   ["Jennifer Aniston", "Jessica Biel", "Minka Kelly"],
  "true-autumn":   ["Julia Roberts", "Emma Stone", "Jennifer Lawrence"],
  "dark-autumn":   ["Monica Bellucci", "Penélope Cruz", "Angelina Jolie"],
  "dark-winter":   ["Kim Kardashian", "Priyanka Chopra", "Selena Gomez"],
  "true-winter":   ["Zendaya", "Liv Tyler", "Sandra Oh"],
  "bright-winter": ["Megan Fox", "Lucy Liu", "Meghan Markle"],
};

const WARDROBE_OPTIONS: { value: WardrobeType; label: string; sub: string; emoji: string }[] = [
  { value: "woman",  label: "woman",       sub: "womenswear & accessories",  emoji: "👗" },
  { value: "man",    label: "man",          sub: "menswear & accessories",    emoji: "🧥" },
  { value: "other",  label: "both / other", sub: "unisex recommendations",    emoji: "✦" },
];

const OCCASION_OPTIONS: { value: Occasion; label: string; sub: string }[] = [
  { value: "everyday",    label: "everyday life",       sub: "casual, errands, weekends" },
  { value: "work",        label: "work & professional", sub: "office, meetings, business" },
  { value: "events",      label: "events & going out",  sub: "dates, parties, dinners" },
  { value: "everything",  label: "all of the above",    sub: "I need a look for everything" },
];

const CONCERN_OPTIONS: { value: StyleConcern; label: string; sub: string }[] = [
  { value: "buy-wrong",        label: "I keep buying the wrong things", sub: "I shop but nothing feels right" },
  { value: "cant-combine",     label: "I can't put outfits together",   sub: "I have pieces but can't make them work" },
  { value: "want-refresh",     label: "I want a full style refresh",    sub: "I'm ready to change my whole look" },
  { value: "understand-colors",label: "I want to understand my colors", sub: "I want to know what actually flatters me" },
];

const SECTIONS_OPTIONS: { value: ReportSection; label: string; sub: string }[] = [
  { value: "colors",   label: "Colours",         sub: "your palette, what to wear and avoid" },
  { value: "hair",     label: "Hair",             sub: "colour and cut direction for your face" },
  { value: "makeup",   label: "Makeup",           sub: "shades and styles that suit your features" },
  { value: "glasses",  label: "Glasses",          sub: "frame shapes for your face structure" },
  { value: "outfits",  label: "Style & outfits",  sub: "looks, aesthetics, and shopping direction" },
];

const LOADING_MESSAGES = [
  "analysing your features…",
  "reading your colour season…",
  "mapping your best tones…",
  "building your style profile…",
  "crafting your personal report…",
];

function CelebPhoto({ seasonId, index, name }: { seasonId: string; index: number; name: string }) {
  const src = `/celebs/${seasonId}${index + 1}.jpg`;
  const firstName = name.split(" ")[0];
  return (
    <div className="ss-celeb-card">
      <div className="ss-celeb-card__avatar">
        <img src={src} alt={name} className="ss-celeb-card__img" />
      </div>
      <p className="ss-celeb-card__name">{firstName}</p>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const STEP_BACK: Partial<Record<Step, Step>> = {
  wardrobe: "photo",
  occasion: "wardrobe",
  concern:  "occasion",
  sections: "concern",
};

export function StyleSetupFlow() {
  const router = useRouter();
  const [step, setStep]                         = useState<Step>("photo");
  const [photoDataUrl, setPhotoDataUrl]         = useState<string | null>(null);
  const [wardrobeType, setWardrobeType]         = useState<WardrobeType | null>(null);
  const [occasion, setOccasion]                 = useState<Occasion | null>(null);
  const [styleConcern, setStyleConcern]         = useState<StyleConcern | null>(null);
  const [reportSections, setReportSections]     = useState<ReportSection[]>(ALL_SECTIONS);
  const [error, setError]                 = useState<string | null>(null);
  const [msgIdx, setMsgIdx]               = useState(0);
  const [seasonPreview, setSeasonPreview] = useState<SeasonPreview | null>(null);
  const [miniData, setMiniData]           = useState<MiniData | null>(null);
  const [unlocking, setUnlocking]         = useState(false);
  const [authChecked, setAuthChecked]     = useState(false);
  const timerRef                          = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeAttempted                   = useRef(false);

  // On mount: check for an existing Supabase session. If one exists and there's a
  // pending submission left over from before an OAuth redirect, auto-resume it
  // instead of making the user redo the quiz. Guarded by `resumeAttempted` so a
  // React StrictMode dev double-invoke (or any other re-run of this effect) can't
  // fire the paid analyze call twice.
  useEffect(() => {
    (async () => {
      try {
        const { createClient } = await import("@/lib/db/supabase");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setAuthChecked(true);
        if (user) {
          const pendingUnlockRaw = localStorage.getItem("paletteme-pending-unlock");
          const pendingRaw = localStorage.getItem("paletteme-pending-submission");

          if (pendingUnlockRaw && step === "photo" && !resumeAttempted.current) {
            // Returning from a Polar checkout redirect — resume straight into the
            // full-report call instead of re-showing the mini result.
            resumeAttempted.current = true;
            try {
              const pending = JSON.parse(pendingUnlockRaw) as {
                photoDataUrl: string; wardrobeType: WardrobeType; occasion: Occasion;
                styleConcern: StyleConcern; reportSections: ReportSection[];
                traits: Traits; scoredTop3: [ScoredSeason, ScoredSeason, ScoredSeason];
                seasonPreview: SeasonPreview | null;
              };
              setPhotoDataUrl(pending.photoDataUrl);
              setWardrobeType(pending.wardrobeType);
              setOccasion(pending.occasion);
              setStyleConcern(pending.styleConcern);
              setReportSections(pending.reportSections);
              setMiniData({ traits: pending.traits, scoredTop3: pending.scoredTop3 });
              if (pending.seasonPreview) setSeasonPreview(pending.seasonPreview);
              setStep("season-reveal");
              localStorage.removeItem("paletteme-pending-unlock");
              void callFullReport(
                pending.photoDataUrl, pending.wardrobeType, pending.occasion, pending.styleConcern,
                pending.reportSections, pending.traits, pending.scoredTop3, true,
              );
            } catch { /* malformed, ignore and let the user redo the flow */ }
          } else if (pendingRaw && step === "photo" && !resumeAttempted.current) {
            resumeAttempted.current = true;
            try {
              const pending = JSON.parse(pendingRaw) as {
                photoDataUrl: string; wardrobeType: WardrobeType; occasion: Occasion;
                styleConcern: StyleConcern; reportSections: ReportSection[];
              };
              setPhotoDataUrl(pending.photoDataUrl);
              setWardrobeType(pending.wardrobeType);
              setOccasion(pending.occasion);
              setStyleConcern(pending.styleConcern);
              setReportSections(pending.reportSections);
              localStorage.removeItem("paletteme-pending-submission");
              void handleSubmitWithAnswers(pending.photoDataUrl, pending.wardrobeType, pending.reportSections);
            } catch { /* malformed, ignore and let the user redo the flow */ }
          }
        }
      } catch {
        setAuthChecked(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFile(file: File) {
    const dataUrl = await fileToDataUrl(file);
    setPhotoDataUrl(dataUrl);
    try { localStorage.setItem("paletteme-face-photo", dataUrl); } catch { /* quota */ }
    setStep("wardrobe");
  }

  // Free mini phase: trait extraction + season scoring only. Never calls the paid
  // full-report route — that only fires from handleUnlock(), after an explicit click.
  async function handleSubmitWithAnswers(
    photo: string,
    wardrobe: WardrobeType,
    sections: ReportSection[],
  ) {
    setStep("analyzing");
    setError(null);
    setSeasonPreview(null);
    setMiniData(null);
    timerRef.current = setInterval(() => {
      setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length);
    }, 3500);

    try { localStorage.setItem("paletteme-report-sections", JSON.stringify(sections)); } catch { /* quota */ }
    try { localStorage.setItem("paletteme-wardrobe-type", wardrobe); } catch { /* quota */ }
    const body    = JSON.stringify({ photoDataUrl: photo });
    const headers = { "Content-Type": "application/json" };

    async function callAnalyze(attempt: number): Promise<Response> {
      const res = await fetch("/api/report/analyze", { method: "POST", headers, body });
      if (!res.ok && res.status !== 422 && attempt < 2) {
        await new Promise(r => setTimeout(r, 2000));
        return callAnalyze(attempt + 1);
      }
      return res;
    }

    try {
      const res = await callAnalyze(1);
      clearInterval(timerRef.current!);

      if (res.status === 422) {
        const data = await res.json() as { detail?: string };
        throw new Error(data.detail ?? "photo quality too low — please use a clear, well-lit selfie.");
      }
      if (!res.ok) {
        throw new Error("analysis failed. please try again.");
      }

      const data = await res.json() as {
        seasonId: string; seasonName: string; palette: string[];
        traits: Traits; scoredTop3: [ScoredSeason, ScoredSeason, ScoredSeason];
      };
      setSeasonPreview({ id: data.seasonId, name: data.seasonName, palette: data.palette });
      setMiniData({ traits: data.traits, scoredTop3: data.scoredTop3 });
      setStep("season-reveal");
    } catch (err) {
      clearInterval(timerRef.current!);
      setError(err instanceof Error ? err.message : "something went wrong.");
      setStep("photo");
    }
  }

  // Paid full phase: only reachable from the season-reveal screen's explicit
  // "unlock" click (or the post-Polar-checkout resume below). Reuses the
  // traits/season data the mini phase already computed — never re-runs trait
  // extraction, so this is pure incremental cost on unlock only.
  //
  // `isResumeFromPayment` controls whether a 402 (not entitled yet) is
  // retried a few times before giving up: on the FIRST click from a
  // never-paid user, 402 should send them to checkout immediately, not
  // after a pointless multi-second wait. On the resume-after-checkout path,
  // the Polar webhook may land a moment after the browser redirects back,
  // so a short retry window is the right call there.
  async function callFullReport(
    photo: string,
    wardrobe: WardrobeType,
    occ: Occasion,
    concern: StyleConcern,
    sections: ReportSection[],
    traits: Traits,
    scoredTop3: [ScoredSeason, ScoredSeason, ScoredSeason],
    isResumeFromPayment: boolean,
  ) {
    setUnlocking(true);
    setError(null);

    const body = JSON.stringify({
      photoDataUrl: photo,
      wardrobeType: wardrobe,
      quizAnswers: { occasion: occ, styleConcern: concern, reportSections: sections },
      traits,
      scoredTop3,
    });
    const headers = { "Content-Type": "application/json" };

    async function callFull(attempt: number): Promise<Response> {
      const res = await fetch("/api/report/full", { method: "POST", headers, body });
      if (res.status === 402 && isResumeFromPayment && attempt < 5) {
        await new Promise(r => setTimeout(r, 3000));
        return callFull(attempt + 1);
      }
      if (res.status === 409 && attempt < 3) {
        await new Promise(r => setTimeout(r, 5000));
        return callFull(attempt + 1);
      }
      if (!res.ok && res.status !== 402 && res.status !== 409 && attempt < 2) {
        await new Promise(r => setTimeout(r, 2000));
        return callFull(attempt + 1);
      }
      return res;
    }

    try {
      const res = await callFull(1);

      if (res.status === 402) {
        // Not entitled (yet) — send to Polar checkout, persisting everything
        // needed to resume straight into this same call once payment lands.
        try {
          localStorage.setItem("paletteme-pending-unlock", JSON.stringify({
            photoDataUrl: photo, wardrobeType: wardrobe, occasion: occ, styleConcern: concern,
            reportSections: sections, traits, scoredTop3,
            seasonPreview: seasonPreview,
          }));
        } catch { /* quota — resume after payment won't work, but checkout itself still will */ }

        const checkoutRes = await fetch("/api/billing/polar/checkout", { method: "POST" });
        if (!checkoutRes.ok) {
          throw new Error("could not start checkout. please try again.");
        }
        const { url } = await checkoutRes.json() as { url: string };
        window.location.href = url;
        return;
      }
      if (res.status === 409) {
        throw new Error("your report is taking a little longer than usual — please try again in a moment.");
      }
      if (!res.ok) {
        throw new Error("report generation failed. please try again.");
      }

      const { data } = await res.json() as { data: unknown };
      try { localStorage.setItem("paletteme-analysis", JSON.stringify(data)); } catch { /* quota */ }
      try { localStorage.removeItem("paletteme-report-images"); } catch { /* quota */ }
      try { localStorage.removeItem("paletteme-pending-unlock"); } catch { /* quota */ }
      router.push("/profile");
    } catch (err) {
      setUnlocking(false);
      setError(err instanceof Error ? err.message : "something went wrong.");
    }
  }

  function handleUnlock() {
    if (!photoDataUrl || !wardrobeType || !occasion || !styleConcern || !miniData) return;
    const sections = reportSections.length > 0 ? reportSections : ALL_SECTIONS;
    void callFullReport(photoDataUrl, wardrobeType, occasion, styleConcern, sections, miniData.traits, miniData.scoredTop3, false);
  }

  function handleSubmit() {
    if (!photoDataUrl || !wardrobeType || !occasion || !styleConcern) return;
    const sections = reportSections.length > 0 ? reportSections : ALL_SECTIONS;
    try {
      localStorage.setItem("paletteme-pending-submission", JSON.stringify({
        photoDataUrl, wardrobeType, occasion, styleConcern, reportSections: sections,
      }));
    } catch { /* quota — the in-memory state below still lets email auth work */ }
    setStep("auth");
  }

  const progress = STEP_INDEX[step] / TOTAL_STEPS;
  const backStep = STEP_BACK[step];

  return (
    <div className="ss-page">
      {/* ── Analyzing overlay ───────────────────────────────────────────────── */}
      {step === "analyzing" && (
        <div className="ss-analyzing" role="status" aria-live="polite" aria-label="Analysing your style">
          <div
            className={`ss-analyzing__bg${!photoDataUrl ? " ss-analyzing__bg--fallback" : ""}`}
            style={photoDataUrl ? { backgroundImage: `url(${photoDataUrl})` } : undefined}
          />
          <div className="ss-analyzing__overlay" />
          <div className="ss-analyzing__content">
            <div className="ss-analyzing__orb" aria-hidden>
              <span className="ss-analyzing__ring" />
              <span className="ss-analyzing__ring" />
              <span className="ss-analyzing__ring" />
              <span className="ss-analyzing__spinner-dot" />
            </div>
            <div className="ss-analyzing__msg-wrap">
              <p className="ss-analyzing__msg" key={msgIdx}>
                {LOADING_MESSAGES[msgIdx]}
              </p>
            </div>
            <p className="ss-analyzing__sub">this takes about 20 seconds</p>
          </div>
        </div>
      )}

      {/* ── Season reveal overlay ───────────────────────────────────────────── */}
      {step === "season-reveal" && seasonPreview && (
        <div className="ss-season-reveal" role="status" aria-live="polite">
          <div
            className={`ss-analyzing__bg${!photoDataUrl ? " ss-analyzing__bg--fallback" : ""}`}
            style={photoDataUrl ? { backgroundImage: `url(${photoDataUrl})` } : undefined}
          />
          <div className="ss-analyzing__overlay" />
          <div className="ss-season-reveal__content">
            {/* Palette swatches */}
            <div className="ss-season-reveal__palette" aria-hidden>
              {seasonPreview.palette.map((hex, i) => (
                <span key={i} className="ss-season-reveal__swatch" style={{ background: hex }} />
              ))}
            </div>

            {/* Season name */}
            <div className="ss-season-reveal__heading-wrap">
              <p className="ss-season-reveal__eyebrow">your colour season</p>
              <h1 className="ss-season-reveal__name">{seasonPreview.name}</h1>
            </div>

            {/* Celebrities */}
            {(SEASON_CELEBS[seasonPreview.id] ?? []).length > 0 && (
              <div className="ss-season-reveal__celebs">
                <p className="ss-season-reveal__celebs-label">style icons with your season</p>
                <div className="ss-season-reveal__celebs-list">
                  {(SEASON_CELEBS[seasonPreview.id] ?? []).map((name, i) => (
                    <CelebPhoto key={name} seasonId={seasonPreview.id} index={i} name={name} />
                  ))}
                </div>
              </div>
            )}

            {/* Paywall: full report + photos are never generated until this is clicked */}
            <div className="ss-season-reveal__cta-area">
              {unlocking ? (
                <div className="ss-season-reveal__building">
                  <span className="ss-season-reveal__dot" />
                  <span className="ss-season-reveal__dot" />
                  <span className="ss-season-reveal__dot" />
                  <span className="ss-season-reveal__building-text">unlocking your full report</span>
                </div>
              ) : (
                <>
                  <p className="ss-season-reveal__locked-note">
                    full report unlocks: {SECTIONS_OPTIONS.map(s => s.label).join(" · ")}
                  </p>
                  {error && <p className="ss-photo__error" role="alert">{error}</p>}
                  <button
                    className="ss-season-reveal__cta-btn"
                    onClick={handleUnlock}
                    disabled={!miniData}
                  >
                    unlock my full report →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Auth gate (sign in before we call the paid analyze route) ──────── */}
      {step === "auth" && photoDataUrl && wardrobeType && occasion && styleConcern && (
        <PostQuizAuthScreen
          redirectPath="/style-setup"
          onAuthed={() => {
            try { localStorage.removeItem("paletteme-pending-submission"); } catch { /* quota */ }
            const sections = reportSections.length > 0 ? reportSections : ALL_SECTIONS;
            void handleSubmitWithAnswers(photoDataUrl, wardrobeType, sections);
          }}
        />
      )}

      {/* ── Sticky progress header ──────────────────────────────────────────── */}
      {step !== "analyzing" && step !== "season-reveal" && step !== "auth" && (
        <header className="ss-header" role="banner">
          <div className="ss-header__bar">
            <button
              className={`ss-header__back${!backStep ? " ss-header__back--hidden" : ""}`}
              onClick={() => backStep && setStep(backStep)}
              aria-label="go back"
              tabIndex={!backStep ? -1 : 0}
            >
              <BackIcon />
            </button>
            <Link href="/" className="ss-header__logo">paletteme</Link>
            <p className="ss-header__step">{STEP_INDEX[step]} / {TOTAL_STEPS}</p>
          </div>
          <div className="ss-header__progress" aria-hidden>
            <span
              className="ss-header__progress-fill"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        </header>
      )}

      {/* ── Step body ───────────────────────────────────────────────────────── */}
      {step !== "analyzing" && step !== "season-reveal" && step !== "auth" && (
        <main className="ss-body">

          {/* Step 1 — photo */}
          {step === "photo" && (
            <div className="ss-step" key="photo">
              <p className="ss-photo__kicker">your style, personalised</p>
              <h1 className="ss-photo__title">upload your<br />face photo</h1>
              <p className="ss-photo__sub">
                Clear face, natural light, no filters. We&apos;ll read your features, colour season, and undertone.
              </p>
              {error && <p className="ss-photo__error" role="alert">{error}</p>}
              <SelfieCapture
                onFile={handleFile}
                title="drop your selfie here"
                detail="JPG, PNG or WebP · max 10 MB · good light, no filters"
                captureLabel="capture selfie"
              />
            </div>
          )}

          {/* Step 2 — wardrobe type */}
          {step === "wardrobe" && (
            <div className="ss-step" key="wardrobe">
              <div className="ss-wardrobe__confirm">
                {photoDataUrl
                  ? <img src={photoDataUrl} alt="your uploaded photo" className="ss-wardrobe__thumb" />
                  : <span className="ss-wardrobe__thumb-placeholder" aria-hidden />
                }
                <span className="ss-wardrobe__confirm-text">
                  <CheckIcon />
                  photo received
                </span>
              </div>
              <h2 className="ss-wardrobe__title">i dress as</h2>
              <p className="ss-wardrobe__sub">We&apos;ll tailor every recommendation to your wardrobe.</p>
              <div className="ss-wardrobe__options" role="radiogroup" aria-label="wardrobe preference">
                {WARDROBE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    role="radio"
                    aria-checked={wardrobeType === opt.value}
                    className={`ss-option${wardrobeType === opt.value ? " ss-option--selected" : ""}`}
                    onClick={() => setWardrobeType(opt.value)}
                  >
                    <span className="ss-option__icon" aria-hidden>{opt.emoji}</span>
                    <span className="ss-option__text">
                      <span className="ss-option__label">{opt.label}</span>
                      <span className="ss-option__sub">{opt.sub}</span>
                    </span>
                    <span className="ss-option__check" aria-hidden><span className="ss-option__check-dot" /></span>
                  </button>
                ))}
              </div>
              <div className="ss-footer">
                <button className="ss-cta" onClick={() => wardrobeType && setStep("occasion")} disabled={!wardrobeType}>
                  next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — occasion */}
          {step === "occasion" && (
            <div className="ss-step" key="occasion">
              <h2 className="ss-wardrobe__title">i mostly dress for</h2>
              <p className="ss-wardrobe__sub">This helps us focus your style recommendations.</p>
              <div className="ss-wardrobe__options" role="radiogroup" aria-label="occasion">
                {OCCASION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    role="radio"
                    aria-checked={occasion === opt.value}
                    className={`ss-option${occasion === opt.value ? " ss-option--selected" : ""}`}
                    onClick={() => setOccasion(opt.value)}
                  >
                    <span className="ss-option__text">
                      <span className="ss-option__label">{opt.label}</span>
                      <span className="ss-option__sub">{opt.sub}</span>
                    </span>
                    <span className="ss-option__check" aria-hidden><span className="ss-option__check-dot" /></span>
                  </button>
                ))}
              </div>
              <div className="ss-footer">
                <button className="ss-cta" onClick={() => occasion && setStep("concern")} disabled={!occasion}>
                  next →
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — style concern */}
          {step === "concern" && (
            <div className="ss-step" key="concern">
              <h2 className="ss-wardrobe__title">my biggest style challenge</h2>
              <p className="ss-wardrobe__sub">We&apos;ll make sure your report addresses this directly.</p>
              <div className="ss-wardrobe__options" role="radiogroup" aria-label="style challenge">
                {CONCERN_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    role="radio"
                    aria-checked={styleConcern === opt.value}
                    className={`ss-option${styleConcern === opt.value ? " ss-option--selected" : ""}`}
                    onClick={() => setStyleConcern(opt.value)}
                  >
                    <span className="ss-option__text">
                      <span className="ss-option__label">{opt.label}</span>
                      <span className="ss-option__sub">{opt.sub}</span>
                    </span>
                    <span className="ss-option__check" aria-hidden><span className="ss-option__check-dot" /></span>
                  </button>
                ))}
              </div>
              <div className="ss-footer">
                <button className="ss-cta" onClick={() => styleConcern && setStep("sections")} disabled={!styleConcern}>
                  next →
                </button>
              </div>
            </div>
          )}

          {/* Step 5 — report sections */}
          {step === "sections" && (
            <div className="ss-step" key="sections">
              <h2 className="ss-wardrobe__title">what should your report include?</h2>
              <p className="ss-wardrobe__sub">All selected by default — tap to remove anything you don&apos;t need.</p>
              <div className="ss-wardrobe__options" role="group" aria-label="report sections">
                {SECTIONS_OPTIONS.map(opt => {
                  const selected = reportSections.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      role="checkbox"
                      aria-checked={selected}
                      className={`ss-option${selected ? " ss-option--selected" : ""}`}
                      onClick={() => setReportSections(prev =>
                        prev.includes(opt.value)
                          ? prev.filter(s => s !== opt.value)
                          : [...prev, opt.value]
                      )}
                    >
                      <span className="ss-option__text">
                        <span className="ss-option__label">{opt.label}</span>
                        <span className="ss-option__sub">{opt.sub}</span>
                      </span>
                      <span className="ss-option__check" aria-hidden><span className="ss-option__check-dot" /></span>
                    </button>
                  );
                })}
              </div>
              <div className="ss-footer">
                <button className="ss-cta" onClick={handleSubmit}>
                  create my report →
                </button>
                <button className="ss-back-link" onClick={() => setStep("photo")}>
                  ← retake photo
                </button>
              </div>
            </div>
          )}

        </main>
      )}
    </div>
  );
}
