# PaletteMe Native Daily Stylist UI Design

Date: 2026-06-14
Status: approved for implementation planning

## Decision Summary

PaletteMe will move toward an app-first daily stylist experience.

The selected direction is:

- Landing keeps the soft original pink PaletteMe identity.
- Original fonts stay in place.
- Returning users see a native-feeling daily stylist home.
- `scan outfit` is the main action after a user has a color result.
- Mobile uses bottom tabs: `home`, `scan`, `saved`, `profile`.
- Desktop uses the same destinations in a side rail with a larger workspace.
- Auth stays progressive. Users can get a result before signing in.
- Raw provider, Supabase, or system errors must not be shown directly to users.

## Product Goal

Make PaletteMe feel simple, modern, and useful within the first few seconds. The user should always know what to do next:

1. Start the quiz.
2. Get a result.
3. Scan an outfit or item.
4. Save or correct the result when useful.

The interface should be low-text, visual, and native-feeling on mobile while still giving desktop users a proper workspace.

## Design Sources

This spec follows the local product and style sources:

- `AGENTS.md`
- `PRODUCT.md`
- `docs/PRODUCT-NORTH-STAR.md`
- `docs/PRODUCT-SPEC.md`
- `docs/systems/free-testing-mode/README.md`
- `design/PaletteMe-style-guide.md`

Navigation pattern references:

- Apple Human Interface Guidelines, tab bars: https://developer.apple.com/design/human-interface-guidelines/tab-bars
- Material Design 3, navigation bar: https://m3.material.io/components/navigation-bar/guidelines

## Visual System

### Fonts

Keep the existing PaletteMe font system:

- DM Serif Display, weight 400 only, for major marketing and result headings.
- DM Sans for body, buttons, labels, nav, quiz UI, cards, and all product controls.
- Allura only for rare decorative flourish spans on brand surfaces. Do not use Allura in product labels or app navigation.

### Color

Landing should use the soft original pink direction:

- Preserve the existing dreamy pink and lilac gradient identity.
- Avoid the harsh full red-pink block from the draft mockup.
- Use ink for primary text and deep pink or ink for primary buttons.
- Keep product surfaces calmer: cream, white, blush, ink, and limited accent pink.

Product screens should be restrained:

- Pink marks primary actions, selected state, and important highlights.
- Neutral surfaces carry most of the app UI.
- Actual palettes and product swatches can use their true colors.
- Avoid purple-blue AI gradients and decorative color fields inside task screens.

### Shape And Density

- Use familiar app card geometry with stable sizes.
- Keep cards at practical radii, usually 12px to 18px.
- Use pill buttons only for primary actions, tabs, chips, and compact filters.
- Avoid nested cards.
- Favor compact visual modules over long text blocks.

## Information Architecture

### Public Flow

The public flow is:

```text
Landing
  -> Quiz
  -> Fast result
  -> Daily stylist home
```

Landing should contain:

- Small PaletteMe wordmark.
- One short headline.
- One short supporting line.
- One primary `start quiz` action.
- A visual app/result preview.

Landing should not contain long educational sections above the first action.

### App Destinations

Mobile bottom tabs:

- `home`: daily stylist home and recent activity.
- `scan`: camera/upload entry for outfit, clothing, product, and makeup scans.
- `saved`: saved scans, saved products, and future wardrobe items.
- `profile`: color result, palette, account, and sign out.

Desktop side rail:

- Same destinations as mobile.
- Larger content area for scan queue, saved items, and profile details.
- Right insight panel when useful, such as current season, palette, or account state.

## Core User Flow

### New User

1. User lands on the soft pink homepage.
2. User taps `start quiz`.
3. Quiz shows one focused decision at a time.
4. User can add selfie analysis through the canonical `/quiz` flow.
5. User receives a fast result.
6. Result page leads into daily stylist home.
7. Save prompts can ask for login, but only after the result exists.

### Returning User With Result

1. User opens the app.
2. User sees daily stylist home.
3. The first visual element is the season card with palette.
4. The main action is `scan outfit`.
5. Smaller modules show makeup, wardrobe, product, and profile.
6. Recent scans appear below the main modules.

### User Without Result

If the app cannot find a color result:

- Show a short empty state.
- Primary action: `start quiz`.
- Secondary action: `sign in` only if restore is relevant.

Do not make a blank dashboard.

## Screen Design

### Landing

Landing should preserve the original soft pink identity but reduce copy.

Required structure:

- Top bar with PaletteMe wordmark and one start action.
- Soft pink gradient hero.
- Serif headline, short and direct.
- One supporting line, no paragraph wall.
- Primary `start quiz` button.
- App preview showing a season card or scan action.

Tone:

- Modern and visual.
- Fewer claims.
- No long feature explanation above the fold.

### Quiz

Quiz should feel like a native step flow:

- One prompt per screen.
- Large tappable options.
- Clear progress indicator.
- Back action.
- Stable bottom action area on mobile.
- Selfie capture remains in `components/selfie/selfie-capture.tsx`.

Do not add another selfie upload surface outside `/quiz`.

### Fast Result

The result screen should show:

- Season name.
- Palette swatches.
- Confidence and closest alternative only when useful.
- One practical next action.
- `scan outfit` as the preferred continuation.

Long explanations should be collapsed or placed below the primary visual result.

### Daily Stylist Home

Mobile structure:

1. Top app bar with wordmark and profile/menu affordance.
2. Season card with palette.
3. Large `scan outfit` action.
4. Two by two module grid: makeup, wardrobe, product, profile.
5. Recent scans.
6. Bottom tabs.

Desktop structure:

1. Side rail navigation.
2. Main workspace with season card and scan queue.
3. `scan item` or `scan outfit` primary action.
4. Right insight panel for profile, palette, saved state, or account status.

### Scan

Scan entry should support:

- Outfit.
- Clothing item.
- Product.
- Makeup.

Scan results should show:

- Visual preview.
- Clear verdict.
- Short reason.
- Practical next action.
- Editable AI labels.

Do not reject most user clothes. Explain how to use, balance, or replace the item.

### Saved

Saved should collect:

- Saved scans.
- Saved products.
- Future wardrobe items.

Empty state:

- Show a short sentence.
- Primary action: `scan outfit`.

### Profile

Profile should include:

- Season and palette.
- Account state.
- Sign in or sign out.
- Saved profile controls.
- Future report and Pro areas when payments return.

Auth should feel like a utility, not a gate before the first result.

## User-Facing Errors

No raw technical errors should be shown to users.

Error copy should follow this pattern:

- What happened in plain language.
- What the user can do next.
- Optional retry action.

Examples:

- `We could not save this yet. Sign in and try again.`
- `This photo is hard to read. Try a brighter front-facing photo.`
- `The scan did not finish. Try again with the item fully visible.`

Do not display raw Supabase messages, provider stack traces, JSON, or internal route names in the UI.

## Components

Likely components for implementation:

- `AppShell`
- `MobileTabBar`
- `DesktopSideRail`
- `SeasonSummaryCard`
- `PrimaryScanAction`
- `StyleModuleGrid`
- `RecentScanList`
- `FriendlyError`
- `SavePrompt`

Existing components should be reused where possible. Do not introduce a second design system.

## Data And State

Use existing local and server data paths:

- Quiz and selfie analysis remain under `/quiz`.
- Dashboard remains a redirect to `/quiz` unless product direction intentionally changes later.
- Supabase auth remains progressive.
- Saved profile and history should ask for login only at save or restore moments.

The UI should support loading, empty, success, partial, and error states for each user-visible data area.

## Responsive Behavior

### Mobile

- Bottom tabs stay fixed and stable.
- Primary content has enough bottom padding so tabs do not cover actions.
- Touch targets should be at least 44px.
- Hero and result cards must not overflow narrow screens.

### Desktop

- Do not stretch mobile cards across the whole viewport.
- Use a side rail plus constrained workspace.
- Keep scan and saved content scannable in columns.
- Use the right panel only when it adds useful context.

## Accessibility

- Body text should meet WCAG AA contrast.
- Focus states must be visible.
- Buttons need clear accessible names.
- Tabs must expose selected state.
- Reduced motion should be respected.
- Copy and imagery should stay inclusive across gender, skin tone, body size, age, and style preference.

## Motion

Motion should be subtle and state-driven:

- 150ms to 250ms transitions.
- Press, selection, loading, and tab changes can animate.
- Avoid long page-load choreography.
- Provide reduced-motion fallbacks.

## Implementation Scope

This design is ready for a first UI implementation pass covering:

- Landing simplification and soft pink refresh.
- Quiz visual polish only where it supports the flow.
- Result to daily stylist transition.
- Mobile app shell with bottom tabs.
- Desktop app shell with side rail.
- Friendly user-facing error patterns.

Out of scope for this pass:

- New AI provider behavior.
- New payment or subscription behavior.
- New affiliate feed ingestion.
- Full wardrobe builder.
- Stripe entitlement security.

## Testing And Verification

Implementation should be verified with:

- Unit tests for any changed data or routing behavior.
- Existing auth and analysis tests where affected.
- Desktop browser check.
- Mobile viewport browser check.
- Visual check that text does not overflow.
- Check that no raw Supabase or provider errors are rendered to users.
- Check that `/dashboard` still follows the documented redirect behavior unless intentionally changed in a later spec.

## Spec Self-Review

- No incomplete markers remain.
- Scope is limited to UI and flow design.
- Font rules match the existing style guide.
- Auth remains progressive.
- `/quiz` remains the canonical selfie flow.
- The harsh red-pink landing color is explicitly rejected.
