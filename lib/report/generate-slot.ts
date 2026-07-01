export async function generateSlot(
  photoDataUrl: string,
  slotId: string,
): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_SKIP_IMAGE_GEN === "true") return null;

  try {
    const res = await fetch("/api/report/generate-visual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoDataUrl, slotId }),
    });
    const json = await res.json() as { imageUrl: string | null };
    return json.imageUrl ?? null;
  } catch {
    return null;
  }
}
