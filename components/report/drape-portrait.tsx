"use client";

import "./drape-portrait.css";

type Props = {
  baseImageUrl: string;
  overlayImage?: string;   // e.g. "/palettes/warm.webp"
  overlayColor?: string;   // e.g. "#B8653B"
  alt?: string;
};

export function DrapePortrait({ baseImageUrl, overlayImage, overlayColor, alt = "colour draping" }: Props) {
  return (
    <div className="drape-portrait">
      <img src={baseImageUrl} alt={alt} className="drape-portrait__base" />
      {overlayImage && (
        <img
          src={overlayImage}
          aria-hidden
          className="drape-portrait__overlay drape-portrait__overlay--palette"
        />
      )}
      {overlayColor && !overlayImage && (
        <div
          className="drape-portrait__overlay drape-portrait__overlay--color"
          style={{ background: overlayColor }}
          aria-hidden
        />
      )}
    </div>
  );
}
