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
    palette: ["#FFAA91", "#FF6F43", "#FFD54F", "#8EE726", "#B0EE68", "#FFA726", "#2FE6FF", "#FF84AE", "#FFFDE7", "#FFD180", "#E9FF16", "#01E3FF"],
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
        { hex: "#FD86AE", name: "Warm Pink" },
      ],
      cheek: [
        { hex: "#FFCCBC", name: "Peach" },
        { hex: "#FFAB76", name: "Apricot" },
        { hex: "#FF8A65", name: "Light Coral" },
      ],
      eyes: [
        { hex: "#916C5F", name: "Warm Brown" },
        { hex: "#8B7E0E", name: "Olive" },
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
      { hex: "#FD86AE", name: "Warm Pink" },
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
    description: "Warm, light, and delicate — soft peachy blush with a luminous quality.",
    palette: ["#FFCDD2", "#FFE0B2", "#FFF9C4", "#F1F9E8", "#F4E4F6", "#FEE2EB", "#FFCCBC", "#DEF9FC", "#FFFDE7", "#FFF8E1", "#FAFDE5", "#FFF3E0"],
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
        { hex: "#FEE2EB", name: "Powder Pink" },
      ],
      cheek: [
        { hex: "#FFCDD2", name: "Baby Blush" },
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
      { hex: "#FFCDD2", name: "Baby Pink" },
      { hex: "#FFE0B2", name: "Peach Cream" },
      { hex: "#FEE2EB", name: "Powder" },
      { hex: "#F4E4F6", name: "Soft Lilac" },
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
    palette: ["#FF5722", "#FFEB3B", "#26D52D", "#00BCD4", "#FF085C", "#1598FF", "#8EEA23", "#FF9800", "#FF538D", "#009688", "#B601D6", "#FF3A2B"],
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
        { hex: "#FB0C5D", name: "Magenta" },
        { hex: "#FF3A2B", name: "True Red" },
      ],
      cheek: [
        { hex: "#FF8A65", name: "Bright Coral" },
        { hex: "#FF7043", name: "Warm Orange" },
        { hex: "#FC568E", name: "Hot Pink" },
      ],
      eyes: [
        { hex: "#009688", name: "Teal" },
        { hex: "#1597FF", name: "Cobalt Blue" },
        { hex: "#43B848", name: "Emerald" },
      ],
      base: [
        { hex: "#FFF9C4", name: "Warm Light" },
        { hex: "#FFECB3", name: "Golden Ivory" },
      ],
    },
    nails: [
      { hex: "#FF5722", name: "Hot Coral" },
      { hex: "#FFEB3B", name: "Bright Yellow" },
      { hex: "#FB0C5D", name: "Magenta" },
      { hex: "#43B848", name: "Emerald" },
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
    palette: ["#D87799", "#C27697", "#6175E3", "#8E5DE5", "#2DD6C5", "#FF085C", "#763ADF", "#3F57DD", "#4BD652", "#FF2D74", "#6175E3", "#427AB3"],
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
        { hex: "#C9869E", name: "Dusty Rose" },
        { hex: "#B0889A", name: "Mauve" },
        { hex: "#FB3175", name: "Cool Pink" },
      ],
      cheek: [
        { hex: "#FDB6CE", name: "Rose Blush" },
        { hex: "#FD86AE", name: "Cool Pink" },
        { hex: "#E4BAEB", name: "Lavender Flush" },
      ],
      eyes: [
        { hex: "#7281D2", name: "Soft Blue" },
        { hex: "#936DD5", name: "Lavender" },
        { hex: "#8DA5B1", name: "Steel Gray" },
      ],
      base: [
        { hex: "#F3F3F3", name: "Cool Porcelain" },
        { hex: "#E0E0E0", name: "Soft Gray" },
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
    description: "Cool, light, and soft — powder blue and blush with an airy, delicate glow.",
    palette: ["#B7DEFF", "#E9B2F3", "#FFCDD2", "#E7F6E8", "#FFB4CD", "#EDE6F7", "#F3F3F3", "#DEF9FC", "#F9C7D4", "#C7D4F9", "#E1F2FF", "#FEE2EB"],
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
        { hex: "#FDB6CE", name: "Soft Rose" },
        { hex: "#FFCDD2", name: "Petal Pink" },
        { hex: "#FEE2EB", name: "Pale Rose" },
      ],
      cheek: [
        { hex: "#FFCDD2", name: "Baby Blush" },
        { hex: "#FDB6CE", name: "Soft Pink" },
        { hex: "#E4BAEB", name: "Lavender Blush" },
      ],
      eyes: [
        { hex: "#B7DEFF", name: "Ice Blue" },
        { hex: "#E4BAEB", name: "Soft Lavender" },
        { hex: "#AEBFC7", name: "Silver Gray" },
      ],
      base: [
        { hex: "#F3F3F3", name: "Lightest Cool" },
        { hex: "#E1F2FF", name: "Porcelain" },
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
    undertone: "neutral",
    depth: "medium",
    chroma: "muted",
    description: "Neutral-cool, medium depth, muted — calm and harmonious in dusty sophisticated tones.",
    palette: ["#CB7187", "#9F9FA9", "#77AC77", "#B0916E", "#637AD4", "#D48090", "#55B4AC", "#B2906E", "#A17FB8", "#95B458", "#D1BA9B", "#5877B4"],
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
        { hex: "#CB7187", name: "Dusty Mauve" },
        { hex: "#D48090", name: "Muted Rose" },
        { hex: "#9E8DAA", name: "Dusty Plum" },
      ],
      cheek: [
        { hex: "#D48090", name: "Muted Rose" },
        { hex: "#B48087", name: "Dusty Pink" },
        { hex: "#9E9E9E", name: "Soft Taupe" },
      ],
      eyes: [
        { hex: "#637AD4", name: "Dusty Blue" },
        { hex: "#77AC77", name: "Muted Sage" },
        { hex: "#A17FB8", name: "Dusty Lavender" },
      ],
      base: [
        { hex: "#C6B8A6", name: "Cool Beige" },
        { hex: "#D8CBC7", name: "Soft Linen" },
      ],
    },
    nails: [
      { hex: "#CB7187", name: "Dusty Mauve" },
      { hex: "#9E8DAA", name: "Lavender Gray" },
      { hex: "#77AC77", name: "Muted Sage" },
      { hex: "#C6B8A6", name: "Sand" },
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
    palette: ["#EB5706", "#A77639", "#729532", "#BA420F", "#CC5500", "#188181", "#DFAE00", "#2A6006", "#593519", "#FEE8CA", "#9C7003", "#800A0A"],
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
        { hex: "#D15E20", name: "Terracotta" },
        { hex: "#A54A24", name: "Rust" },
        { hex: "#721818", name: "Burgundy" },
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
    palette: ["#DAAB6C", "#A4763C", "#9CC473", "#CF8451", "#EAA66C", "#63B5B5", "#BC8044", "#C0A060", "#D87C8E", "#E6BC1E", "#B7B755", "#F7EAD1"],
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
        { hex: "#C98B97", name: "Dusty Rose" },
        { hex: "#DBA77B", name: "Warm Nude" },
        { hex: "#BB8865", name: "Warm Tan" },
      ],
      cheek: [
        { hex: "#DBA77B", name: "Warm Peach" },
        { hex: "#C98B97", name: "Soft Rose" },
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
    palette: ["#800505", "#491D04", "#435911", "#0B5959", "#9C7003", "#154604", "#321808", "#9B2100", "#814D0A", "#331A01", "#3F590B", "#6A2500"],
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
        { hex: "#721313", name: "Dark Burgundy" },
        { hex: "#962405", name: "Deep Rust" },
        { hex: "#60280A", name: "Dark Sienna" },
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
        { hex: "#411F0C", name: "Deep Warm" },
        { hex: "#5F391B", name: "Rich Bronze" },
      ],
    },
    nails: [
      { hex: "#721313", name: "Dark Burgundy" },
      { hex: "#3E4E1C", name: "Dark Olive" },
      { hex: "#956D0A", name: "Dark Gold" },
      { hex: "#2D1A07", name: "Espresso" },
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
    palette: ["#1A1A1A", "#F5F5F5", "#FF0303", "#0063D5", "#13981A", "#FF085C", "#7000B5", "#00695C", "#C10055", "#B0E6FF", "#0044AE", "#DA0056"],
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
        { hex: "#E12121", name: "True Red" },
        { hex: "#D10958", name: "Fuchsia" },
        { hex: "#BA0755", name: "Bright Magenta" },
      ],
      cheek: [
        { hex: "#FB0C5D", name: "Cool Pink" },
        { hex: "#FC568E", name: "Rose" },
        { hex: "#FB3175", name: "Deep Rose" },
      ],
      eyes: [
        { hex: "#1A1A1A", name: "Black" },
        { hex: "#0664CF", name: "Royal Blue" },
        { hex: "#6D10A5", name: "Deep Purple" },
      ],
      base: [
        { hex: "#F5F5F5", name: "Porcelain" },
        { hex: "#ECEFF1", name: "Cool White" },
      ],
    },
    nails: [
      { hex: "#E12121", name: "True Red" },
      { hex: "#1A1A1A", name: "Black" },
      { hex: "#D10958", name: "Fuchsia" },
      { hex: "#0664CF", name: "Royal Blue" },
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
    palette: ["#001457", "#56005C", "#01331A", "#530116", "#1E1E46", "#004444", "#2A0153", "#121232", "#440017", "#013301", "#0E2A46", "#1B0909"],
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
        { hex: "#500417", name: "Deep Burgundy" },
        { hex: "#3E0619", name: "Dark Wine" },
        { hex: "#4F0854", name: "Dark Plum" },
      ],
      cheek: [
        { hex: "#D10958", name: "Deep Rose" },
        { hex: "#BA0755", name: "Cool Berry" },
        { hex: "#930350", name: "Dark Rose" },
      ],
      eyes: [
        { hex: "#19192B", name: "Midnight" },
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
      { hex: "#08184F", name: "Deep Navy" },
      { hex: "#500417", name: "Deep Burgundy" },
      { hex: "#19192B", name: "Midnight" },
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
    palette: ["#FFFFFF", "#000000", "#FF3A2B", "#1598FF", "#FF085C", "#B601D6", "#26D52D", "#E33CFF", "#00BCD4", "#FFEB3B", "#0063D5", "#FF5722"],
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
        { hex: "#FF3A2B", name: "Bright Red" },
        { hex: "#FB0C5D", name: "Hot Pink" },
        { hex: "#E33CFF", name: "Fuchsia" },
      ],
      cheek: [
        { hex: "#FB0C5D", name: "Hot Pink" },
        { hex: "#FC568E", name: "Bright Rose" },
        { hex: "#FF4081", name: "Electric Pink" },
      ],
      eyes: [
        { hex: "#000000", name: "Black" },
        { hex: "#1597FF", name: "Electric Blue" },
        { hex: "#A41BBC", name: "Bright Purple" },
      ],
      base: [
        { hex: "#FFFFFF", name: "Pure White" },
        { hex: "#F5F5F5", name: "Porcelain" },
      ],
    },
    nails: [
      { hex: "#FF3A2B", name: "Bright Red" },
      { hex: "#000000", name: "Black" },
      { hex: "#E33CFF", name: "Fuchsia" },
      { hex: "#1597FF", name: "Electric Blue" },
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
  const key = subSeason.trim().toLowerCase();
  return byName.get(key) ?? byId.get(key);
}
