"use client";

import { useEffect, useRef, useState } from "react";
import type { ColorFamilyDiagnostic, NeutralShade } from "@/lib/report/color-diagnostics-schema";
import { DrapePortrait } from "./drape-portrait";
import "./family-swiper.css";

const FAMILY_META: Record<string, { label: string; paletteImage: string }> = {
  warm:    { label: "warm tones",    paletteImage: "/palettes/warm.png" },
  cool:    { label: "cool tones",    paletteImage: "/palettes/cool.png" },
  bright:  { label: "bright tones",  paletteImage: "/palettes/bright.png" },
  muted:   { label: "muted tones",   paletteImage: "/palettes/muted.png" },
  light:   { label: "light tones",   paletteImage: "/palettes/light.png" },
  deep:    { label: "deep tones",    paletteImage: "/palettes/deep.png" },
};

type Slide =
  | { kind: "family"; data: ColorFamilyDiagnostic }
  | { kind: "neutrals"; shades: NeutralShade[] };

type Props = {
  neutralDrapingUrl: string;
  families: ColorFamilyDiagnostic[];
  neutrals: NeutralShade[];
  onComplete: () => void;
};

export function FamilySwiper({ neutralDrapingUrl, families, neutrals, onComplete }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeNeutralIdx, setActiveNeutralIdx] = useState(0);

  const slides: Slide[] = [
    ...families.map(f => ({ kind: "family" as const, data: f })),
    { kind: "neutrals" as const, shades: neutrals },
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
          // Neutrals slide — interactive circles, same drape mechanic as BestColorsSlide
          const activeNeutral = slide.shades[activeNeutralIdx];
          return (
            <div key="neutrals" className="family-swiper__slide">
              <div className="family-swiper__portrait-wrap">
                <DrapePortrait
                  baseImageUrl={neutralDrapingUrl}
                  overlayColor={activeNeutral?.hex}
                  alt="neutral colour try-on"
                />
              </div>
              <div className="family-swiper__slide-body">
                <p className="family-swiper__family-label">neutrals</p>
                <div className="family-swiper__neutral-circles">
                  {slide.shades.map((shade, ni) => (
                    <button
                      key={shade.hex}
                      className={`family-swiper__neutral-circle${ni === activeNeutralIdx ? " family-swiper__neutral-circle--active" : ""}`}
                      style={{ background: shade.hex }}
                      onClick={() => setActiveNeutralIdx(ni)}
                      aria-label={shade.name}
                      title={shade.name}
                    />
                  ))}
                </div>
                {activeNeutral && (
                  <div className="family-swiper__neutral-info">
                    <p className="family-swiper__neutral-name">{activeNeutral.name}</p>
                    <p className="family-swiper__comment">{activeNeutral.comment}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <span className="family-swiper__sr-only" aria-live="polite" aria-atomic="true">
        {`slide ${activeIdx + 1} of ${total}`}
      </span>
      <div className="family-swiper__dots">
        {slides.map((_, i) => (
          <span
            key={i}
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
