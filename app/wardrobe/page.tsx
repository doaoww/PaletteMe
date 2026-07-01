"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/nav/bottom-nav";
import { isSupabaseAuthConfigured } from "@/lib/auth/auth-flow";
import { loadQuizProfile } from "@/lib/quiz/quiz";
import { createClient } from "@/lib/db/supabase";
import {
  loadWardrobeItemsForCurrentUser,
  type PersistedWardrobeItem,
  type WardrobeItem,
} from "@/lib/wardrobe/wardrobe-store";
import "../app-shell.css";

const SUPABASE_AUTH_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export default function WardrobePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<WardrobeItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadWardrobe() {
      const userId = await getCurrentWardrobeUserId();
      const p = loadQuizProfile();

      if (!p && !userId) {
        router.replace("/quiz");
        return;
      }

      const nextItems = await loadWardrobeItemsForCurrentUser({
        getCurrentUserId: async () => userId,
        fetchWardrobeItems: fetchPersistedWardrobeItems,
      });

      if (!cancelled) {
        setItems(nextItems);
        setReady(true);
      }
    }

    loadWardrobe();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="app-shell">
        <p style={{ textAlign: "center", padding: 48, fontFamily: "var(--sans)", color: "var(--ink-soft)" }}>
          Loading…
        </p>
      </div>
    );
  }

  const count = items.length;
  const outfitsUnlocked = count >= 5;

  return (
    <div className="app-shell">
      <header className="app-topbar glass-nav">
        <Link href="/" className="wordmark app-topbar__wordmark">
          palette<span className="me">me</span>
        </Link>
        <span className="app-chip">{count} items</span>
      </header>

      <main className="app-shell__main">
        {count === 0 ? (
          <div className="wardrobe-empty">
            <div className="wardrobe-empty__icon" aria-hidden />
            <h1 className="wardrobe-empty__title">Your wardrobe is empty</h1>
            <p className="wardrobe-empty__sub">
              Add 5 favorite pieces and PaletteMe will start building outfits for you — no need to photograph
              everything at once.
            </p>
            <Link href="/wardrobe/add" className="btn">
              add first item
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <p className="kicker" style={{ fontSize: "0.58rem", marginBottom: 8 }}>my wardrobe</p>
              <p className="font-serif" style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", lineHeight: 1.1 }}>
                {count} piece{count === 1 ? "" : "s"} saved
              </p>
              {!outfitsUnlocked && (
                <p style={{ fontFamily: "var(--sans)", fontSize: "0.86rem", color: "var(--ink-soft)", marginTop: 8 }}>
                  Add {5 - count} more to unlock outfit builder
                </p>
              )}
            </div>
            <div className="wardrobe-grid">
              {items.map((item) => (
                <article key={item.id} className="wardrobe-card">
                  <div className="wardrobe-card__img">
                    <Image src={item.imageDataUrl} alt={`${item.color} ${item.category}`} fill sizes="160px" unoptimized />
                  </div>
                  <p className="wardrobe-card__cat">{item.category}</p>
                  <p className="wardrobe-card__color">{item.color}</p>
                  <span
                    className={`wardrobe-card__badge wardrobe-card__badge--${item.paletteMatch}`}
                  >
                    {item.paletteMatch === "great" ? "✓ great match" : "⚠ use carefully"}
                  </span>
                </article>
              ))}
            </div>
            <Link href="/wardrobe/add" className="btn" style={{ width: "100%", marginTop: 24 }}>
              add another item
            </Link>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

async function getCurrentWardrobeUserId(): Promise<string | null> {
  if (!isSupabaseAuthConfigured(SUPABASE_AUTH_ENV)) return null;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.id ?? null;
  } catch {
    return null;
  }
}

async function fetchPersistedWardrobeItems(userId: string): Promise<PersistedWardrobeItem[] | null> {
  const params = new URLSearchParams({ userId });
  const response = await fetch(`/api/wardrobe?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;

  const data = (await response.json().catch(() => null)) as {
    items?: PersistedWardrobeItem[];
  } | null;

  return Array.isArray(data?.items) ? data.items : null;
}
