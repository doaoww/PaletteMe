import { NextResponse } from "next/server";
import { SEASONS } from "@/lib/landing-data";
import { searchProducts, rankProduct } from "@/lib/shopstyle";
import { buildAffiliateUrl } from "@/lib/affiliate";
import { rankShoppingIntents, toFeedShoppingProduct } from "@/lib/shopping-matcher";
import { rankCuratedProducts, toFeedCuratedProduct } from "@/lib/curated-product-matcher";
import { buildShoppingQuery, searchGoogleShopping, toFeedSerpProducts } from "@/lib/serpapi";
import type {
  BudgetPref,
  ClimatePref,
  HeightRange,
  MakeupPref,
  OccasionPref,
  StyleDirection,
  StyleTrend,
  WardrobeType,
  WeightRange,
} from "@/lib/quiz-data";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season") ?? "spring";
  const bodyType = searchParams.get("bodyType") ?? "";
  const aesthetics = searchParams.get("aesthetics")?.split(",").filter(Boolean) ?? [];
  const styleDirections = searchParams.get("styleDirections")?.split(",").filter(Boolean) as StyleDirection[];
  const occasions = searchParams.get("occasions")?.split(",").filter(Boolean) as OccasionPref[];
  const trends = searchParams.get("trends")?.split(",").filter(Boolean) as StyleTrend[];
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10) || 0);

  // Use Serpapi Google Shopping if key is configured
  if (process.env.SERPAPI_KEY) {
    const query = buildShoppingQuery({
      season,
      subSeason: searchParams.get("subSeason") ?? undefined,
      wardrobeType: searchParams.get("wardrobeType") ?? undefined,
      category: searchParams.get("category") ?? "",
      styleDirections: styleDirections ?? [],
    });

    const results = await searchGoogleShopping({ query, num: 40, start: offset });
    const products = toFeedSerpProducts(results, query).slice(0, 20);

    return NextResponse.json({ ok: true, products, source: "serpapi" });
  }

  // Use ShopStyle if UID is configured
  if (process.env.SHOPSTYLE_UID) {
    const SEASON_QUERIES: Record<string, string> = {
      spring: "coral peach mint spring women clothing",
      summer: "dusty rose lavender soft blue summer women dress",
      autumn: "terracotta rust camel knit autumn women",
      winter: "navy cobalt jewel black blazer winter women",
    };

    const products = await searchProducts({
      fts: SEASON_QUERIES[season] ?? "women clothing",
      limit: 40,
      offset,
    });

    const palette = {
      best: [] as string[],  // populated when Supabase profile is available
      avoid: [] as string[],
    };

    const ranked = products
      .map((p) => ({ ...p, score: rankProduct(p, palette, aesthetics, bodyType) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((p) => ({ ...p, clickUrl: buildAffiliateUrl(p.clickUrl) }));

    return NextResponse.json({ ok: true, products: ranked, source: "shopstyle" });
  }

  const category = searchParams.get("category") ?? "";
  const seasonName = SEASONS.find((item) => item.id === season)?.name ?? "your palette";
  const matchProfile = {
    seasonId: season,
    seasonName,
    subSeason: searchParams.get("subSeason") ?? undefined,
    bodyType: bodyType || undefined,
    styleVector: {
      aesthetics,
      occasions,
    },
    answers: {
      wardrobeType: (searchParams.get("wardrobeType") as WardrobeType | null) ?? undefined,
      height: (searchParams.get("height") as HeightRange | null) ?? undefined,
      weightRange: (searchParams.get("weightRange") as WeightRange | null) ?? undefined,
      budgetPref: (searchParams.get("budgetPref") as BudgetPref | null) ?? undefined,
      climatePref: (searchParams.get("climatePref") as ClimatePref | null) ?? undefined,
      makeupPref: (searchParams.get("makeupPref") as MakeupPref | null) ?? undefined,
      styleDirections,
      occasions,
      trends,
    },
  };

  const pageSize = 20;
  const curatedAll = rankCuratedProducts(matchProfile, { limit: 100, offset: 0 })
    .filter((p) => !category || p.intent.category === category);
  const curatedPage = curatedAll.slice(offset, offset + pageSize).map(toFeedCuratedProduct);
  const remaining = pageSize - curatedPage.length;
  const intentOffset = Math.max(0, offset - curatedAll.length);
  const intentPage =
    remaining > 0
      ? rankShoppingIntents(matchProfile, { limit: remaining * 3, offset: intentOffset })
          .filter((p) => !category || p.intent.category === category)
          .slice(0, remaining)
          .map(toFeedShoppingProduct)
      : [];

  const ranked = [...curatedPage, ...intentPage];
  const source =
    curatedPage.length > 0
      ? intentPage.length > 0
        ? "curated-products+intent-catalog"
        : "curated-products"
      : "intent-catalog";

  return NextResponse.json({ ok: true, products: ranked, source });
}
