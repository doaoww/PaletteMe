/**
 * Replace each path with your own image dropped into public/images/
 * Supported formats: .jpg .jpeg .png .webp
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

  // Seasons carousel — one portrait per season (spring / summer / autumn / winter)
  seasonSpring:  "/images/season-spring.jpg",
  seasonSummer:  "/images/season-summer.jpg",
  seasonAutumn:  "/images/season-autumn.jpg",
  seasonWinter:  "/images/season-winter.jpg",
} as const;
