"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type SavedProduct = {
  id: string;
  name: string;
  brandedName?: string;
  price: number;
  image: { sizes: { Best: { url: string } } };
  clickUrl: string;
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
    <div style={{ background: "var(--cream)", minHeight: "100svh" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px var(--pad)", borderBottom: "1px solid var(--hair)" }}>
        <Link href="/" className="wordmark" style={{ color: "var(--ink)", fontSize: "1.2rem" }}>
          palette<span style={{ color: "var(--pink)" }}>me</span>
        </Link>
        <nav style={{ display: "flex", gap: 24, fontFamily: "var(--sans)", fontSize: "0.85rem" }}>
          <Link href="/profile" style={{ color: "var(--ink-soft)" }}>profile</Link>
          <Link href="/feed" style={{ color: "var(--ink-soft)" }}>feed</Link>
          <Link href="/saved" style={{ color: "var(--pink)", fontWeight: 700 }}>saved</Link>
        </nav>
      </header>

      <div className="wrap" style={{ paddingTop: "clamp(32px,5vh,56px)", paddingBottom: "clamp(48px,8vh,96px)" }}>
        <p className="kicker" style={{ fontSize: "0.58rem", marginBottom: 10 }}>wishlist</p>
        <p className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", lineHeight: 1.08, marginBottom: 32 }}>
          Saved <span className="scr" style={{ color: "var(--pink)" }}>pieces</span>
        </p>

        {!ready ? null : items.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <p style={{ fontFamily: "var(--sans)", fontSize: "1.05rem", color: "var(--ink-soft)", marginBottom: 20 }}>
              Nothing saved yet.
            </p>
            <Link href="/feed" className="btn">browse your feed →</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            {items.map((p) => {
              const imgUrl = p.image?.sizes?.Best?.url ?? "";
              return (
                <div key={p.id} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--hair)", background: "#fff", boxShadow: "0 4px 18px rgba(23,18,26,0.05)" }}>
                  <a href={p.clickUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", position: "relative", aspectRatio: "4/5", background: "#f3ede5" }}>
                    {imgUrl && (
                      <Image src={imgUrl} alt={p.name} fill style={{ objectFit: "cover" }} unoptimized sizes="240px" />
                    )}
                  </a>
                  <div style={{ padding: "12px 14px 14px" }}>
                    <p style={{ fontFamily: "var(--sans)", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.3, marginBottom: 4 }}>{p.name}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      {p.brandedName && <span style={{ fontFamily: "var(--sans)", fontSize: "0.76rem", color: "var(--ink-soft)" }}>{p.brandedName}</span>}
                      <span style={{ fontFamily: "var(--sans)", fontSize: "0.86rem", fontWeight: 700, color: "var(--ink)" }}>${p.price}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a
                        href={p.clickUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1, textAlign: "center", fontFamily: "var(--sans)", fontSize: "0.78rem", fontWeight: 600, background: "var(--ink)", color: "var(--cream)", borderRadius: 100, padding: "8px 0" }}
                      >
                        shop →
                      </a>
                      <button
                        type="button"
                        title="Remove"
                        onClick={() => remove(p.id)}
                        style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--hair)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1rem" }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
