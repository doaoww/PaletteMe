import { NextResponse } from "next/server";
import { SEASON_PRODUCTS } from "@/lib/landing-data";
import { searchProducts, rankProduct } from "@/lib/shopstyle";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season") ?? "spring";
  const bodyType = searchParams.get("bodyType") ?? "";
  const aesthetics = searchParams.get("aesthetics")?.split(",").filter(Boolean) ?? [];
  const offset = parseInt(searchParams.get("offset") ?? "0");

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
      .slice(0, 20);

    return NextResponse.json({ ok: true, products: ranked, source: "shopstyle" });
  }

  // Demo fallback
  const picks = SEASON_PRODUCTS[season] ?? SEASON_PRODUCTS.spring;
  const mapped = picks.map((p) => ({
    id: p.name.toLowerCase().replace(/\s+/g, "-"),
    name: p.name,
    brandedName: p.brand,
    price: parseFloat(p.price.replace(/[^0-9.]/g, "")),
    image: { sizes: { Best: { url: p.image } } },
    clickUrl: `https://www.asos.com/search/?q=${encodeURIComponent(p.name)}`,
    hex: p.hex,
    match: p.match,
    score: p.match / 100,
    source: "demo",
  }));

  return NextResponse.json({ ok: true, products: mapped, source: "demo" });
}
