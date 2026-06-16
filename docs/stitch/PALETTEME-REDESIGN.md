# Hybrid landing (Stitch + original)

- **Kept:** `palette me` wordmark, hero headline (“Find the colors that make *you* glow”), before/after polaroid, seasons carousel, reviews, FAQ, waitlist, glass topbar, editorial tokens.
- **Stitch-informed:** quiz-first copy, value cards under hero, product2 flow in steps, style-assistant feature grid, `let's start` CTA (product2 first launch).
- **UX:** no account before quiz, selfie optional, photos processed securely — stated early.


Source: Google Stitch project `PaletteMe Mobile Redesign` (`projects/16896420670487019181`)  
Synced: 2026-06-14  
Intake spec: `app/product2.md`

This file is the **adaptation guide** for implementing Stitch screens in the Next.js app. Do not copy Stitch layouts 1:1 — wire them to existing routes, tokens, and backend contracts in `LOGIC.md`.

---

## Connection

Project MCP config: `.cursor/mcp.json` (stdio proxy with `STITCH_API_KEY`).

After adding or changing MCP config, reload Cursor (**Settings → Tools & MCP → refresh**) so Stitch tools appear.

---

## Design system (already aligned)

Stitch **Editorial Pink** matches `design/PaletteMe-style-guide.md` and `app/globals.css`:

| Token | Stitch | Codebase |
| --- | --- | --- |
| Cream surface | `#FBF1E4` / `#fff8f2` | `--cream` |
| Ink text | `#17121A` | `--ink` |
| Hot pink accent | `#FF2E7E` | `--accent` |
| Pink deep (CTA) | `#DB276C` | `--pink-deep` |
| Berry (quiz blocks) | `#75153A` | `--berry` |
| Blush | `#FFF5F8` | `--blush` |
| Lilac (gradients) | `#C9B6E4` | `--lilac` |
| Display | DM Serif Display 400 | `--serif` |
| Body/UI | DM Sans, lowercase buttons | `--sans` |
| Script flourish | Allura | `--script` |

**Adaptation rules (not in Stitch verbatim):**

- Keep Next.js App Router pages — no Stitch-exported SPA shell.
- Reuse `components/selfie/selfie-capture.tsx` for all photo upload/camera.
- Quiz logic stays in `lib/quiz.ts` / `lib/quiz-data.ts` — UI follows Stitch, scoring follows code.
- No emojis in production UI (product2.md uses them as wireframe hints only).
- Payments stay dormant (free testing mode per ADR-007).
- Progressive auth — no account gate before quiz result.

---

## Stitch screens → app routes

| Stitch screen | Route / component | product2.md section | Status |
| --- | --- | --- | --- |
| PaletteMe Landing | `/` + landing components | First launch | Partial — refresh UI |
| Landing Page (Desktop) | `/` responsive | First launch | Partial |
| Department Quiz | `/quiz` wardrobe + pain point | Quiz 1–2 | Shipped (logic) — polish UI |
| Quiz: Skin Tone | `/quiz` color questions | Quiz 3–4 | Shipped — polish swatch UI |
| Quiz: Undertone | `/quiz` | Quiz 3 | Shipped |
| Result: Warm Autumn | `/quiz` result + `/profile` | Result page | Partial |
| Personal Palette | `/profile` | Result blocks 2–5 | Partial |
| Home: Dashboard | new `/home` or post-quiz hub | Home screen | Not built |
| AI Scanner | scan flow (future route) | Scan Anything | Backend only |
| Scan Result: Analysis | scan result UI | Scan result | Backend only |

---

## Visual patterns to port (adapted)

From Stitch `designMd`:

1. **Dreamy gradient backdrop** — lilac + blush + cream with subtle grain (CSS only, no heavy images).
2. **Bracket kickers** — `[ like this ]` in label-caps pink above section titles.
3. **Pill buttons** — lowercase, `rounded-full`, primary = `pink-deep`.
4. **Glass nav** — `backdrop-blur` + cream/blush 80% for sticky headers.
5. **Card elevation** — soft shadow `0 18px 40px -22px rgba(23,18,26,0.15)`.
6. **Berry quiz panels** — deep quiz steps on `--berry` with cream text.
7. **Color swatch circles** — realistic skin/hair/eye pickers with white ring on select.
8. **Season result hero** — large serif season name + confidence chip + script flourish word.

---

## Recommended implementation order

### Phase A — Design tokens & shared UI (low risk)
- Add utility classes in `app/globals.css` for kickers, glass nav, dreamy gradient, card shadow.
- Extract `components/ui/` primitives: `PillButton`, `Kicker`, `GlassHeader`, `SwatchPicker`.

### Phase B — Landing refresh
- Update `app/page.tsx` + landing components to match Stitch landing hierarchy while keeping waitlist/quiz CTA.

### Phase C — Quiz UI polish
- Restyle `components/quiz/quiz-flow.tsx` steps to match Stitch card/swatch patterns without changing step order or scoring.

### Phase D — Result & profile
- Expand result blocks per product2.md (best colors, use carefully, wardrobe meaning, pain-point copy).

### Phase E — Home hub (product2)
- New post-quiz home with Scan Anything, Wardrobe, Outfits cards + bottom nav shell.

---

## Stitch project metadata

- **Title:** PaletteMe Mobile Redesign
- **Device:** Mobile-first (390–780px screens)
- **Last updated:** 2026-06-14
- **Screens:** 16 (landing, quiz, result, home, scanner, profile, style guide)
