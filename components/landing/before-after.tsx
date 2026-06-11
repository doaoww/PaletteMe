"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { IMAGES } from "@/lib/demo-images";
import { SEASONS } from "@/lib/landing-data";

const PALETTE = SEASONS[0].palette;

export function BeforeAfter() {
  const [pos, setPos] = useState(52);
  const dragging = useRef(false);
  const baRef = useRef<HTMLDivElement>(null);

  const setFromX = useCallback((clientX: number) => {
    const el = baRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(92, Math.max(8, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setFromX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) setFromX(e.clientX);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  return (
    <div>
      <div
        ref={baRef}
        className="ba"
        style={{ "--pos": `${pos}%` } as React.CSSProperties}
      >
        <div className="ba__layer ba__before">
          <div className="ba__img">
            <Image
              src={IMAGES.selfieAlt}
              alt="Before — wearing colors that clash with skin tone"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectPosition: "top center" }}
            />
          </div>
        </div>
        <div className="ba__layer ba__after">
          <div className="ba__img">
            <Image
              src={IMAGES.selfie}
              alt="After — wearing colors from her seasonal palette"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectPosition: "top center" }}
            />
          </div>
        </div>
        <span className="ba__tag l">wrong colors</span>
        <span className="ba__tag r">your palette</span>
        <div className="ba__cap">
          <div className="sw">
            {PALETTE.slice(0, 5).map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </div>
          <span>drag to compare</span>
        </div>
        <div
          className="ba__handle"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div className="ba__grip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 9l-4 4 4 4M16 9l4 4-4 4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="outfit-ex">
        <figure className="wrong">
          <div className="of">
            <div className="ba__img">
              <Image
                src={IMAGES.outfitWrong}
                alt="Outfit in colors that don't match skin tone"
                fill
                sizes="300px"
                style={{ filter: "grayscale(0.45) brightness(1.05)" }}
              />
            </div>
            <span className="badge">off-season</span>
          </div>
          <figcaption>
            <span className="dot" style={{ background: "#6A5560" }} />
            drains your complexion
          </figcaption>
        </figure>
        <figure className="right">
          <div className="of">
            <div className="ba__img">
              <Image
                src={IMAGES.outfitRight}
                alt="Outfit in seasonal palette colors"
                fill
                sizes="300px"
                style={{ filter: "saturate(1.15)" }}
              />
            </div>
            <span className="badge">in-season</span>
          </div>
          <figcaption>
            <span className="dot" style={{ background: "var(--pink)" }} />
            brightens your face
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
