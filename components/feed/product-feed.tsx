"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizProfile } from "@/lib/quiz/quiz";
import "@/app/feed/feed.css";

type FeedProduct = {
  id: string;
  name: string;
  brandedName?: string;
  price?: number;
  priceLabel?: string;
  salePrice?: number;
  image: { sizes: { Best: { url: string } } };
  clickUrl: string;
  hex?: string;
  swatches?: string[];
  match?: number;
  score?: number;
  source?: string;
  merchant?: string;
  searchQuery?: string;
  reason?: string;
  fitNote?: string;
  verdict?: "great" | "good-with-styling" | "maybe";
  category?: string;
  colorName?: string;
  placement?: string;
};

function hexIsLight(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

function ProductCard({
  product,
  onSave,
  saved,
}: {
  product: FeedProduct;
  onSave: (p: FeedProduct) => void;
  saved: boolean;
}) {
  const score = product.score ?? (product.match ? product.match / 100 : 0.7);
  const swatch = product.hex ?? product.swatches?.[0] ?? "#c2a477";
  const isLight = hexIsLight(swatch);
  const imgUrl = product.image?.sizes?.Best?.url ?? "";

  const dotColor = score >= 0.82 ? "#22c55e" : score >= 0.64 ? "#eab308" : "#94a3b8";

  const verdictLabel =
    product.verdict === "great"
      ? "great match"
      : product.verdict === "good-with-styling"
        ? "style it"
        : "maybe";

  const verdictClass =
    product.verdict === "great"
      ? "feed-product-card__verdict-badge--great"
      : product.verdict === "good-with-styling"
        ? "feed-product-card__verdict-badge--good"
        : "feed-product-card__verdict-badge--maybe";

  const retailerLabel = product.merchant ?? "retailer";
  const ctaLabel =
    product.source === "serpapi" || product.source === "curated-product"
      ? "view"
      : "shop similar";

  const track = (action: "click" | "save") => {
    fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        action,
        merchant: product.merchant,
        source: product.source,
        score,
      }),
    }).catch(() => {});
  };

  return (
    <div className="feed-product-card">
      <a
        href={product.clickUrl || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="feed-product-card__swatch"
        onClick={() => product.clickUrl && track("click")}
        style={{ display: "block", textDecoration: "none" }}
      >
        <div
          className="feed-product-card__swatch-bg"
          style={{
            background: `linear-gradient(145deg, ${swatch}, color-mix(in srgb, ${swatch} 70%, #fff))`,
          }}
        />
        {imgUrl && (
          <Image
            src={imgUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            style={{ objectFit: "cover", objectPosition: "top center" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="feed-product-card__swatch-overlay" style={{ opacity: imgUrl ? 0.45 : (isLight ? 0.15 : 0.35) }} />

        <div className={`feed-product-card__verdict-badge ${verdictClass}`}>
          {verdictLabel}
        </div>

        <div className="feed-product-card__match-pill">
          <span className="feed-product-card__match-dot" style={{ background: dotColor }} />
          <span className="feed-product-card__match-pct">{Math.round(score * 100)}%</span>
        </div>

        {product.colorName && (
          <div className="feed-product-card__swatch-content">
            <span
              className="feed-product-card__color-name"
              style={{ color: isLight ? "rgba(0,0,0,0.82)" : "#fff" }}
            >
              {product.colorName}
            </span>
            <span
              className="feed-product-card__category-badge"
              style={{ color: isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.75)" }}
            >
              {product.category ?? "style"}
            </span>
          </div>
        )}
      </a>

      <div className="feed-product-card__body">
        <p className="feed-product-card__name">{product.name}</p>

        {product.brandedName && (
          <div className="feed-product-card__brand">
            <span className="feed-product-card__brand-name">{product.brandedName.split(" at ")[0]}</span>
            {product.merchant && product.merchant !== product.brandedName.split(" at ")[0] && (
              <span className="feed-product-card__retailer-badge">{product.merchant}</span>
            )}
          </div>
        )}

        {product.reason && (
          <p className="feed-product-card__reason">{product.reason}</p>
        )}

        <div className="feed-product-card__actions">
          <a
            href={product.clickUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="feed-product-card__cta"
            onClick={() => track("click")}
          >
            {ctaLabel}
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <button
            type="button"
            className={`feed-product-card__save${saved ? " feed-product-card__save--saved" : ""}`}
            title={saved ? "saved" : "save"}
            onClick={() => { onSave(product); track("save"); }}
            aria-pressed={saved}
          >
            <svg viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} aria-hidden>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductFeed({
  profile,
  category = "",
}: {
  profile: QuizProfile;
  category?: string;
}) {
  const [products, setProducts] = useState<FeedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [source, setSource] = useState("intent-catalog");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Track loading synchronously so the scroll observer reads fresh state, not stale closure.
  const isLoadingRef = useRef(false);
  // Increment on every new category load; stale responses check against this before writing state.
  const generationRef = useRef(0);

  useEffect(() => {
    const key = "paletteme_saved";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as FeedProduct[];
    setSavedIds(new Set(existing.map((p) => p.id)));
  }, []);

  const loadProducts = useCallback(
    async (nextOffset: number, cat: string) => {
      // New category = new generation; scroll pages keep the current generation.
      const gen = nextOffset === 0 ? ++generationRef.current : generationRef.current;
      isLoadingRef.current = true;
      setLoading(true);

      const params = new URLSearchParams({
        season: profile.seasonId,
        offset: String(nextOffset),
      });
      if (cat) params.set("category", cat);
      if (profile.bodyType) params.set("bodyType", profile.bodyType);
      if (profile.subSeason) params.set("subSeason", profile.subSeason);
      if (profile.answers?.wardrobeType) params.set("wardrobeType", profile.answers.wardrobeType);
      if (profile.answers?.height) params.set("height", profile.answers.height);
      if (profile.answers?.weightRange) params.set("weightRange", profile.answers.weightRange);
      if (profile.answers?.budgetPref) params.set("budgetPref", profile.answers.budgetPref);
      if (profile.answers?.climatePref) params.set("climatePref", profile.answers.climatePref);
      if (profile.answers?.makeupPref) params.set("makeupPref", profile.answers.makeupPref);
      if (profile.answers?.styleDirections?.length) {
        params.set("styleDirections", profile.answers.styleDirections.join(","));
      }
      if (profile.answers?.countryCode) {
        params.set("countryCode", profile.answers.countryCode);
      }
      if (profile.answers?.occasions?.length) {
        params.set("occasions", profile.answers.occasions.join(","));
      }
      if (profile.answers?.trends?.length) {
        params.set("trends", profile.answers.trends.join(","));
      }
      if (profile.styleVector?.aesthetics?.length) {
        params.set("aesthetics", profile.styleVector.aesthetics.join(","));
      }

      try {
        const res = await fetch(`/api/feed?${params}`);
        const data = await res.json();

        // Discard if a newer category was selected while this fetch was in flight.
        if (gen !== generationRef.current) return;

        if (data.ok && Array.isArray(data.products)) {
          setProducts((prev) =>
            nextOffset === 0 ? data.products : [...prev, ...data.products]
          );
          setSource(data.source ?? "intent-catalog");
          setHasMore(data.products.length >= 20);
        }
      } finally {
        if (gen === generationRef.current) {
          isLoadingRef.current = false;
          setLoading(false);
        }
      }
    },
    [profile]
  );

  // This effect runs BEFORE the scroll observer effect below (React runs effects in order).
  // loadProducts sets isLoadingRef.current=true synchronously, so the observer created
  // immediately after won't double-fire even though the sentinel is visible (list is empty).
  useEffect(() => {
    setProducts([]);
    setOffset(0);
    setHasMore(true);
    loadProducts(0, category);
  }, [loadProducts, category]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        // Use the ref, not the `loading` state closure, to get the live value.
        if (entry.isIntersecting && !isLoadingRef.current && hasMore) {
          const next = offset + 20;
          setOffset(next);
          loadProducts(next, category);
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [loading, hasMore, offset, loadProducts, category]);

  const handleSave = (product: FeedProduct) => {
    const key = "paletteme_saved";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as FeedProduct[];
    const alreadySaved = existing.some((p) => p.id === product.id);
    if (alreadySaved) {
      const filtered = existing.filter((p) => p.id !== product.id);
      localStorage.setItem(key, JSON.stringify(filtered));
      setSavedIds((prev) => { const next = new Set(prev); next.delete(product.id); return next; });
    } else {
      localStorage.setItem(key, JSON.stringify([product, ...existing]));
      setSavedIds((prev) => new Set([...prev, product.id]));
    }
  };

  const sourceNote =
    source === "serpapi"
      ? "Live products from Google Shopping. Tap any item to visit the retailer."
      : source.includes("curated-products")
      ? "Showing curated real product pages. Prices and availability are checked on the retailer site."
      : "These are personalized shopping directions. Links open marketplace searches.";

  return (
    <div>
      <p className="feed-source-note">{sourceNote}</p>

      <div className="feed-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onSave={handleSave}
            saved={savedIds.has(p.id)}
          />
        ))}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="feed-skeleton" />
          ))}
        {!loading && products.length === 0 && (
          <p className="feed-empty">No picks in this category yet.</p>
        )}
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
}
