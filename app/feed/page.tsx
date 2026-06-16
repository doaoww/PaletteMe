"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadQuizProfile, type QuizProfile } from "@/lib/quiz";
import { SEASONS } from "@/lib/landing-data";
import { ProductFeed } from "@/components/feed/product-feed";
import { BottomNav } from "@/components/nav/bottom-nav";
import "../app-shell.css";

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
    <div className="app-shell">
      <header className="app-topbar glass-nav">
        <Link href="/home" className="wordmark app-topbar__wordmark">
          palette<span className="me">me</span>
        </Link>
        <span className="app-chip app-chip--pink">{season.name}</span>
      </header>

      <div className="app-shell__main">
        <div style={{ marginBottom: 24 }}>
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
      <BottomNav />
    </div>
  );
}
