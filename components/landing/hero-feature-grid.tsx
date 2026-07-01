"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { TiltedCard } from "@/components/ui/tilted-card";

const FEATURE_CARDS = [
  {
    id: "color",
    label: "Color season",
    detail: "12 sub-seasons",
    rotate: "-1.5deg",
    src: "/images/hero/color-season.png",
    alt: "Fan of fabric swatches in warm seasonal colours",
  },
  {
    id: "wardrobe",
    label: "Wardrobe scan",
    detail: "match verdict",
    rotate: "1deg",
    src: "/images/hero/wardrobe-scan.png",
    alt: "Three garments on hangers in camel, rust and cream",
  },
  {
    id: "face",
    label: "Face & body",
    detail: "silhouette guide",
    rotate: "1.5deg",
    src: "/images/hero/face-body.png",
    alt: "Close-up front-facing portrait for face analysis",
  },
  {
    id: "market",
    label: "Shop smart",
    detail: "season picks",
    rotate: "-1deg",
    src: "/images/hero/shop-smart.png",
    alt: "Curated fashion accessories flat-lay in warm palette",
  },
];

export function HeroFeatureGrid() {
  return (
    <div className="hero__grid-visual">
      <div className="hero__feature-grid">
        {FEATURE_CARDS.map((card, index) => (
          <TiltedCard
            key={card.id}
            className={`hero__feature-card hero__feature-card--${index + 1}`}
            style={{ "--card-rotate": card.rotate } as CSSProperties}
            ariaLabel={`${card.label}: ${card.detail}`}
            captionText={card.label}
            rotateAmplitude={7}
            scaleOnHover={1.04}
            showTooltip
          >
            <div className="hero__feature-art hero__feature-art--photo">
              <Image
                src={card.src}
                alt={card.alt}
                fill
                sizes="(max-width: 900px) 44vw, 240px"
                className="hero__feature-photo"
              />
            </div>
            <div className="hero__feature-caption">
              <span className="hero__feature-label">{card.label}</span>
              <span className="hero__feature-detail">{card.detail}</span>
            </div>
          </TiltedCard>
        ))}
      </div>
    </div>
  );
}
