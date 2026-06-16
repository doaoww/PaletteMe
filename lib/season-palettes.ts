export type SeasonPaletteMakeupEntry = { hex: string; name: string };

export type SeasonPaletteMakeup = {
  lips: SeasonPaletteMakeupEntry[];
  cheek: SeasonPaletteMakeupEntry[];
  eyes: SeasonPaletteMakeupEntry[];
  base: SeasonPaletteMakeupEntry[];
};

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
  {
    id: "true-spring",
    name: "True Spring",
    family: "spring",
    undertone: "warm",
    depth: "light",
    chroma: "clear",
    description: "Warm, light, and clear — fresh peachy glow with vibrant energy.",
    palette: ["#FCAC94", "#FA7248", "#FBD353", "#8DD934", "#AFE472", "#FAA62B", "#3ADEF4", "#F88BB0", "#FFFDE7", "#FCD083", "#DEF124", "#0FD8F1"],
    paletteNames: ["Peach", "Coral", "Golden Yellow", "Grass Green", "Warm Sage", "Light Orange", "Aqua", "Warm Pink", "Ivory", "Camel", "Lime", "Turquoise"],
    avoid: ["#607D8B", "#880E4F", "#212121", "#1A237E", "#90A4AE"],
    avoidNames: ["Cool Gray", "Burgundy", "Black", "Navy", "Ash Gray"],
    metals: {
      best: ["yellow gold", "rose gold"],
      avoid: ["silver", "platinum"],
    },
    neutrals: [
      { hex: "#FFFFF0", name: "Ivory" },
      { hex: "#F5E6D3", name: "Warm Beige" },
      { hex: "#D4C5A9", name: "Camel" },
      { hex: "#8B7355", name: "Warm Brown" },
    ],
    makeup: {
      lips: [
        { hex: "#FF7043", name: "Warm Coral" },
        { hex: "#FFAB91", name: "Peach" },
        { hex: "#F48FB1", name: "Warm Pink" },
      ],
      cheek: [
        { hex: "#FFCCBC", name: "Peach" },
        { hex: "#FFAB76", name: "Apricot" },
        { hex: "#FF8A65", name: "Light Coral" },
      ],
      eyes: [
        { hex: "#8D6E63", name: "Warm Brown" },
        { hex: "#827717", name: "Olive" },
        { hex: "#FF8F00", name: "Bronze" },
      ],
      base: [
        { hex: "#FFF8E1", name: "Warm Ivory" },
        { hex: "#FFE0B2", name: "Light Peach" },
      ],
    },
    nails: [
      { hex: "#FF7043", name: "Coral" },
      { hex: "#FFAB91", name: "Peach" },
      { hex: "#F48FB1", name: "Warm Pink" },
      { hex: "#D4A574", name: "Nude" },
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
    description: "Warm, light, and delicate — soft peachy blush with a luminous quality.",
    palette: ["#FECED3", "#FDE0B4", "#FEF8C5", "#F1F8E9", "#F3E5F5", "#FCE4EC", "#FDCDBE", "#E0F7FA", "#FFFDE7", "#FFF8E1", "#F9FBE7", "#FFF3E0"],
    paletteNames: ["Blush", "Peach", "Butter", "Mint", "Lilac", "Powder Pink", "Soft Coral", "Light Aqua", "Warm White", "Soft Gold", "Pale Sage", "Light Peach"],
    avoid: ["#212121", "#1A237E", "#37474F", "#880E4F", "#1B5E20"],
    avoidNames: ["Black", "Dark Navy", "Charcoal", "Deep Burgundy", "Dark Forest"],
    metals: {
      best: ["rose gold", "light gold"],
      avoid: ["dark silver", "gunmetal"],
    },
    neutrals: [
      { hex: "#FFFFF0", name: "Ivory" },
      { hex: "#F5E6D3", name: "Warm Beige" },
      { hex: "#D4C5A9", name: "Camel" },
      { hex: "#8B7355", name: "Warm Brown" },
    ],
    makeup: {
      lips: [
        { hex: "#FFCDD2", name: "Soft Blush" },
        { hex: "#FFE0B2", name: "Peach Nude" },
        { hex: "#FCE4EC", name: "Powder Pink" },
      ],
      cheek: [
        { hex: "#FFCDD2", name: "Baby Blush" },
        { hex: "#FFE0B2", name: "Peach" },
        { hex: "#FFCCBC", name: "Soft Apricot" },
      ],
      eyes: [
        { hex: "#D7CCC8", name: "Warm Taupe" },
        { hex: "#BCAAA4", name: "Rose Nude" },
        { hex: "#A1887F", name: "Light Brown" },
      ],
      base: [
        { hex: "#FFFDE7", name: "Lightest Ivory" },
        { hex: "#FFF8E1", name: "Warm Porcelain" },
      ],
    },
    nails: [
      { hex: "#FFCDD2", name: "Baby Pink" },
      { hex: "#FFE0B2", name: "Peach Cream" },
      { hex: "#FCE4EC", name: "Powder" },
      { hex: "#F3E5F5", name: "Soft Lilac" },
    ],
    emotionalDescriptors: ["delicate and feminine", "soft and luminous", "effortlessly pretty"],
    styleArchetype: "Soft Romantic",
    whyOldClothesFeltWrong: "Dark heavy colors overwhelmed your delicate coloring. You shine in soft, light tones that complement rather than overpower your features.",
  },

  {
    id: "bright-spring",
    name: "Bright Spring",
    family: "spring",
    undertone: "warm",
    depth: "medium",
    chroma: "clear",
    description: "Warm, high-contrast, and vivid — bold warm clarity with striking presence.",
    palette: ["#F95A28", "#FAE740", "#33C839", "#05B8CF", "#F31460", "#1B97F9", "#8DDB32", "#F99706", "#F75B90", "#049285", "#AB11C6", "#FA3E30"],
    paletteNames: ["Hot Coral", "Bright Yellow", "Emerald", "Turquoise", "Magenta", "Royal Blue", "Lime", "Orange", "Bright Pink", "Teal", "Violet", "Red"],
    avoid: ["#9E9E9E", "#C48B9F", "#9E9D24", "#D7CCC8", "#78909C"],
    avoidNames: ["Muted Gray", "Dusty Rose", "Khaki", "Beige", "Dusty Blue"],
    metals: {
      best: ["bright gold", "silver"],
      avoid: ["antique gold", "bronze"],
    },
    neutrals: [
      { hex: "#FFFFF0", name: "Ivory" },
      { hex: "#F5E6D3", name: "Warm Beige" },
      { hex: "#D4C5A9", name: "Camel" },
      { hex: "#8B7355", name: "Warm Brown" },
    ],
    makeup: {
      lips: [
        { hex: "#FF5722", name: "Hot Coral" },
        { hex: "#E91E63", name: "Magenta" },
        { hex: "#F44336", name: "True Red" },
      ],
      cheek: [
        { hex: "#FF8A65", name: "Bright Coral" },
        { hex: "#FF7043", name: "Warm Orange" },
        { hex: "#F06292", name: "Hot Pink" },
      ],
      eyes: [
        { hex: "#009688", name: "Teal" },
        { hex: "#2196F3", name: "Cobalt Blue" },
        { hex: "#4CAF50", name: "Emerald" },
      ],
      base: [
        { hex: "#FFF9C4", name: "Warm Light" },
        { hex: "#FFECB3", name: "Golden Ivory" },
      ],
    },
    nails: [
      { hex: "#FF5722", name: "Hot Coral" },
      { hex: "#FFEB3B", name: "Bright Yellow" },
      { hex: "#E91E63", name: "Magenta" },
      { hex: "#4CAF50", name: "Emerald" },
    ],
    emotionalDescriptors: ["bold and vibrant", "energetic and striking", "naturally eye-catching"],
    styleArchetype: "Bold Vibrant",
    whyOldClothesFeltWrong: "Muted and dusty tones dulled your natural vibrancy. Your high contrast coloring demands clear bright colors that match your energy.",
  },

  {
    id: "true-summer",
    name: "True Summer",
    family: "summer",
    undertone: "cool",
    depth: "medium",
    chroma: "muted",
    description: "Cool, medium depth, muted — elegant rose and lavender with quiet sophistication.",
    palette: ["#D17E9B", "#BC7C98", "#6B7CD9", "#9167DB", "#3AC9BB", "#F01761", "#7946D3", "#4B5FD1", "#55CC5B", "#F23A78", "#6B7CD9", "#4A7AAB"],
    paletteNames: ["Dusty Rose", "Mauve", "Soft Blue", "Lavender", "Muted Teal", "Rose", "Dusty Purple", "Soft Navy", "Muted Green", "Cool Pink", "Periwinkle", "Steel Blue"],
    avoid: ["#FF9800", "#FFC107", "#BF360C", "#795548", "#F57F17"],
    avoidNames: ["Orange", "Warm Yellow", "Rust", "Warm Brown", "Gold"],
    metals: {
      best: ["silver", "platinum", "white gold"],
      avoid: ["yellow gold", "bronze"],
    },
    neutrals: [
      { hex: "#F8F8FF", name: "Soft White" },
      { hex: "#D3D3D3", name: "Light Gray" },
      { hex: "#B0C4DE", name: "Light Steel Blue" },
      { hex: "#778899", name: "Slate Gray" },
    ],
    makeup: {
      lips: [
        { hex: "#C48B9F", name: "Dusty Rose" },
        { hex: "#AD8B9A", name: "Mauve" },
        { hex: "#EC407A", name: "Cool Pink" },
      ],
      cheek: [
        { hex: "#F8BBD0", name: "Rose Blush" },
        { hex: "#F48FB1", name: "Cool Pink" },
        { hex: "#E1BEE7", name: "Lavender Flush" },
      ],
      eyes: [
        { hex: "#7986CB", name: "Soft Blue" },
        { hex: "#9575CD", name: "Lavender" },
        { hex: "#90A4AE", name: "Steel Gray" },
      ],
      base: [
        { hex: "#F3F3F3", name: "Cool Porcelain" },
        { hex: "#E0E0E0", name: "Soft Gray" },
      ],
    },
    nails: [
      { hex: "#C48B9F", name: "Dusty Rose" },
      { hex: "#7986CB", name: "Periwinkle" },
      { hex: "#9575CD", name: "Lavender" },
      { hex: "#AD8B9A", name: "Mauve" },
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
    description: "Cool, light, and soft — powder blue and blush with an airy, delicate glow.",
    palette: ["#B9DEFD", "#E6B7EE", "#FECED3", "#E8F5E9", "#FAB9CF", "#EDE7F6", "#F3F3F3", "#E0F7FA", "#F5CBD6", "#CBD6F5", "#E3F2FD", "#FCE4EC"],
    paletteNames: ["Powder Blue", "Soft Lavender", "Blush", "Mint", "Rose", "Soft Lilac", "Cool White", "Pale Aqua", "Dusty Pink", "Soft Periwinkle", "Ice Blue", "Pale Rose"],
    avoid: ["#FF9800", "#FFC107", "#8D6E63", "#BF360C", "#827717"],
    avoidNames: ["Orange", "Gold", "Warm Brown", "Rust", "Olive"],
    metals: {
      best: ["silver", "white gold"],
      avoid: ["yellow gold", "copper"],
    },
    neutrals: [
      { hex: "#F8F8FF", name: "Soft White" },
      { hex: "#D3D3D3", name: "Light Gray" },
      { hex: "#B0C4DE", name: "Light Steel Blue" },
      { hex: "#778899", name: "Slate Gray" },
    ],
    makeup: {
      lips: [
        { hex: "#F8BBD0", name: "Soft Rose" },
        { hex: "#FFCDD2", name: "Petal Pink" },
        { hex: "#FCE4EC", name: "Pale Rose" },
      ],
      cheek: [
        { hex: "#FFCDD2", name: "Baby Blush" },
        { hex: "#F8BBD0", name: "Soft Pink" },
        { hex: "#E1BEE7", name: "Lavender Blush" },
      ],
      eyes: [
        { hex: "#BBDEFB", name: "Ice Blue" },
        { hex: "#E1BEE7", name: "Soft Lavender" },
        { hex: "#B0BEC5", name: "Silver Gray" },
      ],
      base: [
        { hex: "#F3F3F3", name: "Lightest Cool" },
        { hex: "#E3F2FD", name: "Porcelain" },
      ],
    },
    nails: [
      { hex: "#BBDEFB", name: "Ice Blue" },
      { hex: "#FFCDD2", name: "Blush" },
      { hex: "#E1BEE7", name: "Soft Lavender" },
      { hex: "#F8BBD0", name: "Petal" },
    ],
    emotionalDescriptors: ["soft and feminine", "cool and delicate", "quietly beautiful"],
    styleArchetype: "Soft Feminine",
    whyOldClothesFeltWrong: "Warm and dark colors overwhelmed your soft cool coloring. Light cool tones bring out your natural delicacy.",
  },

  {
    id: "soft-summer",
    name: "Soft Summer",
    family: "summer",
    undertone: "neutral",
    depth: "medium",
    chroma: "muted",
    description: "Neutral-cool, medium depth, muted — calm and harmonious in dusty sophisticated tones.",
    palette: ["#C4788A", "#A0A0A8", "#7BA87B", "#AB9173", "#6B7FCC", "#CE8694", "#5CADA6", "#AD9073", "#A083B4", "#93AD5F", "#CDB99F", "#5F79AD"],
    paletteNames: ["Dusty Mauve", "Soft Gray", "Muted Sage", "Cool Taupe", "Dusty Blue", "Muted Rose", "Soft Teal", "Warm Gray", "Dusty Lavender", "Muted Olive", "Cool Sand", "Soft Navy"],
    avoid: ["#FF5722", "#E91E63", "#FFEB3B", "#F44336", "#FFFFFF"],
    avoidNames: ["Bright Orange", "Hot Pink", "Neon Yellow", "Bright Red", "Pure White"],
    metals: {
      best: ["brushed silver", "pewter"],
      avoid: ["bright gold", "copper"],
    },
    neutrals: [
      { hex: "#F8F8FF", name: "Soft White" },
      { hex: "#D3D3D3", name: "Light Gray" },
      { hex: "#B0C4DE", name: "Light Steel Blue" },
      { hex: "#778899", name: "Slate Gray" },
    ],
    makeup: {
      lips: [
        { hex: "#B0848A", name: "Dusty Mauve" },
        { hex: "#C4909A", name: "Muted Rose" },
        { hex: "#9E8FA8", name: "Dusty Plum" },
      ],
      cheek: [
        { hex: "#C4909A", name: "Muted Rose" },
        { hex: "#B0848A", name: "Dusty Pink" },
        { hex: "#9E9E9E", name: "Soft Taupe" },
      ],
      eyes: [
        { hex: "#7B8FA6", name: "Dusty Blue" },
        { hex: "#8D9E7E", name: "Muted Sage" },
        { hex: "#9E8FA8", name: "Dusty Lavender" },
      ],
      base: [
        { hex: "#C4B8A8", name: "Cool Beige" },
        { hex: "#D7CCC8", name: "Soft Linen" },
      ],
    },
    nails: [
      { hex: "#B0848A", name: "Dusty Mauve" },
      { hex: "#9E8FA8", name: "Lavender Gray" },
      { hex: "#8D9E7E", name: "Muted Sage" },
      { hex: "#C4B8A8", name: "Sand" },
    ],
    emotionalDescriptors: ["softly sophisticated", "calm and harmonious", "understated elegance"],
    styleArchetype: "Quiet Sophisticate",
    whyOldClothesFeltWrong: "Both very warm and very cool extremes competed with your balanced neutral undertone. Soft muted tones are your natural harmony.",
  },

  {
    id: "true-autumn",
    name: "True Autumn",
    family: "autumn",
    undertone: "warm",
    depth: "medium",
    chroma: "muted",
    description: "Warm, medium depth, muted — rich terracotta and olive with earthy luxurious warmth.",
    palette: ["#DA5C17", "#9F7541", "#708E39", "#AD471C", "#C75605", "#207979", "#D0A60F", "#2B590D", "#54361E", "#FAE7CE", "#916B0E", "#771313"],
    paletteNames: ["Terracotta", "Camel", "Warm Olive", "Rust", "Burnt Orange", "Teal", "Mustard", "Forest Green", "Chocolate", "Warm Ivory", "Golden Brown", "Burgundy"],
    avoid: ["#FF69B4", "#9370DB", "#B0C4DE", "#FFFFFF", "#CCFF00"],
    avoidNames: ["Hot Pink", "Lavender", "Ice Blue", "Bright White", "Neon"],
    metals: {
      best: ["yellow gold", "bronze", "copper"],
      avoid: ["silver", "platinum"],
    },
    neutrals: [
      { hex: "#FDF5E6", name: "Old Lace" },
      { hex: "#D2B48C", name: "Tan" },
      { hex: "#8B7355", name: "Camel" },
      { hex: "#4A3728", name: "Chocolate" },
    ],
    makeup: {
      lips: [
        { hex: "#C4622D", name: "Terracotta" },
        { hex: "#9B4E2E", name: "Rust" },
        { hex: "#6B1F1F", name: "Burgundy" },
      ],
      cheek: [
        { hex: "#C4622D", name: "Warm Coral" },
        { hex: "#CC5500", name: "Burnt Orange" },
        { hex: "#D4956A", name: "Warm Peach" },
      ],
      eyes: [
        { hex: "#8B7355", name: "Warm Brown" },
        { hex: "#6B7C4B", name: "Olive" },
        { hex: "#C8A217", name: "Gold" },
      ],
      base: [
        { hex: "#F5E6D3", name: "Warm Ivory" },
        { hex: "#EDD5B8", name: "Golden Beige" },
      ],
    },
    nails: [
      { hex: "#C4622D", name: "Terracotta" },
      { hex: "#9B4E2E", name: "Rust" },
      { hex: "#C8A217", name: "Mustard" },
      { hex: "#4A3728", name: "Chocolate" },
    ],
    emotionalDescriptors: ["rich and earthy", "warm and grounded", "naturally luxurious"],
    styleArchetype: "Warm Naturalist",
    whyOldClothesFeltWrong: "Cool grays and icy colors drained your warm richness. Your depth and warmth shine in earthy tones that mirror nature.",
  },

  {
    id: "soft-autumn",
    name: "Soft Autumn",
    family: "autumn",
    undertone: "neutral",
    depth: "medium",
    chroma: "muted",
    description: "Neutral-warm, medium depth, muted — softly warm beige and sage with effortless harmony.",
    palette: ["#D2AA74", "#9C7544", "#9CBE79", "#C6865A", "#E1A775", "#69AFAF", "#B3804D", "#B99E67", "#D18392", "#D7B32D", "#B0B05C", "#F4E9D4"],
    paletteNames: ["Warm Beige", "Camel", "Sage", "Warm Tan", "Dusty Peach", "Muted Teal", "Soft Brown", "Warm Gray", "Dusty Rose", "Muted Gold", "Soft Olive", "Warm Cream"],
    avoid: ["#FF1493", "#0000FF", "#FF4500", "#00FF00", "#000000"],
    avoidNames: ["Bright Pink", "Electric Blue", "Bright Orange", "Neon Green", "Pure Black"],
    metals: {
      best: ["rose gold", "antique gold"],
      avoid: ["bright silver", "platinum"],
    },
    neutrals: [
      { hex: "#FDF5E6", name: "Old Lace" },
      { hex: "#D2B48C", name: "Tan" },
      { hex: "#8B7355", name: "Camel" },
      { hex: "#4A3728", name: "Chocolate" },
    ],
    makeup: {
      lips: [
        { hex: "#C4909A", name: "Dusty Rose" },
        { hex: "#D4A882", name: "Warm Nude" },
        { hex: "#B5896B", name: "Warm Tan" },
      ],
      cheek: [
        { hex: "#D4A882", name: "Warm Peach" },
        { hex: "#C4909A", name: "Soft Rose" },
        { hex: "#FFCCBC", name: "Apricot" },
      ],
      eyes: [
        { hex: "#8B7355", name: "Warm Brown" },
        { hex: "#9CAF88", name: "Soft Olive" },
        { hex: "#C4A840", name: "Muted Gold" },
      ],
      base: [
        { hex: "#F0E8D8", name: "Warm Cream" },
        { hex: "#EDD5B8", name: "Soft Beige" },
      ],
    },
    nails: [
      { hex: "#C4A882", name: "Warm Beige" },
      { hex: "#C4909A", name: "Dusty Rose" },
      { hex: "#9CAF88", name: "Sage" },
      { hex: "#C4A840", name: "Muted Gold" },
    ],
    emotionalDescriptors: ["warmly elegant", "soft and approachable", "naturally harmonious"],
    styleArchetype: "Warm Minimalist",
    whyOldClothesFeltWrong: "Bright and cool colors competed with your soft warm undertone. Muted warm tones create effortless harmony with your coloring.",
  },

  {
    id: "dark-autumn",
    name: "Dark Autumn",
    family: "autumn",
    undertone: "warm",
    depth: "deep",
    chroma: "muted",
    description: "Warm, deep, and muted — deeply rich chocolate and forest with dramatic earthy power.",
    palette: ["#770E0E", "#441E09", "#415416", "#115353", "#916B0E", "#174109", "#2F190B", "#90270B", "#784C13", "#2F1A05", "#3D5311", "#642706"],
    paletteNames: ["Dark Burgundy", "Chocolate", "Dark Olive", "Deep Teal", "Dark Gold", "Forest", "Warm Black", "Deep Rust", "Dark Camel", "Espresso", "Deep Olive", "Dark Sienna"],
    avoid: ["#FFB6C1", "#FFFDE7", "#BBDEFB", "#E8F5E9", "#E1BEE7"],
    avoidNames: ["Light Pink", "Pale Yellow", "Baby Blue", "Mint", "Lavender"],
    metals: {
      best: ["dark gold", "antique bronze"],
      avoid: ["silver", "bright gold"],
    },
    neutrals: [
      { hex: "#FDF5E6", name: "Old Lace" },
      { hex: "#D2B48C", name: "Tan" },
      { hex: "#8B7355", name: "Camel" },
      { hex: "#4A3728", name: "Chocolate" },
    ],
    makeup: {
      lips: [
        { hex: "#6B1A1A", name: "Dark Burgundy" },
        { hex: "#8B2A10", name: "Deep Rust" },
        { hex: "#5A2A10", name: "Dark Sienna" },
      ],
      cheek: [
        { hex: "#8B2A10", name: "Deep Rust" },
        { hex: "#C4622D", name: "Terracotta" },
        { hex: "#9B4E2E", name: "Warm Rust" },
      ],
      eyes: [
        { hex: "#3D4A20", name: "Dark Olive" },
        { hex: "#8B6914", name: "Dark Gold" },
        { hex: "#1A4A4A", name: "Deep Teal" },
      ],
      base: [
        { hex: "#3D2010", name: "Deep Warm" },
        { hex: "#5A3A20", name: "Rich Bronze" },
      ],
    },
    nails: [
      { hex: "#6B1A1A", name: "Dark Burgundy" },
      { hex: "#3D4A20", name: "Dark Olive" },
      { hex: "#8B6914", name: "Dark Gold" },
      { hex: "#2A1A0A", name: "Espresso" },
    ],
    emotionalDescriptors: ["deeply rich", "dramatically elegant", "powerfully sophisticated"],
    styleArchetype: "Dark Romantic",
    whyOldClothesFeltWrong: "Light pastel colors washed out your deep rich coloring. Your natural drama shines in deep earthy tones.",
  },

  {
    id: "true-winter",
    name: "True Winter",
    family: "winter",
    undertone: "cool",
    depth: "deep",
    chroma: "clear",
    description: "Cool, deep, and clear — striking jewel tones and crisp contrast with commanding presence.",
    palette: ["#1A1A1A", "#F5F5F5", "#EC1616", "#0C64C9", "#1D8E23", "#F31460", "#6E09AC", "#03665A", "#B50C56", "#B2E5FD", "#0645A8", "#CB0F59"],
    paletteNames: ["Pure Black", "Pure White", "True Red", "Royal Blue", "Emerald", "Hot Pink", "Deep Purple", "Dark Teal", "Bright Magenta", "Ice Blue", "True Navy", "Fuchsia"],
    avoid: ["#D7CCC8", "#8D6E63", "#795548", "#F9A825", "#BF360C"],
    avoidNames: ["Warm Beige", "Camel", "Warm Brown", "Golden Yellow", "Terracotta"],
    metals: {
      best: ["silver", "platinum", "white gold"],
      avoid: ["yellow gold", "copper", "bronze"],
    },
    neutrals: [
      { hex: "#FFFFFF", name: "Pure White" },
      { hex: "#C0C0C0", name: "Silver Gray" },
      { hex: "#2F2F2F", name: "Near Black" },
      { hex: "#191970", name: "Midnight Blue" },
    ],
    makeup: {
      lips: [
        { hex: "#D32F2F", name: "True Red" },
        { hex: "#C2185B", name: "Fuchsia" },
        { hex: "#AD1457", name: "Bright Magenta" },
      ],
      cheek: [
        { hex: "#E91E63", name: "Cool Pink" },
        { hex: "#F06292", name: "Rose" },
        { hex: "#EC407A", name: "Deep Rose" },
      ],
      eyes: [
        { hex: "#1A1A1A", name: "Black" },
        { hex: "#1565C0", name: "Royal Blue" },
        { hex: "#6A1B9A", name: "Deep Purple" },
      ],
      base: [
        { hex: "#F5F5F5", name: "Porcelain" },
        { hex: "#ECEFF1", name: "Cool White" },
      ],
    },
    nails: [
      { hex: "#D32F2F", name: "True Red" },
      { hex: "#1A1A1A", name: "Black" },
      { hex: "#C2185B", name: "Fuchsia" },
      { hex: "#1565C0", name: "Royal Blue" },
    ],
    emotionalDescriptors: ["dramatically striking", "cool and powerful", "effortlessly commanding"],
    styleArchetype: "Bold Classic",
    whyOldClothesFeltWrong: "Warm earthy tones dulled your natural cool contrast and clarity. Your striking coloring demands cool clear colors with impact.",
  },

  {
    id: "dark-winter",
    name: "Dark Winter",
    family: "winter",
    undertone: "cool",
    depth: "deep",
    chroma: "muted",
    description: "Cool, deep, muted — mysterious navy and plum with quietly powerful intensity.",
    palette: ["#051752", "#510656", "#052F1A", "#4D0719", "#212143", "#044040", "#2A074D", "#141430", "#400418", "#052F05", "#122A42", "#1A0A0A"],
    paletteNames: ["Deep Navy", "Dark Plum", "Forest Black", "Deep Burgundy", "Charcoal", "Dark Teal", "Deep Violet", "Midnight", "Dark Wine", "Deep Forest", "Dark Slate", "Espresso"],
    avoid: ["#FFCCBC", "#FFF9C4", "#FFE0B2", "#FCE4EC", "#FFF8E1"],
    avoidNames: ["Peach", "Warm Yellow", "Light Orange", "Soft Pink", "Warm Beige"],
    metals: {
      best: ["dark silver", "gunmetal", "pewter"],
      avoid: ["gold", "copper", "bronze"],
    },
    neutrals: [
      { hex: "#FFFFFF", name: "Pure White" },
      { hex: "#C0C0C0", name: "Silver Gray" },
      { hex: "#2F2F2F", name: "Near Black" },
      { hex: "#191970", name: "Midnight Blue" },
    ],
    makeup: {
      lips: [
        { hex: "#4A0A1A", name: "Deep Burgundy" },
        { hex: "#3A0A1A", name: "Dark Wine" },
        { hex: "#4A0E4E", name: "Dark Plum" },
      ],
      cheek: [
        { hex: "#C2185B", name: "Deep Rose" },
        { hex: "#AD1457", name: "Cool Berry" },
        { hex: "#880E4F", name: "Dark Rose" },
      ],
      eyes: [
        { hex: "#1A1A2A", name: "Midnight" },
        { hex: "#0A3A3A", name: "Dark Teal" },
        { hex: "#2A0A4A", name: "Deep Violet" },
      ],
      base: [
        { hex: "#2A2A3A", name: "Deepest Cool" },
        { hex: "#37474F", name: "Cool Dark" },
      ],
    },
    nails: [
      { hex: "#4A0E4E", name: "Dark Plum" },
      { hex: "#0D1B4A", name: "Deep Navy" },
      { hex: "#4A0A1A", name: "Deep Burgundy" },
      { hex: "#1A1A2A", name: "Midnight" },
    ],
    emotionalDescriptors: ["mysteriously elegant", "deeply sophisticated", "quietly powerful"],
    styleArchetype: "Dark Minimalist",
    whyOldClothesFeltWrong: "Warm and light colors competed with your deep cool coloring. Your natural intensity shines in deep cool tones.",
  },

  {
    id: "bright-winter",
    name: "Bright Winter",
    family: "winter",
    undertone: "cool",
    depth: "medium",
    chroma: "clear",
    description: "Cool, high-contrast, and vivid — bold jewel tones with electric clarity and power.",
    palette: ["#FFFFFF", "#000000", "#FA3E30", "#1B97F9", "#F31460", "#AB11C6", "#33C839", "#DF41FA", "#05B8CF", "#FAE740", "#0C64C9", "#F95A28"],
    paletteNames: ["Pure White", "True Black", "Bright Red", "Electric Blue", "Hot Pink", "Bright Purple", "Emerald", "Fuchsia", "Bright Teal", "True Yellow", "Cobalt", "Bright Coral"],
    avoid: ["#D7CCC8", "#8D6E63", "#C48B9F", "#9E9D24", "#9E9E9E"],
    avoidNames: ["Beige", "Camel", "Dusty Rose", "Khaki", "Muted Gray"],
    metals: {
      best: ["bright silver", "platinum"],
      avoid: ["gold", "bronze", "copper"],
    },
    neutrals: [
      { hex: "#FFFFFF", name: "Pure White" },
      { hex: "#C0C0C0", name: "Silver Gray" },
      { hex: "#2F2F2F", name: "Near Black" },
      { hex: "#191970", name: "Midnight Blue" },
    ],
    makeup: {
      lips: [
        { hex: "#F44336", name: "Bright Red" },
        { hex: "#E91E63", name: "Hot Pink" },
        { hex: "#E040FB", name: "Fuchsia" },
      ],
      cheek: [
        { hex: "#E91E63", name: "Hot Pink" },
        { hex: "#F06292", name: "Bright Rose" },
        { hex: "#FF4081", name: "Electric Pink" },
      ],
      eyes: [
        { hex: "#000000", name: "Black" },
        { hex: "#2196F3", name: "Electric Blue" },
        { hex: "#9C27B0", name: "Bright Purple" },
      ],
      base: [
        { hex: "#FFFFFF", name: "Pure White" },
        { hex: "#F5F5F5", name: "Porcelain" },
      ],
    },
    nails: [
      { hex: "#F44336", name: "Bright Red" },
      { hex: "#000000", name: "Black" },
      { hex: "#E040FB", name: "Fuchsia" },
      { hex: "#2196F3", name: "Electric Blue" },
    ],
    emotionalDescriptors: ["strikingly bold", "cool and dynamic", "powerfully vivid"],
    styleArchetype: "Dramatic Minimalist",
    whyOldClothesFeltWrong: "Muted and warm tones dampened your natural high contrast clarity. Your vivid coloring demands cool clear colors with maximum impact.",
  },
];

const byName = new Map<string, SeasonPalette>(
  SEASON_PALETTES.map((sp) => [sp.name.toLowerCase(), sp])
);

const byId = new Map<string, SeasonPalette>(
  SEASON_PALETTES.map((sp) => [sp.id, sp])
);

export function findSeasonPalette(subSeason: string): SeasonPalette | undefined {
  return byName.get(subSeason.toLowerCase()) ?? byId.get(subSeason.toLowerCase());
}
