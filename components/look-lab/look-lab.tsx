"use client";

import { useCallback, useEffect, useState } from "react";
import { LookLabSeason } from "./look-lab-season";
import { LookLabBlock } from "./look-lab-block";
import { LookLabCard } from "./look-lab-card";
import { LookLabContrast } from "./look-lab-contrast";
import { useMediaPipe } from "./use-mediapipe";
import { applyDraping } from "./transforms/apply-draping";
import { applyMakeup } from "./transforms/apply-makeup";
import { applyHairColor } from "./transforms/apply-hair-color";
import type { LookLabData } from "@/lib/look-lab-schema";
import "./look-lab.css";

type LookLabProps = {
  lookLab: LookLabData;
  photoDataUrl: string;
  /** If false, shows only Block 1 (Color Season) with others locked */
  unlocked: boolean;
};

export function LookLab({ lookLab, photoDataUrl, unlocked }: LookLabProps) {
  const { faceLandmarker, ready, error } = useMediaPipe();

  const [hairstyles, setHairstyles] = useState(lookLab.hairstyles);

  useEffect(() => {
    if (!unlocked || !photoDataUrl) return;
    if (hairstyles.every(s => s.generatedImageUrl)) return; // all already generated

    const abortController = new AbortController();
    fetch("/api/look-lab/hairstyles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoDataUrl, hairstyles }),
      signal: abortController.signal,
    })
      .then(r => r.ok ? r.json() : null)
      .then((data: { hairstyles: typeof hairstyles } | null) => {
        if (data?.hairstyles) setHairstyles(data.hairstyles);
      })
      .catch(() => {});

    return () => abortController.abort();
  }, [unlocked, photoDataUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Memoised handler factory for makeup transforms
  const makeMakeupHandler = useCallback(
    (region: "lips" | "blush-left" | "blush-right" | "eyeshadow-left" | "eyeshadow-right", hex: string) =>
      (canvas: HTMLCanvasElement) => {
        if (!faceLandmarker) return;
        const result = faceLandmarker.detect(canvas);
        if (!result.faceLandmarks[0]) return;
        applyMakeup(canvas, result.faceLandmarks[0], region, hex);
      },
    [faceLandmarker]
  );

  const makeBlushHandler = useCallback(
    (hex: string) => (canvas: HTMLCanvasElement) => {
      if (!faceLandmarker) return;
      const result = faceLandmarker.detect(canvas);
      if (!result.faceLandmarks[0]) return;
      applyMakeup(canvas, result.faceLandmarks[0], "blush-left", hex, 0.35);
      applyMakeup(canvas, result.faceLandmarks[0], "blush-right", hex, 0.35);
    },
    [faceLandmarker]
  );

  const makeEyeshadowHandler = useCallback(
    (hex: string) => (canvas: HTMLCanvasElement) => {
      if (!faceLandmarker) return;
      const result = faceLandmarker.detect(canvas);
      if (!result.faceLandmarks[0]) return;
      applyMakeup(canvas, result.faceLandmarks[0], "eyeshadow-left", hex, 0.4);
      applyMakeup(canvas, result.faceLandmarks[0], "eyeshadow-right", hex, 0.4);
    },
    [faceLandmarker]
  );

  const makeHairHandler = useCallback(
    (hex: string) => (canvas: HTMLCanvasElement) => {
      applyHairColor(canvas, hex); // falls back to top-40% heuristic — accurate enough for comparisons
    },
    []
  );

  const makeMetalHandler = useCallback(
    (hex: string) => (canvas: HTMLCanvasElement) => applyDraping(canvas, hex, 0.4),
    []
  );

  if (!ready && !error) {
    return <div className="look-lab look-lab--loading">Loading your visual analysis…</div>;
  }

  if (error) {
    return <div className="look-lab look-lab--error">Could not load visual transforms. Try refreshing.</div>;
  }

  return (
    <div className="look-lab">
      {/* Block 1 — always visible */}
      <LookLabSeason
        photoDataUrl={photoDataUrl}
        best={lookLab.colorSeason.best}
        alternatives={lookLab.colorSeason.alternatives}
      />

      {!unlocked && (
        <div className="look-lab__locked-hint">
          <p>Unlock your full Look Lab — metals, contrast, makeup, hair colour, and hairstyles.</p>
        </div>
      )}

      {unlocked && (
        <>
          {/* Block 2 — Metals */}
          <LookLabBlock title="Metals">
            <LookLabCard
              key={`gold-${ready}`}
              photoDataUrl={photoDataUrl}
              label={`Gold ${lookLab.metals.gold.score}%`}
              verdict={lookLab.metals.gold.score >= 60 ? "best" : "okay"}
              explanation={lookLab.metals.gold.explanation}
              onCanvasReady={makeMetalHandler("#D4AF37")}
            />
            <LookLabCard
              key={`silver-${ready}`}
              photoDataUrl={photoDataUrl}
              label={`Silver ${lookLab.metals.silver.score}%`}
              verdict={lookLab.metals.silver.score >= 60 ? "okay" : "avoid"}
              explanation={lookLab.metals.silver.explanation}
              onCanvasReady={makeMetalHandler("#C0C0C0")}
            />
          </LookLabBlock>

          {/* Block 3 — Contrast */}
          <LookLabContrast
            photoDataUrl={photoDataUrl}
            level={lookLab.contrast.level}
            explanation={lookLab.contrast.explanation}
          />

          {/* Block 4 — Makeup */}
          <LookLabBlock title="Blush">
            {lookLab.blush.map(opt => (
              <LookLabCard
                key={`${opt.name}-${ready}`}
                photoDataUrl={photoDataUrl}
                label={opt.name}
                verdict={opt.verdict}
                explanation={opt.explanation}
                onCanvasReady={makeBlushHandler(opt.hex)}
              />
            ))}
          </LookLabBlock>

          <LookLabBlock title="Lips">
            {lookLab.lips.map(opt => (
              <LookLabCard
                key={`${opt.name}-${ready}`}
                photoDataUrl={photoDataUrl}
                label={opt.name}
                verdict={opt.verdict}
                explanation={opt.explanation}
                onCanvasReady={makeMakeupHandler("lips", opt.hex)}
              />
            ))}
          </LookLabBlock>

          <LookLabBlock title="Eye Shadow">
            {lookLab.eyeshadow.map(opt => (
              <LookLabCard
                key={`${opt.name}-${ready}`}
                photoDataUrl={photoDataUrl}
                label={opt.name}
                verdict={opt.verdict}
                explanation={opt.explanation}
                onCanvasReady={makeEyeshadowHandler(opt.hex)}
              />
            ))}
          </LookLabBlock>

          {/* Block 5 — Hair Color */}
          <LookLabBlock title="Hair Colour">
            {lookLab.hairColor.map(opt => (
              <LookLabCard
                key={`${opt.name}-${ready}`}
                photoDataUrl={photoDataUrl}
                label={opt.name}
                verdict={opt.verdict}
                explanation={opt.explanation}
                onCanvasReady={makeHairHandler(opt.hex)}
              />
            ))}
          </LookLabBlock>

          {/* Block 6 — Hairstyles */}
          <LookLabBlock title="Hairstyles">
            {hairstyles.map(style => (
              <div key={style.name} className="look-lab-hairstyle-card">
                {style.generatedImageUrl ? (
                  <img
                    src={style.generatedImageUrl}
                    alt={style.name}
                    className="look-lab-hairstyle-card__img"
                  />
                ) : (
                  <div className="look-lab-hairstyle-card__placeholder">Generating…</div>
                )}
                <span className="look-lab-card__label">{style.name}</span>
                <p className="look-lab-card__explanation">{style.faceShapeReason}</p>
              </div>
            ))}
          </LookLabBlock>
        </>
      )}
    </div>
  );
}
