export const runtime = "nodejs";
export const maxDuration = 120;

import Replicate from "replicate";
import { z } from "zod";
import { createClient } from "@/lib/db/supabase-server";

const RequestSchema = z.object({
  photoDataUrl: z.string(),
  prompt: z.string(),
  slotId: z.string(),
  promptStrength: z.number().min(0).max(1).default(0.75),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { photoDataUrl, prompt, slotId, promptStrength } = parsed.data;

  const match = photoDataUrl.match(/^data:[^;]+;base64,(.+)$/);
  if (!match) {
    return Response.json({ imageUrl: null });
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  try {
    // Convert base64 → Buffer → Blob so Replicate can accept it
    const buffer = Buffer.from(match[1]!, "base64");
    const blob = new Blob([buffer], { type: "image/jpeg" });

    const output = await replicate.run("black-forest-labs/flux-2-pro", {
      input: {
        prompt,
        image: blob,
        prompt_strength: promptStrength,
        output_format: "png",
        output_quality: 90,
        safety_tolerance: 3,
      },
    }) as { url: () => URL } | string;

    // flux-2-pro can return a FileOutput (with .url()) or a raw URL string
    const resultUrl = typeof output === "string"
      ? output
      : (output as { url: () => URL }).url().toString();

    if (!resultUrl) return Response.json({ imageUrl: null });

    // Fetch the image bytes so we can cache in Supabase
    const imgRes = await fetch(resultUrl);
    if (!imgRes.ok) return Response.json({ imageUrl: resultUrl });

    const arrayBuf = await imgRes.arrayBuffer();
    const imgBuf = Buffer.from(arrayBuf);

    if (userId) {
      const path = `${userId}/${slotId}.png`;
      const { error } = await supabase.storage
        .from("report-visuals")
        .upload(path, imgBuf, { contentType: "image/png", upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("report-visuals").getPublicUrl(path);
        return Response.json({ imageUrl: data.publicUrl });
      }
    }

    // Fall back to Replicate URL (temporary, ~1h TTL)
    return Response.json({ imageUrl: resultUrl });
  } catch (err) {
    console.error("[generate-visual] Replicate error:", err);
    return Response.json({ imageUrl: null });
  }
}
