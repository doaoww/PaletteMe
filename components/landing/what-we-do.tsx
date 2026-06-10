import Image from "next/image";
import Link from "next/link";
import { IMAGES } from "@/lib/demo-images";
import { SEASONS } from "@/lib/landing-data";

const STEPS = [
  {
    n: "01",
    title: "Upload a selfie",
    desc: "Take a clear photo in natural light — no makeup filters, no studio needed.",
    image: IMAGES.selfie,
    alt: "Woman taking a selfie for color analysis",
  },
  {
    n: "02",
    title: "AI reads your coloring",
    desc: "We analyze undertone, contrast, and depth from your skin, hair, and eyes.",
    image: IMAGES.selfieAlt,
    alt: "Close-up portrait being analyzed by AI",
    overlay: true,
  },
  {
    n: "03",
    title: "Get your palette",
    desc: "Receive your seasonal type plus 8 core colors for clothes, makeup, and style.",
    image: IMAGES.outfitRight,
    alt: "Woman wearing colors from her seasonal palette",
    palette: SEASONS[1].palette,
    season: "Soft Summer",
  },
];

export function WhatWeDo() {
  return (
    <section id="what" className="what">
      <div className="wrap">
        <div className="what__head">
          <div className="eyebrow">
            <span className="kicker">what paletteme does</span>
          </div>
          <h2>
            Your selfie in.{" "}
            <span className="scr">Your palette</span> out.
          </h2>
          <p className="what__lead">
            PaletteMe is an AI color analysis tool. You upload a photo of your
            face, our AI figures out which seasonal color palette suits you, and
            you get exact colors to wear — so you always look your best.
          </p>
        </div>

        <div className="what__flow">
          <div className="what__arrow" aria-hidden>
            <span>selfie</span>
            <svg viewBox="0 0 80 16" fill="none"><path d="M0 8h68M68 8l-6-6M68 8l-6 6" stroke="currentColor" strokeWidth="1.5"/></svg>
            <span>ai scan</span>
            <svg viewBox="0 0 80 16" fill="none"><path d="M0 8h68M68 8l-6-6M68 8l-6 6" stroke="currentColor" strokeWidth="1.5"/></svg>
            <span>your colors</span>
          </div>

          <div className="what__steps">
            {STEPS.map((step) => (
              <article key={step.n} className="what__step">
                <div className="what__photo polaroid">
                  <div className="what__img">
                    <Image
                      src={step.image}
                      alt={step.alt}
                      fill
                      sizes="(max-width: 768px) 90vw, 30vw"
                      className="what__img-el"
                    />
                    {step.overlay && (
                      <div className="what__scan-overlay">
                        <span className="what__scan-dot" />
                        analyzing undertone…
                      </div>
                    )}
                  </div>
                  {step.palette && (
                    <div className="what__pal">
                      {step.palette.map((c) => (
                        <i key={c} style={{ background: c }} />
                      ))}
                    </div>
                  )}
                  {step.season && (
                    <p className="what__season-tag">{step.season}</p>
                  )}
                </div>
                <span className="what__num">{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </div>

        <ul className="what__benefits">
          <li>
            <strong>Know your season</strong> — Spring, Summer, Autumn, or Winter
          </li>
          <li>
            <strong>8 core swatches</strong> — exact hex colors for your wardrobe
          </li>
          <li>
            <strong>Shop smarter</strong> — only buy clothes in colors that suit you
          </li>
        </ul>

        <div className="what__cta">
          <Link href="/dashboard" className="cta-mini">
            try it free — upload your selfie
          </Link>
        </div>
      </div>
    </section>
  );
}
