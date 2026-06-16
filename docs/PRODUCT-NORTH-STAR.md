# PaletteMe Product North Star

Date: 2026-06-13
Status: current strategy memory

## One-Line Direction

PaletteMe should become an AI style assistant that tells a person what to wear, what to buy, what to skip, and how to use what they already own.

The product is not only a color analysis quiz. Color analysis is the entry point. The durable product is a personal style operating system built around colors, body/fit goals, wardrobe, shopping, and makeup.

## Current Goal

Run the product fully free while testing accuracy and usefulness.

Deployment note, 2026-06-15: scan entry points are temporarily paused behind `NEXT_PUBLIC_SCAN_FEATURE_ENABLED` so the app can deploy with the color report while item/outfit scan accuracy is polished.

The short-term goal is not payment optimization. The short-term goal is learning:

- Are the quiz results believable?
- Are selfie/photo results accurate enough?
- Do users trust the outfit, wardrobe, and makeup verdicts?
- Which scan types feel valuable enough to become paid later?
- Can the app help users make real clothing and makeup decisions fast?

Payments can return later, but only after the core experience is accurate and useful.

## Target Users

PaletteMe must support style-conscious people, not only women.

The app should work for:

- women, men, and nonbinary users
- users who shop womenswear, menswear, both, or unisex
- different body sizes, heights, ages, and skin tones
- users who wear makeup and users who do not
- users who know style theory and users who know nothing about what suits them

Do not assume makeup, womenswear, thin bodies, young users, or feminine style by default.

## Product Promise

The user should be able to ask:

- Does this color suit me?
- Does this outfit work?
- Does this makeup shade fit my undertone?
- Should I buy this item?
- Can I wear this with clothes I already own?
- What outfits can I make from my wardrobe?

PaletteMe should answer with a practical verdict, not vague inspiration.

## Core Principles

### 1. Accuracy Before Monetization

The AI must be accurate enough that users trust it. If the app is unsure, it should say so and ask for better input instead of pretending.

Every AI result should include:

- verdict
- confidence
- reason
- what to change
- optional feedback button

### 2. Ask Facts, Not Self-Diagnosis

Users come here because they do not know what looks good on them.

Do not ask:

- Which colors suit you?
- Are you high contrast?
- Are you warm or cool?
- Do you look better in white or cream?

Ask observable facts instead:

- natural hair color
- eye color
- skin reaction to sun
- foundation shade problems
- height
- body shape by visual cards
- what they want help with

PaletteMe does the interpretation.

### 3. Photo Is Optional, Not a Blocker

Many users will not upload a selfie immediately.

The flow should be:

1. quiz-first result in about 60 seconds
2. result shown without requiring a photo
3. optional selfie upload for higher accuracy
4. optional item/outfit/makeup scans after trust is created

### 4. Never Punish the User's Wardrobe

Competitor reviews show a major failure mode: the AI rejects most of a user's uploaded clothes because they do not match a narrow palette.

PaletteMe should not behave like that.

Verdicts should be practical:

- great near your face
- works away from your face
- needs balancing
- not ideal, but here is how to style it
- skip buying this, better alternatives exist

Do not simply say "this does not fit your palette" unless the app also explains what to do.

### 5. User Control Beats AI Autopilot

Every AI-generated wardrobe item and outfit must be editable.

Users need to be able to:

- correct item category
- correct color
- correct gender/shopping category
- correct formality
- lock an item in an outfit
- swap only one item
- manually add an item
- save or reject a generated outfit

Bad outfit generation without manual control destroys trust.

### 6. Inclusive Styling By Design

The app must avoid diversity and sizing failures.

Requirements:

- ask shopping preference: menswear, womenswear, both, unisex
- include body-size and height diversity in examples
- support plus-size and extended-size filters later
- make makeup optional
- avoid women-only testimonials and copy
- avoid borrowed reviews from other apps

Until there is real PaletteMe beta feedback, use product demos instead of reviews.

### 7. Mobile First

The quiz and scan flows must feel good on a phone.

Rules:

- one question per screen
- large tap targets
- visible question count
- progress bar
- short text
- multi-select only when it reduces friction
- motivation screens every few questions
- final choice: upload selfie for accuracy or show result now

## Recommended Quiz Flow

Intro screen does not count.

1. Age
2. What do you want help with? colors, makeup, outfits, shopping, style, fit, not sure
3. Natural hair color
4. Current hair: natural, dyed, highlighted, partly natural
5. Eye color
6. Skin reaction to sun
7. Foundation issue
8. Height
9. Body type, chosen from visual cards
10. What do you want outfits to help with?
11. Optional: anything you prefer to style around?
12. Style direction, image choices
13. Final choice: upload selfie for higher accuracy or show result now

The first result should include:

- likely color season and sub-season
- confidence
- best colors
- colors to be careful with
- makeup guidance if relevant
- hair guidance
- jewelry metals
- fit direction
- style direction
- shopping rules
- next actions

## Killer Feature Roadmap

### Scan Anything

One universal scan entry point:

- clothing item
- outfit
- makeup
- product screenshot

The result should include:

- works / maybe / skip
- score
- reason
- what to change
- better color alternatives
- save result

### Wardrobe Matchmaker

Users add a small wardrobe first, not their entire closet.

Start with:

- add 5-10 favorite pieces
- AI labels each item
- user can correct labels
- app builds outfits from those items

Later:

- larger wardrobe import
- batch upload
- closet color audit
- missing wardrobe basics

### Buy-With-My-Closet

User uploads a product screenshot or link.

PaletteMe answers:

- buy, maybe, or skip
- whether the color fits
- whether it fits body/style goals
- whether it works with the user's saved wardrobe
- 3 outfit ideas using owned items
- better alternatives if needed

### Makeup Scanner

User uploads a lipstick, blush, foundation, eyeshadow, or product screenshot.

PaletteMe answers:

- fits undertone or not
- too warm, too cool, too bright, or too muted
- everyday/evening/avoid usage
- better shade families
- how it pairs with the user's clothing colors

## Naming Direction

PaletteMe may become too narrow if the product expands beyond color.

Name candidates:

- WearWise
- LookWise
- StyleWise
- StyleMap
- FitHue
- ChromaFit
- OutfitWise
- StylePilot

Best current candidates: WearWise or LookWise.

Do not rename until the product scope is final. If the app stays color-first, PaletteMe can work. If wardrobe, shopping, makeup, and menswear become central, a broader name is probably better.

## Implementation Principles

Build fast, but in a scalable shape.

- Keep AI calls server-side.
- Use structured schemas for AI outputs.
- Store user-corrected labels, not just AI guesses.
- Treat user corrections as more trusted than AI labels.
- Make scan types share one core verdict model.
- Keep result cards reusable across clothing, makeup, outfit, and product scans.
- Keep all image upload flows mobile-first.
- Build feedback capture from day one.
- Prefer small useful flows over a huge wardrobe platform too early.

## What To Avoid

- Requiring selfie upload before showing value.
- Asking users to diagnose their own color season.
- Rejecting most user clothes.
- Generating outfits without item-level controls.
- Women-only product language.
- Thin-only or young-only examples.
- Borrowed reviews or screenshots from competitor apps.
- Long quiz funnels that delay the first result.
- Vague "AI stylist" copy without practical verdicts.
