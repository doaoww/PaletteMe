"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";

const DRAPE_OPTIONS = [
  {
    id: "misty-blue",
    name: "Misty blue",
    hex: "#AFC6D7",
    role: "soft summer best",
    score: "96%",
    title: "The skin looks calmer and the eyes become the focus.",
    comment:
      "This muted cool blue repeats the softness in her eyes without adding harsh contrast. Her skin looks smoother, the cheeks stay fresh, and the eye color feels clearer.",
    reason: "Soft Summer colors are cool, muted and light-to-medium in depth, which matches her gentle contrast.",
    next: "Use it for knits, shirts, scarves, soft eyeliner, or any color worn close to the face.",
  },
  {
    id: "dusty-rose",
    name: "Dusty rose",
    hex: "#C99AA7",
    role: "natural flush",
    score: "92%",
    title: "The lips and cheeks look more harmonious.",
    comment:
      "Dusty rose connects with the natural pink in her lips and cheeks, so the face looks polished without making redness louder.",
    reason: "It is cool-pink, muted and not too bright, so it supports her coloring instead of competing with it.",
    next: "Use it for blush, lipstick, knitwear, dresses, nails and soft monochrome outfits.",
  },
  {
    id: "soft-sage",
    name: "Soft sage",
    hex: "#A8B7A2",
    role: "quiet neutral",
    score: "86%",
    title: "Gentle and believable, especially with cool makeup.",
    comment:
      "This sage stays muted enough for her features. It softens the overall look, though it works best with a cool pink lip so the face does not read too flat.",
    reason: "The greyed green keeps contrast low and avoids the yellow cast that warmer olives can create.",
    next: "Use it for outerwear, soft tailoring, sweaters or as a calm base with rose and blue accents.",
  },
  {
    id: "clear-orange",
    name: "Clear orange",
    hex: "#E46B32",
    role: "not ideal",
    score: "38%",
    title: "Too warm and bright for her softness.",
    comment:
      "This orange pulls yellow into the skin and makes the under-eye area look more shadowed. Instead of making her eyes brighter, it makes the face look a little tired.",
    reason: "It is warmer, clearer and more saturated than a Soft Summer palette can comfortably hold.",
    next: "Keep it away from the face, or replace it with dusty rose, muted berry, misty blue or soft sage.",
  },
] as const;

export function ReportDrapeDemo() {
  const [activeId, setActiveId] = useState<(typeof DRAPE_OPTIONS)[number]["id"]>("misty-blue");
  const active = DRAPE_OPTIONS.find((option) => option.id === activeId) ?? DRAPE_OPTIONS[0];

  const portraitStyle = {
    "--drape-color": active.hex,
  } as CSSProperties;

  return (
    <section id="report-preview" className="report-tryon">
      <div className="wrap report-tryon__inner">
        <div className="report-tryon__copy reveal">
          <div className="eyebrow">
            <span className="kicker">interactive report preview</span>
          </div>
          <h2>See how your report explains color on a real face.</h2>
          <p>
            PaletteMe does more than name a palette. It shows what each shade
            does to your features, why it works, and how to use it in real life.
          </p>
          <div className="report-tryon__metrics" aria-label="Example report details">
            <div>
              <span>season</span>
              <strong>Soft Summer</strong>
            </div>
            <div>
              <span>checks</span>
              <strong>skin clarity + eye brightness</strong>
            </div>
          </div>
          <div className="report-tryon__actions">
            <Link href="/sample-report" className="report-tryon__link">
              see sample report
            </Link>
            <Link href="/style-setup" className="report-tryon__link report-tryon__link--secondary">
              upload my photo
            </Link>
          </div>
        </div>

        <div className="report-tryon__stage reveal">
          <div className="report-tryon__portrait-card" style={portraitStyle}>
            <div className="report-tryon__portrait">
              <Image
                src="/images/landing/season-summer.jpg"
                alt="Soft Summer portrait with interactive color draping"
                fill
                sizes="(max-width: 900px) 88vw, 440px"
                className="report-tryon__image"
              />
              <div className="report-tryon__drape" aria-hidden="true" />
            </div>
            <div className="report-tryon__swatches" aria-label="Demo drape colors">
              {DRAPE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`report-tryon__swatch${
                    active.id === option.id ? " report-tryon__swatch--active" : ""
                  }`}
                  style={{ backgroundColor: option.hex }}
                  aria-label={`${option.name} drape`}
                  aria-pressed={active.id === option.id}
                  title={option.name}
                  onClick={() => setActiveId(option.id)}
                />
              ))}
            </div>
          </div>

          <article className="report-tryon__analysis" aria-live="polite">
            <div className="report-tryon__analysis-top">
              <span>{active.role}</span>
              <strong>{active.score}</strong>
            </div>
            <p className="report-tryon__color-name">{active.name}</p>
            <h3>{active.title}</h3>
            <p>{active.comment}</p>
            <dl>
              <div>
                <dt>reason</dt>
                <dd>{active.reason}</dd>
              </div>
              <div>
                <dt>next</dt>
                <dd>{active.next}</dd>
              </div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}
