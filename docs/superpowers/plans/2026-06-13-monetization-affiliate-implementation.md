# Monetization Affiliate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first paid PaletteMe launch path: stable build, Stripe Payment Links, paid report unlock, Pro scanner gate, and affiliate-ready product links.

**Architecture:** Keep the existing Next.js app and add small helpers around payment state, premium gates, and affiliate URL wrapping. Use Stripe Payment Links for MVP payment validation, with local/Supabase entitlement hardening deferred until payment demand is proven.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, Supabase, GPT-4o/Gemini server routes, Stripe Payment Links, Node-compatible unit tests for pure helpers.

---

## File Structure

- Modify `app/login/page.tsx` to fix Suspense/build behavior.
- Modify `components/profile/profile-view.tsx` for paid report/pro gating.
- Modify `components/feed/product-feed.tsx` for affiliate disclosure if needed.
- Modify `components/dashboard/color-analyzer.tsx` for privacy copy and report CTA if still used.
- Create `lib/premium.ts` for MVP unlock state helpers.
- Create `lib/affiliate.ts` for URL wrapping.
- Create tests for `lib/premium.ts` and `lib/affiliate.ts`.
- Modify `app/api/products/route.ts` and/or `app/api/feed/route.ts` to apply affiliate wrapping before returning links.
- Modify docs only when behavior differs from this plan.

## Task 0: Add A Test Runner If Needed

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Check whether a test command exists**

Run:

```powershell
Get-Content -Raw package.json
```

Expected: no reliable `test` script exists today.

- [ ] **Step 2: Add a Node-compatible test script if no test runner exists**

Add:

```json
{
  "scripts": {
    "test": "node --test --experimental-strip-types"
  }
}
```

Keep existing scripts and dependencies.

- [ ] **Step 3: Skip dependency install when using the built-in Node test runner**

Run:

```powershell
npm test
```

Expected: the test runner starts. It may report no tests until helper tests are added.

## Task 1: Stabilize Existing Build

**Files:**
- Modify: `app/login/page.tsx`
- Modify: files reported by ESLint only when they block deploy

- [ ] **Step 1: Reproduce build/lint failures**

Run:

```powershell
.\node_modules\.bin\eslint.cmd
.\node_modules\.bin\next.cmd build
```

Expected current known failures:

- `/login` needs Suspense around `useSearchParams`.
- ESLint reports blocking React rule errors.

- [ ] **Step 2: Fix `/login` Suspense**

Wrap the component that uses `useSearchParams()` in Suspense. Keep the page UI unchanged.

- [ ] **Step 3: Fix blocking lint errors**

Prefer small changes:

- Avoid setting state directly inside effects when a derived value can be computed during render.
- Replace internal `<a href="/">` with `Link`.
- Remove unused variables only when clearly dead.

- [ ] **Step 4: Verify**

Run:

```powershell
.\node_modules\.bin\eslint.cmd
.\node_modules\.bin\next.cmd build
```

Expected: both complete without blocking errors.

## Task 2: Add Premium Unlock Helpers

**Files:**
- Create: `lib/premium.ts`
- Create: `lib/premium.test.ts`

- [ ] **Step 1: Write failing tests**

Test these behaviors:

- `paid=report` grants report unlock.
- `paid=pro` grants both report and pro unlock.
- Missing query values do not unlock.
- Stored unlock is read safely in the browser only.

- [ ] **Step 2: Run tests and confirm they fail**

Run:

```powershell
npm test -- lib/premium.test.ts
```

Expected: tests fail because `lib/premium.ts` does not exist.

- [ ] **Step 3: Implement helper**

Create functions with this shape:

```ts
export type PremiumLevel = "free" | "report" | "pro";

export function resolvePremiumLevelFromPaidParam(value: string | null): PremiumLevel;
export function canViewPaidReport(level: PremiumLevel): boolean;
export function canUseProScanner(level: PremiumLevel): boolean;
```

- [ ] **Step 4: Verify tests pass**

Run:

```powershell
npm test -- lib/premium.test.ts
```

Expected: tests pass.

## Task 3: Add Payment CTAs And Paid Report Gates

**Files:**
- Modify: `components/profile/profile-view.tsx`
- Possibly modify: `app/profile/page.tsx`

- [ ] **Step 1: Write component/helper tests where practical**

At minimum test pure premium helper behavior from Task 2 before UI wiring.

- [ ] **Step 2: Read payment URLs from public env vars**

Use:

```ts
process.env.NEXT_PUBLIC_PAID_REPORT_URL
process.env.NEXT_PUBLIC_SUBSCRIPTION_URL
```

- [ ] **Step 3: Add paid report lock state**

Free users see:

- Macro season.
- Palette preview.
- Locked cards for makeup, jewelry, hair, avoid colors, and full palette.

Paid report users see all report sections.

- [ ] **Step 4: Add Pro upsell**

Show Pro CTA for scanner access. If subscription URL is missing, show "coming soon" instead of a broken link.

- [ ] **Step 5: Verify**

Run:

```powershell
.\node_modules\.bin\eslint.cmd
.\node_modules\.bin\next.cmd build
```

Expected: build remains green.

## Task 4: Gate Outfit Scanner As Pro

**Files:**
- Modify or create component for scanner UI near profile/feed.
- Reuse: `app/api/check-outfit/route.ts`

- [ ] **Step 1: Confirm route contract**

Read `app/api/check-outfit/route.ts` and note required `FormData` fields.

- [ ] **Step 2: Add Pro-only UI**

Pro users can upload clothing/product photos. Free/report users see an upgrade CTA.

- [ ] **Step 3: Keep server route unchanged unless needed**

Do not move AI calls to the client.

- [ ] **Step 4: Verify**

Run lint/build and manually test the visible gate in browser after dev server starts.

## Task 5: Add Affiliate URL Wrapper

**Files:**
- Create: `lib/affiliate.ts`
- Create: `lib/affiliate.test.ts`
- Modify: `app/api/products/route.ts`
- Modify: `app/api/feed/route.ts`

- [ ] **Step 1: Write failing tests**

Test:

- Disabled affiliate returns original URL.
- Missing env vars return original URL.
- Rakuten ASOS URL wraps when IDs exist.
- Awin ASOS URL wraps when IDs exist.
- Amazon URL adds associate tag when tag exists.
- Unknown URL returns original URL.

- [ ] **Step 2: Run tests and confirm they fail**

Run:

```powershell
npm test -- lib/affiliate.test.ts
```

Expected: tests fail because wrapper is not implemented.

- [ ] **Step 3: Implement wrapper**

Export:

```ts
export function buildAffiliateUrl(url: string): string;
```

The function must never throw for malformed input. It should return the original string when it cannot safely wrap.

- [ ] **Step 4: Apply wrapper to product routes**

Wrap outbound product URLs before JSON response.

- [ ] **Step 5: Add disclosure**

Show:

```text
Some product links may earn us a commission at no extra cost to you.
```

- [ ] **Step 6: Verify**

Run:

```powershell
npm test -- lib/affiliate.test.ts
.\node_modules\.bin\eslint.cmd
.\node_modules\.bin\next.cmd build
```

Expected: all pass.

## Task 6: Final QA

**Files:**
- Modify only files needed for issues found during QA.

- [ ] **Step 1: Start dev server**

Run:

```powershell
.\node_modules\.bin\next.cmd dev
```

- [ ] **Step 2: Verify flows**

Check:

- `/`
- `/quiz`
- `/profile`
- `/feed`
- `/saved`
- payment CTA with missing env vars
- profile with `?paid=report`
- profile with `?paid=pro`

- [ ] **Step 3: Verify final commands**

Run:

```powershell
npm test
.\node_modules\.bin\eslint.cmd
.\node_modules\.bin\next.cmd build
```

Expected: all pass.
