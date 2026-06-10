# PaletteMe — Affiliate Programs Guide

How to monetize marketplace product picks with affiliate commissions.

---

## How it works

```
User clicks "shop now" on PaletteMe
    → your affiliate tracking link
    → ASOS / H&M / etc.
    → user buys within cookie window (usually 30–45 days)
    → you earn commission (typically 3–10%)
```

PaletteMe scrapes ASOS products via `/api/products`. Once approved for affiliate programs, replace plain product URLs with **tracking links** before showing them in the dashboard.

**You do not sign up with each shop directly.** You join an **affiliate network**, get approved for each brand inside that network, then wrap product links in your app.

---

## Networks to join (start here)

| Network | Best for | Sign up | Fashion brands |
|---------|----------|---------|----------------|
| [Rakuten Advertising](https://rakutenadvertising.com/) | **Start here** — ASOS matches current scraper | [Publishers signup](https://rakutenadvertising.com/publishers/) | ASOS, H&M, Nordstrom, Macy's, Revolve |
| [Awin](https://www.awin.com/) | Europe / UK | Publisher registration | ASOS, Zara, & Other Stories, Mango |
| [CJ Affiliate](https://www.cj.com/) | US mid-range fashion | Publisher signup | Nordstrom, Gap, many US brands |
| [Impact](https://impact.com/) | Beauty + fashion | Creator/publisher | Sephora, Ulta, many DTC brands |
| [Amazon Associates](https://affiliate-program.amazon.com/) | Easiest approval, broad catalog | Direct | Everything (lower % ~1–4%) |
| [LTK](https://company.shopltk.com/) | Creator-focused | Invite / apply | 5,000+ brands, 10–20% on some |

> **Note:** ShopStyle / Collective Voice is winding down (links deactivated March 2026). Use Rakuten or LTK instead.

**Recommended for PaletteMe:** Rakuten first (ASOS is already the scrape target), then Awin if EU-based.

---

## Step-by-step setup

### 1. Register as a publisher

1. Go to [Rakuten Advertising — Publishers](https://rakutenadvertising.com/publishers/).
2. Create a **publisher** account (not advertiser).
3. Add your site:
   - **URL:** deployed PaletteMe domain (e.g. `paletteme.vercel.app` — `localhost` will not be accepted).
   - **Description:** *"AI personal color analysis app. Users discover their seasonal palette and get curated fashion product recommendations matched to their colors."*
   - **Category:** Fashion / Lifestyle / Beauty.
4. Wait for approval (typically a few days).

Repeat on [Awin](https://www.awin.com/) for EU brands if needed.

### 2. Apply to individual shops (inside the network)

Search and apply in the network dashboard:

| Shop | Fits PaletteMe? | Typical commission |
|------|-----------------|--------------------|
| **ASOS** | Yes — already integrated in scraper | ~3.5–7% |
| **H&M** | Yes — basics, wide range | ~5–10% |
| **Nordstrom** | Yes — quality picks | ~5% |
| **Macy's** | US audience | ~5–8% |
| **Revolve** | Trendy / feminine styles | ~5–10% |
| **Sephora** | Makeup/hair quiz goal | ~5–10% |
| **& Other Stories / COS** | Often via Awin | varies |
| **Zara** | Via Awin (EU) | varies |

Each program approves separately. Fashion/lifestyle apps with a live site are usually accepted.

### 3. Get tracking credentials

After approval, the network provides:

- **Publisher / Site ID** (Rakuten: "SID")
- **Merchant ID** per brand (ASOS has its own)
- **Link generator** or **deep link** tool

**Rakuten deep link format (example):**

```
https://click.linksynergy.com/deeplink?id=YOUR_SID&mid=ASOS_MERCHANT_ID&murl=ENCODED_PRODUCT_URL
```

In the dashboard: **Links → Deep Link** → paste the ASOS product URL → copy the tracking link.

### 4. Wire into PaletteMe

Add to `.env.local` after approval:

```env
# Rakuten — fill after publisher approval
RAKUTEN_SITE_ID=your_sid_here
RAKUTEN_ASOS_MID=asos_merchant_id

AFFILIATE_ENABLED=true
```

Wrap product URLs in `app/api/products/route.ts` (or `lib/affiliate.ts` when implemented) before returning JSON to the dashboard.

---

## Application tips (approval)

Networks expect a real, live product:

1. Deploy PaletteMe (Vercel or similar).
2. Working flow: quiz → selfie → results → product picks.
3. Simple **Privacy** page.
4. Optional disclosure: *"Some product links are affiliate links; we may earn a commission at no extra cost to you."*

---

## Suggested rollout

| Phase | Action |
|-------|--------|
| **Week 1** | Sign up [Rakuten Publishers](https://rakutenadvertising.com/publishers/) + [Amazon Associates](https://affiliate-program.amazon.com/) as backup |
| **After deploy** | Apply to ASOS, H&M, Sephora inside Rakuten |
| **When approved** | Add `RAKUTEN_SITE_ID` + `RAKUTEN_ASOS_MID` to `.env.local`; implement link wrapping in `/api/products` |
| **Later** | Add Awin (Zara, COS) or LTK if creator access is granted |

---

## Commission expectations

| Retailer / network | Commission | Cookie window |
|--------------------|------------|---------------|
| ASOS (via Rakuten) | ~3.5–7% | 30–45 days |
| H&M / fashion | ~5–10% | ~30 days |
| Amazon Associates | ~1–4% | 24 hours (varies) |
| LTK brands | ~5–20% | varies by brand |

Earnings are per **sale**, not per click (except some creator platforms).

---

## PaletteMe code references

| File | Role |
|------|------|
| `app/api/products/route.ts` | Scrapes ASOS, returns product URLs |
| `lib/product-matching.ts` | Search queries + color match scoring |
| `lib/landing-data.ts` | `SEASON_PRODUCTS` demo fallback |
| `components/dashboard/color-analyzer.tsx` | `MarketplacePicks` UI ("shop now" links) |

---

## Related links

- [Rakuten Advertising — Publishers](https://rakutenadvertising.com/publishers/)
- [Awin — Publisher sign-up](https://www.awin.com/)
- [Amazon Associates](https://affiliate-program.amazon.com/)
- [ASOS via Involve Asia (APAC)](https://involve.asia/) — alternative network for some regions
- [LTK for creators](https://company.shopltk.com/)

---

*Last updated: June 2026*
