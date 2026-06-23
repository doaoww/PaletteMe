"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildQuizProfile,
  deriveBodyType,
  deriveStyleVectorFromAnswers,
  loadQuizProfile,
  saveQuizProfile,
  saveQuizToLocalStorage,
  saveQuizToSupabase,
} from "@/lib/quiz";
import {
  AESTHETIC_OPTIONS,
  BUDGET_PREF_OPTIONS,
  MAKEUP_PREF_OPTIONS,
  OCCASION_OPTIONS,
  STYLE_CHALLENGE_OPTIONS,
  STYLE_DIRECTION_OPTIONS,
  STYLE_MOOD_OPTIONS,
  WARDROBE_TYPE_SIMPLE_OPTIONS,
  type Aesthetic,
  type OccasionPref,
  type QuizAnswers,
  type StyleDirection,
  type StyleMood,
  type WardrobeType,
} from "@/lib/quiz-data";
import { getBodyShapeScreenOptions } from "@/components/quiz/body-shape-silhouettes";
import {
  BodyShapeCard,
  QuizCardButton,
  QuizCardList,
  QuizChip,
  QuizFooter,
  QuizRadioCard,
  QuizRadioList,
  QuizStepHead,
  WeatherStatCards,
} from "@/components/quiz/quiz-picker";
import {
  detectCityAndWeather,
  fetchWeatherForCity,
  type LocationWeather,
} from "@/lib/quiz-location";
import { SelfieCapture } from "@/components/selfie/selfie-capture";

// ── Step definitions ───────────────────────────────────────────────────────────

type StyleStep =
  // Photo steps (before the quiz — not counted in 10-question limit)
  | "face-photo"
  | "body-photo"
  // Quiz questions 1–10
  | "wardrobe-type"
  | "style-challenge"
  | "measurements"
  | "body-shape"
  | "style-direction"
  | "occasions"
  | "makeup"
  | "budget"
  | "style-mood"
  | "location"
  // Post-quiz aesthetic selection (not counted in 10-question limit)
  | "aesthetic";

const PHOTO_STEPS: StyleStep[] = ["face-photo", "body-photo"];

const QUIZ_STEPS: StyleStep[] = [
  "wardrobe-type",
  "style-challenge",
  "measurements",
  "body-shape",
  "style-direction",
  "occasions",
  "makeup",
  "budget",
  "style-mood",
  "location",
];

const STYLE_STEPS: StyleStep[] = [...PHOTO_STEPS, ...QUIZ_STEPS, "aesthetic"];

function stepProgress(step: StyleStep): number {
  const idx = QUIZ_STEPS.indexOf(step);
  if (idx < 0) return 0;
  return Math.round((idx / (QUIZ_STEPS.length - 1)) * 100);
}

function stepKicker(step: StyleStep): string {
  if (step === "face-photo") return "photo 1/2";
  if (step === "body-photo") return "photo 2/2";
  if (step === "aesthetic") return "your style";
  const idx = QUIZ_STEPS.indexOf(step);
  return `step ${String(idx + 1).padStart(2, "0")}`;
}

function toggleStyleDirection(current: StyleDirection[], id: StyleDirection): StyleDirection[] {
  if (current.includes(id)) return current.filter((s) => s !== id);
  const next = [...current, id];
  return next.length > 3 ? next.slice(next.length - 3) : next;
}

// ── Analysis messages — cycle during the loading screen ───────────────────────

const ANALYSIS_MESSAGES = [
  "reading your face shape and features",
  "analyzing your undertone and coloring",
  "mapping you to the kibbe typology",
  "crafting your personalized color palette",
  "finding silhouettes that work for your body",
  "almost there — picking pieces that reveal your best features",
  "putting the final touches on your style map",
] as const;

// ── Photo storage helpers ──────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function deriveGender(wardrobeType?: string): "man" | "woman" | "other" {
  if (wardrobeType === "menswear") return "man";
  if (wardrobeType === "womenswear") return "woman";
  return "other";
}

// ── Main component ─────────────────────────────────────────────────────────────

export function StyleSetupFlow() {
  const router = useRouter();
  const [step, setStep] = useState<StyleStep>("face-photo");
  const [answers, setAnswers] = useState<QuizAnswers>({ styleDirections: [], occasions: [] });
  const [pendingChallenge, setPendingChallenge] = useState<QuizAnswers["styleChallenge"]>();
  const [saving, setSaving] = useState(false);

  // Photo state
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [bodyFile, setBodyFile] = useState<File | null>(null);
  const [bodyPreview, setBodyPreview] = useState<string | null>(null);

  // Analysis loading state
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeMessageIdx, setAnalyzeMessageIdx] = useState(0);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const analyzeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageCycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAnswersRef = useRef<QuizAnswers | null>(null);

  // Location state
  const [cityInput, setCityInput] = useState("");
  const [weather, setWeather] = useState<LocationWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [geoFailed, setGeoFailed] = useState(false);
  const geoAttempted = useRef(false);

  const [selectedAesthetics, setSelectedAesthetics] = useState<Aesthetic[]>([]);

  function toggleAesthetic(id: Aesthetic) {
    setSelectedAesthetics((prev) => {
      if (prev.includes(id)) return prev.filter((a) => a !== id);
      if (prev.length >= 2) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  const existingProfile = loadQuizProfile();
  const wardrobeType = existingProfile?.answers.wardrobeType;

  // Auto-detect city when reaching location step
  useEffect(() => {
    if (step !== "location" || geoAttempted.current) return;
    geoAttempted.current = true;
    setWeatherLoading(true);
    detectCityAndWeather()
      .then((loc) => {
        if (loc) {
          setWeather(loc);
          setCityInput(loc.city);
        } else {
          setGeoFailed(true);
        }
      })
      .catch(() => setGeoFailed(true))
      .finally(() => setWeatherLoading(false));
  }, [step]);

  const handleCityChange = useCallback((value: string) => {
    setCityInput(value);
    if (!value.trim()) return;
    const timer = setTimeout(() => {
      fetchWeatherForCity(value.trim())
        .then((loc) => loc && setWeather(loc))
        .catch(() => {});
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // ── Photo handlers ───────────────────────────────────────────────────────────

  const handleFacePhoto = (file: File) => {
    setFaceFile(file);
    const url = URL.createObjectURL(file);
    setFacePreview(url);
  };

  const handleBodyPhoto = (file: File) => {
    setBodyFile(file);
    const url = URL.createObjectURL(file);
    setBodyPreview(url);
  };

  // ── Navigation ───────────────────────────────────────────────────────────────

  const advance = (next: StyleStep | null) => {
    if (next) setStep(next);
  };

  const continueFooter = async () => {
    const idx = STYLE_STEPS.indexOf(step);
    const next = STYLE_STEPS[idx + 1] as StyleStep | undefined;

    if (step === "style-challenge" && pendingChallenge) {
      setAnswers((a) => ({ ...a, styleChallenge: pendingChallenge }));
      advance(next ?? null);
      return;
    }

    if (step === "location") {
      const trimmed = cityInput.trim();
      const merged: QuizAnswers = {
        ...answers,
        city: trimmed || weather?.city || undefined,
        countryCode: weather?.countryCode || undefined,
        locationSkipped: !trimmed && !weather?.city,
        weatherTemp: weather?.temperature,
        weatherHumidity: weather?.humidity,
        weatherUv: weather?.uvIndex,
      };
      setAnswers(merged);
      setStep("aesthetic");
      return;
    }

    if (step === "aesthetic") {
      const updatedAnswers = { ...answers, aesthetics: selectedAesthetics };
      await finishSetup(updatedAnswers);
      return;
    }

    advance(next ?? null);
  };

  const skipBodyPhoto = () => {
    setBodyFile(null);
    setBodyPreview(null);
    const idx = STYLE_STEPS.indexOf("body-photo");
    const next = STYLE_STEPS[idx + 1] as StyleStep | undefined;
    advance(next ?? null);
  };

  // ── Finish — triggers the AI analysis ───────────────────────────────────────

  const finishSetup = async (finalAnswers: QuizAnswers) => {
    if (!faceFile) return;
    lastAnswersRef.current = finalAnswers;
    setAnalyzing(true);
    setAnalyzeProgress(0);
    setAnalyzeMessageIdx(0);
    setAnalyzeError(null);

    // Fake progress: reaches ~92% over 80 seconds, caps until API responds
    analyzeTimerRef.current = setInterval(() => {
      setAnalyzeProgress((prev) => {
        if (prev >= 92) return prev;
        // Decelerates as it approaches 92
        const increment = Math.max(0.3, (92 - prev) * 0.025);
        return Math.min(92, prev + increment);
      });
    }, 600);

    // Cycle messages every 9 seconds
    messageCycleRef.current = setInterval(() => {
      setAnalyzeMessageIdx((i) => (i + 1) % ANALYSIS_MESSAGES.length);
    }, 9000);

    try {
      // Build quiz profile first (for saving)
      const existing = loadQuizProfile();
      const mergedAnswers: QuizAnswers = existing
        ? { ...existing.answers, ...finalAnswers }
        : finalAnswers;

      const gender = deriveGender(mergedAnswers.wardrobeType);

      // Build FormData for the style analysis API
      const formData = new FormData();
      formData.append("facePhoto", faceFile);
      if (bodyFile) formData.append("bodyPhoto", bodyFile);
      formData.append("quiz", JSON.stringify(mergedAnswers));
      formData.append("gender", gender);

      // Stage 1: fast mini call (~15-20 sec) — mini-result + profileData for stage 2
      const res = await fetch("/api/style-analysis/mini", {
        method: "POST",
        body: formData,
      });

      // Snap to 100%
      clearInterval(analyzeTimerRef.current!);
      clearInterval(messageCycleRef.current!);
      setAnalyzeProgress(100);

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? "Analysis failed. Please try again.");
      }

      const miniData = await res.json() as {
        miniResult: unknown;
        profileData: unknown;
        meta: unknown;
        retakeSuggestion?: string | null;
      };

      // Stage 2 (full report) fires from profile/page.tsx after redirect.
      const result = {
        miniResult: miniData.miniResult,
        fullReport: null,
        profileData: miniData.profileData,
        quizData: mergedAnswers,
        meta: miniData.meta,
        retakeSuggestion: miniData.retakeSuggestion ?? null,
      };

      // Persist for profile page
      try {
        localStorage.setItem("paletteme-style-analysis", JSON.stringify(result));
      } catch {
        // Storage quota — non-fatal
      }

      // Save quiz profile (legacy compatibility)
      if (existing) {
        const profile = buildQuizProfile(mergedAnswers, existing.scores, {
          seasonId: existing.seasonId,
          seasonName: existing.seasonName,
          undertoneHint: existing.undertoneHint,
          subSeason: existing.subSeason,
          faceShape: existing.faceShape,
          bodyType: deriveBodyType(mergedAnswers),
          styleVector: deriveStyleVectorFromAnswers(mergedAnswers),
        });
        saveQuizProfile(profile);
        saveQuizToLocalStorage(profile);
        saveQuizToSupabase(profile).catch(() => {});
      }

      // Brief pause so user sees 100% before redirect
      await new Promise((r) => setTimeout(r, 700));
      router.push("/profile");
    } catch (err) {
      clearInterval(analyzeTimerRef.current!);
      clearInterval(messageCycleRef.current!);
      setAnalyzeError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setAnalyzeProgress(0);
      // Keep analyzing=true so the error renders inside the analyzing screen
    }
  };

  const retryAnalysis = () => {
    if (lastAnswersRef.current) {
      setAnalyzeError(null);
      void finishSetup(lastAnswersRef.current);
    }
  };

  // ── Footer state ─────────────────────────────────────────────────────────────

  const footerDisabled =
    (step === "face-photo" && !faceFile) ||
    (step === "wardrobe-type" && !answers.wardrobeType) ||
    (step === "style-challenge" && !pendingChallenge) ||
    (step === "measurements" && !answers.heightCm) ||
    (step === "body-shape" && !answers.bodyShape) ||
    (step === "style-direction" && (answers.styleDirections?.length ?? 0) < 1) ||
    (step === "occasions" && (answers.occasions?.length ?? 0) < 1) ||
    (step === "makeup" && !answers.makeupPref) ||
    (step === "budget" && !answers.budgetPref) ||
    (step === "style-mood" && (answers.styleMoods?.length ?? 0) < 1);

  const footerHint =
    step === "face-photo"
      ? "Natural light · no filters · face clearly visible"
      : step === "body-photo"
        ? "Optional — helps us suggest the right silhouettes"
        : step === "body-shape"
          ? "We focus only on what works beautifully for your shape"
          : step === "style-direction"
            ? "Pick up to 3 — we'll drop the oldest if you pick more"
            : step === "location"
              ? "Used only for outfit and weather suggestions"
              : undefined;

  const footerLabel =
    step === "aesthetic"
      ? selectedAesthetics.length > 0 ? "see my results →" : "skip →"
      : step === "location"
        ? saving ? "saving…" : "finish setup"
        : step === "face-photo"
          ? "continue with this photo"
          : step === "body-photo"
            ? "continue"
            : undefined;

  const screenPanel = "quiz-page__panel quiz-page__panel--screen on";

  // ── Render ───────────────────────────────────────────────────────────────────

  // Full-screen analysis loading state — replaces quiz UI entirely
  if (analyzing) {
    return (
      <div className="analyzing-screen">
        <div className="analyzing-screen__inner">

          {/* Face photo pulse */}
          {facePreview && (
            <div className="analyzing-screen__photo-ring">
              <img src={facePreview} alt="" className="analyzing-screen__photo" />
            </div>
          )}

          <h1 className="analyzing-screen__title">building your style map</h1>

          {/* Animated message */}
          <p className="analyzing-screen__message" key={analyzeMessageIdx}>
            {ANALYSIS_MESSAGES[analyzeMessageIdx]}
          </p>

          {/* Progress bar */}
          <div className="analyzing-screen__track">
            <span
              className="analyzing-screen__fill"
              style={{ transform: `scaleX(${analyzeProgress / 100})` }}
            />
          </div>

          <p className="analyzing-screen__sub">
            {analyzeProgress < 40
              ? "this takes about a minute — we're being thorough"
              : analyzeProgress < 75
                ? "halfway there — building your full style map"
                : "almost done — final touches on your report"}
          </p>

          {analyzeError && (
            <div className="analyzing-screen__error">
              <p>{analyzeError}</p>
              <button
                className="analyzing-screen__retry"
                onClick={retryAnalysis}
              >
                try again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      {/* Progress bar — only shown during quiz steps */}
      <div className="quiz-page__bar">
        <span className="quiz-page__bar-title">your style</span>
        <span
          className="quiz-page__bar-progress"
          style={{ transform: `scaleX(${stepProgress(step) / 100})` }}
        />
      </div>

      <div className="quiz-page__panels">

        {/* ── FACE PHOTO ──────────────────────────────────────────────────────── */}
        {step === "face-photo" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="photo 1/2"
              title="Let's start with your face"
              helper="We'll read your face shape, features, and coloring to build your full style map"
            />

            {facePreview ? (
              <div className="style-setup__photo-preview">
                <img
                  src={facePreview}
                  alt="Your face photo"
                  className="style-setup__photo-preview-img"
                />
                <button
                  className="style-setup__photo-retake"
                  onClick={() => { setFaceFile(null); setFacePreview(null); }}
                >
                  use a different photo
                </button>
              </div>
            ) : (
              <SelfieCapture
                onFile={handleFacePhoto}
                title="Upload your face photo"
                detail="Natural light · no heavy filters · face fully visible"
                captureLabel="take selfie"
                capturedFilePrefix="paletteme-face"
              />
            )}
          </div>
        )}

        {/* ── BODY PHOTO ──────────────────────────────────────────────────────── */}
        {step === "body-photo" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="photo 2/2"
              title="Add a body photo for better silhouette advice"
              helper="Optional — standing, full body, relaxed pose. Helps us suggest proportions that work"
            />

            {bodyPreview ? (
              <div className="style-setup__photo-preview">
                <img
                  src={bodyPreview}
                  alt="Your body photo"
                  className="style-setup__photo-preview-img"
                />
                <button
                  className="style-setup__photo-retake"
                  onClick={() => { setBodyFile(null); setBodyPreview(null); }}
                >
                  use a different photo
                </button>
              </div>
            ) : (
              <SelfieCapture
                onFile={handleBodyPhoto}
                title="Upload a full-body photo"
                detail="Standing · relaxed pose · natural light"
                captureLabel="take photo"
                capturedFilePrefix="paletteme-body"
                cameraFacingMode="environment"
              />
            )}

            <button
              className="style-setup__skip-link"
              onClick={skipBodyPhoto}
            >
              skip — I'll describe my body type instead
            </button>
          </div>
        )}

        {/* ── QUIZ Q1: Wardrobe type ──────────────────────────────────────────── */}
        {step === "wardrobe-type" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker={stepKicker(step)}
              title="What do you shop for?"
            />
            <QuizRadioList>
              {WARDROBE_TYPE_SIMPLE_OPTIONS.map((opt) => (
                <QuizRadioCard
                  key={opt.id}
                  title={opt.label}
                  sub={opt.sub}
                  selected={answers.wardrobeType === opt.id}
                  onClick={() => setAnswers((a) => ({ ...a, wardrobeType: opt.id as WardrobeType }))}
                />
              ))}
            </QuizRadioList>
          </div>
        )}

        {/* ── QUIZ Q2: Style challenge ─────────────────────────────────────────── */}
        {step === "style-challenge" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker={stepKicker(step)}
              title="What's your biggest style challenge right now?"
              helper="Be honest — this shapes everything we tell you"
            />
            <QuizRadioList>
              {STYLE_CHALLENGE_OPTIONS.map((opt) => (
                <QuizRadioCard
                  key={opt.id}
                  title={opt.label}
                  sub={opt.sub}
                  selected={pendingChallenge === opt.id}
                  onClick={() => setPendingChallenge(opt.id)}
                />
              ))}
            </QuizRadioList>
          </div>
        )}

        {/* ── QUIZ Q3: Measurements ────────────────────────────────────────────── */}
        {step === "measurements" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker={stepKicker(step)}
              title="Your measurements"
              helper="Stays private — used only for proportions and outfit length"
            />
            <div className="quiz-page__measurements">
              <div className="quiz-page__measure-field">
                <label className="quiz-page__measure-label">height</label>
                <div className="quiz-page__measure-input-row">
                  <input
                    type="number"
                    className="quiz-page__measure-input"
                    placeholder="e.g. 165"
                    min={100}
                    max={220}
                    value={answers.heightCm ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, heightCm: e.target.value }))}
                  />
                  <span className="quiz-page__measure-unit">cm</span>
                </div>
              </div>
              <div className="quiz-page__measure-field">
                <label className="quiz-page__measure-label">weight <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
                <div className="quiz-page__measure-input-row">
                  <input
                    type="number"
                    className="quiz-page__measure-input"
                    placeholder="e.g. 60"
                    min={30}
                    max={250}
                    value={answers.weightKg ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, weightKg: e.target.value }))}
                  />
                  <span className="quiz-page__measure-unit">kg</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── QUIZ Q3: Body shape ──────────────────────────────────────────────── */}
        {step === "body-shape" && (
          <div className={`${screenPanel} quiz-page__panel--body-scroll`}>
            <QuizStepHead
              kicker={stepKicker(step)}
              title="Which silhouette is closest to yours?"
              helper="This stays completely private and only affects outfit suggestions"
            />
            <div className={`quiz-body-grid${wardrobeType === "menswear" ? " quiz-body-grid--men" : ""}`}>
              {getBodyShapeScreenOptions(wardrobeType).map((opt, index, list) => (
                <BodyShapeCard
                  key={opt.id}
                  label={opt.label}
                  shape={opt.id}
                  wardrobeType={wardrobeType}
                  selected={answers.bodyShape === opt.id}
                  solo={list.length % 2 === 1 && index === list.length - 1}
                  onClick={() => setAnswers((a) => ({ ...a, bodyShape: opt.id }))}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ Q4: Style direction ─────────────────────────────────────────── */}
        {step === "style-direction" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker={stepKicker(step)}
              title="Pick the styles that feel like you"
            />
            <QuizCardList stack>
              {STYLE_DIRECTION_OPTIONS.map((opt) => (
                <QuizCardButton
                  key={opt.id}
                  title={opt.label}
                  sub={opt.sub}
                  selected={answers.styleDirections?.includes(opt.id)}
                  onClick={() =>
                    setAnswers((a) => ({
                      ...a,
                      styleDirections: toggleStyleDirection(a.styleDirections ?? [], opt.id),
                    }))
                  }
                />
              ))}
            </QuizCardList>
          </div>
        )}

        {/* ── QUIZ Q5: Occasions ───────────────────────────────────────────────── */}
        {step === "occasions" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker={stepKicker(step)}
              title="What do you dress for most?"
              helper="Select all that apply"
            />
            <div className="quiz-page__tags">
              {OCCASION_OPTIONS.map((opt) => (
                <QuizChip
                  key={opt.id}
                  label={opt.label}
                  selected={answers.occasions?.includes(opt.id as OccasionPref) ?? false}
                  onClick={() =>
                    setAnswers((a) => {
                      const current = a.occasions ?? [];
                      const id = opt.id as OccasionPref;
                      const next = current.includes(id)
                        ? current.filter((o) => o !== id)
                        : [...current, id];
                      return { ...a, occasions: next };
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ Q6: Makeup ──────────────────────────────────────────────────── */}
        {step === "makeup" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker={stepKicker(step)}
              title="Do you want makeup included in your recommendations?"
            />
            <QuizRadioList>
              {MAKEUP_PREF_OPTIONS.map((opt) => (
                <QuizRadioCard
                  key={opt.id}
                  title={opt.label}
                  sub={opt.sub}
                  selected={answers.makeupPref === opt.id}
                  onClick={() => setAnswers((a) => ({ ...a, makeupPref: opt.id }))}
                />
              ))}
            </QuizRadioList>
          </div>
        )}

        {/* ── QUIZ Q7: Budget ──────────────────────────────────────────────────── */}
        {step === "budget" && (
          <div className={screenPanel}>
            <QuizStepHead kicker={stepKicker(step)} title="Your general shopping budget" />
            <QuizRadioList>
              {BUDGET_PREF_OPTIONS.map((opt) => (
                <QuizRadioCard
                  key={opt.id}
                  title={opt.label}
                  sub={opt.sub}
                  selected={answers.budgetPref === opt.id}
                  onClick={() => setAnswers((a) => ({ ...a, budgetPref: opt.id }))}
                />
              ))}
            </QuizRadioList>
          </div>
        )}

        {/* ── QUIZ Q8: Style mood ──────────────────────────────────────────────── */}
        {step === "style-mood" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker={stepKicker(step)}
              title="Pick your vibe"
              helper="Choose up to 2 — or pick the last one if you're not sure yet"
            />
            <QuizCardList stack>
              {STYLE_MOOD_OPTIONS.map((opt) => {
                const moods = answers.styleMoods ?? [];
                const isSelected = moods.includes(opt.id as StyleMood);
                const isNotSure = opt.id === "not-sure";
                const notSureActive = moods.includes("not-sure" as StyleMood);
                return (
                  <QuizCardButton
                    key={opt.id}
                    title={opt.label}
                    sub={opt.sub}
                    selected={isSelected}
                    onClick={() =>
                      setAnswers((a) => {
                        const prev = a.styleMoods ?? [];
                        if (isNotSure) {
                          return { ...a, styleMoods: isSelected ? [] : ["not-sure" as StyleMood], styleMood: "not-sure" as StyleMood };
                        }
                        if (notSureActive) {
                          return { ...a, styleMoods: [opt.id as StyleMood], styleMood: opt.id as StyleMood };
                        }
                        const next = isSelected
                          ? prev.filter((m) => m !== opt.id)
                          : prev.length < 2
                            ? [...prev, opt.id as StyleMood]
                            : prev;
                        return { ...a, styleMoods: next, styleMood: next[0] as StyleMood };
                      })
                    }
                  />
                );
              })}
            </QuizCardList>
          </div>
        )}

        {/* ── QUIZ Q10: Location ───────────────────────────────────────────────── */}
        {step === "location" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker={stepKicker(step)}
              title="Where are you based?"
              helper="We use this to match outfits to your local weather and season"
            />
            <input
              type="text"
              className="quiz-page__field"
              placeholder={
                weatherLoading
                  ? "Detecting your city…"
                  : geoFailed
                    ? "Enter your city"
                    : "Your city"
              }
              value={cityInput}
              onChange={(e) => handleCityChange(e.target.value)}
              autoComplete="address-level2"
              aria-label="City"
            />
            {geoFailed && !cityInput && (
              <p className="quiz-page__inline-error" style={{ color: "var(--ink-soft)", fontStyle: "normal" }}>
                Location access was denied — type your city above to continue.
              </p>
            )}
            <WeatherStatCards
              temperature={weather?.temperature}
              humidity={weather?.humidity}
              uvIndex={weather?.uvIndex}
              loading={weatherLoading}
            />
          </div>
        )}

        {/* ── AESTHETIC SELECTION (post-quiz, not counted in 10-step limit) ────── */}
        {step === "aesthetic" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="your style"
              title="what's your aesthetic?"
              helper="pick 1 or 2 — we'll build your capsule around these"
            />
            <div className="quiz-aesthetic-grid">
              {AESTHETIC_OPTIONS.map((opt) => {
                const selected = selectedAesthetics.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`quiz-aesthetic-card${selected ? " quiz-aesthetic-card--selected" : ""}`}
                    onClick={() => toggleAesthetic(opt.id)}
                    aria-pressed={selected}
                  >
                    <span className="quiz-aesthetic-emoji">{opt.emoji}</span>
                    <span className="quiz-aesthetic-label">{opt.label}</span>
                    <span className="quiz-aesthetic-sub">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <QuizFooter
        disabled={footerDisabled || saving}
        hint={footerHint}
        onContinue={() => void continueFooter()}
        label={footerLabel}
      />
    </div>
  );
}
