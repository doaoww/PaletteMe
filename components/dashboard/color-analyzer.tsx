"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalysisResult } from "@/lib/analysis";
import { formatProfileForAI, loadQuizProfile, type QuizProfile } from "@/lib/quiz";
import { SEASON_PRODUCTS, type SeasonProduct } from "@/lib/landing-data";
import type { ScrapedProduct } from "@/app/api/products/route";
import { resizeImageForAnalysis } from "@/lib/resize-image";

type DisplayProduct = {
  name: string;
  brand?: string;
  price?: string;
  url: string;
  image: string;
  hex?: string;
  match?: number;
};

function toDisplay(p: ScrapedProduct & { match?: number; hex?: string }): DisplayProduct {
  return {
    name: p.name,
    brand: p.brand,
    price: p.price,
    url: p.url,
    image: p.imageUrl ?? "",
    hex: p.hex,
    match: p.match,
  };
}
function demoToDisplay(p: SeasonProduct): DisplayProduct {
  return { name: p.name, brand: p.brand, price: p.price, url: `https://www.asos.com/search/?q=${encodeURIComponent(p.name)}`, image: p.image, hex: p.hex, match: p.match };
}

type Phase = "idle" | "preview" | "analyzing" | "done" | "error";

function MarketplacePicks({
  seasonId,
  seasonName,
  subSeason,
  quizProfile,
}: {
  seasonId: string;
  seasonName: string;
  subSeason: string;
  quizProfile: QuizProfile | null;
}) {
  const fallback = (SEASON_PRODUCTS[seasonId] ?? SEASON_PRODUCTS.summer).map(demoToDisplay);
  const [products, setProducts] = useState<DisplayProduct[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>("demo");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ season: seasonId, subSeason });
    if (quizProfile?.answers.styleVibe) {
      params.set("style", quizProfile.answers.styleVibe);
    }
    if (quizProfile?.answers.goal) {
      params.set("goal", quizProfile.answers.goal);
    }

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products.map(toDisplay));
          setSource(data.source ?? "live");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [seasonId, subSeason, quizProfile]);

  return (
    <div style={{ marginTop: "clamp(48px,8vh,80px)", borderTop: "1px solid var(--hair)", paddingTop: "clamp(36px,6vh,64px)" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
        <div>
          <p className="kicker" style={{ fontSize: "0.58rem", marginBottom: "10px" }}>matched picks</p>
          <p className="font-serif" style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", lineHeight: 1.1 }}>
            Curated for <span className="scr" style={{ color: "var(--pink)" }}>{seasonName}</span>
          </p>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: "6px" }}>
            {loading
              ? "Finding picks for your palette…"
              : quizProfile?.answers.styleVibe
                ? `Styled for ${subSeason} · ${quizProfile.answers.styleVibe} vibe`
                : `Colors matched to your ${subSeason} palette`}
          </p>
        </div>
        {!loading && source === "scraped" && (
          <span className="kicker" style={{ fontSize: "0.52rem", color: "var(--pink)" }}>live picks</span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: "#f3ede5", borderRadius: "12px", aspectRatio: "3/4", animation: "pulse 1.4s ease-in-out infinite" }} />
            ))
          : products.map((p, i) => (
              <a
                key={i}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", background: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--hair)", boxShadow: "0 4px 18px rgba(23,18,26,0.06)", textDecoration: "none", transition: "box-shadow 0.2s, transform 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(23,18,26,0.14)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(23,18,26,0.06)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
              >
                <div style={{ position: "relative", aspectRatio: "4/5", background: "#f3ede5" }}>
                  {p.image ? (
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: "cover" }} unoptimized sizes="240px" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: "var(--ink-soft)", opacity: 0.5 }}>no image</span>
                    </div>
                  )}
                  {p.match && (
                    <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,0.94)", borderRadius: "100px", padding: "4px 10px", fontFamily: "var(--sans)", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.06em", color: "var(--ink)", display: "flex", alignItems: "center", gap: "6px" }}>
                      {p.hex && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.hex, display: "inline-block", border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }} />}
                      {p.match}% match
                    </div>
                  )}
                </div>
                <div style={{ padding: "14px 16px 16px" }}>
                  <p style={{ fontFamily: "var(--sans)", fontSize: "0.9rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>{p.name}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                    {p.brand && <span style={{ fontFamily: "var(--sans)", fontSize: "0.78rem", color: "var(--ink-soft)" }}>{p.brand}</span>}
                    {p.price && <span style={{ fontFamily: "var(--sans)", fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)" }}>{p.price}</span>}
                  </div>
                  <div style={{ marginTop: "12px", width: "100%", fontFamily: "var(--sans)", fontSize: "0.8rem", fontWeight: 600, background: "var(--ink)", color: "var(--cream)", borderRadius: "100px", padding: "9px 0", textAlign: "center", letterSpacing: 0, textTransform: "lowercase" }}>
                    shop now →
                  </div>
                </div>
              </a>
            ))}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style>
    </div>
  );
}

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

export function ColorAnalyzer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [quizResult, setQuizResult] = useState<QuizProfile | null>(null);
  const [quizReady, setQuizReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setQuizResult(loadQuizProfile());
    setQuizReady(true);
  }, []);

  const resetPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setResult(null);
    setError(null);
    setPhase("idle");
    if (inputRef.current) inputRef.current.value = "";
  }, [previewUrl]);

  const handleFile = useCallback(
    async (next: File) => {
      if (!ACCEPT.split(",").includes(next.type)) {
        setError("Only JPG, PNG, or WebP images are supported.");
        setPhase("error");
        return;
      }
      if (next.size > MAX_BYTES) {
        setError("Image must be 10 MB or smaller.");
        setPhase("error");
        return;
      }
      const prepared = await resizeImageForAnalysis(next);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(prepared);
      setPreviewUrl(URL.createObjectURL(prepared));
      setResult(null);
      setError(null);
      setPhase("preview");
    },
    [previewUrl]
  );

  const analyze = async () => {
    if (!file) return;
    setPhase("analyzing");
    setError(null);
    const formData = new FormData();
    formData.append("image", file);
    if (quizResult) {
      formData.append(
        "quizHint",
        JSON.stringify({
          seasonId: quizResult.seasonId,
          seasonName: quizResult.seasonName,
          scores: quizResult.scores,
          undertoneHint: quizResult.undertoneHint,
          profileSummary: formatProfileForAI(quizResult),
        })
      );
    }
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed. Please try again.");
      setResult(data.result as AnalysisResult);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  /* ── RESULT — 2-column layout ── */
  if (phase === "done" && result) {
    const { season, subSeason, traits, confidence, summary, tips } = result;

    return (
      <div className="wrap" style={{ paddingTop: "clamp(32px,5vh,64px)", paddingBottom: "clamp(48px,8vh,96px)" }}>
        <style>{`
          @media (min-width: 720px) {
            .result-grid { grid-template-columns: 5fr 7fr !important; }
            .result-photo { display: flex; justify-content: center; }
          }
        `}</style>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "clamp(28px,5vw,64px)",
            alignItems: "start",
          }}
          className="result-grid"
        >
          {/* LEFT — Photo */}
          <div className="result-photo">
            <div
              className="polaroid overflow-hidden p-0"
              style={{ transform: "rotate(-1.6deg)", maxWidth: "420px", margin: "0 auto", width: "100%" }}
            >
              <div className="relative w-full" style={{ aspectRatio: "4/5", background: season.photoBg }}>
                {previewUrl && (
                  <Image
                    src={previewUrl}
                    alt="Your selfie"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: "0 0 0 0",
                    bottom: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <p className="kicker" style={{ fontSize: "0.52rem", color: "rgba(255,255,255,0.75)", marginBottom: "6px" }}>
                    your season
                  </p>
                  <p className="scr" style={{ fontSize: "clamp(2.8rem,6vw,4rem)", color: "#fff", lineHeight: 0.88, textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
                    {season.name}
                  </p>
                  <p style={{ fontFamily: "var(--sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginTop: "6px", fontWeight: 600, letterSpacing: "0.04em" }}>
                    {subSeason}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Analysis */}
          <div className="result-info" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div>
              <div className="eyebrow">
                <span className="kicker" style={{ fontSize: "0.58rem" }}>analysis complete</span>
              </div>
              <h1
                className="font-serif"
                style={{ fontSize: "clamp(2.6rem,5.5vw,4.2rem)", lineHeight: 1, marginTop: "14px", color: "var(--ink)" }}
              >
                <span className="scr" style={{ color: "var(--pink)" }}>{season.name}</span>
              </h1>
              <p style={{ fontFamily: "var(--sans)", fontSize: "1.05rem", fontWeight: 600, color: "var(--ink-soft)", marginTop: "8px" }}>
                {subSeason}
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-soft)", marginTop: "6px", opacity: 0.7 }}>
                {traits.undertone} undertone · {traits.contrast} contrast · {traits.depth} depth
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.7rem", color: "var(--ink-soft)", marginTop: "4px", opacity: 0.55 }}>
                {confidence}% confidence
              </p>
            </div>

            {/* Palette swatches */}
            <div>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: "12px" }}>
                your palette
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {season.palette.map((color) => (
                  <span
                    key={color}
                    title={color}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: color,
                      border: "1px solid var(--hair)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      display: "block",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Summary */}
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.96rem", lineHeight: 1.65, color: "var(--ink-soft)" }}>
              {summary}
            </p>

            {/* Tips */}
            {tips.length > 0 && (
              <div>
                <p style={{ fontFamily: "var(--sans)", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: "12px" }}>
                  style tips
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {tips.map((tip) => (
                    <li key={tip} style={{ display: "flex", gap: "10px", fontFamily: "var(--sans)", fontSize: "0.9rem", color: "var(--ink-soft)", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--pink)", flexShrink: 0 }}>·</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Analyze another */}
            <div>
              <button type="button" className="btn" onClick={resetPreview}>
                analyze another photo
              </button>
            </div>

            {/* Waitlist CTA */}
            <div
              style={{
                borderRadius: "16px",
                border: "1px solid var(--hair)",
                background: "color-mix(in srgb, var(--blush) 35%, transparent)",
                padding: "clamp(20px,3vw,28px)",
              }}
            >
              <p className="kicker" style={{ fontSize: "0.56rem" }}>save your palette</p>
              <p className="font-serif" style={{ fontSize: "clamp(1.3rem,2.5vw,1.6rem)", lineHeight: 1.22, marginTop: "10px" }}>
                Like your results?<br />Save them for good.
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.88rem", color: "var(--ink-soft)", marginTop: "10px", lineHeight: 1.55 }}>
                Join the waitlist to save your palette, get real product picks matched to your colors, and unlock the outfit scanner.
              </p>
              <a href="/#waitlist" className="btn" style={{ display: "inline-block", marginTop: "16px" }}>
                join early access
              </a>
            </div>
          </div>
        </div>

        {/* ── MARKETPLACE — picks for this season ── */}
        <MarketplacePicks
          seasonId={season.id}
          seasonName={season.name}
          subSeason={subSeason}
          quizProfile={quizResult}
        />
      </div>
    );
  }

  if (!quizReady) {
    return (
      <div className="wrap" style={{ paddingTop: "clamp(80px,12vh,140px)", paddingBottom: "80px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--sans)", color: "var(--ink-soft)" }}>Loading…</p>
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className="wrap" style={{ paddingTop: "clamp(48px,8vh,96px)", paddingBottom: "clamp(48px,8vh,96px)", maxWidth: "560px", marginInline: "auto", textAlign: "center" }}>
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          <span className="kicker" style={{ fontSize: "0.6rem" }}>step 1</span>
        </div>
        <h1 className="font-serif" style={{ fontSize: "clamp(2.2rem,5vw,3.4rem)", lineHeight: 1.05, marginTop: "14px" }}>
          Take the <span className="scr">quiz</span> first
        </h1>
        <p style={{ fontFamily: "var(--sans)", color: "var(--ink-soft)", marginTop: "16px", lineHeight: 1.65 }}>
          We ask a few questions about your coloring before analyzing your selfie —
          so we never guess your season from a photo alone.
        </p>
        <Link href="/quiz" className="btn" style={{ display: "inline-block", marginTop: "28px" }}>
          start the quiz
        </Link>
      </div>
    );
  }

  /* ── UPLOAD / PREVIEW / ANALYZING / ERROR — 2-column layout ── */
  return (
    <div className="wrap" style={{ paddingTop: "clamp(40px,7vh,80px)", paddingBottom: "clamp(48px,8vh,96px)" }}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) handleFile(picked);
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "clamp(32px,5vw,72px)",
          alignItems: "center",
        }}
        className="upload-grid"
      >
        {/* LEFT — heading and description */}
        <div>
          <div className="eyebrow">
            <span className="kicker" style={{ fontSize: "0.6rem" }}>step 2 · confirm</span>
          </div>
          <h1
            className="font-serif"
            style={{ fontSize: "clamp(2.6rem,5.5vw,4.4rem)", lineHeight: 1.02, marginTop: "16px" }}
          >
            Upload your <span className="scr">selfie</span>
          </h1>
          <p style={{ fontFamily: "var(--sans)", fontSize: "1rem", lineHeight: 1.65, color: "var(--ink-soft)", marginTop: "16px", maxWidth: "38ch" }}>
            Your quiz pointed to <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{quizResult.seasonName}</strong> ({quizResult.undertoneHint} undertone). Now confirm with a clear selfie in natural light.
          </p>
          <Link
            href="/quiz"
            style={{ fontFamily: "var(--sans)", fontSize: "0.82rem", color: "var(--pink)", marginTop: "10px", display: "inline-block" }}
          >
            retake quiz
          </Link>
          <ul style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              "Seasonal color type — one of 12",
              "Your personal 8-color palette",
              "Personalized styling tips",
              "Ready in about 30 seconds",
            ].map((item) => (
              <li
                key={item}
                style={{ display: "flex", gap: "10px", fontFamily: "var(--sans)", fontSize: "0.9rem", color: "var(--ink-soft)", lineHeight: 1.4 }}
              >
                <span style={{ color: "var(--pink)", flexShrink: 0 }}>·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT — upload card + controls */}
        <div>
          <div
            role="button"
            tabIndex={0}
            className={`polaroid cursor-pointer p-0 transition-shadow${dragOver ? " ring-2 ring-[var(--pink)] ring-offset-2" : ""}`}
            style={{ maxWidth: "400px", margin: "0 auto" }}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            {previewUrl ? (
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/5" }}>
                <Image
                  src={previewUrl}
                  alt="Selfie preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                {phase === "analyzing" && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      background: "rgba(23,18,26,0.52)",
                      color: "#fff",
                    }}
                  >
                    <span
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.25)",
                        borderTopColor: "#fff",
                        animation: "spin 0.8s linear infinite",
                        display: "block",
                      }}
                    />
                    <p style={{ fontFamily: "var(--sans)", fontSize: "0.88rem" }}>Analyzing your coloring…</p>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  aspectRatio: "4/5",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                  background: "var(--cream-2)",
                  padding: "32px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    border: "2px dashed rgba(23,18,26,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--ink-soft)" }}>
                    <path d="M12 16V4m0 0L8 8m4-4 4 4" />
                    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <p style={{ fontFamily: "var(--sans)", fontSize: "0.9rem", color: "var(--ink-soft)" }}>
                  Drop your selfie here, or <span style={{ color: "var(--pink)", fontWeight: 600 }}>click to browse</span>
                </p>
                <p style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: "var(--ink-soft)", opacity: 0.65 }}>
                  JPG, PNG · max 10 MB · natural light, no filters
                </p>
                <p style={{ fontFamily: "var(--sans)", fontSize: "0.72rem", color: "var(--ink-soft)", opacity: 0.45 }}>
                  Analyzed and deleted immediately — never stored or shared.
                </p>
              </div>
            )}
          </div>

          {phase === "preview" && (
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <button
                type="button"
                className="btn"
                style={{ width: "100%", maxWidth: "400px" }}
                onClick={analyze}
              >
                analyze my colors
              </button>
              <button
                type="button"
                style={{ fontFamily: "var(--sans)", fontSize: "0.88rem", color: "var(--ink-soft)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}
                onClick={resetPreview}
              >
                choose a different photo
              </button>
            </div>
          )}

          {phase === "analyzing" && (
            <p style={{ marginTop: "16px", textAlign: "center", fontFamily: "var(--sans)", fontSize: "0.88rem", color: "var(--ink-soft)" }}>
              Reading undertone, contrast, and depth…
            </p>
          )}

          {error && (
            <div
              style={{
                marginTop: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,46,126,0.2)",
                background: "color-mix(in srgb, var(--blush) 40%, transparent)",
                padding: "20px 20px 16px",
                textAlign: "center",
              }}
            >
              <p style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "var(--ink)" }}>
                Let&apos;s try that again
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: "6px", lineHeight: 1.5 }}>
                {error}
              </p>
              <button
                type="button"
                className="btn"
                style={{ marginTop: "14px" }}
                onClick={() => { setError(null); setPhase(file ? "preview" : "idle"); }}
              >
                try again
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 720px) {
          .upload-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
