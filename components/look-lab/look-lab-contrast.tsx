"use client";

import { useEffect, useRef } from "react";

type LookLabContrastProps = {
  photoDataUrl: string;
  level: string;
  explanation: string;
};

export function LookLabContrast({ photoDataUrl, level, explanation }: LookLabContrastProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.onload = () => {
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = "grayscale(100%)";
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";
    };
    img.src = photoDataUrl;
  }, [photoDataUrl]);

  return (
    <section className="look-lab-contrast">
      <h3 className="look-lab-block__title">Contrast</h3>
      <div className="look-lab-contrast__inner">
        <canvas ref={canvasRef} className="look-lab-contrast__canvas" />
        <div className="look-lab-contrast__meta">
          <span className="look-lab-contrast__level">{level.replace("-", " ")}</span>
          <p className="look-lab-contrast__explanation">{explanation}</p>
        </div>
      </div>
    </section>
  );
}
