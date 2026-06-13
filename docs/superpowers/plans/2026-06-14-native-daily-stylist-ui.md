# Native Daily Stylist UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the native-feeling PaletteMe app shell and daily stylist home while preserving the soft original pink landing, original fonts, progressive auth, and `/quiz` selfie ownership.

**Architecture:** Add small shared contracts for app navigation and friendly errors, then build a reusable app shell used by the new `/home` surface plus refreshed saved/profile surfaces. Keep backend behavior unchanged in this plan; the UI reads existing quiz/profile, analysis, scan history, and wardrobe foundations.

**Tech Stack:** Next.js 16 App Router, React 19 client components, Tailwind v4 CSS tokens in `app/globals.css`, local CSS modules or route CSS, Node test runner.

---

## File Structure

- Create `lib/app-nav.ts`: source of truth for app tab destinations and labels.
- Create `lib/friendly-errors.ts`: maps raw errors to user-safe messages.
- Create `lib/friendly-errors.test.ts`: regression coverage for hiding raw provider/Supabase errors.
- Create `components/app/app-shell.tsx`: responsive wrapper with desktop side rail and mobile tab bar.
- Create `components/app/app-ui.tsx`: compact cards used by daily home.
- Create `components/app/daily-stylist-home.tsx`: client daily home surface.
- Create `app/home/page.tsx`: daily stylist home route.
- Create `app/home/home.css`: route-specific app UI CSS.
- Modify `components/quiz/quiz-flow.tsx`: send completed users to `/home`.
- Modify `app/page.tsx` and `app/landing.css`: simplify landing above the fold.
- Modify `app/saved/page.tsx`: reuse app shell and native empty state.
- Modify `app/profile/page.tsx`: wrap the existing profile content in the app shell without removing its Suspense boundary.
- Modify `docs/PRODUCT-SPEC.md`: document `/home` as daily stylist home.

---

### Task 1: Navigation And Friendly Error Contracts

**Files:**
- Create: `lib/app-nav.ts`
- Create: `lib/friendly-errors.ts`
- Create: `lib/friendly-errors.test.ts`

- [ ] **Step 1: Add failing tests for safe error copy**

Add this file:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { friendlyUserError, isRawTechnicalError } from "./friendly-errors.ts";

test("detects raw provider and Supabase errors", () => {
  assert.equal(isRawTechnicalError("Supabase PGRST116: row missing"), true);
  assert.equal(isRawTechnicalError("OpenAI API key missing"), true);
  assert.equal(isRawTechnicalError("TypeError: Cannot read properties of undefined"), true);
  assert.equal(isRawTechnicalError("Try a brighter front-facing photo."), false);
});

test("maps raw errors to a calm fallback", () => {
  assert.equal(
    friendlyUserError("Supabase PGRST116: row missing", "We could not save this yet. Try again."),
    "We could not save this yet. Try again."
  );
  assert.equal(
    friendlyUserError("This photo is hard to read. Try a brighter front-facing photo."),
    "This photo is hard to read. Try a brighter front-facing photo."
  );
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm test -- lib/friendly-errors.test.ts
```

Expected: fails because `lib/friendly-errors.ts` does not exist.

- [ ] **Step 3: Implement app navigation and friendly errors**

Add `lib/friendly-errors.ts`:

```ts
const RAW_ERROR_PATTERNS = [
  /supabase/i,
  /postgrest/i,
  /pgrst\d+/i,
  /openai/i,
  /gemini/i,
  /api key/i,
  /stack/i,
  /typeerror/i,
  /referenceerror/i,
  /syntaxerror/i,
  /cannot read/i,
  /route\.ts/i,
  /\{.*error.*\}/i,
];

export function isRawTechnicalError(message: unknown): boolean {
  if (typeof message !== "string") return false;
  return RAW_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

export function friendlyUserError(
  message: unknown,
  fallback = "Something went wrong. Try again."
): string {
  if (typeof message !== "string") return fallback;
  const trimmed = message.trim();
  if (!trimmed || isRawTechnicalError(trimmed)) return fallback;
  return trimmed;
}
```

Add `lib/app-nav.ts`:

```ts
export type AppDestinationId = "home" | "scan" | "saved" | "profile";

export type AppDestination = {
  id: AppDestinationId;
  label: string;
  href: string;
};

export const APP_DESTINATIONS: AppDestination[] = [
  { id: "home", label: "home", href: "/home" },
  { id: "scan", label: "scan", href: "/home?scan=1" },
  { id: "saved", label: "saved", href: "/saved" },
  { id: "profile", label: "profile", href: "/profile" },
];

export function getActiveDestination(pathname: string): AppDestinationId {
  if (pathname.startsWith("/saved")) return "saved";
  if (pathname.startsWith("/profile")) return "profile";
  return "home";
}
```

- [ ] **Step 4: Verify tests pass**

Run:

```bash
npm test -- lib/friendly-errors.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add lib/app-nav.ts lib/friendly-errors.ts lib/friendly-errors.test.ts
git commit -m "feat: add app navigation and friendly errors"
```

---

### Task 2: App Shell Components

**Files:**
- Create: `components/app/app-shell.tsx`
- Create: `components/app/app-ui.tsx`
- Create: `app/home/home.css`

- [ ] **Step 1: Create reusable app shell**

Add `components/app/app-shell.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { APP_DESTINATIONS, getActiveDestination } from "@/lib/app-nav";

type AppShellProps = {
  children: ReactNode;
  rightPanel?: ReactNode;
};

export function AppShell({ children, rightPanel }: AppShellProps) {
  const pathname = usePathname();
  const active = getActiveDestination(pathname);

  return (
    <div className="pm-app-shell">
      <aside className="pm-app-rail" aria-label="primary">
        <Link href="/home" className="pm-app-logo" aria-label="PaletteMe home">
          p<span>m</span>
        </Link>
        <nav className="pm-app-rail__nav">
          {APP_DESTINATIONS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={item.id === active ? "is-active" : ""}
              aria-current={item.id === active ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="pm-app-main">{children}</main>
      {rightPanel ? <aside className="pm-app-side">{rightPanel}</aside> : null}
      <nav className="pm-app-tabs" aria-label="primary">
        {APP_DESTINATIONS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={item.id === active ? "is-active" : ""}
            aria-current={item.id === active ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 2: Create app UI primitives**

Add `components/app/app-ui.tsx`:

```tsx
import Link from "next/link";
import type { ReactNode } from "react";

export function SeasonSummaryCard({
  title,
  palette,
  subtitle,
}: {
  title: string;
  palette: string[];
  subtitle: string;
}) {
  return (
    <section className="pm-season-card">
      <p className="pm-card-label">your palette</p>
      <h1>{title}</h1>
      <div className="pm-swatches" aria-label={`${title} palette`}>
        {palette.slice(0, 8).map((color) => (
          <span key={color} style={{ background: color }} />
        ))}
      </div>
      <p>{subtitle}</p>
    </section>
  );
}

export function PrimaryScanAction() {
  return (
    <Link className="pm-primary-scan" href="/home?scan=1">
      <span aria-hidden="true">+</span>
      <strong>scan outfit</strong>
      <small>check color, balance, and what to swap</small>
    </Link>
  );
}

export function StyleModuleGrid() {
  const modules = [
    { label: "makeup", href: "/home?scan=makeup" },
    { label: "wardrobe", href: "/wardrobe" },
    { label: "product", href: "/home?scan=product" },
    { label: "profile", href: "/profile" },
  ];
  return (
    <div className="pm-module-grid">
      {modules.map((module) => (
        <Link key={module.label} href={module.href} className="pm-module">
          <span aria-hidden="true" />
          <strong>{module.label}</strong>
        </Link>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  action,
  href,
}: {
  title: string;
  action: string;
  href: string;
}) {
  return (
    <section className="pm-empty">
      <p>{title}</p>
      <Link className="btn" href={href}>{action}</Link>
    </section>
  );
}

export function RightPanel({ children }: { children: ReactNode }) {
  return <div className="pm-right-panel">{children}</div>;
}
```

- [ ] **Step 3: Add app shell CSS**

Add `app/home/home.css`:

```css
.pm-app-shell {
  min-height: 100svh;
  background: var(--cream);
  color: var(--ink);
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) minmax(220px, 300px);
}

.pm-app-rail {
  position: sticky;
  top: 0;
  height: 100svh;
  border-right: 1px solid var(--hair);
  background: color-mix(in srgb, var(--cream-2) 70%, #fff);
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
}

.pm-app-logo {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: var(--ink);
  color: #fff;
  display: grid;
  place-items: center;
  font: 800 0.92rem var(--sans);
  letter-spacing: -0.04em;
}

.pm-app-logo span { color: var(--pink); }

.pm-app-rail__nav {
  display: grid;
  gap: 8px;
  width: 100%;
}

.pm-app-rail__nav a,
.pm-app-tabs a {
  font: 700 0.76rem var(--sans);
  letter-spacing: 0;
  text-transform: lowercase;
  border-radius: 14px;
  padding: 10px 8px;
  text-align: center;
  color: var(--ink-soft);
}

.pm-app-rail__nav a.is-active,
.pm-app-tabs a.is-active {
  background: var(--ink);
  color: #fff;
}

.pm-app-main {
  padding: clamp(18px, 4vw, 36px);
  padding-bottom: 92px;
}

.pm-app-side {
  border-left: 1px solid var(--hair);
  background: color-mix(in srgb, #fff 65%, var(--cream));
  padding: 20px;
}

.pm-app-tabs {
  display: none;
}

.pm-season-card,
.pm-primary-scan,
.pm-module,
.pm-empty,
.pm-right-panel {
  border-radius: 18px;
  background: #fffdfb;
  border: 1px solid var(--hair);
}

.pm-season-card {
  padding: clamp(18px, 4vw, 26px);
  background: linear-gradient(135deg, var(--blush), #fffdfb);
}

.pm-card-label {
  font: 700 0.72rem var(--sans);
  color: var(--ink-soft);
  margin-bottom: 8px;
}

.pm-season-card h1 {
  font-size: clamp(2.3rem, 7vw, 4rem);
  margin-bottom: 16px;
}

.pm-swatches {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 5px;
  margin-bottom: 14px;
}

.pm-swatches span {
  height: 32px;
  border-radius: 9px;
}

.pm-primary-scan {
  min-height: 72px;
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 12px;
  align-items: center;
  padding: 14px;
  background: var(--ink);
  color: #fff;
}

.pm-primary-scan span {
  width: 44px;
  height: 44px;
  border-radius: 15px;
  display: grid;
  place-items: center;
  background: var(--pink);
  font-size: 1.5rem;
}

.pm-primary-scan small {
  display: block;
  color: color-mix(in srgb, #fff 72%, transparent);
  font: 500 0.82rem var(--sans);
}

.pm-module-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.pm-module {
  min-height: 96px;
  padding: 13px;
  display: grid;
  align-content: space-between;
}

.pm-module span {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: var(--blush);
}

.pm-empty {
  padding: 28px;
  text-align: center;
}

@media (max-width: 900px) {
  .pm-app-shell {
    display: block;
  }
  .pm-app-rail,
  .pm-app-side {
    display: none;
  }
  .pm-app-tabs {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: 12px;
    z-index: 20;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    padding: 7px;
    border-radius: 24px;
    background: rgba(255, 253, 251, 0.95);
    box-shadow: 0 10px 24px rgba(23, 18, 26, 0.1);
  }
  .pm-module-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- [ ] **Step 4: Run lint**

Run:

```bash
npm run lint
```

Expected: no new lint errors from `components/app/*` or `app/home/home.css`.

- [ ] **Step 5: Commit**

```bash
git add components/app/app-shell.tsx components/app/app-ui.tsx app/home/home.css
git commit -m "feat: add native app shell components"
```

---

### Task 3: Daily Home Route

**Files:**
- Create: `app/home/page.tsx`
- Create: `components/app/daily-stylist-home.tsx`
- Modify: `components/quiz/quiz-flow.tsx`

- [ ] **Step 1: Add daily home component**

Add `components/app/daily-stylist-home.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AnalysisResult } from "@/lib/analysis";
import { loadAnalysisResult } from "@/lib/analysis-storage";
import { loadQuizProfile, type QuizProfile } from "@/lib/quiz";
import { SEASONS } from "@/lib/landing-data";
import { AppShell } from "./app-shell";
import {
  EmptyState,
  PrimaryScanAction,
  RightPanel,
  SeasonSummaryCard,
  StyleModuleGrid,
} from "./app-ui";

function paletteFor(profile: QuizProfile | null, analysis: AnalysisResult | null): string[] {
  if (analysis?.season?.palette?.length) return analysis.season.palette;
  const season = SEASONS.find((item) => item.id === profile?.seasonId);
  return season?.palette ?? SEASONS[0].palette;
}

function titleFor(profile: QuizProfile | null, analysis: AnalysisResult | null): string {
  return analysis?.subSeason || analysis?.season?.name || profile?.seasonName || "your palette";
}

export function DailyStylistHome() {
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(loadQuizProfile());
    setAnalysis(loadAnalysisResult<AnalysisResult>());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <AppShell>
        <EmptyState title="Loading your style home." action="start quiz" href="/quiz" />
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <EmptyState title="Start with your color result." action="start quiz" href="/quiz" />
      </AppShell>
    );
  }

  const title = titleFor(profile, analysis);
  const palette = paletteFor(profile, analysis);

  return (
    <AppShell
      rightPanel={
        <RightPanel>
          <p className="pm-card-label">profile</p>
          <h2 className="serif" style={{ fontSize: "1.8rem", marginBottom: 10 }}>{title}</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>
            Your result is ready. Save your profile to restore it on another device.
          </p>
          <Link className="btn" href="/profile" style={{ display: "inline-block", marginTop: 16 }}>
            profile
          </Link>
        </RightPanel>
      }
    >
      <div className="pm-home-stack">
        <SeasonSummaryCard
          title={title}
          palette={palette}
          subtitle="Use your palette as the base for outfit, product, and makeup decisions."
        />
        <PrimaryScanAction />
        <StyleModuleGrid />
        <section className="pm-empty">
          <p style={{ marginBottom: 14 }}>Recent scans will appear here.</p>
          <Link className="btn btn--ghost" href="/saved">saved items</Link>
        </section>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Add route page**

Add `app/home/page.tsx`:

```tsx
import { DailyStylistHome } from "@/components/app/daily-stylist-home";
import "./home.css";

export const metadata = {
  title: "Home | PaletteMe",
  description: "Your daily stylist home for outfit, product, makeup, and wardrobe decisions.",
};

export default function HomePage() {
  return <DailyStylistHome />;
}
```

- [ ] **Step 3: Update quiz completion route**

In `components/quiz/quiz-flow.tsx`, change the final route:

```ts
router.push("/home");
```

This replaces:

```ts
router.push("/profile");
```

- [ ] **Step 4: Run targeted checks**

Run:

```bash
npm run lint
npm run build
```

Expected: build succeeds; `/home` is generated; no `useSearchParams` Suspense issue is introduced because `/home` does not use it.

- [ ] **Step 5: Commit**

```bash
git add app/home/page.tsx components/app/daily-stylist-home.tsx components/quiz/quiz-flow.tsx
git commit -m "feat: add daily stylist home"
```

---

### Task 4: Landing Simplification

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/landing.css`

- [ ] **Step 1: Replace the above-fold landing with one clear action**

In `app/page.tsx`, keep the existing imports that are still used, but simplify the hero copy to:

```tsx
<section className="hero hero--soft">
  <div className="hero__main">
    <div className="hero__copy">
      <p className="hero__logo wordmark">
        palette<span className="me">me</span>
      </p>
      <h1 className="hero__mast">
        your colors, instantly
      </h1>
      <p className="hero__value">
        Take the quick quiz, get your palette, then use it to scan outfits, makeup, products, and your wardrobe.
      </p>
      <div className="hero__cta">
        <Link href="/quiz" className="cta-mini">
          start quiz
        </Link>
      </div>
      <div className="hero__note">
        <span>no account needed</span>
        <span>free while testing</span>
      </div>
    </div>
    <div className="hero__preview">
      <BeforeAfter />
    </div>
  </div>
</section>
```

Remove the `hero__foot` three-step strip from the first viewport.

- [ ] **Step 2: Add soft original pink treatment**

In `app/landing.css`, add:

```css
.hero--soft {
  background:
    radial-gradient(80% 75% at 18% 22%, color-mix(in srgb, var(--lilac) 88%, #fff) 0, transparent 58%),
    radial-gradient(85% 80% at 84% 14%, #ffc7dd 0, transparent 60%),
    radial-gradient(95% 90% at 70% 100%, #ff8fba 0, transparent 62%),
    linear-gradient(155deg, #e7c3e4 0%, #f6b6ce 42%, #fbd7c5 100%);
}

.hero--soft .hero__mast {
  max-width: 9ch;
  text-wrap: balance;
}

.hero--soft .hero__value {
  max-width: 42ch;
}
```

Remove the `.hero__foot` CSS block from `app/landing.css` after deleting the matching markup from `app/page.tsx`.

- [ ] **Step 3: Verify mobile and desktop**

Run:

```bash
npm run lint
npm run build
npm run dev
```

Open:

```text
http://localhost:3000
```

Check:

- Desktop first viewport shows brand, headline, one CTA, and visual preview.
- Mobile first viewport has no text overlap.
- Buttons and nav remain lowercase.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/landing.css
git commit -m "feat: simplify landing hero"
```

---

### Task 5: Saved And Profile App Shell Fit

**Files:**
- Modify: `app/saved/page.tsx`
- Modify: `app/profile/page.tsx`

- [ ] **Step 1: Wrap saved page in `AppShell`**

Replace the top-level saved page header with:

```tsx
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/app-ui";
import "@/app/home/home.css";
```

Use this empty state:

```tsx
<AppShell>
  <div className="pm-home-stack">
    <h1 className="serif" style={{ fontSize: "clamp(2.2rem,7vw,4rem)" }}>saved</h1>
    {!ready ? null : items.length === 0 ? (
      <EmptyState title="Nothing saved yet." action="scan outfit" href="/home?scan=1" />
    ) : (
      <div className="saved-grid">
        {items.map((p) => {
          const imgUrl = p.image?.sizes?.Best?.url ?? "";
          return (
            <div key={p.id} className="saved-card">
              <a href={p.clickUrl} target="_blank" rel="noopener noreferrer" className="saved-card__image">
                {imgUrl && (
                  <Image src={imgUrl} alt={p.name} fill style={{ objectFit: "cover" }} unoptimized sizes="240px" />
                )}
              </a>
              <div className="saved-card__body">
                <p>{p.name}</p>
                <button type="button" onClick={() => remove(p.id)}>remove</button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
</AppShell>
```

Preserve the existing saved product removal behavior.

- [ ] **Step 2: Keep profile route safe**

Do not remove the existing `Suspense` wrapper in `app/profile/page.tsx`; it protects `useSearchParams()`.

Import CSS and shell:

```tsx
import "@/app/home/home.css";
import { AppShell } from "@/components/app/app-shell";
```

Wrap the existing `ProfileView` return:

```tsx
return (
  <AppShell>
    <ProfileView
      profile={profile}
      analysisResult={analysisResult}
      premiumLevel={premiumLevel}
      paymentUrls={paymentUrls}
      freeTestingMode={freeTestingMode}
    />
  </AppShell>
);
```

The profile loading fallback remains user-safe and does not expose raw auth errors.

- [ ] **Step 3: Verify routes**

Run:

```bash
npm run build
```

Expected:

- `/saved` builds.
- `/profile` builds without `useSearchParams` prerender errors.
- `/dashboard` remains a redirect to `/quiz`.

- [ ] **Step 4: Commit**

```bash
git add app/saved/page.tsx app/profile/page.tsx
git commit -m "feat: fit saved and profile into app shell"
```

---

### Task 6: Docs And Final QA

**Files:**
- Modify: `docs/PRODUCT-SPEC.md`
- Modify: `LOGIC.md`

- [ ] **Step 1: Document `/home`**

In `docs/PRODUCT-SPEC.md`, add `/home` to the pages table:

```md
| Home | `/home` | Daily stylist home after quiz result |
```

Also document that `/profile` remains the account/result detail surface.

- [ ] **Step 2: Run verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected:

- Node tests pass.
- Lint passes.
- Build passes.

- [ ] **Step 3: Browser QA**

Run:

```bash
npm run dev
```

Check these viewports:

- Desktop 1440px wide: `/`, `/home`, `/saved`, `/profile`.
- Mobile 390px wide: `/`, `/home`, `/saved`, `/profile`.

Expected:

- Landing keeps soft original pink and one clear CTA.
- `/home` has season card, scan outfit, modules, and bottom tabs on mobile.
- Desktop uses side rail and right panel.
- No raw Supabase, OpenAI, JSON, or route errors appear in visible UI.

- [ ] **Step 4: Commit**

```bash
git add docs/PRODUCT-SPEC.md LOGIC.md
git commit -m "docs: document daily stylist home"
```
