"use client";

import Image from "next/image";
import { BeforeAfter } from "@/components/landing/before-after";
import { IMAGES } from "@/lib/shared/demo-images";
import { PRODUCTS } from "@/lib/shared/landing-data";

const PICKS = PRODUCTS.slice(0, 3);

export function HeroVisualStack() {
  return (
    <div className="hero__stack-wrap">
      <div className="hero__stack" aria-label="PaletteMe features preview">
        <figure className="hero__polaroid hero__polaroid--1">
          <span className="hero__stack-label">wardrobe scan</span>
          <div className="hero__polaroid-photo">
            <Image
              src={IMAGES.clothingFlat}
              alt="Scanning a clothing item with PaletteMe"
              fill
              sizes="(max-width: 900px) 280px, 320px"
              style={{ objectFit: "cover" }}
              priority
            />
            <div className="fdemo__scan-grid" aria-hidden />
            <div className="hero__stack-scan-line" aria-hidden />
          </div>
        </figure>

        <figure className="hero__polaroid hero__polaroid--2 hero__polaroid--center">
          <span className="hero__stack-label">color analysis</span>
          <div className="hero__polaroid-photo">
            <BeforeAfter compact polaroid />
          </div>
        </figure>

        <figure className="hero__polaroid hero__polaroid--3">
          <span className="hero__stack-label">marketplace picks</span>
          <div className="hero__polaroid-photo hero__polaroid-photo--picks">
            {PICKS.map((p) => (
              <div key={p.name} className="hero__stack-pick">
                <div className="hero__stack-pick-img">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 900px) 100px, 120px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <span className="hero__stack-pick-match">{p.match}%</span>
              </div>
            ))}
          </div>
        </figure>
      </div>
    </div>
  );
}
