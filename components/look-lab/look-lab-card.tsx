"use client";

import { useEffect, useRef } from "react";
import type { ColorOption, SeasonCard } from "@/lib/look-lab-schema";

type Verdict = "best" | "okay" | "avoid";

const VERDICT_ICON: Record<Verdict, string> = { best: "✓", okay: "~", avoid: "✗" };
const VERDICT_CLASS: Record<Verdict, string> = {
  best:  "look-lab-card--best",
  okay:  "look-lab-card--okay",
  avoid: "look-lab-card--avoid",
};

type LookLabCardProps = {
  photoDataUrl: string;
  label: string;
  verdict: Verdict;
  explanation: string;
  confidence?: number;
  size?: "large" | "small";
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
};

export function LookLabCard({
  photoDataUrl,
  label,
  verdict,
  explanation,
  confidence,
  size = "large",
  onCanvasReady,
}: LookLabCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.onload = () => {
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      onCanvasReady?.(canvas);
    };
    img.src = photoDataUrl;
  }, [photoDataUrl, onCanvasReady]);

  return (
    <div className={`look-lab-card ${VERDICT_CLASS[verdict]} look-lab-card--${size}`}>
      <div className="look-lab-card__image-wrap">
        <canvas ref={canvasRef} className="look-lab-card__canvas" />
        <span className="look-lab-card__verdict-badge">
          {VERDICT_ICON[verdict]}
        </span>
      </div>
      <div className="look-lab-card__meta">
        <span className="look-lab-card__label">
          {label}
          {confidence !== undefined && (
            <span className="look-lab-card__confidence"> {confidence}%</span>
          )}
        </span>
        <p className="look-lab-card__explanation">{explanation}</p>
      </div>
    </div>
  );
}

// Suppress unused import warnings — these types are re-exported for consumer convenience
export type { ColorOption, SeasonCard };
