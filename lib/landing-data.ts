export type Season = {
  id: string;
  name: string;
  bg: string;
  color: string;
  cbg: string;
  cac: string;
  palette: string[];
  temps: string[];
  lead: string;
  why: string;
  photoBg: string;
};

export const SEASONS: Season[] = [
  {
    id: "spring",
    name: "Spring",
    bg: "#FDF4E8",
    color: "#3D2A1E",
    cbg: "#FDF4E8",
    cac: "#E8A87C",
    palette: ["#F9E4C8", "#FFDAB9", "#98D8C8", "#F7DC6F", "#F8B4C4", "#C5E99B", "#FFE4B5", "#87CEEB"],
    temps: ["warm", "light", "clear"],
    lead: "Golden warmth with peachy glow — fresh, lively, never muted.",
    why: "Springs have warm undertones with clear, bright coloring. Coral and mint feel native to your skin.",
    photoBg: "linear-gradient(160deg,#f9dcc8,#f5c4a0)",
  },
  {
    id: "summer",
    name: "Summer",
    bg: "#F0EEF5",
    color: "#2A2533",
    cbg: "#F0EEF5",
    cac: "#9B8EC4",
    palette: ["#D4C5E2", "#B8A9C9", "#A8D8EA", "#C9B6E4", "#E8B4B8", "#9DB4C0", "#D5C6E0", "#B5C7D3"],
    temps: ["cool", "light", "soft"],
    lead: "Soft rose and lavender — elegant, understated, effortlessly refined.",
    why: "Summers have cool undertones with low contrast. Dusty pinks and soft blues harmonize beautifully.",
    photoBg: "linear-gradient(160deg,#d4c5e2,#b8a9c9)",
  },
  {
    id: "autumn",
    name: "Autumn",
    bg: "#F5EDE0",
    color: "#2E1F14",
    cbg: "#F5EDE0",
    cac: "#C4783A",
    palette: ["#D4A574", "#8B6914", "#CD853F", "#B8860B", "#A0522D", "#6B8E23", "#D2691E", "#BC8F8F"],
    temps: ["warm", "deep", "rich"],
    lead: "Terracotta and olive — earthy depth, grounded, richly saturated.",
    why: "Autumns have warm undertones with rich, deep coloring. Rust, camel, and forest green are your power colors.",
    photoBg: "linear-gradient(160deg,#d4a574,#a0522d)",
  },
  {
    id: "winter",
    name: "Winter",
    bg: "#E8E4ED",
    color: "#1A1520",
    cbg: "#E8E4ED",
    cac: "#6B5B95",
    palette: ["#2C2C54", "#6B5B95", "#C9184A", "#FFFFFF", "#1B1B2F", "#E8E4ED", "#0F3460", "#FF6B9D"],
    temps: ["cool", "deep", "clear"],
    lead: "Icy contrast with bold jewel tones — striking, crisp, unapologetic.",
    why: "Winters have cool undertones with high contrast. True black, white, and vivid jewel tones make you glow.",
    photoBg: "linear-gradient(160deg,#2c2c54,#6b5b95)",
  },
];

export const PRODUCTS = [
  { name: "V-Neck Maxi Slip Dress", brand: "ASOS DESIGN", price: "€33", match: 96, image: "/images/product-1.jpg", url: "https://www.asos.com/asos-design/asos-design-v-neck-maxi-slip-dress-in-green-laundered-stripe/prd/211084660", swatches: ["#4A7C59", "#6B9E7A", "#2D5A3D"] },
  { name: "Knitted One Shoulder Top", brand: "Topshop", price: "€32", match: 91, image: "/images/product-2.jpg", url: "https://www.asos.com/topshop/topshop-knitted-asymmetric-one-shoulder-colour-pop-top-in-multi/prd/210944116", swatches: ["#E85D04", "#9B2335", "#2D6A8F"] },
  { name: "Cami Top with Lace Hem", brand: "ASOS DESIGN", price: "€30", match: 93, image: "/images/product-3.jpg", url: "https://www.asos.com/asos-design/asos-design-cami-top-with-lace-hem-in-chocolate-polka-dot/prd/211167554", swatches: ["#5C3A1E", "#8B5E3C", "#3B2110"] },
];

export type SeasonProduct = {
  name: string;
  brand: string;
  price: string;
  image: string;
  hex: string;
  match: number;
};

export const SEASON_PRODUCTS: Record<string, SeasonProduct[]> = {
  spring: [
    { name: "Coral Silk Blouse", brand: "COS", price: "$89", hex: "#F4936A", match: 97, image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=85&fit=crop" },
    { name: "Warm Peach Dress", brand: "& Other Stories", price: "$120", hex: "#FFDAB9", match: 94, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85&fit=crop" },
    { name: "Golden Linen Jacket", brand: "Arket", price: "$145", hex: "#F9E4C8", match: 91, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=85&fit=crop" },
    { name: "Mint Ribbed Knit", brand: "Mango", price: "$65", hex: "#98D8C8", match: 88, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=85&fit=crop" },
  ],
  summer: [
    { name: "Dusty Rose Blouse", brand: "COS", price: "$89", hex: "#E8B4B8", match: 97, image: "https://images.unsplash.com/photo-1483986769511-7bcc11e66f7d?w=500&q=85&fit=crop" },
    { name: "Lavender Midi Dress", brand: "& Other Stories", price: "$120", hex: "#D4C5E2", match: 95, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85&fit=crop" },
    { name: "Soft Blue Trousers", brand: "Arket", price: "$98", hex: "#A8D8EA", match: 91, image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=85&fit=crop" },
    { name: "Mauve Cashmere", brand: "Uniqlo U", price: "$79", hex: "#B8A9C9", match: 89, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=85&fit=crop" },
  ],
  autumn: [
    { name: "Terracotta Blouse", brand: "Zara", price: "$59", hex: "#D2691E", match: 97, image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=85&fit=crop" },
    { name: "Camel Wool Coat", brand: "Arket", price: "$240", hex: "#D4A574", match: 95, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=85&fit=crop" },
    { name: "Rust Ribbed Knit", brand: "COS", price: "$89", hex: "#A0522D", match: 92, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=85&fit=crop" },
    { name: "Olive Linen Dress", brand: "H&M Studio", price: "$79", hex: "#6B8E23", match: 88, image: "https://images.unsplash.com/photo-1483986769511-7bcc11e66f7d?w=500&q=85&fit=crop" },
  ],
  winter: [
    { name: "Classic Black Blazer", brand: "Totême", price: "$380", hex: "#1B1B2F", match: 98, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=85&fit=crop" },
    { name: "Cobalt Silk Dress", brand: "Staud", price: "$245", hex: "#0F3460", match: 96, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85&fit=crop" },
    { name: "Crisp White Shirt", brand: "COS", price: "$89", hex: "#FFFFFF", match: 93, image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=85&fit=crop" },
    { name: "Ruby Knit Top", brand: "Arket", price: "$119", hex: "#C9184A", match: 90, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=85&fit=crop" },
  ],
};

export const REVIEWS = [
  {
    role: "True Autumn",
    photo: "/images/review-autumn.jpg",
    desc: "Warm, rich, earthy tones. Terracotta, olive, camel, burnt orange.",
  },
  {
    role: "True Spring",
    photo: "/images/review-spring.jpg",
    desc: "Fresh, warm, clear tones. Coral, peach, warm pink, golden yellow.",
  },
  {
    role: "Soft Summer",
    photo: "/images/review-summer.jpg",
    desc: "Cool, muted, dusty tones. Lavender, dusty rose, soft teal, mauve.",
  },
];

export const SOCIAL_PROOF = [
  {
    name: "Maya K.",
    seasonId: "summer",
    subSeason: "Soft Summer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=85&fit=crop&crop=face",
    quote: "One selfie and I finally understood why certain colors made me look tired. Dusty blues and muted roses — I've been buying the wrong things my whole life.",
  },
  {
    name: "Sofia R.",
    seasonId: "spring",
    subSeason: "Bright Spring",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=85&fit=crop&crop=face",
    quote: "Corals and warm peaches. Two words that changed my entire wardrobe — and I found them in 60 seconds. Scary accurate.",
  },
  {
    name: "Layla M.",
    seasonId: "autumn",
    subSeason: "True Autumn",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=85&fit=crop&crop=face",
    quote: "Terracotta and rust — turns out I've had my power colors my whole life. I just didn't know it until now.",
  },
] as const;

export const FAQS = [
  { q: "How does the AI color analysis work?", a: "Our AI reads your skin undertone, hair depth, and eye contrast from a clear selfie — then maps you to a seasonal type with 8 core colors and curated shop picks." },
  { q: "What kind of photo should I upload?", a: "A clear, front-facing selfie in natural daylight with no filters. Plain backgrounds work best." },
  { q: "Is my photo stored or shared?", a: "Your selfie is processed securely and deleted after analysis. We never sell or share your images." },
  { q: "Can I shop colors that suit me?", a: "Yes — after analysis, PaletteMe surfaces marketplace items scored against your personal palette." },
  { q: "How is this different from the quiz?", a: "The quiz is a fun starting point. The selfie upload uses computer vision on your actual coloring for precise results." },
];

export const QUIZ_QUESTIONS = [
  {
    q: "Which metal looks best on your skin?",
    options: [
      { label: "Gold", swatch: "#D4A574", score: { spring: 2, autumn: 2 } },
      { label: "Silver", swatch: "#C0C0C0", score: { summer: 2, winter: 2 } },
      { label: "Rose gold", swatch: "#E8B4B8", score: { spring: 1, summer: 1 } },
      { label: "Both equally", swatch: "#B8A9A0", score: { spring: 1, summer: 1, autumn: 1, winter: 1 } },
    ],
  },
  {
    q: "How does pure white look on you?",
    options: [
      { label: "Amazing — crisp & bright", swatch: "#FFFFFF", score: { winter: 2, spring: 1 } },
      { label: "Too harsh — prefer cream", swatch: "#FBF1E4", score: { autumn: 2, summer: 1 } },
      { label: "Okay but soft white is better", swatch: "#F5F0EB", score: { summer: 2, spring: 1 } },
      { label: "Never wear white", swatch: "#E8E4ED", score: { autumn: 1, winter: 1 } },
    ],
  },
  {
    q: "Your natural hair color is closest to:",
    options: [
      { label: "Golden blonde / strawberry", swatch: "#E8C872", score: { spring: 2 } },
      { label: "Ash brown / cool blonde", swatch: "#A89F91", score: { summer: 2, winter: 1 } },
      { label: "Auburn / warm brown", swatch: "#8B4513", score: { autumn: 2, spring: 1 } },
      { label: "Dark brown / black", swatch: "#2C1810", score: { winter: 2, autumn: 1 } },
    ],
  },
];
