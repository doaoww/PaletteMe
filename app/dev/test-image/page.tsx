"use client";

import { useState, useEffect } from "react";

// Exact prompt used in Replicate UI — do not change.
const DRAPING_PROMPT =
  "Color analysis studio photograph of the same person. Face, skin and eye area identical to the reference photo — no makeup, no retouching, no filters applied. Hair color, texture and hairstyle identical to the reference photo — unchanged. A smooth, flat, wrinkle-free, matte white draping cloth covers the shoulders and chest completely from just below the chin to the bottom of the frame. The white fabric is perfectly flat with no folds, no creases and no shadows. No clothing visible. Plain warm grey studio background. Soft even diffused studio lighting.";

const PROMPTS: Record<string, string> = {
  "neutral-draping": DRAPING_PROMPT,
  "makeup-lips-good":
    "Portrait of the same person. Hair color, hairstyle, clothing and background identical to the reference photo — unchanged. Face and skin identical to reference — no retouching, no filters. Apply Warm Rosewood (#8A4B32) lipstick to the lips only. Eyes, brows, cheeks and all other facial features unchanged.",
  "makeup-blush-good":
    "Portrait of the same person. Hair color, hairstyle, clothing and background identical to the reference photo — unchanged. Face and skin identical to reference — no retouching, no filters. Apply soft Dusty Rose (#C47B8A) blush to the cheeks only. Lips, eyes, brows and all other facial features unchanged.",
  "hair-color-0":
    "Portrait of the same person. Face, skin and eye area identical to the reference photo — no makeup, no retouching, no filters. Hair recolored to warm chestnut brown (#7B4E2D) — same hairstyle, same cut, same length, only the color changes. Clothing and background identical to the reference photo.",
  "metal-gold":
    "Portrait of the same person. Face, skin and eye area identical to the reference photo — no makeup, no retouching, no filters. Hair color, texture and hairstyle unchanged. Small delicate yellow gold hoop earrings and a thin gold chain necklace added. Clothing and background identical to the reference photo.",
};

export default function TestImagePage() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slotId, setSlotId] = useState("neutral-draping");
  const [resolution, setResolution] = useState<"1 MP" | "2 MP">("1 MP");
  const [prompt, setPrompt] = useState(PROMPTS["neutral-draping"]);

  useEffect(() => {
    const stored = localStorage.getItem("paletteme-face-photo");
    if (stored) setPhoto(stored);
  }, []);

  function handleSlotChange(newSlot: string) {
    setSlotId(newSlot);
    setPrompt(PROMPTS[newSlot] ?? "");
    setResult(null);
    setError(null);
  }

  async function runTest() {
    if (!photo) { setError("No photo in localStorage."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/report/generate-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoDataUrl: photo,
          prompt,
          slotId,
          resolutionOverride: resolution,
        }),
      });
      const json = await res.json() as { imageUrl: string | null; error?: string };
      if (json.imageUrl) setResult(json.imageUrl);
      else setError(`No image returned: ${JSON.stringify(json)}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      localStorage.setItem("paletteme-face-photo", dataUrl);
      setPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace", maxWidth: 1000 }}>
      <h1 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>dev / test-image</h1>
      <p style={{ color: "#888", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
        model: <strong>flux-2-pro</strong> · input_images + prompt · те же параметры что в Replicate UI
      </p>

      {!photo && (
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#fff3cd", borderRadius: 8 }}>
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem" }}>Нет фото в localStorage — загрузи:</p>
          <input type="file" accept="image/*" onChange={handleFileUpload} />
        </div>
      )}

      <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
        {photo && (
          <div>
            <p style={{ margin: "0 0 0.4rem", fontSize: "0.75rem", color: "#888" }}>Оригинал</p>
            <img src={photo} alt="original" style={{ width: 200, borderRadius: 8, display: "block" }} />
          </div>
        )}
        {result && (
          <div>
            <p style={{ margin: "0 0 0.4rem", fontSize: "0.75rem", color: "#888" }}>Результат</p>
            <img src={result} alt="result" style={{ width: 200, borderRadius: 8, display: "block" }} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
        <label style={{ fontSize: "0.85rem" }}>
          Слот:&nbsp;
          <select value={slotId} onChange={e => handleSlotChange(e.target.value)}>
            <option value="neutral-draping">neutral-draping</option>
            <option value="makeup-lips-good">makeup-lips-good</option>
            <option value="makeup-blush-good">makeup-blush-good</option>
            <option value="hair-color-0">hair-color-0</option>
            <option value="metal-gold">metal-gold</option>
          </select>
        </label>

        <label style={{ fontSize: "0.85rem" }}>
          Resolution:&nbsp;
          <select value={resolution} onChange={e => setResolution(e.target.value as "1 MP" | "2 MP")}>
            <option value="1 MP">1 MP (быстрее, дешевле)</option>
            <option value="2 MP">2 MP (выше качество)</option>
          </select>
        </label>

        <label style={{ fontSize: "0.85rem" }}>
          Промпт:
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            style={{ display: "block", width: "100%", marginTop: 4, fontFamily: "monospace", fontSize: "0.8rem", padding: "0.5rem", borderRadius: 6, border: "1px solid #ccc", resize: "vertical" }}
          />
        </label>
      </div>

      <button
        onClick={runTest}
        disabled={loading || !photo}
        style={{
          padding: "0.6rem 1.5rem",
          background: loading ? "#ccc" : "#2a1f1a",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "0.9rem",
        }}
      >
        {loading ? "Генерирую (~20–30 сек)…" : "Run (1 вызов Replicate)"}
      </button>

      {error && (
        <pre style={{ marginTop: "1rem", padding: "1rem", background: "#fee", borderRadius: 8, fontSize: "0.78rem", overflowX: "auto" }}>
          {error}
        </pre>
      )}
    </div>
  );
}
