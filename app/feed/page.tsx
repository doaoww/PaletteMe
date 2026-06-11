"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadQuizProfile, type QuizProfile } from "@/lib/quiz";
import { SEASONS } from "@/lib/landing-data";
import { ProductFeed } from "@/components/feed/product-feed";

export default function FeedPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = loadQuizProfile();
    if (!p) {
      router.replace("/quiz");
      return;
    }
    setProfile(p);
    setReady(true);
  }, [router]);

  if (!ready || !profile) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--sans)", color: "var(--ink-soft)" }}>
        Loading…
      </div>
    );
  }

  const season = SEASONS.find((s) => s.id === profile.seasonId) ?? SEASONS[0];

  return (
    <div style={{ background: "var(--cream)", minHeight: "100svh" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px var(--pad)", borderBottom: "1px solid var(--hair)" }}>
        <Link href="/" className="wordmark" style={{ color: "var(--ink)", fontSize: "1.2rem" }}>
          palette<span style={{ color: "var(--pink)" }}>me</span>
        </Link>
        <nav style={{ display: "flex", gap: 24, fontFamily: "var(--sans)", fontSize: "0.85rem" }}>
          <Link href="/profile" style={{ color: "var(--ink-soft)" }}>profile</Link>
          <Link href="/feed" style={{ color: "var(--pink)", fontWeight: 700 }}>feed</Link>
          <Link href="/saved" style={{ color: "var(--ink-soft)" }}>saved</Link>
        </nav>
      </header>

      <div className="wrap" style={{ paddingTop: "clamp(32px,5vh,56px)", paddingBottom: "clamp(48px,8vh,96px)" }}>
        <div style={{ marginBottom: 32 }}>
          <p className="kicker" style={{ fontSize: "0.58rem", marginBottom: 10 }}>your feed</p>
          <p className="font-serif" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", lineHeight: 1.08 }}>
            Picks for <span className="scr" style={{ color: "var(--pink)" }}>{season.name}</span>
          </p>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.88rem", color: "var(--ink-soft)", marginTop: 8 }}>
            Ranked by color match
            {profile.bodyType ? ` · ${profile.bodyType} silhouettes` : ""}
            {profile.styleVector?.aesthetics.length ? ` · ${profile.styleVector.aesthetics.slice(0, 2).join(", ")} style` : ""}
          </p>
        </div>

        <ProductFeed profile={profile} />
      </div>
    </div>
  );
}
