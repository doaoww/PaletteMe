"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppChrome } from "@/components/nav/app-chrome";
import { ScanPaywallModal } from "@/components/billing/scan-paywall-modal";
import { loadQuizProfile, type QuizProfile } from "@/lib/quiz/quiz";
import {
  adaptAiScanResultToOutfitScanResult,
  buildOutfitScanFormData,
  parseDetectedColorToken,
  requestAiScanResult,
  type OutfitScanResult,
  type ScanRequestType,
  validateOutfitImage,
} from "@/lib/scan/outfit-scan";
import {
  loadSupabaseQuizProfile,
  saveRestoredQuizProfileToBrowserStorage,
  loadLocalAnalysisResultForProfile,
} from "@/lib/profile/profile-restore";
import type { AnalysisResult } from "@/lib/analysis/analysis";
import { createClient } from "@/lib/db/supabase";
import {
  addWardrobeItem,
  fileToDataUrl,
  scanScoreToMatch,
} from "@/lib/wardrobe/wardrobe-store";
import {
  DEFAULT_WEEKLY_SCAN_CREDITS,
  consumeBrowserScanCredits,
  getBrowserScanCreditState,
  getScanCreditCost,
  refundBrowserScanCredits,
  type ScanCreditState,
} from "@/lib/scan/scan-credits";
import { getScanComingSoonCopy, isScanFeatureEnabled } from "@/lib/scan/scan-feature";
import { prepareImageForUpload } from "@/lib/shared/resize-image";

const SCAN_TYPES: { id: ScanRequestType; title: string; sub: string; tip: string }[] = [
  {
    id: "clothing_item",
    title: "Clothing item",
    sub: "A shirt, dress, jacket, shoes, or accessory",
    tip: "Flat lay or on a hanger. Natural light gives the most accurate color read.",
  },
  {
    id: "outfit",
    title: "Full outfit",
    sub: "A complete look, mirror photo works great",
    tip: "A mirror photo from head to toe works best.",
  },
  {
    id: "makeup",
    title: "Makeup product",
    sub: "Lipstick, blush, foundation, eyeshadow",
    tip: "Place it on a flat surface. Show the packaging or the actual shade.",
  },
  {
    id: "product_screenshot",
    title: "Shopping find",
    sub: "Something you found online and want to buy",
    tip: "Screenshot the product page, including the color you're considering.",
  },
];

type Step = "upload" | "processing" | "result";

const PROCESSING_MSGS = ["Reading colors...", "Matching to your palette...", "Building your verdict..."];

function makeScanThumbnail(file: File, size = 240): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    img.src = objectUrl;
  });
}

export function ScanFlow() {
  const router = useRouter();
  const scanFeatureEnabled = isScanFeatureEnabled();
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [step, setStep] = useState<Step>("upload");
  const [scanType, setScanType] = useState<ScanRequestType>("clothing_item");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<OutfitScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("there");
  const [dragOver, setDragOver] = useState(false);
  const [processingMsg, setProcessingMsg] = useState(PROCESSING_MSGS[0]);
  const [creditState, setCreditState] = useState<ScanCreditState | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanSubtitle, setScanSubtitle] = useState("Scan it before you buy it");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step !== "processing") return;
    let i = 0;
    setProcessingMsg(PROCESSING_MSGS[0]);
    const id = window.setInterval(() => {
      i = (i + 1) % PROCESSING_MSGS.length;
      setProcessingMsg(PROCESSING_MSGS[i]);
    }, 2200);
    return () => window.clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!scanFeatureEnabled) return;

    let cancelled = false;

    async function restoreScanProfile() {
      let nextProfile: QuizProfile | null = null;

      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!cancelled && user?.email) {
            const local = user.email.split("@")[0]?.trim();
            setDisplayName(
              local ? local.charAt(0).toUpperCase() + local.slice(1) : "there"
            );
          }

          if (user) {
            const restored = await loadSupabaseQuizProfile(supabase, user.id);
            if (restored) {
              saveRestoredQuizProfileToBrowserStorage(restored);
              nextProfile = restored.profile;
            }
          }
        } catch {
          nextProfile = null;
        }
      }

      nextProfile ??= loadQuizProfile();
      if (cancelled) return;

      if (!nextProfile) {
        router.replace("/quiz");
        return;
      }

      setProfile(nextProfile);
      setAnalysisResult(loadLocalAnalysisResultForProfile<AnalysisResult>());
    }

    void restoreScanProfile();
    return () => {
      cancelled = true;
    };
  }, [router, scanFeatureEnabled]);

  useEffect(() => {
    if (!scanFeatureEnabled) return;

    setCreditState(getBrowserScanCreditState());
  }, [scanFeatureEnabled]);

  const selectedType = SCAN_TYPES.find((t) => t.id === scanType) ?? SCAN_TYPES[0];

  const handleFile = async (next: File) => {
    let prepared: File;
    try {
      prepared = await prepareImageForUpload(next, 1600, 0.85);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare your photo. Please try a different image.");
      return;
    }

    const validation = validateOutfitImage(prepared);
    if (validation) {
      setError(validation);
      return;
    }

    const creditAttempt = consumeBrowserScanCredits(scanType);
    setCreditState(creditAttempt);
    if (!creditAttempt.ok) {
      setPaywallOpen(true);
      return;
    }

    setFile(prepared);
    setError(null);
    setStep("processing");
    await runScan(prepared);
  };

  const runScan = async (image: File) => {
    if (!profile) return;
    try {
      const effectiveProfile: QuizProfile = analysisResult
        ? {
            ...profile,
            seasonId: analysisResult.seasonId ?? profile.seasonId,
            subSeason: analysisResult.subSeason ?? profile.subSeason,
          }
        : profile;
      const formData = buildOutfitScanFormData({
        file: image,
        scanType,
        profile: effectiveProfile,
      });
      const thumbnailUrl = await makeScanThumbnail(image);
      if (thumbnailUrl) formData.append("imageUrl", thumbnailUrl);
      const data = await requestAiScanResult(formData);
      const scanResult = adaptAiScanResultToOutfitScanResult(data);
      setResult(scanResult);
      setStep("result");
    } catch (err) {
      console.error("[scan] Scan flow failed", err);
      setCreditState(refundBrowserScanCredits(scanType));
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("upload");
    }
  };

  useEffect(() => {
    if (!profile) return;
    const sub = analysisResult?.subSeason ?? profile.subSeason ?? profile.seasonId;
    const subs = [
      `Let's see if this works for your ${sub} palette`,
      "Your palette knows best — let's check",
      "Not sure about that piece? Let's find out",
      "Scan it before you buy it",
    ];
    setScanSubtitle(subs[Math.floor(Math.random() * subs.length)] ?? subs[0]!);
  }, [profile, analysisResult]);

  const tryOpenPaywall = () => {
    const state = creditState ?? getBrowserScanCreditState();
    const cost = getScanCreditCost(scanType);
    if (state.remaining < cost) {
      setPaywallOpen(true);
      return true;
    }
    return false;
  };

  const resetScan = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setStep("upload");
  };

  const subSeason = analysisResult?.subSeason ?? profile?.subSeason ?? profile?.seasonId ?? "palette";
  const remaining = creditState?.remaining ?? DEFAULT_WEEKLY_SCAN_CREDITS;
  const outOfScans = remaining <= 0;

  if (!scanFeatureEnabled) {
    return <ScanComingSoon />;
  }

  if (!profile) {
    return (
      <AppChrome className="app-chrome--scan">
        <div className="app-shell">
          <p style={{ textAlign: "center", padding: 48, fontFamily: "var(--sans)", color: "var(--ink-soft)" }}>
            Loading…
          </p>
        </div>
      </AppChrome>
    );
  }

  return (
    <AppChrome className="app-chrome--scan">
      <div className="app-shell scan-page">
        <ScanPaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />

        <main className="scan-page__main">
          <header className="scan-page__hero">
            <div className="scan-page__hero-copy">
              <p className="scan-page__eyebrow">
                ready to scan, {displayName.toLowerCase()} <span aria-hidden>✦</span>
              </p>
              <h1 className="scan-page__title">
                Scan an item
              </h1>
              <p className="scan-page__subtitle">{scanSubtitle}</p>
            </div>
            <button
              type="button"
              className="scan-page__credits-pill"
              aria-live="polite"
              onClick={() => setPaywallOpen(true)}
            >
              <span aria-hidden>✦</span> {remaining} scans left
            </button>
          </header>

          <section className="scan-page__type-panel" aria-label="Scan type">
            <p className="scan-page__type-label">What are you scanning?</p>
            <div className="scan-page__type-row" role="tablist">
              {SCAN_TYPES.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={scanType === opt.id}
                  className={`scan-page__type-chip${scanType === opt.id ? " scan-page__type-chip--active" : ""}`}
                  onClick={() => setScanType(opt.id)}
                >
                  {opt.title}
                </button>
              ))}
            </div>
          </section>

          <div className="scan-page__workspace">
            <section className="scan-page__upload-col">
              <div
                className={`scan-page__card scan-page__dropzone${dragOver ? " scan-page__dropzone--active" : ""}${outOfScans ? " scan-page__dropzone--locked" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!outOfScans) setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (outOfScans || tryOpenPaywall()) return;
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped) void handleFile(dropped);
                }}
              >
                {!previewUrl ? (
                  <div className="scan-page__dropzone-empty">
                    <span className="scan-page__dropzone-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="7" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M9 7V5.5A2.5 2.5 0 0 1 11.5 3h1A2.5 2.5 0 0 1 15 5.5V7" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    </span>
                    <h2 className="scan-page__dropzone-title">
                      Take a photo or upload from gallery
                    </h2>
                    <p className="scan-page__dropzone-sub">
                      Drag &amp; drop here, or use a button below.
                    </p>
                    <div className="scan-page__dropzone-actions">
                      <button
                        type="button"
                        className="scan-page__primary-btn"
                        onClick={() => {
                          if (tryOpenPaywall()) return;
                          inputRef.current?.click();
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                          <rect x="4" y="7" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                          <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M9 7V5.5A2.5 2.5 0 0 1 11.5 3h1A2.5 2.5 0 0 1 15 5.5V7" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                        Take photo
                      </button>
                      <button
                        type="button"
                        className="scan-page__ghost-btn"
                        onClick={() => {
                          if (tryOpenPaywall()) return;
                          inputRef.current?.click();
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M12 16V4m0 0 4 4m-4-4-4 4M4 18v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        Upload image
                      </button>
                    </div>
                    <p className="scan-page__dropzone-meta">JPG, PNG — clothing, makeup, accessories</p>
                  </div>
                ) : (
                  <div className="scan-page__upload-active">
                    <div className="scan-page__upload-thumb-wrap">
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="Scanned item" className="scan-page__upload-thumb" />
                      ) : null}
                      {step === "processing" ? (
                        <div className="scan-page__upload-thumb-overlay" aria-hidden>
                          <div className="quiz-page__spinner" />
                        </div>
                      ) : null}
                    </div>
                    <div className="scan-page__upload-status">
                      {step === "processing" ? (
                        <>
                          <p className="scan-page__upload-kicker">working</p>
                          <h3 className="scan-page__upload-title scan-page__upload-title--pulse">
                            {processingMsg}
                          </h3>
                          <p className="scan-page__upload-sub">
                            Reading hues, undertone and contrast.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="scan-page__upload-kicker">ready</p>
                          <h3 className="scan-page__upload-title">Your scan is in.</h3>
                          <button type="button" className="scan-page__ghost-btn" onClick={resetScan}>
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                            Try another image
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {outOfScans ? (
                  <div className="scan-page__lock-overlay">
                    <span className="scan-page__lock-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    </span>
                    <h3>You&apos;ve used all your free scans</h3>
                    <p>Unlock more to keep checking pieces before you buy.</p>
                    <button type="button" className="home-hub__scan-cta" onClick={() => setPaywallOpen(true)}>
                      get more scans
                    </button>
                  </div>
                ) : null}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                  const next = e.target.files?.[0];
                  if (next) void handleFile(next);
                }}
              />
              {error ? <p className="quiz-page__inline-error">{error}</p> : null}
            </section>

            <section className="scan-page__result-col">
              {step === "result" && result ? (
                <div className="scan-page__card scan-page__result-card scan-page__result-card--solid">
                  <ReferenceScanResult
                    result={result}
                    scanType={scanType}
                    file={file}
                    onScanAnother={resetScan}
                  />
                </div>
              ) : step === "processing" ? (
                <div className="scan-page__card scan-page__result-card scan-page__result-card--solid">
                  <div className="scan-page__placeholder scan-page__placeholder--loading">
                    <div className="scan-page__skeleton scan-page__skeleton--tiny" aria-hidden />
                    <div className="scan-page__skeleton scan-page__skeleton--title" aria-hidden />
                    <div className="scan-page__skeleton scan-page__skeleton--short" aria-hidden />
                    <div className="scan-page__skeleton scan-page__skeleton--circle" aria-hidden />
                    <div className="scan-page__skeleton scan-page__skeleton--bar" aria-hidden />
                  </div>
                </div>
              ) : (
                <div className="scan-page__card scan-page__result-card">
                  <p className="scan-page__result-kicker">result</p>
                  <h3 className="scan-page__placeholder-title">Your result will appear here</h3>
                  <p className="scan-page__placeholder-sub">
                    <span className="scan-page__placeholder-sub--desktop">
                      Upload an item on the left and we&apos;ll match it against your{" "}
                      <strong>{subSeason}</strong> palette.
                    </span>
                    <span className="scan-page__placeholder-sub--mobile">
                      Upload an item above and we&apos;ll match it against your{" "}
                      <strong>{subSeason}</strong> palette.
                    </span>
                  </p>
                </div>
              )}
            </section>
          </div>

          <p className="scan-page__hint">{selectedType.tip}</p>
        </main>
      </div>
    </AppChrome>
  );
}

function ScanComingSoon() {
  const copy = getScanComingSoonCopy();

  return (
    <AppChrome className="app-chrome--scan">
      <div className="app-shell">
      <main className="app-shell__main">
        <section className="scan-coming-soon" aria-labelledby="scan-coming-soon-title">
          <p className="scan-coming-soon__kicker">{copy.kicker}</p>
          <h1 id="scan-coming-soon-title">{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="scan-coming-soon__grid" aria-label="Planned scan features">
            <span>clothing checks</span>
            <span>outfit verdicts</span>
            <span>makeup shades</span>
            <span>shopping finds</span>
          </div>
          <p className="scan-coming-soon__note">{copy.note}</p>
          <div className="scan-coming-soon__actions">
            <Link href="/profile" className="btn">
              back to my report
            </Link>
            <Link href="/home" className="p2-result__cta-link">
              home
            </Link>
          </div>
        </section>
      </main>
      </div>
    </AppChrome>
  );
}

function scanVerdict(result: OutfitScanResult): { label: string; tone: "yes" | "maybe" | "no" } {
  if (result.verdict === "great") return { label: "Works for you", tone: "yes" };
  if (result.verdict === "works_with_styling") return { label: "Works with styling", tone: "maybe" };
  if (result.verdict === "skip_buying") return { label: "Skip buying", tone: "no" };
  if (result.verdict === "unclear") return { label: "Needs clearer photo", tone: "maybe" };

  const score = result.score;
  const scaled = score / 10;
  if (scaled >= 7.5) return { label: "Works for you", tone: "yes" };
  if (scaled >= 5) return { label: "Maybe, with adjustments", tone: "maybe" };
  return { label: "Skip this one", tone: "no" };
}

function buySkipVerdict(result: OutfitScanResult): { action: "buy" | "skip"; reason: string } {
  const verdict = scanVerdict(result);
  const reason = result.reason?.trim() || result.suggestion?.trim() || "Based on your palette match.";
  if (verdict.tone === "yes") {
    return { action: "buy", reason };
  }
  return { action: "skip", reason };
}

function ReferenceScanResult({
  result,
  scanType,
  file,
  onScanAnother,
}: {
  result: OutfitScanResult;
  scanType: ScanRequestType;
  file: File | null;
  onScanAnother: () => void;
}) {
  const verdict = buySkipVerdict(result);
  const isYes = verdict.action === "buy";
  const matchPct = Math.round(result.score);
  const parsedColor = parseDetectedColorToken(result.dominant_colors[0]);
  const [saved, setSaved] = useState(false);

  const saveToWardrobe = async () => {
    if (!file || scanType === "makeup" || scanType === "product_screenshot") return;
    const imageDataUrl = await fileToDataUrl(file);
    addWardrobeItem({
      category: scanType === "outfit" ? "Outfit" : "Top",
      color: parsedColor.name,
      paletteMatch: scanScoreToMatch(result.score),
      imageDataUrl,
    });
    setSaved(true);
  };

  return (
    <article className="scan-ref-result">
      <div className={`scan-ref-result__head scan-ref-result__head--${isYes ? "yes" : "skip"}`}>
        <span className="scan-ref-result__badge" aria-hidden>
          {isYes ? (
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 12l4 4L19 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          )}
        </span>
        <h3 className="scan-ref-result__verdict">
          {isYes ? "YES — this works for you" : "SKIP — doesn't suit your palette"}
        </h3>
      </div>

      <p className="scan-ref-result__reason">{verdict.reason}</p>

      <div className="scan-ref-result__color">
        <span
          className="scan-ref-result__swatch"
          style={{ background: parsedColor.hex ?? "var(--blush)" }}
          aria-hidden
        />
        <div className="scan-ref-result__color-copy">
          <p className="scan-ref-result__color-kicker">color detected</p>
          <p className="scan-ref-result__color-name">{parsedColor.name}</p>
        </div>
        {parsedColor.hex ? (
          <code className="scan-ref-result__color-hex">{parsedColor.hex}</code>
        ) : null}
      </div>

      <div className="scan-ref-result__match">
        <div className="scan-ref-result__match-top">
          <span>match with your palette</span>
          <strong>{matchPct}%</strong>
        </div>
        <div className="scan-ref-result__match-bar" aria-hidden>
          <span style={{ width: `${matchPct}%` }} />
        </div>
      </div>

      {result.suggestion ? (
        <p className="scan-ref-result__tip">{result.suggestion}</p>
      ) : null}

      <div className="scan-ref-result__actions">
        <button type="button" className="home-hub__scan-cta" onClick={onScanAnother}>
          scan another
        </button>
        {(scanType === "clothing_item" || scanType === "outfit") && file ? (
          <button
            type="button"
            className="scan-page__ghost-btn"
            disabled={saved}
            onClick={() => void saveToWardrobe()}
          >
            {saved ? "saved to wardrobe" : "save this result"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
