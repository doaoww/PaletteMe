// Stage 2 of two-stage analysis.
// Accepts profile data already computed by /api/style-analysis/mini (no photos needed).
// Runs step 5 (full report) + step 6 (product enrichment).
// Expected input: JSON body from client localStorage.

import { NextResponse } from "next/server";
import { runStructuredStyleResponse, getConfiguredStyleModel } from "@/lib/server/openai";
import { FullReportSchema } from "@/lib/style-analysis-schema";
import { buildReportComposerInstructions, buildReportComposerPrompt } from "@/lib/prompts/report-composer";
import { searchGoogleShopping } from "@/lib/serpapi";
import { searchFashionItem } from "@/lib/shopstyle";
import { searchPinterestPins } from "@/lib/clients/pinterest";
import { searchUnsplashPhotos } from "@/lib/clients/unsplash";
import { extractDominantColors, productMatchesPalette, colorDistance } from "@/lib/clients/google-vision";
import { pickBestProduct } from "@/lib/product-ranker";
import { buildStyleDNA, StyleDNA } from "@/lib/style-dna";
import { pickBestMakeupProduct, buildMakeupSearchQuery } from "@/lib/makeup-ranker";
import { searchBeautyProduct, scoreIngredientsForSkinType, extractKeyIngredients } from "@/lib/clients/openbeautyfacts";
import {
  countryToGl,
  getCurrentClothingSeason,
  getMarketplaces,
  isRussianMarket,
  getSerpApiGl,
  addSeasonToQuery,
  buildSeasonContext,
} from "@/lib/location-context";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

// Request-scoped SerpAPI cache — prevents duplicate calls for identical queries
// within a single enrichment pass (e.g. same category appears in multiple outfits)
type SerpCache = Map<string, Awaited<ReturnType<typeof searchGoogleShopping>>>;

// ── Product helpers ───────────────────────────────────────────────────────────

async function fetchProduct(
  searchQuery: string,
  paletteHexes?: string[],
  gl?: string,
  hl?: string,
  siteOperators?: string,
  cache?: SerpCache,
) {
  try {
    const cacheKey = `${searchQuery}|${gl}|${siteOperators ?? ""}`;
    let results = cache?.get(cacheKey);
    if (!results) {
      results = await searchGoogleShopping({ query: searchQuery, num: 5, gl, hl, siteOperators });
      cache?.set(cacheKey, results);
    }
    if (results.length === 0) return null;

    const best = pickBestProduct(results);
    if (!best?.imageUrl) return null;

    let paletteMatch: boolean | null = null;
    if (paletteHexes && paletteHexes.length > 0 && process.env.GOOGLE_VISION_API_KEY) {
      try {
        const colors = await extractDominantColors(best.imageUrl);
        if (colors.length > 0) paletteMatch = productMatchesPalette(colors, paletteHexes, 65);
      } catch { /* Vision check is best-effort */ }
    }

    return {
      title: best.title,
      price: best.price,
      imageUrl: best.imageUrl,
      link: best.link,
      source: best.source,
      tasteScore: best.tasteScore,
      qualityScore: best.qualityScore,
      paletteMatch,
    };
  } catch {
    return null;
  }
}

async function fetchMakeupProduct(
  baseQuery: string,
  skinType?: string,
  skinConcerns?: string[],
  gl?: string,
  hl?: string,
  cache?: SerpCache,
) {
  try {
    const query = skinType
      ? buildMakeupSearchQuery(baseQuery, skinType, skinConcerns ?? [])
      : baseQuery;
    const cacheKey = `${query}|${gl}|makeup`;
    let results = cache?.get(cacheKey);
    if (!results) {
      results = await searchGoogleShopping({ query, num: 5, gl, hl });
      cache?.set(cacheKey, results);
    }
    if (results.length === 0) return null;

    const best = pickBestMakeupProduct(results);
    if (!best?.imageUrl) return null;

    let ingredientInfo: { keyIngredients: string[]; concerns: string[]; skinTypeScore: number | null } =
      { keyIngredients: [], concerns: [], skinTypeScore: null };

    if (best.title) {
      const beautyInfo = await searchBeautyProduct(best.title).catch(() => null);
      if (beautyInfo) {
        ingredientInfo = {
          keyIngredients: extractKeyIngredients(beautyInfo.ingredients),
          concerns: beautyInfo.concerns,
          skinTypeScore: skinType
            ? scoreIngredientsForSkinType(beautyInfo, skinType as "oily" | "dry" | "combination" | "normal" | "sensitive")
            : null,
        };
      }
    }

    return { title: best.title, price: best.price, imageUrl: best.imageUrl, link: best.link, source: best.source, beautyScore: best.beautyScore, ...ingredientInfo };
  } catch {
    return null;
  }
}

async function fetchProductWithFallback(
  queries: [string, string, string],
  targetColorHex?: string | null,
  paletteHexes?: string[],
  gl?: string,
  hl?: string,
  siteOperators?: string,
  cache?: SerpCache,
): Promise<Awaited<ReturnType<typeof fetchProduct>>> {
  for (const query of queries) {
    const cacheKey = `${query}|${gl}|${siteOperators ?? ""}`;
    let results = cache?.get(cacheKey);
    if (!results) {
      results = await searchGoogleShopping({ query, num: 5, gl, hl, siteOperators }).catch(() => []);
      cache?.set(cacheKey, results);
    }
    if (results.length === 0) continue;

    // Color proximity filter if targetColorHex and Vision key are available
    let filtered = results;
    if (targetColorHex && process.env.GOOGLE_VISION_API_KEY) {
      const colorChecked = await Promise.all(
        results.slice(0, 5).map(async (r) => {
          if (!r.thumbnail) return { r, match: false };
          try {
            const colors = await extractDominantColors(r.thumbnail);
            const match = colors.some(
              (c) => c.score > 0.05 && colorDistance(c.hex, targetColorHex) < 45,
            );
            return { r, match };
          } catch { return { r, match: false }; }
        })
      );
      const colorMatches = colorChecked.filter((x) => x.match).map((x) => x.r);
      if (colorMatches.length >= 2) filtered = colorMatches;
    }

    const best = pickBestProduct(filtered);
    if (best?.imageUrl) {
      return {
        title: best.title,
        price: best.price,
        imageUrl: best.imageUrl,
        link: best.link,
        source: best.source,
        tasteScore: best.tasteScore,
        qualityScore: best.qualityScore,
        paletteMatch: null,
      };
    }
  }
  return null;
}

function buildItemFallbackQueries(
  item: { piece?: string; searchQuery: string; colorHex?: string | null; fabric?: string | null },
  dna: StyleDNA,
): [string, string, string] {
  const piece = item.piece ?? item.searchQuery.split(" ").slice(0, 2).join(" ");
  const gender = dna.gender === "man" ? "men" : "women";
  const colorName = item.colorHex ? item.colorHex : "";
  return [
    item.searchQuery,                                              // primary (from AI, includes style vocab)
    `${piece} ${colorName} ${gender}`.trim(),                     // simpler
    `${piece.split(" ").slice(-2).join(" ")} ${gender}`,          // category only
  ];
}

// Try ShopStyle first (fashion aggregator, better image quality for clothing).
// Falls back to SerpAPI via fetchProductWithFallback if ShopStyle returns nothing.
async function fetchOutfitItem(
  item: { piece?: string; searchQuery: string; colorHex?: string | null; fabric?: string | null },
  dna: StyleDNA,
  paletteHexes: string[],
  gl: string,
  hl: string,
  siteOperators: string | undefined,
  cache: SerpCache,
): Promise<Awaited<ReturnType<typeof fetchProduct>>> {
  // 1. Try ShopStyle (primary)
  if (process.env.SHOPSTYLE_UID) {
    const shopResult = await searchFashionItem(item.searchQuery).catch(() => null);
    if (shopResult?.imageUrl) {
      // tasteScore/qualityScore are not computed for ShopStyle results;
      // cast to match fetchProduct's inferred return type (both are 0 at runtime consumers)
      return {
        title: shopResult.title,
        price: shopResult.price,
        imageUrl: shopResult.imageUrl,
        link: shopResult.link,
        source: shopResult.source,
        tasteScore: 0,
        qualityScore: 0,
        paletteMatch: null,
      };
    }
  }
  // 2. Fall back to SerpAPI (3-query variant)
  const queries = buildItemFallbackQueries(item, dna);
  return fetchProductWithFallback(queries, item.colorHex ?? null, paletteHexes, gl, hl, siteOperators, cache);
}

async function enrichWithProducts<T extends { searchQuery: string }>(
  items: T[],
  paletteHexes?: string[],
  gl?: string,
  season?: string,
  hl?: string,
  siteOperators?: string,
  cache?: SerpCache,
): Promise<(T & { product: Awaited<ReturnType<typeof fetchProduct>> })[]> {
  const results: (T & { product: Awaited<ReturnType<typeof fetchProduct>> })[] = [];
  for (let i = 0; i < items.length; i += 4) {
    const batch = items.slice(i, i + 4);
    const fetched = await Promise.all(
      batch.map(async (item) => {
        const query = season
          ? addSeasonToQuery(item.searchQuery, season as Parameters<typeof addSeasonToQuery>[1])
          : item.searchQuery;
        return { ...item, product: await fetchProduct(query, paletteHexes, gl, hl, siteOperators, cache) };
      })
    );
    results.push(...fetched);
  }
  return results;
}

// ── Request schema ────────────────────────────────────────────────────────────

const FullReportRequestSchema = z.object({
  profileData: z.object({
    styleProfile: z.record(z.string(), z.unknown()),
    faceFeatures: z.record(z.string(), z.unknown()),
    bodyAnalysis: z.record(z.string(), z.unknown()),
    computedScores: z.record(z.string(), z.unknown()),
    gender: z.enum(["woman", "man", "other"]).default("other"),
    colorBridgeResult: z.object({
      season: z.string(),
      confidence: z.number(),
      locked: z.boolean(),
      derivedUndertone: z.enum(["warm", "cool", "neutral"]),
    }).nullish(),
  }),
  quiz: z.record(z.string(), z.unknown()),
  meta: z.object({
    skinType: z.string().nullish(),
    skinConcerns: z.array(z.string()).nullish(),
    location: z.object({
      countryCode: z.string().nullish(),
      city: z.string().nullish(),
    }).nullish(),
  }).nullish(),
});

export async function POST(request: Request) {
  // One cache per request — deduplicates identical SerpAPI queries across sections
  const serpCache: SerpCache = new Map();

  try {
    const body = await request.json();
    const parsed = FullReportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data." }, { status: 400 });
    }

    const { profileData, quiz, meta } = parsed.data;
    const { styleProfile, faceFeatures, bodyAnalysis, computedScores, gender } = profileData;

    // Location context
    const countryCode = (meta?.location?.countryCode ?? (quiz.countryCode as string | undefined) ?? "us").toLowerCase();
    const gl = countryToGl(countryCode) ?? countryCode;
    const city = meta?.location?.city ?? (quiz.city as string | undefined);
    const currentSeason = getCurrentClothingSeason(gl);
    const marketplaces = getMarketplaces(gl);
    const seasonContext = buildSeasonContext(currentSeason, gl, city);
    const hl = isRussianMarket(gl) ? "ru" : "en";
    const siteOperators = marketplaces.siteOperators;
    const serpGl = getSerpApiGl(gl);

    const skinType = meta?.skinType ?? (faceFeatures.skinType as string | undefined);
    const skinConcerns = meta?.skinConcerns ?? (faceFeatures.skinConcerns as string[] | undefined) ?? [];

    const model = getConfiguredStyleModel();

    // ── Step 4.5: Style DNA + Pinterest inspiration ──────────────────────────
    const resolvedSeason =
      (profileData.colorBridgeResult?.locked ? profileData.colorBridgeResult.season : null)
      ?? (profileData.styleProfile.colorSeasonFamily as string | undefined)
      ?? "True Summer";

    const styleDNA = buildStyleDNA(
      profileData.styleProfile as { kibbeType: string; bestFabrics: string[]; colorSeasonFamily?: string },
      quiz,
      resolvedSeason,
      profileData.gender,
    );

    // Fetch Pinterest inspiration BEFORE the AI call (~0.8s, runs before the ~20s AI call)
    const inspirationPins = await searchPinterestPins(styleDNA.pinterestQuery, 3).catch(() => []);

    // ── Step 5: Full report generation ───────────────────────────────────────
    // Uses FullReportSchema directly — no mini-result overhead since mini was already generated.
    const report = await runStructuredStyleResponse({
      schema: FullReportSchema,
      schemaName: "FullReport",
      instructions: buildReportComposerInstructions(gender),
      prompt: buildReportComposerPrompt({
        styleProfile: styleProfile as object,
        faceFeatures: faceFeatures as object,
        computedScores: computedScores as object,
        bodyAnalysis: bodyAnalysis as object,
        quiz: quiz as object,
        seasonContext,
        styleDNA,
        inspirationPins,
      }),
      model,
      maxOutputTokens: 14000,
    });
    const paletteHexes = report.color.palette.map((c) => c.hex);

    const moodboardQuery = report.styleDirection.moodboardSearchQueries[0];

    // ── Step 6: Enrichment — products + visual references ────────────────────
    const [
      hairPinterest,
      hairUnsplash,
      moodboardPinterest,
      enrichedClothing,
      enrichedOutfits,
      enrichedShoppingList,
      enrichedMistakes,
      enrichedMakeup,
    ] = await Promise.all([
      searchPinterestPins(report.hair.referenceSearchQueries[0], 4).catch(() => []),
      searchUnsplashPhotos(report.hair.referenceSearchQueries[0], 3).catch(() => []),
      searchPinterestPins(moodboardQuery, 6).catch(() => []),
      enrichWithProducts(report.clothing.items, paletteHexes, serpGl, currentSeason, hl, siteOperators, serpCache),
      Promise.all(
        // Cap at 8 outfits for enrichment — the AI may generate 12-15 but enriching all burns SerpAPI budget
        report.outfits.outfits.slice(0, 8).map(async (outfit) => {
          // Use user's selected aesthetic for Pinterest query if available,
          // else fall back to styleDNA.styleDirection
          const aesthetics = (quiz as Record<string, unknown>).aesthetics as string[] | undefined;
          const aestheticTerm = aesthetics?.[0] ?? styleDNA.styleDirection;
          const heroPinQuery = outfit.pinterestQuery
            ?? `${aestheticTerm} ${outfit.occasion} outfit editorial ${styleDNA.colorSeason}`;
          const heroPin = await searchPinterestPins(heroPinQuery, 1).catch(() => []);

          const enrichedItems = await Promise.all(
            outfit.items.map(async (item) =>
              fetchOutfitItem(item, styleDNA, paletteHexes, serpGl, hl, siteOperators, serpCache)
                .then((product) => ({ ...item, product }))
            )
          );

          return {
            ...outfit,
            items: enrichedItems,
            heroImage: heroPin[0] ?? null,
          };
        })
      ),
      enrichWithProducts(report.shoppingList.buyFirst, paletteHexes, serpGl, currentSeason, hl, siteOperators, serpCache),
      enrichWithProducts(
        report.styleMistakes.replaceThese.map((m) => ({ ...m, searchQuery: m.replacementSearchQuery })),
        paletteHexes,
        serpGl,
        undefined,
        hl,
        siteOperators,
        serpCache,
      ),
      Promise.all(
        report.makeup.products.map(async (p) => ({
          ...p,
          product: await fetchMakeupProduct(p.searchQuery, skinType ?? undefined, skinConcerns, serpGl, hl, serpCache),
        }))
      ),
    ]);

    const enrichedReport = {
      ...report,
      hair: { ...report.hair, referenceImages: { pinterest: hairPinterest, unsplash: hairUnsplash } },
      styleDirection: { ...report.styleDirection, moodboardPins: moodboardPinterest },
      clothing: { ...report.clothing, items: enrichedClothing },
      makeup: { ...report.makeup, products: enrichedMakeup },
      outfits: { ...report.outfits, outfits: enrichedOutfits },
      shoppingList: { ...report.shoppingList, buyFirst: enrichedShoppingList },
      styleMistakes: { ...report.styleMistakes, replaceThese: enrichedMistakes },
    };

    return NextResponse.json({
      fullReport: enrichedReport,
      meta: {
        location: { countryCode, city, gl },
        currentSeason,
        marketplaces: marketplaces.names,
        serpApiUsed: !!process.env.SERPAPI_KEY,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[style-analysis/full] FAILED:", message);
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "development"
          ? `Full report error: ${message}`
          : "Something went wrong generating the full report. Please try again.",
      },
      { status: 500 }
    );
  }
}
