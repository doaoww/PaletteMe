# PaletteMe Real-Photo Wardrobe Avatar Design

Date: 2026-06-14
Status: ready for user review

## Decision Summary

PaletteMe will add a wardrobe outfit planner built around a real-person avatar preview.

The selected direction is:

- Use a real full-body user photo as the avatar anchor.
- Start with 10 favorite wardrobe pieces, not a full closet import.
- Let users add more items and batch upload later.
- Show outfit combinations on or around the user's real photo.
- Make the preview look person-like and personal.
- Do not promise exact photoreal virtual try-on, fabric drape, size fit, or garment replacement in v1.
- Give practical outfit verdicts: `wear it`, `balance it`, or `swap one item`.
- Let users correct every AI-generated wardrobe label.

This feature should feel like: "I can see myself planning this outfit before I go out."

## Why Not Full Photoreal Try-On First

Full outfit try-on is improving, but it remains hard to make reliable for real users. Recent research still highlights unsolved issues around full outfit layering, styling, fit accuracy, and artifacts:

- Garments2Look notes that outfit-level virtual try-on still struggles with complete outfits, layering, styling, and artifacts: https://arxiv.org/abs/2603.14153
- FIT focuses specifically on fit-aware try-on because current methods often overlook whether garments actually fit different bodies: https://arxiv.org/abs/2604.08526

PaletteMe should avoid losing trust by pretending the preview is a perfect mirror. The v1 promise is outfit planning and styling judgement, not exact digital tailoring.

## Product Goal

Help users decide what to wear from clothes they already own.

The first valuable loop is:

1. Upload a full-body avatar photo.
2. Add 5 to 10 favorite clothing items.
3. Build one outfit.
4. See it as a real-person outfit preview.
5. Get a practical verdict.
6. Save or swap.

The user should not need to upload their entire closet before getting value.

## User Promise

The feature should answer:

- Does this outfit work together?
- Does it work with my colors?
- Does it match the occasion?
- What one thing should I swap?
- Can I save this for going out?

It should not claim:

- Exact fabric drape.
- Exact size or fit.
- Perfect photoreal clothing replacement.
- Guaranteed real-world tailoring accuracy.

## Entry Points

This feature should be reachable from:

- Daily stylist home, through the `wardrobe` module.
- `scan outfit`, after a scan result suggests saving or matching with owned items.
- Future `/wardrobe` surface.
- Future `/outfits` surface.

The daily home should not force wardrobe setup. It should invite it when useful.

## First-Time Flow

### Step 1: Avatar Photo

Ask for a full-body mirror photo.

Guidance should be short:

- Stand facing the camera.
- Use good light.
- Keep your full outfit visible.
- Plain background helps.

Approved privacy copy must be used:

> Photos are processed securely for analysis. PaletteMe does not sell or share your images.

If avatar photo is skipped:

- User can still add wardrobe items.
- User sees an outfit board instead of the real-person preview.
- The app can ask again later before showing avatar preview.

### Step 2: Add 10 Favorite Pieces

Ask for 5 to 10 favorite owned items first.

Supported upload modes:

- One item photo.
- Multiple item photos.
- Manual item entry.

Do not ask for the full closet in v1.

### Step 3: AI Labels

For each item, AI should label:

- Name.
- Category.
- Role: top, bottom, dress, outerwear, shoe, accessory, bag, jewelry, makeup optional later.
- Colors.
- Color temperature.
- Season fit.
- Formality.
- Pattern if visible.
- Material if visible.
- Notes.

Existing schema fields already cover core v1 labels:

- `name`
- `category`
- `colors`
- `colorTemperature`
- `seasonFit`
- `formality`
- `notes`
- `imageUrl`
- `correctedByUser`

Future metadata can add role, pattern, material, fit, layer weight, and occasion tags.

### Step 4: User Corrections

Each item must be editable.

Users can correct:

- Category.
- Color.
- Formality.
- Season fit.
- Item name.
- Notes.

User corrections must override AI guesses.

### Step 5: Build Outfit

The outfit builder uses slots:

- Top.
- Bottom.
- Dress or full-body.
- Outerwear.
- Shoes.
- Accessories.

Controls:

- Add item.
- Remove item.
- Lock item.
- Swap item.
- Save outfit.

The builder should use only saved wardrobe item IDs. It must not invent owned clothes.

### Step 6: Preview

The preview must look like a person because it uses the user's real full-body photo as the base.

V1 preview should combine:

- Centered user photo.
- Selected item thumbnails or simplified visual layers aligned to body zones.
- Outfit board strip below or beside the person.
- Verdict card.

The UI should clearly communicate that this is an outfit preview, not exact try-on.

Good language:

- `preview outfit`
- `plan look`
- `see the combination`

Avoid language:

- `exact try-on`
- `perfect fit`
- `see exactly how it will look`

## Returning User Flow

1. User opens wardrobe or outfits.
2. Saved avatar photo appears as the planning anchor.
3. User chooses an occasion or goal.
4. App suggests outfits from saved items.
5. User locks, swaps, or removes items.
6. App updates the verdict.
7. User saves the outfit.

Occasion prompts should stay simple:

- Everyday.
- Work.
- Dinner.
- Event.
- Travel.
- Date.
- Custom.

## Verdict Model

Outfit verdicts should be practical and kind.

Primary verdict labels:

- `wear it`
- `balance it`
- `swap one item`
- `unclear`

Each verdict includes:

- Score from 0 to 100.
- Confidence from 0 to 100.
- One reason.
- One next action.
- Optional swap suggestion.

Judgement dimensions:

- Color harmony with the user's season.
- Contrast and depth.
- Occasion fit.
- Formality consistency.
- Silhouette and proportion direction.
- Weather or comfort if provided.
- Whether the item is near the face.

PaletteMe should not reject most clothes. It should explain how to balance, move, layer, or swap them.

## Technical Shape

This feature extends existing foundations:

- `/api/wardrobe` for item list, save, and corrections.
- `lib/server/wardrobe.ts` for persisted wardrobe storage with local fallback.
- `/api/outfits` for async outfit plan generation.
- `lib/server/ai/prompts.ts` for outfit prompt generation.
- `lib/server/ai/schemas.ts` for `WardrobeItemSchema` and `OutfitPlanSchema`.
- `/api/ai/scan` for image scan analysis and scan history.

Likely additions:

- Avatar profile storage.
- Avatar photo upload handling.
- Wardrobe item image upload UI.
- Outfit preview component.
- Outfit save history.
- Friendly avatar photo quality messages.

## Data Model Additions

### Avatar Profile

Suggested fields:

- `id`
- `userId`
- `photoUrl`
- `thumbnailUrl`
- `photoQuality`
- `createdAt`
- `updatedAt`

Optional future fields:

- `heightBand`
- `bodyShape`
- `poseNotes`
- `bodyZones`
- `landmarkStatus`

Do not require sensitive measurements in v1.

### Wardrobe Item Extensions

Current wardrobe item fields should stay compatible.

Suggested future extensions:

- `role`
- `subCategory`
- `pattern`
- `material`
- `layerWeight`
- `occasionTags`
- `wearZone`
- `thumbnailUrl`
- `labelConfidence`

### Outfit Save

Suggested fields:

- `id`
- `userId`
- `title`
- `occasion`
- `itemIds`
- `lockedItemIds`
- `verdict`
- `score`
- `confidence`
- `reason`
- `nextAction`
- `createdAt`
- `updatedAt`

## UI Components

Likely components:

- `WardrobeOnboarding`
- `AvatarPhotoStep`
- `WardrobeUploadStep`
- `WardrobeItemCard`
- `WardrobeItemEditor`
- `OutfitBuilder`
- `OutfitSlot`
- `RealPhotoAvatarPreview`
- `OutfitVerdictCard`
- `OutfitSavePrompt`

These should follow the native daily stylist UI direction:

- DM Sans for product UI.
- DM Serif Display only for major headings.
- Soft pink only as accent in product surfaces.
- Mobile-first layout.
- Desktop side rail and workspace.

## Privacy And Auth

Avatar photo and wardrobe persistence should use progressive auth:

- User can try the flow locally during free testing.
- Saving avatar photo, wardrobe, or outfits should prompt login.
- Login prompt should explain the benefit: save your wardrobe and outfits across devices.

Approved privacy copy:

> Photos are processed securely for analysis. PaletteMe does not sell or share your images.

Do not say photos never leave the device.

## Error Handling

No raw technical errors should be shown to users.

Friendly examples:

- `This photo is hard to use. Try a full-body mirror photo in brighter light.`
- `We could not save this item yet. Sign in and try again.`
- `This item was uploaded, but the label may be wrong. You can edit it.`
- `Outfit planning needs at least 2 wardrobe items. Add one more piece.`

Provider errors, Supabase errors, stack traces, JSON, and route names must stay out of the UI.

## Scope

In scope for the first implementation plan:

- Real-photo avatar setup flow.
- 5 to 10 item wardrobe onboarding.
- Item upload or manual item entry.
- AI labeling and user correction UI.
- Outfit builder using saved wardrobe items.
- Real-person outfit preview, clearly labeled as a planner.
- Practical outfit verdicts.
- Save prompt with progressive auth.

Out of scope for v1:

- Full closet import requirement.
- Exact photoreal try-on.
- Body measurement capture.
- Garment size prediction.
- Cloth simulation.
- Marketplace shopping recommendations.
- Weather integration unless simple manual occasion text already exists.

## Testing And Verification

Implementation should verify:

- User can finish wardrobe onboarding with fewer than 10 items.
- User can skip avatar photo and still use outfit board.
- Avatar preview appears only when a usable avatar photo exists.
- User corrections persist and override AI labels.
- `/api/outfits` does not run with fewer than 2 wardrobe items.
- Outfit builder does not invent item IDs.
- User-facing errors are friendly.
- Mobile layout keeps actions visible above tabs.
- Desktop layout uses workspace, not stretched mobile cards.

## Spec Self-Review

- Scope is focused on real-photo anchored avatar v1.
- Full photoreal try-on is explicitly out of scope.
- The preview still looks like a person because the user's real photo is the base.
- First wardrobe setup starts with 5 to 10 favorite pieces.
- Existing `/api/wardrobe` and `/api/outfits` foundations are reused.
- Auth and photo privacy rules match project docs.
- User corrections remain more trusted than AI labels.
