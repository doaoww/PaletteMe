// Style library — curated, static. AI picks from here, never assembles randomly.
// Small, high-quality set: 44 outfits, 20 fabrics/prints, 20 accessories, 20 nails, 10 aesthetics.

// ── Season profile ────────────────────────────────────────────────────────────

export type SeasonProfile = {
  season: string;
  family: "autumn" | "winter" | "spring" | "summer";
  warmth: "warm" | "cool";
  depth: "deep" | "medium" | "light";
  clarity: "muted" | "soft" | "clear" | "bright";
};

export function deriveProfile(seasonId: string): SeasonProfile {
  const family = (["spring","summer","autumn","winter"] as const).find(f => seasonId.includes(f)) ?? "autumn";
  const warmSeasons = ["true-spring","light-spring","bright-spring","true-autumn","soft-autumn","dark-autumn"];
  const deepSeasons = ["dark-autumn","true-autumn","soft-autumn","dark-winter","true-winter"];
  const mutedSeasons = ["soft-autumn","true-autumn","dark-autumn","soft-summer","true-summer","light-summer"];
  const brightSeasons = ["bright-spring","bright-winter","light-spring","true-winter"];
  return {
    season: seasonId,
    family,
    warmth: warmSeasons.includes(seasonId) ? "warm" : "cool",
    depth: deepSeasons.includes(seasonId) ? "deep" : seasonId.startsWith("light") ? "light" : "medium",
    clarity: mutedSeasons.includes(seasonId) ? "muted" : brightSeasons.includes(seasonId) ? "bright" : "soft",
  };
}

// ── Complete outfits (ready-to-wear, never assembled by AI) ───────────────────

export type Outfit = {
  id: string;
  label: string;
  image: string;
  season: string;
};

const seasons = [
  "dark-autumn","true-autumn","soft-autumn",
  "dark-winter","true-winter","bright-winter",
  "true-spring","light-spring","bright-spring",
  "true-summer","light-summer","soft-summer",
] as const;

export const OUTFITS: Outfit[] = seasons.flatMap(s => [
  { id: `${s}-everyday`, label: "Everyday", image: `/style-library/outfits/${s}-everyday.jpg`, season: s },
  { id: `${s}-chic`,     label: "Chic",     image: `/style-library/outfits/${s}-chic.jpg`,     season: s },
  { id: `${s}-evening`,  label: "Evening",  image: `/style-library/outfits/${s}-evening.jpg`,  season: s },
]);

export function getOutfits(profile: SeasonProfile): Outfit[] {
  return OUTFITS.filter(o => o.season === profile.season);
}

// ── Shared item type + scoring ────────────────────────────────────────────────

export type LibraryItem = {
  id: string;
  name: string;
  image: string;
  sentence: string;
  tags: string[];
  avoid?: boolean;
};

function score(item: LibraryItem, p: SeasonProfile): number {
  let s = 0;
  if (item.tags.includes(p.season))  s += 5;
  if (item.tags.includes(p.family))  s += 3;
  if (item.tags.includes(p.warmth))  s += 2;
  if (item.tags.includes(p.depth))   s += 1;
  if (item.tags.includes(p.clarity)) s += 1;
  return s;
}

export function filterLibrary(
  items: LibraryItem[],
  profile: SeasonProfile,
  opts: { limit?: number; avoidSection?: boolean } = {},
): LibraryItem[] {
  const { limit = 6, avoidSection = false } = opts;
  return items
    .filter(i => (i.avoid ?? false) === avoidSection)
    .map(i => ({ item: i, s: score(i, profile) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ item }) => item);
}

// ── Fabrics ───────────────────────────────────────────────────────────────────

export const FABRICS: LibraryItem[] = [
  { id: "suede",           name: "Suede",           image: "/style-library/fabrics/suede.jpg",           sentence: "Soft matte depth — exactly your surface.",              tags: ["warm","deep","muted","autumn","winter","dark-autumn","true-autumn","soft-autumn","dark-winter"] },
  { id: "linen",           name: "Linen",            image: "/style-library/fabrics/linen.jpg",           sentence: "Natural texture without visual noise.",                 tags: ["warm","light","soft","spring","summer","autumn","soft-autumn","true-spring","soft-summer"] },
  { id: "matte-leather",   name: "Matte Leather",    image: "/style-library/fabrics/matte-leather.jpg",   sentence: "Rich and grounded — matte keeps it earthy.",            tags: ["warm","deep","muted","autumn","winter","dark-autumn","dark-winter","true-autumn"] },
  { id: "brushed-wool",    name: "Brushed Wool",     image: "/style-library/fabrics/brushed-wool.jpg",    sentence: "Texture that reads as depth without adding weight.",    tags: ["warm","deep","muted","autumn","winter","dark-autumn","true-autumn"] },
  { id: "chunky-knit",     name: "Chunky Knit",      image: "/style-library/fabrics/chunky-knit.jpg",     sentence: "Adds warmth without competing with your face.",         tags: ["warm","deep","autumn","dark-autumn","true-autumn","soft-autumn"] },
  { id: "velvet",          name: "Velvet",           image: "/style-library/fabrics/velvet.jpg",           sentence: "Luxury depth — only works if your colouring can carry it. Yours can.", tags: ["deep","muted","autumn","winter","dark-autumn","dark-winter","true-winter"] },
  { id: "cashmere",        name: "Cashmere",         image: "/style-library/fabrics/cashmere.jpg",         sentence: "Soft weight, natural texture, works at any depth.",    tags: ["warm","cool","deep","medium","autumn","winter","spring","summer"] },
  { id: "raw-silk",        name: "Raw Silk",         image: "/style-library/fabrics/raw-silk.jpg",         sentence: "The slub gives it texture — earthy, not shiny.",       tags: ["warm","light","medium","spring","summer","soft-autumn","light-spring","soft-summer"] },
  { id: "denim",           name: "Denim",            image: "/style-library/fabrics/denim.jpg",            sentence: "Dark indigo is a stronger neutral for you than black.", tags: ["warm","cool","deep","medium","light","autumn","winter","spring","summer"] },
  { id: "cotton-jersey",   name: "Cotton Jersey",    image: "/style-library/fabrics/cotton-jersey.jpg",    sentence: "Clean base — works in your neutral tones only.",       tags: ["warm","cool","light","medium","spring","summer","soft-autumn","soft-summer","light-summer"] },
  { id: "satin",           name: "Satin",            image: "/style-library/fabrics/satin.jpg",            sentence: "High shine competes with your matte depth.",           tags: ["muted","warm","deep","autumn","dark-autumn","true-autumn","soft-autumn"], avoid: true },
  { id: "polyester-shine", name: "Shiny Polyester",  image: "/style-library/fabrics/polyester-shine.jpg",  sentence: "Synthetic gloss disconnects from warm earthy tones.",  tags: ["muted","warm","deep","autumn","dark-autumn","true-autumn"], avoid: true },
];

// ── Prints ────────────────────────────────────────────────────────────────────

export const PRINTS: LibraryItem[] = [
  { id: "soft-floral",       name: "Soft Floral",       image: "/style-library/prints/soft-floral.jpg",       sentence: "Low contrast florals keep the focus on your face.",       tags: ["warm","muted","soft","light","autumn","summer","spring","soft-autumn","soft-summer","light-spring","true-spring","light-summer"] },
  { id: "bold-floral",       name: "Bold Floral",       image: "/style-library/prints/bold-floral.jpg",       sentence: "Works when the base colour sits in your palette.",         tags: ["warm","cool","bright","clear","spring","winter","bright-spring","bright-winter","true-winter","true-spring"] },
  { id: "leopard",           name: "Leopard",           image: "/style-library/prints/leopard.jpg",           sentence: "Warm tones make this feel like it was made for you.",      tags: ["warm","deep","muted","autumn","dark-autumn","true-autumn","soft-autumn","dark-winter"] },
  { id: "zebra",             name: "Zebra",             image: "/style-library/prints/zebra.jpg",             sentence: "High contrast — powerful on winter, overwhelming on autumn.", tags: ["cool","deep","clear","winter","dark-winter","true-winter","bright-winter"] },
  { id: "houndstooth",       name: "Houndstooth",       image: "/style-library/prints/houndstooth.jpg",       sentence: "In warm brown tones, not classic black and white.",        tags: ["deep","medium","cool","warm","winter","autumn","dark-winter","true-winter","dark-autumn","true-autumn"] },
  { id: "windowpane-check",  name: "Windowpane Check",  image: "/style-library/prints/windowpane-check.jpg",  sentence: "Subtle enough to read as texture rather than print.",      tags: ["warm","cool","medium","deep","autumn","winter","dark-autumn","true-winter","dark-winter"] },
  { id: "gingham",           name: "Gingham",           image: "/style-library/prints/gingham.jpg",           sentence: "Keep the scale small — large checks add too much contrast.", tags: ["warm","cool","light","medium","spring","summer","true-spring","light-spring","light-summer","soft-summer"] },
  { id: "herringbone",       name: "Herringbone",       image: "/style-library/prints/herringbone.jpg",       sentence: "Directional texture that reads as a neutral — very wearable.", tags: ["warm","cool","deep","medium","muted","autumn","winter","dark-autumn","true-autumn","dark-winter","true-winter"] },
  { id: "fine-stripes",      name: "Fine Stripes",      image: "/style-library/prints/fine-stripes.jpg",      sentence: "Thin stripes in your palette colours add polish without drama.", tags: ["warm","cool","medium","light","spring","summer","autumn","true-spring","soft-summer","soft-autumn","light-summer"] },
  { id: "bold-stripes",      name: "Bold Stripes",      image: "/style-library/prints/bold-stripes.jpg",      sentence: "High contrast bold stripes need a high contrast wearer.",   tags: ["cool","deep","clear","bright","winter","bright-winter","true-winter","dark-winter"] },
  { id: "geometric",         name: "Geometric",         image: "/style-library/prints/geometric.jpg",         sentence: "Cool crisp geometry suits clear winter colouring.",         tags: ["cool","clear","bright","winter","spring","bright-winter","true-winter","bright-spring"] },
  { id: "abstract-organic",  name: "Abstract Organic",  image: "/style-library/prints/abstract-organic.jpg",  sentence: "Fluid irregular shapes feel natural against muted tones.",  tags: ["warm","muted","soft","autumn","summer","dark-autumn","soft-autumn","true-autumn","soft-summer","true-summer"] },
];

// ── Accessories (organised by subcategory) ────────────────────────────────────

export type AccessorySubcategory = "bags" | "shoes" | "earrings" | "necklaces" | "belts" | "watches";
export type AccessoryItem = LibraryItem & { subcategory: AccessorySubcategory };

export const ACCESSORIES: AccessoryItem[] = [
  // bags
  { id: "bag-cognac",    subcategory: "bags",      name: "Cognac Tote",       image: "/style-library/accessories/bags/cognac-tote.jpg",          sentence: "Most versatile bag in your palette.",       tags: ["warm","deep","muted","autumn","dark-autumn","true-autumn","soft-autumn"] },
  { id: "bag-chocolate", subcategory: "bags",      name: "Chocolate Bag",     image: "/style-library/accessories/bags/chocolate-bag.jpg",        sentence: "Rich and warm — never harsh.",               tags: ["warm","deep","muted","autumn","dark-autumn","true-autumn"] },
  { id: "bag-camel",     subcategory: "bags",      name: "Camel Satchel",     image: "/style-library/accessories/bags/camel-satchel.jpg",        sentence: "Looks expensive against your tones.",       tags: ["warm","medium","autumn","spring","dark-autumn","soft-autumn","true-spring"] },
  { id: "bag-olive",     subcategory: "bags",      name: "Olive Bag",         image: "/style-library/accessories/bags/olive-bag.jpg",            sentence: "Colour pop that stays in your palette.",    tags: ["warm","deep","muted","autumn","dark-autumn","soft-autumn"] },
  { id: "bag-black",     subcategory: "bags",      name: "Black Bag",         image: "/style-library/accessories/bags/black-bag.jpg",            sentence: "Accent piece — warm tones in the outfit.",  tags: ["cool","deep","winter","dark-winter","true-winter","bright-winter"] },
  // shoes
  { id: "shoes-brown",   subcategory: "shoes",     name: "Brown Ankle Boots", image: "/style-library/accessories/shoes/brown-boots.jpg",         sentence: "Warm leather grounds every look.",          tags: ["warm","deep","muted","autumn","dark-autumn","true-autumn","soft-autumn"] },
  { id: "shoes-loafers", subcategory: "shoes",     name: "Cognac Loafers",    image: "/style-library/accessories/shoes/cognac-loafers.jpg",      sentence: "Polished and warm — works with any bottom.", tags: ["warm","deep","medium","autumn","dark-autumn","true-autumn","soft-autumn"] },
  { id: "shoes-nude",    subcategory: "shoes",     name: "Warm Nude Heels",   image: "/style-library/accessories/shoes/warm-nude-heels.jpg",     sentence: "Your most flattering neutral heel.",        tags: ["warm","medium","light","autumn","spring","dark-autumn","soft-autumn","true-spring"] },
  { id: "shoes-white",   subcategory: "shoes",     name: "White Sneakers",    image: "/style-library/accessories/shoes/white-sneakers.jpg",      sentence: "Balance with warm tones in the rest of the look.", tags: ["cool","light","spring","summer","winter","light-spring","light-summer","bright-winter"] },
  { id: "shoes-black",   subcategory: "shoes",     name: "Black Heels",       image: "/style-library/accessories/shoes/black-heels.jpg",         sentence: "Evening — soften with warm colours above.", tags: ["cool","deep","winter","summer","dark-winter","true-winter","soft-summer"] },
  // earrings
  { id: "ear-gold-hoop", subcategory: "earrings",  name: "Gold Hoops",        image: "/style-library/accessories/earrings/gold-hoops.jpg",       sentence: "Gold resonates with your undertone — always.", tags: ["warm","autumn","spring","dark-autumn","true-autumn","soft-autumn","true-spring","bright-spring"] },
  { id: "ear-gold-stud", subcategory: "earrings",  name: "Gold Studs",        image: "/style-library/accessories/earrings/gold-studs.jpg",       sentence: "The everyday earring that never fails.",    tags: ["warm","autumn","spring","dark-autumn","true-autumn","soft-autumn","true-spring"] },
  { id: "ear-silv-hoop", subcategory: "earrings",  name: "Silver Hoops",      image: "/style-library/accessories/earrings/silver-hoops.jpg",     sentence: "Your metal — cool and precise.",            tags: ["cool","winter","summer","true-winter","dark-winter","bright-winter","light-summer","soft-summer","true-summer"] },
  { id: "ear-silv-stud", subcategory: "earrings",  name: "Silver Studs",      image: "/style-library/accessories/earrings/silver-studs.jpg",     sentence: "Minimal cool tone for every day.",          tags: ["cool","winter","summer","true-winter","dark-winter","light-summer","soft-summer"] },
  // necklaces
  { id: "neck-gold",     subcategory: "necklaces", name: "Gold Chain",        image: "/style-library/accessories/necklaces/gold-chain.jpg",      sentence: "Delicate gold lifts the whole look.",       tags: ["warm","autumn","spring","dark-autumn","true-autumn","soft-autumn","true-spring","bright-spring"] },
  { id: "neck-silver",   subcategory: "necklaces", name: "Silver Chain",      image: "/style-library/accessories/necklaces/silver-chain.jpg",    sentence: "Clean and precise — ideal for cool seasons.", tags: ["cool","winter","summer","true-winter","dark-winter","light-summer","soft-summer"] },
  { id: "neck-pendant",  subcategory: "necklaces", name: "Gold Pendant",      image: "/style-library/accessories/necklaces/gold-pendant.jpg",    sentence: "A touch of warmth at your neckline.",       tags: ["warm","autumn","spring","dark-autumn","true-autumn","true-spring"] },
  // belts
  { id: "belt-brown",    subcategory: "belts",     name: "Dark Brown Belt",   image: "/style-library/accessories/belts/brown-belt.jpg",          sentence: "Waist definition without harsh contrast.",  tags: ["warm","deep","autumn","dark-autumn","true-autumn","soft-autumn"] },
  { id: "belt-black",    subcategory: "belts",     name: "Black Belt",        image: "/style-library/accessories/belts/black-belt.jpg",          sentence: "Statement accent for dark winter seasons.", tags: ["cool","deep","winter","dark-winter","true-winter"] },
  // watches
  { id: "watch-gold",    subcategory: "watches",   name: "Gold Watch",        image: "/style-library/accessories/watches/gold-watch.jpg",        sentence: "Gold hardware — warm and timeless.",        tags: ["warm","autumn","spring","dark-autumn","true-autumn","soft-autumn","true-spring","bright-spring"] },
  { id: "watch-silver",  subcategory: "watches",   name: "Silver Watch",      image: "/style-library/accessories/watches/silver-watch.jpg",      sentence: "Clean and precise — the cool season watch.", tags: ["cool","winter","summer","true-winter","dark-winter","light-summer","soft-summer"] },
];

// ── Nails ─────────────────────────────────────────────────────────────────────

export const NAILS: LibraryItem[] = [
  { id: "terracotta",    name: "Terracotta",    image: "/style-library/nails/terracotta.jpg",    sentence: "Your most flattering everyday manicure.",            tags: ["warm","deep","muted","autumn","dark-autumn","true-autumn","soft-autumn"] },
  { id: "brick-red",     name: "Brick Red",     image: "/style-library/nails/brick-red.jpg",     sentence: "Rich and elegant — sits perfectly in your palette.", tags: ["warm","deep","autumn","dark-autumn","true-autumn"] },
  { id: "cinnamon",      name: "Cinnamon",      image: "/style-library/nails/cinnamon.jpg",      sentence: "Warm mid-tone that looks made for you.",             tags: ["warm","medium","muted","autumn","dark-autumn","true-autumn","soft-autumn"] },
  { id: "warm-brown",    name: "Warm Brown",    image: "/style-library/nails/warm-brown.jpg",    sentence: "Deep and grounding — autumn at its best.",           tags: ["warm","deep","muted","autumn","dark-autumn","true-autumn"] },
  { id: "olive",         name: "Olive",         image: "/style-library/nails/olive.jpg",         sentence: "Unexpected and completely your season.",             tags: ["warm","deep","muted","autumn","dark-autumn","true-autumn","soft-autumn"] },
  { id: "burnt-orange",  name: "Burnt Orange",  image: "/style-library/nails/burnt-orange.jpg",  sentence: "Bold autumn signature — wears surprisingly well.",   tags: ["warm","deep","autumn","dark-autumn","true-autumn"] },
  { id: "dark-burgundy", name: "Dark Burgundy", image: "/style-library/nails/dark-burgundy.jpg", sentence: "Your deepest evening shade.",                        tags: ["deep","warm","autumn","winter","dark-autumn","dark-winter"] },
  { id: "warm-nude",     name: "Warm Nude",     image: "/style-library/nails/warm-nude.jpg",     sentence: "Your natural nude — warm enough to feel intentional.", tags: ["warm","medium","light","autumn","spring","dark-autumn","soft-autumn","true-spring"] },
  { id: "true-red",      name: "True Red",      image: "/style-library/nails/true-red.jpg",      sentence: "A warm red reads classic and powerful on your skin.", tags: ["warm","deep","medium","autumn","spring","dark-autumn","true-autumn","true-spring"] },
  { id: "forest-green",  name: "Forest Green",  image: "/style-library/nails/forest-green.jpg",  sentence: "Bold but completely within your palette.",           tags: ["warm","deep","muted","autumn","dark-autumn","true-autumn"] },
  { id: "navy-nails",    name: "Navy Blue",      image: "/style-library/nails/navy-nails.jpg",    sentence: "Deep and precise — ideal for cool depth.",           tags: ["cool","deep","winter","summer","dark-winter","true-winter","true-summer"] },
  { id: "cool-red",      name: "Cool Red",       image: "/style-library/nails/cool-red.jpg",      sentence: "Blue-based red reads powerful on cool skin.",        tags: ["cool","deep","winter","dark-winter","true-winter","bright-winter"] },
  { id: "classic-nude",  name: "Classic Nude",   image: "/style-library/nails/classic-nude.jpg",  sentence: "The cleanest neutral for cool colouring.",           tags: ["cool","light","medium","winter","summer","light-summer","true-winter","soft-summer"] },
  { id: "coral",         name: "Coral",          image: "/style-library/nails/coral.jpg",         sentence: "Warm and bright — great for spring months.",         tags: ["warm","bright","clear","spring","bright-spring","true-spring"] },
  { id: "warm-pink",     name: "Warm Pink",      image: "/style-library/nails/warm-pink.jpg",     sentence: "Peachy and warm — spring in a bottle.",              tags: ["warm","light","spring","summer","light-spring","true-spring","soft-summer","light-summer"] },
  // avoid
  { id: "cool-pink",     name: "Cool Pink",      image: "/style-library/nails/cool-pink.jpg",     sentence: "Cool pink reads artificial against warm skin.",      tags: ["warm","autumn","dark-autumn","soft-autumn"], avoid: true },
  { id: "lilac",         name: "Lilac",          image: "/style-library/nails/lilac.jpg",         sentence: "Purple-blue base creates tension with warm tones.",  tags: ["warm","autumn","dark-autumn","true-autumn"], avoid: true },
  { id: "bubblegum",     name: "Bubblegum",      image: "/style-library/nails/bubblegum.jpg",     sentence: "Pulls attention to the polish, not you.",            tags: ["warm","autumn","dark-autumn","true-autumn","soft-autumn"], avoid: true },
];

// ── Style Inspirations (names people actually search) ─────────────────────────

export type Aesthetic = {
  id: string;
  name: string;
  image: string;
  families: ("autumn" | "winter" | "spring" | "summer")[];
};

export const AESTHETICS: Aesthetic[] = [
  { id: "quiet-luxury",            name: "Quiet Luxury",            image: "/style-library/aesthetics/quiet-luxury.jpg",            families: ["autumn","summer","winter"] },
  { id: "old-money",               name: "Old Money",               image: "/style-library/aesthetics/old-money.jpg",               families: ["autumn","winter"] },
  { id: "ralph-lauren",            name: "Ralph Lauren",            image: "/style-library/aesthetics/ralph-lauren.jpg",            families: ["autumn","spring"] },
  { id: "french-chic",             name: "French Chic",             image: "/style-library/aesthetics/french-chic.jpg",             families: ["spring","summer"] },
  { id: "scandinavian-minimalism", name: "Scandinavian Minimalism", image: "/style-library/aesthetics/scandinavian-minimalism.jpg", families: ["winter","summer"] },
  { id: "clean-girl",              name: "Clean Girl",              image: "/style-library/aesthetics/clean-girl.jpg",              families: ["spring","summer","winter"] },
  { id: "dark-academia",           name: "Dark Academia",           image: "/style-library/aesthetics/dark-academia.jpg",           families: ["autumn","winter"] },
  { id: "coastal-chic",            name: "Coastal Chic",            image: "/style-library/aesthetics/coastal-chic.jpg",            families: ["spring","summer"] },
  { id: "minimal-luxury",          name: "Minimal Luxury",          image: "/style-library/aesthetics/minimal-luxury.jpg",          families: ["winter","summer","autumn"] },
  { id: "modern-classic",          name: "Modern Classic",          image: "/style-library/aesthetics/modern-classic.jpg",          families: ["winter","autumn"] },
];

export function getAesthetics(profile: SeasonProfile): Aesthetic[] {
  return AESTHETICS.filter(a => (a.families as string[]).includes(profile.family));
}
