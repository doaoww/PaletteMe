"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { MakeupComparison } from "@/lib/report/report-schema";

// ── Landmark indices (MediaPipe Face Mesh 468+10 iris) ──────────────────────

// Lip outer contour
const LIPS = [61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146];

// Upper eyelid landmarks — outer corner → inner corner (follows lid edge)
const L_LID = [33, 246, 161, 160, 159, 158, 157, 173, 133];
const R_LID = [263, 466, 388, 387, 386, 385, 384, 398, 362];

// Single brow reference per eye — used as height ceiling for eyeshadow
const L_BROW = 105;
const R_BROW = 334;

// Cheekbone center for blush
const L_CHEEK = 117;
const R_CHEEK = 346;

// ── Types ───────────────────────────────────────────────────────────────────

type LM       = { x: number; y: number; z: number };
type Category = "lips" | "blush" | "eyeshadow";

type Props = {
  photoDataUrl:      string;
  makeupComparisons: MakeupComparison[];
  onError?:          () => void;
};

// ── Component ────────────────────────────────────────────────────────────────

export function MakeupTryout({ photoDataUrl, makeupComparisons, onError }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);

  const [lms, setLms]           = useState<LM[] | null>(null);
  const [rendered, setRendered] = useState<string | null>(null);
  const [tab, setTab]           = useState<Category>("lips");
  const [active, setActive]     = useState<Partial<Record<Category, string>>>({});

  // ── Init: load MediaPipe WASM + detect landmarks once ────────────────────
  useEffect(() => {
    let alive = true;
    async function init() {
      try {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
        );
        const fl = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          runningMode: "IMAGE",
          numFaces: 1,
        });

        const img = new Image();
        img.src = photoDataUrl;
        await new Promise<void>((res, rej) => {
          img.onload  = () => res();
          img.onerror = () => rej(new Error("img load failed"));
        });
        if (!alive) return;
        imgRef.current = img;

        const result = fl.detect(img);
        fl.close();
        if (!alive) return;

        if (result.faceLandmarks.length > 0) {
          setLms(result.faceLandmarks[0]);
        } else {
          onError?.();
        }
      } catch {
        if (alive) onError?.();
      }
    }
    void init();
    return () => { alive = false; };
  }, [photoDataUrl, onError]);

  // ── Draw: photo + makeup overlays → JPEG data URL ────────────────────────
  const draw = useCallback(() => {
    const img = imgRef.current;
    if (!img || !lms) return;

    const cv = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = cv;

    const MAX = 700;
    const sc  = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1);
    cv.width  = Math.round(img.naturalWidth  * sc);
    cv.height = Math.round(img.naturalHeight * sc);
    const W = cv.width;
    const H = cv.height; void H;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, cv.height);
    ctx.drawImage(img, 0, 0, W, cv.height);

    // Normalised landmark → canvas pixel
    const p = (i: number): [number, number] => [lms[i].x * W, lms[i].y * cv.height];

    // ── Lips ──────────────────────────────────────────────────────────────
    // Two-pass: "color" mode for universal skin-tone coverage,
    // then light "multiply" pass for depth/richness.
    if (active.lips) {
      const lip = new Path2D();
      LIPS.forEach((idx, i) => {
        const [x, y] = p(idx);
        if (i === 0) lip.moveTo(x, y); else lip.lineTo(x, y);
      });
      lip.closePath();

      // Pass 1 — colour (hue+saturation, preserves luminosity = skin texture)
      ctx.save();
      ctx.filter = "blur(1.5px)";
      ctx.globalCompositeOperation = "color";
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = active.lips;
      ctx.fill(lip);
      ctx.restore();

      // Pass 2 — depth (darkens slightly for a real-lipstick look)
      ctx.save();
      ctx.filter = "blur(1px)";
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = active.lips;
      ctx.fill(lip);
      ctx.restore();
    }

    // ── Blush ─────────────────────────────────────────────────────────────
    // Radial gradient on cheekbones with heavy pre-blur for ultra-soft edges.
    if (active.blush) {
      const r = W * 0.115;
      for (const idx of [L_CHEEK, R_CHEEK]) {
        const [cx, cy] = p(idx);
        ctx.save();
        ctx.filter = "blur(7px)";
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0,    active.blush + "bb");
        g.addColorStop(0.45, active.blush + "66");
        g.addColorStop(1,    active.blush + "00");
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // ── Eyeshadow ─────────────────────────────────────────────────────────
    // Build a crescent path: bottom = lid edge (real landmarks),
    // top = same X points shifted 55% of the way toward the brow.
    // Pre-blur softens the polygon into a natural shadow.
    if (active.eyeshadow) {
      const pairs: [number[], number][] = [
        [L_LID, L_BROW],
        [R_LID, R_BROW],
      ];
      for (const [lidPts, browRef] of pairs) {
        const browY = p(browRef)[1]; // brow Y in canvas coords (smaller = higher)

        const shadow = new Path2D();
        // Bottom edge: lid landmark positions
        lidPts.forEach((idx, i) => {
          const [x, y] = p(idx);
          if (i === 0) shadow.moveTo(x, y); else shadow.lineTo(x, y);
        });
        // Top edge: same X, interpolated Y toward brow (55%)
        [...lidPts].reverse().forEach((idx) => {
          const [x, y] = p(idx);
          shadow.lineTo(x, y + (browY - y) * 0.55);
        });
        shadow.closePath();

        ctx.save();
        ctx.filter = "blur(4px)";
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.62;
        ctx.fillStyle = active.eyeshadow;
        ctx.fill(shadow);
        ctx.restore();
      }
    }

    setRendered(cv.toDataURL("image/jpeg", 0.88));
  }, [lms, active]);

  useEffect(() => { draw(); }, [draw]);

  // ── UI ───────────────────────────────────────────────────────────────────

  const LABELS: Record<Category, string> = { lips: "Lips", blush: "Blush", eyeshadow: "Eyes" };

  const cats = (["lips", "blush", "eyeshadow"] as Category[])
    .map(id => ({ id, item: makeupComparisons.find(m => m.category === id) }))
    .filter((c): c is { id: Category; item: MakeupComparison } => !!c.item);

  const current   = cats.find(c => c.id === tab);
  const hasActive = Object.values(active).some(Boolean);

  function toggle(cat: Category, hex: string) {
    setActive(prev => ({ ...prev, [cat]: prev[cat] === hex ? undefined : hex }));
  }

  return (
    <div className="makeup-tryout">
      <div className="makeup-tryout__frame">
        {!rendered
          ? <div className="makeup-tryout__skeleton" />
          : <img src={rendered} alt="makeup preview" className="makeup-tryout__preview" />
        }
      </div>

      {rendered && (
        <>
          <div className="makeup-tryout__tabs">
            {cats.map(c => (
              <button
                key={c.id}
                className={`makeup-tryout__tab${tab === c.id ? " makeup-tryout__tab--active" : ""}`}
                onClick={() => setTab(c.id)}
              >
                {LABELS[c.id]}
              </button>
            ))}
            {hasActive && (
              <button className="makeup-tryout__reset" onClick={() => setActive({})}>
                reset
              </button>
            )}
          </div>

          {current && (
            <div className="makeup-tryout__panel">
              <div className="makeup-tryout__shade-row">
                <button
                  className={`makeup-tryout__swatch${active[tab] === current.item.goodShade.hex ? " makeup-tryout__swatch--active" : ""}`}
                  style={{ background: current.item.goodShade.hex }}
                  onClick={() => toggle(tab, current.item.goodShade.hex)}
                  aria-label={current.item.goodShade.name}
                />
                <span className="makeup-tryout__shade-name">{current.item.goodShade.name}</span>
                <span className="makeup-tryout__badge makeup-tryout__badge--good">your shade</span>
              </div>

              <div className="makeup-tryout__shade-row makeup-tryout__shade-row--bad">
                <span
                  className="makeup-tryout__swatch makeup-tryout__swatch--bad"
                  style={{ background: current.item.badShade.hex }}
                />
                <span className="makeup-tryout__shade-name">{current.item.badShade.name}</span>
                <span className="makeup-tryout__badge makeup-tryout__badge--bad">avoid</span>
              </div>

              <p className="makeup-tryout__why">{current.item.explanation}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
