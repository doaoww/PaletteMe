# Palette Images — Generation Guide

These 6 images are used as drape overlays in the Color Family Diagnostics module.
Place finished files in this folder with the exact filenames below.

**Note:** Neutrals are handled differently — they are interactive color circles with
AI-generated comments (no palette image needed for neutrals).

---

## Pro tip: use fixed HEX codes in your prompts

If you let the model pick colors by name only (`warm coral`, `sage`, `mauve`),
output will vary slightly across generations. For a product where color is the core,
hardcode the HEX for each stripe. That way:
- every generation is pixel-consistent
- you can reuse the same values in UI, makeup, and outfit recommendations later

Replace the color name in each prompt with `name (#HEXCODE)`.
Example: `3. Camel (#C19A6B)`

---

## Files needed (6 total)

### `warm.png`

```
Create a professional color analysis draping palette consisting of exactly 7 equal-width vertical color stripes.

The palette should represent warm color temperature only.

Colors from left to right:
1. Warm Ivory
2. Golden Beige
3. Camel
4. Warm Coral
5. Terracotta
6. Pumpkin
7. Olive Green

Requirements:
- Equal-width vertical stripes only.
- No text, no labels, no borders.
- No gradients, no shadows, no texture, no fabric, no background.
- Flat solid colors.
- Medium value, medium saturation.
- All colors should clearly belong to the warm color family used in professional color analysis draping.
- Similar to professional House of Colour / SciART draping palettes.

Image format:
- Square image, minimum 600×600 px
- PNG or WebP
- Colors should remain strong enough for mix-blend-mode: multiply on white fabric.
```

---

### `cool.png`

```
Create a professional color analysis draping palette consisting of exactly 7 equal-width vertical color stripes.

The palette should represent cool color temperature only.

Colors from left to right:
1. Cool Ivory
2. Cool Pink
3. Dusty Rose
4. Mauve
5. Periwinkle
6. Slate Blue
7. Blue Grey

Requirements:
- Equal-width vertical stripes only.
- No text, no labels, no borders.
- No gradients, no shadows, no texture, no background.
- Flat solid colors.
- Medium value, medium saturation.
- All colors should clearly belong to the cool color family used in professional color analysis draping.
- Similar to professional House of Colour / SciART draping palettes.

Image format:
- Square image, minimum 600×600 px
- PNG or WebP
- Colors should remain strong enough for mix-blend-mode: multiply on white fabric.
```

---

### `bright.png`

```
Create a professional color analysis draping palette consisting of exactly 7 equal-width vertical color stripes.

The palette should represent bright / clear chroma.

Colors from left to right:
1. Hot Pink
2. True Red
3. Bright Orange
4. Lemon Yellow
5. Emerald Green
6. Turquoise
7. Cobalt Blue

Requirements:
- Equal-width vertical stripes only.
- No text, no labels, no borders.
- No gradients, no shadows, no texture, no background.
- Flat solid colors.
- Maximum chroma, pure clean colors.
- Similar to professional color draping fabrics.

Image format:
- Square image, minimum 600×600 px
- PNG or WebP
```

---

### `muted.png`

```
Create a professional color analysis draping palette consisting of exactly 7 equal-width vertical color stripes.

The palette should represent soft / muted chroma.

Colors from left to right:
1. Dusty Rose
2. Mauve
3. Sage
4. Soft Olive
5. Muted Teal
6. Mushroom
7. Taupe

Requirements:
- Equal-width vertical stripes only.
- No text, no labels, no borders.
- No gradients, no shadows, no texture, no background.
- Flat solid colors.
- Low saturation, soft muted appearance.
- Similar to professional color analysis draping fabrics.

Image format:
- Square image, minimum 600×600 px
- PNG or WebP
```

---

### `light.png`

```
Create a professional color analysis draping palette consisting of exactly 7 equal-width vertical color stripes.

The palette should represent light value.

Colors from left to right:
1. Soft Ivory
2. Blush Pink
3. Pale Peach
4. Powder Blue
5. Pale Lavender
6. Pale Aqua
7. Soft Mint

Requirements:
- Equal-width vertical stripes only.
- No text, no labels, no borders.
- No gradients, no shadows, no texture, no background.
- Flat solid colors.
- Light pastel colors only, similar brightness across all stripes.
- Similar to professional color analysis draping fabrics.

Image format:
- Square image, minimum 600×600 px
- PNG or WebP
```

---

### `deep.png`

```
Create a professional color analysis draping palette consisting of exactly 7 equal-width vertical color stripes.

The palette should represent deep value.

Colors from left to right:
1. Espresso
2. Dark Chocolate
3. Aubergine
4. Burgundy
5. Forest Green
6. Deep Teal
7. Midnight Navy

Requirements:
- Equal-width vertical stripes only.
- No text, no labels, no borders.
- No gradients, no shadows, no texture, no background.
- Flat solid colors.
- Rich dark tones, similar depth across all stripes.
- Similar to professional color analysis draping fabrics.

Image format:
- Square image, minimum 600×600 px
- PNG or WebP
```

---

## After generating

Place all 6 files in this folder (`public/palettes/`).
The app references them as `/palettes/warm.png`, `/palettes/cool.png`, etc.
