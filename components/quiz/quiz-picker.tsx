import Image from "next/image";
import type { ReactNode } from "react";
import { BodyShapeSilhouette } from "@/components/quiz/body-shape-silhouettes";
import type { BodyShape, WardrobeType } from "@/lib/quiz-data";

type SwatchSize = "sm" | "md" | "lg";

const WARDROBE_VISUAL: Record<WardrobeType, string> = {
  menswear: "linear-gradient(160deg, #e6e2dc 0%, #b8b2a8 48%, #8f8980 100%)",
  womenswear: "linear-gradient(160deg, #ffe8f0 0%, #f5c4d8 52%, #e8a8c4 100%)",
  both: "linear-gradient(135deg, #ffe8f0 0%, #f4e5d2 50%, #d8d2c8 100%)",
  unisex: "linear-gradient(160deg, #f6ece0 0%, #ecdac2 55%, #dcc9ae 100%)",
};

export function QuizStepHead({
  kicker,
  title,
  helper,
}: {
  kicker: string;
  title: string;
  helper?: string;
}) {
  return (
    <div className="quiz-page__step-head">
      <p className="quiz__qn">{kicker}</p>
      <h2 className="quiz__qt">{title}</h2>
      {helper ? <p className="quiz-page__helper">{helper}</p> : null}
    </div>
  );
}

export function SwatchGrid({
  children,
  cols = 2,
  row,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4 | 6;
  row?: boolean;
}) {
  const className = row
    ? "quiz-swatch-row"
    : `quiz-swatch-grid quiz-swatch-grid--${cols}`;
  return <div className={className}>{children}</div>;
}

export function SwatchOption({
  swatch,
  label,
  sub,
  onClick,
  size = "md",
  ring,
  selected,
}: {
  swatch: string;
  label: string;
  sub?: string;
  onClick: () => void;
  size?: SwatchSize;
  ring?: boolean;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      className={`quiz-swatch quiz-swatch--${size}${selected ? " quiz-swatch--selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span
        className={`quiz-swatch__circle${ring || selected ? " quiz-swatch__circle--ring" : ""}`}
        style={{ background: swatch }}
        aria-hidden
      />
      <span className="quiz-swatch__text">
        <span className="quiz-swatch__label">{label}</span>
        {sub ? <small className="quiz-swatch__sub">{sub}</small> : null}
      </span>
    </button>
  );
}

export function WardrobeCard({
  id,
  title,
  sub,
  image,
  frameTilt = "left",
  onClick,
  selected,
}: {
  id: WardrobeType;
  title: string;
  sub: string;
  image?: string;
  frameTilt?: "left" | "right";
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      className={`quiz-wardrobe-card${selected ? " quiz-wardrobe-card--selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="quiz-wardrobe-card__check" aria-hidden>
        {selected ? "✓" : ""}
      </span>
      <div
        className={`quiz-wardrobe-card__frame quiz-wardrobe-card__frame--${frameTilt}`}
      >
        {image ? (
          <div className="quiz-wardrobe-card__visual">
            <Image
              src={image}
              alt=""
              fill
              className="quiz-wardrobe-card__img"
              sizes="180px"
            />
          </div>
        ) : (
          <div
            className="quiz-wardrobe-card__visual"
            style={{ background: WARDROBE_VISUAL[id] }}
            aria-hidden
          />
        )}
      </div>
      <div className="quiz-wardrobe-card__copy">
        <span className="quiz-wardrobe-card__title">{title}</span>
        <span className="quiz-wardrobe-card__sub">{sub}</span>
      </div>
    </button>
  );
}

export function QuizRadioCard({
  title,
  sub,
  onClick,
  selected,
}: {
  title: string;
  sub?: string;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      className={`quiz-radio-card${selected ? " quiz-radio-card--selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="quiz-radio-card__copy">
        <span className="quiz-radio-card__title">{title}</span>
        {sub ? <span className="quiz-radio-card__sub">{sub}</span> : null}
      </span>
      <span
        className={`quiz-radio-card__radio${selected ? " quiz-radio-card__radio--on" : ""}`}
        aria-hidden
      />
    </button>
  );
}

export function QuizRadioList({ children }: { children: ReactNode }) {
  return <div className="quiz-radio-list">{children}</div>;
}

export function BodyShapeCard({
  label,
  shape,
  selected,
  onClick,
  solo,
  wardrobeType,
}: {
  label: string;
  shape: BodyShape;
  selected?: boolean;
  onClick: () => void;
  solo?: boolean;
  wardrobeType?: WardrobeType;
}) {
  return (
    <button
      type="button"
      className={`quiz-body-card${selected ? " quiz-body-card--selected" : ""}${solo ? " quiz-body-card--solo" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <BodyShapeSilhouette shape={shape} className="quiz-body-card__svg" wardrobeType={wardrobeType} />
      <span className="quiz-body-card__label">{label}</span>
    </button>
  );
}

export function WeatherStatCards({
  temperature,
  humidity,
  uvIndex,
  tempUnit,
  loading,
}: {
  temperature?: number;
  humidity?: number;
  uvIndex?: number;
  tempUnit?: string;
  loading?: boolean;
}) {
  return (
    <div className="quiz-weather-stats" aria-live="polite">
      <div className="quiz-weather-stats__card">
        <span className="quiz-weather-stats__label">Temperature</span>
        <span className="quiz-weather-stats__value">
          {loading ? "…" : temperature != null ? `${temperature}${tempUnit ?? "°C"}` : "—"}
        </span>
      </div>
      <div className="quiz-weather-stats__card">
        <span className="quiz-weather-stats__label">Humidity</span>
        <span className="quiz-weather-stats__value">
          {loading ? "…" : humidity != null ? `${humidity}%` : "—"}
        </span>
      </div>
      <div className="quiz-weather-stats__card">
        <span className="quiz-weather-stats__label">UV Index</span>
        <span className="quiz-weather-stats__value">
          {loading ? "…" : uvIndex != null ? String(uvIndex) : "—"}
        </span>
      </div>
    </div>
  );
}

export function QuizCardButton({
  title,
  sub,
  onClick,
  selected,
}: {
  title: string;
  sub?: string;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      className={`quiz-page__card${selected ? " quiz-page__card--selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="quiz-page__card-title">{title}</span>
      {sub ? <span className="quiz-page__card-sub">{sub}</span> : null}
    </button>
  );
}

export function QuizCardList({
  children,
  stack,
}: {
  children: ReactNode;
  stack?: boolean;
}) {
  return (
    <div className={`quiz-page__cards${stack ? " quiz-page__cards--stack" : ""}`}>
      {children}
    </div>
  );
}

export function QuizStackButton({
  title,
  sub,
  onClick,
  selected,
}: {
  title: string;
  sub?: string;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      className={`quiz__opt quiz__opt--tall${selected ? " quiz__opt--selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span>
        {title}
        {sub ? <small>{sub}</small> : null}
      </span>
    </button>
  );
}

export function QuizDecision({
  primary,
  secondary,
}: {
  primary: { title: string; sub: string; onClick: () => void };
  secondary: { title: string; sub: string; onClick: () => void };
}) {
  return (
    <div className="quiz-page__decision">
      <button type="button" className="quiz-page__decision-btn" onClick={primary.onClick}>
        <span className="quiz-page__decision-title">{primary.title}</span>
        <span className="quiz-page__decision-sub">{primary.sub}</span>
      </button>
      <button type="button" className="quiz-page__decision-btn" onClick={secondary.onClick}>
        <span className="quiz-page__decision-title">{secondary.title}</span>
        <span className="quiz-page__decision-sub">{secondary.sub}</span>
      </button>
      <p className="quiz-page__decision-note">
        Photos are processed securely for analysis. PaletteMe does not sell or share your images.
      </p>
      <p className="quiz-page__decision-note">
        A selfie improves accuracy by about 10–15% on average
      </p>
    </div>
  );
}

export function QuizSection({
  title,
  helper,
  children,
}: {
  title: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <section className="quiz-page__section">
      <h3 className="quiz-page__section-title">{title}</h3>
      {helper ? <p className="quiz-page__section-helper">{helper}</p> : null}
      {children}
    </section>
  );
}

export function QuizChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`quiz-page__tag${selected ? " quiz-page__tag--on" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

export function QuizFooter({
  onContinue,
  disabled,
  label = "continue",
  hint,
}: {
  onContinue: () => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
}) {
  return (
    <footer className="quiz-page__footer glass-nav">
      <button
        type="button"
        className={`btn quiz-page__footer-btn${disabled ? "" : " quiz-page__footer-btn--active"}`}
        disabled={disabled}
        onClick={onContinue}
      >
        {label}
      </button>
      {hint ? <p className="quiz-page__footer-hint">{hint}</p> : null}
    </footer>
  );
}
