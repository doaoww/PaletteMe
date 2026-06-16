"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SelfieCapture } from "@/components/selfie/selfie-capture";
import { QuizStepHead } from "@/components/quiz/quiz-picker";
import { isSupabaseAuthConfigured } from "@/lib/auth-flow";
import { validateOutfitImage } from "@/lib/outfit-scan";
import { createClient } from "@/lib/supabase";
import {
  fileToDataUrl,
  postWardrobeItemToApi,
  saveWardrobeItemForCurrentUser,
  type WardrobeItem,
} from "@/lib/wardrobe-store";

type Step = "upload" | "review";

const SUPABASE_AUTH_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export function AddItemFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [category, setCategory] = useState("Top");
  const [color, setColor] = useState("Warm neutral");
  const [paletteMatch, setPaletteMatch] = useState<WardrobeItem["paletteMatch"]>("great");
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const validation = validateOutfitImage(file);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    const dataUrl = await fileToDataUrl(file);
    setImageDataUrl(dataUrl);
    setStep("review");
  };

  const save = async () => {
    if (!imageDataUrl) return;
    await saveWardrobeItemForCurrentUser({
      item: {
        category,
        color,
        paletteMatch,
        imageDataUrl,
      },
      getCurrentUserId: getCurrentWardrobeUserId,
      savePersistedItem: postWardrobeItemToApi,
    });
    router.push("/wardrobe");
  };

  return (
    <div className="app-shell__main">
      {step === "upload" && (
        <>
          <QuizStepHead
            kicker="wardrobe"
            title="Add a favorite piece"
            helper="Lay it flat or hang it. Natural light gives the most accurate color read."
          />
          <SelfieCapture
            onFile={handleFile}
            maxWidth={720}
            title="Take photo or upload"
            cameraFacingMode="environment"
            captureLabel="capture item"
            capturedFilePrefix="paletteme-wardrobe"
            detail="JPG, PNG, or WebP · max 10 MB"
          />
          {error ? <p className="quiz-page__inline-error">{error}</p> : null}
          <Link href="/wardrobe" className="quiz__redo">
            ← back to wardrobe
          </Link>
        </>
      )}

      {step === "review" && imageDataUrl && (
        <>
          <QuizStepHead
            kicker="review"
            title="Does this look right?"
            helper="Tap any field to correct it — your edit always wins."
          />
          <div className="wardrobe-review">
            <div className="wardrobe-review__photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageDataUrl} alt="Wardrobe item preview" />
            </div>
            <label className="wardrobe-review__field">
              <span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {["Top", "Bottom", "Dress", "Outerwear", "Shoes", "Accessory"].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
            <label className="wardrobe-review__field">
              <span>Color</span>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. warm terracotta"
              />
            </label>
            <label className="wardrobe-review__field">
              <span>Palette match</span>
              <select
                value={paletteMatch}
                onChange={(e) => setPaletteMatch(e.target.value as WardrobeItem["paletteMatch"])}
              >
                <option value="great">✓ Great match</option>
                <option value="careful">⚠ Use carefully</option>
              </select>
            </label>
          </div>
          <button type="button" className="btn" style={{ width: "100%", marginTop: 20 }} onClick={save}>
            add to wardrobe
          </button>
          <button type="button" className="quiz__redo" onClick={() => setStep("upload")}>
            ← retake photo
          </button>
        </>
      )}
    </div>
  );
}

async function getCurrentWardrobeUserId(): Promise<string | null> {
  if (!isSupabaseAuthConfigured(SUPABASE_AUTH_ENV)) return null;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.id ?? null;
  } catch {
    return null;
  }
}
