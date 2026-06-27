"use client";

import type { MiniResult } from "@/lib/report/report-schema";
import "./season-reveal.css";

const SEASON_CELEBS: Record<string, { name: string; image: string }[]> = {
  "true-spring":   [{ name: "Blake Lively", image: "/celebs/true-spring1.jpg" }, { name: "Margot Robbie", image: "/celebs/true-spring2.jpg" }, { name: "Cameron Diaz", image: "/celebs/true-spring3.jpg" }],
  "light-spring":  [{ name: "Taylor Swift", image: "/celebs/light-spring1.jpg" }, { name: "Reese Witherspoon", image: "/celebs/light-spring2.jpg" }, { name: "Sienna Miller", image: "/celebs/light-spring3.jpg" }],
  "bright-spring": [{ name: "Jennifer Lawrence", image: "/celebs/bright-spring1.jpg" }, { name: "Amanda Seyfried", image: "/celebs/bright-spring2.jpg" }, { name: "Jessica Simpson", image: "/celebs/bright-spring3.jpg" }],
  "true-summer":   [{ name: "Gwyneth Paltrow", image: "/celebs/true-summer1.jpg" }, { name: "Kate Moss", image: "/celebs/true-summer2.jpg" }, { name: "Uma Thurman", image: "/celebs/true-summer3.jpg" }],
  "light-summer":  [{ name: "Nicole Kidman", image: "/celebs/light-summer1.jpg" }, { name: "Kirsten Dunst", image: "/celebs/light-summer2.jpg" }, { name: "Cate Blanchett", image: "/celebs/light-summer3.jpg" }],
  "soft-summer":   [{ name: "Jennifer Garner", image: "/celebs/soft-summer1.jpg" }, { name: "Sandra Bullock", image: "/celebs/soft-summer2.jpg" }, { name: "Sarah Jessica Parker", image: "/celebs/soft-summer3.jpg" }],
  "true-autumn":   [{ name: "Julianne Moore", image: "/celebs/true-autumn1.jpg" }, { name: "Emma Stone", image: "/celebs/true-autumn2.jpg" }, { name: "Amy Adams", image: "/celebs/true-autumn3.jpg" }],
  "soft-autumn":   [{ name: "Jennifer Lopez", image: "/celebs/soft-autumn1.jpg" }, { name: "Jessica Alba", image: "/celebs/soft-autumn2.jpg" }, { name: "Drew Barrymore", image: "/celebs/soft-autumn3.jpg" }],
  "dark-autumn":   [{ name: "Salma Hayek", image: "/celebs/dark-autumn1.jpg" }, { name: "Penélope Cruz", image: "/celebs/dark-autumn2.jpg" }, { name: "Sophia Loren", image: "/celebs/dark-autumn3.jpg" }],
  "true-winter":   [{ name: "Anne Hathaway", image: "/celebs/true-winter1.jpg" }, { name: "Zooey Deschanel", image: "/celebs/true-winter2.jpg" }, { name: "Liv Tyler", image: "/celebs/true-winter3.jpg" }],
  "dark-winter":   [{ name: "Kim Kardashian", image: "/celebs/dark-winter1.jpg" }, { name: "Megan Fox", image: "/celebs/dark-winter2.jpg" }, { name: "Cher", image: "/celebs/dark-winter3.jpg" }],
  "bright-winter": [{ name: "Mila Kunis", image: "/celebs/bright-winter1.jpg" }, { name: "Katy Perry", image: "/celebs/bright-winter2.jpg" }, { name: "Lucy Liu", image: "/celebs/bright-winter3.jpg" }],
};

type Props = {
  miniResult: MiniResult;
  seasonId: string;
  nextReady: boolean;
  onNext: () => void;
};

export function SeasonReveal({ miniResult, seasonId, nextReady, onNext }: Props) {
  const celebs = SEASON_CELEBS[seasonId] ?? [];

  return (
    <div className="sr">
      <div className="sr__body">
        <p className="sr__eyebrow">your colour type</p>
        <h1 className="sr__headline">{miniResult.headline}</h1>
        <p className="sr__tagline">{miniResult.tagline}</p>
        <p className="sr__summary">{miniResult.summary}</p>

        {celebs.length > 0 && (
          <div className="sr__celebs">
            <p className="sr__celebs-label">you share this colour type with</p>
            <div className="sr__celeb-row">
              {celebs.map(c => (
                <div key={c.name} className="sr__celeb">
                  <div className="sr__celeb-img-wrap">
                    <img src={c.image} alt={c.name} className="sr__celeb-img" />
                  </div>
                  <p className="sr__celeb-name">{c.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sr__footer">
        {!nextReady && (
          <p className="sr__preparing">preparing your colour analysis…</p>
        )}
        <button
          className={`sr__next${nextReady ? " sr__next--ready" : ""}`}
          onClick={onNext}
          disabled={!nextReady}
          aria-disabled={!nextReady}
        >
          {nextReady ? "start colour analysis →" : "getting your portrait ready…"}
        </button>
      </div>
    </div>
  );
}
