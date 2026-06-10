# AGENTS.md — PaletteMe

This file is the single source of truth for any AI agent working on this codebase.
Read it fully before writing a single line of code.

---

## Table of Contents

1. [BRD — Business Requirements](#brd--business-requirements)
2. [PRD — Product Requirements](#prd--product-requirements)
3. [TRD — Technical Requirements](#trd--technical-requirements)
4. [Agent Rules](#agent-rules)
5. [Documentation Convention](#documentation-convention)
6. [Decision Log — ADR](#decision-log--adr)
7. [What Was Built — Feature Changelog](#what-was-built--feature-changelog)
8. [Gotchas & Known Issues](#gotchas--known-issues)

---

## BRD — Business Requirements

### What is PaletteMe?

PaletteMe is a personal color analysis app. It tells users which of the 12 seasonal color types they are (Spring, Summer, Autumn, Winter + sub-seasons), then recommends products — clothing, makeup, accessories — that actually suit their natural coloring.

### Problem

Most people buy colors that clash with their skin tone, hair, and eyes because they follow trends instead of their own palette. Color analysis is traditionally expensive (in-person consultations cost $150–$500). There is no accessible, accurate, AI-powered alternative.

### Solution

Upload a selfie → get an instant seasonal color type analysis → get curated product picks matched to your palette.

### Business Goals

- Build a waitlist of early users before full launch
- Validate willingness to pay for premium features (deeper analysis, saved palette, outfit builder)
- Establish PaletteMe as the go-to brand for AI color analysis
- Monetize via affiliate product links and/or subscription

### Target Users

- Women 18–35 interested in personal style, fashion, and self-improvement
- Users who have heard of seasonal color analysis but never had a professional consultation
- Style-conscious shoppers who want to buy less but better

### Success Metrics

- Waitlist signups
- Analysis completion rate (upload → result)
- Product click-through rate
- Return visits

---

## PRD — Product Requirements

### Core User Flow

```
Landing page
  → User takes color quiz (/quiz)
  → Quiz suggests preliminary season
  → User uploads selfie (dashboard) to confirm
  → Gemini analyzes image (with quiz as soft prior)
  → User sees their seasonal type + palette
  → User sees curated product picks matched to their colors
  → User can join waitlist for full features
```

### Pages

| Page | Path | Purpose |
|---|---|---|
| Landing | `/` | Hero, how it works, demo, testimonials, FAQ, waitlist CTA |
| Quiz | `/quiz` | Multi-step color quiz before analysis (Stylix-style funnel) |
| Dashboard | `/dashboard` | Upload selfie after quiz, see analysis result, see products |

### Features — MVP

- **Selfie upload** — drag and drop or tap to upload, client-side resize before sending
- **Color analysis** — Gemini analyzes skin undertone, contrast, depth → returns seasonal type
- **Season result** — shows season name, description, key palette colors
- **Product picks** — real scraped products whose colors match the season palette
- **Waitlist** — email signup with Telegram notification to founder

### Features — Post-MVP

- Saved palette (user account)
- Outfit builder
- Re-analysis with different photo
- Admin dashboard for waitlist CSV export

### Seasons

12 seasonal types total. All season data lives in `lib/landing-data.ts` under `SEASONS`. Never hardcode season names or colors elsewhere.

| Macro Season | Sub-seasons |
|---|---|
| Spring | True Spring, Bright Spring, Light Spring |
| Summer | True Summer, Soft Summer, Light Summer |
| Autumn | True Autumn, Soft Autumn, Dark Autumn |
| Winter | True Winter, Bright Winter, Dark Winter |

### Design System

Brand tokens and patterns are in `design/PaletteMe-style-guide.md`. Read it before touching UI.

- **Fonts**: DM Serif Display (headings, weight 400 only) · DM Sans (body/UI) · Allura (script flourish `.scr`)
- **Key classes**: `.kicker` · `.scr` · `.polaroid` · `.wordmark`
- **Color vars**: `--cream` `--ink` `--accent` (#FF2E7E) `--berry` `--blush` `--lilac`
- **Never** uppercase + letter-spacing on buttons or nav — always `lowercase`, `letter-spacing: 0`
- **Never** create `tailwind.config.js` — Tailwind v4 is CSS-first via `@theme inline` in `globals.css`

---

## TRD — Technical Requirements

### Stack

| Layer | Package | Notes |
|---|---|---|
| Framework | Next.js 16.2.7 / React 19 | App Router. Read `node_modules/next/dist/docs/` before touching routing or data-fetching. |
| Styles | Tailwind v4 | CSS-first config via `@theme inline`. No `tailwind.config.js`. |
| Image AI | `@google/generative-ai` | Gemini only. Model cascade: `gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-2.0-flash-lite` |
| Web scraping | `llm-scraper` + `playwright` | Node.js routes only — never Edge |
| LLM provider | `@ai-sdk/anthropic` | Vercel AI SDK. Used as provider for LLMScraper |
| Schema | `zod` v4 | Breaking changes from v3. Import `z` from `'zod'` directly |

### File Map

```
app/
  page.tsx                  landing page (all sections)
  dashboard/page.tsx        selfie upload + analysis UI
  api/analyze/route.ts      POST /api/analyze — Gemini image analysis
  api/waitlist/             waitlist signup + CSV export
  landing.css               landing-only styles
  globals.css               global styles + Tailwind @theme tokens

components/
  landing/                  one file per landing section
  dashboard/color-analyzer.tsx   upload flow + results display
  quiz/quiz-flow.tsx             dedicated quiz funnel UI

lib/
  analysis.ts               analyzeFaceImage() — all Gemini logic
  landing-data.ts           SEASONS, PRODUCTS, REVIEWS, FAQS, QUIZ_QUESTIONS
  quiz.ts                   quiz scoring + sessionStorage helpers
  demo-images.ts            image URLs used in landing demos
  resize-image.ts           client-side image resize before upload
  telegram.ts               Telegram notification on waitlist signup
  waitlist-store.ts         in-memory waitlist

design/
  PaletteMe-style-guide.md  brand tokens + component patterns
  paletteme-v3.css          full v3 CSS reference

docs/
  TRACKER.yaml              source of truth for plan progress
  plans/                    upcoming features
  systems/                  shipped features
```

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/analyze` | POST | Accepts base64 image, returns season analysis via Gemini |
| `/api/products` | GET | Scrapes products matching a season palette |
| `/api/waitlist` | POST | Adds email to waitlist, fires Telegram notification |
| `/api/waitlist/export` | GET | Returns waitlist CSV |

### Gemini Analysis

All Gemini logic goes through `lib/analysis.ts` → `analyzeFaceImage()`. Never call `@google/generative-ai` directly from a route.

Model cascade (automatic fallback):
1. `gemini-2.5-flash`
2. `gemini-2.5-flash-lite`
3. `gemini-2.0-flash-lite`

### llm-scraper + Playwright

Used to scrape real product pages and return items whose colors match a season palette.

```typescript
// Always in a Node.js API route — never Edge
export const runtime = 'nodejs'
export const maxDuration = 60

import LLMScraper from 'llm-scraper'
import { chromium } from 'playwright'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

const ProductSchema = z.object({
  products: z.array(z.object({
    name: z.string(),
    price: z.string(),
    url: z.string().url(),
    primaryColor: z.string().describe('dominant color as hex or plain name'),
  }))
})

export async function scrapeProducts(url: string) {
  const browser = await chromium.launch()
  const scraper = new LLMScraper(anthropic('claude-haiku-4-5-20251001'))
  const page = await browser.newPage()
  try {
    await page.goto(url, { timeout: 30_000 })
    const { data } = await scraper.run(page, ProductSchema, { format: 'html' })
    return data
  } finally {
    await browser.close() // ALWAYS — leaked browsers crash the server
  }
}
```

**Rules:**
- Always `finally { browser.close() }` — no exceptions
- Always `export const runtime = 'nodejs'` on routes using Playwright
- Use Haiku (`claude-haiku-4-5-20251001`), never Sonnet/Opus for scraping
- Season palette colors are in `SEASONS[id].palette` from `lib/landing-data.ts`
- `format: 'html'` for product pages · `'markdown'` for text-heavy · `'text'` for simple

### Environment Variables

```
GEMINI_API_KEY=        # Gemini — read as process.env.GEMINI_API_KEY in lib/analysis.ts
ANTHROPIC_API_KEY=     # llm-scraper via @ai-sdk/anthropic
TELEGRAM_BOT_TOKEN=    # waitlist notifications
TELEGRAM_CHAT_ID=      # waitlist notifications
```

### Hard Rules

- **Never** call `analyzeFaceImage` from a client component
- **Never** import server-only code (API keys, DB, Playwright) into client components
- **Never** add `runtime = "edge"` to routes using Playwright, Gemini SDK, or Node built-ins
- **Never** hardcode season colors or names — always read from `SEASONS` in `lib/landing-data.ts`
- **Never** hardcode products — must come from scraping or be clearly marked as demo placeholders
- **Never** mock the Playwright browser in tests — use real headless browser
- **Never** create `tailwind.config.js`

---

## Agent Rules

### Before writing any code

1. Read `node_modules/next/dist/docs/` for any routing or data-fetching task — this is Next.js 16, not what you know
2. Read `design/PaletteMe-style-guide.md` before touching any UI
3. Check `docs/TRACKER.yaml` to understand current plan progress
4. Read the relevant SKILL.md before creating any file type (docx, pdf, pptx, etc.)

### New API routes

Mirror `app/api/analyze/route.ts`:
- Validate input
- Type all errors
- `export const runtime = 'nodejs'`

### New UI components

- One file per section under `components/landing/`
- Use design tokens from `globals.css` — never raw hex values
- Follow font and class rules from `design/PaletteMe-style-guide.md`

### When asked to plan a feature

Follow the Documentation Convention below — create the full plan folder structure before writing any code.

---

## Documentation Convention

All documentation lives in `docs/` and follows a structured planning workflow.

### Directory Structure

```
docs/
├── systems/                    # Living docs for shipped systems
│   └── <system-name>/
│       ├── README.md
│       └── diagram.excalidraw
├── plans/                      # Upcoming features
│   └── YYYY-MM-DD-<feature>/
│       ├── plan.md             # Overview, goals, architecture, scope
│       ├── diagram.excalidraw  # Architecture diagram
│       ├── blockers.excalidraw # Dependency/blocker diagram
│       ├── 01-<task>.md        # Task 1 spec
│       ├── 02-<task>.md        # Task 2 spec
│       └── ...
└── TRACKER.yaml                # Source of truth for all plan progress
```

### TRACKER.yaml Format

```yaml
plans:
  - name: feature-name
    path: plans/YYYY-MM-DD-feature-name/
    status: planned # planned → in-progress → shipped
    created: YYYY-MM-DD
    started:
    shipped:
    tasks:
      - name: task-1-name
        file: 01-task-name.md
        status: pending # pending → in-progress → done
```

### Mandatory Rules

- Every plan folder MUST have: `plan.md`, `diagram.excalidraw`, `blockers.excalidraw`, at least one task file
- **NEVER** create a plan without both diagrams
- **ALWAYS** update `TRACKER.yaml` at every state change
- **At the start of every session**, check `TRACKER.yaml` before doing any work

### State Transitions

| Event | TRACKER.yaml update |
|---|---|
| Create plan | `status: planned`, all tasks `pending` |
| Start a task | Task `status: in-progress`, plan `status: in-progress` |
| Complete a task | Task `status: done` |
| Ship the plan | Plan `status: shipped`, add `shipped:` date |

### Shipping a Feature

When all tasks are done:
1. Compile `docs/systems/<name>/README.md` from `plan.md` + all task files
2. Move `diagram.excalidraw` to `docs/systems/<name>/`
3. Move folder from `plans/` to `systems/`
4. Set plan `status: shipped` in `TRACKER.yaml`

---

## Decision Log — ADR

Every significant architectural or product decision lives here. When you make a decision that affects how the system works, add an entry. Future agents must read this before suggesting changes — do not reverse a decision without a new entry explaining why.

Format:
```
### ADR-XXX — <title>
Date: YYYY-MM-DD
Status: accepted | superseded by ADR-XXX
Context: Why did this decision need to be made?
Decision: What was chosen?
Alternatives considered: What else was on the table?
Consequences: What does this mean going forward?
```

---

### ADR-001 — Gemini for image analysis, not GPT Vision

Date: 2025-01-01
Status: accepted
Context: Need to analyze selfies for skin undertone, contrast, and seasonal color type. Needed a vision model that handles skin tone accurately and is cost-effective at scale.
Decision: Use Google Gemini exclusively via `@google/generative-ai`. Model cascade: `gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-2.0-flash-lite`.
Alternatives considered: GPT-4 Vision (more expensive, no cascade fallback), Claude Vision (no direct image analysis SDK at the time).
Consequences: All image analysis must go through `lib/analysis.ts` → `analyzeFaceImage()`. Never call Gemini directly from a route.

---

### ADR-002 — Tailwind v4 CSS-first config, no tailwind.config.js

Date: 2025-01-01
Status: accepted
Context: Tailwind v4 introduced breaking changes — config moved from `tailwind.config.js` to CSS `@theme inline` blocks.
Decision: All design tokens live in `app/globals.css` under `@theme inline`. No `tailwind.config.js` exists or should be created.
Alternatives considered: Stay on Tailwind v3 (would miss v4 performance gains and CSS-native tokens).
Consequences: Any agent that creates `tailwind.config.js` breaks the build. Custom colors/fonts must be added as CSS vars in `globals.css`.

---

### ADR-003 — llm-scraper with Haiku for product scraping

Date: 2025-01-01
Status: accepted
Context: Need to scrape real product pages from fashion retailers and extract color-matched items for each seasonal type.
Decision: Use `llm-scraper` + Playwright + `claude-haiku-4-5-20251001`. Never use Sonnet or Opus for scraping.
Alternatives considered: Direct CSS selectors (breaks too often), Sonnet (10x more expensive per page, no quality gain for extraction).
Consequences: All scraping routes must have `export const runtime = 'nodejs'` and `finally { browser.close() }`. Never run on Edge.

---

### ADR-004 — In-memory waitlist store, no database

Date: 2025-01-01
Status: accepted
Context: Pre-launch MVP — need waitlist signup without the overhead of setting up a database.
Decision: Use `lib/waitlist-store.ts` (in-memory array) + Telegram notification on each signup. CSV export available via `/api/waitlist/export`.
Alternatives considered: Supabase, Postgres (overkill for MVP), Airtable (adds external dependency).
Consequences: Waitlist resets on server restart. Acceptable for early beta. Must migrate to a real DB before launch.

---

## What Was Built — Feature Changelog

When a feature ships, add an entry here. This is how the agent knows what already exists and should not be rebuilt.

Format:
```
### YYYY-MM-DD — <feature name>
What was built: one sentence
Files created/modified: list
Notes: anything a future agent needs to know
```

---

### Initial build — Core app

What was built: Landing page, dashboard with selfie upload, Gemini color analysis, seasonal type result display, waitlist signup with Telegram notification.
Files created:
- `app/page.tsx` — landing page
- `app/dashboard/page.tsx` — upload + analysis UI
- `app/api/analyze/route.ts` — Gemini image analysis endpoint
- `app/api/waitlist/route.ts` — waitlist signup
- `app/api/waitlist/export/route.ts` — CSV export
- `lib/analysis.ts` — all Gemini logic
- `lib/landing-data.ts` — SEASONS, PRODUCTS, REVIEWS, FAQS, QUIZ_QUESTIONS
- `lib/waitlist-store.ts` — in-memory waitlist
- `lib/telegram.ts` — Telegram notification
- `lib/resize-image.ts` — client-side image resize
- `components/dashboard/color-analyzer.tsx` — upload flow + results
- `design/PaletteMe-style-guide.md` — brand tokens
Notes: Products in `landing-data.ts` are demo placeholders. Real scraping via `/api/products` is not yet built.

---

### 2026-06-08 — Dedicated color quiz funnel

What was built: Stylix-style quiz-first flow on `/quiz` — intro, one question per screen, calculating interstitial, preliminary result, then gated dashboard upload with quiz hint passed to Gemini.
Files created/modified:
- `app/quiz/page.tsx`, `app/quiz/quiz.css` — dedicated quiz page
- `components/quiz/quiz-flow.tsx` — quiz funnel UI
- `lib/quiz.ts` — scoring + sessionStorage
- `components/landing/quiz-cta.tsx` — landing CTA linking to `/quiz`
- `components/dashboard/color-analyzer.tsx` — quiz gate + hint to API
- `lib/analysis.ts`, `app/api/analyze/route.ts` — quiz context in prompt
Notes: Quiz result stored in `sessionStorage` (`paletteme_quiz_result`). Dashboard blocks upload until quiz is complete.

### 2026-06-08 — Full onboarding quiz (8 steps + selfie climax)

What was built: Expanded `/quiz` to full PaletteMe onboarding — goal, sun undertone test, natural hair (+ dyed follow-up), height, body shape, style vibe, optional trends, then selfie upload on the same page with AI merge.
Files created/modified:
- `lib/quiz-data.ts` — all question options and types
- `lib/quiz.ts` — `QuizProfile` with full answers + `formatProfileForAI()`
- `components/quiz/quiz-flow.tsx` — 8-step stepper UI
- `components/quiz/quiz-selfie-step.tsx` — selfie drop + analyze + inline results
- `app/quiz/quiz.css` — cards, shapes, tags, drop zone styles
Notes: Question data lives in `lib/quiz-data.ts`. AI receives full profile summary via `profileSummary` in analyze API.

---

## Gotchas & Known Issues

Things that look wrong but are intentional, or things that will bite you if you don't know about them. Add an entry any time you hit a surprise. Future agents must read this section before debugging.

---

### Next.js 16 is NOT the Next.js you know

This project uses Next.js 16.2.7 with React 19 and App Router. APIs, file conventions, and data-fetching patterns differ significantly from Next.js 13/14. **Before touching any routing or data-fetching code, read `node_modules/next/dist/docs/`.**

---

### Zod v4 breaking changes

This project uses Zod v4. Import as `import { z } from 'zod'` — same as before. But many internal APIs changed from v3. Do not copy Zod patterns from training data or Stack Overflow without verifying against v4 docs.

---

### Playwright cannot run on Edge runtime

Any route that imports Playwright or llm-scraper **must** have `export const runtime = 'nodejs'`. The build will succeed but the route will crash at runtime on Edge. This includes any route that transitively imports from a file that uses Playwright.

---

### browser.close() is not optional

If `browser.close()` is not in a `finally` block, a crashed or thrown route will leak a headless Chromium process. These accumulate and eventually crash the server. Always:
```typescript
try {
  // scraping logic
} finally {
  await browser.close()
}
```

---

### Never import server code into client components

Files in `lib/` that use API keys, Playwright, or Node built-ins (`analysis.ts`, `telegram.ts`, `waitlist-store.ts`) cannot be imported in client components (`'use client'`). Next.js will throw a build error. Keep server logic in API routes only.

---

### SEASONS data is the single source of truth

Season names, colors, descriptions, and palette arrays all live in `lib/landing-data.ts` under `SEASONS`. Never hardcode a season name or color hex anywhere else in the codebase. If you need season data in a new file, import `SEASONS` from there.

---

### Tailwind classes must exist as CSS vars

Tailwind v4 generates classes from CSS variables defined in `app/globals.css`. If you use a class like `bg-accent` and `--accent` is not defined in `globals.css`, the class silently does nothing. When adding new design tokens, always define them in `globals.css` first.

---

### DM Serif Display: weight 400 only

The heading font is DM Serif Display. It only has one weight — 400. Do not set `font-weight: 700` or `font-weight: bold` on any heading — it will fall back to the system serif and look broken.

---

### Button and nav text: never uppercase

Per the design system, buttons and nav links must always be `lowercase` with `letter-spacing: 0`. This is a deliberate brand choice, not a bug. Do not "fix" it.
