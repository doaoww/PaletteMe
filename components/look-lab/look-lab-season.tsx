"use client";

import { useEffect, useRef, useState } from "react";
import { LookLabBlock } from "./look-lab-block";
import { applyDraping } from "./transforms/apply-draping";
import type { SeasonCard } from "@/lib/look-lab/look-lab-schema";

// Fallback flat-color draping hex for each season (used while ring images load)
const SEASON_DRAPING_FALLBACK: Record<string, string> = {
  "True Spring":   "#FE6F5E",
  "Light Spring":  "#FFB347",
  "Bright Spring": "#FF69B4",
  "True Summer":   "#8B9DC3",
  "Light Summer":  "#D8B4CC",
  "Soft Summer":   "#9B8EA0",
  "True Autumn":   "#B7410E",
  "Dark Autumn":   "#7B3F00",
  "Soft Autumn":   "#C19A6B",
  "True Winter":   "#0047AB",
  "Dark Winter":   "#1C1C4B",
  "Bright Winter": "#C20018",
};

const ALL_SEASONS = [
  "True Spring",  "Light Spring",  "Bright Spring",
  "True Summer",  "Light Summer",  "Soft Summer",
  "True Autumn",  "Dark Autumn",   "Soft Autumn",
  "True Winter",  "Dark Winter",   "Bright Winter",
];

// Center hole radius as fraction of canvas size — face fills this area
const HOLE_RADIUS_RATIO = 0.31;

type SeasonCircleProps = {
  photoDataUrl: string;
  seasonName: string;
  ringImageUrl: string | null;
  isBest: boolean;
  isAlternative: boolean;
  confidence?: number;
};

function SeasonCircle({
  photoDataUrl,
  seasonName,
  ringImageUrl,
  isBest,
  isAlternative,
  confidence,
}: SeasonCircleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const faceImg = new Image();
    faceImg.onload = () => {
      const size = faceImg.width;
      canvas.width = size;
      canvas.height = size;

      // Square-crop face (top portion = face area)
      ctx.drawImage(faceImg, 0, 0, size, size, 0, 0, size, size);

      if (!ringImageUrl) {
        // Fallback: flat draping tint on collar region
        applyDraping(canvas, SEASON_DRAPING_FALLBACK[seasonName] ?? "#888888", 0.45);
        return;
      }

      const ringImg = new Image();
      ringImg.crossOrigin = "anonymous";
      ringImg.onload = () => {
        // Build ring layer on an offscreen canvas
        const off = document.createElement("canvas");
        off.width = size;
        off.height = size;
        const offCtx = off.getContext("2d");
        if (!offCtx) return;

        // Draw the season ring image
        offCtx.drawImage(ringImg, 0, 0, size, size);

        // Punch out center circle to reveal face underneath
        offCtx.globalCompositeOperation = "destination-out";
        offCtx.beginPath();
        offCtx.arc(size / 2, size / 2, size * HOLE_RADIUS_RATIO, 0, Math.PI * 2);
        offCtx.fill();

        // Composite ring onto face
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(off, 0, 0);
      };
      ringImg.onerror = () => {
        // Ring failed to load — apply flat draping fallback
        applyDraping(canvas, SEASON_DRAPING_FALLBACK[seasonName] ?? "#888888", 0.45);
      };
      ringImg.src = ringImageUrl;
    };
    faceImg.src = photoDataUrl;
  }, [photoDataUrl, ringImageUrl, seasonName]);

  const cls = [
    "season-circle",
    isBest      ? "season-circle--best" : "",
    isAlternative && !isBest ? "season-circle--alt" : "",
    !isBest && !isAlternative ? "season-circle--other" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      <div className="season-circle__ring">
        <canvas ref={canvasRef} className="season-circle__canvas" />
        {isBest && <span className="season-circle__crown">★</span>}
      </div>
      <span className="season-circle__name">{seasonName}</span>
      {confidence !== undefined && (
        <span className="season-circle__conf">{confidence}%</span>
      )}
    </div>
  );
}

type LookLabSeasonProps = {
  photoDataUrl: string;
  best: SeasonCard;
  alternatives: SeasonCard[];
};

export function LookLabSeason({ photoDataUrl, best, alternatives }: LookLabSeasonProps) {
  const [ringUrls, setRingUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/look-lab/season-rings")
      .then((r) => r.ok ? r.json() : null)
      .then((data: { urls: Record<string, string> } | null) => {
        if (data?.urls) setRingUrls(data.urls);
      })
      .catch(() => {});
  }, []);

  const aiMap = new Map<string, SeasonCard>();
  aiMap.set(best.season, best);
  for (const alt of alternatives) aiMap.set(alt.season, alt);

  return (
    <LookLabBlock title="Your Colour Season">
      <div className="season-wheel__best-label">
        <span className="season-wheel__best-name">{best.season}</span>
        <span className="season-wheel__best-conf">{best.confidence}%</span>
      </div>
      <p className="season-wheel__best-explanation">{best.explanation}</p>

      <div className="season-wheel">
        {ALL_SEASONS.map((name) => {
          const ai = aiMap.get(name);
          return (
            <SeasonCircle
              key={name}
              photoDataUrl={photoDataUrl}
              seasonName={name}
              ringImageUrl={ringUrls[name] ?? null}
              isBest={name === best.season}
              isAlternative={alternatives.some((a) => a.season === name)}
              confidence={ai?.confidence}
            />
          );
        })}
      </div>
    </LookLabBlock>
  );
}
