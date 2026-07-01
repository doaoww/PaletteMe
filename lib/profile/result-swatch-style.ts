import type { CSSProperties } from "react";

export type ResultSwatchStyleInput = {
  hex: string;
  size: number;
  border?: string;
  gradient?: string;
  shape?: "circle" | "rect";
};

const PREMIUM_SWATCH_SHADOW =
  "inset 0 1px 2px rgba(255,255,255,0.44), inset 0 -14px 22px rgba(0,0,0,0.1), 0 12px 20px -14px rgba(28,22,25,0.34)";

export function buildResultSwatchStyle({
  hex,
  size,
  border,
  gradient,
  shape = "circle",
}: ResultSwatchStyleInput): CSSProperties {
  const isRect = shape === "rect";

  return {
    width: isRect ? "100%" : size,
    height: size,
    borderRadius: isRect ? 14 : "50%",
    background: gradient ?? hex,
    boxShadow: PREMIUM_SWATCH_SHADOW,
    ...(border ? { border: `1px solid ${border}` } : {}),
  };
}
