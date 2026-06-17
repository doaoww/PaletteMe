"use client";

import * as amplitude from "@amplitude/unified";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/analysis";
import { isSupabaseAuthConfigured } from "@/lib/auth-flow";
import { createClient } from "@/lib/supabase";
import { saveAnalysisResult } from "@/lib/analysis-storage";
import { SelfieCapture } from "@/components/selfie/selfie-capture";
import { getBodyShapeScreenOptions } from "@/components/quiz/body-shape-silhouettes";
import {
  applyAnswer,
  buildQuizProfile,
  deriveBodyType,
  deriveStyleVectorFromAnswers,
  emptyScores,
  enrichColorAnswers,
  saveQuizProfile,
  saveQuizToLocalStorage,
  saveQuizToSupabase,
  type QuizProfile,
  type QuizScores,
} from "@/lib/quiz";
import {
  detectCityAndWeather,
  fetchWeatherForCity,
  type LocationWeather,
} from "@/lib/quiz-location";
import {
  BUDGET_PREF_OPTIONS,
  CONTRAST_OPTIONS,
  EYE_COLOR_OPTIONS,
  HAIR_COLOR_OPTIONS_UI,
  HEIGHT_OPTIONS,
  MAKEUP_PREF_OPTIONS,
  OCCASION_OPTIONS,
  SKIN_TONE_OPTIONS,
  STYLE_CHALLENGE_OPTIONS,
  STYLE_DIRECTION_OPTIONS,
  SUN_OPTIONS,
  VEIN_OPTIONS,
  WARDROBE_TYPE_OPTIONS,
  WEIGHT_OPTIONS,
  type QuizAnswers,
  type StyleDirection,
  type WardrobeType,
} from "@/lib/quiz-data";
import { resizeImageForAnalysis } from "@/lib/resize-image";
import { SEASONS } from "@/lib/landing-data";
import { validateSelfieFile } from "@/lib/selfie-capture";
import {
  BodyShapeCard,
  QuizCardButton,
  QuizCardList,
  QuizChip,
  QuizDecision,
  QuizFooter,
  QuizRadioCard,
  QuizRadioList,
  QuizStepHead,
  SwatchGrid,
  SwatchOption,
  WardrobeCard,
  WeatherStatCards,
} from "@/components/quiz/quiz-picker";

type Step =
  | "intro"
  | "wardrobe-type"
  | "style-challenge"
  | "skin-tone"
  | "vein"
  | "hair-color"
  | "eye-color"
  | "contrast"
  | "sun-reaction"
  | "height"
  | "weight"
  | "body-shape"
  | "style-direction"
  | "occasions"
  | "makeup"
  | "budget"
  | "location"
  | "photo-decision"
  | "color-entry"
  | "color-selfie"
  | "color-analyzing";

const FOOTER_STEPS: Step[] = [
  "wardrobe-type",
  "style-challenge",
  "skin-tone",
  "vein",
  "hair-color",
  "eye-color",
  "contrast",
  "sun-reaction",
  "height",
  "weight",
  "body-shape",
  "style-direction",
  "occasions",
  "makeup",
  "budget",
  "location",
];

const STEP_ORDER: Step[] = [
  "intro",
  ...FOOTER_STEPS,
  "photo-decision",
  "color-entry",
  "color-selfie",
  "color-analyzing",
];

const STEP_BACK: Partial<Record<Step, Step>> = (() => {
  const map: Partial<Record<Step, Step>> = {};
  for (let i = 1; i < STEP_ORDER.length; i += 1) {
    const step = STEP_ORDER[i];
    const prev = STEP_ORDER[i - 1];
    if (step !== "intro") map[step] = prev;
  }
  return map;
})();


function stepProgress(step: Step): number {
  const idx = STEP_ORDER.indexOf(step);
  if (idx <= 0) return 0;
  return Math.round((idx / (STEP_ORDER.length - 1)) * 100);
}

function stepBarTitle(step: Step): string {
  if (step === "intro") return "palette me";
  if (step === "wardrobe-type" || step === "style-challenge") return "your profile";
  if (
    [
      "skin-tone",
      "vein",
      "hair-color",
      "eye-color",
      "contrast",
      "sun-reaction",
      "photo-decision",
      "color-entry",
      "color-selfie",
      "color-analyzing",
    ].includes(step)
  ) {
    return "your colors";
  }
  if (["height", "weight", "body-shape"].includes(step)) return "your shape";
  if (["style-direction", "occasions", "makeup", "budget"].includes(step)) return "your style";
  if (step === "location") return "your location";
  return "quiz";
}

type ColorResult = {
  seasonId: "spring" | "summer" | "autumn" | "winter";
  seasonName: string;
  undertoneHint: "warm" | "cool" | "neutral";
  subSeason?: string;
  palette: string[];
  fromSelfie: boolean;
  confidence?: number;
};

type SelfieQualityWarning = {
  message: string;
  result: AnalysisResult;
};

type AnalyzeResponse = {
  ok?: boolean;
  result?: AnalysisResult;
  warning?: {
    message?: string;
  } | null;
  error?: string;
  message?: string;
};

const SUPABASE_AUTH_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

function toggleStyleDirection(current: StyleDirection[], id: StyleDirection): StyleDirection[] {
  if (current.includes(id)) return current.filter((item) => item !== id);
  if (current.length >= 3) return [...current.slice(1), id];
  return [...current, id];
}

export function QuizFlow() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<QuizAnswers>({ styleDirections: [], occasions: [] });
  const [scores, setScores] = useState<QuizScores>(emptyScores());
  const [colorResult, setColorResult] = useState<ColorResult | null>(null);
  const [pendingWardrobe, setPendingWardrobe] = useState<WardrobeType | undefined>();
  const [pendingChallenge, setPendingChallenge] = useState<QuizAnswers["styleChallenge"]>();

  const [cityInput, setCityInput] = useState("");
  const [weather, setWeather] = useState<LocationWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [geoFailed, setGeoFailed] = useState(false);
  const geoAttempted = useRef(false);
  const cityDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
  const [selfieError, setSelfieError] = useState<string | null>(null);
  const [selfieHardReject, setSelfieHardReject] = useState(false);
  const [selfieQualityWarning, setSelfieQualityWarning] = useState<SelfieQualityWarning | null>(null);

  const progress = stepProgress(step);
  const backStep = STEP_BACK[step];
  const enrichedAnswers = useMemo(() => enrichColorAnswers(answers), [answers]);

  const showFooter = FOOTER_STEPS.includes(step);
  const hideHeader = step === "intro";

  const advance = useCallback((next: Step) => setStep(next), []);

  const applyWeather = useCallback((data: LocationWeather) => {
    setWeather(data);
    setCityInput(data.city);
  }, []);

  useEffect(() => {
    if (step !== "location" || geoAttempted.current) return;
    geoAttempted.current = true;
    setWeatherLoading(true);
    detectCityAndWeather()
      .then((data) => {
        if (data) {
          applyWeather(data);
        } else {
          setGeoFailed(true);
        }
      })
      .finally(() => setWeatherLoading(false));
  }, [step, applyWeather]);

  const handleCityChange = (value: string) => {
    setCityInput(value);
    if (cityDebounce.current) clearTimeout(cityDebounce.current);
    if (!value.trim()) {
      setWeather(null);
      return;
    }
    cityDebounce.current = setTimeout(async () => {
      setWeatherLoading(true);
      const data = await fetchWeatherForCity(value);
      if (data) applyWeather(data);
      setWeatherLoading(false);
    }, 600);
  };

  useEffect(
    () => () => {
      if (cityDebounce.current) clearTimeout(cityDebounce.current);
    },
    []
  );

  const handleFile = useCallback(
    async (next: File) => {
      const validation = validateSelfieFile(next);
      if (!validation.ok) {
        setSelfieError(validation.error);
        setSelfieHardReject(false);
        setSelfieQualityWarning(null);
        return;
      }
      setSelfieError(null);
      setSelfieHardReject(false);
      setSelfieQualityWarning(null);
      const prepared = await resizeImageForAnalysis(next);
      if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
      setSelfieFile(prepared);
      setSelfiePreviewUrl(URL.createObjectURL(prepared));
      amplitude.track("Selfie Uploaded", { file_size_bytes: next.size, file_type: next.type });
      setStep("color-selfie");
    },
    [selfiePreviewUrl]
  );

  const finishColorQuiz = (nextAnswers: QuizAnswers, nextScores: QuizScores) => {
    const enriched = enrichColorAnswers(nextAnswers);
    const quizProfile = buildQuizProfile(enriched, nextScores);
    const winner = SEASONS.find((s) => s.id === quizProfile.seasonId) ?? SEASONS[0];
    amplitude.track("Quiz Completed", {
      season_id: quizProfile.seasonId,
      sub_season: quizProfile.subSeason ?? null,
      wardrobe_type: nextAnswers.wardrobeType ?? null,
      confidence: quizProfile.quizConfidence ?? null,
    });
    setColorResult({
      seasonId: quizProfile.seasonId,
      seasonName: quizProfile.seasonName,
      undertoneHint: quizProfile.undertoneHint,
      subSeason: quizProfile.subSeason,
      palette: winner.palette,
      fromSelfie: false,
      confidence: quizProfile.quizConfidence,
    });
  };

  const analyzeSelfie = async () => {
    if (!selfieFile) return;
    setStep("color-analyzing");
    setSelfieError(null);
    setSelfieHardReject(false);
    setSelfieQualityWarning(null);
    const formData = new FormData();
    formData.append("image", selfieFile);
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = (await res.json().catch(() => ({}))) as AnalyzeResponse;
      if (!res.ok) {
        const isHardReject = res.status === 422 && data.error === "no_face";
        amplitude.track("Selfie Analysis Failed", { error_code: data.error ?? "unknown", hard_reject: isHardReject });
        setSelfieError(data.message || data.error || "Analysis failed.");
        setSelfieHardReject(isHardReject);
        setStep("color-selfie");
        return;
      }
      if (!data.result) throw new Error("Analysis failed.");
      const warningMessage = data.warning?.message ?? data.result.qualityWarning?.message;
      if (warningMessage) {
        setSelfieQualityWarning({ message: warningMessage, result: data.result });
        setStep("color-selfie");
        return;
      }
      completeWithSelfieAnalysis(data.result);
    } catch (err) {
      amplitude.track("Selfie Analysis Failed", { error_code: "exception", hard_reject: false });
      setSelfieError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setSelfieHardReject(false);
      setStep("color-selfie");
    }
  };

  const finishAndSaveProfile = useCallback(
    async (result: ColorResult) => {
      const profile: QuizProfile = buildQuizProfile(enrichedAnswers, scores, {
        seasonId: result.seasonId,
        seasonName: result.seasonName,
        undertoneHint: result.undertoneHint,
        bodyType: deriveBodyType(enrichedAnswers),
        styleVector: deriveStyleVectorFromAnswers(enrichedAnswers),
        subSeason: result.subSeason,
      });
      saveQuizProfile(profile);
      saveQuizToLocalStorage(profile);
      saveQuizToSupabase(profile).catch(() => {});
      router.push("/profile");
    },
    [enrichedAnswers, scores, router]
  );

  const completeWithSelfieAnalysis = (result: AnalysisResult) => {
    amplitude.track("Selfie Analysis Completed", {
      season_id: result.seasonId,
      sub_season: result.subSeason ?? null,
      confidence: result.confidence ?? null,
    });
    saveAnalysisResult(result);
    setColorResult({
      seasonId: result.seasonId,
      seasonName: result.season.name,
      undertoneHint: result.traits.undertone,
      subSeason: result.subSeason,
      palette: result.season.palette,
      fromSelfie: true,
      confidence: result.confidence,
    });
    finishAndSaveProfile({
      seasonId: result.seasonId,
      seasonName: result.season.name,
      undertoneHint: result.traits.undertone,
      subSeason: result.subSeason,
      palette: result.season.palette,
      fromSelfie: true,
      confidence: result.confidence,
    });
  };

  const retakeSelfie = () => {
    setSelfieError(null);
    setSelfieHardReject(false);
    setSelfieQualityWarning(null);
    setSelfieFile(null);
    if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
    setSelfiePreviewUrl(null);
    setStep("color-entry");
  };

  const continueWithSoftWarning = () => {
    if (!selfieQualityWarning) return;
    const result = selfieQualityWarning.result;
    setSelfieQualityWarning(null);
    setSelfieError(null);
    setSelfieHardReject(false);
    completeWithSelfieAnalysis(result);
  };

  const continueFooter = () => {
    const idx = STEP_ORDER.indexOf(step);
    const next = STEP_ORDER[idx + 1];
    if (!next) return;

    if (step === "wardrobe-type" && pendingWardrobe) {
      setAnswers((a) => ({ ...a, wardrobeType: pendingWardrobe }));
      advance(next);
      return;
    }
    if (step === "style-challenge" && pendingChallenge) {
      setAnswers((a) => ({ ...a, styleChallenge: pendingChallenge }));
      advance(next);
      return;
    }
    if (step === "sun-reaction" && answers.sunReaction) {
      let nextScores = scores;
      const contrast = CONTRAST_OPTIONS.find((o) => o.id === answers.contrastPref);
      const sun = SUN_OPTIONS.find((o) => o.id === answers.sunReaction);
      if (contrast) nextScores = applyAnswer(nextScores, contrast.scores);
      if (sun) nextScores = applyAnswer(nextScores, sun.scores);
      setScores(nextScores);
      finishColorQuiz(answers, nextScores);
      advance(next);
      return;
    }
    if (step === "location") {
      const trimmed = cityInput.trim();
      setAnswers((a) => ({
        ...a,
        city: trimmed || weather?.city || undefined,
        locationSkipped: !trimmed && !weather?.city,
        weatherTemp: weather?.temperature,
        weatherHumidity: weather?.humidity,
        weatherUv: weather?.uvIndex,
      }));
      advance(next);
      return;
    }
    advance(next);
  };

  const footerDisabled =
    (step === "wardrobe-type" && !pendingWardrobe) ||
    (step === "style-challenge" && !pendingChallenge) ||
    (step === "skin-tone" && !answers.skinTone) ||
    (step === "vein" && !answers.veinColor) ||
    (step === "hair-color" && !answers.naturalHairColor) ||
    (step === "eye-color" && !answers.eyeColor) ||
    (step === "contrast" && !answers.contrastPref) ||
    (step === "sun-reaction" && !answers.sunReaction) ||
    (step === "height" && !answers.height) ||
    (step === "weight" && !answers.weightRange && !answers.weightSkipped) ||
    (step === "body-shape" && !answers.bodyShape) ||
    (step === "style-direction" && (answers.styleDirections?.length ?? 0) < 1) ||
    (step === "occasions" && (answers.occasions?.length ?? 0) < 1) ||
    (step === "makeup" && !answers.makeupPref) ||
    (step === "budget" && !answers.budgetPref);

  const footerHint =
    step === "wardrobe-type"
      ? "You can change this later in settings"
      : step === "style-challenge"
        ? "This shapes the tone of your result"
        : step === "body-shape"
          ? "We focus only on what works beautifully for your shape"
          : step === "style-direction"
            ? "Pick up to 3 — we'll drop the oldest if you pick more"
            : step === "location"
              ? "Used only for outfit and weather suggestions"
              : undefined;

  const screenPanel = "quiz-page__panel quiz-page__panel--screen on";


  return (
    <div
      className={`quiz-page${showFooter ? " quiz-page--with-footer" : ""}${hideHeader ? " quiz-page--intro-step" : ""}`}
    >
      {!hideHeader ? (
        <header className="quiz-page__bar glass-nav">
          <div className="quiz-page__track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="quiz-page__bar-inner">
            {backStep ? (
              <button
                type="button"
                className="quiz-page__back"
                aria-label="Go back"
                onClick={() => setStep(backStep)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M14.5 5.5L8 12l6.5 6.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <Link href="/" className="quiz-page__back" aria-label="Home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M14.5 5.5L8 12l6.5 6.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )}
            <span className="quiz-page__bar-title">{stepBarTitle(step)}</span>
            <span className="quiz-page__bar-spacer" aria-hidden />
          </div>
        </header>
      ) : null}

      <main className={`quiz-page__main${showFooter ? " quiz-page__main--screen" : ""}`}>
        {step === "intro" && (
          <div className="quiz-page__panel quiz-page__panel--intro on">
            <p className="wordmark quiz-page__intro-logo">
              palette<span className="me">me</span>
            </p>
            <p className="quiz-page__tagline">Your AI stylist. Know what works for you.</p>
            <button
              type="button"
              className="btn quiz-page__start"
              onClick={() => {
                amplitude.track("Quiz Started", { source: "intro_screen" });
                setStep("wardrobe-type");
              }}
            >
              let&apos;s start
            </button>
            <p className="quiz-page__fine">No account needed to begin</p>
          </div>
        )}

        {step === "wardrobe-type" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 01"
              title="What kind of clothes do you wear?"
              helper="This helps us show you the right outfits and products"
            />
            <div className="quiz-page__cards quiz-page__cards--wardrobe">
              {WARDROBE_TYPE_OPTIONS.map((opt) => (
                <WardrobeCard
                  key={opt.id}
                  id={opt.id}
                  title={opt.label.toLowerCase()}
                  sub={opt.sub}
                  image={opt.image}
                  frameTilt={opt.frameTilt}
                  selected={pendingWardrobe === opt.id}
                  onClick={() => setPendingWardrobe(opt.id)}
                />
              ))}
            </div>
          </div>
        )}

        {step === "style-challenge" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 02"
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

        {step === "skin-tone" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 03"
              title="Your skin tone"
              helper="Choose the closest match to your natural coloring — not dyed or altered"
            />
            <SwatchGrid cols={2}>
              {SKIN_TONE_OPTIONS.map((opt) => (
                <SwatchOption
                  key={opt.id}
                  swatch={opt.swatch}
                  label={opt.label}
                  sub={opt.sub}
                  size="lg"
                  selected={answers.skinTone === opt.id}
                  onClick={() => setAnswers((a) => ({ ...a, skinTone: opt.id }))}
                />
              ))}
            </SwatchGrid>
          </div>
        )}

        {step === "vein" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 04"
              title="Undertone"
              helper="Look at the veins on the inside of your wrist in natural light"
            />
            <QuizRadioList>
              {VEIN_OPTIONS.map((opt) => (
                <QuizRadioCard
                  key={opt.id}
                  title={opt.label}
                  sub={opt.sub}
                  selected={answers.veinColor === opt.id}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, veinColor: opt.id }));
                    setScores((s) => applyAnswer(s, opt.scores));
                  }}
                />
              ))}
            </QuizRadioList>
            <button
              type="button"
              className="quiz-page__link-btn"
              onClick={() => {
                const neutral = VEIN_OPTIONS.find((o) => o.id === "mix");
                if (!neutral) return;
                setAnswers((a) => ({ ...a, veinColor: "mix" }));
                setScores((s) => applyAnswer(s, neutral.scores));
              }}
            >
              hard to tell
            </button>
          </div>
        )}

        {step === "hair-color" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 05"
              title="Your natural hair color"
              helper="If you've always dyed your hair, choose the color closest to your natural brows"
            />
            <SwatchGrid cols={2}>
              {HAIR_COLOR_OPTIONS_UI.map((opt) => (
                <SwatchOption
                  key={opt.id}
                  swatch={opt.swatch}
                  label={opt.label}
                  size="lg"
                  selected={answers.naturalHairColor === opt.id}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, naturalHairColor: opt.id }));
                    setScores((s) => applyAnswer(s, opt.scores));
                  }}
                />
              ))}
            </SwatchGrid>
          </div>
        )}

        {step === "eye-color" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 06"
              title="Your eye color"
              helper="Choose the closest match to your natural eye color"
            />
            <SwatchGrid cols={2}>
              {EYE_COLOR_OPTIONS.map((opt) => (
                <SwatchOption
                  key={opt.id}
                  swatch={opt.swatch}
                  label={opt.label}
                  size="lg"
                  selected={answers.eyeColor === opt.id}
                  onClick={() => setAnswers((a) => ({ ...a, eyeColor: opt.id }))}
                />
              ))}
            </SwatchGrid>
          </div>
        )}

        {step === "contrast" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 07"
              title="How different are your hair and skin in tone?"
            />
            <QuizRadioList>
              {CONTRAST_OPTIONS.map((opt) => (
                <QuizRadioCard
                  key={opt.id}
                  title={opt.label}
                  sub={opt.sub}
                  selected={answers.contrastPref === opt.id}
                  onClick={() => setAnswers((a) => ({ ...a, contrastPref: opt.id }))}
                />
              ))}
            </QuizRadioList>
          </div>
        )}

        {step === "sun-reaction" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 08"
              title="How does your skin react to sun exposure?"
            />
            <QuizRadioList>
              {SUN_OPTIONS.map((opt) => (
                <QuizRadioCard
                  key={opt.id}
                  title={opt.label}
                  sub={opt.hint}
                  selected={answers.sunReaction === opt.id}
                  onClick={() => setAnswers((a) => ({ ...a, sunReaction: opt.id }))}
                />
              ))}
            </QuizRadioList>
          </div>
        )}

        {step === "height" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 09"
              title="Your height"
              helper="This stays private and only affects outfit suggestions"
            />
            <QuizRadioList>
              {HEIGHT_OPTIONS.map((opt) => (
                <QuizRadioCard
                  key={opt.id}
                  title={opt.label}
                  sub={opt.sub}
                  selected={answers.height === opt.id}
                  onClick={() => setAnswers((a) => ({ ...a, height: opt.id }))}
                />
              ))}
            </QuizRadioList>
          </div>
        )}

        {step === "weight" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 10"
              title="Your weight"
              helper="This is optional — body shape works just as well"
            />
            <QuizRadioList>
              {WEIGHT_OPTIONS.map((opt) => (
                <QuizRadioCard
                  key={opt.id}
                  title={opt.label}
                  sub={opt.sub}
                  selected={answers.weightRange === opt.id}
                  onClick={() =>
                    setAnswers((a) => ({ ...a, weightRange: opt.id, weightSkipped: false }))
                  }
                />
              ))}
            </QuizRadioList>
            <button
              type="button"
              className="quiz-page__link-btn"
              onClick={() =>
                setAnswers((a) => ({
                  ...a,
                  weightRange: undefined,
                  weightSkipped: true,
                }))
              }
            >
              skip weight
            </button>
          </div>
        )}

        {step === "body-shape" && (
          <div className={`${screenPanel} quiz-page__panel--body-scroll`}>
            <QuizStepHead
              kicker="step 11"
              title="Which silhouette is closest to yours?"
              helper="This stays completely private and only affects outfit suggestions"
            />
            <div className="quiz-body-grid">
              {getBodyShapeScreenOptions(answers.wardrobeType).map((opt, index, list) => (
                <BodyShapeCard
                  key={opt.id}
                  label={opt.label}
                  shape={opt.id}
                  selected={answers.bodyShape === opt.id}
                  solo={list.length % 2 === 1 && index === list.length - 1}
                  onClick={() => setAnswers((a) => ({ ...a, bodyShape: opt.id }))}
                />
              ))}
            </div>
          </div>
        )}

        {step === "style-direction" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 12"
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

        {step === "occasions" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 13"
              title="What do you dress for most?"
              helper="Select all that apply"
            />
            <div className="quiz-page__tags">
              {OCCASION_OPTIONS.map((opt) => (
                <QuizChip
                  key={opt.id}
                  label={opt.label}
                  selected={answers.occasions?.includes(opt.id) ?? false}
                  onClick={() =>
                    setAnswers((a) => {
                      const current = a.occasions ?? [];
                      const next = current.includes(opt.id)
                        ? current.filter((id) => id !== opt.id)
                        : [...current, opt.id];
                      return { ...a, occasions: next };
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}

        {step === "makeup" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 14"
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

        {step === "budget" && (
          <div className={screenPanel}>
            <QuizStepHead kicker="step 15" title="Your general shopping budget" />
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

        {step === "location" && (
          <div className={screenPanel}>
            <QuizStepHead
              kicker="step 16"
              title="One last thing — where are you?"
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
              tempUnit={weather?.tempUnit}
              loading={weatherLoading}
            />
          </div>
        )}

        {step === "photo-decision" && colorResult && (
          <div className="quiz-page__panel on">
            <QuizStepHead
              kicker="optional selfie"
              title="I already know your color type."
              helper="Your answers gave me a strong picture. Want me to confirm it visually?"
            />
            <QuizDecision
              primary={{
                title: "upload a selfie",
                sub: "I'll compare your photo to your answers for a more accurate result",
                onClick: () => setStep("color-entry"),
              }}
              secondary={{
                title: "get my result now",
                sub: "Continue without a photo — you can always add one later",
                onClick: () => {
                  if (colorResult) finishAndSaveProfile(colorResult);
                },
              }}
            />
          </div>
        )}

        {step === "color-entry" && (
          <div className="quiz-page__panel on">
            <QuizStepHead
              kicker="selfie"
              title="Upload a selfie"
              helper="Natural light, no filters. Processed instantly — never stored without your permission."
            />
            <SelfieCapture
              onFile={handleFile}
              maxWidth={360}
              title="Drop your selfie here"
              detail="JPG, PNG, or WebP · max 10 MB · natural light, no filters"
            />
            {selfieError && <p className="quiz-page__inline-error">{selfieError}</p>}
            <button
              type="button"
              className="quiz__redo"
              onClick={() => {
                if (colorResult) finishAndSaveProfile(colorResult);
              }}
            >
              skip selfie →
            </button>
          </div>
        )}

        {step === "color-selfie" && selfiePreviewUrl && (
          <div className="quiz-page__panel quiz-page__panel--center on">
            <QuizStepHead kicker="selfie" title="Looking good — ready to analyze?" />
            <div className="quiz-page__drop quiz-page__drop--preview">
              <div className="quiz-page__drop-preview">
                <Image src={selfiePreviewUrl} alt="Your selfie" fill className="object-cover" unoptimized />
              </div>
            </div>
            {selfieError && <p className="quiz-page__inline-error">{selfieError}</p>}
            {selfieQualityWarning ? (
              <>
                <p className="quiz-page__inline-error">{selfieQualityWarning.message}</p>
                <button type="button" className="quiz__redo" onClick={retakeSelfie}>
                  Retake photo
                </button>
                <button type="button" className="btn quiz-page__cta" onClick={continueWithSoftWarning}>
                  Continue anyway {"\u2192"}
                </button>
              </>
            ) : selfieHardReject ? (
              <button type="button" className="quiz__redo" onClick={retakeSelfie}>
                Retake photo
              </button>
            ) : (
              <button type="button" className="btn quiz-page__cta" onClick={analyzeSelfie}>
                analyze my colors
              </button>
            )}
          </div>
        )}

        {step === "color-analyzing" && (
          <div className="quiz-page__panel on quiz-page__calculating">
            <div className="quiz-page__spinner" />
            <p className="quiz-page__wait">Reading your coloring…</p>
            <p className="quiz-page__calc-msg">This takes about 10 seconds.</p>
          </div>
        )}
      </main>

      {showFooter ? (
        <QuizFooter onContinue={continueFooter} disabled={footerDisabled} hint={footerHint} />
      ) : null}
    </div>
  );
}
