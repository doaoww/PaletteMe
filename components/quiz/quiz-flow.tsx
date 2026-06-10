"use client";

import Link from "next/link";
import { useState } from "react";
import { QuizSelfieStep } from "@/components/quiz/quiz-selfie-step";
import {
  applyAnswer,
  buildQuizProfile,
  clearQuizProfile,
  emptyScores,
  saveQuizProfile,
  toggleTrend,
  type QuizProfile,
  type QuizScores,
} from "@/lib/quiz";
import {
  BODY_SHAPE_OPTIONS,
  GOAL_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_NATURAL_OPTIONS,
  HEIGHT_OPTIONS,
  QUIZ_STEP_LABELS,
  STYLE_VIBE_OPTIONS,
  SUN_OPTIONS,
  TREND_OPTIONS,
  type QuizAnswers,
} from "@/lib/quiz-data";

type Step =
  | "goal"
  | "sun"
  | "hair"
  | "hair-color"
  | "height"
  | "body"
  | "style"
  | "trends"
  | "selfie";

const TOTAL_STEPS = QUIZ_STEP_LABELS.length;

function stepProgress(step: Step): number {
  const map: Record<Step, number> = {
    goal: 1,
    sun: 2,
    hair: 3,
    "hair-color": 3,
    height: 4,
    body: 5,
    style: 6,
    trends: 7,
    selfie: 8,
  };
  return (map[step] / TOTAL_STEPS) * 100;
}

function BodyShapeIcon({ shape }: { shape: string }) {
  return (
    <svg className="quiz-page__shape-icon" viewBox="0 0 40 56" aria-hidden="true">
      {shape === "hourglass" && (
        <path
          d="M20 4c-6 0-10 4-10 8s4 6 10 10 10-6 10-10-4-8-10-8zm0 20c-6 4-10 8-10 12v8c0 4 4 8 10 8s10-4 10-8v-8c0-4-4-8-10-12z"
          fill="currentColor"
          opacity="0.85"
        />
      )}
      {shape === "pear" && (
        <path
          d="M20 4c-5 0-9 4-9 8v6c0 4 5 8 9 14 4-6 9-10 9-14v-6c0-4-4-8-9-8z"
          fill="currentColor"
          opacity="0.85"
        />
      )}
      {shape === "rect" && (
        <rect x="12" y="4" width="16" height="48" rx="4" fill="currentColor" opacity="0.85" />
      )}
      {shape === "apple" && (
        <path
          d="M20 4c-7 0-12 5-12 11v4c0 6 5 10 12 10s12-4 12-10v-4c0-6-5-11-12-11zm0 33c-7 0-12 4-12 9v6h24v-6c0-5-5-9-12-9z"
          fill="currentColor"
          opacity="0.85"
        />
      )}
      {shape === "petite" && (
        <ellipse cx="20" cy="28" rx="9" ry="22" fill="currentColor" opacity="0.85" />
      )}
    </svg>
  );
}

export function QuizFlow() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<Step>("goal");
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [scores, setScores] = useState<QuizScores>(emptyScores);
  const [profile, setProfile] = useState<QuizProfile | null>(null);

  const progress = started ? stepProgress(step) : 0;

  const goToSelfie = (nextAnswers: QuizAnswers, nextScores: QuizScores) => {
    const built = buildQuizProfile(nextAnswers, nextScores);
    setProfile(built);
    saveQuizProfile(built);
    setStep("selfie");
  };

  const resetAll = () => {
    clearQuizProfile();
    setAnswers({});
    setScores(emptyScores());
    setProfile(null);
    setStep("goal");
    setStarted(false);
  };

  return (
    <div className="quiz-page">
      <header className="quiz-page__bar">
        <Link href="/" className="wordmark quiz-page__logo">
          palette<span className="me">me</span>
        </Link>
        <div className="quiz-page__track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="quiz-page__step">
          {started && step !== "selfie"
            ? `${Math.min(8, Math.round(progress / (100 / TOTAL_STEPS)))} / ${TOTAL_STEPS}`
            : started && step === "selfie"
              ? `${TOTAL_STEPS} / ${TOTAL_STEPS}`
              : ""}
        </span>
      </header>

      <main className="quiz-page__main">
        {!started && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">personal style onboarding</p>
            <h1 className="quiz-page__title">
              Let&apos;s understand <span className="scr">you</span> first
            </h1>
            <p className="quiz-page__lead">
              Eight quick steps about your goals, undertone, body, and style —
              then one selfie to reveal your colors and outfit direction.
            </p>
            <button type="button" className="btn quiz-page__start" onClick={() => setStarted(true)}>
              start the quiz
            </button>
          </div>
        )}

        {started && step === "goal" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 1 · {QUIZ_STEP_LABELS[0]}</p>
            <h2 className="quiz__qt">What is your main styling goal today?</h2>
            <div className="quiz-page__cards">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz-page__card"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, goal: opt.id }));
                    setStep("sun");
                  }}
                >
                  <span className="quiz-page__card-emoji">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {started && step === "sun" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 2 · {QUIZ_STEP_LABELS[1]}</p>
            <h2 className="quiz__qt">How does your skin react to intense sun?</h2>
            <div className="quiz__opts quiz__opts--stack">
              {SUN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, sunReaction: opt.id }));
                    setScores((s) => applyAnswer(s, opt.scores));
                    setStep("hair");
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

        {started && step === "hair" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 3 · {QUIZ_STEP_LABELS[2]}</p>
            <h2 className="quiz__qt">Is your hair in the photo your natural color?</h2>
            <div className="quiz__opts">
              {HAIR_NATURAL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt"
                  onClick={() => {
                    const next = { ...answers, naturalHair: opt.id };
                    setAnswers(next);
                    if (opt.id === "no") {
                      setStep("hair-color");
                    } else {
                      setStep("height");
                    }
                  }}
                >
                  <span className="quiz-page__opt-emoji">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {started && step === "hair-color" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 3 · natural hair</p>
            <h2 className="quiz__qt">My natural hair is closest to:</h2>
            <div className="quiz__opts">
              {HAIR_COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt"
                  onClick={() => {
                    const nextAnswers = { ...answers, naturalHairColor: opt.id };
                    const nextScores = applyAnswer(scores, opt.scores);
                    setAnswers(nextAnswers);
                    setScores(nextScores);
                    setStep("height");
                  }}
                >
                  <span className="sw" style={{ background: opt.swatch }} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {started && step === "height" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 4 · {QUIZ_STEP_LABELS[3]}</p>
            <h2 className="quiz__qt">What is your height?</h2>
            <div className="quiz__opts quiz__opts--stack">
              {HEIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz__opt quiz__opt--tall"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, height: opt.id }));
                    setStep("body");
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

        {started && step === "body" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 5 · {QUIZ_STEP_LABELS[4]}</p>
            <h2 className="quiz__qt">Which body shape best describes your frame?</h2>
            <div className="quiz-page__shapes">
              {BODY_SHAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz-page__shape"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, bodyShape: opt.id }));
                    setStep("style");
                  }}
                >
                  <BodyShapeIcon shape={opt.shape} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {started && step === "style" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 6 · {QUIZ_STEP_LABELS[5]}</p>
            <h2 className="quiz__qt">Which style best describes your everyday look?</h2>
            <div className="quiz-page__style-cards">
              {STYLE_VIBE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="quiz-page__style-card"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, styleVibe: opt.id }));
                    setStep("trends");
                  }}
                >
                  <span className="quiz-page__card-emoji">{opt.emoji}</span>
                  <span className="quiz-page__style-title">{opt.title}</span>
                  <span className="quiz-page__style-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {started && step === "trends" && (
          <div className="quiz-page__panel on">
            <p className="quiz__qn">step 7 · {QUIZ_STEP_LABELS[6]} (optional)</p>
            <h2 className="quiz__qt">Drawn to any specific trends or aesthetics?</h2>
            <div className="quiz-page__tags">
              {TREND_OPTIONS.map((opt) => {
                const active = answers.trends?.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`quiz-page__tag${active ? " quiz-page__tag--on" : ""}`}
                    onClick={() => {
                      setAnswers((a) => ({
                        ...a,
                        trends: toggleTrend(a.trends, opt.id),
                      }));
                    }}
                  >
                    <span>{opt.emoji}</span> {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="quiz-page__tag-actions">
              <button
                type="button"
                className="btn quiz-page__cta"
                onClick={() => goToSelfie(answers, scores)}
              >
                continue to selfie
              </button>
              <button
                type="button"
                className="quiz__redo"
                onClick={() => goToSelfie({ ...answers, trends: ["none"] }, scores)}
              >
                skip — just classic pieces
              </button>
            </div>
          </div>
        )}

        {started && step === "selfie" && profile && (
          <QuizSelfieStep profile={profile} onRetakeQuiz={resetAll} />
        )}
      </main>
    </div>
  );
}
