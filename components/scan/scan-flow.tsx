"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SelfieCapture } from "@/components/selfie/selfie-capture";
import { BottomNav } from "@/components/nav/bottom-nav";
import { loadQuizProfile, type QuizProfile } from "@/lib/quiz";
import {
  SCAN_API_ENDPOINT,
  adaptAiScanResultToOutfitScanResult,
  buildOutfitScanFormData,
  formatScanHistoryItems,
  requestAiScanResult,
  type OutfitScanResult,
  type ScanHistoryApiRecord,
  type ScanHistoryItemForUi,
  type ScanRequestType,
  validateOutfitImage,
} from "@/lib/outfit-scan";
import {
  loadSupabaseQuizProfile,
  saveRestoredQuizProfileToBrowserStorage,
} from "@/lib/profile-restore";
import { createClient } from "@/lib/supabase";
import { QuizStepHead } from "@/components/quiz/quiz-picker";
import {
  addWardrobeItem,
  fileToDataUrl,
  scanScoreToMatch,
} from "@/lib/wardrobe-store";
import {
  DEFAULT_WEEKLY_SCAN_CREDITS,
  consumeBrowserScanCredits,
  getBrowserScanCreditState,
  getScanCreditCost,
  refundBrowserScanCredits,
  type ScanCreditState,
} from "@/lib/scan-credits";
import { getScanComingSoonCopy, isScanFeatureEnabled } from "@/lib/scan-feature";

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

type Step = "type" | "upload" | "processing" | "result";

const PROCESSING_MSGS = ["Reading colors...", "Matching to your palette...", "Building your verdict..."];

export function ScanFlow() {
  const router = useRouter();
  const scanFeatureEnabled = isScanFeatureEnabled();
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [step, setStep] = useState<Step>("type");
  const [scanType, setScanType] = useState<ScanRequestType>("clothing_item");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<OutfitScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItemForUi[]>([]);
  const [processingMsg, setProcessingMsg] = useState(PROCESSING_MSGS[0]);
  const [creditState, setCreditState] = useState<ScanCreditState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refreshScanHistory = useCallback(async () => {
    if (!scanFeatureEnabled) return;

    try {
      const res = await fetch(SCAN_API_ENDPOINT);
      if (!res.ok) {
        setScanHistory([]);
        return;
      }
      const data = (await res.json()) as { scans?: ScanHistoryApiRecord[] };
      setScanHistory(formatScanHistoryItems(data.scans ?? []));
    } catch {
      setScanHistory([]);
    }
  }, [scanFeatureEnabled]);

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
          if (!cancelled) setIsSignedIn(Boolean(user));

          if (user) {
            const restored = await loadSupabaseQuizProfile(supabase, user.id);
            if (restored) {
              saveRestoredQuizProfileToBrowserStorage(restored);
              nextProfile = restored.profile;
            }
          }
        } catch {
          if (!cancelled) setIsSignedIn(false);
          nextProfile = null;
        }
      } else if (!cancelled) {
        setIsSignedIn(false);
      }

      nextProfile ??= loadQuizProfile();
      if (cancelled) return;

      if (!nextProfile) {
        router.replace("/quiz");
        return;
      }

      setProfile(nextProfile);
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

  useEffect(() => {
    if (!scanFeatureEnabled) return;

    if (!isSignedIn) {
      setScanHistory([]);
      return;
    }

    void refreshScanHistory();
  }, [isSignedIn, refreshScanHistory, scanFeatureEnabled]);

  const selectedType = SCAN_TYPES.find((t) => t.id === scanType) ?? SCAN_TYPES[0];

  const handleFile = async (next: File) => {
    const validation = validateOutfitImage(next);
    if (validation) {
      setError(validation);
      return;
    }

    const creditAttempt = consumeBrowserScanCredits(scanType);
    setCreditState(creditAttempt);
    if (!creditAttempt.ok) {
      setError(creditAttempt.message ?? "Your free weekly style checks are used for this week.");
      return;
    }

    setFile(next);
    setError(null);
    setStep("processing");
    await runScan(next);
  };

  const runScan = async (image: File) => {
    if (!profile) return;
    try {
      const formData = buildOutfitScanFormData({
        file: image,
        scanType,
        profile,
      });
      const data = await requestAiScanResult(formData);
      setResult(adaptAiScanResultToOutfitScanResult(data));
      setStep("result");
      if (isSignedIn) void refreshScanHistory();
    } catch (err) {
      console.error("[scan] Scan flow failed", err);
      setCreditState(refundBrowserScanCredits(scanType));
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("upload");
    }
  };

  if (!scanFeatureEnabled) {
    return <ScanComingSoon />;
  }

  if (!profile) {
    return (
      <div className="app-shell">
        <p style={{ textAlign: "center", padding: 48, fontFamily: "var(--sans)", color: "var(--ink-soft)" }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-topbar glass-nav">
        <Link href="/home" className="wordmark app-topbar__wordmark">
          palette<span className="me">me</span>
        </Link>
        <span className="app-chip app-chip--pink">
          {creditState ? `${creditState.remaining}/${creditState.allowance} weekly` : "scan"}
        </span>
      </header>

      <main className="app-shell__main">
        {step === "type" && (
          <>
            <QuizStepHead kicker="scan" title="What are you scanning?" />
            <div className="scan-type-grid">
              {SCAN_TYPES.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`scan-type-card${scanType === opt.id ? " scan-type-card--selected" : ""}`}
                  onClick={() => setScanType(opt.id)}
                >
                  <span className="scan-type-card__title">{opt.title}</span>
                  <span className="scan-type-card__sub">{opt.sub}</span>
                  <span className="scan-type-card__credit">
                    {getScanCreditCost(opt.id)} {getScanCreditCost(opt.id) === 1 ? "credit" : "credits"}
                  </span>
                </button>
              ))}
            </div>
            <CreditBank state={creditState} />
            <button type="button" className="btn" style={{ width: "100%", marginTop: 20 }} onClick={() => setStep("upload")}>
              continue
            </button>
          </>
        )}

        {step === "upload" && (
          <>
            <QuizStepHead kicker="upload" title={`Upload your ${selectedType.title.toLowerCase()}`} />
            <SelfieCapture
              onFile={handleFile}
              maxWidth={720}
              title="Take photo or upload"
              cameraFacingMode="environment"
              captureLabel="capture item"
              capturedFilePrefix="paletteme-scan"
              detail="JPG, PNG, or WebP · max 10 MB"
            />
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
            <p className="scan-tip">{selectedType.tip}</p>
            <CreditBank state={creditState} cost={getScanCreditCost(scanType)} />
            {error ? <p className="quiz-page__inline-error">{error}</p> : null}
            {isSignedIn ? <ScanHistoryList items={scanHistory} /> : null}
            <button type="button" className="quiz__redo" onClick={() => setStep("type")}>
              change scan type
            </button>
          </>
        )}

        {step === "processing" && (
          <div className="quiz-page__panel on quiz-page__calculating" style={{ display: "block" }}>
            <div className="quiz-page__spinner" />
            <p className="quiz-page__wait">{processingMsg}</p>
          </div>
        )}

        {step === "result" && result && (
          <>
            <ScanResultView result={result} scanType={scanType} file={file} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              <button
                type="button"
                className="btn"
                style={{ width: "100%" }}
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setStep("type");
                }}
              >
                scan something else
              </button>
              <Link href="/home" className="p2-result__cta-link" style={{ textAlign: "center" }}>
                back to home
              </Link>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function ScanComingSoon() {
  const copy = getScanComingSoonCopy();

  return (
    <div className="app-shell">
      <header className="app-topbar glass-nav">
        <Link href="/home" className="wordmark app-topbar__wordmark">
          palette<span className="me">me</span>
        </Link>
        <span className="app-chip app-chip--pink">soon</span>
      </header>

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

      <BottomNav />
    </div>
  );
}

function CreditBank({
  state,
  cost,
}: {
  state: ScanCreditState | null;
  cost?: number;
}) {
  const remaining = state?.remaining ?? DEFAULT_WEEKLY_SCAN_CREDITS;
  const allowance = state?.allowance ?? DEFAULT_WEEKLY_SCAN_CREDITS;
  const width = `${Math.round((remaining / allowance) * 100)}%`;

  return (
    <aside className="scan-credit-bank" aria-label="Weekly scan credits">
      <div className="scan-credit-bank__top">
        <span>weekly style checks</span>
        <strong>{remaining} left</strong>
      </div>
      <div className="scan-credit-bank__bar" aria-hidden>
        <span style={{ width }} />
      </div>
      <p>
        {cost
          ? `This scan uses ${cost} ${cost === 1 ? "credit" : "credits"}. Credits refresh every week.`
          : "Your first weekly checks are free while we test accuracy. Later, heavier usage may move to scan packs or Pro."}
      </p>
    </aside>
  );
}

function ScanHistoryList({ items }: { items: ScanHistoryItemForUi[] }) {
  if (items.length === 0) return null;

  return (
    <>
      {items.map((item) => (
        <article key={item.id} className="scan-result">
          {item.thumbnailUrl && (
            <div className="wardrobe-card__img" style={{ width: 72, marginBottom: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.thumbnailUrl} alt={`${item.scanTypeLabel} scan`} />
            </div>
          )}
          <span className={`scan-result__badge scan-result__badge--${item.verdictTone}`}>
            {item.verdictLabel}
          </span>
          <p className="scan-result__score">{item.scoreText}</p>
          <h3 className="scan-result__heading">{item.scanTypeLabel}</h3>
          <p className="p2-result__prose">{item.dateScanned}</p>
        </article>
      ))}
    </>
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

function ScanResultView({
  result,
  scanType,
  file,
}: {
  result: OutfitScanResult;
  scanType: ScanRequestType;
  file: File | null;
}) {
  const score10 = (result.score / 10).toFixed(1);
  const verdict = scanVerdict(result);
  const [saved, setSaved] = useState(false);

  const saveToWardrobe = async () => {
    if (!file || scanType === "makeup" || scanType === "product_screenshot") return;
    const imageDataUrl = await fileToDataUrl(file);
    const dominant = result.dominant_colors[0] ?? "Detected color";
    addWardrobeItem({
      category: scanType === "outfit" ? "Outfit" : "Top",
      color: dominant,
      paletteMatch: scanScoreToMatch(result.score),
      imageDataUrl,
    });
    setSaved(true);
  };

  return (
    <div className="scan-result">
      <span className={`scan-result__badge scan-result__badge--${verdict.tone}`}>
        {verdict.label}
      </span>
      <p className="scan-result__score">{score10} / 10</p>
      {result.confidence != null ? (
        <p className="p2-result__prose">Confidence: {result.confidence}%</p>
      ) : null}
      <h3 className="scan-result__heading">Why</h3>
      <p className="p2-result__prose">{result.reason}</p>
      <h3 className="scan-result__heading">What to change</h3>
      <p className="p2-result__prose">{result.suggestion}</p>
      {result.dominant_colors.length > 0 && (
        <>
          <h3 className="scan-result__heading">Color read</h3>
          <div className="scan-result__alts">
            {result.dominant_colors.slice(0, 3).map((c) => (
              <span key={c} className="app-chip">
                {c}
              </span>
            ))}
          </div>
        </>
      )}
      {result.stylingTips.length > 0 && (
        <>
          <h3 className="scan-result__heading">Styling tips</h3>
          <div className="scan-result__alts">
            {result.stylingTips.slice(0, 3).map((tip) => (
              <span key={tip} className="app-chip">
                {tip}
              </span>
            ))}
          </div>
        </>
      )}
      {result.betterAlternatives.length > 0 && (
        <>
          <h3 className="scan-result__heading">Better alternatives</h3>
          <div className="scan-result__alts">
            {result.betterAlternatives.slice(0, 3).map((alternative) => (
              <span key={alternative} className="app-chip">
                {alternative}
              </span>
            ))}
          </div>
        </>
      )}
      {(scanType === "clothing_item" || scanType === "outfit") && file && (
        <button
          type="button"
          className="btn btn--ghost"
          style={{ width: "100%", marginTop: 16 }}
          disabled={saved}
          onClick={() => void saveToWardrobe()}
        >
          {saved ? "saved to wardrobe" : "save to wardrobe"}
        </button>
      )}
    </div>
  );
}
