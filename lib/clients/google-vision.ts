// Google Cloud Vision API — dominant color extraction from product images
// Used to verify that fetched products actually match the user's palette.

const VISION_URL = "https://vision.googleapis.com/v1/images:annotate";

export type DominantColor = {
  hex: string;
  score: number;       // 0–1, overall aesthetic weight
  pixelFraction: number; // 0–1, percentage of image pixels
};

export async function extractDominantColors(
  imageUrl: string
): Promise<DominantColor[]> {
  const key = process.env.GOOGLE_VISION_API_KEY;
  if (!key) return [];

  try {
    const res = await fetch(`${VISION_URL}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { source: { imageUri: imageUrl } },
            features: [{ type: "IMAGE_PROPERTIES", maxResults: 8 }],
          },
        ],
      }),
    });

    if (!res.ok) return [];

    const data = await res.json() as {
      responses?: Array<{
        imagePropertiesAnnotation?: {
          dominantColors?: {
            colors?: Array<{
              color: { red: number; green: number; blue: number };
              score: number;
              pixelFraction: number;
            }>;
          };
        };
      }>;
    };

    const colors =
      data.responses?.[0]?.imagePropertiesAnnotation?.dominantColors?.colors ?? [];

    return colors.map(({ color, score, pixelFraction }) => ({
      hex: rgbToHex(color.red, color.green, color.blue),
      score,
      pixelFraction,
    }));
  } catch {
    return [];
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.round(c).toString(16).padStart(2, "0"))
      .join("")
  );
}

// Returns true if at least one dominant color is close enough to any palette color.
// threshold: max Euclidean distance in RGB space (0–441).
export function productMatchesPalette(
  dominantColors: DominantColor[],
  paletteHexes: string[],
  threshold = 60
): boolean {
  for (const { hex, score } of dominantColors) {
    if (score < 0.05) continue; // ignore minor colors
    for (const palette of paletteHexes) {
      if (colorDistance(hex, palette) < threshold) return true;
    }
  }
  return false;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function colorDistance(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}
