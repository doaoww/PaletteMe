# Affiliate Acceptance Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make PaletteMe look and behave like a real value-adding style/shopping publisher so Rakuten, Awin, Amazon Associates, and individual merchants have clear reasons to approve it.

**Architecture:** Keep the existing Next.js app, quiz, profile, product APIs, and affiliate URL wrapper. Add a public reviewable shopping demo, affiliate disclosure/legal pages, stronger product recommendation metadata, merchant approval gating, click analytics, and application-ready partner copy. Product links keep working without affiliate credentials and only use affiliate tracking for approved merchants.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4 CSS tokens in `app/globals.css`, Supabase product tables when configured, local demo data fallback, Node test runner via `node --test --experimental-strip-types`, ESLint, existing `lib/affiliate.ts`.

---

## External Acceptance Rules To Respect

- Rakuten requires a live website or social URL that is not under construction, plus unique quality content that adds value before affiliate links.
- Rakuten disclosure guidance expects disclosures to be frequent, clear, conspicuous, visible without user action, and present on pages containing affiliate links.
- Amazon Associates requires the site to be public, original, accurately identified in the application, and not unsuitable; Amazon also requires the Associate disclosure statement when Amazon links/content are used.
- Amazon product claims, prices, promotions, and product-list links must not be inaccurate or misleading. Avoid Amazon prices unless they come from approved Amazon tools or APIs.
- FTC guidance expects simple, clear disclosure language near endorsements and warns against vague terms or relying only on platform tools.

## File Structure

Create:

- `lib/affiliate-disclosure.ts` - shared disclosure copy and helper flags.
- `lib/affiliate-merchant.ts` - merchant detection, approval status, network preference, and advertiser metadata.
- `lib/shopping-guides.ts` - public style/shopping guide content keyed by season and sub-season.
- `lib/shopping-guides.test.ts` - validates every guide has product-facing original content.
- `components/affiliate/affiliate-disclosure.tsx` - reusable visible disclosure block.
- `components/feed/product-card.tsx` - extracted product card with match reasons and compliance-safe CTA behavior.
- `components/feed/product-feed-empty-state.tsx` - non-placeholder feed state that still looks launch-ready.
- `app/demo/feed/page.tsx` - public reviewer/demo feed that does not require quiz completion.
- `app/shopping-guides/page.tsx` - index of public shopping guides.
- `app/shopping-guides/[season]/page.tsx` - public season-specific shopping guide.
- `app/affiliate-disclosure/page.tsx` - affiliate disclosure page.
- `app/about/page.tsx` - brand/product credibility page for reviewers.
- `app/contact/page.tsx` - reachable support/contact page.
- `app/privacy/page.tsx` - truthful privacy page matching photo processing rules.
- `app/terms/page.tsx` - simple terms page.
- `app/partners/page.tsx` - media/partner page for affiliate applications and merchant reviewers.
- `docs/affiliate-application-copy.md` - copy-paste application fields for Rakuten, Awin, Amazon, and merchants.
- `docs/plans/2026-06-17-affiliate-acceptance-package/plan.md` - active product plan if execution begins.
- `docs/plans/2026-06-17-affiliate-acceptance-package/01-acceptance-surface.md`
- `docs/plans/2026-06-17-affiliate-acceptance-package/02-product-content.md`
- `docs/plans/2026-06-17-affiliate-acceptance-package/03-compliance-and-analytics.md`
- `docs/plans/2026-06-17-affiliate-acceptance-package/04-qa-and-applications.md`

Modify:

- `app/page.tsx` - footer links to public legal and guide pages.
- `app/feed/page.tsx` - keep profile feed but use improved feed component/cards.
- `components/feed/product-feed.tsx` - use extracted product card and remove placeholder language.
- `app/api/feed/route.ts` - add match reasons and merchant metadata to product JSON.
- `app/api/products/route.ts` - include merchant metadata and preserve compliance-safe URL wrapping.
- `lib/affiliate.ts` - route by approved merchant metadata, not one global network only.
- `lib/affiliate.test.ts` - cover merchant approval states and Amazon disclosure-sensitive behavior.
- `docs/affiliate-programs.md` - update from basic wrapper guide to acceptance checklist.
- `docs/TRACKER.yaml` - add active plan only when implementation starts.

Do not modify:

- Do not add client-side AI calls.
- Do not create `tailwind.config.js`.
- Do not make `/dashboard` a selfie analysis UI.
- Do not hardcode season palettes outside existing `lib/landing-data.ts` or guide copy derived from it.

---

### Task 1: Acceptance Surface And Public Reviewer Path

**Files:**
- Create: `app/demo/feed/page.tsx`
- Create: `lib/shopping-guides.ts`
- Create: `app/shopping-guides/page.tsx`
- Create: `app/shopping-guides/[season]/page.tsx`
- Modify: `app/page.tsx`
- Test: `lib/shopping-guides.test.ts`

- [ ] **Step 1: Write the guide data test**

Create `lib/shopping-guides.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { SEASONS, SUB_SEASONS } from "./landing-data.ts";
import { SHOPPING_GUIDES } from "./shopping-guides.ts";

test("every macro season has a public shopping guide", () => {
  for (const season of SEASONS) {
    const guide = SHOPPING_GUIDES[season.id];
    assert.ok(guide, `${season.id} guide missing`);
    assert.equal(guide.seasonId, season.id);
    assert.ok(guide.title.includes(season.name));
    assert.ok(guide.summary.length >= 120);
    assert.ok(guide.nearFaceRules.length >= 3);
    assert.ok(guide.shoppingRules.length >= 4);
    assert.ok(guide.avoidOrBalance.length >= 3);
    assert.ok(guide.productAngles.length >= 4);
  }
});

test("sub-season names remain sourced from landing data", () => {
  const names = new Set(SUB_SEASONS.map((season) => season.name));
  for (const guide of Object.values(SHOPPING_GUIDES)) {
    for (const subSeason of guide.subSeasonNotes) {
      assert.ok(names.has(subSeason.name), `${subSeason.name} is not in SUB_SEASONS`);
      assert.ok(subSeason.note.length >= 80);
    }
  }
});
```

- [ ] **Step 2: Run the failing guide test**

Run:

```bash
npm test -- lib/shopping-guides.test.ts
```

Expected: FAIL because `lib/shopping-guides.ts` does not exist.

- [ ] **Step 3: Create guide content data**

Create `lib/shopping-guides.ts`:

```ts
import { SEASONS, SUB_SEASONS } from "@/lib/landing-data";

export type ShoppingGuide = {
  seasonId: string;
  title: string;
  summary: string;
  nearFaceRules: string[];
  shoppingRules: string[];
  avoidOrBalance: string[];
  productAngles: string[];
  subSeasonNotes: Array<{ name: string; note: string }>;
};

function subSeasonNotes(seasonId: string): Array<{ name: string; note: string }> {
  return SUB_SEASONS
    .filter((subSeason) => subSeason.seasonId === seasonId)
    .map((subSeason) => ({
      name: subSeason.name,
      note: `${subSeason.name} shoppers should use the same PaletteMe season logic with a tighter lens: undertone, depth, contrast, and chroma decide whether a product is best near the face, better as a lower-body piece, or easier to balance with makeup and accessories.`,
    }));
}

export const SHOPPING_GUIDES: Record<string, ShoppingGuide> = Object.fromEntries(
  SEASONS.map((season) => [
    season.id,
    {
      seasonId: season.id,
      title: `${season.name} shopping guide`,
      summary: `${season.name} palettes work best when product choices respect the user's natural temperature, depth, and contrast. PaletteMe uses quiz evidence, optional selfie analysis, and practical styling rules to explain why a product is a strong buy, a maybe, or better skipped for this color direction.`,
      nearFaceRules: [
        `Use ${season.paletteNames[0]} and ${season.paletteNames[1]} close to the face when the product color matches the user's undertone.`,
        `Prefer neckline, scarf, jacket, knit, lipstick, and earring choices that echo the ${season.name} palette before judging shoes or bags.`,
        "If a product is outside the palette, keep it away from the face or balance it with a better neckline color.",
      ],
      shoppingRules: [
        "Start with color harmony, then check silhouette, fabric weight, formality, and wardrobe usefulness.",
        "Treat the verdict as practical guidance, not a rigid rejection of the user's taste.",
        "Recommend alternatives when a product is close but too warm, too cool, too bright, too muted, too light, or too deep.",
        "Explain the reason before sending the shopper to a merchant.",
      ],
      avoidOrBalance: [
        "Avoid claiming a product is perfect when the color evidence is borderline.",
        "Balance difficult colors with better jewelry, makeup, layering, or distance from the face.",
        "Do not recommend replacing owned wardrobe items when styling fixes would solve the problem.",
      ],
      productAngles: [
        "best color match",
        "near-face styling",
        "wardrobe versatility",
        "makeup or accessory pairing",
      ],
      subSeasonNotes: subSeasonNotes(season.id),
    },
  ])
);
```

- [ ] **Step 4: Run guide tests until they pass**

Run:

```bash
npm test -- lib/shopping-guides.test.ts
```

Expected: PASS.

- [ ] **Step 5: Add public demo feed page**

Create `app/demo/feed/page.tsx`:

```tsx
import Link from "next/link";
import { ProductFeed } from "@/components/feed/product-feed";
import type { QuizProfile } from "@/lib/quiz";
import "../../app-shell.css";

const demoProfile: QuizProfile = {
  seasonId: "autumn",
  season: "Autumn",
  subSeason: "Dark Autumn",
  confidence: 0.82,
  answers: {},
  bestColors: ["#C4622D", "#8B7355", "#6B7C4B", "#7A4A30"],
  styleVector: { aesthetics: ["classic", "minimalist"], keywords: [] },
  bodyType: "balanced",
  wardrobeType: "both",
  styleChallenge: "shopping",
};

export default function DemoFeedPage() {
  return (
    <main className="app-shell">
      <header className="app-topbar glass-nav">
        <Link href="/" className="wordmark app-topbar__wordmark">
          palette<span className="me">me</span>
        </Link>
        <Link href="/shopping-guides" className="app-chip">
          guides
        </Link>
      </header>
      <section className="app-shell__main">
        <p className="kicker" style={{ fontSize: "0.58rem", marginBottom: 10 }}>
          public demo
        </p>
        <h1 className="font-serif" style={{ fontSize: "clamp(1.9rem,4vw,3rem)", lineHeight: 1.05 }}>
          A sample personalized shopping feed
        </h1>
        <p style={{ fontFamily: "var(--sans)", color: "var(--ink-soft)", marginTop: 10, maxWidth: 720 }}>
          Reviewers can see how PaletteMe adds original styling context before a shopping click: color fit,
          placement advice, practical balancing notes, and clear affiliate disclosure.
        </p>
        <div style={{ marginTop: 28 }}>
          <ProductFeed profile={demoProfile} />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Add shopping guide index and detail pages**

Create `app/shopping-guides/page.tsx`:

```tsx
import Link from "next/link";
import { SHOPPING_GUIDES } from "@/lib/shopping-guides";

export default function ShoppingGuidesPage() {
  return (
    <main className="page-shell" style={{ padding: "48px 20px", maxWidth: 1080, margin: "0 auto" }}>
      <Link href="/" className="wordmark">
        palette<span className="me">me</span>
      </Link>
      <h1 className="font-serif" style={{ fontSize: "clamp(2rem,5vw,4rem)", marginTop: 36 }}>
        Shopping guides by palette
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 28 }}>
        {Object.values(SHOPPING_GUIDES).map((guide) => (
          <Link key={guide.seasonId} href={`/shopping-guides/${guide.seasonId}`} className="card">
            <h2 className="font-serif" style={{ fontSize: "1.5rem" }}>{guide.title}</h2>
            <p style={{ fontFamily: "var(--sans)", color: "var(--ink-soft)", marginTop: 8 }}>{guide.summary}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

Create `app/shopping-guides/[season]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { SHOPPING_GUIDES } from "@/lib/shopping-guides";

export default async function ShoppingGuidePage({ params }: { params: Promise<{ season: string }> }) {
  const { season } = await params;
  const guide = SHOPPING_GUIDES[season];
  if (!guide) notFound();

  return (
    <main className="page-shell" style={{ padding: "48px 20px", maxWidth: 900, margin: "0 auto" }}>
      <Link href="/shopping-guides" style={{ fontFamily: "var(--sans)" }}>back to guides</Link>
      <h1 className="font-serif" style={{ fontSize: "clamp(2rem,5vw,4rem)", marginTop: 24 }}>{guide.title}</h1>
      <p style={{ fontFamily: "var(--sans)", color: "var(--ink-soft)", marginTop: 12 }}>{guide.summary}</p>
      <section style={{ marginTop: 32 }}>
        <h2 className="font-serif">How PaletteMe evaluates products</h2>
        <ul>{guide.shoppingRules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
      </section>
      <section style={{ marginTop: 32 }}>
        <h2 className="font-serif">Near-face color rules</h2>
        <ul>{guide.nearFaceRules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
      </section>
      <section style={{ marginTop: 32 }}>
        <h2 className="font-serif">Sub-season notes</h2>
        {guide.subSeasonNotes.map((note) => (
          <article key={note.name} style={{ marginTop: 16 }}>
            <h3>{note.name}</h3>
            <p>{note.note}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
```

- [ ] **Step 7: Link public pages from the landing footer**

Modify `app/page.tsx` footer link area so reviewers can reach:

```tsx
<a href="/shopping-guides">shopping guides</a>
<a href="/demo/feed">demo feed</a>
<a href="/affiliate-disclosure">affiliate disclosure</a>
<a href="/privacy">privacy</a>
<a href="/contact">contact</a>
```

- [ ] **Step 8: Verify route build behavior**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands complete successfully.

- [ ] **Step 9: Commit**

```bash
git add app/demo/feed/page.tsx app/shopping-guides lib/shopping-guides.ts lib/shopping-guides.test.ts app/page.tsx
git commit -m "feat: add public affiliate reviewer surface"
```

---

### Task 2: Compliance Pages And Reusable Disclosure

**Files:**
- Create: `lib/affiliate-disclosure.ts`
- Create: `components/affiliate/affiliate-disclosure.tsx`
- Create: `app/affiliate-disclosure/page.tsx`
- Create: `app/about/page.tsx`
- Create: `app/contact/page.tsx`
- Create: `app/privacy/page.tsx`
- Create: `app/terms/page.tsx`
- Modify: `components/feed/product-feed.tsx`
- Test: `lib/affiliate-disclosure.test.ts`

- [ ] **Step 1: Write disclosure tests**

Create `lib/affiliate-disclosure.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  AMAZON_ASSOCIATE_DISCLOSURE,
  GENERAL_AFFILIATE_DISCLOSURE,
  getAffiliateDisclosure,
} from "./affiliate-disclosure.ts";

test("general affiliate disclosure is explicit", () => {
  assert.match(GENERAL_AFFILIATE_DISCLOSURE, /commission/i);
  assert.match(GENERAL_AFFILIATE_DISCLOSURE, /purchase/i);
});

test("amazon disclosure contains required associate language", () => {
  assert.match(AMAZON_ASSOCIATE_DISCLOSURE, /As an Amazon Associate I earn from qualifying purchases/i);
});

test("amazon links receive amazon-specific disclosure", () => {
  assert.equal(
    getAffiliateDisclosure("https://www.amazon.com/dp/example"),
    AMAZON_ASSOCIATE_DISCLOSURE
  );
});
```

- [ ] **Step 2: Run failing disclosure tests**

Run:

```bash
npm test -- lib/affiliate-disclosure.test.ts
```

Expected: FAIL because `lib/affiliate-disclosure.ts` does not exist.

- [ ] **Step 3: Create disclosure helper**

Create `lib/affiliate-disclosure.ts`:

```ts
export const GENERAL_AFFILIATE_DISCLOSURE =
  "Some product links are affiliate links. If you click and make a purchase, PaletteMe may earn a commission at no extra cost to you.";

export const AMAZON_ASSOCIATE_DISCLOSURE =
  "As an Amazon Associate I earn from qualifying purchases.";

export function isAmazonLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host === "amazon.com" || host.endsWith(".amazon.com");
  } catch {
    return false;
  }
}

export function getAffiliateDisclosure(url?: string): string {
  if (url && isAmazonLink(url)) return AMAZON_ASSOCIATE_DISCLOSURE;
  return GENERAL_AFFILIATE_DISCLOSURE;
}
```

- [ ] **Step 4: Create reusable disclosure component**

Create `components/affiliate/affiliate-disclosure.tsx`:

```tsx
import { GENERAL_AFFILIATE_DISCLOSURE } from "@/lib/affiliate-disclosure";

export function AffiliateDisclosure({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      aria-label="Affiliate disclosure"
      style={{
        fontFamily: "var(--sans)",
        fontSize: compact ? "0.78rem" : "0.88rem",
        lineHeight: 1.5,
        color: "var(--ink)",
        background: "rgba(255,255,255,0.72)",
        border: "1px solid var(--hair)",
        borderRadius: 8,
        padding: compact ? "10px 12px" : "14px 16px",
        marginBottom: 18,
      }}
    >
      {GENERAL_AFFILIATE_DISCLOSURE}{" "}
      <a href="/affiliate-disclosure" style={{ textDecoration: "underline" }}>
        Learn how PaletteMe makes money.
      </a>
    </aside>
  );
}
```

- [ ] **Step 5: Replace feed disclosure text**

In `components/feed/product-feed.tsx`, import and render:

```tsx
import { AffiliateDisclosure } from "@/components/affiliate/affiliate-disclosure";
```

Replace the existing disclosure paragraph with:

```tsx
<AffiliateDisclosure compact />
```

- [ ] **Step 6: Create legal/trust pages**

Create `app/affiliate-disclosure/page.tsx`:

```tsx
export default function AffiliateDisclosurePage() {
  return (
    <main className="page-shell" style={{ padding: "48px 20px", maxWidth: 820, margin: "0 auto" }}>
      <h1 className="font-serif">Affiliate disclosure</h1>
      <p>Some product links on PaletteMe are affiliate links. If you click a link and make a purchase, PaletteMe may earn a commission at no extra cost to you.</p>
      <p>Affiliate relationships do not change the color and style logic used in our recommendations. PaletteMe ranks products by color harmony, practical styling use, and profile fit before showing a shopping link.</p>
      <p>As an Amazon Associate I earn from qualifying purchases.</p>
    </main>
  );
}
```

Create `app/about/page.tsx`:

```tsx
export default function AboutPage() {
  return (
    <main className="page-shell" style={{ padding: "48px 20px", maxWidth: 820, margin: "0 auto" }}>
      <h1 className="font-serif">About PaletteMe</h1>
      <p>PaletteMe is a personal style assistant that helps people understand which colors, makeup shades, wardrobe items, outfits, and products suit their natural coloring and style goals.</p>
      <p>Color analysis is the entry point. The broader product helps shoppers decide what to wear, what to buy, what to skip, and how to use what they already own.</p>
    </main>
  );
}
```

Create `app/contact/page.tsx`:

```tsx
export default function ContactPage() {
  return (
    <main className="page-shell" style={{ padding: "48px 20px", maxWidth: 820, margin: "0 auto" }}>
      <h1 className="font-serif">Contact</h1>
      <p>For product, privacy, affiliate, or partnership questions, contact PaletteMe at hello@paletteme.app.</p>
    </main>
  );
}
```

Create `app/privacy/page.tsx`:

```tsx
export default function PrivacyPage() {
  return (
    <main className="page-shell" style={{ padding: "48px 20px", maxWidth: 820, margin: "0 auto" }}>
      <h1 className="font-serif">Privacy</h1>
      <p>Photos are processed securely for analysis. PaletteMe does not sell or share your images.</p>
      <p>Quiz answers and style preferences are used to create your color and shopping guidance. If you create an account, saved profile and product data can be connected to that account so you can return to it later.</p>
      <p>Product links may include affiliate tracking parameters so PaletteMe can earn commission when a purchase is made.</p>
    </main>
  );
}
```

Create `app/terms/page.tsx`:

```tsx
export default function TermsPage() {
  return (
    <main className="page-shell" style={{ padding: "48px 20px", maxWidth: 820, margin: "0 auto" }}>
      <h1 className="font-serif">Terms</h1>
      <p>PaletteMe provides style and shopping guidance for informational purposes. Recommendations are based on quiz answers, optional photo analysis, product metadata, and user corrections.</p>
      <p>Merchant prices, availability, shipping, returns, and customer service are controlled by the merchant. PaletteMe is not responsible for merchant order handling.</p>
    </main>
  );
}
```

- [ ] **Step 7: Verify disclosure tests**

Run:

```bash
npm test -- lib/affiliate-disclosure.test.ts
npm run lint
npm run build
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add lib/affiliate-disclosure.ts lib/affiliate-disclosure.test.ts components/affiliate app/affiliate-disclosure app/about app/contact app/privacy app/terms components/feed/product-feed.tsx
git commit -m "feat: add affiliate disclosure and trust pages"
```

---

### Task 3: Product Cards With Original Recommendation Value

**Files:**
- Create: `components/feed/product-card.tsx`
- Create: `components/feed/product-feed-empty-state.tsx`
- Modify: `components/feed/product-feed.tsx`
- Modify: `app/api/feed/route.ts`
- Modify: `app/api/products/route.ts`
- Test: `lib/product-recommendation-copy.test.ts`

- [ ] **Step 1: Write product recommendation copy tests**

Create `lib/product-recommendation-copy.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { buildProductReason } from "./product-recommendation-copy.ts";

test("builds a practical reason from season and score", () => {
  const reason = buildProductReason({
    seasonName: "Autumn",
    score: 0.92,
    colorName: "terracotta",
    productName: "Terracotta blouse",
  });

  assert.match(reason, /Autumn/i);
  assert.match(reason, /terracotta/i);
  assert.match(reason, /near your face|close to your face/i);
});

test("does not pretend low score products are perfect", () => {
  const reason = buildProductReason({
    seasonName: "Summer",
    score: 0.48,
    colorName: "neon orange",
    productName: "Neon knit",
  });

  assert.match(reason, /balance|away from your face|skip/i);
});
```

- [ ] **Step 2: Run failing copy tests**

Run:

```bash
npm test -- lib/product-recommendation-copy.test.ts
```

Expected: FAIL because `lib/product-recommendation-copy.ts` does not exist.

- [ ] **Step 3: Create product reason helper**

Create `lib/product-recommendation-copy.ts`:

```ts
export type ProductReasonInput = {
  seasonName: string;
  score: number;
  colorName?: string;
  productName: string;
};

export function buildProductReason(input: ProductReasonInput): string {
  const color = input.colorName ? input.colorName.toLowerCase() : "this color";
  if (input.score >= 0.82) {
    return `${color} is a strong ${input.seasonName} direction, so ${input.productName} should work close to your face and anchor outfits in your palette.`;
  }
  if (input.score >= 0.58) {
    return `${input.productName} is a maybe for ${input.seasonName}: use ${color} with better palette colors near your face, or repeat it in accessories so it feels intentional.`;
  }
  return `${input.productName} is not the easiest ${input.seasonName} buy. Keep it away from your face, balance it with stronger palette colors, or skip it if you need a high-confidence piece.`;
}
```

- [ ] **Step 4: Add reason fields to API responses**

In `app/api/feed/route.ts`, import:

```ts
import { buildProductReason } from "@/lib/product-recommendation-copy";
import { SEASONS } from "@/lib/landing-data";
```

Resolve the season name near the top of `GET`:

```ts
const seasonName = SEASONS.find((item) => item.id === season)?.name ?? "your palette";
```

When mapping products, include:

```ts
reason: buildProductReason({
  seasonName,
  score: p.score,
  colorName: p.hex,
  productName: p.name,
}),
```

For demo fallback include:

```ts
reason: buildProductReason({
  seasonName,
  score: p.match / 100,
  colorName: p.hex,
  productName: p.name,
}),
```

- [ ] **Step 5: Extract product card component**

Create `components/feed/product-card.tsx` from the current inline `ProductCard` and add:

```tsx
{product.reason && (
  <p style={{ fontFamily: "var(--sans)", fontSize: "0.76rem", color: "var(--ink-soft)", lineHeight: 1.45, marginBottom: 10 }}>
    {product.reason}
  </p>
)}
```

Keep click tracking:

```tsx
fetch("/api/interactions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ productId: product.id, action: "click" }),
}).catch(() => {});
```

- [ ] **Step 6: Remove unfinished placeholder wording**

In `components/feed/product-feed.tsx`, remove:

```tsx
Showing placeholder picks -- real ShopStyle feed coming soon
```

Replace with a launch-ready fallback:

```tsx
{source === "demo" && (
  <p style={{ fontFamily: "var(--sans)", fontSize: "0.76rem", color: "var(--ink-soft)", opacity: 0.72, marginBottom: 20 }}>
    Showing curated sample picks while live retailer feeds are being reviewed.
  </p>
)}
```

- [ ] **Step 7: Verify copy and build**

Run:

```bash
npm test -- lib/product-recommendation-copy.test.ts
npm run lint
npm run build
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add lib/product-recommendation-copy.ts lib/product-recommendation-copy.test.ts app/api/feed/route.ts app/api/products/route.ts components/feed
git commit -m "feat: add product match reasons to feed"
```

---

### Task 4: Merchant Approval Gating And Safer Affiliate Routing

**Files:**
- Create: `lib/affiliate-merchant.ts`
- Modify: `lib/affiliate.ts`
- Modify: `lib/affiliate.test.ts`
- Modify: `app/api/feed/route.ts`
- Modify: `app/api/products/route.ts`

- [ ] **Step 1: Add merchant tests**

Append to `lib/affiliate.test.ts`:

```ts
test("does not affiliate-wrap merchants that are not approved", () => {
  const original = "https://www.asos.com/product/123";
  assert.equal(
    buildAffiliateUrl(original, {
      AFFILIATE_ENABLED: "true",
      AFFILIATE_NETWORK: "rakuten",
      RAKUTEN_SITE_ID: "site-abc",
      RAKUTEN_ASOS_MID: "merchant-xyz",
      AFFILIATE_APPROVED_MERCHANTS: "",
    }),
    original
  );
});

test("wraps approved ASOS merchant through configured network", () => {
  const wrapped = buildAffiliateUrl("https://www.asos.com/product/123", {
    AFFILIATE_ENABLED: "true",
    AFFILIATE_NETWORK: "rakuten",
    RAKUTEN_SITE_ID: "site-abc",
    RAKUTEN_ASOS_MID: "merchant-xyz",
    AFFILIATE_APPROVED_MERCHANTS: "asos",
  });
  assert.equal(new URL(wrapped).hostname, "click.linksynergy.com");
});
```

- [ ] **Step 2: Run failing merchant tests**

Run:

```bash
npm test -- lib/affiliate.test.ts
```

Expected: FAIL because `AFFILIATE_APPROVED_MERCHANTS` is not supported yet.

- [ ] **Step 3: Create merchant helper**

Create `lib/affiliate-merchant.ts`:

```ts
export type AffiliateMerchantId = "asos" | "amazon";

export type AffiliateMerchant = {
  id: AffiliateMerchantId;
  name: string;
  hostnames: string[];
  category: "fashion" | "marketplace";
};

export const AFFILIATE_MERCHANTS: AffiliateMerchant[] = [
  { id: "asos", name: "ASOS", hostnames: ["asos.com", "www.asos.com"], category: "fashion" },
  { id: "amazon", name: "Amazon", hostnames: ["amazon.com", "www.amazon.com"], category: "marketplace" },
];

export function detectAffiliateMerchant(originalUrl: string): AffiliateMerchant | null {
  try {
    const url = new URL(originalUrl);
    const hostname = url.hostname.toLowerCase();
    return AFFILIATE_MERCHANTS.find((merchant) =>
      merchant.hostnames.some((host) => hostname === host || hostname.endsWith(`.${host}`))
    ) ?? null;
  } catch {
    return null;
  }
}

export function isMerchantApproved(merchantId: string, approvedList?: string): boolean {
  const approved = approvedList
    ?.split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean) ?? [];
  return approved.includes(merchantId.toLowerCase());
}
```

- [ ] **Step 4: Extend affiliate env type**

In `lib/affiliate.ts`, extend `AffiliateEnv`:

```ts
AFFILIATE_APPROVED_MERCHANTS?: string;
```

Import merchant helpers:

```ts
import { detectAffiliateMerchant, isMerchantApproved } from "@/lib/affiliate-merchant";
```

After URL parsing and already-wrapped checks:

```ts
const merchant = detectAffiliateMerchant(originalUrl);
if (!merchant || !isMerchantApproved(merchant.id, env.AFFILIATE_APPROVED_MERCHANTS)) {
  return originalUrl;
}
```

Then route:

```ts
if (merchant.id === "amazon") return withAmazonTag(url, env) ?? originalUrl;
if (merchant.id === "asos") {
  const network = env.AFFILIATE_NETWORK?.trim().toLowerCase();
  if (network === "rakuten") return withRakutenDeepLink(originalUrl, env) ?? originalUrl;
  if (network === "awin") return withAwinDeepLink(originalUrl, env) ?? originalUrl;
  return withAwinDeepLink(originalUrl, env) ?? withRakutenDeepLink(originalUrl, env) ?? originalUrl;
}
return originalUrl;
```

- [ ] **Step 5: Return merchant metadata from product APIs**

In `app/api/feed/route.ts` and `app/api/products/route.ts`, include:

```ts
merchant: "ASOS",
affiliateReady: Boolean(process.env.AFFILIATE_ENABLED),
```

For Amazon URLs, use merchant `"Amazon"`. Do not mark `affiliateReady` as true unless both `AFFILIATE_ENABLED` and the merchant approval env are present.

- [ ] **Step 6: Document env change**

In `docs/affiliate-programs.md`, add:

```env
AFFILIATE_APPROVED_MERCHANTS=asos,amazon
```

Explain: only add a merchant after the network or merchant has approved PaletteMe.

- [ ] **Step 7: Verify affiliate tests**

Run:

```bash
npm test -- lib/affiliate.test.ts
npm run lint
npm run build
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add lib/affiliate.ts lib/affiliate-merchant.ts lib/affiliate.test.ts app/api/feed/route.ts app/api/products/route.ts docs/affiliate-programs.md
git commit -m "feat: gate affiliate links by approved merchant"
```

---

### Task 5: Partner Page And Application Copy

**Files:**
- Create: `app/partners/page.tsx`
- Create: `docs/affiliate-application-copy.md`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create partner page**

Create `app/partners/page.tsx`:

```tsx
export default function PartnersPage() {
  return (
    <main className="page-shell" style={{ padding: "48px 20px", maxWidth: 920, margin: "0 auto" }}>
      <h1 className="font-serif">Partner with PaletteMe</h1>
      <p>PaletteMe helps shoppers choose fashion, beauty, and wardrobe products that fit their color direction, style goals, and existing closet.</p>
      <section>
        <h2>What makes the platform different</h2>
        <ul>
          <li>Users complete a color and style quiz before shopping recommendations.</li>
          <li>Product links are supported by original match explanations, not copied merchant descriptions.</li>
          <li>Recommendations can say buy, maybe, or skip, preserving user trust.</li>
          <li>Affiliate links are disclosed clearly and only enabled for approved merchants.</li>
        </ul>
      </section>
      <section>
        <h2>Best-fit categories</h2>
        <p>Fashion, basics, occasionwear, accessories, jewelry, makeup, skincare with shade matching, and wardrobe staples.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Partnership questions: hello@paletteme.app</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Create application copy document**

Create `docs/affiliate-application-copy.md`:

```md
# PaletteMe Affiliate Application Copy

## Site URL

Use the deployed production URL, not localhost or a preview URL.

## Site description

PaletteMe is an AI-assisted personal style and shopping platform. Users take a mobile-first color and style quiz, optionally improve accuracy with a selfie analysis, then receive product recommendations matched to their seasonal color direction, undertone, contrast, wardrobe goals, and style preferences. Product links include original styling explanations before the click.

## Category

Fashion, Lifestyle, Beauty, Shopping, Personal Styling.

## Promotional methods

Website content, shopping guides, personalized product recommendations, email or social content only after each channel has visible affiliate disclosure.

## Why advertisers should approve PaletteMe

PaletteMe does not operate as a thin coupon or product-list site. Users receive original color and style guidance before merchant links. The platform explains why a product fits, how to style borderline colors, and when to skip a purchase. This creates high-intent shopping traffic from users actively deciding what to buy.

## Current traffic note

PaletteMe is in beta/free testing mode. Use the current waitlist count, beta user count, monthly pageviews, and top geographies from analytics at the time of application.

## Reviewer links

- Public demo feed: `/demo/feed`
- Shopping guides: `/shopping-guides`
- Affiliate disclosure: `/affiliate-disclosure`
- Privacy: `/privacy`
- Contact: `/contact`
- Partner page: `/partners`
```

- [ ] **Step 3: Link partner page from footer**

Add:

```tsx
<a href="/partners">partners</a>
```

to the landing footer.

- [ ] **Step 4: Verify build**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add app/partners docs/affiliate-application-copy.md app/page.tsx
git commit -m "docs: add affiliate application materials"
```

---

### Task 6: Click And Save Analytics Readiness

**Files:**
- Modify: `app/api/interactions/route.ts`
- Modify: `components/feed/product-card.tsx`
- Modify: `docs/schema-v2.sql`
- Test: `lib/affiliate-events.test.ts`

- [ ] **Step 1: Write event payload normalization tests**

Create `lib/affiliate-events.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { normalizeAffiliateEvent } from "./affiliate-events.ts";

test("normalizes affiliate click event payload", () => {
  const event = normalizeAffiliateEvent({
    productId: "abc",
    action: "click",
    merchant: "ASOS",
    source: "demo",
    score: 0.91,
  });

  assert.equal(event.productId, "abc");
  assert.equal(event.action, "click");
  assert.equal(event.merchant, "ASOS");
  assert.equal(event.source, "demo");
  assert.equal(event.score, 0.91);
});

test("rejects unsupported interaction action", () => {
  assert.throws(() => normalizeAffiliateEvent({ productId: "abc", action: "purchase" }), /Unsupported action/);
});
```

- [ ] **Step 2: Run failing event test**

Run:

```bash
npm test -- lib/affiliate-events.test.ts
```

Expected: FAIL because `lib/affiliate-events.ts` does not exist.

- [ ] **Step 3: Create event helper**

Create `lib/affiliate-events.ts`:

```ts
export type AffiliateInteractionAction = "click" | "save";

export type AffiliateEvent = {
  productId: string;
  action: AffiliateInteractionAction;
  merchant?: string;
  source?: string;
  score?: number;
};

export function normalizeAffiliateEvent(input: Record<string, unknown>): AffiliateEvent {
  const productId = typeof input.productId === "string" ? input.productId : "";
  const action = input.action;
  if (!productId) throw new Error("Product id is required");
  if (action !== "click" && action !== "save") throw new Error("Unsupported action");
  return {
    productId,
    action,
    merchant: typeof input.merchant === "string" ? input.merchant : undefined,
    source: typeof input.source === "string" ? input.source : undefined,
    score: typeof input.score === "number" ? input.score : undefined,
  };
}
```

- [ ] **Step 4: Send richer click payloads from product card**

In `components/feed/product-card.tsx`, update click tracking:

```tsx
body: JSON.stringify({
  productId: product.id,
  action: "click",
  merchant: product.merchant,
  source: product.source,
  score,
}),
```

Update save tracking similarly with `action: "save"`.

- [ ] **Step 5: Normalize interaction route payload**

In `app/api/interactions/route.ts`, import:

```ts
import { normalizeAffiliateEvent } from "@/lib/affiliate-events";
```

Parse and normalize:

```ts
const body = await request.json();
const event = normalizeAffiliateEvent(body);
```

Use `event` for Supabase insert or fallback handling.

- [ ] **Step 6: Document analytics fields**

In `docs/schema-v2.sql`, ensure product interaction rows can store:

```sql
merchant TEXT,
source TEXT,
score NUMERIC,
```

If the existing table cannot accept these columns, add a migration note in `docs/schema-v2.sql` near `product_interactions`.

- [ ] **Step 7: Verify event tests**

Run:

```bash
npm test -- lib/affiliate-events.test.ts
npm run lint
npm run build
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add lib/affiliate-events.ts lib/affiliate-events.test.ts app/api/interactions/route.ts components/feed/product-card.tsx docs/schema-v2.sql
git commit -m "feat: enrich affiliate interaction tracking"
```

---

### Task 7: Documentation, Tracker, And Application Checklist

**Files:**
- Modify: `docs/affiliate-programs.md`
- Create: `docs/plans/2026-06-17-affiliate-acceptance-package/plan.md`
- Create: `docs/plans/2026-06-17-affiliate-acceptance-package/01-acceptance-surface.md`
- Create: `docs/plans/2026-06-17-affiliate-acceptance-package/02-product-content.md`
- Create: `docs/plans/2026-06-17-affiliate-acceptance-package/03-compliance-and-analytics.md`
- Create: `docs/plans/2026-06-17-affiliate-acceptance-package/04-qa-and-applications.md`
- Modify: `docs/TRACKER.yaml`

- [ ] **Step 1: Update affiliate guide**

Rewrite `docs/affiliate-programs.md` around this acceptance checklist:

```md
# PaletteMe Affiliate Programs Guide

## Approval goal

PaletteMe should apply as a value-adding personal style and shopping publisher, not as a coupon site, thin affiliate site, or unfinished AI demo.

## Minimum before applying

- Deployed production URL.
- Public demo feed at `/demo/feed`.
- Public shopping guides at `/shopping-guides`.
- Visible affiliate disclosure on every product-link page.
- Dedicated `/affiliate-disclosure`, `/privacy`, `/terms`, `/about`, `/contact`, and `/partners` pages.
- Product cards explain why an item matches before linking out.
- No unfinished copy such as "coming soon" on reviewer-critical pages.
- Affiliate tracking enabled only for approved merchants.

## Recommended application order

1. Rakuten Advertising as the first fashion network.
2. Apply to ASOS, H&M, Nordstrom, Macy's, Revolve, and Sephora where available.
3. Amazon Associates as a broad-catalog backup after the public demo and disclosure pages are live.
4. Awin for UK/EU fashion and beauty merchants.

## Environment variables

AFFILIATE_ENABLED=false
AFFILIATE_NETWORK=
AFFILIATE_APPROVED_MERCHANTS=
RAKUTEN_SITE_ID=
RAKUTEN_ASOS_MID=
AWIN_PUBLISHER_ID=
AWIN_ASOS_MID=
AMAZON_ASSOCIATE_TAG=

## Compliance rules

- Product links work without affiliate credentials.
- Affiliate links are visible only after merchant approval.
- Amazon links include the required Amazon Associate disclosure.
- Product claims, prices, and promotions must be current and accurate.
- Paid social posts must include clear disclosures in the post itself.
```

- [ ] **Step 2: Create active plan folder if execution begins**

Create `docs/plans/2026-06-17-affiliate-acceptance-package/plan.md`:

```md
# Affiliate Acceptance Package

Status: in-progress
Created: 2026-06-17

## Goal

Prepare PaletteMe for affiliate network and merchant approval by adding a reviewable public surface, original shopping content, clear disclosures, safer affiliate routing, and application materials.

## Tasks

1. Acceptance surface.
2. Product content.
3. Compliance and analytics.
4. QA and applications.
```

Create task files with status `pending` or `in-progress` matching the current task.

- [ ] **Step 3: Update tracker**

Add to `docs/TRACKER.yaml`:

```yaml
  - name: affiliate-acceptance-package
    path: plans/2026-06-17-affiliate-acceptance-package/
    status: in-progress
    created: 2026-06-17
    started: 2026-06-17
    tasks:
      - name: acceptance-surface
        file: 01-acceptance-surface.md
        status: pending
      - name: product-content
        file: 02-product-content.md
        status: pending
      - name: compliance-and-analytics
        file: 03-compliance-and-analytics.md
        status: pending
      - name: qa-and-applications
        file: 04-qa-and-applications.md
        status: pending
```

- [ ] **Step 4: Verify docs**

Run:

```bash
rg -n "coming soon|placeholder|real ShopStyle feed coming soon|TODO" app components docs/affiliate-programs.md docs/affiliate-application-copy.md
```

Expected: no reviewer-facing unfinished affiliate copy remains. Existing unrelated historical plan files can contain old task language.

- [ ] **Step 5: Commit**

```bash
git add docs/affiliate-programs.md docs/affiliate-application-copy.md docs/plans/2026-06-17-affiliate-acceptance-package docs/TRACKER.yaml
git commit -m "docs: track affiliate acceptance package"
```

---

### Task 8: Final QA And Application Submission Runbook

**Files:**
- Create: `docs/affiliate-submission-runbook.md`
- Modify: `docs/affiliate-programs.md`

- [ ] **Step 1: Create submission runbook**

Create `docs/affiliate-submission-runbook.md`:

```md
# Affiliate Submission Runbook

## Pre-submit QA

Run:

```bash
npm test -- lib/affiliate.test.ts lib/affiliate-disclosure.test.ts lib/product-recommendation-copy.test.ts lib/shopping-guides.test.ts lib/affiliate-events.test.ts
npm run lint
npm run build
```

## Browser smoke test

Check these production URLs:

- `/`
- `/quiz`
- `/demo/feed`
- `/shopping-guides`
- `/shopping-guides/autumn`
- `/affiliate-disclosure`
- `/privacy`
- `/terms`
- `/about`
- `/contact`
- `/partners`

## Reviewer checklist

- The site is live and not under construction.
- The demo feed works without a private account.
- Product cards include original match reasons.
- Affiliate disclosure appears above or near product links.
- Legal/contact pages are reachable from public navigation or footer.
- Product links open real merchant URLs when affiliate credentials are disabled.
- Affiliate links are enabled only for merchants listed in `AFFILIATE_APPROVED_MERCHANTS`.

## Application order

1. Rakuten publisher account.
2. Rakuten merchant applications: ASOS first, then H&M, Nordstrom, Macy's, Revolve, Sephora where available.
3. Amazon Associates after public pages and Amazon disclosure are live.
4. Awin for UK/EU merchants.

## After approval

1. Add merchant credentials to production env vars.
2. Add merchant id to `AFFILIATE_APPROVED_MERCHANTS`.
3. Smoke test one link per merchant.
4. Record approval date, network, merchant id, and notes in `docs/affiliate-programs.md`.
```

- [ ] **Step 2: Run final test suite**

Run:

```bash
npm test -- lib/affiliate.test.ts lib/affiliate-disclosure.test.ts lib/product-recommendation-copy.test.ts lib/shopping-guides.test.ts lib/affiliate-events.test.ts
npm run lint
npm run build
```

Expected: all tests, lint, and build pass.

- [ ] **Step 3: Production smoke test**

After deploy, manually open:

```text
https://<production-domain>/demo/feed
https://<production-domain>/affiliate-disclosure
https://<production-domain>/shopping-guides
https://<production-domain>/partners
```

Expected:

- Demo feed loads.
- Product cards explain match reasons.
- Disclosure is visible without opening another page.
- Links open merchants in a new tab.
- No "under construction" or unfinished placeholder text appears.

- [ ] **Step 4: Submit applications**

Use `docs/affiliate-application-copy.md` for:

- Rakuten publisher application.
- ASOS merchant application inside Rakuten.
- Amazon Associates site description.
- Awin publisher profile and merchant applications.

- [ ] **Step 5: Commit runbook**

```bash
git add docs/affiliate-submission-runbook.md docs/affiliate-programs.md
git commit -m "docs: add affiliate submission runbook"
```

---

## Execution Order

1. Task 1 first because reviewers need a public route that does not require private quiz state.
2. Task 2 second because disclosures and legal pages are approval prerequisites.
3. Task 3 third because original recommendation value is the main anti-thin-affiliate signal.
4. Task 4 fourth because affiliate links must not activate before merchant approval.
5. Task 5 fifth because application copy depends on the reviewer URLs existing.
6. Task 6 sixth because analytics is useful for applications but not needed for the first public surface.
7. Task 7 seventh because docs/tracker should reflect the concrete implementation state.
8. Task 8 last because it is the final pre-submit runbook.

## Definition Of Done

- `/demo/feed` is public and reviewable without auth or local storage.
- `/shopping-guides` and season guide pages provide original content before shopping links.
- Product cards include match reasons and practical styling notes.
- Affiliate disclosure appears on every page with product links.
- `/affiliate-disclosure`, `/privacy`, `/terms`, `/about`, `/contact`, and `/partners` exist.
- `lib/affiliate.ts` only wraps links for approved merchants.
- Amazon links can show the required Amazon Associate disclosure when used.
- No reviewer-facing unfinished copy remains.
- Tests, lint, and build pass.
- Application copy and submission runbook are ready.

## Self-Review

- Spec coverage: public reviewer path, original content, disclosure, legal pages, merchant gating, analytics, docs, and submission workflow are covered.
- Placeholder scan: the plan uses no placeholder implementation steps; each task has explicit files, code snippets, commands, and expected outcomes.
- Type consistency: new helper names are consistent across tests and implementation steps: `SHOPPING_GUIDES`, `buildProductReason`, `AffiliateDisclosure`, `detectAffiliateMerchant`, `isMerchantApproved`, `normalizeAffiliateEvent`.
