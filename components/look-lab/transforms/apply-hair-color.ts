// Hue-shifts the hair region using MediaPipe segmentation mask.
// Falls back to top-40% region heuristic if segmentation unavailable.

import { hexToRgb, blendColor } from "./apply-draping";

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

export function applyHairColor(
  canvas: HTMLCanvasElement,
  targetHex: string,
  segmentationMask?: ImageData | null,
  alpha = 0.6
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const target = hexToRgb(targetHex);
  const [th, ts, tl] = rgbToHsl(target.r, target.g, target.b);

  // Determine region: use segmentation mask or top-40% heuristic
  const useTopHeuristic = !segmentationMask;
  const y0 = 0;
  const h  = useTopHeuristic ? Math.floor(canvas.height * 0.40) : canvas.height;
  const imageData = ctx.getImageData(0, y0, canvas.width, h);
  const data = imageData.data;
  const maskData = segmentationMask?.data;

  for (let i = 0; i < data.length; i += 4) {
    // For segmentation mask: only process pixels where mask value > 128
    if (maskData) {
      const maskIdx = (i / 4) * 4;
      if (maskData[maskIdx] < 128) continue;
    }
    const [, , l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    // Preserve lightness, shift to target hue+saturation
    const [nr, ng, nb] = hslToRgb(th, ts * 0.85, l);
    data[i]     = blendColor(data[i], nr, alpha);
    data[i + 1] = blendColor(data[i + 1], ng, alpha);
    data[i + 2] = blendColor(data[i + 2], nb, alpha);
  }
  ctx.putImageData(imageData, 0, y0);
}
