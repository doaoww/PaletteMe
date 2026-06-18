"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/nav/bottom-nav";
import "../app-shell.css";

type SavedProduct = {
  id: string;
  name: string;
  brandedName?: string;
  price?: number;
  priceLabel?: string;
  image: { sizes: { Best: { url: string } } };
  clickUrl: string;
  hex?: string;
  colorName?: string;
  category?: string;
};

export default function SavedPage() {
  const [items, setItems] = useState<SavedProduct[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("paletteme_saved");
    if (raw) {
      try {
        setItems(JSON.parse(raw) as SavedProduct[]);
      } catch {}
    }
    setReady(true);
  }, []);

  const remove = (id: string) => {
    const next = items.filter((p) => p.id !== id);
    setItems(next);
    localStorage.setItem("paletteme_saved", JSON.stringify(next));
  };

  return (
    <div className="app-shell">
      <header className="app-topbar glass-nav">
        <Link href="/home" className="wordmark app-topbar__wordmark">
          palette<span className="me">me</span>
        </Link>
        <span className="app-chip app-chip--pink">saved</span>
      </header>

      <div className="app-shell__main">
        <p className="kicker" style={{ fontSize: "0.58rem", marginBottom: 10 }}>wishlist</p>
        <p className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", lineHeight: 1.08, marginBottom: 32 }}>
          Saved <span className="scr" style={{ color: "var(--pink)" }}>pieces</span>
        </p>

        {!ready ? (
          <div className="saved-skel-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="saved-skel-card">
                <div className="skel saved-skel-card__img" />
                <div className="skel saved-skel-card__title" />
                <div className="skel saved-skel-card__sub" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <p style={{ fontFamily: "var(--sans)", fontSize: "1.05rem", color: "var(--ink-soft)", marginBottom: 20 }}>
              Nothing saved yet.
            </p>
            <Link href="/feed" className="btn">browse your feed</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            {items.map((p) => {
              const imgUrl = p.image?.sizes?.Best?.url ?? "";
              const swatch = p.hex ?? "#f3ede5";
              const priceText = p.price != null && p.price > 0 ? `$${p.price}` : p.priceLabel ?? "shop similar";
              return (
                <div key={p.id} style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--hair)", background: "#fff", boxShadow: "0 4px 18px rgba(23,18,26,0.05)" }}>
                  <a href={p.clickUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", position: "relative", aspectRatio: "4/5", background: `linear-gradient(135deg, ${swatch}, #f6f1e9)` }}>
                    {imgUrl && (
                      <Image src={imgUrl} alt={p.name} fill style={{ objectFit: "cover" }} unoptimized sizes="240px" />
                    )}
                    {!imgUrl && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16, color: "#fff", textShadow: "0 1px 12px rgba(0,0,0,0.28)" }}>
                        <span style={{ fontFamily: "var(--sans)", fontSize: "0.72rem", textTransform: "lowercase" }}>
                          {p.colorName ?? "palette pick"}
                        </span>
                        <span style={{ fontFamily: "var(--serif)", fontSize: "1.45rem", lineHeight: 1.02 }}>
                          {p.category ?? "style"}
                        </span>
                      </div>
                    )}
                  </a>
                  <div style={{ padding: "12px 14px 14px" }}>
                    <p style={{ fontFamily: "var(--sans)", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.3, marginBottom: 4 }}>{p.name}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      {p.brandedName && <span style={{ fontFamily: "var(--sans)", fontSize: "0.76rem", color: "var(--ink-soft)" }}>{p.brandedName}</span>}
                      <span style={{ fontFamily: "var(--sans)", fontSize: "0.86rem", fontWeight: 700, color: "var(--ink)" }}>{priceText}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a
                        href={p.clickUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1, textAlign: "center", fontFamily: "var(--sans)", fontSize: "0.78rem", fontWeight: 600, background: "var(--ink)", color: "var(--cream)", borderRadius: 100, padding: "8px 0" }}
                      >
                        shop similar
                      </a>
                      <button
                        type="button"
                        title="Remove"
                        onClick={() => remove(p.id)}
                        style={{ width: 62, height: 36, borderRadius: 100, border: "1px solid var(--hair)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--sans)", fontSize: "0.72rem" }}
                      >
                        remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
