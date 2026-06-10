# PaletteMe — Editorial Pink Style Guide

How to port the v3 look (DM Serif Display + DM Sans + Allura · cream / ink / hot-pink / berry)
into your own project / Claude codebase.

---

## 1. Fonts

Add this once to your HTML `<head>` (or import in your CSS):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400;1,9..40,500&family=Allura&display=swap" rel="stylesheet">
```

Roles:
- **DM Serif Display** → all headings (use weight **400 only** — it has no bold; faux-bold looks bad).
- **DM Sans** → menu, body, labels, buttons, the `palette me` wordmark.
- **Allura** → script flourish words only (`season`, `you.`).

---

## 2. Brand tokens

Drop these into your `:root`. Hex first (exact), with the oklch equivalent in a comment
so you can match your existing oklch design-system file.

```css
:root{
  /* surfaces */
  --cream:   #FBF1E4;  /* oklch(0.96 0.020 82)  page background        */
  --cream-2: #F4E5D2;  /* oklch(0.92 0.028 78)  alt section            */
  --ink:     #17121A;  /* oklch(0.20 0.018 330) text / dark sections   */
  --ink-soft:#6A5560;  /* oklch(0.46 0.022 350) muted text             */

  /* brand — everything keys off --accent so one change recolours all */
  --accent:    #FF2E7E;                                  /* oklch(0.64 0.234 5)  hot pink */
  --pink:      var(--accent);
  --pink-deep: color-mix(in srgb, var(--accent) 86%, #4a0a28);  /* buttons */
  --berry:     color-mix(in srgb, var(--accent) 46%, #220612);  /* deep blocks (quiz) */
  --blush:     color-mix(in srgb, var(--accent) 22%, #fff);     /* soft block (reviews) */
  --lilac:     #C9B6E4;  /* oklch(0.80 0.060 300)  gradient only       */

  /* type */
  --serif:  'DM Serif Display', Georgia, serif;
  --script: 'Allura', cursive;
  --sans:   'DM Sans', system-ui, sans-serif;
}
```

> Tip: because `--pink/--pink-deep/--berry/--blush` are all derived from `--accent`,
> changing **one** hex re-themes the whole brand and stays in harmony.

---

## 3. If your file is the Tailwind v4 `@theme` one you pasted

Add the brand vars to `:root`, then expose them to utilities inside `@theme inline`:

```css
@theme inline {
  --color-cream:   var(--cream);
  --color-ink:     var(--ink);
  --color-accent:  var(--accent);
  --color-berry:   var(--berry);
  --color-blush:   var(--blush);
  --font-serif:    var(--serif);
  --font-sans:     var(--sans);
  --font-script:   var(--script);
}
```

Now `bg-cream`, `text-ink`, `bg-accent`, `font-serif`, etc. all work as Tailwind classes.
Map shadcn semantic tokens too if you use them: `--primary: var(--accent);`
`--background: var(--cream);` `--foreground: var(--ink);`.

---

## 4. The signature patterns (copy these — they make it feel "designed")

**Bracketed small-caps label** (replaces generic eyebrows):
```css
.kicker{font:700 .66rem var(--sans); letter-spacing:.28em; text-transform:uppercase; color:var(--pink)}
.kicker::before{content:"[ "} .kicker::after{content:" ]"}
```

**Script flourish inside a serif heading:**
```html
<h2>Find your <span class="scr">season</span></h2>
```
```css
.scr{font-family:var(--script); color:var(--pink); font-size:1.5em; line-height:.8;
     display:inline-block; transform:translateY(.08em)}
```

**Polaroid frame** (tilt + white border + soft shadow):
```css
.polaroid{background:#fff; padding:10px 10px 14px; border-radius:2px;
  box-shadow:0 18px 40px -22px rgba(23,18,26,.55); transform:rotate(-1.5deg)}
```

**Dreamy gradient hero** (with grain so it doesn't look "AI"):
```css
background:
  radial-gradient(80% 75% at 18% 22%, color-mix(in srgb,var(--lilac) 90%,#fff) 0, transparent 58%),
  radial-gradient(85% 80% at 84% 14%, #FFC7DD 0, transparent 60%),
  radial-gradient(95% 90% at 70% 100%, #FF7FB0 0, transparent 62%),
  linear-gradient(155deg,#E7C3E4 0%,#F6B6CE 42%,#FBD7C5 100%);
/* + a soft-light SVG fractalNoise overlay at ~0.5 opacity */
```

**Relaxed menu + matching buttons** (the fix from the "too AI" version — buttons share the
menu's lowercase, untracked treatment; never uppercase + letter-spacing):
```css
.navlinks a{font:500 .96rem var(--sans); letter-spacing:0; text-transform:lowercase}
.btn{font:600 .95rem var(--sans); letter-spacing:0; text-transform:lowercase;
     border-radius:100px; padding:11px 26px;
     background:var(--pink-deep); color:#fff; border:1.5px solid var(--pink-deep)}
.btn--ghost{background:transparent; color:inherit; border-color:currentColor}
```

**Hero** = dreamy gradient + a SMALL `palette me` logo, then lead with the big serif
headline (so the front page matches the editorial body). Don't open with a giant sans wordmark.

---

## 5. Fastest path in Claude

Paste this whole file into the chat and say:
"Apply this PaletteMe style guide to my project — add the font import, the `:root` tokens,
and the `@theme` mapping, then restyle my components using these tokens and patterns."

That gives Claude the exact tokens + intent instead of guessing.
