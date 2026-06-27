import type { FullReport } from "./report-schema";

// Slot type
export type ImageSlot = {
  slotId: string;
  prompt: string;
  label: string;
};

// ── Draping prompt (fixed — CSS colour overlay changes the white fabric) ─────

const NEUTRAL_DRAPING_PROMPT = `# PROFESSIONAL COLOR ANALYSIS PHOTO EDIT

This is an edit of the uploaded user photo.

This is NOT a new portrait.

The goal is to create a standardized professional color-analysis photograph that will later be used for digital seasonal draping inside an application.

The resulting image must look exactly like a photograph taken in a professional color analysis studio.

---

## IDENTITY PRESERVATION

Preserve the person's identity exactly.

Do NOT modify:

* face
* facial features
* facial proportions
* expression
* skin
* skin texture
* eyes
* eyebrows
* nose
* lips
* ears
* head position
* camera angle
* framing
* lighting

Do not beautify.

Do not retouch.

Do not smooth skin.

Do not reshape.

Do not redraw.

Do not apply beauty filters.

The face should remain pixel-identical to the uploaded photograph.

---

## BACKGROUND

Replace the original background completely.

Use a clean professional studio background.

Background color:

very light warm neutral grey

approximately #E6E3DF to #ECE9E6

Requirements:

* bright
* matte
* evenly lit
* neutral
* no gradients
* no patterns
* no texture
* no objects
* no shadows
* no environmental elements

The background should create gentle contrast with the white drape without drawing attention.

---

## PORTRAIT POSITION

Center the portrait perfectly.

The face should be horizontally centered.

The face should be vertically centered.

Leave balanced empty space on both sides.

Do not crop differently.

---

## PROFESSIONAL COLOR ANALYSIS DRAPE

Replace all visible clothing with a professional color-analysis drape.

The original clothing must disappear completely.

No shirt.

No sweater.

No hoodie.

No jacket.

No collar.

No neckline.

No accessories.

Everything below the neck should become the drape.

The drape must begin immediately below the chin.

Leave the jawline completely visible.

The drape should extend naturally across both shoulders.

The drape should continue uninterrupted all the way to the bottom edge of the image.

The drape should continue beyond the visible frame, as if it extends outside the photograph.

The entire lower half of the image should consist only of the white drape.

The drape should form one large continuous surface.

The fabric should:

* pure matte white
* soft ivory white
* evenly lit
* smooth
* professional
* soft natural folds
* almost wrinkle-free
* no texture
* no pattern
* no embroidery
* no logo
* no seams
* no stitching
* no pockets

It should look exactly like the professional draping cloth used during seasonal color analysis.

It must NOT resemble:

* a scarf
* a hijab
* a hood
* a cape
* a blanket
* a towel

It is simply a large flat draping cloth resting over the shoulders and torso.

---

## HAIR

Preserve:

* hair color
* haircut
* hairstyle
* length
* texture
* volume

Do NOT redesign the hair.

However, naturally reposition the existing hair behind the shoulders exactly as a professional color analyst would before placing the drape.

This is only a change in placement.

It is NOT a hairstyle change.

Requirements:

* no hair resting on the shoulders
* no hair touching the drape
* no strands overlapping the fabric
* no hair crossing onto the chest

The white drape must remain completely visible from shoulder to shoulder.

The hair should appear naturally tucked behind the shoulders.

---

## CLEAN SEPARATION

The image should clearly contain three separate regions:

1. Face + neck + hair
2. White draping fabric
3. Light neutral background

These three regions should never overlap.

The face must never blend into the drape.

The hair must never overlap the drape.

The background must never blend into the drape.

---

## TECHNICAL REQUIREMENT

This image will later receive digital seasonal draping using CSS color overlays.

Therefore the white drape is intentionally designed as a clean overlay area.

The drape should function like one continuous editable surface.

Requirements:

* one continuous white shape
* easy to isolate visually
* consistent brightness
* consistent color
* minimal folds
* no distractions
* no hair
* no skin
* no clothing
* no accessories
* no shadows cast by hair

Only the white drape area will later receive different seasonal colors.

---

## FINAL RESULT

The final image should look exactly like a real professional color-analysis photograph.

Everything above the drape remains identical to the uploaded photo.

Everything below the neck becomes one continuous professional white draping cloth extending to the bottom edge of the image.

The result should feel clinical, neutral, standardized and perfectly prepared for digital color draping.`;

// ── Contrast B&W prompt (no variables — pure grayscale conversion) ────────────

function buildContrastPrompt(): string {
  return `# PROFESSIONAL BLACK & WHITE CONTRAST ANALYSIS

This is an edit of the uploaded user photo.

This is NOT a new portrait.

The goal is to create a standardized monochrome version of the original photograph for facial contrast analysis.

This is a diagnostic image.

It is NOT an artistic black-and-white conversion.

It is NOT a dramatic portrait.

It is NOT a cinematic effect.

---

# IDENTITY PRESERVATION

Preserve the person's identity exactly.

Do NOT modify:

* face
* facial features
* facial proportions
* expression
* skin texture
* hair
* hairstyle
* eyebrows
* eyelashes
* eyes
* lips
* nose
* ears
* clothing
* background
* framing
* pose
* lighting

The image composition must remain identical to the original.

---

# CONVERSION

Convert the image to true monochrome.

Remove ALL color information.

Do not tint the image.

Do not apply sepia.

Do not apply blue tones.

Do not apply warm tones.

Do not apply cool tones.

The result should contain only neutral grayscale values.

---

# PRESERVE NATURAL LUMINANCE

Maintain the natural brightness relationships of the original image.

Do not artificially brighten skin.

Do not darken hair.

Do not modify shadows.

Do not modify highlights.

Do not modify exposure.

Do not modify white balance.

Only remove color information.

---

# CONTRAST

Preserve the person's natural facial contrast exactly.

The image should accurately show the luminance differences between:

* skin
* hair
* eyebrows
* eyelashes
* lips
* eyes

These natural differences should remain clearly visible.

Do NOT artificially increase contrast.

Do NOT artificially reduce contrast.

---

# AVOID

Do not create:

* cinematic black and white
* film grain
* vintage effects
* HDR
* high contrast filter
* crushed blacks
* blown highlights
* dramatic lighting
* beauty retouching
* artistic grading

---

# IMAGE QUALITY

The result should resemble a professionally calibrated monochrome studio photograph used for color analysis.

Natural.

Neutral.

Clinical.

Accurate.

Diagnostic.

---

# TECHNICAL REQUIREMENT

This image will be used to evaluate facial value contrast.

Therefore:

* preserve every shadow
* preserve every highlight
* preserve every texture
* preserve every strand of hair
* preserve every eyebrow hair
* preserve every eyelash
* preserve skin texture

Only remove color.

Nothing else should change.

---

# FINAL RESULT

Create a perfectly neutral grayscale version of the uploaded photograph.

The image should accurately reveal the person's natural value contrast without introducing any artistic or stylistic modifications.

The result should look like a professional diagnostic photograph used by certified personal color analysts.

ANALYSIS GOAL

The monochrome conversion should accurately preserve the relative luminance of the person's:

- skin
- hair
- eyebrows
- eyelashes
- lips
- eyes

This image will be used to evaluate natural facial contrast.

The conversion must be technically accurate rather than visually dramatic.`;
}

// ── Metal try-on slots ────────────────────────────────────────────────────────

export const METAL_SLOTS = [
  {
    slotId: "metal-silver",
    metal: "Silver",
    earrings: "Small polished round studs (5 mm)",
    necklace: "Ultra-thin 1 mm chain",
    pendant: "None",
    label: "Silver",
  },
  {
    slotId: "metal-gold",
    metal: "Yellow Gold",
    earrings: "Small classic hoops (15 mm)",
    necklace: "Fine chain with a tiny round pendant",
    pendant: "included in necklace",
    label: "Gold",
  },
] as const;

function buildMetalPrompt(metal: string, earrings: string, necklace: string, pendant: string): string {
  return `# PROFESSIONAL JEWELRY METAL TRY-ON

This is an edit of the uploaded user photo.

This is NOT a new portrait.

The goal is to realistically visualize how the person looks wearing jewelry in the specified metal.

This is a virtual jewelry try-on.

Only the jewelry should be added or replaced.

Everything else must remain identical.

---

# IDENTITY PRESERVATION

Preserve the person's identity exactly.

Do NOT modify:

* face
* facial features
* facial proportions
* expression
* skin
* skin texture
* eyes
* eyebrows
* nose
* lips
* ears
* hair
* hair color
* hairstyle
* clothing
* body
* pose
* framing
* camera angle
* lighting
* background

The face must remain pixel-identical to the uploaded photograph.

---

# DO NOT BEAUTIFY

Do not beautify.

Do not retouch.

Do not smooth skin.

Do not reshape.

Do not redraw.

Do not apply beauty filters.

Do not modify facial proportions.

Do not change makeup.

Do not change hair.

Do not change clothing.

---

# JEWELRY

Apply jewelry made ONLY from the specified metal.

Metal:

**${metal}**

Examples:

* Silver
* White Gold
* Yellow Gold
* Rose Gold

The jewelry should look realistic, elegant and premium.

---

# JEWELRY STYLE

Use timeless minimalist jewelry.

Include only:

* small stud earrings OR small elegant hoops
* delicate necklace
* thin chain
* subtle pendant if appropriate

Avoid:

* oversized jewelry
* fashion jewelry
* chunky pieces
* gemstones
* colored stones
* diamonds larger than subtle accents
* statement jewelry
* logos

The focus is the metal itself.

---

# METAL APPEARANCE

The metal should accurately represent its real appearance.

Examples:

Silver:
cool neutral metallic

Yellow Gold:
rich warm gold

Rose Gold:
soft warm pink gold

White Gold:
cool luxurious white metal

Use realistic reflections.

Natural highlights.

Professional jewelry photography quality.

---

# NATURAL INTEGRATION

The jewelry should fit naturally.

Follow the person's:

* ears
* neck
* proportions

The jewelry should appear as if the person is actually wearing it.

Nothing should look pasted on.

---

# COLOR ACCURACY

The metal color should remain true to the requested material.

Avoid exaggerated saturation.

Avoid unrealistic shine.

Avoid fantasy metals.

The jewelry should look like luxury fine jewelry.

---

# TECHNICAL CONSISTENCY

This image will be compared with other metal options.

Therefore:

* identical face
* identical lighting
* identical clothing
* identical background
* identical pose

The ONLY visible difference should be the metal color of the jewelry.

---

# CRITICAL

Do NOT change:

* makeup
* hairstyle
* clothing
* skin
* lighting

Do NOT improve attractiveness.

Do NOT create another portrait.

Only add elegant jewelry in the specified metal.

Everything else must remain identical.

---

# FINAL RESULT

Create a realistic luxury jewelry virtual try-on.

The result should resemble a premium jewelry brand visualization.

The person should look exactly the same, with only the recommended metal enhancing their natural harmony.

---

# EXACT JEWELRY SPECIFICATION

Metal:
${metal}

Earrings:
${earrings}

Necklace:
${necklace}

Pendant:
${pendant}`;
}

// ── Hair colour prompt (colour name + hex injected) ───────────────────────────

function buildHairPrompt(hairColor: string, hex?: string): string {
  const hexLine = hex ? `\nHex:\n\n**${hex}**` : "";
  return `# PROFESSIONAL HAIR COLOR TRY-ON EDIT

This is an edit of the uploaded user photo.

This is NOT a new portrait.

The goal is to realistically visualize how a specific hair color looks on the person's actual hair.

Only the hair color should change.

Everything else must remain identical.

---

## IDENTITY PRESERVATION

Preserve the person's identity exactly.

Do NOT modify:

* face
* facial features
* facial proportions
* expression
* skin
* skin texture
* eyes
* eyebrows
* nose
* lips
* ears
* head position
* pose
* camera angle
* framing
* lighting

The face must remain pixel-identical to the uploaded photograph.

---

## DO NOT APPLY BEAUTY RETOUCHING

Do not beautify.

Do not retouch.

Do not smooth skin.

Do not reshape.

Do not redraw.

Do not change facial proportions.

Do not apply makeup.

Do not change skin tone.

Do not whiten teeth.

Do not change eye color.

---

## BACKGROUND

Do not change the background.

---

## HAIR COLOR

Apply ONLY the specified hair color.

Hair color:

**${hairColor}**${hexLine}

This is a professional salon-quality virtual hair color.

The color should appear naturally dyed, not digitally painted.

---

## PRESERVE THE HAIR EXACTLY

Do NOT change:

* hairstyle
* haircut
* hair length
* hair volume
* hair texture
* curls
* waves
* straightness
* flyaway hairs
* hairline
* baby hairs
* parting
* fringe / bangs
* ponytail
* layers

Every individual strand should remain exactly where it is.

Only the pigment of the hair should change.

---

## COLOR APPLICATION

The new color should cover all visible hair.

The color should follow the natural direction of every hair strand.

Preserve:

* highlights
* shadows
* depth
* natural lighting
* shine
* strand definition

Do not flatten the hair into one solid color.

Keep realistic tonal variation.

The result should resemble professionally colored natural hair.

---

## COLOR ACCURACY

The displayed hair color should closely match the provided hex value.

The color should remain recognizable while naturally interacting with the lighting.

Do not significantly shift the hue.

Do not oversaturate.

Do not create unrealistic artificial colors unless requested.

---

## FINISH

The hair should maintain its natural shine.

Do not create:

* plastic-looking hair
* CGI hair
* painted hair
* cartoon hair
* matte hair
* overly glossy hair

The finish should resemble professionally photographed healthy natural hair.

---

## TECHNICAL REQUIREMENT

This image will be used for comparing multiple hair colors.

Therefore:

* identical face
* identical lighting
* identical framing
* identical hairstyle
* identical hair shape
* identical hair texture
* identical background

The ONLY visible difference between different renders should be the hair color.

---

## CRITICAL

Do not generate a new hairstyle.

Do not repaint the hair from scratch.

Do not add volume.

Do not remove volume.

Do not change strand placement.

Do not change hair density.

Do not change the silhouette of the hair.

Only replace the pigment of the existing hair while preserving every visible strand.

---

## HAIR COLORING LOGIC

The requested shade should behave like a real professional hair dye.

Natural highlights, lowlights, strand variation and lighting must remain visible.

Do not create a flat solid-color overlay.

The result should look like professionally colored real hair photographed under studio lighting.

---

## FINAL RESULT

Create a realistic professional virtual hair color try-on.

The result should resemble a premium salon hair color simulation.

Everything except the hair color must remain identical to the original photograph.`;
}

// ── Hairstyle prompt (style description injected) ─────────────────────────────

function buildHairStylePrompt(styleDescription: string): string {
  return `# PROFESSIONAL HAIRSTYLE VIRTUAL TRY-ON

This is an edit of the uploaded user photo.

This is NOT a new portrait.

The goal is to realistically simulate how the person would look wearing a different hairstyle.

This is a virtual hairstyle try-on.

The person's identity must remain exactly the same.

Only the hairstyle should change.

Everything else must remain identical.

---

## IDENTITY PRESERVATION

Preserve the person's identity exactly.

Do NOT modify:

* face
* facial features
* facial proportions
* facial symmetry
* expression
* skin
* skin texture
* eyes
* eyebrows
* nose
* lips
* ears
* neck
* shoulders
* body proportions
* head position
* camera angle
* framing
* lighting
* background

The face must remain pixel-identical to the uploaded photograph.

---

## DO NOT APPLY BEAUTY RETOUCHING

Do not beautify.

Do not retouch.

Do not smooth skin.

Do not reshape the face.

Do not make the person younger.

Do not make the person older.

Do not apply beauty filters.

Do not modify facial proportions.

Do not modify makeup.

Do not modify eye color.

Do not modify eyebrows.

Do not modify lips.

Do not modify skin tone.

---

## HAIRSTYLE

Replace the existing hairstyle with the following hairstyle:

${styleDescription}

The hairstyle should look professionally cut and styled.

The hairstyle must naturally suit the person's head.

---

## HAIR COLOR

Keep the ORIGINAL hair color exactly.

Do NOT recolor the hair.

Preserve all natural:

* highlights
* lowlights
* shine
* tonal variation
* lighting

Only the hairstyle changes.

---

## REALISTIC HAIR SIMULATION

Generate highly realistic individual hair strands.

Hair should have:

* natural strand separation
* realistic density
* believable thickness
* realistic volume
* soft flyaway hairs
* realistic root direction
* believable movement
* salon-quality finish

The hairstyle must obey gravity.

Hair must naturally wrap around:

* forehead
* temples
* ears
* neck
* shoulders

Avoid:

* helmet hair
* CGI hair
* painted hair
* cartoon hair
* perfectly symmetrical hair
* unrealistic hairlines

---

## NATURAL INTEGRATION

The hairstyle should appear as if it genuinely belongs to this person.

Adapt naturally to:

* head shape
* forehead size
* hairline
* ears
* neck
* face shape

The hairstyle should never look copied or pasted.

It should look like a real haircut performed by a professional hairstylist.

---

## PRESERVE

Keep exactly the same:

* facial expression
* pose
* shoulders
* clothing
* jewelry
* lighting
* camera perspective
* image quality
* background

Everything except the hairstyle must remain identical.

---

## TECHNICAL CONSISTENCY

This image will be displayed alongside multiple hairstyle recommendations.

Therefore every generated version must have:

* identical framing
* identical face
* identical lighting
* identical background
* identical clothing
* identical skin tone

The ONLY visible difference between different versions should be the hairstyle.

---

## CRITICAL

Do NOT generate another person.

Do NOT regenerate the portrait.

Do NOT beautify.

Do NOT improve facial attractiveness.

Do NOT change facial proportions.

Do NOT change age.

Do NOT change ethnicity.

Do NOT change gender presentation.

Do NOT change camera position.

Only replace the hairstyle.

The face must remain exactly the same person.

---

## FINAL RESULT

Create a premium salon-quality virtual hairstyle try-on.

The result should resemble a luxury beauty app where users can realistically preview professional hairstyles on their own face.

The hairstyle should look completely natural, highly photorealistic, and seamlessly integrated with the existing portrait.

Everything except the hairstyle must remain identical to the original image.`;
}

// ── Final look prompt (all recommendations injected) ─────────────────────────

type MakeupSummary = { name: string; hex: string } | null;

function buildFinalLookPrompt(params: {
  hairColor: string;
  hairCut: string;
  hairStyle: string;
  lips: MakeupSummary;
  blush: MakeupSummary;
  eyeshadow: MakeupSummary;
  outfit: string;
  jewelry: string;
  season: string;
}): string {
  const { hairColor, hairCut, hairStyle, lips, blush, eyeshadow, outfit, jewelry, season } = params;
  return `# PALETTEME — BEST VERSION OF YOU

This is an edit of the uploaded user photo.

This is NOT a new portrait.

This is NOT an AI-generated person.

This is NOT a beauty filter.

This is NOT a glamour makeover.

The goal is to create a realistic visualization of how this exact person would look after following all of their personalized PaletteMe recommendations.

The transformation must come entirely from styling choices—not from changing the person's appearance.

The result should feel aspirational, believable, elegant and achievable in real life.

---

# IDENTITY PRESERVATION

Preserve the person's identity exactly.

The person must be instantly recognizable.

Do NOT modify:

* face
* facial proportions
* facial structure
* bone structure
* expression
* smile
* eyes
* eye shape
* eye color
* eyebrows
* nose
* lips
* ears
* skin texture
* freckles
* beauty marks
* age
* ethnicity
* body proportions

The face should remain pixel-identical to the uploaded photograph.

---

# NEVER BEAUTIFY

Do NOT:

* beautify
* retouch
* smooth skin
* enlarge eyes
* slim the face
* reshape the nose
* enlarge lips
* whiten teeth
* remove natural skin texture
* remove pores
* remove freckles
* make the person younger
* make the person older
* create unrealistic perfection
* create Instagram Face
* create an AI influencer

The person should still look completely real.

---

# APPLY THE PROVIDED RECOMMENDATIONS

Using the recommendations below, transform ONLY the styling.

---

## Hair

Apply the recommended:

* haircut
* hairstyle
* hair color

The hairstyle should be salon quality.

Natural.

Modern.

Professionally styled.

---

## Makeup

Apply ONLY the recommended makeup.

Examples:

* lipstick
* blush
* eyeshadow

Use professional beauty application.

Natural.

Elegant.

Refined.

Never excessive.

The makeup should enhance the existing face without changing it.

---

## Clothing

Dress the person using the recommended style.

Follow:

* seasonal palette
* body type recommendations
* personal style recommendations

The clothing should fit perfectly.

Premium quality.

Timeless.

Elegant.

Avoid:

* logos
* busy prints
* distracting graphics

---

## Accessories

Use only the recommended jewelry.

Examples:

* silver
* gold
* rose gold

Keep accessories minimal.

Luxury.

Elegant.

---

## Color Harmony

Every visible color should belong to the recommended seasonal palette.

Hair.

Makeup.

Clothing.

Accessories.

Everything should feel harmonious.

Nothing should compete.

Nothing should clash.

---

# OVERALL STYLE

The person should look like:

The most authentic version of themselves.

Confident.

Effortlessly stylish.

Expensive without looking flashy.

Modern.

Natural.

Refined.

Sophisticated.

The styling should never feel forced.

---

# BACKGROUND

Replace the background with a luxury fashion editorial studio.

Bright.

Minimal.

Neutral.

Premium.

Nothing distracting.

---

# LIGHTING

Professional luxury beauty photography.

Soft.

Natural.

Even.

High-end editorial lighting.

No dramatic shadows.

No cinematic effects.

---

# IMAGE QUALITY

Luxury beauty campaign quality.

Fashion magazine editorial.

Professional salon photography.

Photorealistic hair.

Photorealistic clothing.

Natural skin texture.

Premium color grading.

Extremely realistic.

---

# TECHNICAL CONSISTENCY

The result should look exactly like the same person after visiting:

* a professional color analyst
* an expert hairstylist
* a luxury makeup artist
* a high-end personal stylist

Nothing else should change.

---

# CRITICAL

Never improve the person's genetics.

Never change their identity.

Never alter facial anatomy.

Never create a different face.

Never generate another person.

Never exaggerate attractiveness.

The transformation must come ONLY from:

* better colors
* better hairstyle
* better hair color
* better makeup
* better clothing
* better styling

The viewer should immediately think:

"This isn't someone else.

This is exactly the same person...

...they're simply wearing everything that suits them perfectly."

---

# RECOMMENDATIONS

Hair Color:
${hairColor}

Haircut:
${hairCut}

Hairstyle:
${hairStyle}

Lipstick:
${lips ? `${lips.name} (${lips.hex})` : "none"}

Blush:
${blush ? `${blush.name} (${blush.hex})` : "none"}

Eyeshadow:
${eyeshadow ? `${eyeshadow.name} (${eyeshadow.hex})` : "none"}

Jewelry:
${jewelry}

Season:
${season}

Outfit:
${outfit}

---

# FINAL RESULT

Create the most authentic, harmonious and realistic version of this person using only the provided PaletteMe recommendations.

The final image should look like a premium fashion editorial featuring the person's real appearance after receiving professional styling—not cosmetic enhancement.

The result should feel believable, elegant, luxurious and completely achievable in real life.

EMOTIONAL GOAL

The user should feel:

"I didn't become someone else.

I finally became the version of myself that was always there."

This should feel inspiring, authentic and realistic—not artificial or fantasy-like.`;
}

// ── Build the full ordered image slot list ────────────────────────────────────

export function buildImageSlots(report: FullReport): ImageSlot[] {
  const { contrast, colorAnalysis, makeupComparisons, hairOptions, finalLook } = report;

  return [
    // neutral-draping MUST be first — SeasonReveal gates on it
    { slotId: "neutral-draping", prompt: NEUTRAL_DRAPING_PROMPT, label: "Colour try-on" },

    ...METAL_SLOTS.map(m => ({
      slotId: m.slotId,
      prompt: buildMetalPrompt(m.metal, m.earrings, m.necklace, m.pendant),
      label: "",
    })),

    ...hairOptions.flatMap((h, i) => [
      {
        slotId: `hair-color-${i}`,
        prompt: buildHairPrompt(h.color ?? h.name),
        label: i === 0 ? "Hair colour" : "",
      },
      {
        slotId: `hair-style-${i}`,
        prompt: buildHairStylePrompt(h.style ?? h.name),
        label: i === 0 ? "Hair style" : "",
      },
    ]),

    {
      slotId: "final-look",
      prompt: buildFinalLookPrompt({
        hairColor:  hairOptions[0]?.color ?? "",
        hairCut:    hairOptions[0]?.style?.split(",")[0] ?? "",
        hairStyle:  hairOptions[0]?.style ?? "",
        lips:       makeupComparisons.find(m => m.category === "lips")?.goodShade ?? null,
        blush:      makeupComparisons.find(m => m.category === "blush")?.goodShade ?? null,
        eyeshadow:  makeupComparisons.find(m => m.category === "eyeshadow")?.goodShade ?? null,
        outfit:     finalLook.outfit ?? "",
        jewelry:    finalLook.jewelry ?? "",
        season:     colorAnalysis.topSeason.name,
      }),
      label: "Your look",
    },
  ];
}
