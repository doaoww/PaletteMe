"use client";

import { useEffect, useRef, useState } from "react";
import type { ColorFamilyDiagnostic } from "@/lib/report/color-diagnostics-schema";
import { DrapePortrait } from "./drape-portrait";
import "./family-swiper.css";

const FAMILY_META: Record<string, { label: string; paletteImage: string }> = {
  warm:    { label: "warm tones",    paletteImage: "/palettes/warm.webp" },
  cool:    { label: "cool tones",    paletteImage: "/palettes/cool.webp" },
  bright:  { label: "bright tones",  paletteImage: "/palettes/bright.webp" },
  muted:   { label: "muted tones",   paletteImage: "/palettes/muted.webp" },
  light:   { label: "light tones",   paletteImage: "/palettes/light.webp" },
  deep:    { label: "deep tones",    paletteImage: "/palettes/deep.webp" },
};

type Slide =
  | { kind: "family"; data: ColorFamilyDiagnostic }
  | { kind: "neutrals"; comment: string };

type Props = {
  neutralDrapingUrl: string;
  families: ColorFamilyDiagnostic[];
  neutralsComment: string;
  onComplete: () => void;
};

export function FamilySwiper({ neutralDrapingUrl, families, neutralsComment, onComplete }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const slides: Slide[] = [
    ...families.map(f => ({ kind: "family" as const, data: f })),
    { kind: "neutrals" as const, comment: neutralsComment },
  ];

  const total = slides.length;
  const isLast = activeIdx === total - 1;

  // Track active slide via IntersectionObserver
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slideEls = Array.from(track.querySelectorAll<HTMLElement>(".family-swiper__slide"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = slideEls.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveIdx(idx);
          }
        });
      },
      { root: track, threshold: 0.6 },
    );
    slideEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="family-swiper">
      <div className="family-swiper__track" ref={trackRef}>
        {slides.map((slide, i) => {
          if (slide.kind === "family") {
            const meta = FAMILY_META[slide.data.id];
            return (
              <div key={slide.data.id} className="family-swiper__slide">
                <div className="family-swiper__portrait-wrap">
                  <DrapePortrait
                    baseImageUrl={neutralDrapingUrl}
                    overlayImage={meta?.paletteImage}
                    alt={`${meta?.label ?? slide.data.id} colour family`}
                  />
                  {slide.data.isWinner && (
                    <span className="family-swiper__winner-badge">suits you</span>
                  )}
                </div>
                <div className="family-swiper__slide-body">
                  <p className="family-swiper__family-label">{meta?.label ?? slide.data.id}</p>
                  <p className="family-swiper__comment">{slide.data.comment}</p>
                </div>
              </div>
            );
          }
          // Neutrals slide
          return (
            <div key="neutrals" className="family-swiper__slide">
              <div className="family-swiper__portrait-wrap">
                <DrapePortrait
                  baseImageUrl={neutralDrapingUrl}
                  overlayImage="/palettes/neutrals.webp"
                  alt="neutral colours"
                />
              </div>
              <div className="family-swiper__slide-body">
                <p className="family-swiper__family-label">neutrals</p>
                <p className="family-swiper__comment">{slide.comment}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="family-swiper__dots" role="tablist" aria-label="colour family slides">
        {slides.map((_, i) => (
          <span
            key={i}
            role="tab"
            aria-selected={i === activeIdx}
            className={`family-swiper__dot${i === activeIdx ? " family-swiper__dot--active" : ""}`}
          />
        ))}
      </div>

      {/* Next button — only shown on last slide */}
      {isLast && (
        <div className="family-swiper__footer">
          <button className="family-swiper__next" onClick={onComplete}>
            see your best colours →
          </button>
        </div>
      )}
    </div>
  );
}
