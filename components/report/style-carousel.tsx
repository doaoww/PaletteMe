"use client";

import { useRef } from "react";
import "./style-carousel.css";

export type CarouselCard = {
  id: string;
  name: string;
  image: string;
  sentence?: string;
  avoid?: boolean;
  badge?: string;           // e.g. "yours" on recommended metal
  items?: string[];         // outfit item list
  occasion?: string;        // outfit occasion label
};

type Props = {
  cards: CarouselCard[];
  aspect?: "square" | "portrait" | "landscape" | "fabric";
  showSentence?: boolean;
  label?: string;           // section sub-label e.g. "Best for you"
  avoidLabel?: string;      // label for the avoid row
  avoidCards?: CarouselCard[];
  size?: "sm" | "md" | "lg";
};

export default function StyleCarousel({
  cards,
  aspect = "square",
  showSentence = true,
  label,
  avoidLabel,
  avoidCards,
  size = "md",
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const avoidRef = useRef<HTMLDivElement>(null);

  return (
    <div className="sc-root">
      {label && <p className="sc-label">{label}</p>}

      {cards.length > 0 && (
        <div className={`sc-track sc-track--${size}`} ref={trackRef}>
          {cards.map((card) => (
            <CarouselCard key={card.id} card={card} aspect={aspect} showSentence={showSentence} />
          ))}
        </div>
      )}

      {avoidCards && avoidCards.length > 0 && (
        <>
          {avoidLabel && <p className="sc-label sc-label--avoid">{avoidLabel}</p>}
          <div className={`sc-track sc-track--${size} sc-track--avoid`} ref={avoidRef}>
            {avoidCards.map((card) => (
              <CarouselCard key={card.id} card={card} aspect={aspect} showSentence={showSentence} avoid />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CarouselCard({
  card,
  aspect,
  showSentence,
  avoid,
}: {
  card: CarouselCard;
  aspect: Props["aspect"];
  showSentence: boolean;
  avoid?: boolean;
}) {
  return (
    <div className={`sc-card ${avoid ? "sc-card--avoid" : ""} ${card.badge ? "sc-card--badged" : ""}`}>
      <div className={`sc-img-wrap sc-img-wrap--${aspect}`}>
        <img
          src={card.image}
          alt={card.name}
          className="sc-img"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).parentElement!.classList.add("sc-img-wrap--missing");
          }}
        />
        {card.badge && <span className="sc-badge">{card.badge}</span>}
        {avoid && <span className="sc-avoid-tag">avoid</span>}
      </div>

      <div className="sc-info">
        <p className="sc-name">{card.name}</p>
        {showSentence && card.sentence && (
          <p className="sc-sentence">{card.sentence}</p>
        )}
        {card.items && card.items.length > 0 && (
          <ul className="sc-outfit-items">
            {card.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
