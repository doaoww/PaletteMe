import type { AnalysisResult } from "./report-schema";

export const MOCK_ANALYSIS: AnalysisResult = {
  miniResult: {
    seasonName: "Dark Autumn",
    tagline: "Warm · Deep · Muted",
    headline: "You are a Dark Autumn",
    summary: "Your coloring is rare — deep, warm, and earthy in a way that most people can't pull off. Your features share a unified warmth that creates a striking, grounded presence. The richness of your natural tones means you carry colour that would overwhelm almost anyone else.",
    imagePrompt: "",
    imageUrl: null,
  },
  fullReport: {
    contrast: {
      level: "medium-high",
      explanation: "There is a clear but not extreme difference between your skin, hair and eyes. Your dark hair creates visible contrast against your warm skin, while your eyes add another layer of depth. This medium-high contrast means you look best in colour combinations that have clear definition — not too similar, not too extreme.",
    },
    colorAnalysis: {
      topSeason: {
        id: "dark-autumn",
        name: "Dark Autumn",
        percentage: 84,
        reason: "Your warm golden-olive skin tone, dark chocolate hair and amber-brown eyes all share the same warm, earthy temperature. Combined with your natural depth and slightly muted clarity, every feature points toward Dark Autumn. This is one of the most cohesive, striking colour profiles.",
      },
      alternativeSeasons: [
        {
          id: "true-autumn",
          name: "True Autumn",
          percentage: 9,
          reason: "Similar warmth and muted quality, but your depth pushes you past True Autumn's medium range into darker territory.",
        },
        {
          id: "dark-winter",
          name: "Dark Winter",
          percentage: 5,
          reason: "You share the depth, but your undertone is clearly warm rather than the cool neutrality of Dark Winter.",
        },
        {
          id: "soft-autumn",
          name: "Soft Autumn",
          percentage: 2,
          reason: "Same warm family, but Soft Autumn is noticeably lighter and softer than your naturally deep coloring.",
        },
      ],
      bestColors: [
        { hex: "#8B4513", name: "Burnt Sienna", isBest: true },
        { hex: "#C4843A", name: "Warm Amber", isBest: true },
        { hex: "#6B4C3B", name: "Deep Mocha", isBest: true },
        { hex: "#A0522D", name: "Terracotta", isBest: true },
        { hex: "#6B7C45", name: "Olive Green", isBest: true },
        { hex: "#556B2F", name: "Dark Olive", isBest: false },
        { hex: "#8B7355", name: "Warm Khaki", isBest: false },
        { hex: "#CD853F", name: "Warm Caramel", isBest: false },
        { hex: "#704214", name: "Rich Sepia", isBest: false },
        { hex: "#9B7653", name: "Warm Tan", isBest: false },
        { hex: "#5C4033", name: "Dark Walnut", isBest: false },
        { hex: "#B8860B", name: "Antique Gold", isBest: false },
      ],
      neutralDrapingPrompt: "",
      avoidColors: [
        { hex: "#000080", name: "Navy Blue", explanation: "Too cool and stark — navy pulls all the warmth out of your skin and makes you look drained." },
        { hex: "#FF69B4", name: "Hot Pink", explanation: "Cool, bright pink clashes with your warm undertone and creates an unnatural contrast against your skin." },
        { hex: "#808080", name: "Cool Grey", explanation: "Pure grey has no warmth — it sits flat against your features and makes your complexion look ashy." },
        { hex: "#E0E0E0", name: "Cool White", explanation: "Bright white is too high-contrast and pulls cool — cream and ivory are your whites." },
        { hex: "#800080", name: "Purple", explanation: "Cool violet base fights your warm undertone and makes dark circles more visible." },
      ],
    },
    colorDiagnostics: {
      families: [
        { id: "warm",   comment: "Your undertone is unmistakably warm — golden, olive and amber run through your skin, hair and eyes.", isWinner: true },
        { id: "deep",   comment: "Your natural depth is one of your biggest assets. You carry dark, rich tones effortlessly.", isWinner: true },
        { id: "muted",  comment: "Your colouring has a soft, earthy quality rather than sharp brightness — this gives you a sophisticated, natural look.", isWinner: true },
        { id: "cool",   comment: "Cool tones work against your warmth, pulling the colour from your skin and making you look washed out.", isWinner: false },
        { id: "bright", comment: "High-chroma brights compete with your naturally muted palette and can overwhelm your features.", isWinner: false },
        { id: "light",  comment: "Very light tones lose themselves against your natural depth and create no definition.", isWinner: false },
      ],
      neutrals: [
        { hex: "#C4A882", name: "Warm Camel",    comment: "Your most versatile neutral — warm enough to blend with your skin, deep enough to ground an outfit.", verdict: "best" },
        { hex: "#8B7355", name: "Khaki Brown",   comment: "A reliable base that echoes the warmth in your hair and eyes.", verdict: "best" },
        { hex: "#5C4033", name: "Dark Walnut",   comment: "Your dark neutral — use instead of black. Grounds your look without the harshness.", verdict: "best" },
        { hex: "#D4C5A9", name: "Warm Ivory",    comment: "Your version of white. Much softer than pure white and doesn't fight your warm skin.", verdict: "okay" },
        { hex: "#A0998A", name: "Warm Greige",   comment: "A medium neutral that works in layering but won't be your most impactful choice.", verdict: "okay" },
        { hex: "#808080", name: "Cool Grey",     comment: "Avoid — no warmth, makes your skin look ashy.", verdict: "avoid" },
        { hex: "#000000", name: "Pure Black",    comment: "Too stark against your warm features. Dark Walnut does the same job without the harshness.", verdict: "avoid" },
      ],
      makeup: {
        blush: [
          { hex: "#C4843A", name: "Warm Peach Copper", explanation: "Adds a sun-kissed warmth that blends naturally into your skin." },
          { hex: "#A0522D", name: "Terracotta",         explanation: "A deeper, earthy option for evenings — feels like your skin but richer." },
        ],
        lips: [
          { hex: "#A0522D", name: "Burnt Sienna",   explanation: "Echoes your natural lip warmth and anchors the whole look." },
          { hex: "#8B2500", name: "Deep Brick Red", explanation: "A bold but wearable dark lip — warm-based so it works with your depth." },
        ],
        eyeshadowDay: [
          { hex: "#8B7355", name: "Bronze Taupe", explanation: "A neutral warm shadow that defines eyes without looking obvious." },
          { hex: "#B8860B", name: "Antique Gold", explanation: "Brings out the amber in your eyes beautifully in natural light." },
        ],
        eyeshadowEvening: [
          { hex: "#5C4033", name: "Dark Walnut",  explanation: "Smoke your eyes with warm brown instead of black for a deeper, sexier look." },
          { hex: "#704214", name: "Rich Sepia",   explanation: "Adds warmth and intensity — pairs perfectly with a brick lip." },
        ],
      },
    },
    makeupComparisons: [
      {
        category: "lips",
        categoryLabel: "Lip colour",
        goodShade: {
          hex: "#A0522D",
          name: "Burnt Sienna",
          imagePrompt: "",
        },
        badShade: {
          hex: "#FF69B4",
          name: "Hot Pink",
          imagePrompt: "",
        },
        explanation: "Warm terracotta and brick reds echo your natural lip tone and blend with your season's earthy warmth. Cool pink or fuchsia shades fight your undertone and make your skin look sallow.",
      },
      {
        category: "blush",
        categoryLabel: "Blush",
        goodShade: {
          hex: "#C4843A",
          name: "Warm Peach Copper",
          imagePrompt: "",
        },
        badShade: {
          hex: "#FF9999",
          name: "Baby Pink",
          imagePrompt: "",
        },
        explanation: "A warm peach-copper blush with golden undertones adds life to your skin. Cool baby pinks and mauves sit on top of your skin without blending in, making the colour look artificial.",
      },
      {
        category: "eyeshadow",
        categoryLabel: "Eyeshadow",
        goodShade: {
          hex: "#8B7355",
          name: "Bronze Taupe",
          imagePrompt: "",
        },
        badShade: {
          hex: "#9370DB",
          name: "Cool Lavender",
          imagePrompt: "",
        },
        explanation: "Bronze, copper, warm taupe and olive shadows intensify your eyes by working with their natural warmth. Cool greys, silvers and purple-based shadows create an artificial, disconnected look on warm eyes.",
      },
    ],
    hairOptions: [
      {
        name: "Rich Espresso, soft layers",
        color: "Rich Espresso",
        style: "Soft layers with gentle face-framing, slight wave",
        description: "Your current dark brown coloring already suits your season beautifully — the depth and warmth are perfectly matched. These soft layers and a gentle wave will enhance your natural texture and open up your face.",
        imagePrompt: "",
      },
      {
        name: "Warm Chocolate Auburn, curtain bangs",
        color: "Warm Chocolate Auburn",
        style: "Curtain bangs, mid-length, loose waves",
        description: "Adding warm auburn tones to your base creates a sunlit, dimensional look that amplifies the golden warmth in your skin. Curtain bangs frame your face shape beautifully and add softness.",
        imagePrompt: "",
      },
    ],
    finalLook: {
      description: "When you wear your colours, something shifts — you stop looking like you're trying and start looking like yourself. The warm earthy tones don't compete with your natural coloring, they complete it. Everything comes together: the depth of your hair, the warmth of your skin, the richness of the fabric. This is what dressing for your season actually feels like.",
      outfit: "Deep terracotta midi dress, camel structured coat, ivory silk blouse, dark olive wide-leg trousers",
      jewelry: "Yellow gold and warm bronze tones",
      imagePrompt: "",
    },
  },
};
