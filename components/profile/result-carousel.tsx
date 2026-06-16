"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CreditPill } from "@/components/nav/credit-pill";
import { LS_USER_ID, type QuizProfile } from "@/lib/quiz";
import type { Season } from "@/lib/landing-data";
import type { ColorIntelligenceReport } from "@/lib/color-intelligence";
import {
  buildResultOnboardingCopy,
  hasSeenResultOnboarding,
  markResultOnboardingSeen,
  type ResultOnboardingCopy,
} from "@/lib/result-onboarding";
import {
  buildPreviewColors,
  buildSeasonAvoidSwatches,
  buildSeasonMetalSwatches,
  buildSeasonNeutralSwatches,
  buildSeasonPaletteSwatches,
  type ResultSwatch,
} from "@/lib/result-palette";
import { buildResultSwatchStyle } from "@/lib/result-swatch-style";
import { findSeasonPalette } from "@/lib/season-palettes";
import {
  DEFAULT_WEEKLY_SCAN_CREDITS,
  getBrowserScanCreditState,
  type ScanCreditState,
} from "@/lib/scan-credits";
import { ColorInsightsReport } from "@/components/profile/color-insights-report";

const SLIDE_COUNT = 5;
const ONBOARDING_SLIDE_COUNT = 3;
const EXPORT_SLIDE_WIDTH = 390;
const EXPORT_SLIDE_HEIGHT = 760;

type Swatch = ResultSwatch;
type ExportMode = "png" | "pdf" | null;
type OnboardingState = "checking" | "show" | "seen";

const carouselViewportStyle: React.CSSProperties = {
  background: "var(--cream-3)",
};

const labSlideStyle: React.CSSProperties = {
  alignItems: "stretch",
  justifyContent: "flex-start",
  width: "100%",
  maxWidth: "none",
  overflow: "hidden",
};

const centeredSlideStyle: React.CSSProperties = {
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  maxWidth: "none",
};

const centeredSlideContentStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 480,
  marginLeft: "auto",
  marginRight: "auto",
};

const scrollSectionStyle: React.CSSProperties = {
  width: "100%",
};

const centeredSlideControlStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 480,
  marginLeft: "auto",
  marginRight: "auto",
};

function carouselTrackStyle(slide: number): React.CSSProperties {
  return {
    transform: `translateX(-${slide * 100}%)`,
    width: "100%",
    height: "100%",
  };
}

function seasonRevealQuote(season: Season, subSeason?: string): string {
  if (subSeason) {
    const sp = findSeasonPalette(subSeason);
    if (sp?.whyOldClothesFeltWrong) return sp.whyOldClothesFeltWrong;
  }
  if (season.id === "autumn") {
    return "You're among the 12% whose skin glows in gold, terracotta and olive, while cool shades can look flat.";
  }
  if (season.id === "spring") {
    return "You're among those whose skin lights up in coral, peach, and clear warm tones, while heavy cool grey can dull it.";
  }
  if (season.id === "summer") {
    return "You're among those whose skin softens in dusty rose and muted blue, while orange or mustard can look harsh.";
  }
  return "You're among those whose skin sharpens in jewel tones and crisp contrast, while earthy warm beige can wash you out.";
}

function makeupOneLiner(season: Season, report: ColorIntelligenceReport): string {
  const warm = season.id === "autumn" || season.id === "spring";
  if (warm) {
    const lips = report.makeup.lips[0]?.toLowerCase() ?? "peachy lips";
    const eyes = report.makeup.eyes[0]?.toLowerCase() ?? "bronze shadow";
    const metal = report.jewelry.metals[0]?.toLowerCase() ?? "gold jewelry";
    return `${lips} В· ${eyes} В· ${metal}`;
  }
  const lips = report.makeup.lips[0]?.toLowerCase() ?? "rose lips";
  const eyes = report.makeup.eyes[0]?.toLowerCase() ?? "taupe shadow";
  const metal = report.jewelry.metals[0]?.toLowerCase() ?? "silver jewelry";
  return `${lips} В· ${eyes} В· ${metal}`;
}

function formatUndertoneIdentity(value: string): string {
  if (value === "warm") return "warm undertone";
  if (value === "cool") return "cool undertone";
  return "neutral-warm undertone";
}

function formatContrastIdentity(profile: QuizProfile): string {
  const contrast = profile.answers.contrastPref;
  if (contrast === "low") return "medium-low contrast";
  if (contrast === "high") return "clear facial contrast";
  return "medium contrast";
}

function secondaryInfluence(season: Season, subSeason?: string): string {
  if (subSeason?.trim() && subSeason !== season.name) {
    const label = subSeason.toLowerCase();
    if (label.includes("soft")) return "soft muted influence";
    if (label.includes("dark") || label.includes("deep")) return "deep rich influence";
    if (label.includes("light")) return "light airy influence";
    if (label.includes("bright")) return "bright clear influence";
    if (label.includes("warm")) return "warm classic influence";
    if (label.includes("cool")) return "cool classic influence";
    return `${season.name.toLowerCase()} family`;
  }
  if (season.id === "autumn") return "warm earth influence";
  if (season.id === "spring") return "fresh warm influence";
  if (season.id === "summer") return "soft cool influence";
  return "crisp cool influence";
}

function styleArchetype(season: Season, subSeason?: string): string {
  const label = subSeason?.toLowerCase() ?? "";
  if (label.includes("dark") || label.includes("deep")) return "deep quiet luxury";
  if (label.includes("soft")) return season.id === "summer" ? "soft elegant muse" : "soft elegant natural";
  if (label.includes("bright")) return "fresh polished energy";
  if (label.includes("light")) return "clean luminous ease";
  if (season.id === "autumn") return "warm refined natural";
  if (season.id === "summer") return "cool graceful minimalist";
  if (season.id === "spring") return "fresh radiant classic";
  return "crisp modern dramatic";
}

function styleEnergyWords(season: Season): string[] {
  if (season.id === "autumn") return ["warm neutrals", "natural textures", "quiet luxury", "soft tailoring"];
  if (season.id === "summer") return ["misty color", "soft polish", "delicate contrast", "cool elegance"];
  if (season.id === "spring") return ["fresh color", "golden light", "clean contrast", "easy glow"];
  return ["crisp contrast", "cool shine", "clean lines", "statement color"];
}

function glowReason(_name: string, season: Season): string {
  if (season.id === "autumn") return "Warm - natural - expensive";
  if (season.id === "summer") return "Soft - refined - graceful";
  if (season.id === "spring") return "Fresh - clear - awake";
  return "Crisp - clean - polished";
}

function avoidReason(_name: string, season: Season): string {
  if (season.id === "autumn") return "Too cool - stark - draining";
  if (season.id === "summer") return "Too warm - heavy - loud";
  if (season.id === "spring") return "Too flat - muted - dulling";
  return "Too soft - blurred - low contrast";
}

function oldClothesHook(season: Season): string {
  if (season.id === "autumn") {
    return "You may have bought cool black or icy pieces because they look chic on models. On you, those shades can cast shadows and hide your natural warmth.";
  }
  if (season.id === "summer") {
    return "You may have tried sharp warm colors because they look confident on the hanger. On you, they can feel louder than your features.";
  }
  if (season.id === "spring") {
    return "You may have reached for dusty neutrals because they feel safe. On you, they can mute the freshness that makes your face glow.";
  }
  return "You may have bought earthy soft shades because they feel easy. On you, they can blur the clean contrast that makes your features stand out.";
}

function useCountUp(target: number | undefined, durationMs = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target == null) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return target != null ? value : null;
}

function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function sanitizeFilenamePart(value: string): string {
  return value.trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-") || "palette";
}

function buildDownloadFilename(seasonName: string, extension: "png" | "pdf"): string {
  return `paletteMe-${sanitizeFilenamePart(seasonName)}.${extension}`;
}

async function waitForExportFonts() {
  await document.fonts?.ready.catch(() => undefined);
}

async function waitForExportStackRender() {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function captureResultElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import("html2canvas");
  await waitForExportFonts();

  return html2canvas(element, {
    backgroundColor: "#fff0f5",
    scale: Math.min(window.devicePixelRatio || 2, 2),
    useCORS: true,
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
  });
}

async function downloadSlidesPdf(
  slideElements: HTMLElement[],
  filename: string
): Promise<void> {
  if (slideElements.length === 0) return;
  const [{ jsPDF }] = await Promise.all([import("jspdf"), waitForExportFonts()]);
  const canvases = await Promise.all(slideElements.map((element) => captureResultElement(element)));
  const first = canvases[0];
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [first.width, first.height],
  });

  canvases.forEach((canvas, index) => {
    if (index > 0) {
      pdf.addPage([canvas.width, canvas.height], "portrait");
    }
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
  });

  pdf.save(filename);
}

function ProgressDots({ active, total }: { active: number; total: number }) {
  return (
    <div className="rc-dots" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`rc-dot${i === active ? " rc-dot--active" : ""}`} />
      ))}
    </div>
  );
}

function ColorCircle({
  hex,
  size,
  border,
  muted,
  label,
  gradient,
  shape = "circle",
}: {
  hex: string;
  size: number;
  border?: string;
  muted?: boolean;
  label?: string;
  gradient?: string;
  shape?: "circle" | "rect";
}) {
  return (
    <div className={`rc-swatch-item${shape === "rect" ? " rc-swatch-item--rect" : ""}`}>
      <span
        className={`rc-circle${muted ? " rc-circle--muted" : ""}${shape === "rect" ? " rc-circle--rect" : ""}`}
        style={buildResultSwatchStyle({ hex, size, border, gradient, shape })}
        aria-hidden
      />
      {label ? <span className="rc-swatch-label">{label}</span> : null}
    </div>
  );
}

function MakeupSwatch({ type, label }: { type: "lips" | "cheek" | "eyes" | "metal"; label: string }) {
  return (
    <div className="rc-swatch-item">
      <span className={`rc-makeup-swatch rc-makeup-swatch--${type}`} aria-hidden />
      <span className="rc-swatch-label">{label}</span>
    </div>
  );
}

function LabTopbar({
  menuOpen,
  onMenuToggle,
}: {
  menuOpen: boolean;
  onMenuToggle: () => void;
}) {
  return (
    <header className="rc-lab-topbar">
      <Link href="/home" className="rc-lab-icon" aria-label="Close results">
        x
      </Link>
      <div className="rc-lab-topbar__center">
        <span className="rc-lab-wordmark">paletteme</span>
        <CreditPill />
      </div>
      <button
        type="button"
        className={`rc-lab-menu${menuOpen ? " rc-lab-menu--open" : ""}`}
        aria-label="Report actions"
        aria-expanded={menuOpen}
        onClick={onMenuToggle}
      >
        <span aria-hidden>В·В·В·</span>
      </button>
    </header>
  );
}

function ScanCostIcon() {
  return (
    <svg className="rc-lab-cost-svg" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="6" y="14" width="36" height="26" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="27" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M18 14l3-6h6l3 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function OutfitCostIcon() {
  return (
    <svg className="rc-lab-cost-svg" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M24 8l8 6v4l-8 6-8-6v-4l8-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 18v18M32 18v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 36h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LabActionMenu({
  open,
  onClose,
  onShare,
  onPng,
  onPdf,
  exporting,
}: {
  open: boolean;
  onClose: () => void;
  onShare: () => void;
  onPng: () => void;
  onPdf: () => void;
  exporting: boolean;
}) {
  if (!open) return null;

  return (
    <div className="rc-lab-menu-sheet" role="dialog" aria-label="Report actions">
      <button type="button" className="rc-lab-menu-sheet__backdrop" aria-label="Close menu" onClick={onClose} />
      <div className="rc-lab-menu-sheet__panel">
        <p className="rc-lab-card-kicker">your report</p>
        <button type="button" onClick={() => { onShare(); onClose(); }}>share my palette</button>
        <button type="button" disabled={exporting} onClick={() => { void onPng(); onClose(); }}>download png</button>
        <button type="button" disabled={exporting} onClick={() => { void onPdf(); onClose(); }}>download pdf</button>
      </div>
    </div>
  );
}

function LabFooter({
  active,
  onPrev,
  onNext,
}: {
  active: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const isFirst = active === 0;
  const isLast = active === SLIDE_COUNT - 1;

  return (
    <nav className="rc-lab-footer" aria-label="Result navigation">
      <button
        type="button"
        className="rc-lab-footer__link"
        onClick={onPrev}
        disabled={isFirst}
      >
        <span aria-hidden>{"\u2190"}</span>
        <span>previous</span>
      </button>
      {isLast ? (
        <Link href="/scan" className="rc-lab-footer__primary">
          <span>Scan your first clothing item</span>
          <span aria-hidden>{"\u2192"}</span>
        </Link>
      ) : (
        <button type="button" className="rc-lab-footer__primary" onClick={onNext}>
          <span>next</span>
          <span aria-hidden>{"\u2192"}</span>
        </button>
      )}
    </nav>
  );
}

function ReportTopline({ number }: { number: string }) {
  return (
    <div className="rc-report-topline">
      <span>paletteMe</span>
      <span>{number}</span>
    </div>
  );
}

function ToneRow({
  swatch,
  reason,
}: {
  swatch: Swatch;
  reason: string;
}) {
  return (
    <article className={`rc-tone-row${swatch.muted ? " rc-tone-row--muted" : ""}`}>
      <span
        className="rc-tone-swatch"
        style={{
          background: swatch.gradient ?? swatch.hex,
          ...(swatch.border ? { border: `1px solid ${swatch.border}` } : {}),
        }}
        aria-hidden
      />
      <span className="rc-tone-copy">
        <strong>{swatch.name}</strong>
        <span>{reason}</span>
      </span>
    </article>
  );
}

function LabSwatchRow({
  swatch,
  reason,
}: {
  swatch: Swatch;
  reason: string;
}) {
  return (
    <article className={`rc-lab-swatch-row${swatch.muted ? " rc-lab-swatch-row--muted" : ""}`}>
      <span
        className="rc-lab-swatch rc-lab-swatch--circle"
        style={buildResultSwatchStyle({
          hex: swatch.hex,
          size: 48,
          border: swatch.border,
          gradient: swatch.gradient,
          shape: "circle",
        })}
        aria-hidden
      />
      <span className="rc-lab-swatch-copy">
        <strong>{swatch.name}</strong>
        <span>{reason}</span>
      </span>
    </article>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="rc-section-header">
      <h2 className="rc-section-header__title">{title}</h2>
      {subtitle ? <p className="rc-section-header__sub">{subtitle}</p> : null}
    </header>
  );
}

function SwatchPreviewGrid({ swatches, muted }: { swatches: Swatch[]; muted?: boolean }) {
  return (
    <div className={`rc-swatch-preview-grid${muted ? " rc-swatch-preview-grid--muted" : ""}`} aria-hidden>
      {swatches.map((swatch) => (
        <span
          key={swatch.name}
          className="rc-swatch-preview-grid__item"
          style={buildResultSwatchStyle({
            hex: swatch.hex,
            size: 44,
            border: swatch.border,
            gradient: swatch.gradient,
            shape: "circle",
          })}
          title={swatch.name}
        />
      ))}
    </div>
  );
}

function PaletteGrid({ swatches }: { swatches: Swatch[] }) {
  return (
    <div className="rc-palette-grid">
      {swatches.map((swatch) => (
        <div key={swatch.name} className="rc-palette-grid__item">
          <span
            className="rc-palette-grid__swatch"
            style={buildResultSwatchStyle({
              hex: swatch.hex,
              size: 56,
              border: swatch.border,
              gradient: swatch.gradient,
              shape: "rect",
            })}
            aria-hidden
          />
          <span className="rc-palette-grid__label">{swatch.name}</span>
        </div>
      ))}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  className,
  style,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} className={`rc-btn rc-btn--primary${className ? ` ${className}` : ""}`} style={style} onClick={onClick}>
      {children}
    </button>
  );
}

function CameraIcon() {
  return (
    <svg className="rc-camera-icon" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="4" y="12" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="26" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M16 12l4-6h8l4 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function WardrobeIcon() {
  return (
    <svg className="rc-camera-icon" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="10" y="8" width="28" height="34" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M24 8v34" stroke="currentColor" strokeWidth="2" />
      <path d="M19 24h-3M32 24h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 14h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PassportIcon() {
  return (
    <svg className="rc-camera-icon" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="10" y="7" width="28" height="34" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="20" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M16 32h16M18 36h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ResultOnboarding({
  copy,
  season,
  previewColors,
  palette12,
  onComplete,
}: {
  copy: ResultOnboardingCopy;
  season: Season;
  previewColors: string[];
  palette12: Swatch[];
  onComplete: () => void;
}) {
  const [slide, setSlide] = useState(0);
  const goNext = useCallback(() => setSlide((current) => Math.min(current + 1, ONBOARDING_SLIDE_COUNT - 1)), []);

  return (
    <div
      className="rc-carousel rc-carousel--lab"
      style={carouselViewportStyle}
      role="region"
      aria-label="Your result introduction"
      aria-roledescription="carousel"
    >
      <div className="rc-track" style={carouselTrackStyle(slide)}>
        <div className="rc-slide" style={centeredSlideStyle}>
          <ProgressDots active={0} total={ONBOARDING_SLIDE_COUNT} />
          <div className="rc-slide__body" style={centeredSlideContentStyle}>
            <p className="rc-eyebrow">Your season is ready</p>
            <h1 className="rc-season-name">{copy.displaySeasonName}</h1>
            <div className="rc-sub-row">
              <span className="rc-sub-season">{season.name}</span>
            </div>
            <hr className="rc-divider" />
            <p className="rc-quote">{copy.meaning}</p>
            <p className="rc-caption">Your palette</p>
            <div className="rc-row rc-row--center">
              {previewColors.map((hex, i) => (
                <ColorCircle key={`onboarding-preview-${hex}-${i}`} hex={hex} size={52} />
              ))}
            </div>
          </div>
          <PrimaryButton style={centeredSlideControlStyle} onClick={goNext}>See what it means {"\u2192"}</PrimaryButton>
        </div>

        <div className="rc-slide" style={centeredSlideStyle}>
          <ProgressDots active={1} total={ONBOARDING_SLIDE_COUNT} />
          <div className="rc-slide__body rc-slide__body--rules" style={centeredSlideContentStyle}>
            <h2 className="rc-title">How to use your palette</h2>
            <article className="rc-card">
              <CameraIcon />
              <p className="rc-card-title">Check your clothes with Scan</p>
            </article>
            <article className="rc-card">
              <WardrobeIcon />
              <p className="rc-card-title">Build your wardrobe</p>
            </article>
            <article className="rc-card">
              <PassportIcon />
              <p className="rc-card-title">Download your color passport</p>
            </article>
          </div>
          <PrimaryButton style={centeredSlideControlStyle} onClick={goNext}>Got it {"\u2192"}</PrimaryButton>
        </div>

        <div className="rc-slide" style={centeredSlideStyle}>
          <ProgressDots active={2} total={ONBOARDING_SLIDE_COUNT} />
          <div className="rc-slide__body" style={centeredSlideContentStyle}>
            <h2 className="rc-title">One tip before you start</h2>
            <article className="rc-card">
              <p className="rc-card-label rc-card-label--glow">Most important rule</p>
              <p className="rc-card-title">{copy.tip}</p>
              <div className="rc-row rc-row--center">
                {palette12.slice(0, 5).map((swatch, i) => (
                  <ColorCircle key={`onboarding-tip-${swatch.hex}-${i}`} hex={swatch.hex} size={52} />
                ))}
              </div>
              <p className="rc-card-caption">Start here, then use the full results for outfits, makeup, and shopping.</p>
            </article>
          </div>
          <PrimaryButton style={centeredSlideControlStyle} onClick={onComplete}>See my full results {"\u2192"}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export function ResultCarousel({
  profile,
  season,
  report,
  subSeason,
  confidence,
}: {
  profile: QuizProfile;
  season: Season;
  report: ColorIntelligenceReport;
  subSeason: string;
  confidence?: number;
}) {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>("checking");
  const [onboardingUserId, setOnboardingUserId] = useState<string | null>(null);
  const [exportMode, setExportMode] = useState<ExportMode>(null);
  const exportStackRef = useRef<HTMLDivElement>(null);

  const palette12 = buildSeasonPaletteSwatches(season, subSeason);
  const downloadSeasonName = subSeason || season.name;
  const onboardingCopy = buildResultOnboardingCopy({
    seasonId: season.id,
    seasonName: season.name,
    seasonWhy: season.why,
    subSeason,
  });

  const previewColors = buildPreviewColors(season, 5, subSeason);

  useEffect(() => {
    try {
      const userId = window.localStorage.getItem(LS_USER_ID);
      setOnboardingUserId(userId);
      setOnboardingState(hasSeenResultOnboarding(window.localStorage, userId) ? "seen" : "show");
    } catch {
      setOnboardingState("seen");
    }
  }, [profile.completedAt]);

  const completeResultOnboarding = useCallback(() => {
    try {
      markResultOnboardingSeen(window.localStorage, onboardingUserId);
    } catch {
      // If storage is unavailable, still let the user continue to their results.
    }
    setOnboardingState("seen");
  }, [onboardingUserId]);

  const downloadResultPng = async () => {
    if (exportMode) return;
    setExportMode("png");
    try {
      await waitForExportStackRender();
      if (!exportStackRef.current) return;
      const canvas = await captureResultElement(exportStackRef.current);
      downloadCanvasPng(canvas, buildDownloadFilename(downloadSeasonName, "png"));
    } finally {
      setExportMode(null);
    }
  };

  const downloadResultPdf = async () => {
    if (exportMode) return;
    setExportMode("pdf");
    try {
      await waitForExportStackRender();
      if (!exportStackRef.current) return;
      await downloadSlidesPdf([exportStackRef.current], buildDownloadFilename(downloadSeasonName, "pdf"));
    } finally {
      setExportMode(null);
    }
  };

  const sharePalette = async () => {
    const text = `My color season is ${season.name} (${subSeason}). Found with PaletteMe.`;
    if (navigator.share) {
      await navigator.share({ title: "My PaletteMe palette", text }).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(text).catch(() => undefined);
    }
  };

  if (onboardingState === "checking") return null;

  if (onboardingState === "show") {
    return (
      <ResultOnboarding
        copy={onboardingCopy}
        season={season}
        previewColors={previewColors}
        palette12={palette12}
        onComplete={completeResultOnboarding}
      />
    );
  }

  return (
    <ColorInsightsReport
      ref={exportStackRef}
      profile={profile}
      season={season}
      report={report}
      subSeason={subSeason}
      confidence={confidence}
      onShare={() => void sharePalette()}
      onDownloadPng={() => void downloadResultPng()}
      onDownloadPdf={() => void downloadResultPdf()}
      exporting={exportMode != null}
    />
  );
}
