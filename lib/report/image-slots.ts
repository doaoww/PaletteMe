import type { FullReport } from "./report-schema";

export type ImageSlot = {
  slotId: string;
  prompt: string;
  promptStrength: number;
  label: string;
};

// ── Neutral draping (0.85 — needs to replace all clothing with white drape) ───

const NEUTRAL_DRAPING_PROMPT =
  `Professional color analysis studio photograph of the same person. Face, skin tone, hair color and hairstyle are exactly as in the original photo. A smooth flat plain white draping cloth covers the shoulders and chest completely, starting right below the chin and extending to the bottom of the frame. No clothing or neckline visible — only the white drape below the face. Neutral warm grey studio background. Soft even studio lighting. Clinical, clean, professional.`;

// ── Metal try-on slots ────────────────────────────────────────────────────────

export const METAL_SLOTS = [
  {
    slotId: "metal-silver",
    metal: "Silver",
    label: "Silver",
  },
  {
    slotId: "metal-gold",
    metal: "Yellow Gold",
    label: "Gold",
  },
] as const;

function buildMetalPrompt(metal: string): string {
  if (metal.toLowerCase().includes("gold")) {
    return `Same person wearing small classic yellow gold hoop earrings and a fine delicate gold chain necklace. Face, skin, hair, expression, clothing and background identical to the original photo. Natural professional portrait lighting. Elegant minimal gold jewelry.`;
  }
  return `Same person wearing small polished silver stud earrings and a delicate thin silver chain necklace. Face, skin, hair, expression, clothing and background identical to the original photo. Natural professional portrait lighting. Elegant minimal silver jewelry.`;
}

// ── Hair colour prompt ────────────────────────────────────────────────────────

function buildHairPrompt(hairColor: string, hex?: string): string {
  const hexPart = hex ? ` (${hex})` : "";
  return `Same person with ${hairColor}${hexPart} hair. Identical face, skin tone, expression and hairstyle shape, cut and length. Same clothing, background and lighting as original. Professional portrait. Natural-looking hair color with realistic highlights and strand depth.`;
}

// ── Hairstyle prompt ──────────────────────────────────────────────────────────

function buildHairStylePrompt(styleDescription: string): string {
  return `Same person with the following hairstyle: ${styleDescription}. Identical face, skin tone, expression and hair color as original. Same clothing, background and lighting. Salon-quality natural realistic hair. Professional portrait.`;
}

// ── Final look prompt ─────────────────────────────────────────────────────────

type MakeupSummary = { name: string; hex: string } | null;

function buildFinalLookPrompt(params: {
  hairColor: string;
  hairStyle: string;
  lips: MakeupSummary;
  blush: MakeupSummary;
  eyeshadow: MakeupSummary;
  outfit: string;
  jewelry: string;
  season: string;
}): string {
  const { hairColor, hairStyle, lips, blush, eyeshadow, outfit, jewelry, season } = params;
  const makeupParts = [
    lips ? `${lips.name} (${lips.hex}) lipstick` : null,
    blush ? `${blush.name} (${blush.hex}) blush` : null,
    eyeshadow ? `${eyeshadow.name} (${eyeshadow.hex}) eyeshadow` : null,
  ].filter(Boolean);
  const makeupStr = makeupParts.length ? makeupParts.join(", ") : "";

  return `Luxury fashion editorial portrait of the same person, identical facial features. ${outfit}. ${hairColor} hair, ${hairStyle}. ${jewelry} jewelry. ${makeupStr ? makeupStr + ". " : ""}${season} seasonal color palette. Soft studio lighting, high-end fashion photography.`;
}

// ── Build the full ordered image slot list ────────────────────────────────────

export function buildImageSlots(report: FullReport): ImageSlot[] {
  const { colorAnalysis, makeupComparisons, hairOptions, finalLook } = report;

  return [
    // neutral-draping MUST be first — SeasonReveal gates on it
    {
      slotId: "neutral-draping",
      prompt: NEUTRAL_DRAPING_PROMPT,
      promptStrength: 0.85,
      label: "Colour try-on",
    },

    ...METAL_SLOTS.map(m => ({
      slotId: m.slotId,
      prompt: buildMetalPrompt(m.metal),
      promptStrength: 0.28,
      label: "",
    })),

    ...hairOptions.flatMap((h, i) => [
      {
        slotId: `hair-color-${i}`,
        prompt: buildHairPrompt(h.color ?? h.name),
        promptStrength: 0.5,
        label: i === 0 ? "Hair colour" : "",
      },
      {
        slotId: `hair-style-${i}`,
        prompt: buildHairStylePrompt(h.style ?? h.name),
        promptStrength: 0.68,
        label: i === 0 ? "Hair style" : "",
      },
    ]),

    {
      slotId: "final-look",
      prompt: buildFinalLookPrompt({
        hairColor:  hairOptions[0]?.color ?? "",
        hairStyle:  hairOptions[0]?.style ?? "",
        lips:       makeupComparisons.find(m => m.category === "lips")?.goodShade ?? null,
        blush:      makeupComparisons.find(m => m.category === "blush")?.goodShade ?? null,
        eyeshadow:  makeupComparisons.find(m => m.category === "eyeshadow")?.goodShade ?? null,
        outfit:     finalLook.outfit ?? "",
        jewelry:    finalLook.jewelry ?? "",
        season:     colorAnalysis.topSeason.name,
      }),
      promptStrength: 0.88,
      label: "Your look",
    },
  ];
}
