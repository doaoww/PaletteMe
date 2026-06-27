"use client";

import { useState } from "react";
import type { ColorDiagnostics } from "@/lib/report/color-diagnostics-schema";
import type { BestColor } from "@/lib/report/report-schema";
import { FamilySwiper } from "./family-swiper";
import { BestColorsSlide } from "./best-colors-slide";
import "./color-family-diagnostics.css";

type Step = "families" | "best-colors";

type Props = {
  neutralDrapingUrl: string;
  colorDiagnostics: ColorDiagnostics;
  bestColors: BestColor[];
  onComplete: () => void;
};

export function ColorFamilyDiagnostics({ neutralDrapingUrl, colorDiagnostics, bestColors, onComplete }: Props) {
  const [step, setStep] = useState<Step>("families");

  return (
    <div className="cfd">
      {step === "families" && (
        <FamilySwiper
          neutralDrapingUrl={neutralDrapingUrl}
          families={colorDiagnostics.families}
          neutrals={colorDiagnostics.neutrals ?? []}
          onComplete={() => setStep("best-colors")}
        />
      )}
      {step === "best-colors" && (
        <BestColorsSlide
          neutralDrapingUrl={neutralDrapingUrl}
          bestColors={bestColors}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}
