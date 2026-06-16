"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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

const SLIDE_COUNT = 5;
const ONBOARDING_SLIDE_COUNT = 3;
const EXPORT_SLIDE_WIDTH = 390;
const EXPORT_SLIDE_HEIGHT = 760;

type Swatch = ResultSwatch;
type ExportMode = "png" | "pdf" | null;
type OnboardingState = "checking" | "show" | "seen";

const carouselViewportStyle: React.CSSProperties = {
  width: "100vw",
  maxWidth: "100vw",
  height: "100dvh",
  minHeight: "620px",
  marginLeft: "calc(50% - 50vw)",
  marginRight: "calc(50% - 50vw)",
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
    return `${lips} · ${eyes} · ${metal}`;
  }
  const lips = report.makeup.lips[0]?.toLowerCase() ?? "rose lips";
  const eyes = report.makeup.eyes[0]?.toLowerCase() ?? "taupe shadow";
  const metal = report.jewelry.metals[0]?.toLowerCase() ?? "silver jewelry";
  return `${lips} · ${eyes} · ${metal}`;
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
      <span className="rc-lab-wordmark">paletteme</span>
      <button
        type="button"
        className={`rc-lab-menu${menuOpen ? " rc-lab-menu--open" : ""}`}
        aria-label="Report actions"
        aria-expanded={menuOpen}
        onClick={onMenuToggle}
      >
        <span aria-hidden>···</span>
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
        <Link href="/home" className="rc-lab-footer__primary">
          <span>home</span>
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
        className="rc-lab-swatch"
        style={buildResultSwatchStyle({
          hex: swatch.hex,
          size: 54,
          border: swatch.border,
          gradient: swatch.gradient,
          shape: "rect",
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
  const [slide, setSlide] = useState(0);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>("checking");
  const [onboardingUserId, setOnboardingUserId] = useState<string | null>(null);
  const [exportMode, setExportMode] = useState<ExportMode>(null);
  const [creditState, setCreditState] = useState<ScanCreditState | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const exportStackRef = useRef<HTMLDivElement>(null);
  const exportSlideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const animatedConfidence = useCountUp(confidence);

  const palette12 = buildSeasonPaletteSwatches(season, subSeason);
  const shoppingSkip = buildSeasonAvoidSwatches(season, undefined, 5, subSeason);
  const metalSwatches = buildSeasonMetalSwatches(season, report, subSeason);
  const downloadSeasonName = subSeason || season.name;
  const onboardingCopy = buildResultOnboardingCopy({
    seasonId: season.id,
    seasonName: season.name,
    seasonWhy: season.why,
    subSeason,
  });

  const previewColors = buildPreviewColors(season, 5, subSeason);
  const identityFacts = [
    formatUndertoneIdentity(profile.undertoneHint),
    formatContrastIdentity(profile),
    secondaryInfluence(season, subSeason),
  ];
  const glowList = palette12.slice(0, 5);
  const avoidList = shoppingSkip.slice(0, 4);
  const energyWords = styleEnergyWords(season);
  const archetype = styleArchetype(season, subSeason);
  const weeklyAllowance = creditState?.allowance ?? DEFAULT_WEEKLY_SCAN_CREDITS;
  const weeklyUsed = Math.min(weeklyAllowance, creditState?.used ?? 0);
  const weeklyProgress = `${Math.round((weeklyUsed / weeklyAllowance) * 100)}%`;

  const goNext = useCallback(() => setSlide((s) => Math.min(s + 1, SLIDE_COUNT - 1)), []);
  const goPrev = useCallback(() => setSlide((s) => Math.max(s - 1, 0)), []);

  useEffect(() => {
    try {
      const userId = window.localStorage.getItem(LS_USER_ID);
      setOnboardingUserId(userId);
      setOnboardingState(hasSeenResultOnboarding(window.localStorage, userId) ? "seen" : "show");
    } catch {
      setOnboardingState("seen");
    }
  }, [profile.completedAt]);

  useEffect(() => {
    setCreditState(getBrowserScanCreditState());
  }, []);

  const completeResultOnboarding = useCallback(() => {
    try {
      markResultOnboardingSeen(window.localStorage, onboardingUserId);
    } catch {
      // If storage is unavailable, still let the user continue to their results.
    }
    setOnboardingState("seen");
  }, [onboardingUserId]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    if (deltaX < -50) goNext();
    else if (deltaX > 50) goPrev();
    touchStartX.current = null;
    touchStartY.current = null;
  };

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
      const slides = exportSlideRefs.current.filter((node): node is HTMLDivElement => Boolean(node));
      await downloadSlidesPdf(slides, buildDownloadFilename(downloadSeasonName, "pdf"));
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
    <>
    <div
      className="rc-carousel rc-carousel--lab"
      style={carouselViewportStyle}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Your color results"
      aria-roledescription="carousel"
    >
      <LabTopbar menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />
      <LabActionMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onShare={() => void sharePalette()}
        onPng={downloadResultPng}
        onPdf={downloadResultPdf}
        exporting={exportMode != null}
      />
      <div className="rc-track" style={carouselTrackStyle(slide)}>
        {/* SLIDE 1 - IDENTITY */}
        <div className="rc-slide" style={labSlideStyle}>
          <div className="rc-slide__body rc-lab-page rc-lab-page--identity" style={centeredSlideContentStyle}>
            <p className="rc-lab-kicker">analysis result</p>
            <h1 className="rc-lab-title">Your Color Identity</h1>
            <p className="rc-lab-subtitle">Your palette is not just a label. It explains why some colors make you look calm, expensive, and alive.</p>

            <article className="rc-lab-identity-card">
              <p className="rc-lab-card-kicker">main season</p>
              <h2>{subSeason || season.name}</h2>
              <p className="rc-lab-identity-quote">{seasonRevealQuote(season, subSeason)}</p>
              <div className="rc-lab-facts">
                {identityFacts.map((fact) => (
                  <span key={fact}>{fact}</span>
                ))}
                {animatedConfidence != null ? (
                  <span className="rc-lab-fact-strong">{animatedConfidence}% profile match</span>
                ) : null}
              </div>
            </article>

            <article className="rc-lab-palette-card">
              <p className="rc-lab-card-kicker">your season palette</p>
              <div className="rc-lab-palette-strip">
                {previewColors.map((hex, i) => (
                  <ColorCircle key={`${hex}-${i}`} hex={hex} size={54} shape="rect" />
                ))}
              </div>
              <p>{season.id === "winter" ? "Cool · crisp · clear · polished" : season.id === "summer" ? "Cool · soft · refined · graceful" : season.id === "spring" ? "Warm · fresh · bright · clear" : "Warm · soft · muted · natural"}</p>
            </article>
          </div>
        </div>

        {/* SLIDE 2 - GLOW COLORS */}
        <div className="rc-slide" style={labSlideStyle}>
          <div className="rc-slide__body rc-lab-page rc-lab-page--tones" style={centeredSlideContentStyle}>
            <p className="rc-lab-kicker">color findings</p>
            <h2 className="rc-lab-title">Colors That Make You Glow</h2>
            <p className="rc-lab-subtitle">
              These tones create harmony with your natural features and make your skin look brighter.
            </p>
            <div className="rc-lab-swatch-list">
              {glowList.map((swatch) => (
                <LabSwatchRow key={`glow-${swatch.name}`} swatch={swatch} reason={glowReason(swatch.name, season)} />
              ))}
            </div>
            <article className="rc-lab-insight-card rc-lab-insight-card--stylist">
              <p className="rc-lab-card-kicker">stylist note</p>
              <p>Wear these closest to your face — tops, scarves, lipstick, and jewelry — and your skin will look brighter without trying harder.</p>
            </article>
          </div>
        </div>

        {/* SLIDE 3 - AVOID COLORS */}
        <div className="rc-slide" style={labSlideStyle}>
          <div className="rc-slide__body rc-lab-page rc-lab-page--tones rc-lab-page--avoid" style={centeredSlideContentStyle}>
            <p className="rc-lab-kicker">contrast warning</p>
            <h2 className="rc-lab-title">Colors That Overpower Your Features</h2>
            <p className="rc-lab-subtitle">
              These shades are not forbidden. Use them away from your face, or balance them with your best colors.
            </p>
            <div className="rc-lab-swatch-list rc-lab-swatch-list--avoid">
              {avoidList.map((swatch) => (
                <LabSwatchRow key={`avoid-${swatch.name}`} swatch={swatch} reason={avoidReason(swatch.name, season)} />
              ))}
            </div>
            <article className="rc-lab-insight-card rc-lab-insight-card--large">
              <p className="rc-lab-card-kicker">why old clothes felt wrong</p>
              <p>{oldClothesHook(season)}</p>
              <p className="rc-lab-secret">The secret: keep these shades in accessories, bottoms, or bags instead of directly beside your face.</p>
            </article>
          </div>
        </div>

        {/* SLIDE 4 - STYLE ENERGY */}
        <div className="rc-slide" style={labSlideStyle}>
          <div className="rc-slide__body rc-lab-page rc-lab-page--energy" style={centeredSlideContentStyle}>
            <p className="rc-lab-kicker">style archetype</p>
            <h2 className="rc-lab-title">Your Style Energy</h2>
            <p className="rc-lab-subtitle">
              This is the vibe your palette naturally supports. Own it, then shop around it.
            </p>

            <article className="rc-lab-archetype-card">
              <p className="rc-lab-card-kicker">identity</p>
              <h3>{archetype}</h3>
              <div className="rc-lab-traits">
                {energyWords.slice(0, 3).map((word) => (
                  <span key={word}>{word}</span>
                ))}
              </div>
            </article>

            <div className="rc-lab-duo">
              <article className="rc-lab-mini-card">
                <p className="rc-lab-card-kicker">jewelry</p>
                <h3>{report.jewelry.metals[0] ?? "gold"} suits you best.</h3>
                <div className="rc-lab-metal-row">
                  {metalSwatches.slice(0, 3).map((swatch) => (
                    <ColorCircle
                      key={swatch.name}
                      hex={swatch.hex}
                      size={34}
                      label={swatch.name}
                      gradient={swatch.gradient}
                    />
                  ))}
                </div>
              </article>

              <article className="rc-lab-mini-card">
                <p className="rc-lab-card-kicker">makeup</p>
                <p className="rc-lab-makeup-line">{makeupOneLiner(season, report)}</p>
                <div className="rc-lab-shade-bars">
                  <span className="rc-lab-shade-bar rc-lab-shade-bar--lips">lips</span>
                  <span className="rc-lab-shade-bar rc-lab-shade-bar--cheek">cheek</span>
                  <span className="rc-lab-shade-bar rc-lab-shade-bar--eyes">eyes</span>
                </div>
              </article>
            </div>

            <article className="rc-lab-insight-card rc-lab-insight-card--remember">
              <p className="rc-lab-card-kicker">remember</p>
              <p>You do not need to follow trends. You just need colors that feel like you.</p>
            </article>
          </div>
        </div>

        {/* SLIDE 5 - WEEKLY CREDITS */}
        <div className="rc-slide" style={labSlideStyle}>
          <div className="rc-slide__body rc-lab-page rc-lab-page--credits" style={centeredSlideContentStyle}>
            <p className="rc-lab-kicker">laboratory status</p>
            <h2 className="rc-lab-title">Your Weekly Style Checks</h2>
            <p className="rc-lab-subtitle">
              Refining your personal style, one thoughtful scan at a time.
            </p>

            <article className="rc-lab-usage-card">
              <div>
                <h3>{weeklyUsed}/{weeklyAllowance} used</h3>
                <p>{weeklyAllowance} free style checks per week</p>
              </div>
              <span>resetting monday</span>
              <div className="rc-lab-progress" aria-hidden>
                <i style={{ width: weeklyProgress }} />
              </div>
            </article>

            <div className="rc-lab-credit-costs">
              <article>
                <span className="rc-lab-cost-icon" aria-hidden>
                  <ScanCostIcon />
                </span>
                <p className="rc-lab-card-kicker">scans</p>
                <h3>1 credit</h3>
                <p>single item analysis</p>
              </article>
              <article>
                <span className="rc-lab-cost-icon" aria-hidden>
                  <OutfitCostIcon />
                </span>
                <p className="rc-lab-card-kicker">outfits</p>
                <h3>2 credits</h3>
                <p>full look composition</p>
              </article>
            </div>

            <article className="rc-lab-insight-card rc-lab-insight-card--credits">
              <p className="rc-lab-card-kicker">why credits?</p>
              <p>Weekly checks stay free so your first result stays generous. The limit keeps testing sustainable — heavier usage can expand later without turning this report into a paywall.</p>
            </article>

            <div className="rc-lab-cta-stack">
              <Link href="/scan" className="rc-lab-cta">
                scan something
              </Link>
              <span className="rc-lab-text-link rc-lab-text-link--muted">more usage options coming later</span>
              <button type="button" className="rc-lab-text-link" onClick={() => void sharePalette()}>
                share my palette
              </button>
              <div className="rc-lab-mini-actions">
                <button type="button" onClick={() => void downloadResultPng()}>png</button>
                <button type="button" onClick={() => void downloadResultPdf()}>pdf</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LabFooter active={slide} onPrev={goPrev} onNext={goNext} />
    </div>

    {exportMode && (
    <div
      ref={exportStackRef}
      className="rc-carousel rc-carousel--export"
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: -10000,
        zIndex: -1000,
        width: EXPORT_SLIDE_WIDTH,
        height: EXPORT_SLIDE_HEIGHT * SLIDE_COUNT,
        overflow: "visible",
        pointerEvents: "none",
        background: "#fff0f5",
      }}
    >
      <div
        ref={(node) => {
          exportSlideRefs.current[0] = node;
        }}
        className="rc-slide"
        style={{ width: EXPORT_SLIDE_WIDTH, height: EXPORT_SLIDE_HEIGHT, minHeight: EXPORT_SLIDE_HEIGHT }}
      >
        <ProgressDots active={0} total={SLIDE_COUNT} />
        <div className="rc-slide__body rc-slide__body--identity">
          <ReportTopline number="01" />
          <p className="rc-eyebrow rc-eyebrow--pill">your personal result</p>
          <h1 className="rc-title rc-title--identity">Your Color Identity</h1>
          <article className="rc-identity-arch">
            <p className="rc-card-label">main season</p>
            <h2>{subSeason || season.name}</h2>
            <p className="rc-identity-quote">{seasonRevealQuote(season, subSeason)}</p>
            <div className="rc-identity-facts">
              {identityFacts.map((fact) => (
                <span key={`export-fact-${fact}`}>{fact}</span>
              ))}
            </div>
            <div className="rc-row rc-row--center rc-row--identity-palette">
              {previewColors.map((hex, i) => (
                <ColorCircle key={`export-preview-${hex}-${i}`} hex={hex} size={44} />
              ))}
            </div>
            {confidence != null ? <p className="rc-identity-match">{confidence}% profile match</p> : null}
          </article>
        </div>
      </div>

      <div
        ref={(node) => {
          exportSlideRefs.current[1] = node;
        }}
        className="rc-slide"
        style={{ width: EXPORT_SLIDE_WIDTH, height: EXPORT_SLIDE_HEIGHT, minHeight: EXPORT_SLIDE_HEIGHT }}
      >
        <ProgressDots active={1} total={SLIDE_COUNT} />
        <div className="rc-slide__body rc-slide__body--tones">
          <ReportTopline number="02" />
          <h2 className="rc-title rc-title--editorial">Colors That Make You Glow</h2>
          <p className="rc-subtitle rc-subtitle--wide">
            These tones create harmony with your natural features and make your skin look brighter.
          </p>
          <div className="rc-tone-list">
            {glowList.map((swatch) => (
              <ToneRow key={`export-glow-${swatch.name}`} swatch={swatch} reason={glowReason(swatch.name, season)} />
            ))}
          </div>
          <article className="rc-insight-card">
            <p className="rc-card-label rc-card-label--glow">tip</p>
            <p>Put these colors closest to your face: tops, scarves, jewelry, hoodies, and lipstick.</p>
          </article>
        </div>
      </div>

      <div
        ref={(node) => {
          exportSlideRefs.current[2] = node;
        }}
        className="rc-slide"
        style={{ width: EXPORT_SLIDE_WIDTH, height: EXPORT_SLIDE_HEIGHT, minHeight: EXPORT_SLIDE_HEIGHT }}
      >
        <ProgressDots active={2} total={SLIDE_COUNT} />
        <div className="rc-slide__body rc-slide__body--tones rc-slide__body--avoid-tones">
          <ReportTopline number="03" />
          <h2 className="rc-title rc-title--editorial">Colors That Overpower Your Features</h2>
          <p className="rc-subtitle rc-subtitle--wide">
            These shades are not forbidden. Use them away from your face, or balance them with your best colors.
          </p>
          <div className="rc-tone-list">
            {avoidList.map((swatch) => (
              <ToneRow key={`export-avoid-${swatch.name}`} swatch={swatch} reason={avoidReason(swatch.name, season)} />
            ))}
          </div>
          <article className="rc-insight-card rc-insight-card--warm">
            <p className="rc-card-label rc-card-label--avoid">why old clothes felt wrong</p>
            <p>{oldClothesHook(season)}</p>
          </article>
        </div>
      </div>

      <div
        ref={(node) => {
          exportSlideRefs.current[3] = node;
        }}
        className="rc-slide"
        style={{ width: EXPORT_SLIDE_WIDTH, height: EXPORT_SLIDE_HEIGHT, minHeight: EXPORT_SLIDE_HEIGHT }}
      >
        <ProgressDots active={3} total={SLIDE_COUNT} />
        <div className="rc-slide__body rc-slide__body--energy">
          <ReportTopline number="04" />
          <h2 className="rc-title rc-title--editorial">Your Style Energy</h2>
          <p className="rc-subtitle rc-subtitle--wide">
            This is the vibe your palette naturally supports. Own it, then shop around it.
          </p>
          <article className="rc-jewelry-card">
            <div>
              <p className="rc-card-label">jewelry</p>
              <h3>{report.jewelry.metals[0] ?? "Your best metal"} suits you best</h3>
            </div>
            <div className="rc-row rc-row--center">
              {metalSwatches.slice(0, 3).map((swatch) => (
                <ColorCircle
                  key={`export-metal-${swatch.name}`}
                  hex={swatch.hex}
                  size={42}
                  label={swatch.name}
                  gradient={swatch.gradient}
                />
              ))}
            </div>
          </article>
          <article className="rc-archetype-card">
            <p className="rc-card-label">your style vibe</p>
            <h3>{archetype}</h3>
            <div className="rc-energy-grid">
              {energyWords.map((word) => (
                <span key={`export-energy-${word}`}>{word}</span>
              ))}
            </div>
          </article>
          <article className="rc-makeup-line-card">
            <p className="rc-card-label">makeup in one line</p>
            <p>{makeupOneLiner(season, report)}</p>
            <div className="rc-row rc-row--center rc-row--makeup">
              <MakeupSwatch type="lips" label="Lips" />
              <MakeupSwatch type="cheek" label="Cheek" />
              <MakeupSwatch type="eyes" label="Eyes" />
              <MakeupSwatch type="metal" label="Metal" />
            </div>
          </article>
        </div>
      </div>

      <div
        ref={(node) => {
          exportSlideRefs.current[4] = node;
        }}
        className="rc-slide"
        style={{ width: EXPORT_SLIDE_WIDTH, height: EXPORT_SLIDE_HEIGHT, minHeight: EXPORT_SLIDE_HEIGHT }}
      >
        <ProgressDots active={4} total={SLIDE_COUNT} />
        <div className="rc-slide__body rc-slide__body--credits">
          <ReportTopline number="05" />
          <h2 className="rc-title rc-title--editorial">Your Weekly Style Checks</h2>
          <p className="rc-subtitle rc-subtitle--wide">
            The report stays free while we test accuracy. Scans use weekly credits so the app stays sustainable.
          </p>
          <article className="rc-credit-card">
            <div className="rc-credit-orb">
              <strong>{DEFAULT_WEEKLY_SCAN_CREDITS}</strong>
              <span>free checks per week</span>
            </div>
            <div className="rc-credit-rates">
              <span>clothing, makeup, product</span>
              <strong>1 credit</strong>
              <span>full outfit</span>
              <strong>2 credits</strong>
            </div>
            <p>When paid plans open, extra credits and Pro will add more scans without hiding your first result.</p>
          </article>
          <div className="rc-duo-cards">
            <article className="rc-card rc-card--small">
              <p className="rc-card-title rc-card-title--left">save your report</p>
              <p className="rc-card-caption">paletteMe-{sanitizeFilenamePart(downloadSeasonName)}</p>
            </article>
            <article className="rc-card rc-card--small rc-card--passport">
              <div className="rc-passport-grid" aria-hidden>
                {palette12.map((s, i) => (
                  <span key={`export-passport-${i}`} className="rc-passport-dot" style={{ background: s.hex }} />
                ))}
              </div>
              <p className="rc-card-caption">your color passport</p>
            </article>
          </div>
        </div>
      </div>
    </div>
    )}
    </>
  );
}
