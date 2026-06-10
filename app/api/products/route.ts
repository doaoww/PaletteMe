import { NextResponse } from "next/server";
import { chromium } from "playwright";
import LLMScraper from "llm-scraper";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Output } from "ai";
import { z } from "zod";
import { SEASON_PRODUCTS } from "@/lib/landing-data";
import {
  buildMarketplaceSearchUrl,
  cacheKeyForContext,
  getSeasonPalette,
  scoreProductMatch,
  type ProductSearchContext,
} from "@/lib/product-matching";
import type { StylingGoal, StyleVibe } from "@/lib/quiz-data";

export const runtime = "nodejs";
export const maxDuration = 60;

type ScoredProduct = ScrapedProduct & { match: number; hex?: string };

type CacheEntry = { products: ScoredProduct[]; ts: number };
const cache = new Map<string, CacheEntry>();
const TTL = 2 * 60 * 60 * 1000;

const productItemSchema = z.object({
  name: z.string().describe("product name"),
  brand: z.string().optional().describe("brand name"),
  price: z.string().optional().describe("price with currency symbol, e.g. $49.99"),
  url: z.string().describe("full absolute product URL starting with https://"),
  imageUrl: z.string().optional().describe("full absolute image URL starting with https://"),
  color: z.string().optional().describe("main color of the item as plain text, e.g. dusty rose"),
});

const productSchema = z.object({
  products: z
    .array(productItemSchema)
    .max(8)
    .describe("fashion products visible on the page"),
});

const ProductOutput = Output.object({ schema: productSchema });

export type ScrapedProduct = z.infer<typeof productItemSchema>;

const VALID_SEASONS = new Set(["spring", "summer", "autumn", "winter"]);
const VALID_STYLES = new Set<StyleVibe>([
  "minimalist",
  "classic",
  "casual",
  "feminine",
  "edgy",
]);
const VALID_GOALS = new Set<StylingGoal>([
  "clothing-colors",
  "capsule",
  "seasonal-palette",
  "makeup-hair",
]);

function demoFallback(season: string): ScoredProduct[] {
  const picks = SEASON_PRODUCTS[season] ?? [];
  return picks.map((p) => ({
    name: p.name,
    brand: p.brand,
    price: p.price,
    url: `https://www.asos.com/search/?q=${encodeURIComponent(p.name)}`,
    imageUrl: p.image,
    color: undefined,
    match: p.match,
    hex: p.hex,
  }));
}

function enrichWithScores(
  products: ScrapedProduct[],
  palette: string[]
): ScoredProduct[] {
  return products
    .map((p) => {
      const { match, hex } = scoreProductMatch(p.color, p.name, palette);
      return { ...p, match, hex };
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 6);
}

function parseContext(searchParams: URLSearchParams): ProductSearchContext | null {
  const seasonId = searchParams.get("season")?.toLowerCase();
  if (!seasonId || !VALID_SEASONS.has(seasonId)) return null;

  const styleRaw = searchParams.get("style")?.toLowerCase();
  const goalRaw = searchParams.get("goal")?.toLowerCase();

  return {
    seasonId,
    styleVibe: styleRaw && VALID_STYLES.has(styleRaw as StyleVibe)
      ? (styleRaw as StyleVibe)
      : undefined,
    goal: goalRaw && VALID_GOALS.has(goalRaw as StylingGoal)
      ? (goalRaw as StylingGoal)
      : undefined,
    subSeason: searchParams.get("subSeason") ?? undefined,
  };
}

export async function GET(request: Request) {
  const ctx = parseContext(new URL(request.url).searchParams);

  if (!ctx) {
    return NextResponse.json({ error: "Invalid season" }, { status: 400 });
  }

  const key = cacheKeyForContext(ctx);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) {
    return NextResponse.json({ ok: true, products: hit.products, source: "cache" });
  }

  const palette = getSeasonPalette(ctx.seasonId);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: true, products: demoFallback(ctx.seasonId), source: "demo" });
  }

  let browser: import("playwright").Browser | null = null;

  try {
    const googleAI = createGoogleGenerativeAI({ apiKey });
    const scraper = new LLMScraper(googleAI("gemini-2.5-flash-lite"));
    const searchUrl = buildMarketplaceSearchUrl(ctx);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
    });
    const page = await context.newPage();

    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page
      .waitForSelector("article, [data-auto-id='productTile'], .product-list-item", {
        timeout: 10_000,
      })
      .catch(() => null);
    await page.waitForTimeout(1500);

    const { data } = await scraper.run(page, ProductOutput, { format: "html" });

    const scraped = (data.products ?? []).filter(
      (p) => p.name && p.url && p.url.startsWith("http")
    );

    if (scraped.length > 0) {
      const scored = enrichWithScores(scraped, palette);
      cache.set(key, { products: scored, ts: Date.now() });
      return NextResponse.json({ ok: true, products: scored, source: "scraped" });
    }

    return NextResponse.json({ ok: true, products: demoFallback(ctx.seasonId), source: "demo" });
  } catch (error) {
    console.error("[products]", (error as Error).message);
    return NextResponse.json({ ok: true, products: demoFallback(ctx.seasonId), source: "demo" });
  } finally {
    if (browser) await browser.close();
  }
}
