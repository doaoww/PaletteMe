import type { ScanType, WardrobeItem } from "./schemas.ts";

export type ScanPromptInput = {
  scanType: ScanType;
  profileSummary?: string;
  userGoal?: string;
  wardrobeSummary?: string;
};

const scanTypeLabels: Record<ScanType, string> = {
  clothing_item: "a clothing item",
  outfit: "a full outfit",
  makeup: "a makeup shade or makeup product",
  product_screenshot: "a product screenshot or shopping page",
};

export const STYLE_DECISION_SYSTEM_PROMPT = [
  "You are PaletteMe's practical AI style analyst.",
  "Your job is to help a person decide what to wear, buy, skip, or style differently.",
  "Be inclusive across gender expression, body sizes, ages, skin tones, and shopping categories.",
  "Use color season, undertone, contrast, body/fit goals, wardrobe context, and user intent.",
  "Do not simply reject user clothes. Explain how to use, balance, alter, or replace them.",
  "If the image or context is unclear, say so with low confidence and ask for better input.",
  "Return concise practical advice, not fashion theory.",
].join("\n");

export function buildScanPrompt(input: ScanPromptInput): string {
  const target = scanTypeLabels[input.scanType];
  return [
    `Analyze ${target}.`,
    "",
    "Profile context:",
    input.profileSummary?.trim() || "No saved profile yet.",
    "",
    "User goal:",
    input.userGoal?.trim() || "Help me decide if this works for me.",
    "",
    "Wardrobe context:",
    input.wardrobeSummary?.trim() || "No saved wardrobe context yet.",
    "",
    "Decision rules:",
    "- First identify what is visibly in the image: item category, dominant colors, color temperature, depth, chroma, pattern, material if visible, and formality.",
    "- Lead with one verdict: great, works_with_styling, skip_buying, or unclear.",
    "- Score 85-100 only when the visible colors clearly support the user's palette near the face.",
    "- Score 65-84 when it can work with styling, layering, distance from face, or better pairings.",
    "- Score 35-64 when it is usable but needs balancing or is better away from the face.",
    "- Score 0-34 only when the item is a poor buy for the user's palette or the image is not usable.",
    "- Include confidence from 0 to 100. If lighting, filters, shadows, or screenshot quality make color uncertain, use confidence under 55 and verdict unclear.",
    "- Explain the visible evidence in plain language: what color you see, why it helps or hurts the user's undertone/contrast/depth, and what the user should do with it.",
    "- Give one practical next action that sounds like a stylist, not a generic bot.",
    "- Do not simply reject a user's clothing or makeup; explain how to use, balance, alter, or replace it.",
    "- If a color is not ideal near the face, say whether it can still work as shoes, bag, pants, belt, layer, or away-from-face item.",
    "- Suggest better alternatives when the item is not ideal.",
    "- Include correction options so the user can fix wrong AI labels.",
    "- For products, directly answer whether the user should buy it, maybe buy it, or skip it.",
    "- For makeup, judge warmth/coolness, brightness, depth, and whether the shade will harmonize with the user's undertone.",
    "- For outfits, judge the whole composition, but separate color harmony from fit/formality when relevant.",
  ].join("\n");
}

export type OutfitPromptInput = {
  profileSummary?: string;
  wardrobeItems: WardrobeItem[];
  occasion?: string;
  goal?: string;
};

export function buildOutfitPrompt(input: OutfitPromptInput): string {
  const wardrobe = input.wardrobeItems.map((item) => (
    `- ${item.id}: ${item.name}, ${item.category}, colors ${item.colors.join(", ") || "unknown"}, formality ${item.formality}`
  ));

  return [
    "Build outfit plans from the user's saved wardrobe.",
    "",
    "Profile context:",
    input.profileSummary?.trim() || "No saved profile yet.",
    "",
    "Occasion:",
    input.occasion?.trim() || "everyday",
    "",
    "Goal:",
    input.goal?.trim() || "help me decide what to wear",
    "",
    "Wardrobe items:",
    wardrobe.length > 0 ? wardrobe.join("\n") : "No wardrobe items were provided.",
    "",
    "Rules:",
    "- Use only provided wardrobe item ids.",
    "- Do not invent missing clothing items.",
    "- Explain why the outfit works for color, contrast, fit goal, and occasion.",
    "- Include controls for lock_item, swap_item, remove_item, and save_outfit.",
  ].join("\n");
}
