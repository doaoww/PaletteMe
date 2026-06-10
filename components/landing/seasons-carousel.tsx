"use client";

import Image from "next/image";
import { useState } from "react";
import { IMAGES } from "@/lib/demo-images";
import { SEASONS } from "@/lib/landing-data";

const SEASON_PORTRAITS = [
  IMAGES.seasonSpring,
  IMAGES.seasonSummer,
  IMAGES.seasonAutumn,
  IMAGES.seasonWinter,
];

const SEASON_ACCENTS = [
  IMAGES.fashion1,
  IMAGES.fashion4,
  IMAGES.fashion2,
  IMAGES.outfitRight,
];

const SEASON_NEUTRALS = [
  IMAGES.outfitRight,
  IMAGES.fashion3,
  IMAGES.wardrobe,
  IMAGES.mirror,
];

export function SeasonsCarousel() {
  const [active, setActive] = useState(0);
  const season = SEASONS[active];

  const prev = () => setActive((i) => (i === 0 ? SEASONS.length - 1 : i - 1));
  const next = () => setActive((i) => (i === SEASONS.length - 1 ? 0 : i + 1));

  return (
    <section
      id="seasons"
      className="seasons"
      style={{ background: season.bg, color: season.color }}
    >
      <div className="wrap">
        <div className="seasons__head">
          <div className="shead-l">
            <h2>
              Find your <span className="scr">season</span>
            </h2>
            <span className="shead-sub">four palettes · one you</span>
          </div>
          <div className="ctabs">
            {SEASONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`ctab${i === active ? " active" : ""}`}
                onClick={() => setActive(i)}
                style={{ "--cbg": s.cbg } as React.CSSProperties}
              >
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="cstage">
          {SEASONS.map((s, i) => (
            <div
              key={s.id}
              className={`cslide${i === active ? " active" : ""}`}
              data-season={s.id}
            >
              <div className="cwm">
                <span style={{ color: s.cac }}>{s.name}</span>
              </div>

              <div className="cside l">
                <span className="chno">01 — undertone</span>
                <div className="ctemp">
                  {s.temps.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <p className="clead">{s.lead}</p>
                <div className="cmini">
                  <div className="cmini__pair">
                    <div className="cmini__photo ba__img" style={{ aspectRatio: "3/4" }}>
                      <Image
                        src={SEASON_NEUTRALS[i]}
                        alt={`${s.name} neutral outfit`}
                        fill
                        sizes="100px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="cmini__photo ba__img" style={{ aspectRatio: "3/4" }}>
                      <Image
                        src={SEASON_PORTRAITS[i]}
                        alt={`${s.name} portrait`}
                        fill
                        sizes="100px"
                        style={{ objectFit: "cover", objectPosition: "top" }}
                      />
                    </div>
                  </div>
                  <p className="cap">best neutrals</p>
                </div>
              </div>

              <div className="cmain">
                <div className="cmain__photo">
                  <div className="ba__img">
                    <Image
                      src={SEASON_PORTRAITS[i]}
                      alt={`${s.name} palette example`}
                      fill
                      sizes="400px"
                      style={{ objectFit: "cover", objectPosition: "top center" }}
                    />
                  </div>
                  <span className="cmain__season">{s.name}</span>
                </div>
                <div className="cmain__pal">
                  {s.palette.map((c) => (
                    <i key={c} style={{ background: c }} />
                  ))}
                </div>
                <div className="cmain__foot">
                  <span className="cname">{s.name} palette</span>
                  <span className="cmeta">8 core swatches</span>
                </div>
              </div>

              <div className="cside r">
                <span className="chno">02 — why it works</span>
                <p className="cwhy">{s.why}</p>
                <div className="cmini">
                  <div className="cmini__pair">
                    <div className="cmini__photo ba__img" style={{ aspectRatio: "3/4" }}>
                      <Image
                        src={SEASON_ACCENTS[i]}
                        alt={`${s.name} accent color`}
                        fill
                        sizes="100px"
                        style={{ objectFit: "cover", filter: "saturate(1.15)" }}
                      />
                    </div>
                    <div className="cmini__photo ba__img" style={{ aspectRatio: "3/4" }}>
                      <Image
                        src={SEASON_NEUTRALS[i]}
                        alt={`${s.name} style`}
                        fill
                        sizes="100px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                  <p className="cap">power accent</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cnav">
          <button type="button" className="carrow" onClick={prev} aria-label="Previous season">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="cnav__dots">
            {SEASONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`cdot${i === active ? " active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={s.name}
              />
            ))}
          </div>
          <button type="button" className="carrow" onClick={next} aria-label="Next season">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
