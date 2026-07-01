import { NextResponse } from "next/server";
import {
  queryProducts,
  isSupabaseConfigured,
  type ScoredProduct,
} from "@/lib/db/supabase-db";
import { buildAffiliateUrl } from "@/lib/feed/affiliate";
import { SEASON_PRODUCTS } from "@/lib/shared/landing-data";
import type { StylingGoal, StyleVibe } from "@/lib/quiz/quiz-data";

export const runtime = "nodejs";
export const maxDuration = 30;

// ─── Public type — imported by components ─────────────────────────────────────
export type ScrapedProduct = {
  name: string;
  brand?: string;
  price?: string;
  url: string;
  imageUrl?: string;
  color?: string;
};

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

// Aesthetic labels from quiz → product style tags
const AESTHETIC_TO_STYLE: Record<string, string> = {
  minimalist: "minimalist",
  classic: "classic",
  feminine: "romantic",
  romantic: "romantic",
  edgy: "edgy",
  bohemian: "bohemian",
  casual: "casual",
  preppy: "classic",
  sporty: "casual",
};

function mapAesthetic(aesthetic?: string): string | undefined {
  if (!aesthetic) return undefined;
  return AESTHETIC_TO_STYLE[aesthetic.toLowerCase()];
}

// Convert a Supabase product row → the ScrapedProduct shape components expect
function toResponse(p: ScoredProduct): ScrapedProduct & { match: number; hex?: string } {
  const primaryHex = p.colors?.find((c) => c.startsWith("#"));
  return {
    name: p.name,
    brand: "ASOS",
    price: p.price != null ? `$${p.price.toFixed(2)}` : undefined,
    url: buildAffiliateUrl(p.affiliate_url ?? `https://www.asos.com/search/?q=${encodeURIComponent(p.name)}`),
    imageUrl: p.image_url ?? undefined,
    color: p.colors?.filter((c) => !c.startsWith("#"))[0],
    match: p.match,
    hex: primaryHex,
  };
}

// Demo fallback using SEASON_PRODUCTS from landing-data (unchanged)
function demoFallback(season: string): Array<ScrapedProduct & { match: number; hex?: string }> {
  const picks = SEASON_PRODUCTS[season] ?? SEASON_PRODUCTS.spring;
  return picks.map((p) => ({
    name: p.name,
    brand: p.brand,
    price: p.price,
    url: buildAffiliateUrl(`https://www.asos.com/search/?q=${encodeURIComponent(p.name)}`),
    imageUrl: p.image,
    color: undefined,
    match: p.match,
    hex: p.hex,
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const seasonId = searchParams.get("season")?.toLowerCase();
  const styleRaw = searchParams.get("style")?.toLowerCase();
  const aestheticRaw = searchParams.get("aesthetic")?.toLowerCase();
  const goalRaw = searchParams.get("goal")?.toLowerCase();
  const bodyType = searchParams.get("bodyType") ?? undefined;
  const subSeason = searchParams.get("subSeason") ?? undefined;

  if (!seasonId || !VALID_SEASONS.has(seasonId)) {
    return NextResponse.json({ error: "Invalid season" }, { status: 400 });
  }

  // Resolve style: explicit param > aesthetic mapping > quiz styleVibe
  const styleVibe =
    styleRaw && VALID_STYLES.has(styleRaw as StyleVibe)
      ? (styleRaw as StyleVibe)
      : undefined;

  const mappedStyle =
    styleVibe ??
    mapAesthetic(aestheticRaw) ??
    (goalRaw && VALID_GOALS.has(goalRaw as StylingGoal) ? undefined : undefined);

  // ── Supabase query with smart scoring ─────────────────────────────────────
  if (isSupabaseConfigured()) {
    try {
      const products = await queryProducts({
        season: seasonId,
        style: mappedStyle,
        bodyType,
        limit: 12,
      });

      if (products.length > 0) {
        return NextResponse.json({
          ok: true,
          products: products.map(toResponse),
          source: "supabase",
        });
      }
    } catch (err) {
      console.warn("[products] Supabase query failed, falling back to demo:", (err as Error).message);
    }
  }

  // ── Demo fallback ──────────────────────────────────────────────────────────
  void subSeason; // reserved for future sub-season filtering
  return NextResponse.json({
    ok: true,
    products: demoFallback(seasonId),
    source: "demo",
  });
}
