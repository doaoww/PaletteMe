export type SeasonPaletteMakeupEntry = { hex: string; name: string };

export type SeasonPaletteMakeup = {
  lips: SeasonPaletteMakeupEntry[];
  cheek: SeasonPaletteMakeupEntry[];
  eyes: SeasonPaletteMakeupEntry[];
  base: SeasonPaletteMakeupEntry[];
};

// "base" = wardrobe foundation (coats, trousers, everyday layers)
// "power" = most flattering near the face (tops, scarves, dresses)
// "accent" = use sparingly — accessories, pops, statement pieces
export type PaletteTier = "base" | "power" | "accent";

export type SeasonPalette = {
  id: string;
  name: string;
  family: "spring" | "summer" | "autumn" | "winter";
  undertone: "warm" | "cool" | "neutral";
  depth: "light" | "medium" | "deep";
  chroma: "clear" | "muted";
  description: string;
  palette: string[];
  paletteNames: string[];
  paletteContext?: PaletteTier[];
  avoid: string[];
  avoidNames: string[];
  metals: { best: string[]; avoid: string[] };
  neutrals: { hex: string; name: string }[];
  makeup: SeasonPaletteMakeup;
  nails: { hex: string; name: string }[];
  emotionalDescriptors: string[];
  styleArchetype: string;
  whyOldClothesFeltWrong: string;
};

export const SEASON_PALETTES: SeasonPalette[] = [
  // ─── SPRING ────────────────────────────────────────────────────────────────

  {
    id: "true-spring",
    name: "True Spring",
    family: "spring",
    undertone: "warm",
    depth: "medium",
    chroma: "clear",
    description: "Warm, clear, and medium-depth — sunlit corals, golden yellows, warm greens, and clear aquas. Never muted, never cool.",
    palette: [
      "#FE6F5E", "#D4A851", "#FFCBA4", "#83C7B1", "#7DDDE2",
      "#FF8C69", "#F4A460", "#90C978", "#F4784A", "#C09B30",
      "#D18C5D", "#FDCC4E",
    ],
    paletteNames: [
      "Warm Coral", "Warm Gold", "Warm Peach", "Warm Aqua", "Clear Turquoise",
      "Salmon", "Sandy Brown", "Fresh Green", "Mandarin", "Marigold",
      "Warm Tan", "Golden Yellow",
    ],
    paletteContext: [
      "power", "base", "base", "power", "accent",
      "power", "base", "accent", "power", "base",
      "base", "accent",
    ],
    avoid: ["#000000", "#E6E6FA", "#B0C4DE", "#800020", "#808080"],
    avoidNames: ["Pure Black", "Lavender", "Steel Blue", "Burgundy", "Cool Gray"],
    metals: { best: ["yellow gold", "rose gold", "brass"], avoid: ["silver", "platinum"] },
    neutrals: [
      { hex: "#FFF5EE", name: "Warm White" },
      { hex: "#D18C5D", name: "Warm Tan" },
      { hex: "#F4A460", name: "Sandy Brown" },
      { hex: "#36454F", name: "Warm Charcoal" },
    ],
    makeup: {
      lips: [
        { hex: "#FF7043", name: "Warm Coral" },
        { hex: "#FFAB91", name: "Peach" },
        { hex: "#FD6C9E", name: "Warm Pink" },
      ],
      cheek: [
        { hex: "#FFCCBC", name: "Peach Blush" },
        { hex: "#FFAB76", name: "Apricot" },
        { hex: "#FF8A65", name: "Coral Blush" },
      ],
      eyes: [
        { hex: "#916C5F", name: "Warm Brown" },
        { hex: "#8B7E0E", name: "Olive" },
        { hex: "#B8860B", name: "Bronze" },
      ],
      base: [
        { hex: "#FFF8E1", name: "Warm Ivory" },
        { hex: "#FFE0B2", name: "Light Peach" },
      ],
    },
    nails: [
      { hex: "#FF7043", name: "Coral" },
      { hex: "#FFAB91", name: "Peach" },
      { hex: "#FD6C9E", name: "Warm Pink" },
      { hex: "#DCA56C", name: "Nude" },
    ],
    emotionalDescriptors: ["warm and radiant", "fresh and vibrant", "naturally glowing"],
    styleArchetype: "Warm Romantic",
    whyOldClothesFeltWrong: "Cool-toned grays and blacks competed with your natural warmth, making you look washed out. Your coloring thrives in warm, clear colors that echo your natural glow.",
  },

  {
    id: "light-spring",
    name: "Light Spring",
    family: "spring",
    undertone: "warm",
    depth: "light",
    chroma: "clear",
    description: "Warm, light, and luminous — soft peaches, warm pastels, and butter yellows. Still warm and clear, just gentler than True Spring.",
    palette: [
      "#FFEFD5", "#DEB887", "#C8956C", "#F9C784", "#E3A274",
      "#ECA299", "#FCBACB", "#FFFACD", "#B3A15D", "#FFDAC1",
      "#A7DBEC", "#B5EAD7",
    ],
    paletteNames: [
      "Warm Ivory", "Light Camel", "Caramel", "Light Gold", "Warm Peach",
      "Soft Coral", "Warm Soft Pink", "Butter Yellow", "Golden Olive", "Pastel Peach",
      "Light Warm Blue", "Warm Mint",
    ],
    paletteContext: [
      "base", "base", "base", "power", "power",
      "power", "power", "base", "base", "base",
      "accent", "accent",
    ],
    avoid: ["#000000", "#00008B", "#8B008B", "#2F4F4F", "#50C878"],
    avoidNames: ["Pure Black", "Dark Navy", "Dark Magenta", "Dark Slate", "Emerald"],
    metals: { best: ["rose gold", "light gold", "warm brass"], avoid: ["silver", "gunmetal"] },
    neutrals: [
      { hex: "#FFF5EE", name: "Warm Off-White" },
      { hex: "#FAEBD7", name: "Antique White" },
      { hex: "#DEB887", name: "Light Camel" },
      { hex: "#A0522D", name: "Warm Brown" },
    ],
    makeup: {
      lips: [
        { hex: "#F4A46A", name: "Warm Peach" },
        { hex: "#F08060", name: "Light Coral" },
        { hex: "#F7B8C2", name: "Peachy Pink" },
      ],
      cheek: [
        { hex: "#FFCDD2", name: "Petal Blush" },
        { hex: "#FFE0B2", name: "Peach" },
        { hex: "#FFCCBC", name: "Soft Apricot" },
      ],
      eyes: [
        { hex: "#D8CBC7", name: "Warm Taupe" },
        { hex: "#BEA9A2", name: "Rose Nude" },
        { hex: "#A4877C", name: "Light Brown" },
      ],
      base: [
        { hex: "#FFFDE7", name: "Lightest Ivory" },
        { hex: "#FFF8E1", name: "Warm Porcelain" },
      ],
    },
    nails: [
      { hex: "#F4A46A", name: "Peach" },
      { hex: "#F08060", name: "Light Coral" },
      { hex: "#F7B8C2", name: "Powder Pink" },
      { hex: "#FFFACD", name: "Butter" },
    ],
    emotionalDescriptors: ["delicate and warm", "soft and luminous", "effortlessly pretty"],
    styleArchetype: "Soft Romantic",
    whyOldClothesFeltWrong: "Dark heavy colors overwhelmed your delicate coloring. You shine in soft, warm-light tones that complement rather than overpower your features.",
  },

  {
    id: "bright-spring",
    name: "Bright Spring",
    family: "spring",
    undertone: "warm",
    depth: "medium",
    chroma: "clear",
    description: "Warm and vivid — the most saturated spring. Clear, high-energy corals, warm turquoise, and amber. Bridges Spring and Winter through shared clarity.",
    palette: [
      "#FFBF00", "#FFF8DC", "#C37325", "#FF6163", "#EC6257",
      "#E96E96", "#FF7855", "#E85D96", "#34B87A", "#D9B84A",
      "#40E0D0", "#AFEEEE",
    ],
    paletteNames: [
      "Amber", "Bright Ivory", "Burnt Orange", "Vivid Coral", "Warm Red",
      "Vivid Pink", "Vivid Orange-Coral", "Bright Pink", "Clear Emerald Green", "Warm Golden Yellow",
      "Warm Turquoise", "Clear Aqua",
    ],
    paletteContext: [
      "base", "base", "base", "power", "power",
      "power", "power", "accent", "accent", "accent",
      "accent", "accent",
    ],
    avoid: ["#000000", "#B0C4DE", "#BC8F8F", "#8B008B", "#556B2F"],
    avoidNames: ["Pure Black", "Powder Blue", "Dusty Rose", "Dark Magenta", "Dark Olive"],
    metals: { best: ["bright gold", "rose gold", "warm brass"], avoid: ["silver", "platinum"] },
    neutrals: [
      { hex: "#FFF8DC", name: "Cornsilk" },
      { hex: "#FFBF00", name: "Amber" },
      { hex: "#C37325", name: "Burnt Orange" },
      { hex: "#DEB887", name: "Warm Tan" },
    ],
    makeup: {
      lips: [
        { hex: "#FF5722", name: "Vivid Coral" },
        { hex: "#FF4081", name: "Hot Pink" },
        { hex: "#E8401C", name: "Warm Red" },
      ],
      cheek: [
        { hex: "#FF8A65", name: "Coral Blush" },
        { hex: "#FF7043", name: "Warm Orange" },
        { hex: "#FF6090", name: "Vivid Pink" },
      ],
      eyes: [
        { hex: "#40E0D0", name: "Warm Teal" },
        { hex: "#B8860B", name: "Bronze" },
        { hex: "#43B848", name: "Warm Green" },
      ],
      base: [
        { hex: "#FFF9C4", name: "Warm Light" },
        { hex: "#FFECB3", name: "Golden Ivory" },
      ],
    },
    nails: [
      { hex: "#FF5722", name: "Vivid Coral" },
      { hex: "#D9B84A", name: "Warm Gold" },
      { hex: "#FF4081", name: "Hot Pink" },
      { hex: "#40E0D0", name: "Turquoise" },
    ],
    emotionalDescriptors: ["bold and vibrant", "energetic and striking", "naturally eye-catching"],
    styleArchetype: "Bold Vibrant",
    whyOldClothesFeltWrong: "Muted and dusty tones dulled your natural vibrancy. Your high-clarity coloring demands vivid warm colors that match your energy.",
  },

  // ─── SUMMER ────────────────────────────────────────────────────────────────

  {
    id: "true-summer",
    name: "True Summer",
    family: "summer",
    undertone: "cool",
    depth: "medium",
    chroma: "muted",
    description: "Cool, medium-depth, and softly muted — lavender, dusty rose, periwinkle, and soft navy with a gentle blue-gray haze. Sophistication through subtlety.",
    palette: [
      "#F0F8FF", "#8C92AC", "#BCD9E7", "#C1D8E3", "#7A9EB1",
      "#7F99D6", "#E6E6FA", "#D8A2A8", "#CCCCFF", "#A99AC2",
      "#BB6FA9", "#9C84D9",
    ],
    paletteNames: [
      "Alice Blue", "Cool Gray", "Pale Aqua", "Powder Blue", "Misty Blue",
      "Soft Blue", "Lavender", "Dusty Rose", "Periwinkle", "Dusty Lavender",
      "Muted Fuchsia", "Periwinkle Purple",
    ],
    paletteContext: [
      "base", "base", "base", "base", "base",
      "power", "power", "power", "power", "power",
      "accent", "accent",
    ],
    avoid: ["#FF7F00", "#DAA520", "#CD853F", "#FF4500", "#8B4513"],
    avoidNames: ["Orange", "Goldenrod", "Camel", "Rust", "Warm Brown"],
    metals: { best: ["silver", "white gold", "platinum", "pearls"], avoid: ["yellow gold", "copper", "brass"] },
    neutrals: [
      { hex: "#F0F8FF", name: "Cool Off-White" },
      { hex: "#2F4F4F", name: "Dark Slate" },
      { hex: "#8C92AC", name: "Cool Gray" },
      { hex: "#708090", name: "Slate Gray" },
    ],
    makeup: {
      lips: [
        { hex: "#C9869E", name: "Dusty Rose" },
        { hex: "#B0889A", name: "Mauve" },
        { hex: "#9B5E82", name: "Muted Berry" },
      ],
      cheek: [
        { hex: "#E8C4D4", name: "Rose Blush" },
        { hex: "#DBA8BC", name: "Cool Pink" },
        { hex: "#C9A2C0", name: "Lavender Flush" },
      ],
      eyes: [
        { hex: "#7281D2", name: "Soft Blue" },
        { hex: "#8B7BA0", name: "Dusty Plum" },
        { hex: "#8DA5B1", name: "Steel Gray" },
      ],
      base: [
        { hex: "#F3F3F5", name: "Cool Porcelain" },
        { hex: "#E8E8EE", name: "Soft Gray" },
      ],
    },
    nails: [
      { hex: "#C9869E", name: "Dusty Rose" },
      { hex: "#7281D2", name: "Periwinkle" },
      { hex: "#936DD5", name: "Lavender" },
      { hex: "#B0889A", name: "Mauve" },
    ],
    emotionalDescriptors: ["elegantly cool", "quietly sophisticated", "effortlessly chic"],
    styleArchetype: "Cool Elegant",
    whyOldClothesFeltWrong: "Warm oranges and yellows clashed with your cool undertone, making you look tired. Your natural elegance shines in cool muted tones.",
  },

  {
    id: "light-summer",
    name: "Light Summer",
    family: "summer",
    undertone: "cool",
    depth: "light",
    chroma: "muted",
    description: "Cool, light, and very delicate — powder blue, pale lavender, soft blush, and cool mint. The lightest and most airy of all summers.",
    palette: [
      "#FFF0F5", "#E8E8E8", "#F5DEB3", "#B0D4E3", "#C8C8E0",
      "#E8D5E8", "#A4C1F3", "#99CCEE", "#BDA7DD", "#D8BFD8",
      "#FFB6C1", "#C5E8F0",
    ],
    paletteNames: [
      "Lavender Blush", "Light Gray", "Cool Wheat", "Baby Blue", "Misty Lilac",
      "Pale Lilac", "Powder Blue", "Soft Blue", "Pale Lavender", "Thistle",
      "Soft Pink", "Icy Aqua",
    ],
    paletteContext: [
      "base", "base", "base", "base", "base",
      "base", "power", "power", "power", "power",
      "power", "accent",
    ],
    avoid: ["#FF6B35", "#FFD700", "#8B0000", "#FF1493", "#800080"],
    avoidNames: ["Coral", "Gold", "Dark Red", "Deep Pink", "Dark Purple"],
    metals: { best: ["silver", "white gold", "platinum"], avoid: ["yellow gold", "warm copper"] },
    neutrals: [
      { hex: "#FFF0F5", name: "Cool Soft White" },
      { hex: "#36454F", name: "Cool Charcoal" },
      { hex: "#C0C0C0", name: "Silver" },
      { hex: "#E8E8E8", name: "Light Gray" },
    ],
    makeup: {
      lips: [
        { hex: "#FDB6CE", name: "Soft Rose" },
        { hex: "#FFCDD2", name: "Petal Pink" },
        { hex: "#C9A0B4", name: "Soft Mauve" },
      ],
      cheek: [
        { hex: "#FFCDD2", name: "Baby Blush" },
        { hex: "#FDB6CE", name: "Soft Pink" },
        { hex: "#E4BAEB", name: "Lavender Blush" },
      ],
      eyes: [
        { hex: "#B7DEFF", name: "Ice Blue" },
        { hex: "#C8A8D8", name: "Soft Lavender" },
        { hex: "#AEBFC7", name: "Silver Gray" },
      ],
      base: [
        { hex: "#F3F3F5", name: "Lightest Cool" },
        { hex: "#E8EEF5", name: "Porcelain" },
      ],
    },
    nails: [
      { hex: "#B7DEFF", name: "Ice Blue" },
      { hex: "#FFCDD2", name: "Blush" },
      { hex: "#E4BAEB", name: "Soft Lavender" },
      { hex: "#FDB6CE", name: "Petal" },
    ],
    emotionalDescriptors: ["soft and feminine", "cool and delicate", "quietly beautiful"],
    styleArchetype: "Soft Feminine",
    whyOldClothesFeltWrong: "Warm and dark colors overwhelmed your soft cool coloring. Light cool tones bring out your natural delicacy.",
  },

  {
    id: "soft-summer",
    name: "Soft Summer",
    family: "summer",
    undertone: "cool",
    depth: "medium",
    chroma: "muted",
    description: "Cool and very muted — dusty blues, grayed lavender, soft sage, mushroom taupe. The most subdued of all seasons. Bridges Summer and Autumn through shared softness.",
    palette: [
      "#E8DFD3", "#DCDCDC", "#A28B8B", "#B8A282", "#6B9B95",
      "#9CAF88", "#7598C4", "#78ABC6", "#998CBD", "#C9A69E",
      "#D4A5A5", "#7A7A8C",
    ],
    paletteNames: [
      "Warm Cream", "Gainsboro", "Mauve Gray", "Soft Camel", "Soft Teal",
      "Soft Sage", "Dusty Blue", "Soft Blue", "Muted Lavender", "Dusty Rose",
      "Muted Blush", "Blue-Gray",
    ],
    paletteContext: [
      "base", "base", "base", "base", "accent",
      "base", "power", "power", "power", "power",
      "power", "accent",
    ],
    avoid: ["#000000", "#FF4500", "#00BFFF", "#FF1493", "#FFFFFF"],
    avoidNames: ["Pure Black", "Orange-Red", "Electric Blue", "Fuchsia", "Stark White"],
    metals: { best: ["brushed silver", "pewter", "matte rose gold"], avoid: ["bright gold", "high-shine copper"] },
    neutrals: [
      { hex: "#E8DFD3", name: "Warm Cream" },
      { hex: "#6B5D4F", name: "Soft Brown" },
      { hex: "#928A6E", name: "Dusty Khaki" },
      { hex: "#A89685", name: "Mushroom" },
    ],
    makeup: {
      lips: [
        { hex: "#B07F8C", name: "Dusty Mauve" },
        { hex: "#C9A0AC", name: "Muted Rose" },
        { hex: "#9E8DAA", name: "Dusty Plum" },
      ],
      cheek: [
        { hex: "#D4A5A5", name: "Muted Rose" },
        { hex: "#B48087", name: "Dusty Pink" },
        { hex: "#A89685", name: "Soft Taupe" },
      ],
      eyes: [
        { hex: "#7598C4", name: "Dusty Blue" },
        { hex: "#9CAF88", name: "Muted Sage" },
        { hex: "#998CBD", name: "Dusty Lavender" },
      ],
      base: [
        { hex: "#C6B8A6", name: "Cool Beige" },
        { hex: "#D8CBC7", name: "Soft Linen" },
      ],
    },
    nails: [
      { hex: "#B07F8C", name: "Dusty Mauve" },
      { hex: "#9E8DAA", name: "Lavender Gray" },
      { hex: "#9CAF88", name: "Muted Sage" },
      { hex: "#C6B8A6", name: "Sand" },
    ],
    emotionalDescriptors: ["softly sophisticated", "calm and harmonious", "understated elegance"],
    styleArchetype: "Quiet Sophisticate",
    whyOldClothesFeltWrong: "Both vivid and very warm tones competed with your cool, softly muted nature. Dusty, grayed tones are your natural harmony.",
  },

  // ─── AUTUMN ────────────────────────────────────────────────────────────────

  {
    id: "true-autumn",
    name: "True Autumn",
    family: "autumn",
    undertone: "warm",
    depth: "medium",
    chroma: "muted",
    description: "Warm, golden, and earthy — the harvest palette. Mustard, rust, pumpkin, olive, terracotta, and warm brown. Richer than Soft Autumn, lighter than Dark Autumn.",
    palette: [
      "#FAEBD7", "#D2B48C", "#8B6914", "#5C4033", "#6D6D4B",
      "#808000", "#B7410E", "#CC5801", "#D4A518", "#E8A020",
      "#A0522D", "#9E4857",
    ],
    paletteNames: [
      "Warm Ivory", "Camel", "Dark Gold", "Dark Brown", "Olive",
      "Olive Green", "Rust", "Warm Orange", "Mustard Gold", "Amber",
      "Sienna", "Earthy Berry",
    ],
    paletteContext: [
      "base", "base", "base", "base", "base",
      "base", "power", "power", "power", "power",
      "power", "accent",
    ],
    avoid: ["#FFB6C1", "#ADD8E6", "#000000", "#FFFFFF", "#FF1493"],
    avoidNames: ["Pastel Pink", "Ice Blue", "Pure Black", "Pure White", "Hot Pink"],
    metals: { best: ["yellow gold", "bronze", "copper", "brass"], avoid: ["silver", "platinum"] },
    neutrals: [
      { hex: "#FAEBD7", name: "Warm Ivory" },
      { hex: "#D2B48C", name: "Golden Camel" },
      { hex: "#8B6914", name: "Dark Gold" },
      { hex: "#5C4033", name: "Dark Brown" },
    ],
    makeup: {
      lips: [
        { hex: "#D15E20", name: "Terracotta" },
        { hex: "#A54A24", name: "Rust" },
        { hex: "#8B3A3A", name: "Warm Brick" },
      ],
      cheek: [
        { hex: "#D15E20", name: "Warm Coral" },
        { hex: "#CC5500", name: "Burnt Orange" },
        { hex: "#DD9361", name: "Warm Peach" },
      ],
      eyes: [
        { hex: "#907450", name: "Warm Brown" },
        { hex: "#6C8047", name: "Olive" },
        { hex: "#D7AB08", name: "Gold" },
      ],
      base: [
        { hex: "#F8E6D0", name: "Warm Ivory" },
        { hex: "#F2D5B3", name: "Golden Beige" },
      ],
    },
    nails: [
      { hex: "#D15E20", name: "Terracotta" },
      { hex: "#A54A24", name: "Rust" },
      { hex: "#D7AB08", name: "Mustard" },
      { hex: "#4D3725", name: "Chocolate" },
    ],
    emotionalDescriptors: ["rich and earthy", "warm and grounded", "naturally luxurious"],
    styleArchetype: "Warm Naturalist",
    whyOldClothesFeltWrong: "Cool grays and icy pastels drained your warm richness. Your depth and warmth shine in earthy tones that mirror the autumn harvest.",
  },

  {
    id: "dark-autumn",
    name: "Dark Autumn",
    family: "autumn",
    undertone: "warm",
    depth: "deep",
    chroma: "muted",
    description: "Warm and deeply rich — chocolate, dark olive, oxblood, forest green, burnt sienna, and espresso. The warmest dark season. Dark hair and olive skin do NOT make True Winter — golden warmth belongs here.",
    palette: [
      "#FFEBCD", "#3D2914", "#675100", "#3B2F2F", "#5C3317",
      "#556B2F", "#924819", "#954344", "#800020", "#355E3B",
      "#8B4000", "#C04000",
    ],
    paletteNames: [
      "Warm Cream", "Dark Chocolate", "Dark Olive", "Espresso", "Rich Mahogany",
      "Olive Green", "Burnt Sienna", "Deep Burgundy", "Burgundy Wine", "Forest Green",
      "Deep Rust", "Mahogany",
    ],
    paletteContext: [
      "base", "base", "base", "base", "base",
      "base", "power", "power", "power", "power",
      "accent", "accent",
    ],
    avoid: ["#ADD8E6", "#C0C0C0", "#FFB6C1", "#E6E6FA", "#F0F8FF"],
    avoidNames: ["Ice Blue", "Cool Silver", "Baby Pink", "Lavender", "Icy White"],
    metals: { best: ["antique gold", "copper", "bronze", "warm brass"], avoid: ["bright silver", "platinum", "chrome"] },
    neutrals: [
      { hex: "#FFEBCD", name: "Warm Cream" },
      { hex: "#3D2914", name: "Dark Chocolate" },
      { hex: "#675100", name: "Dark Olive" },
      { hex: "#5C4033", name: "Chocolate Brown" },
    ],
    makeup: {
      lips: [
        { hex: "#721313", name: "Dark Burgundy" },
        { hex: "#962405", name: "Deep Rust" },
        { hex: "#7B3F00", name: "Chocolate Wine" },
      ],
      cheek: [
        { hex: "#962405", name: "Deep Rust" },
        { hex: "#D15E20", name: "Terracotta" },
        { hex: "#A54A24", name: "Warm Rust" },
      ],
      eyes: [
        { hex: "#3E4E1C", name: "Dark Olive" },
        { hex: "#956D0A", name: "Dark Gold" },
        { hex: "#164E4E", name: "Deep Teal" },
      ],
      base: [
        { hex: "#4A2010", name: "Deep Warm" },
        { hex: "#6B3A1F", name: "Rich Bronze" },
      ],
    },
    nails: [
      { hex: "#721313", name: "Dark Burgundy" },
      { hex: "#3E4E1C", name: "Dark Olive" },
      { hex: "#956D0A", name: "Dark Gold" },
      { hex: "#2D1A07", name: "Espresso" },
    ],
    emotionalDescriptors: ["deeply rich", "dramatically warm", "powerfully grounded"],
    styleArchetype: "Dark Romantic",
    whyOldClothesFeltWrong: "Light pastels washed out your deep rich coloring. Cool or icy tones clash with your warm undertone. Your natural drama shines in deep earthy jewel tones.",
  },

  {
    id: "soft-autumn",
    name: "Soft Autumn",
    family: "autumn",
    undertone: "warm",
    depth: "medium",
    chroma: "muted",
    description: "Warm and very softly muted — camel, dusty sage, terracotta, mushroom, and warm blush-peach. Bridges Autumn and Summer through shared muteness. Lightest and softest of the autumns.",
    palette: [
      "#FAF0E6", "#A28955", "#B8A282", "#6B5D4F", "#E8D5C0",
      "#758451", "#858159", "#9CAF88", "#AD846A", "#C97A60",
      "#DEA5A4", "#D4A5A5",
    ],
    paletteNames: [
      "Warm Cream", "Warm Camel", "Soft Tan", "Soft Brown", "Warm Sand",
      "Moss Green", "Dusty Olive", "Soft Sage", "Soft Copper", "Warm Salmon",
      "Muted Blush", "Dusty Rose Warm",
    ],
    paletteContext: [
      "base", "base", "base", "base", "base",
      "base", "base", "accent", "power", "power",
      "power", "power",
    ],
    avoid: ["#000000", "#FFFFFF", "#FF1493", "#00BFFF", "#800080"],
    avoidNames: ["Pure Black", "Pure White", "Fuchsia", "Electric Blue", "Intense Purple"],
    metals: { best: ["antique bronze", "matte gold", "warm copper", "rose gold"], avoid: ["bright silver", "platinum"] },
    neutrals: [
      { hex: "#FAF0E6", name: "Warm Cream" },
      { hex: "#6B5D4F", name: "Soft Brown" },
      { hex: "#928A6E", name: "Dusty Khaki" },
      { hex: "#A89685", name: "Mushroom" },
    ],
    makeup: {
      lips: [
        { hex: "#C98B97", name: "Dusty Rose" },
        { hex: "#DBA77B", name: "Warm Nude" },
        { hex: "#BB8865", name: "Soft Terracotta" },
      ],
      cheek: [
        { hex: "#DBA77B", name: "Warm Peach" },
        { hex: "#C98B97", name: "Muted Rose" },
        { hex: "#FFCCBC", name: "Apricot" },
      ],
      eyes: [
        { hex: "#907450", name: "Warm Brown" },
        { hex: "#9CB285", name: "Soft Olive" },
        { hex: "#D0AF34", name: "Muted Gold" },
      ],
      base: [
        { hex: "#F2E9D6", name: "Warm Cream" },
        { hex: "#F2D5B3", name: "Soft Beige" },
      ],
    },
    nails: [
      { hex: "#CAA97C", name: "Warm Beige" },
      { hex: "#C98B97", name: "Dusty Rose" },
      { hex: "#9CB285", name: "Sage" },
      { hex: "#D0AF34", name: "Muted Gold" },
    ],
    emotionalDescriptors: ["warmly gentle", "soft and approachable", "naturally harmonious"],
    styleArchetype: "Warm Minimalist",
    whyOldClothesFeltWrong: "Vivid and cool colors competed with your soft warm nature. Muted, dusty warm tones create effortless harmony with your coloring.",
  },

  // ─── WINTER ────────────────────────────────────────────────────────────────

  {
    id: "true-winter",
    name: "True Winter",
    family: "winter",
    undertone: "cool",
    depth: "deep",
    chroma: "clear",
    description: "Cool, clear, and high-contrast — pure black, icy white, cobalt blue, true red, and emerald green. Crisp jewel tones with no warmth. The most balanced winter.",
    palette: [
      "#0A0A0A", "#F0F4F8", "#36454F", "#808890", "#1B2A4A",
      "#0047AB", "#C20018", "#046A38", "#C7338A", "#F0C4D8",
      "#D8C8E8", "#7F00FF",
    ],
    paletteNames: [
      "True Black", "Icy White", "Charcoal", "Cool Gray", "Deep Navy",
      "Cobalt Blue", "True Red", "Emerald Green", "Fuchsia", "Icy Pink",
      "Icy Lavender", "Pure Violet",
    ],
    paletteContext: [
      "base", "base", "base", "base", "base",
      "power", "power", "power", "accent", "accent",
      "accent", "accent",
    ],
    avoid: ["#FF8C00", "#C19A6B", "#BC8F8F", "#808000", "#8B4513"],
    avoidNames: ["Orange", "Camel", "Dusty Rose", "Olive", "Warm Brown"],
    metals: { best: ["silver", "platinum", "white gold", "gunmetal"], avoid: ["yellow gold", "rose gold", "copper"] },
    neutrals: [
      { hex: "#0A0A0A", name: "True Black" },
      { hex: "#F0F4F8", name: "Icy White" },
      { hex: "#36454F", name: "Charcoal" },
      { hex: "#808890", name: "Cool Gray" },
    ],
    makeup: {
      lips: [
        { hex: "#C20018", name: "True Red" },
        { hex: "#C7338A", name: "Cool Fuchsia" },
        { hex: "#8C1470", name: "Cool Berry" },
      ],
      cheek: [
        { hex: "#E8B4CC", name: "Cool Pink" },
        { hex: "#D890B4", name: "Rose" },
        { hex: "#C87095", name: "Deep Rose" },
      ],
      eyes: [
        { hex: "#1A1A1A", name: "Black" },
        { hex: "#36454F", name: "Charcoal" },
        { hex: "#0047AB", name: "Cobalt" },
      ],
      base: [
        { hex: "#F5F5F5", name: "Porcelain" },
        { hex: "#ECEFF1", name: "Cool White" },
      ],
    },
    nails: [
      { hex: "#C20018", name: "True Red" },
      { hex: "#0A0A0A", name: "Black" },
      { hex: "#C7338A", name: "Fuchsia" },
      { hex: "#0047AB", name: "Cobalt" },
    ],
    emotionalDescriptors: ["dramatically striking", "cool and powerful", "effortlessly commanding"],
    styleArchetype: "Bold Classic",
    whyOldClothesFeltWrong: "Warm earthy tones dulled your cool clarity and contrast. Your striking coloring demands pure, cool colors with graphic impact.",
  },

  {
    id: "dark-winter",
    name: "Dark Winter",
    family: "winter",
    undertone: "cool",
    depth: "deep",
    chroma: "clear",
    description: "Cool and deeply rich — midnight navy, dark plum, deep indigo, rich wine, and forest teal. The darkest winter: night-sky jewel tones with maximum depth and drama.",
    palette: [
      "#1D2327", "#F5F5F5", "#676767", "#35415E", "#003153",
      "#5F2566", "#4A4482", "#7D1B4D", "#7B1C2E", "#4B0057",
      "#0F5C6E", "#1A4A3C",
    ],
    paletteNames: [
      "Dark Gunmetal", "Cool White", "Granite Gray", "Charcoal Blue", "Prussian Blue",
      "Dark Purple", "Deep Indigo", "Rich Plum", "Winterberry", "Damson",
      "Deep Teal", "Forest Teal",
    ],
    paletteContext: [
      "base", "base", "base", "base", "base",
      "power", "power", "power", "power", "accent",
      "accent", "accent",
    ],
    avoid: ["#FFA500", "#DAA520", "#D2691E", "#BC8F8F", "#808000"],
    avoidNames: ["Orange", "Goldenrod", "Warm Chocolate", "Dusty Rose", "Olive"],
    metals: { best: ["silver", "platinum", "white gold", "gunmetal", "oxidized silver"], avoid: ["yellow gold", "rose gold", "warm brass"] },
    neutrals: [
      { hex: "#1D2327", name: "Dark Gunmetal" },
      { hex: "#F5F5F5", name: "Cool White" },
      { hex: "#676767", name: "Granite Gray" },
      { hex: "#35415E", name: "Charcoal Blue" },
    ],
    makeup: {
      lips: [
        { hex: "#500417", name: "Deep Burgundy" },
        { hex: "#4F0854", name: "Dark Plum" },
        { hex: "#3E1248", name: "Deep Purple" },
      ],
      cheek: [
        { hex: "#C01870", name: "Deep Rose" },
        { hex: "#A01060", name: "Cool Berry" },
        { hex: "#8B0050", name: "Dark Rose" },
      ],
      eyes: [
        { hex: "#1D2327", name: "Midnight" },
        { hex: "#063E3E", name: "Dark Teal" },
        { hex: "#2A0450", name: "Deep Violet" },
      ],
      base: [
        { hex: "#29293B", name: "Deepest Cool" },
        { hex: "#354851", name: "Cool Dark" },
      ],
    },
    nails: [
      { hex: "#4F0854", name: "Dark Plum" },
      { hex: "#003153", name: "Deep Navy" },
      { hex: "#500417", name: "Deep Burgundy" },
      { hex: "#1D2327", name: "Midnight" },
    ],
    emotionalDescriptors: ["mysteriously elegant", "deeply sophisticated", "quietly powerful"],
    styleArchetype: "Dark Minimalist",
    whyOldClothesFeltWrong: "Warm and light colors compete with your deep cool coloring. Your intensity shines in rich, deep cool jewel tones.",
  },

  {
    id: "bright-winter",
    name: "Bright Winter",
    family: "winter",
    undertone: "cool",
    depth: "medium",
    chroma: "clear",
    description: "Cool and highly vivid — electric fuchsia, cobalt, vivid emerald, bright turquoise. The most saturated winter. Bridges Winter and Spring through shared high chroma.",
    palette: [
      "#FFFAFA", "#191970", "#E6E6FA", "#2F2F2F", "#DA4A94",
      "#BE74C9", "#DA4E5F", "#006FDB", "#50C878", "#E8003D",
      "#D4188A", "#009DAD",
    ],
    paletteNames: [
      "Snow White", "Midnight Blue", "Icy Lavender", "Dark Gray", "Vivid Magenta",
      "Rich Orchid", "Clear Coral-Pink", "Cobalt Blue", "Vivid Emerald", "Clear Red",
      "Vivid Fuchsia", "Clear Teal",
    ],
    paletteContext: [
      "base", "base", "base", "base", "power",
      "power", "power", "power", "power", "power",
      "accent", "accent",
    ],
    avoid: ["#FF8C00", "#C19A6B", "#9B8A5A", "#BC8F8F", "#808000"],
    avoidNames: ["Orange", "Warm Camel", "Dusty Khaki", "Dusty Rose", "Olive"],
    metals: { best: ["silver", "platinum", "white gold"], avoid: ["yellow gold", "warm brass", "copper"] },
    neutrals: [
      { hex: "#FFFAFA", name: "Snow White" },
      { hex: "#191970", name: "Midnight Blue" },
      { hex: "#C0C0C0", name: "Silver" },
      { hex: "#2F2F2F", name: "Dark Gray" },
    ],
    makeup: {
      lips: [
        { hex: "#E8003D", name: "Clear Red" },
        { hex: "#DA4A94", name: "Vivid Pink" },
        { hex: "#D4188A", name: "Vivid Fuchsia" },
      ],
      cheek: [
        { hex: "#DA4A94", name: "Vivid Pink" },
        { hex: "#E870A8", name: "Bright Rose" },
        { hex: "#FF4081", name: "Electric Pink" },
      ],
      eyes: [
        { hex: "#0A0A0A", name: "Black" },
        { hex: "#006FDB", name: "Cobalt Blue" },
        { hex: "#7B2FBE", name: "Bright Purple" },
      ],
      base: [
        { hex: "#FFFFFF", name: "Pure White" },
        { hex: "#F5F5F5", name: "Porcelain" },
      ],
    },
    nails: [
      { hex: "#E8003D", name: "Vivid Red" },
      { hex: "#0A0A0A", name: "Black" },
      { hex: "#D4188A", name: "Vivid Fuchsia" },
      { hex: "#006FDB", name: "Cobalt Blue" },
    ],
    emotionalDescriptors: ["strikingly bold", "cool and dynamic", "powerfully vivid"],
    styleArchetype: "Dramatic Minimalist",
    whyOldClothesFeltWrong: "Muted and warm tones dampened your natural clarity and high contrast. Your vivid coloring demands electric, cool-clear colors with maximum impact.",
  },
];

const byName = new Map<string, SeasonPalette>(
  SEASON_PALETTES.map((sp) => [sp.name.toLowerCase(), sp])
);

const byId = new Map<string, SeasonPalette>(
  SEASON_PALETTES.map((sp) => [sp.id, sp])
);

export function findSeasonPalette(subSeason: string): SeasonPalette | undefined {
  const key = subSeason.trim().toLowerCase();
  return byName.get(key) ?? byId.get(key);
}
