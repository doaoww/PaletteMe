/**
 * Replace each path with your own image dropped into public/images/
 * Supported formats: .jpg .jpeg .png .webp
 *
 * TODO(asset-replace): Most current landing photos are women-only stock.
 * Replace with gender-inclusive portraits and outfit examples (menswear,
 * womenswear, unisex) before public launch.
 *
 * WHERE EACH IMAGE APPEARS:
 *
 * selfie          → "how it works" step 1 · feature demo (analyzing screen)
 * selfie-alt      → "how it works" step 2 (AI reading coloring)
 * portrait-man    → seasons carousel (was a male portrait)
 * outfit-wrong    → before/after "wrong colors" side
 * outfit-right    → before/after "your colors" side · seasons neutral mini
 * fashion-1       → feature demos · seasons spring accent
 * fashion-2       → seasons autumn main · "how it works" step 3 picks
 * fashion-3       → seasons summer neutral mini
 * fashion-4       → seasons summer accent mini
 * wardrobe        → seasons autumn neutral mini
 * mirror          → seasons winter neutral mini
 * outfit-suits    → style match feature demo
 * outfit-no-suit  → style match "doesn't suit" side
 * clothing-flat   → outfit scanner feature demo
 * jacket-scan     → jacket scan demo
 * style-match     → style match overlay demo
 * phone-outfit    → phone + outfit demo
 */

export const IMAGES = {
  selfie:        "/images/demo/selfie.jpg",
  selfieAlt:     "/images/demo/selfie-alt.jpg",
  analyzeDemo:   "/images/demo/analyze-demo.jpg",
  portraitMan:   "/images/portrait-man.jpg",
  outfitWrong:   "/images/outfits/outfit-wrong.jpg",
  outfitRight:   "/images/outfits/outfit-right.jpg",
  fashion1:      "/images/fashion-1.jpg",
  fashion2:      "/images/fashion-2.jpg",
  fashion3:      "/images/fashion-3.jpg",
  fashion4:      "/images/fashion-4.jpg",
  wardrobe:      "/images/wardrobe.jpg",
  mirror:        "/images/mirror.jpg",
  outfitSuits:   "/images/outfit-suits.jpg",
  outfitNoSuit:  "/images/outfit-no-suit.jpg",
  clothingFlat:  "/images/clothing-flat.jpg",
  jacketScan:    "/images/jacket-scan.jpg",
  styleMatch:    "/images/style-match.jpg",
  phoneOutfit:   "/images/phone-outfit.jpg",

  // "Selfie in. Palette out." — 3 steps in order
  flow1:         "/images/demo/flow-1.jpg",
  flow2:         "/images/demo/flow-2.jpg",
  flow3:         "/images/demo/flow-3.jpg",

  // Spring
  springOutfit1: "/images/outfits/spring-outfit-1.jpg",
  springOutfit2: "/images/outfits/spring-outfit-2.jpg",
  springPalette: "/images/seasons/spring-palette.jpg",
  reviewSpring:  "/images/seasons/review-spring.jpg",
  seasonSpring:  "/images/seasons/season-spring-celeb.jpg",

  // Summer
  summerOutfit1: "/images/outfits/summer-outfit-1.jpg",
  summerOutfit2: "/images/outfits/summer-outfit-2.jpg",
  summerPalette: "/images/seasons/summer-palette.jpg",
  reviewSummer:  "/images/seasons/review-summer.jpg",
  seasonSummer:  "/images/seasons/season-summer-celeb.jpg",

  // Autumn
  autumnOutfit1: "/images/outfits/autumn-outfit-1.jpg",
  autumnOutfit2: "/images/outfits/autumn-outfit-2.jpg",
  autumnPalette: "/images/seasons/autumn-palette.jpg",
  reviewAutumn:  "/images/seasons/review-autumn.jpg",
  seasonAutumn:  "/images/seasons/season-autumn-celeb.jpg",

  // Winter
  winterOutfit1: "/images/outfits/winter-outfit-1.jpg",
  winterOutfit2: "/images/outfits/winter-outfit-2.jpg",
  winterPalette: "/images/seasons/winter-palette.jpg",
  reviewWinter:  "/images/seasons/review-winter.jpg",
  seasonWinter:  "/images/seasons/season-winter-celeb.jpg",
} as const;
