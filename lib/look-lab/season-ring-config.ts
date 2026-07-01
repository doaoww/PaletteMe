export type SeasonRingConfig = {
  id: string;
  name: string;
  prompt: string;
};

const ring = (name: string, colors: string, mood: string): string =>
  `A decorative circular ring frame for a high-fashion color analysis card. ` +
  `The ring occupies the outer 38% of a 1024x1024 square, forming a thick circular band. ` +
  `The inner 62% (center circle) is completely transparent with no fill. ` +
  `Ring colors: ${colors}. ` +
  `Style: ${mood}. Flowing watercolor brushstrokes or botanical elements. ` +
  `Editorial fashion, elegant, minimal. No text. Transparent background. Ring only — nothing inside the center circle.`;

export const SEASON_RING_CONFIGS: SeasonRingConfig[] = [
  {
    id: "true-spring",
    name: "True Spring",
    prompt: ring(
      "True Spring",
      "warm coral #FE6F5E, golden yellow #D4A851, peach #FFCBA4, warm aqua #83C7B1, bright turquoise #7DDDE2",
      "warm, sunlit, clear, energetic"
    ),
  },
  {
    id: "light-spring",
    name: "Light Spring",
    prompt: ring(
      "Light Spring",
      "soft peach #FFB347, light apricot #FFDAB9, warm ivory #FFF8DC, blush #FFCBA4, light coral #FF9A8B",
      "delicate, warm, airy, luminous"
    ),
  },
  {
    id: "bright-spring",
    name: "Bright Spring",
    prompt: ring(
      "Bright Spring",
      "hot pink #FF69B4, vivid coral #FF6347, bright yellow-green #ADFF2F, electric aqua #00CED1, warm orange #FF8C00",
      "vibrant, high-contrast, clear, electric"
    ),
  },
  {
    id: "true-summer",
    name: "True Summer",
    prompt: ring(
      "True Summer",
      "dusty blue-lavender #8B9DC3, soft periwinkle #7F99D6, muted rose #D8A2A8, cool lilac #C8A2C8, powder blue #BCD9E7",
      "cool, muted, sophisticated, hazy"
    ),
  },
  {
    id: "light-summer",
    name: "Light Summer",
    prompt: ring(
      "Light Summer",
      "pale pink-lavender #D8B4CC, powder blue #BCD9E7, soft white #F0F8FF, muted mauve #C3A0B8, icy periwinkle #CCCCFF",
      "delicate, cool, soft, ethereal"
    ),
  },
  {
    id: "soft-summer",
    name: "Soft Summer",
    prompt: ring(
      "Soft Summer",
      "muted mauve #9B8EA0, dusty rose #C4A0A0, soft teal #7DADA8, greyed lavender #B0A4C0, dusty blue #7A90A4",
      "muted, cool, understated, refined"
    ),
  },
  {
    id: "true-autumn",
    name: "True Autumn",
    prompt: ring(
      "True Autumn",
      "rust #B7410E, terracotta #CC5801, mustard #D4A518, olive #808000, warm brown #8B6914",
      "warm, earthy, golden, harvest-rich"
    ),
  },
  {
    id: "dark-autumn",
    name: "Dark Autumn",
    prompt: ring(
      "Dark Autumn",
      "deep burgundy #7B2D00, dark chocolate #5C3317, forest green #2D4A22, deep rust #8B2500, dark gold #8B7536",
      "deep, warm, dramatic, earthy-rich"
    ),
  },
  {
    id: "soft-autumn",
    name: "Soft Autumn",
    prompt: ring(
      "Soft Autumn",
      "warm camel #C19A6B, sage green #87A878, dusty peach #D4A57A, muted gold #C8A96E, warm taupe #B5977A",
      "muted, warm, gentle, organic"
    ),
  },
  {
    id: "true-winter",
    name: "True Winter",
    prompt: ring(
      "True Winter",
      "cobalt blue #0047AB, pure white #F0F4F8, true red #C20018, emerald #046A38, deep charcoal #36454F",
      "cool, clear, high-contrast, crisp"
    ),
  },
  {
    id: "dark-winter",
    name: "Dark Winter",
    prompt: ring(
      "Dark Winter",
      "deep navy #1C1C4B, burgundy #800020, forest teal #1A4A4A, charcoal #2D2D2D, deep plum #4A0A4A",
      "deep, cool, dramatic, intense"
    ),
  },
  {
    id: "bright-winter",
    name: "Bright Winter",
    prompt: ring(
      "Bright Winter",
      "hot fuchsia #C7338A, electric blue #0057FF, icy pink #F0C4D8, true red #C20018, pure white #FFFFFF",
      "high-contrast, icy-bright, bold, electric"
    ),
  },
];
