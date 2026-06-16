# StyleWise — Full Product & User Flow Document

---

## Core Philosophy

Accuracy over speed. The AI never rejects an item without explaining how to work with it. The user always overrides the AI. No forced gender — only style preferences. Photos are optional everywhere. Heavy computations happen in the background before the user asks. Never ask for permissions before the user understands why they matter.

---

## Color Season Algorithm — How It Works

This is the brain of the entire app. Every quiz answer feeds into a weighted scoring system that determines the user's color season. Here is exactly how:

**Step 1 — Determine warm vs cool**

Undertone from vein color: cool = +2 cool points, warm = +2 warm points, neutral = +1 each

Sun reaction: burns quickly = +2 cool, burns then tans = +1 cool, tans easily = +1 warm, never burns = +2 warm

Eye color: blue / grey / cool green = +1 cool, dark brown / hazel / warm green = +1 warm, brown = neutral

Hair color: black / ash blonde / cool brown = +1 cool, auburn / warm brown / golden blonde = +1 warm, dark brown = neutral

**Step 2 — Determine depth (light vs deep)**

Skin tone: very fair / fair = +2 light, medium = +1 light +1 deep, olive = +1 deep, deep / very deep = +2 deep

Hair color: black / very dark brown = +2 deep, medium brown = +1 deep, light brown = neutral, blonde = +2 light, grey / white = +1 light

Contrast level: high contrast = +1 deep, low contrast = +1 light

**Step 3 — Determine clarity (bright vs muted)**

Eye color: vivid blue / vivid green = +2 bright, grey = +1 muted, hazel = +1 muted, dark brown = +1 muted

Contrast level: high contrast = +1 bright, low contrast = +1 muted

Skin tone: very fair with high contrast = +1 bright, olive = +1 muted

**Step 4 — Map to season**

Warm + light + bright = Spring

Warm + deep + muted = Autumn

Cool + light + muted = Summer

Cool + deep + bright = Winter

Warm + light + muted = Soft Spring / Warm Spring

Cool + light + bright = Bright Summer / Clear Summer

Warm + deep + bright = Warm Autumn / Deep Autumn

Cool + deep + muted = Deep Winter / Soft Winter

**Step 5 — Selfie confirmation**

If selfie uploaded: computer vision extracts dominant skin hex, eye color region, hair region. These are converted to warm/cool/depth scores and compared against quiz scores. If both agree — confidence goes to 90–95%. If they conflict — both options are shown to user and user decides.

**Step 6 — Body data integration**

Height + weight + body shape feed into a separate silhouette algorithm. This determines: which cuts elongate or balance the frame, which proportions work for the waist-to-hip ratio, which patterns scale well for the height, which fabric weights suit the build. This runs alongside color analysis and both feed into every outfit recommendation and scan result.

**Step 7 — Continuous refinement**

Every time user says "feels off" on a result, that data point adjusts the weights slightly for their profile. After 10 feedback points the algorithm self-corrects. After 20 it is highly personalized.

---

## User Flow — Complete Step by Step

---

### First Launch

User opens app. No registration. No paywall. No permission requests yet.

**Screen:**

Logo centered. Clean, minimal.

Tagline: *"Your AI stylist. Know what works for you."*

Single button: **"Let's start"**

Small text below: *"No account needed to begin"*

Nothing is requested from the device at this point. No location. No camera. No notifications. The user just taps and starts.

---

### Quiz Screen 1 — Wardrobe Type

**Heading:** *"What kind of clothes do you wear?"*

**Subheading:** *"This helps us show you the right outfits and products"*

Four large tap cards, each with icon and two lines of text:

- 👔 **Menswear** — *"Shirts, trousers, suits, sneakers"*
- 👗 **Womenswear** — *"Dresses, blouses, skirts, heels"*
- 🔄 **Both** — *"I wear from both categories"*
- ✦ **Unisex / Gender-neutral** — *"I prefer styles that aren't gendered"*

This is not a gender question. It determines which outfit templates, product categories, and body silhouette options to use throughout the app.

User taps one card. It highlights. Next button appears at bottom.

---

### Quiz Screen 2 — Main Pain Point

**Heading:** *"What's your biggest style challenge right now?"*

**Subheading:** *"Be honest — this shapes everything we tell you"*

Four large tap cards:

- 🛍 **"I don't know what to buy"** — *"I shop but nothing feels right"*
- 👚 **"I buy things but never wear them"** — *"My wardrobe is full but I feel stuck"*
- 🔀 **"I can't put outfits together"** — *"I have pieces but can't combine them"*
- ✨ **"I want a full style refresh"** — *"I'm ready to change my whole look"*

This answer personalizes the tone of the result page, the style summary paragraph, and all future recommendation copy.

---

### Quiz Screen 3 — Skin, Undertone, Hair, Eyes

**Heading:** *"Let's find your color type"*

**Subheading:** *"Choose the closest match to your natural coloring — not dyed or altered"*

All four sections on one scrollable screen. Continue button fixed at bottom, activates only when all four are answered.

---

**Section A — Skin tone**

*"Your skin tone"*

Six circles in a horizontal row. Each filled with a realistic skin tone color — not cartoon colors, not swatches from a paint store. Actual human skin tones photographically calibrated.

Under each circle, a small label:

⬤ **Very fair** — *porcelain, often pink or cool-toned*
⬤ **Fair** — *light beige, slightly warm or neutral*
⬤ **Medium** — *warm beige to light tan*
⬤ **Olive** — *yellow-green undertone, tans easily*
⬤ **Deep** — *rich brown tones*
⬤ **Very deep** — *deep espresso to ebony*

Tap a circle — it gets a white ring border to show selection.

---

**Section B — Undertone**

*"Look at the veins on the inside of your wrist in natural light. What color are they closest to?"*

Three circles with colors that represent how veins actually look:

⬤ **Blue or purple** — *cool undertone*
⬤ **Green** — *warm undertone*
⬤ **Blue-green mix** — *neutral undertone*

Text link below circles: *"Hard to tell"* — tappable, counts as neutral in algorithm.

Small helper text: *"Natural light works best — avoid checking under yellow indoor lighting"*

---

**Section C — Natural hair color**

*"Your natural hair color — not dyed"*

Eight circles with realistic hair colors. Each circle filled with the actual hair color, slightly textured to read as hair not flat paint:

⬤ **Black**
⬤ **Dark brown**
⬤ **Medium brown**
⬤ **Light brown**
⬤ **Warm blonde** — *golden, honey*
⬤ **Cool or ash blonde** — *beige, platinum*
⬤ **Auburn or red**
⬤ **Grey or white**

Small note: *"If you've always dyed your hair, choose the color closest to your natural brows"*

---

**Section D — Eye color**

*"Your eye color"*

Seven circles styled to look like a simplified iris — darker center ring fading to a lighter outer ring:

⬤ **Dark brown** — *very deep, almost black center*
⬤ **Brown** — *warm medium brown*
⬤ **Hazel** — *green-brown mix, shifts in light*
⬤ **Green**
⬤ **Blue-green** — *teal, seafoam*
⬤ **Blue**
⬤ **Grey**

---

### Quiz Screen 4 — Contrast and Sun Reaction

**Heading:** *"Two quick questions about how you naturally look"*

---

**Section A — Contrast**

*"How different are your hair and skin in tone?"*

Three tap cards with a small visual showing contrast levels — simple two-tone blocks, not photos of people:

- **High contrast** — *"Dark hair with light skin, or very light hair with dark skin"*
- **Medium contrast** — *"Some difference but not dramatic"*
- **Low contrast** — *"Hair and skin are close in tone — both light, or both deep"*

---

**Section B — Sun reaction**

*"How does your skin react to sun exposure?"*

Four tap cards:

- ☀️ **Burns quickly, barely tans** — *"I always need SPF, I rarely get color"*
- 🌤 **Burns first, then tans** — *"Takes time but I eventually tan"*
- 🌞 **Tans easily, rarely burns** — *"Sun doesn't bother me much"*
- 🏖 **Never burns, always tans** — *"My skin handles sun very well"*

---

### Quiz Screen 5 — Body and Size

**Heading:** *"Help us suggest the right cuts and silhouettes for you"*

**Subheading:** *"This stays completely private and only affects outfit suggestions"*

---

**Section A — Height**

*"Your height"*

Slider with live number display above it. Two-tap toggle top right: **cm** / **ft·in**

Range: 140cm to 210cm. Plus and minus buttons on either side of slider for precise adjustment.

---

**Section B — Weight**

*"Your weight"*

Same slider format. Toggle: **kg** / **lbs**

Range: 40kg to 160kg.

Below slider, small text in softer color: *"This is optional — body shape below works just as well"*

Tappable text: *"Skip weight"* — if tapped, slider disappears, field marked as skipped.

---

**Section C — Body shape**

*"Which silhouette is closest to yours?"*

Shown as clean minimal line-drawn icons — no photos, no illustrated faces, just simple body outline shapes. Five options for womenswear users, four for menswear, both sets shown for users who selected Both or Unisex.

**For womenswear:**

- **Rectangle** — *"Shoulders and hips similar width, less defined waist"*
- **Hourglass** — *"Shoulders and hips similar, clearly defined waist"*
- **Pear** — *"Hips noticeably wider than shoulders"*
- **Apple** — *"Fuller midsection, slimmer legs"*
- **Inverted triangle** — *"Shoulders wider than hips"*

**For menswear:**

- **Rectangle** — *"Even proportions top to bottom"*
- **Trapezoid** — *"Broader shoulders, narrower waist — V-shape"*
- **Oval** — *"Fuller midsection, slimmer limbs"*
- **Triangle** — *"Narrower shoulders, wider hips or thighs"*

Note pinned at bottom of screen in a soft card: *"We never use words like 'hide,' 'fix,' or 'problem area.' We focus only on what works beautifully for your shape."*

---

### Quiz Screen 6 — Style Preferences

**Heading:** *"Almost done — tell us about your style"*

---

**Section A — Style direction**

*"Pick up to 2 styles that feel like you"*

Six tap cards, multi-select up to 2. Already-selected cards show a checkmark. Third tap deselects rather than adding a third:

- **Minimalist** — *"Clean lines, quiet colors, nothing unnecessary"*
- **Classic** — *"Timeless pieces, quality fabrics, polished always"*
- **Streetwear** — *"Sneakers, oversized, bold, expressive"*
- **Romantic** — *"Soft fabrics, delicate details, feminine or dreamy"*
- **Office / Smart** — *"Structured, professional, put-together"*
- **Eclectic** — *"I mix everything and make it mine"*

---

**Section B — Occasions**

*"What do you dress for most? Select all that apply"*

Five tap chips, multi-select, no maximum:

- Work
- Everyday casual
- Dates
- Events and parties
- Everything equally

---

**Section C — Makeup**

*"Do you want makeup included in your recommendations?"*

Three tap cards:

- 💄 **Yes please** — *"Include lipstick, blush, foundation, eyeshadow tips"*
- 🙅 **No thanks** — *"Clothes and accessories only for me"*
- ✨ **Sometimes** — *"Mention it occasionally, keep it light"*

---

**Section D — Budget**

*"Your general shopping budget"*

Three tap cards:

- 💰 **Budget-friendly** — *"I love a good find, value matters"*
- 💳 **Mid-range** — *"I invest in pieces I'll wear for years"*
- 🏷 **No limit** — *"I buy what I love when I love it"*

---

### Quiz Screen 7 — Location and Climate

This is the first time any permission or personal data beyond answers is requested. The user now understands what the app does. The ask feels logical here, not invasive.

**Heading:** *"One last thing — where are you?"*

**Subheading:** *"We use this to match outfits to your local weather and season"*

**The app checks silently in this order:**

First — if user is signed in with Google or Apple, pull timezone and country from account. No ask needed. If this gives a specific enough city, skip the location ask entirely and just confirm: *"We think you're in [City] — is that right?"* with Yes / Change options.

Second — if no account or account only gives country, attempt IP-based city detection silently. If successful and reasonably precise, confirm with user.

Third — if neither works or gives only a country, then and only then show the location permission request:

*"Can we access your location for accurate weather?"*

Small text: *"Used only for outfit and weather suggestions. Never shared."*

Two buttons: **Allow location** / **I'll enter it myself**

If user taps Allow: system location popup appears. If granted — done. If denied — fall through to manual entry.

If user taps I'll enter it myself, or if location is denied:

Text search field appears: *"Enter your city"* with autocomplete. User types and selects. Done.

**Climate question only appears if location is fully unavailable — city not detected and user typed nothing:**

*"What's your climate like?"*

Three tap cards:

- 🌞 **Hot most of the year** — *"I rarely need heavy layers"*
- 🍂 **Four seasons** — *"Cold winters, warm summers"*
- ❄️ **Cold climate** — *"I layer a lot, winter is long"*

---

### Photo Decision Screen

Between quiz and result. Full screen. Not a popup. Not a small prompt.

**Heading:** *"I already know your color type."*

**Subheading:** *"Your answers gave me a strong picture. Want me to confirm it visually?"*

Two buttons — same size, same visual weight. Neither is the "obvious" choice:

📷 **"Upload a selfie"**
*"I'll compare your photo to your answers for a more accurate result"*
Tiny text below: *"Processed instantly. Never stored without your permission."*

✓ **"Get my result now"**
*"Continue without a photo — you can always add one later"*

Tiny text below both buttons: *"A selfie improves accuracy by about 10–15% on average"*

**If selfie uploaded:**

Loading: *"Reading your coloring..."*

AI extracts skin tone hex from cheek/forehead region, eye color from iris region, hair color from hair region. Converts to warm/cool/depth/clarity scores. Compares to quiz scores.

If match within 15% variance: *"Your photo confirms your answers — high confidence result"* — confidence shown as 91–95%

If conflict greater than 15%: *"Your answers suggest [Season A] but your photo looks closer to [Season B]. Which feels more accurate to you?"*

Two equal buttons: *"Go with [Season A] — my answers feel right"* / *"Go with [Season B] — the photo looks right"*

User decides. Always.

**If no photo:**

Goes straight to result. Confidence shown as 80–87% based on quiz alone. Option to add selfie later is always visible in profile.

---

### Result Page

Most important screen in the app. Scrollable. Must feel like it was written specifically for this person.

---

**Block 1 — Season reveal**

Large season name centered: **"Warm Autumn"**

Subtype if applicable: *"Deep Warm Autumn"*

Confidence indicator: *"84% match — based on your answers"* or *"93% match — confirmed by your selfie"*

One sentence underneath: *"You carry depth and warmth. Rich earth tones, golden metallics, and complex layered prints were made for you."*

---

**Block 2 — Your best colors**

Heading: *"Colors that work with you"*

Grid of 12–16 color circles, each with name below. Real color swatches, not described — shown:

Terracotta / Camel / Warm olive / Rust / Burnt orange / Deep teal / Warm ivory / Chocolate brown / Mustard / Forest green / Burgundy / Copper / Bronze / Warm tan / Brick red / Dark moss

Below grid: *"These work near your face — in tops, scarves, necklines, and makeup"*

---

**Block 3 — Colors to use carefully**

Heading: *"Colors that work against you"*

8–10 circles shown with a subtle muted treatment:

Icy pink / Cool grey / Bright white / Lavender / Neon yellow / Pastel blue / Silver / Cool black / Mint

Below: *"These pull cool or grey near your face. You can still wear them — just keep them in shoes, bags, or bottoms away from your neckline."*

---

**Block 4 — What this means in real life**

Heading: *"What this means for your wardrobe"*

Shown as clean rows — icon, category name, then two colored chip examples for yes and no:

👔 **Metals:** ⬤ Gold ⬤ Bronze — yes. ⬤ Silver ⬤ Rose gold — less ideal.

👖 **Denim:** ⬤ Dark indigo ⬤ Brown-toned — yes. ⬤ Light grey wash ⬤ Cool black — weaker.

🎨 **Neutrals:** ⬤ Warm beige ⬤ Camel ⬤ Warm white — yes. ⬤ Bright white ⬤ Cool grey — avoid near face.

💄 **Lipstick** *(only if user said yes to makeup)*: ⬤ Terracotta ⬤ Peach ⬤ Warm nude — yes. ⬤ Cool pink ⬤ Berry — no.

🖨 **Prints:** ⬤ Earth-toned ⬤ Warm geometric ⬤ Animal print — yes. ⬤ Cool pastels ⬤ Neon — avoid.

---

**Block 5 — Your style and body summary**

Heading: *"Your starting point"*

Paragraph personalized to pain point answer:

If *"I don't know what to buy"*: *"Start with 3 anchor pieces in your best neutrals — camel, warm ivory, and chocolate brown. Every piece you buy from here should connect to at least one of them. I'll guide you on every purchase."*

If *"I buy but never wear"*: *"Your wardrobe probably has pieces that don't talk to each other. The fix is a color anchor — a few core shades everything connects back to. Let's audit what you have and build from there."*

If *"Can't put outfits together"*: *"The issue is usually color temperature or proportion mismatch, not the clothes themselves. Once you add your wardrobe, I'll show you combinations you already own that you haven't tried yet."*

If *"Want a full refresh"*: *"You're starting with the most powerful tool — knowing your palette. Every piece you add from here will be intentional. Let's build something that feels completely like you."*

Body line added below based on shape: *"For your proportions, we'll lean into [specific cut direction] — you'll see this reflected in every outfit we build."*

---

**Block 6 — Weather and location context**

*(Only shown if location was detected or entered)*

*"Right now in [City]: [X]°C, [sunny / cloudy / humid / cold]. Your first outfit suggestions will reflect today's weather."*

---

**Bottom CTA:**

Large primary button: **"Scan your first item"**

Secondary text link: *"Or add wardrobe items to get outfit ideas →"*

---

## Home Screen — After Quiz Complete

Top bar: Season badge chip on left — *"Warm Autumn"* / Weather chip on right if location on — *"14°C Almaty ☀️"*

**Main button — center of screen, largest element:**

📷 **Scan Anything**
*"Clothes, outfits, makeup, or shopping finds"*

**Two cards below main button:**

🗂 **My Wardrobe** — *"0 items — add your first piece"*
✨ **My Outfits** — *"Add 5 wardrobe items to unlock"*

**Bottom navigation bar:**
Home / Wardrobe / Outfits / Saved / Profile

---

## Scan Anything — Complete Flow

---

**Screen 1 — Choose scan type**

*"What are you scanning?"*

Four large cards:

- 👕 **Clothing item** — *"A shirt, dress, jacket, shoes, or accessory"*
- 🧍 **Full outfit** — *"A complete look — mirror photo works great"*
- 💄 **Makeup product** — *"Lipstick, blush, foundation, eyeshadow"*
- 🛍 **Shopping find** — *"Something you found online and want to buy"*

---

**Screen 2 — Upload**

Camera icon center screen.

Two buttons: **Take photo** / **Upload from gallery**

Context tip below changes by scan type:

Clothing item: *"Flat lay or on a hanger. Natural light gives the most accurate color read."*
Full outfit: *"A mirror photo from head to toe works best."*
Makeup: *"Place it on a flat surface. Show the packaging or the actual shade."*
Shopping find: *"Screenshot the product page, including the color you're considering."*

---

**Screen 3 — Processing**

Subtle animation. Text cycles:
*"Reading colors..."*
*"Matching to your palette..."*
*"Building your verdict..."*

---

**Screen 4 — Result**

**Verdict badge — top center, large:**

🟢 **Works for you** — green
🟡 **Maybe — with adjustments** — amber
🔴 **Skip this one** — soft red

**Score:** *8.2 / 10*

**Why:**

For clothing: *"This camel coat sits perfectly in your warm palette. The golden-brown tone mirrors your undertone and adds depth without overwhelming."*

For outfit: *"The color harmony is strong — olive and camel are both in your palette and create a natural tonal look. The one thing pulling it down is the cool-grey bag — it breaks the warmth."*

For makeup: *"This lipstick's undertone is slightly too cool for you — it will read grey on your lips rather than flushed. You need a shade with a peach or brick base."*

For shopping find: *"Great color match. This rust shade is in your top palette tier. The silhouette is a relaxed blazer which adds shoulder width — works well for your frame. Verdict: buy this."*

**What to change — one specific action:**

Clothing: *"Nothing — wear it."* or *"Try a warm tan belt to anchor the waist."*
Outfit: *"Swap the grey bag for a cognac or tan leather bag. That one change ties the whole look together."*
Makeup: *"Look for shades described as 'brick,' 'terracotta,' or 'warm nude' instead."*
Shopping: *"Buy it — or if it also comes in terracotta, that shade would be even stronger."*

**Better color alternatives — 3 swatches with labels:**

⬤ Terracotta — *"perfect match"*
⬤ Warm rust — *"strong match"*
⬤ Brick red — *"good alternative"*

**For outfit scans additionally:**

Color harmony: 7/10
Best for: *"Casual day, weekend, relaxed date"*
Weather match: *(if location on)* *"Good for today's 18°C in Almaty"*
Priority fix: *"1. Bag — swap to warm tone. 2. Everything else — keep."*

**For shopping scans additionally:**

Palette match: 9/10
Style match: 8/10 — *"Fits your minimalist direction"*
Wardrobe compatibility: *"Works with 6 items you already own"*
Listed: *"Your camel trousers / Your olive coat / Your dark denim"*
Outfit previews: *"We built 3 looks with this — see them →"*
Verdict chip: **Buy** / **Skip** / **Buy in different color →**

**Actions:**

💾 **Save to Yes** / **Save to Maybe** / **Save to No**
📤 **Share this result**
🔄 **Scan something else**

**Accuracy prompt at bottom:**

*"Does this feel accurate?"*
✓ Yes / ✗ No / 〰 Not sure

If No: *"What was off?"*
— Too strict / Too lenient / Wrong color read / Doesn't match my style

---

## Wardrobe — Complete Flow

**Entry screen — empty state:**

Illustration of minimal wardrobe outline.

*"Your wardrobe is empty"*

*"Add 5 favorite pieces and I'll start building outfits for you — no need to photograph everything at once."*

Button: **"Add first item"**

**Entry screen — items exist:**

Grid of item cards filtered by: All / Tops / Bottoms / Shoes / Outerwear / Accessories

Each card: photo, color chip, category label, palette match badge — ✓ Great match / ⚠ Use carefully

---

**Add item flow:**

Screen 1: Take photo / Upload from gallery

Tip: *"Lay it flat or hang it. Natural light gives the most accurate color read."*

Screen 2 — AI fills card:

All fields shown with detected values and an edit pencil on every single one:

Category: Top ✏️
Color: Warm terracotta ✏️
Pattern: Solid ✏️
Material feel: Lightweight knit ✏️
Formality: Smart casual ✏️
Season: Spring, Autumn ✏️
Palette match: ✓ Strong match for Warm Autumn ✏️

Note at top: *"Does this look right? Tap any field to correct it — your edit always wins."*

Save button: **"Add to wardrobe"**

---

## Avatar Setup

Triggered first time user enters wardrobe section.

**Screen 1:**

*"Let's build your style avatar"*

*"Your clothes will appear on a figure that matches your proportions."*

Button: **"Set up my avatar"**
Link below: *"Skip for now"*

**Screen 2 — Silhouette:**

Shows a pre-built silhouette based on body shape already collected in quiz. User sees it and confirms or adjusts.

*"This is your starting silhouette — does it look right?"*

Sliders below illustration: Height / Build

**"Looks right"** / **"Adjust it"**

**Screen 3 — Optional photo:**

*"Want your avatar to look more like you?"*

*"Upload one photo and we'll match your skin tone and hair color to the figure."*

**"Upload photo"** / *"Skip — the silhouette is enough"*

Privacy note: *"Used only to style your avatar. Never shared or stored without your permission."*

**Result:**

Avatar shown with skin tone and hair color approximated. First wardrobe item draped on it.

*"Your wardrobe is taking shape. Add more pieces to unlock outfit suggestions."*

---

## Outfit Builder — Complete Flow

**Screen 1 — Occasion:**

*"What are you dressing for?"*

Eight tap cards:

- ☕ **Casual day** — *"Errands, friends, weekend outings"*
- 💼 **Work** — *"Office or professional setting"*
- 🌹 **Date** — *"Dinner, drinks, something special"*
- 🎉 **Party or event** — *"Celebrations and nights out"*
- 💍 **Wedding guest** — *"Dressy but not the bride or groom"*
- ✈️ **Travel** — *"Comfortable but put-together"*
- ❄️ **Cold weather** — *"Layers that still look good"*
- ☀️ **Hot weather** — *"Light, easy, and cool"*

**Screen 2 — Loading:**

*"Building outfits from your wardrobe..."*

Pre-generated in background so loads in under 2 seconds.

**Screen 3 — Outfit on avatar:**

Full avatar with outfit assembled.

Item list below avatar: Top — Dark olive knit / Bottom — Wide camel trousers / Shoes — Tan leather loafers

*"Why it works: Warm tones throughout. Olive and camel are both in your palette and create a tonal look with natural contrast. No single item fights the others."*

Occasion match: ✓ *"Perfect for casual day"*
Weather match *(if location on)*: ✓ *"Good for 18°C in Almaty today"*
Palette score: 9/10

**Controls row:**

🔒 Lock top / 🔒 Lock bottom / 🔒 Lock shoes
🔄 Swap top / 🔄 Swap bottom / 🔄 Swap shoes
✨ Regenerate full outfit

**Bottom:**

💾 **Save this outfit**
📤 **Share**
✅ **Mark as worn today**

---

## Shopping Scanner — Complete Flow

Entry from Scan Anything → Shopping find, or button inside wardrobe: *"Thinking of buying something new?"*

**Upload screen:**

*"Upload a screenshot or photo of something you're considering buying"*

Supported source chips shown: ASOS / Zara / H&M / Sephora / Amazon / Any store

**Result:**

Verdict badge: 🟢 **Buy this** / 🟡 **Buy in a different color** / 🔴 **Skip this**

Palette match: 9/10 — *"This rust shade is one of your strongest colors"*
Style match: 8/10 — *"Fits your minimalist direction"*
Silhouette match: 7/10 — *"The oversized cut adds shoulder width — works well for your frame"*
Wardrobe compatibility: *"Works with 8 items you already own"*

Items listed: *"Your camel trousers / Your dark denim / Your olive coat / Your white sneakers..."*

Three outfits shown as small avatar previews. Tap any to expand.

Better color alternatives *(if applicable)*:
*"This also comes in terracotta and burgundy — both stronger for your palette"*
Swatches shown: ⬤ Terracotta ⬤ Burgundy

Actions: 💾 Save to wishlist / 🔗 Open original link / 🔄 Scan another

---

## Saved Verdicts — Complete Flow

Three tabs: ✓ **Yes** / 〰 **Maybe** / ✗ **No**

Each item card:

Photo thumbnail / Category chip: Top / Outfit / Makeup / Shopping / Score: 8.4 / Short verdict: *"Strong palette match"* / Date: *"Scanned June 12"*

Tap to reopen full result.
Long press: Move tab / Delete / Add note

Notes field: *"Tried this on — runs small"* or *"Bought it in terracotta instead"*

---

## Wardrobe Audit — Stage 3 Feature

Unlocks at 10+ items. Shown as a locked card in wardrobe until threshold reached.

*"Add [X] more items to unlock your full wardrobe audit"*

**Audit result:**

*"Your wardrobe is predominantly warm and deep — which fits your Warm Autumn profile well."*

Best items — listed with versatility score: *"Your camel coat appears in 12 of your 18 possible outfit combinations. It's your most valuable piece."*

Friction items — *"This cool-toned grey blazer clashes with 80% of your wardrobe. Here's how to style it anyway: pair only with your dark denim and black accessories to isolate the cool tone."*

Color gaps — *"You're missing a warm neutral bottom. Adding one dark olive or brown trouser would connect 9 of your current pieces instantly."*

Next 3 pieces to buy — specific and color-described: *"1. Warm neutral bottom in camel or dark olive. 2. A rust or terracotta knit top. 3. Tan leather shoes or boots."*

Versatility score visible on every wardrobe item after audit runs.

---

## Makeup Bag Audit — Stage 3 Feature

User uploads photos of makeup products.

Each product evaluated:

✓ **Keep** — *"This terracotta blush is a perfect match for your warm undertone and autumn depth"*

🔄 **Use differently** — *"This cool-pink blush is too stark near your face. Use it very lightly as a diffused temple contour instead of a cheek color"*

↩ **Replace** — *"This foundation has a cool pink base which will pull grey against your warm skin. Look for foundations described as 'warm beige,' 'golden,' or 'neutral warm' in your depth range"*

Summary at end: *"Your makeup bag is 60% cool-toned and 40% warm — the reverse of what works best for you. Prioritize replacing your foundation and lipstick first — those have the biggest impact near your face."*

---

## Occasion Outfit Builder — Stage 3 Feature

Natural language input: *"Tell me about the occasion"*

*"My friend's outdoor wedding in June in Tbilisi, semi-formal, I want to wear a dress, prefer not to wear heels"*

Or structured input:
Occasion type / Formality level / Season / Location / Any items you want to include

AI builds complete look with full rationale:

*"For a semi-formal outdoor wedding in warm weather, here's your look from your wardrobe:"*

Dress: *"Your floral midi in warm tones — garden setting, June warmth, and semi-formal all match"*
Shoes: *"Your flat tan sandals — garden terrain, no heels as requested, warm tone carries the palette"*
Bag: *"Your cognac clutch — small, dressy enough, stays in your warm palette"*
Jewelry note: *"Gold — always for Warm Autumn at any formality level"*

If wardrobe lacks pieces: *"You don't have a suitable dress yet. For this occasion look for: midi length, warm-toned floral or solid in terracotta / olive / warm burgundy, light fabric for June heat."*

---

## Weekly Planner — Stage 4 Feature

AI pre-builds 7 outfits for the coming week.

Inputs used: 7-day weather forecast for user's city / occasions user optionally enters for each day / items marked as worn in last 14 days / color palette and style direction

Shown as a weekly calendar. Each day: outfit thumbnail on avatar, weather chip, occasion label.

User can: edit any day / swap individual items / mark day as confirmed / mark as worn when the day arrives

Push notification: *"Good morning. It's 14°C and sunny in Almaty. Here's what we suggest today →"* — one tap opens the day's outfit.

---

## Live Camera — Stage 4 Feature

Toggle inside Scan Anything: **Upload photo** / **Use live camera**

User points camera at item. Verdict updates every 2–3 seconds as camera steadies.

Same result format as regular scan — verdict badge, score, reason, alternatives.

Most powerful use case: standing in a store, pointing at items on a rack, getting instant yes / no without buying and returning.

---

## Profile and Settings

**My color profile:**

Season badge — Warm Autumn
Confidence: 84% / 93%
Best colors grid — all swatches
Colors to avoid grid
Button: *"Retake quiz"*
Button: *"Update my selfie"*

**My measurements:**

Height / Weight / Body shape — all editable, changes re-run silhouette algorithm

**My style preferences:**

Wardrobe type / Style direction / Occasions / Makeup / Budget / City — all editable

**Notifications:**

Daily outfit suggestion: on/off — time selector
Weekly wardrobe tip: on/off
New features: on/off

**Privacy:**

*"Photos you scan are processed and not stored unless you save them to your wardrobe."*
*"Your color profile and preferences are stored in your account to power your recommendations."*

Button: **Delete all my data**

**Subscription:**

Free: *"7 of 10 monthly scans used"*

Button: **"Upgrade to StyleWise Pro"**

Pro includes:
Unlimited scans / Unlimited wardrobe items / Unlimited outfit builder / Full wardrobe audit / Makeup bag audit / Occasion outfit builder / Weekly planner / Live camera / Priority AI — faster results / Early feature access

---

## Tone and Language Rules — Applied Everywhere

Never use: hide / fix / correct / minimize / flatter / disguise / problem area / unflattering / avoid this shape

Always use: works for / suits / complements / brings out / balances / highlights / pairs well with / works beautifully for

Every rejection includes a rescue. Never just *"skip this."* Always *"skip this — but here's what would work instead, and here's the closest color that would."*

Every result is specific. Never *"warm tones work for you."* Always *"this specific shade of rust at this depth level works because your undertone and the color's base are aligned — there's no temperature clash near your face."*

Confidence without pressure. *"This is a strong match"* — not *"you must wear this."* User always has final say.