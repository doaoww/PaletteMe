// Applies color to a named facial region using MediaPipe FaceMesh landmark indices.
// region: "lips" | "blush-left" | "blush-right" | "eyeshadow-left" | "eyeshadow-right"

import { hexToRgb, blendColor } from "./apply-draping";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

// Landmark index groups for each region
const LANDMARK_GROUPS: Record<string, number[]> = {
  lips: [
    61,185,40,39,37,0,267,269,270,409,
    291,375,321,405,314,17,84,181,91,146,
    78,95,88,178,87,14,317,402,318,324,308,
    415,310,311,312,13,82,81,80,191
  ],
  "blush-left":  [234,93,132,58,172,136,150,149,176,148,152],
  "blush-right": [454,323,361,288,397,365,379,378,400,377,152],
  "eyeshadow-left":  [246,161,160,159,158,157,173,33,7,163,144,145,153,154,155,133],
  "eyeshadow-right": [466,388,387,386,385,384,398,263,249,390,373,374,380,381,382,362],
};

export function applyMakeup(
  canvas: HTMLCanvasElement,
  landmarks: NormalizedLandmark[],
  region: keyof typeof LANDMARK_GROUPS,
  hex: string,
  alpha = 0.45
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { r, g, b } = hexToRgb(hex);
  const indices = LANDMARK_GROUPS[region];
  if (!indices) return;

  // Build convex hull polygon from landmark points
  const points = indices.map(i => ({
    x: Math.round(landmarks[i].x * canvas.width),
    y: Math.round(landmarks[i].y * canvas.height),
  }));

  // Draw filled polygon on offscreen canvas, then blend pixel-by-pixel
  const offscreen = document.createElement("canvas");
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;
  const offCtx = offscreen.getContext("2d")!;

  offCtx.beginPath();
  offCtx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) offCtx.lineTo(points[i].x, points[i].y);
  offCtx.closePath();
  offCtx.fillStyle = `rgb(${r},${g},${b})`;
  offCtx.fill();

  // Get bounding box
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const x0 = Math.max(0, Math.min(...xs));
  const y0 = Math.max(0, Math.min(...ys));
  const w  = Math.min(canvas.width  - x0, Math.max(...xs) - x0 + 1);
  const h  = Math.min(canvas.height - y0, Math.max(...ys) - y0 + 1);

  const base    = ctx.getImageData(x0, y0, w, h);
  const overlay = offCtx.getImageData(x0, y0, w, h);
  const bd = base.data;
  const od = overlay.data;

  for (let i = 0; i < bd.length; i += 4) {
    // Only blend where the offscreen mask painted (alpha > 0)
    if (od[i + 3] > 0) {
      const blushAlpha = region.startsWith("blush") ? alpha * 0.7 : alpha;
      bd[i]     = blendColor(bd[i], od[i], blushAlpha);
      bd[i + 1] = blendColor(bd[i + 1], od[i + 1], blushAlpha);
      bd[i + 2] = blendColor(bd[i + 2], od[i + 2], blushAlpha);
    }
  }
  ctx.putImageData(base, x0, y0);
}
