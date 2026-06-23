import { NextResponse } from "next/server";
import { SEASONS } from "@/lib/landing-data";
import { searchProducts, rankProduct } from "@/lib/shopstyle";
import { buildAffiliateUrl } from "@/lib/affiliate";
import { rankShoppingIntents, toFeedShoppingProduct } from "@/lib/shopping-matcher";
import { rankCuratedProducts, toFeedCuratedProduct } from "@/lib/curated-product-matcher";
import { buildShoppingQuery, searchGoogleShopping, toFeedSerpProducts } from "@/lib/serpapi";
import { buildStyleDNA } from "@/lib/style-dna";
import type { StyleDNA } from "@/lib/style-dna";
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

function buildPicksQueries(dna: StyleDNA): string[] {
  const gender = dna.gender === "man" ? "men" : "women";
  const vocab = dna.vocabulary.slice(0, 4); // top 4 style words

  // Build 6-8 specific queries combining style vocabulary + palette context
  return [
    `${vocab[0]} ${gender} ${dna.colorSeason.toLowerCase().split(" ").slice(-1)[0]}`,
    `${vocab[1] ?? vocab[0]} ${gender} ${dna.budgetTier === "budget" ? "affordable" : "quality"}`,
    `${vocab[2] ?? vocab[0]} ${gender} new`,
    `${dna.styleDirection} top ${gender}`,
    `${dna.styleDirection} trousers ${gender}`,
    `${dna.styleDirection} outerwear ${gender}`,
    `${dna.occasionMix[0]} outfit ${gender} ${dna.styleDirection}`,
    `${dna.fabricSignals[0] ?? "quality"} ${gender} top`,
  ].filter(Boolean);
}

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
    const countryCode = searchParams.get("countryCode") ?? "us";
    const query = buildShoppingQuery({
      season,
      subSeason: searchParams.get("subSeason") ?? undefined,
      wardrobeType: searchParams.get("wardrobeType") ?? undefined,
      category: searchParams.get("category") ?? "",
      styleDirections: styleDirections ?? [],
      offset,
    });

    const results = await searchGoogleShopping({ query, num: 40, start: offset, gl: countryCode });
    const products = toFeedSerpProducts(results, query, offset).slice(0, 20);

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

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const styleProfile = body?.styleProfile as Record<string, unknown> | undefined;
  const quiz = body?.quiz as Record<string, unknown> | undefined;
  const colorSeason = (body?.colorSeason as string | undefined) ?? "True Summer";
  const gender = (body?.gender as string | undefined) ?? "woman";

  let searchQueries: string[];
  if (styleProfile && quiz) {
    const dna = buildStyleDNA(
      styleProfile as { kibbeType: string; bestFabrics: string[]; colorSeasonFamily?: string },
      quiz,
      colorSeason,
      gender,
    );
    searchQueries = buildPicksQueries(dna);
  } else {
    // Fallback: generic queries based on colorSeason and gender
    const g = gender === "man" ? "men" : "women";
    searchQueries = [
      `${colorSeason.toLowerCase()} ${g} clothing`,
      `${g} outfit ${colorSeason.toLowerCase().split(" ").slice(-1)[0]}`,
      `${g} capsule wardrobe`,
    ];
  }

  if (!process.env.SERPAPI_KEY) {
    return NextResponse.json({ ok: true, products: [], queries: searchQueries, source: "dna-queries" });
  }

  // Run first 4 queries in parallel — enough for a full feed without excessive latency
  const countryCode = (body?.countryCode as string | undefined) ?? "us";
  const allResults = await Promise.all(
    searchQueries.slice(0, 4).map((q) =>
      searchGoogleShopping({ query: q, num: 10, start: 0, gl: countryCode })
    )
  );
  const merged = allResults.flat();
  const products = toFeedSerpProducts(merged, searchQueries[0], 0).slice(0, 20);

  return NextResponse.json({ ok: true, products, queries: searchQueries, source: "serpapi-dna" });
}
