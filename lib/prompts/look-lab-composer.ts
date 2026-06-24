export function buildLookLabInstructions(): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOOK LAB — VISUAL TRANSFORMATION DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate the lookLab field. This powers the visual face-transformation feature.
Every explanation must be ONE sentence, plain English, specific to THIS person's face and undertone.
No lists. No bullet points. No hedging.

COLOR SEASON:
- best: their confirmed season from the color section. confidence 90-99.
  drapingHex: the key color of that season (use a representative hex from their palette).
  explanation: why this season works for their specific face — mention a concrete facial trait.
- alternatives: 2 seasons that come close. confidence 40-75. drapingHex for each.
  explanation: one sentence on why it's close but not ideal.

METALS:
- gold.score and silver.score: 0-100 derived from undertone. Warm=high gold, Cool=high silver, Neutral=both 60-75.
- explanation: one sentence referencing their skin pigment or eye colour.

CONTRAST:
- level: use contrastAnalysis.level from earlier in this report.
- explanation: one sentence telling them what their contrast level means for makeup/colour choices.

BLUSH (3 options):
- One "best", one "avoid", one "okay".
- hex values must be actual blush shades (rose-brown range, not bright pinks or oranges).
- explanation: one sentence. "best" explains lift/warmth/glow. "avoid" explains what goes wrong.

LIPS (3 options):
- One "best", one "best", one "avoid".
- Match undertone: warm seasons get nudes/terracottas/berries; cool seasons get rose/mauve/berry.
- hex values must be actual lip shades.

EYESHADOW (3 options):
- One "best", one "best", one "avoid".
- Match eye colour and depth. Warm seasons: bronze/gold/khaki/rust. Cool: taupe/mauve/grey/navy.
- hex values must be actual shadow shades.

HAIR COLOR (3 options):
- One "best", one "avoid", one "okay".
- Must align with season undertone. Warm seasons: honey/auburn/chestnut. Cool: ash/platinum/espresso.
- explanation: reference undertone balance.

HAIRSTYLES (3 options):
- One "best", one "best", one "avoid".
- Base on face shape from faceShape field in earlier analysis.
- faceShapeReason: one sentence referencing their specific face shape trait.
- Do NOT set generatedImageUrl — that is filled in later by the hairstyle generation API.
`;
}
