export type SilhouetteGuide = {
  label: string;
  principle: string;
  bestCuts: string[];
  necklines: string[];
  avoid: string[];
  outfitTip: string;
};

const FACE_SHAPE_GUIDE: Record<string, { label: string; necklines: string[]; eyewear: string; tip: string }> = {
  oval: {
    label: "Oval",
    necklines: ["Any neckline works — oval is the most versatile face shape"],
    eyewear: "Any frame shape flatters an oval face",
    tip: "You can wear any collar or neckline without restriction.",
  },
  round: {
    label: "Round",
    necklines: ["V-neck", "Deep scoop", "Plunge", "Long open collar"],
    eyewear: "Angular frames (rectangular, square) add definition",
    tip: "Vertical necklines elongate. Avoid crew necks and wide boat necks.",
  },
  square: {
    label: "Square",
    necklines: ["V-neck", "Scoop", "Cowl", "Rounded collar"],
    eyewear: "Round or oval frames soften angular features",
    tip: "Soft curved necklines balance a strong jawline. Avoid sharp angular collars.",
  },
  heart: {
    label: "Heart",
    necklines: ["Scoop", "Square neck", "Off-shoulder", "Sweetheart"],
    eyewear: "Bottom-heavy or oval frames balance a wider forehead",
    tip: "Add width at the jaw and chin. Avoid wide V-necks that emphasise the forehead.",
  },
  oblong: {
    label: "Oblong",
    necklines: ["Boat neck", "Wide scoop", "Square neck", "High crew"],
    eyewear: "Deep or oversized frames add width",
    tip: "Horizontal lines add width. Avoid very long V-necks that elongate further.",
  },
  diamond: {
    label: "Diamond",
    necklines: ["Boat neck", "Off-shoulder", "Collarless", "Wide square neck"],
    eyewear: "Oval or rimless frames soften the look",
    tip: "Emphasise your eyes and jaw. Avoid narrow necks that hide cheekbones.",
  },
};

const SILHOUETTE_GUIDES: Record<string, SilhouetteGuide> = {
  hourglass: {
    label: "Hourglass",
    principle: "Define the waist — your natural symmetry is the biggest advantage",
    bestCuts: ["Wrap dresses", "Fit-and-flare dresses", "Belted blazers", "High-waist trousers", "Pencil skirts"],
    necklines: ["V-neck", "Sweetheart", "Scoop — all work equally well"],
    avoid: ["Boxy oversized tops", "Drop-waist silhouettes", "Shapeless shift dresses"],
    outfitTip: "A belted wrap or fitted knit is your signature piece — it works in every colour from your palette.",
  },
  "bottom-hourglass": {
    label: "Bottom Hourglass",
    principle: "Balance your proportions while showing off your defined waist",
    bestCuts: ["A-line skirts", "Wrap dresses", "Bootcut trousers", "Structured blazers"],
    necklines: ["Boat neck", "Off-shoulder", "Wide V — to add visual width at the shoulder"],
    avoid: ["Tight pencil skirts", "Horizontal print bands across the hips"],
    outfitTip: "A wide-shoulder top in a light base colour over a darker A-line skirt creates perfect balance.",
  },
  pear: {
    label: "Pear",
    principle: "Draw the eye up — shoulders and neckline are your canvas",
    bestCuts: ["Wide-leg trousers", "A-line skirts", "Structured blazers", "Off-shoulder tops", "Bold shoulder tops"],
    necklines: ["Off-shoulder", "Boat neck", "Wide collars", "Embellished necklines"],
    avoid: ["Pencil skirts that cling at hips", "Tapered trousers", "Hip-level pockets or detailing"],
    outfitTip: "Wear your palette's lightest power colour on top and a deeper base colour below.",
  },
  "inverted-triangle": {
    label: "Inverted Triangle",
    principle: "Add volume below the waist, streamline the shoulder line",
    bestCuts: ["Full skirts", "Wide-leg trousers", "A-line and flared dresses", "Bootcut jeans"],
    necklines: ["Deep V-neck", "Plunge", "Low open collars — soften broad shoulders visually"],
    avoid: ["Off-shoulder", "Boat neck", "Cold-shoulder — all widen the shoulder line further"],
    outfitTip: "Volume in your base or power colour below the waist, streamlined on top in a neutral.",
  },
  rectangle: {
    label: "Rectangle",
    principle: "Create curves and dimension through contrast and layering",
    bestCuts: ["Peplum tops", "Belted dresses", "Tailored separates in contrasting colours", "Wrap styles"],
    necklines: ["Scoop", "V-neck", "Cowl — any option adds interest at the neckline"],
    avoid: ["Shapeless shift dresses in a single colour head-to-toe"],
    outfitTip: "Layer your palette's base and power colours — a lighter top with a darker bottom creates the illusion of a waist.",
  },
  triangle: {
    label: "Triangle",
    principle: "Balance narrower shoulders with fuller hips",
    bestCuts: ["Tops with shoulder embellishment or structure", "A-line skirts", "Flared trousers", "Cape or structured jackets"],
    necklines: ["Boat neck", "Wide V", "Off-shoulder — add visual shoulder width"],
    avoid: ["Hip-level prints or detailing", "Tapered skirts or trousers"],
    outfitTip: "Shoulder structure in your power colour + a flowing base-colour skirt is a go-to combination.",
  },
  trapezoid: {
    label: "Trapezoid (Athletic)",
    principle: "Lean into the V-taper — tailored and slim-fit are your best friends",
    bestCuts: ["Slim-fit suits", "Tapered trousers", "Fitted polos", "Bomber jackets", "Slim selvedge denim"],
    necklines: ["Open collar", "V-neck", "Crew — any works with a strong shoulder line"],
    avoid: ["Oversized hoodies that bury the V-taper", "Boxy double-breasted blazers"],
    outfitTip: "A slim-fit blazer in your base colour over a tonal shirt is the sharpest look for your frame.",
  },
  oval: {
    label: "Oval",
    principle: "Vertical lines and a strong shoulder — draw the eye up and out",
    bestCuts: ["Single-button blazers", "V-neck sweaters", "Dark tapered trousers with a tuck", "Straight-leg jeans"],
    necklines: ["V-neck", "Open collar — creates vertical length"],
    avoid: ["Horizontal stripes across chest or stomach", "Tight-fitting shirts", "Cropped lengths"],
    outfitTip: "A monochromatic head-to-toe in your deepest base colour creates maximum slimming effect.",
  },
};

export function getSilhouetteGuide(bodyType: string | undefined): SilhouetteGuide | null {
  if (!bodyType) return null;
  return SILHOUETTE_GUIDES[bodyType] ?? SILHOUETTE_GUIDES["rectangle"] ?? null;
}

export function getFaceShapeGuide(faceShape: string | undefined) {
  if (!faceShape) return null;
  return FACE_SHAPE_GUIDE[faceShape.toLowerCase()] ?? null;
}
