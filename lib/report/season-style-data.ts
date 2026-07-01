// Static per-season style content — curated by PaletteMe, not AI-generated.
// Fill in each season the same way Dark Autumn is filled in below.

export type OutfitFormula = {
  occasion: string;
  items: string[];
};

export type SeasonStyleData = {
  capsuleWardrobe: {
    category: string;
    items: string[];
  }[];
  outfitFormulas: OutfitFormula[];
  shoppingAlways: string[];
  shoppingSkip: string[];
  bestFabrics: string[];
  avoidFabrics: string[];
  bestPrints: string[];
  avoidPrints: string[];
  accessories: {
    bags: string[];
    shoes: string[];
    belt: string;
    watch: string;
  };
  nailsBest: { name: string; hex: string }[];
  nailsAvoid: { name: string; hex: string }[];
  quickWins: string[];
  whyCompliments: string;
  styleIdentity: {
    name: string;
    description: string;
    aesthetics: string[];
  };
  styleRules: string[];
};

const EMPTY: SeasonStyleData = {
  capsuleWardrobe: [],
  outfitFormulas: [],
  shoppingAlways: [],
  shoppingSkip: [],
  bestFabrics: [],
  avoidFabrics: [],
  bestPrints: [],
  avoidPrints: [],
  accessories: { bags: [], shoes: [], belt: "", watch: "" },
  nailsBest: [],
  nailsAvoid: [],
  quickWins: [],
  whyCompliments: "",
  styleIdentity: { name: "", description: "", aesthetics: [] },
  styleRules: [],
};

export const SEASON_STYLE_DATA: Record<string, SeasonStyleData> = {

  "dark-autumn": {
    capsuleWardrobe: [
      { category: "Tops", items: ["Dark olive knit", "Warm ivory silk blouse", "Chocolate turtleneck", "Rust linen shirt", "Camel cashmere sweater"] },
      { category: "Bottoms", items: ["Dark denim", "Chocolate wide-leg trousers", "Olive midi skirt", "Camel tailored trousers"] },
      { category: "Outerwear", items: ["Espresso structured coat", "Camel trench coat", "Dark olive field jacket"] },
      { category: "Shoes", items: ["Cognac ankle boots", "Chocolate loafers", "Warm nude heels", "Espresso mules"] },
      { category: "Accessories", items: ["Gold hoop earrings", "Cognac leather bag", "Dark brown belt", "Bronze pendant necklace"] },
    ],
    outfitFormulas: [
      {
        occasion: "Everyday",
        items: ["Dark olive knit", "Dark denim", "Cognac boots", "Gold hoops"],
      },
      {
        occasion: "Office",
        items: ["Espresso blazer", "Warm ivory blouse", "Chocolate trousers", "Brown leather loafers"],
      },
      {
        occasion: "Date night",
        items: ["Rust midi dress", "Bronze earrings", "Camel heels", "Cognac clutch"],
      },
      {
        occasion: "Weekend",
        items: ["Olive linen shirt", "Dark jeans", "Brown sneakers", "Canvas tote"],
      },
    ],
    shoppingAlways: ["Dark olive", "Chocolate", "Camel", "Warm ivory", "Rust", "Espresso", "Cognac", "Warm terracotta"],
    shoppingSkip: ["Pure white", "Cool grey", "Bright pink", "Neon colours", "Jet black", "Icy blue", "Cool lavender"],
    bestFabrics: ["Suede", "Linen", "Matte leather", "Brushed wool", "Chunky knit", "Velvet", "Raw silk"],
    avoidFabrics: ["Shiny satin", "Glossy fabrics", "Metallic finishes", "Polyester shine", "Wet-look materials"],
    bestPrints: ["Leopard", "Tortoiseshell", "Muted florals", "Earthy plaid", "Organic abstract", "Animal print"],
    avoidPrints: ["High-contrast black & white", "Neon graphics", "Icy geometric", "Bright colour-block", "Cool pastel patterns"],
    accessories: {
      bags: ["Cognac", "Chocolate", "Olive", "Camel", "Warm tan"],
      shoes: ["Brown", "Chestnut", "Espresso", "Warm nude", "Cognac"],
      belt: "Dark brown leather",
      watch: "Gold case, brown leather strap",
    },
    nailsBest: [
      { name: "Terracotta", hex: "#C06040" },
      { name: "Brick Red", hex: "#8B3A2A" },
      { name: "Cinnamon", hex: "#A0522D" },
      { name: "Chocolate", hex: "#5C3317" },
      { name: "Warm Nude", hex: "#C4A882" },
    ],
    nailsAvoid: [
      { name: "Bubblegum Pink", hex: "#FF69B4" },
      { name: "Lilac", hex: "#C8A2C8" },
      { name: "Blue-Red", hex: "#CC0033" },
      { name: "Icy Mauve", hex: "#C9B0BE" },
    ],
    quickWins: [
      "Swap black tops for dark olive — your skin immediately looks warmer and healthier.",
      "Choose gold jewellery over silver — gold resonates with your undertone in a way silver never will.",
      "Replace cool pink lipstick with terracotta or brick — it will look like your lips, only better.",
    ],
    whyCompliments: "People are most likely to compliment you when you're wearing earthy, warm colours because your natural colouring looks brighter, healthier and more harmonious. Instead of noticing your outfit first, people notice you.",
    styleIdentity: {
      name: "Earthy Elegant",
      description: "You naturally suit rich textures, relaxed tailoring and timeless pieces. Your colouring already creates depth, so your clothes don't need loud prints or bright colours to make an impression. The most expensive-looking version of you is also the simplest.",
      aesthetics: ["Quiet Luxury", "Old Money", "Soft Safari", "Natural Chic", "Ralph Lauren"],
    },
    styleRules: [
      "Wear warm over cool.",
      "Choose depth over brightness.",
      "Gold beats silver.",
      "Cream beats pure white.",
      "Brown beats black.",
      "Matte beats shiny.",
      "Earthy prints beat graphic prints.",
      "Rich textures flatter you most.",
      "Medium-high contrast outfits work best.",
      "If you're unsure, choose olive.",
    ],
  },

  "true-spring":   { ...EMPTY },
  "light-spring":  { ...EMPTY },
  "bright-spring": { ...EMPTY },
  "true-summer":   { ...EMPTY },
  "light-summer":  { ...EMPTY },
  "soft-summer":   { ...EMPTY },
  "true-autumn":   { ...EMPTY },
  "soft-autumn":   { ...EMPTY },
  "true-winter":   { ...EMPTY },
  "dark-winter":   { ...EMPTY },
  "bright-winter": { ...EMPTY },
};
