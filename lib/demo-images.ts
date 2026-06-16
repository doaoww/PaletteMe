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
  selfie:        "/images/selfie.jpg",
  selfieAlt:     "/images/selfie-alt.jpg",
  analyzeDemo:   "/images/analyze-demo.jpg",
  portraitMan:   "/images/portrait-man.jpg",
  outfitWrong:   "/images/outfit-wrong.jpg",
  outfitRight:   "/images/outfit-right.jpg",
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
  flow1:         "/images/flow-1.jpg",
  flow2:         "/images/flow-2.jpg",
  flow3:         "/images/flow-3.jpg",

  // Spring
  springOutfit1: "/images/spring-outfit-1.jpg",
  springOutfit2: "/images/spring-outfit-2.jpg",
  springPalette: "/images/spring-palette.jpg",
  reviewSpring:  "/images/review-spring.jpg",
  seasonSpring:  "/images/season-spring-celeb.jpg",

  // Summer
  summerOutfit1: "/images/summer-outfit-1.jpg",
  summerOutfit2: "/images/summer-outfit-2.jpg",
  summerPalette: "/images/summer-palette.jpg",
  reviewSummer:  "/images/review-summer.jpg",
  seasonSummer:  "/images/season-summer-celeb.jpg",

  // Autumn
  autumnOutfit1: "/images/autumn-outfit-1.jpg",
  autumnOutfit2: "/images/autumn-outfit-2.jpg",
  autumnPalette: "/images/autumn-palette.jpg",
  reviewAutumn:  "/images/review-autumn.jpg",
  seasonAutumn:  "/images/season-autumn-celeb.jpg",

  // Winter
  winterOutfit1: "/images/winter-outfit-1.jpg",
  winterOutfit2: "/images/winter-outfit-2.jpg",
  winterPalette: "/images/winter-palette.jpg",
  reviewWinter:  "/images/review-winter.jpg",
  seasonWinter:  "/images/season-winter-celeb.jpg",
} as const;
