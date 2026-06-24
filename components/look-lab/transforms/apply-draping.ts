// Applies a colored rectangle overlay to the lower collar region of a canvas.
// Used for color season draping and metal comparisons.

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const expanded = clean.length === 3
    ? clean.split("").map(c => c + c).join("")
    : clean;
  const num = parseInt(expanded, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function blendColor(base: number, overlay: number, alpha: number): number {
  return Math.round(base * (1 - alpha) + overlay * alpha);
}

export function applyDraping(
  canvas: HTMLCanvasElement,
  hex: string,
  alpha = 0.55
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { r, g, b } = hexToRgb(hex);
  // Cover bottom 28% of canvas — simulates fabric near the collar
  const yStart = Math.floor(canvas.height * 0.72);
  const height = canvas.height - yStart;
  const imageData = ctx.getImageData(0, yStart, canvas.width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = blendColor(data[i], r, alpha);
    data[i + 1] = blendColor(data[i + 1], g, alpha);
    data[i + 2] = blendColor(data[i + 2], b, alpha);
  }
  ctx.putImageData(imageData, 0, yStart);
}
