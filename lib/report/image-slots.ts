import type { FullReport } from "./report-schema";

export type ImageSlot = {
  slotId: string;
  prompt: string;
  label: string;
};

// ── Neutral draping ───────────────────────────────────────────────────────────

const NEUTRAL_DRAPING_PROMPT =
  "Color analysis studio photograph of the same person. " +
  "Hair color, texture and hairstyle identical to the reference photo — unchanged. " +
  "A smooth, flat, wrinkle-free, matte white draping cloth covers the shoulders and chest completely " +
  "from just below the chin to the bottom of the frame. " +
  "The white fabric is perfectly flat with no folds, no creases and no shadows. " +
  "No clothing visible. Plain warm grey studio background. Soft even diffused studio lighting. " +
  "Do not change the face, facial features, skin tone or expression — keep them exactly as in the reference photo.";

// ── Metal try-on slots ────────────────────────────────────────────────────────

export const METAL_SLOTS = [
  { slotId: "metal-silver",      metal: "Silver",      label: "Silver"      },
  { slotId: "metal-yellow-gold", metal: "Yellow Gold", label: "Yellow Gold" },
] as const;

const METAL_JEWELRY: Record<string, string> = {
  "Silver":      "small polished silver stud earrings and a delicate thin silver chain necklace",
  "Yellow Gold": "small delicate yellow gold hoop earrings and a thin yellow gold chain necklace",
};

function buildMetalPrompt(metal: string): string {
  const jewelry = METAL_JEWELRY[metal] ?? METAL_JEWELRY["Silver"];
  return (
    "Studio photograph of the same person. " +
    `${jewelry} added. ` +
    "Hair color, hairstyle, clothing and background identical to the reference photo — unchanged. " +
    "Do not change the face, facial features, skin tone or expression — keep them exactly as in the reference photo."
  );
}

// ── Hair colour prompt ────────────────────────────────────────────────────────

function buildHairPrompt(hairColor: string, hex?: string): string {
  const color = hex ? `${hairColor} (${hex})` : hairColor;
  return (
    "Studio photograph of the same person. " +
    `Hair recolored to ${color} — same hairstyle, same cut, same length, only the color changes. ` +
    "Clothing and background identical to the reference photo — unchanged. " +
    "Do not change the face, facial features, skin tone or expression — keep them exactly as in the reference photo."
  );
}

// ── Hairstyle prompt ──────────────────────────────────────────────────────────

function buildHairStylePrompt(styleDescription: string): string {
  return (
    "Studio photograph of the same person. " +
    `Hairstyle changed to: ${styleDescription}. ` +
    "Hair color identical to the reference photo — unchanged. " +
    "Clothing and background identical to the reference photo — unchanged. " +
    "Do not change the face, facial features, skin tone or expression — keep them exactly as in the reference photo."
  );
}

// ── Makeup contrast prompts ───────────────────────────────────────────────────

function buildMakeupPrompt(
  category: "lips" | "blush" | "eyeshadow",
  shade: { name: string; hex: string },
): string {
  const keep = "Hair color, hairstyle, clothing and background identical to the reference photo — unchanged.";

  switch (category) {
    case "lips":
      return (
        "Studio photograph of the same person. " +
        `${shade.name} (${shade.hex}) lipstick applied to the lips. ` +
        `${keep} ` +
        "Do not change the face, skin tone, expression, eyes, brows or cheeks — keep them exactly as in the reference photo."
      );
    case "blush":
      return (
        "Edit the reference image only.\n\n" +
        "Do not regenerate or reinterpret the portrait.\n\n" +
        `The ONLY modification is adding a natural-looking ${shade.name} (${shade.hex}) blush.\n\n` +
        "Blend the blush seamlessly into the skin with soft feathered edges.\n\n" +
        "Place it naturally on the apples of the cheeks, softly diffusing upward toward the temples.\n\n" +
        "The blush should look like real makeup professionally applied by a makeup artist.\n\n" +
        "Keep the effect subtle, soft, and realistic with low opacity.\n\n" +
        "Avoid harsh edges, circular patches, excessive saturation, or obvious makeup.\n\n" +
        "Hair color, hairstyle, clothing, background, facial features, skin texture, skin tone, lighting, expression, and framing must remain exactly unchanged.\n\n" +
        "No retouching.\nNo beauty filters.\nNo skin smoothing.\nNo other edits.\n\n" +
        "Add the appearance of healthy natural cheek color rather than visible makeup."
      );
    case "eyeshadow":
      return (
        "Edit the reference image only.\n\n" +
        "Do not regenerate or reinterpret the portrait.\n\n" +
        `The ONLY modification is adding a natural-looking ${shade.name} (${shade.hex}) eyeshadow.\n\n` +
        "Blend the eyeshadow seamlessly onto the eyelids with soft feathered edges.\n\n" +
        "Apply it naturally across the eyelids, softly diffusing into the crease.\n\n" +
        "The eyeshadow should look like real makeup professionally applied by a makeup artist.\n\n" +
        "Keep the effect subtle, soft, and realistic with low opacity.\n\n" +
        "Avoid harsh edges, excessive saturation, or obvious heavy makeup.\n\n" +
        "Hair color, hairstyle, clothing, background, facial features, skin texture, skin tone, lighting, expression, lips, brows, cheeks, and framing must remain exactly unchanged.\n\n" +
        "No retouching.\nNo beauty filters.\nNo skin smoothing.\nNo other edits.\n\n" +
        "Add the appearance of a subtle, polished eye look rather than visible heavy makeup."
      );
  }
}

// ── Beard prompt ─────────────────────────────────────────────────────────────

function buildBeardPrompt(style: string): string {
  return (
    "Studio photograph of the same person. " +
    `Facial hair changed to: ${style}. ` +
    "Hair color, hairstyle, clothing and background identical to the reference photo — unchanged. " +
    "Do not change the face, skin tone or expression — keep them exactly as in the reference photo."
  );
}

// ── Glasses prompt ────────────────────────────────────────────────────────────

function buildGlassesPrompt(shape: string, colors: string): string {
  return (
    "Studio photograph of the same person wearing " +
    `${shape} eyeglasses with ${colors} frame. ` +
    "Clothing and background identical to the reference photo — unchanged. " +
    "Do not change the face, facial features, skin tone or expression — keep them exactly as in the reference photo."
  );
}

// ── Final look prompt ─────────────────────────────────────────────────────────

type MakeupSummary = { name: string; hex: string } | null;
type ColorSummary  = { hex: string; name: string } | null;

function buildFinalLookPrompt(params: {
  hairColor:  string;
  bestColor:  ColorSummary;
}): string {
  const { hairColor, bestColor } = params;
  const topColor = bestColor ? `${bestColor.name} (${bestColor.hex})` : "warm neutral";

  return (
    "Edit the reference image only.\n\n" +
    "Do not regenerate or reinterpret the portrait.\n\n" +
    `The ONLY modifications are: (1) hair recolored to ${hairColor} — same hairstyle, same cut, same length, only the color changes; ` +
    `(2) clothing changed to a simple plain ${topColor} fitted top with no patterns or prints.\n\n` +
    "Face, skin tone, expression, makeup, hairstyle, and background must remain exactly unchanged.\n\n" +
    "No retouching. No beauty filters. No skin smoothing. No other edits."
  );
}

// ── Build the full ordered image slot list ────────────────────────────────────

export function buildImageSlots(
  report: FullReport,
  wardrobeType: "woman" | "man" | "other" = "woman",
  sections: string[] = [],
): ImageSlot[] {
  const { colorAnalysis, makeupComparisons, hairOptions } = report;
  const showMakeup = wardrobeType !== "man";
  // Empty sections array means "all" (user didn't customise)
  const has = (s: string) => sections.length === 0 || sections.includes(s);

  return [
    // neutral-draping MUST be first — SeasonReveal gates on it
    {
      slotId: "neutral-draping",
      prompt: NEUTRAL_DRAPING_PROMPT,
      label:  "Colour try-on",
    },

    ...(has("colors") ? METAL_SLOTS.map(m => ({
      slotId: m.slotId,
      prompt: buildMetalPrompt(m.metal),
      label:  "",
    })) : []),

    // Makeup: only lips + blush (eyeshadow removed)
    ...(showMakeup && has("makeup")
      ? (["lips", "blush"] as const).flatMap(cat => {
          const comp = makeupComparisons.find(m => m.category === cat);
          if (!comp) return [];
          return [
            {
              slotId: `makeup-${cat}-good`,
              prompt: buildMakeupPrompt(cat, comp.goodShade),
              label:  "",
            },
            {
              slotId: `makeup-${cat}-bad`,
              prompt: buildMakeupPrompt(cat, comp.badShade),
              label:  "",
            },
          ];
        })
      : []),

    ...(!showMakeup && report.grooming?.options
      ? report.grooming.options.map((opt, i) => ({
          slotId: `beard-${i}`,
          prompt: buildBeardPrompt(opt.style),
          label:  i === 0 ? "Beard" : "",
        }))
      : []),

    ...(has("glasses") ? (report.glasses?.cards ?? []).map((card, i) => ({
      slotId: `glasses-${i}`,
      prompt: buildGlassesPrompt(card.shape, card.colors),
      label:  i === 0 ? "Glasses" : "",
    })) : []),

    ...(has("hair") ? hairOptions.flatMap((h, i) => [
      {
        slotId: `hair-color-${i}`,
        prompt: buildHairPrompt(h.color ?? h.name),
        label:  i === 0 ? "Hair colour" : "",
      },
      {
        slotId: `hair-style-${i}`,
        prompt: buildHairStylePrompt(h.style ?? h.name),
        label:  i === 0 ? "Hair style" : "",
      },
    ]) : []),

    {
      slotId: "final-look",
      prompt: buildFinalLookPrompt({
        hairColor: has("hair") ? (hairOptions[0]?.color ?? "") : "",
        bestColor: colorAnalysis.bestColors.find(c => c.isBest) ?? colorAnalysis.bestColors[0] ?? null,
      }),
      label: "Your look",
    },
  ];
}
