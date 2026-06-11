"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/analysis";
import {
  applyAnswer,
  buildQuizProfile,
  clearQuizProfile,
  deriveBodyType,
  deriveStyleVector,
  emptyScores,
  saveQuizProfile,
  toggleTrend,
  type QuizProfile,
  type QuizScores,
} from "@/lib/quiz";
import {
  CONTRAST_OPTIONS,
  EYE_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_NATURAL_OPTIONS,
  INTENSITY_OPTIONS,
  METAL_OPTIONS,
  SHOULDER_HIP_OPTIONS,
  STYLE_PAIRS,
  SUN_OPTIONS,
  TREND_OPTIONS,
  VEIN_OPTIONS,
  WAIST_OPTIONS,
  WEIGHT_GAIN_OPTIONS,
  WHITE_TEST_OPTIONS,
  type QuizAnswers,
  type StyleSwipePick,
} from "@/lib/quiz-data";
import { resizeImageForAnalysis } from "@/lib/resize-image";
import { SEASONS } from "@/lib/landing-data";

// ─── Step type ────────────────────────────────────────────────────────────

type Step =
  | "intro"
  | "color-entry"
  | "color-selfie"
  | "color-analyzing"
  | "color-q-vein"
  | "color-q-metals"
  | "color-q-sun"
  | "color-q-hair-natural"
  | "color-q-hair-color"
  | "color-q-eyes"
  | "color-q-white"
  | "color-q-contrast"
  | "color-q-vivid"
  | "color-result"
  | "body-shoulders"
  | "body-waist"
  | "body-weight"
  | "style-0"
  | "style-1"
  | "style-2"
  | "style-3"
  | "style-4"
  | "style-5";

type ColorResult = {
  seasonId: "spring" | "summer" | "autumn" | "winter";
  seasonName: string;
  undertoneHint: "warm" | "cool" | "neutral";
  subSeason?: string;
  palette: string[];
  fromSelfie: boolean;
};

const STEP_PCT: Record<Step, number> = {
  intro: 0,
  "color-entry": 5,
  "color-selfie": 10,
  "color-analyzing": 18,
  "color-q-vein": 8,
  "color-q-metals": 12,
  "color-q-sun": 16,
  "color-q-hair-natural": 20,
  "color-q-hair-color": 23,
  "color-q-eyes": 26,
  "color-q-white": 28,
  "color-q-contrast": 30,
  "color-q-vivid": 32,
  "color-result": 33,
  "body-shoulders": 45,
  "body-waist": 55,
  "body-weight": 64,
  "style-0": 68,
  "style-1": 74,
  "style-2": 80,
  "style-3": 85,
  "style-4": 90,
  "style-5": 96,
};

function stepPhaseLabel(step: Step): string {
  if (step === "intro") return "";
  if (step.startsWith("color")) return "1 of 3 · color";
  if (step.startsWith("body")) return "2 of 3 · body";
  if (step.startsWith("style")) return "3 of 3 · style";
  return "";
}

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

// ─── Component ────────────────────────────────────────────────────────────

export function QuizFlow() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [scores, setScores] = useState<QuizScores>(emptyScores());
  const [colorResult, setColorResult] = useState<ColorResult | null>(null);
  const [stylePicks, setStylePicks] = useState<StyleSwipePick[]>([]);

  // Selfie state
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
  const [selfieError, setSelfieError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const progress = STEP_PCT[step] ?? 0;

  // ── Helpers ──────────────────────────────────────────────────────────

  const resetAll = () => {
    clearQuizProfile();
    setAnswers({});
    setScores(emptyScores());
    setColorResult(null);
    setStylePicks([]);
    setSelfieFile(null);
    if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
    setSelfiePreviewUrl(null);
    setSelfieError(null);
    setStep("intro");
  };

  const handleFile = useCallback(
    async (next: File) => {
      if (!ACCEPT.split(",").includes(next.type)) {
        setSelfieError("Only JPG, PNG, or WebP images are supported.");
        return;
      }
      if (next.size > MAX_BYTES) {
        setSelfieError("Image must be 10 MB or smaller.");
        return;
      }
      setSelfieError(null);
      const prepared = await resizeImageForAnalysis(next);
      if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
      setSelfieFile(prepared);
      setSelfiePreviewUrl(URL.createObjectURL(prepared));
      setStep("color-selfie");
    },
    [selfiePreviewUrl]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const analyzeSelfie = async () => {
    if (!selfieFile) return;
    setStep("color-analyzing");
    setSelfieError(null);
    const formData = new FormData();
    formData.append("image", selfieFile);
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      const result = data.result as AnalysisResult;
      setColorResult({
        seasonId: result.seasonId,
        seasonName: result.season.name,
        undertoneHint: result.traits.undertone,
        subSeason: result.subSeason,
        palette: result.season.palette,
        fromSelfie: true,
      });
      setStep("color-result");
    } catch (err) {
      setSelfieError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setStep("color-selfie");
    }
  };

  const finishColorQuiz = (nextAnswers: QuizAnswers, nextScores: QuizScores) => {
    const sorted = Object.entries(nextScores).sort(([, a], [, b]) => b - a);
    const winner = SEASONS.find((s) => s.id === sorted[0][0]) ?? SEASONS[0];
    const seasonId = winner.id as "spring" | "summer" | "autumn" | "winter";
    const vein = VEIN_OPTIONS.find((o) => o.id === nextAnswers.veinColor);
    const sun = SUN_OPTIONS.find((o) => o.id === nextAnswers.sunReaction);
    const undertone = vein?.undertone ?? sun?.undertone ?? "neutral";
    setColorResult({
      seasonId,
      seasonName: winner.name,
      undertoneHint: undertone,
      palette: winner.palette,
      fromSelfie: false,
    });
    setStep("color-result");
  };

  const finishStyle = (finalPicks: StyleSwipePick[]) => {
    if (!colorResult) return;
    const finalAnswers = { ...answers };
    const profile: QuizProfile = buildQuizProfile(
      finalAnswers,
      scores,
      {
        seasonId: colorResult.seasonId,
        seasonName: colorResult.seasonName,
        undertoneHint: colorResult.undertoneHint,
        bodyType: deriveBodyType(finalAnswers),
        styleVector: deriveStyleVector(finalPicks),
        subSeason: colorResult.subSeason,
      }
    );
    saveQuizProfile(profile);
    router.push("/profile");
  };

  const pickStyle = (pick: StyleSwipePick, index: number) => {
    const next = [...stylePicks];
    next[index] = pick;
    setStylePicks(next);

    if (index < 5) {
      setStep(`style-${index + 1}` as Step);
    } else {
      finishStyle(next);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="quiz-page">
      <header className="quiz-page__bar">
        <Link href="/" className="wordmark quiz-page__logo">
          palette<span className="me">me</span>
        </Link>
        <div className="quiz-page__track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="quiz-page__step">{stepPhaseLabel(step)}</span>
      </header>

      <main className="quiz-page__main">

        {/* ── INTRO ── */}
        {step === "intro" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">personal color onboarding</p>
            <h1 className="quiz-page__title">
              Find the colors that make <span className="scr">you</span> glow
            </h1>
            <p className="quiz-page__lead">
              Three quick steps — color season, body type, and style. Upload a
              selfie or answer a few questions. Done in under 3 minutes.
            </p>
            <div className="quiz__steps-preview">
              {["1 · color season", "2 · body type", "3 · style swipe"].map((s) => (
                <span key={s} className="quiz__step-chip">{s}</span>
              ))}
            </div>
            <button type="button" className="btn quiz-page__start" onClick={() => setStep("color-entry")}>
              start
            </button>
          </div>
        )}

        {/* ── PHASE 1: COLOR ENTRY ── */}
        {step === "color-entry" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 1 of 3 · color season</p>
            <h2 className="quiz__qt">Upload a selfie to reveal your season</h2>
            <p className="quiz-page__selfie-lead">
              Natural light, no filters. We analyze your skin, hair and eye
              contrast — then match you to one of 12 seasonal types.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            <div
              role="button"
              tabIndex={0}
              className={`quiz-page__drop${dragOver ? " quiz-page__drop--over" : ""}`}
              style={{ maxWidth: 360 }}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <div className="quiz-page__drop-empty">
                <span className="quiz-page__drop-icon">📸</span>
                <p>Drop your selfie here, or <span style={{ color: "var(--pink)" }}>click to browse</span></p>
                <small>JPG, PNG · max 10 MB · natural light, no filters</small>
              </div>
            </div>

            {selfieError && (
              <p style={{ marginTop: 12, fontFamily: "var(--sans)", fontSize: "0.85rem", color: "var(--pink)" }}>
                {selfieError}
              </p>
            )}

            <button
              type="button"
              className="quiz__redo"
              style={{ marginTop: 24 }}
              onClick={() => setStep("color-q-vein")}
            >
              answer questions instead →
            </button>
          </div>
        )}

        {/* ── SELFIE PREVIEW ── */}
        {step === "color-selfie" && selfiePreviewUrl && (
          <div className="quiz-page__panel on" style={{ textAlign: "center" }}>
            <p className="quiz__qn">step 1 of 3 · color season</p>
            <h2 className="quiz__qt">Looking good — ready to analyze?</h2>

            <div className="quiz-page__drop" style={{ maxWidth: 300, margin: "0 auto 24px" }}>
              <div className="quiz-page__drop-preview">
                <Image src={selfiePreviewUrl} alt="Your selfie" fill className="object-cover" unoptimized />
              </div>
            </div>

            {selfieError && (
              <p style={{ marginBottom: 16, fontFamily: "var(--sans)", fontSize: "0.85rem", color: "var(--pink)" }}>
                {selfieError}
              </p>
            )}

            <button type="button" className="btn quiz-page__cta" onClick={analyzeSelfie}>
              analyze my colors
            </button>
            <button
              type="button"
              className="quiz__redo"
              onClick={() => { setSelfieFile(null); setSelfiePreviewUrl(null); setStep("color-entry"); }}
            >
              choose a different photo
            </button>
          </div>
        )}

        {/* ── ANALYZING ── */}
        {step === "color-analyzing" && (
          <div className="quiz-page__panel on quiz-page__calculating">
            <div className="quiz-page__spinner" />
            <p className="quiz-page__wait">Analyzing your coloring…</p>
            <p className="quiz-page__calc-msg">
              Reading undertone, contrast, and depth. This takes about 10 seconds.
            </p>
          </div>
        )}

        {/* ── QUIZ: VEIN COLOR ── */}
        {step === "color-q-vein" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 1 of 3 · color season · q1</p>
            <h2 className="quiz__qt">Look at the veins on your wrist. What color are they?</h2>
            <div className="quiz__opts quiz__opts--stack">
              {VEIN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt"
                  onClick={() => {
                    const next = { ...answers, veinColor: opt.id };
                    setAnswers(next);
                    setScores((s) => applyAnswer(s, opt.scores));
                    setStep("color-q-metals");
                  }}
                >
                  <span className="sw" style={{ background: opt.swatch }} />
                  <span>
                    {opt.label}
                    <small>{opt.sub}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ: METALS ── */}
        {step === "color-q-metals" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 1 of 3 · color season · q2</p>
            <h2 className="quiz__qt">Which metal looks better against your skin?</h2>
            <div className="quiz__opts">
              {METAL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, metalPref: opt.id }));
                    setScores((s) => applyAnswer(s, opt.scores));
                    setStep("color-q-sun");
                  }}
                >
                  <span className="sw" style={{ background: opt.swatch }} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ: SUN ── */}
        {step === "color-q-sun" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 1 of 3 · color season · q3</p>
            <h2 className="quiz__qt">How does your skin react to the sun?</h2>
            <div className="quiz__opts quiz__opts--stack">
              {SUN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, sunReaction: opt.id }));
                    setScores((s) => applyAnswer(s, opt.scores));
                    setStep("color-q-hair-natural");
                  }}
                >
                  <span className="quiz-page__opt-emoji">{opt.emoji}</span>
                  <span>
                    {opt.label}
                    <small>{opt.hint}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ: HAIR NATURAL? ── */}
        {step === "color-q-hair-natural" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 1 of 3 · color season · q4</p>
            <h2 className="quiz__qt">Is your current hair color natural?</h2>
            <div className="quiz__opts">
              {HAIR_NATURAL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, naturalHair: opt.id }));
                    setStep(opt.id === "no" ? "color-q-hair-color" : "color-q-eyes");
                  }}
                >
                  <span className="quiz-page__opt-emoji">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ: HAIR COLOR ── */}
        {step === "color-q-hair-color" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 1 of 3 · color season · q4b</p>
            <h2 className="quiz__qt">My natural hair is closest to:</h2>
            <div className="quiz__opts">
              {HAIR_COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, naturalHairColor: opt.id }));
                    setScores((s) => applyAnswer(s, opt.scores));
                    setStep("color-q-eyes");
                  }}
                >
                  <span className="sw" style={{ background: opt.swatch }} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ: EYES ── */}
        {step === "color-q-eyes" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 1 of 3 · color season · q5</p>
            <h2 className="quiz__qt">What family does your eye color fall into?</h2>
            <div className="quiz__opts quiz__opts--stack">
              {EYE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, eyeFamily: opt.id }));
                    setScores((s) => applyAnswer(s, opt.scores));
                    setStep("color-q-white");
                  }}
                >
                  <span>
                    {opt.label}
                    {opt.sub && <small>{opt.sub}</small>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ: WHITE TEST ── */}
        {step === "color-q-white" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 1 of 3 · color season · q6</p>
            <h2 className="quiz__qt">Hold these near your face. Which background makes your skin glow?</h2>
            <div className="quiz__opts quiz__opts--stack">
              {WHITE_TEST_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, whitePref: opt.id }));
                    setScores((s) => applyAnswer(s, opt.scores));
                    setStep("color-q-contrast");
                  }}
                >
                  <span
                    className="sw"
                    style={{
                      background: opt.id === "white" ? "#FFFFFF" : "#FBF1E4",
                      border: "1px solid rgba(255,255,255,0.4)",
                    }}
                  />
                  <span>
                    {opt.label}
                    <small>{opt.sub}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ: CONTRAST ── */}
        {step === "color-q-contrast" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 1 of 3 · color season · q7</p>
            <h2 className="quiz__qt">How would you describe the contrast of your natural coloring?</h2>
            <div className="quiz__opts quiz__opts--stack">
              {CONTRAST_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, contrastPref: opt.id }));
                    setScores((s) => applyAnswer(s, opt.scores));
                    setStep("color-q-vivid");
                  }}
                >
                  <span>
                    {opt.label}
                    <small>{opt.sub}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ: VIVID VS MUTED ── */}
        {step === "color-q-vivid" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 1 of 3 · color season · q8</p>
            <h2 className="quiz__qt">Which feels more like you?</h2>
            <div className="quiz__opts quiz__opts--stack">
              {INTENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt"
                  onClick={() => {
                    const nextAnswers = { ...answers, intensityPref: opt.id };
                    const nextScores = applyAnswer(scores, opt.scores);
                    setAnswers(nextAnswers);
                    setScores(nextScores);
                    finishColorQuiz(nextAnswers, nextScores);
                  }}
                >
                  <span>
                    {opt.label}
                    <small>{opt.sub}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── COLOR RESULT ── */}
        {step === "color-result" && colorResult && (
          <div className="quiz-page__panel on quiz-page__result">
            <p className="quiz__qn">
              {colorResult.fromSelfie ? "your season · from selfie" : "your season · from quiz"}
            </p>
            <h2 className="quiz__result-name">
              <span className="scr">{colorResult.seasonName}</span>
            </h2>
            {colorResult.subSeason && (
              <p className="quiz-page__traits">{colorResult.subSeason}</p>
            )}
            <div className="quiz__result-pal">
              {colorResult.palette.map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </div>
            <p className="quiz-page__result-copy">
              {colorResult.fromSelfie
                ? "Your selfie confirmed your season. Now let's find your best silhouettes."
                : "Your answers point to this season. Upload a selfie later to confirm."}
            </p>
            <button
              type="button"
              className="btn quiz-page__cta"
              onClick={() => setStep("body-shoulders")}
            >
              continue — body type →
            </button>
          </div>
        )}

        {/* ── PHASE 2: BODY — SHOULDERS ── */}
        {step === "body-shoulders" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 2 of 3 · body type · q1</p>
            <h2 className="quiz__qt">Comparing your shoulders and hips — which is wider?</h2>
            <div className="quiz__opts quiz__opts--stack">
              {SHOULDER_HIP_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt quiz__opt--tall"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, shoulderHipRatio: opt.id }));
                    setStep("body-waist");
                  }}
                >
                  <span>
                    {opt.label}
                    <small>{opt.sub}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PHASE 2: BODY — WAIST ── */}
        {step === "body-waist" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 2 of 3 · body type · q2</p>
            <h2 className="quiz__qt">How would you describe your waist?</h2>
            <div className="quiz__opts quiz__opts--stack">
              {WAIST_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt quiz__opt--tall"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, waistDefinition: opt.id }));
                    setStep("body-weight");
                  }}
                >
                  <span>
                    {opt.label}
                    <small>{opt.sub}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PHASE 2: BODY — WEIGHT GAIN ── */}
        {step === "body-weight" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 2 of 3 · body type · q3</p>
            <h2 className="quiz__qt">When you gain weight, where does it go first?</h2>
            <div className="quiz__opts quiz__opts--stack">
              {WEIGHT_GAIN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt quiz__opt--tall"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, weightGain: opt.id }));
                    setStep("style-0");
                  }}
                >
                  <span>
                    {opt.label}
                    <small>{opt.sub}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PHASE 3: STYLE SWIPE ── */}
        {(["style-0", "style-1", "style-2", "style-3", "style-4", "style-5"] as Step[]).map((s) => {
          const idx = parseInt(s.replace("style-", ""));
          const pair = STYLE_PAIRS[idx];
          if (!pair || step !== s) return null;
          return (
            <div key={s} className="quiz-page__panel on">
              <p className="quiz__qn">step 3 of 3 · style · {idx + 1} of 6</p>
              <h2 className="quiz__qt">Which outfit speaks to you more?</h2>
              <div className="quiz-page__swipe-grid">
                {(["a", "b"] as const).map((pick) => {
                  const side = pair[pick];
                  return (
                    <button
                      key={pick}
                      type="button"
                      className="quiz-page__swipe-card"
                      onClick={() => pickStyle(pick, idx)}
                    >
                      <div className="quiz-page__swipe-img">
                        <Image
                          src={side.image}
                          alt={side.label}
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="200px"
                        />
                      </div>
                      <div className="quiz-page__swipe-label">
                        <strong>{side.label}</strong>
                        <span>{side.sub}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

      </main>
    </div>
  );
}
