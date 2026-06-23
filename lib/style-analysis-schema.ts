import { z } from "zod";
import { KIBBE_TYPES } from "./style-features-schema";

// OpenAI Structured Outputs restrictions:
// - No z.tuple() → use z.array()
// - No .min()/.max() on arrays or numbers → remove constraints, enforce via prompt
// - No .regex() → use plain z.string()
// - All optional fields must be .nullish() (not just .optional())

// ─── Step 3: Body Analysis Output ────────────────────────────────────────────

export const BodyAnalysisSchema = z.object({
  bodyType: z.enum(["hourglass", "rectangle", "triangle", "inverted_triangle", "oval"]),
  shoulderHipRelationship: z.enum(["shoulders wider", "balanced", "hips wider"]),
  waistDefinition: z.enum(["defined", "moderate", "straight"]),
  torsoLength: z.enum(["long", "balanced", "short"]),
  legLength: z.enum(["long", "balanced", "short"]),
  proportionNotes: z.string(),
  confidence: z.number(),
  selfReported: z.boolean(),
});

export type BodyAnalysis = z.infer<typeof BodyAnalysisSchema>;

// ─── Step 4: Style Profile Output ────────────────────────────────────────────

export const StyleProfileSchema = z.object({
  kibbeType: z.enum(KIBBE_TYPES),
  kibbeConfidence: z.number(),
  kibbeReason: z.string(),
  undertone: z.enum(["warm", "cool", "neutral"]),
  colorDepth: z.enum(["light", "medium", "deep"]),
  colorChroma: z.enum(["muted", "balanced", "clear"]),
  colorSeasonFamily: z.string(),
  visualEnergy: z.enum(["romantic", "elegant", "authoritative", "natural", "playful", "dramatic", "classic"]),
  styleAesthetic: z.string(),
  bestLines: z.array(z.string()),
  bestSilhouettes: z.array(z.string()),
  bestFabrics: z.array(z.string()),
  avoidList: z.array(z.string()),
  aestheticRejectionPrinciples: z.array(z.string()),
  aestheticIdentityName: z.string(),
});

export type StyleProfile = z.infer<typeof StyleProfileSchema>;

// ─── Shared sub-schemas (used by both Mini and Full) ─────────────────────────

export const CelebrityTwinSchema = z.object({
  name: z.string(),         // "Jennifer Lopez"
  initials: z.string(),     // "JL"
  sharedQuality: z.string(), // "Bronze glow, earthy palette, gold always"
});

// ─── Step 5a: Mini Result (free) ─────────────────────────────────────────────

export const MiniResultSchema = z.object({
  kibbeType: z.enum(KIBBE_TYPES),

  // Consumer-facing label — plain style language, NO Kibbe terminology
  // e.g. "Soft & Fluid Lines", "Bold & Elongated", "Natural Ease", "Balanced Precision"
  styleReadLabel: z.string(),

  // One sentence in plain language describing how this person reads visually
  // e.g. "You read as soft, naturally fluid, with gently rounded features."
  styleEssence: z.string(),

  kibbeOneLiner: z.string(),
  strengths: z.array(z.string()),
  mistakes: z.array(z.string()),
  howPeopleReadYou: z.string(),
  hairHint: z.string(),
  colorFamily: z.string(),
  silhouettes: z.array(z.string()),

  // New reveal fields
  contrastLevel: z.enum(["low", "medium-low", "medium", "medium-high", "high"]).nullish(),
  metalPrimary: z.enum(["gold", "silver", "rose gold", "both"]).nullish(),
  seasonTagline: z.string().nullish(), // "Warm undertones · Medium contrast · Muted earthy palette"
  celebrityTwins: z.array(CelebrityTwinSchema).nullish(),
});

export type MiniResult = z.infer<typeof MiniResultSchema>;

// ─── Step 5b: Full Report (paid) — 9 sections ────────────────────────────────

// Section 1: Appearance
const AppearanceSectionSchema = z.object({
  kibbeExplanation: z.string(),
  kibbeReferences: z.array(z.string()),
  howOthersReadYou: z.string(),
  appearanceStrengths: z.array(z.string()),
});

// Section 2: Hair
const HairRecommendationSchema = z.object({
  bestLength: z.string(),
  bestShape: z.string(),
  bestTexture: z.string(),
  avoidCuts: z.array(z.string()),
  colorDirection: z.string(),
  // 3 search queries — enforced via prompt
  referenceSearchQueries: z.array(z.string()),
  rationale: z.string(),
});

// Section 3: Color Palette
const PaletteColorSchema = z.object({
  name: z.string(),
  hex: z.string(), // "#RRGGBB" — format enforced via prompt
  use: z.enum(["clothing", "makeup", "accessories", "all"]),
  wearability: z.enum(["everyday", "regular", "accent"]),
  nearFace: z.boolean(),
  note: z.string().nullish(),
});

const ColorSectionSchema = z.object({
  seasonName: z.string(),
  seasonDescription: z.string(),
  paletteStory: z.string(),
  // 10-20 colors — count enforced via prompt
  palette: z.array(PaletteColorSchema),
  anchorNeutral: z.string(),
  heroAccent: z.string(),
  avoidColors: z.array(z.object({
    name: z.string(),
    hex: z.string(),
    reason: z.string(),
  })),
  combinationExample: z.string(),
  metalDirection: z.object({
    primary: z.enum(["gold", "silver", "rose gold", "both"]),
    avoid: z.string(),
    note: z.string(),
    searchQuery: z.string(),
  }),
});

// Section 4: Body & Silhouette
const BodySectionSchema = z.object({
  bodyTypeLabel: z.string(),
  bodyStrengths: z.array(z.string()),
  bestSilhouettes: z.array(z.object({
    name: z.string(),
    why: z.string(),
    searchQuery: z.string(),
  })),
  avoidSilhouettes: z.array(z.object({
    name: z.string(),
    why: z.string(),
  })),
  fittingTips: z.array(z.string()),
});

// Section 5: Style Direction
const StyleDirectionSectionSchema = z.object({
  aesthetic: z.string(),
  aestheticDescription: z.string(),
  // 3 search queries — count enforced via prompt
  moodboardSearchQueries: z.array(z.string()),
  keyWords: z.array(z.string()),
  whatToLeadWith: z.string(),
  trendsThatWork: z.array(z.string()),
  trendsToAvoid: z.array(z.string()),
  styleReferencePersonalities: z.array(z.string()),
});

// Section 6: Clothing
const ClothingItemSchema = z.object({
  category: z.string(),
  name: z.string(),
  description: z.string(),
  searchQuery: z.string(),
  priceRange: z.string(),
  why: z.string(),
  appearsUnlocks: z.string(),
  pairsWith: z.array(z.number()),
});

const ClothingSectionSchema = z.object({
  items: z.array(ClothingItemSchema),
  anchorPiece: z.string(),
  capsuleRules: z.array(z.string()),
  buildingBlockPieces: z.array(z.string()),
  fabricManifesto: z.string(),
});

// Section 7: Makeup / Grooming
const MakeupProductSchema = z.object({
  category: z.string(),
  name: z.string(),
  formulationType: z.string(),
  bestFor: z.string(),
  compositionNote: z.string(),
  searchQuery: z.string(),
  ranking: z.enum(["best", "alternative", "budget"]),
  colorNote: z.string(),
  shadeHex: z.string().nullish(),
});

const MakeupShadeGuideSchema = z.object({
  foundation: z.string(),
  blush: z.string(),
  bronzer: z.string(),
  eyeShadow: z.string(),
  liner: z.string(),
  lip: z.string(),
  highlight: z.string(),
  avoid: z.string(),
});

const MakeupSectionSchema = z.object({
  sectionType: z.enum(["makeup", "grooming"]),
  skinPrep: z.string(),
  shadeGuide: MakeupShadeGuideSchema,
  colorStory: z.string(),
  products: z.array(MakeupProductSchema),
  avoidShades: z.array(z.string()),
  signatureLook: z.string(),
});

// Section 8: Style Mistakes → Replacements
const StyleMistakeSchema = z.object({
  item: z.string(),
  why: z.string(),
  replaceWith: z.string(),
  replacementSearchQuery: z.string(),
});

const StyleMistakesSectionSchema = z.object({
  replaceThese: z.array(StyleMistakeSchema),
  shoppingMistakes: z.string(),
  mindsetShift: z.string(),
});

// Section 9: Ready Outfits
const OutfitItemSchema = z.object({
  piece: z.string(),
  searchQuery: z.string(),
  colorHex: z.string().nullish(),   // hex from user's palette, e.g. "#C4956A"
  fabric: z.string().nullish(),      // e.g. "heavy cotton", "nylon ripstop"
});

const OutfitSchema = z.object({
  name: z.string(),
  occasion: z.enum(["work", "date", "everyday", "going out", "travel", "content/photos", "casual weekend"]),
  items: z.array(OutfitItemSchema),
  why: z.string(),
  colorLogic: z.string(),
  lookEffect: z.string(),
  heroPiece: z.string(),
  searchQuery: z.string(),
  stylistNote: z.string().nullish(),  // why this outfit works for their specific type+DNA
  pinterestQuery: z.string().describe(
    'Pinterest search query for the outfit mood image. Format: "{aesthetic} {occasion} outfit {main color} editorial". Example: "old money everyday outfit cream ivory editorial women"'
  ),
});

const OutfitsSectionSchema = z.object({
  outfits: z.array(OutfitSchema),
  buildingPrinciple: z.string(),
});

// Section 10: Shopping List
const ShoppingPrioritySchema = z.object({
  item: z.string(),
  searchQuery: z.string(),
  priceRange: z.string(),
  impact: z.string(),
  whyNow: z.string(),
});

const ShoppingListSectionSchema = z.object({
  buyFirst: z.array(ShoppingPrioritySchema),
  dontSpendHere: z.array(z.object({
    category: z.string(),
    reason: z.string(),
  })),
  totalEstimate: z.string(),
});

// ─── New premium chapter schemas ──────────────────────────────────────────────

const ContrastAnalysisSchema = z.object({
  score: z.number(),        // 1.0–10.0
  level: z.enum(["low", "medium-low", "medium", "medium-high", "high"]),
  lowerContrastSeason: z.string(),   // "Soft Summer"
  higherContrastSeason: z.string(),  // "True Winter"
  worksFor: z.array(z.string()),
  avoid: z.array(z.string()),
  explanation: z.string(),
});

const KibbeChapterSchema = z.object({
  type: z.string(),           // "Soft Natural"
  essenceSummary: z.string(), // "blended mix of Natural and Romantic…"
  boneStructure: z.string(),
  flesh: z.string(),
  facialFeatures: z.string(),
  essence: z.string(),        // "Earthy · sensual · casually luxurious"
  worksFor: z.array(z.string()),
  fightsYou: z.array(z.string()),
  disclaimer: z.string(),     // one-sentence Kibbe explanation for those unfamiliar
});

const BeforeAfterSchema = z.object({
  wrong: z.array(z.object({ item: z.string(), reason: z.string() })),
  right: z.array(z.object({ item: z.string(), reason: z.string() })),
  patternNote: z.string(),   // "Notice the pattern: …"
});

// ─── Full Report ──────────────────────────────────────────────────────────────

export const FullReportSchema = z.object({
  appearance: AppearanceSectionSchema,
  hair: HairRecommendationSchema,
  color: ColorSectionSchema,
  body: BodySectionSchema,
  styleDirection: StyleDirectionSectionSchema,
  clothing: ClothingSectionSchema,
  makeup: MakeupSectionSchema,
  styleMistakes: StyleMistakesSectionSchema,
  outfits: OutfitsSectionSchema,
  shoppingList: ShoppingListSectionSchema,

  // New premium chapters — nullish so old cached reports still render
  contrastAnalysis: ContrastAnalysisSchema.nullish(),
  kibbeChapter: KibbeChapterSchema.nullish(),
  celebrityTwins: z.array(CelebrityTwinSchema).nullish(),
  beforeAfter: BeforeAfterSchema.nullish(),
  styleRules: z.array(z.string()).nullish(),
});

export type FullReport = z.infer<typeof FullReportSchema>;

// ─── Combined Output ──────────────────────────────────────────────────────────

export const StyleAnalysisOutputSchema = z.object({
  miniResult: MiniResultSchema,
  fullReport: FullReportSchema,
});

export type StyleAnalysisOutput = z.infer<typeof StyleAnalysisOutputSchema>;

// ─── Subscription Schemas ─────────────────────────────────────────────────────

export const WardrobeItemScanSchema = z.object({
  verdict: z.enum(["keep", "restyle", "remove"]),
  reason: z.string(),
  howToWear: z.string().nullish(),
  stylingRule: z.string().nullish(),
  alternatives: z.array(z.object({
    name: z.string(),
    searchQuery: z.string(),
    why: z.string(),
  })).nullish(),
});

export type WardrobeItemScan = z.infer<typeof WardrobeItemScanSchema>;

export const OutfitBuilderSchema = z.object({
  outfits: z.array(OutfitSchema),
  gapAnalysis: z.object({
    redundantItems: z.array(z.string()),
    keyPurchases: z.array(z.object({
      item: z.string(),
      searchQuery: z.string(),
      outfitsUnlocked: z.number(),
    })),
  }),
});

export type OutfitBuilder = z.infer<typeof OutfitBuilderSchema>;

export const EventOutfitSchema = z.object({
  top: OutfitItemSchema,
  bottom: OutfitItemSchema,
  shoes: OutfitItemSchema,
  keyAccessory: OutfitItemSchema,
  outerLayer: OutfitItemSchema.nullish(),
  why: z.string(),
  avoid: z.string(),
  groomingNote: z.string(),
});

export type EventOutfit = z.infer<typeof EventOutfitSchema>;

export const MonthlyRefreshSchema = z.object({
  seasonBrief: z.string(),
  newOutfits: z.array(OutfitSchema),
  shoppingPicks: z.array(z.object({
    item: z.string(),
    searchQuery: z.string(),
    seasonalNote: z.string(),
  })),
  trendVerdicts: z.array(z.object({
    trend: z.string(),
    verdict: z.enum(["works", "doesnt work", "works with modification"]),
    reason: z.string(),
    modification: z.string().nullish(),
  })),
});

export type MonthlyRefresh = z.infer<typeof MonthlyRefreshSchema>;
