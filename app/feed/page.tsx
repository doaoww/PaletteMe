"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppChrome } from "@/components/nav/app-chrome";
import { loadQuizProfile, type QuizProfile } from "@/lib/quiz";
import { SEASONS } from "@/lib/landing-data";
import { buildPreviewColors } from "@/lib/result-palette";
import { ProductFeed } from "@/components/feed/product-feed";
import "../app-shell.css";
import "./feed.css";

const CATEGORIES = [
  { id: "", label: "all" },
  { id: "tops", label: "tops" },
  { id: "bottoms", label: "bottoms" },
  { id: "shoes", label: "shoes" },
  { id: "makeup", label: "makeup" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

export default function FeedPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<QuizProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState<CategoryId>("");

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
      <AppChrome className="app-chrome--feed">
        <div className="app-shell feed-page">
          <div className="feed-page__loading">loading…</div>
        </div>
      </AppChrome>
    );
  }

  const season = SEASONS.find((s) => s.id === profile.seasonId) ?? SEASONS[0];
  const subSeason = profile.subSeason ?? season.name;
  const palette = buildPreviewColors(season, 6, subSeason);
  const hasMakeup = profile.answers?.makeupPref !== "no";

  const visibleCategories = hasMakeup
    ? CATEGORIES
    : CATEGORIES.filter((c) => c.id !== "makeup");

  return (
    <AppChrome className="app-chrome--feed">
      <div className="app-shell feed-page">
        <header className="feed-page__header">
          <div className="feed-page__palette" aria-hidden>
            {palette.map((hex) => (
              <span key={hex} className="feed-page__swatch" style={{ background: hex }} />
            ))}
          </div>
          <div className="feed-page__header-body">
            <p className="feed-page__kicker">your picks</p>
            <h1 className="feed-page__title">
              Curated for{" "}
              <span className="feed-page__season">{subSeason}</span>
            </h1>
            <p className="feed-page__subtitle">
              Ranked by color match
              {profile.bodyType ? ` · ${profile.bodyType} fit` : ""}
              {profile.answers?.wardrobeType ? ` · ${profile.answers.wardrobeType}` : ""}
            </p>
          </div>
        </header>

        <div className="feed-page__filters" role="group" aria-label="Filter by category">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`feed-filter-chip${category === cat.id ? " feed-filter-chip--active" : ""}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="feed-page__body">
          <ProductFeed profile={profile} category={category} />
        </div>
      </div>
    </AppChrome>
  );
}
