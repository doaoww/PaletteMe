"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizProfile } from "@/lib/quiz";

type FeedProduct = {
  id: string;
  name: string;
  brandedName?: string;
  price: number;
  salePrice?: number;
  image: { sizes: { Best: { url: string } } };
  clickUrl: string;
  hex?: string;
  match?: number;
  score?: number;
  source?: string;
};

function ScoreDot({ score }: { score: number }) {
  const color = score >= 0.8 ? "#22c55e" : score >= 0.55 ? "#eab308" : "#ef4444";
  return (
    <span
      title={`${Math.round(score * 100)}% match`}
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        border: "1px solid rgba(0,0,0,0.1)",
        flexShrink: 0,
      }}
    />
  );
}

function ProductCard({ product, onSave }: { product: FeedProduct; onSave: (p: FeedProduct) => void }) {
  const score = product.score ?? (product.match ? product.match / 100 : 0.7);
  const imgUrl = product.image?.sizes?.Best?.url ?? "";

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--hair)", background: "#fff", boxShadow: "0 4px 18px rgba(23,18,26,0.05)" }}>
      <a
        href={product.clickUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "block", position: "relative", aspectRatio: "4/5", background: "#f3ede5" }}
        onClick={() => {
          // Track click (fire-and-forget)
          fetch("/api/interactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id, action: "click" }),
          }).catch(() => {});
        }}
      >
        {imgUrl && (
          <Image src={imgUrl} alt={product.name} fill style={{ objectFit: "cover" }} unoptimized sizes="240px" />
        )}
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.92)", borderRadius: 100, padding: "4px 8px" }}>
          <ScoreDot score={score} />
        </div>
      </a>
      <div style={{ padding: "12px 14px 14px" }}>
        <p style={{ fontFamily: "var(--sans)", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.3, marginBottom: 4 }}>{product.name}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          {product.brandedName && <span style={{ fontFamily: "var(--sans)", fontSize: "0.76rem", color: "var(--ink-soft)" }}>{product.brandedName}</span>}
          <span style={{ fontFamily: "var(--sans)", fontSize: "0.86rem", fontWeight: 700, color: "var(--ink)" }}>
            {product.salePrice ? (
              <>
                <span style={{ color: "var(--pink)" }}>${product.salePrice}</span>{" "}
                <span style={{ textDecoration: "line-through", opacity: 0.5, fontSize: "0.76rem" }}>${product.price}</span>
              </>
            ) : (
              `$${product.price}`
            )}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={product.clickUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, textAlign: "center", fontFamily: "var(--sans)", fontSize: "0.78rem", fontWeight: 600, background: "var(--ink)", color: "var(--cream)", borderRadius: 100, padding: "8px 0" }}
          >
            shop →
          </a>
          <button
            type="button"
            title="Save"
            onClick={() => onSave(product)}
            style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--hair)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            ♡
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductFeed({ profile }: { profile: QuizProfile }) {
  const [products, setProducts] = useState<FeedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [source, setSource] = useState("demo");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadProducts = useCallback(
    async (nextOffset: number) => {
      setLoading(true);
      const params = new URLSearchParams({
        season: profile.seasonId,
        offset: String(nextOffset),
      });
      if (profile.bodyType) params.set("bodyType", profile.bodyType);
      if (profile.styleVector?.aesthetics.length) {
        params.set("aesthetics", profile.styleVector.aesthetics.join(","));
      }

      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json();

      if (data.ok && Array.isArray(data.products)) {
        setProducts((prev) => nextOffset === 0 ? data.products : [...prev, ...data.products]);
        setSource(data.source ?? "demo");
        setHasMore(data.products.length >= 20);
      }
      setLoading(false);
    },
    [profile.seasonId, profile.bodyType, profile.styleVector]
  );

  useEffect(() => {
    loadProducts(0);
  }, [loadProducts]);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          const next = offset + 20;
          setOffset(next);
          loadProducts(next);
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [loading, hasMore, offset, loadProducts]);

  const handleSave = (product: FeedProduct) => {
    const key = "paletteme_saved";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as FeedProduct[];
    const already = existing.some((p) => p.id === product.id);
    if (!already) {
      localStorage.setItem(key, JSON.stringify([product, ...existing]));
    }
    // Track save (fire-and-forget)
    fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, action: "save" }),
    }).catch(() => {});
  };

  return (
    <div>
      <p style={{ fontFamily: "var(--sans)", fontSize: "0.76rem", color: "var(--ink-soft)", opacity: 0.72, marginBottom: 16 }}>
        Some product links may be affiliate links. PaletteMe may earn a commission.
      </p>

      {source === "demo" && (
        <p style={{ fontFamily: "var(--sans)", fontSize: "0.76rem", color: "var(--ink-soft)", opacity: 0.6, marginBottom: 20 }}>
          Showing placeholder picks — real ShopStyle feed coming soon
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onSave={handleSave} />
        ))}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 12, aspectRatio: "4/5", background: "#f3ede5", animation: "pulse 1.4s ease-in-out infinite" }} />
          ))}
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style>
    </div>
  );
}
