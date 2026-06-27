export async function generateSlot(
  photoDataUrl: string,
  prompt: string,
  slotId: string,
): Promise<string | null> {
  try {
    const res = await fetch("/api/report/generate-visual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoDataUrl, prompt, slotId }),
    });
    const json = await res.json() as { imageUrl: string | null };
    return json.imageUrl ?? null;
  } catch {
    return null;
  }
}
