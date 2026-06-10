"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { AnalysisResult } from "@/lib/analysis";
import {
  formatProfileForAI,
  type QuizProfile,
} from "@/lib/quiz";
import { resizeImageForAnalysis } from "@/lib/resize-image";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

type Phase = "idle" | "preview" | "analyzing" | "done" | "error";

type Props = {
  profile: QuizProfile;
  onRetakeQuiz: () => void;
};

export function QuizSelfieStep({ profile, onRetakeQuiz }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (next: File) => {
      if (!ACCEPT.split(",").includes(next.type)) {
        setError("Only JPG, PNG, or WebP images are supported.");
        setPhase("error");
        return;
      }
      if (next.size > MAX_BYTES) {
        setError("Image must be 10 MB or smaller.");
        setPhase("error");
        return;
      }
      const prepared = await resizeImageForAnalysis(next);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(prepared);
      setPreviewUrl(URL.createObjectURL(prepared));
      setResult(null);
      setError(null);
      setPhase("preview");
    },
    [previewUrl]
  );

  const analyze = async () => {
    if (!file) return;
    setPhase("analyzing");
    setError(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append(
      "quizHint",
      JSON.stringify({
        seasonId: profile.seasonId,
        seasonName: profile.seasonName,
        scores: profile.scores,
        undertoneHint: profile.undertoneHint,
        profileSummary: formatProfileForAI(profile),
      })
    );

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed. Please try again.");
      setResult(data.result as AnalysisResult);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  if (phase === "done" && result) {
    const { season, subSeason, traits, confidence, summary, tips } = result;
    return (
      <div className="quiz-page__panel on quiz-page__result">
        <p className="quiz__qn">your color profile</p>
        <h2 className="quiz__result-name">
          <span className="scr">{season.name}</span>
        </h2>
        <p className="quiz-page__traits">
          {subSeason} · {traits.undertone} undertone · {confidence}% confidence
        </p>
        <div className="quiz__result-pal">
          {season.palette.map((color) => (
            <i key={color} style={{ background: color }} />
          ))}
        </div>
        <p className="quiz-page__result-copy">{summary}</p>
        {tips.length > 0 && (
          <ul className="quiz-page__tips">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        )}
        <Link href="/#waitlist" className="btn quiz-page__cta">
          join the waitlist
        </Link>
        <button type="button" className="quiz__redo" onClick={onRetakeQuiz}>
          retake quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-page__panel on quiz-page__selfie">
      <p className="quiz__qn">final step</p>
      <h2 className="quiz__qt">Drop your selfie to reveal your colors</h2>
      <p className="quiz-page__selfie-lead">
        We&apos;ll merge your quiz answers with AI vision — undertone, palette,
        and outfit direction tailored to you.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) handleFile(picked);
        }}
      />

      <div
        role="button"
        tabIndex={0}
        className={`quiz-page__drop${dragOver ? " quiz-page__drop--over" : ""}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {previewUrl ? (
          <div className="quiz-page__drop-preview">
            <Image src={previewUrl} alt="Selfie preview" fill className="object-cover" unoptimized />
            {phase === "analyzing" && (
              <div className="quiz-page__drop-overlay">
                <div className="quiz-page__spinner" />
                <p>please wait, this may take a few seconds</p>
              </div>
            )}
          </div>
        ) : (
          <div className="quiz-page__drop-empty">
            <span className="quiz-page__drop-icon">📸</span>
            <p>Drop your selfie here, or click to browse</p>
            <small>JPG, PNG · max 10 MB · natural light, no filters</small>
          </div>
        )}
      </div>

      {phase === "preview" && (
        <button type="button" className="btn quiz-page__cta" onClick={analyze}>
          reveal my colors
        </button>
      )}

      {phase === "analyzing" && (
        <p className="quiz-page__calc-msg" style={{ textAlign: "center", marginTop: "16px" }}>
          Merging quiz data with your photo…
        </p>
      )}

      {error && (
        <div className="quiz-page__error">
          <p>{error}</p>
          <button
            type="button"
            className="quiz__redo"
            onClick={() => {
              setError(null);
              setPhase(file ? "preview" : "idle");
            }}
          >
            try again
          </button>
        </div>
      )}
    </div>
  );
}
