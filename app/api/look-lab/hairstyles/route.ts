import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { buildFlux2ProInput } from "@/lib/report/replicate-input";
import { createClient } from "@/lib/db/supabase-server";
import { parseImageDataUrl } from "@/lib/report/data-url";
import { extractReplicateImageUrl } from "@/lib/report/replicate-output";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

const RequestSchema = z.object({
  photoDataUrl: z.string(),
  hairstyles: z.array(z.object({
    name: z.string(),
    description: z.string(),
    faceShapeReason: z.string(),
    verdict: z.enum(["best", "okay", "avoid"]),
  })),
});

async function generateHairstyle(
  photoDataUrl: string,
  styleDescription: string,
): Promise<string | null> {
  try {
    const parsedPhoto = parseImageDataUrl(photoDataUrl);
    if (!parsedPhoto) return null;

    const imageBytes = new Uint8Array(parsedPhoto.buffer.length);
    imageBytes.set(parsedPhoto.buffer);
    const blob = new Blob([imageBytes], { type: parsedPhoto.mimeType });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
      fileEncodingStrategy: "upload",
    });

    const prompt = `Professional portrait of the same person with the following hairstyle: ${styleDescription}. Identical hair colour, face, skin tone, clothing and background as in the reference photo. Salon-quality natural hair.`;

    const output = await replicate.run("black-forest-labs/flux-2-pro", {
      input: buildFlux2ProInput(prompt, blob),
    });

    const resultUrl = extractReplicateImageUrl(output);

    return resultUrl || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { photoDataUrl, hairstyles } = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  // Return cached results if they exist
  if (userId) {
    const { data: cached } = await supabase
      .from("look_lab_hairstyles")
      .select("hairstyles")
      .eq("user_id", userId)
      .single();
    if (cached?.hairstyles) {
      return NextResponse.json({ hairstyles: cached.hairstyles });
    }
  }

  // Generate sequentially to avoid rate limits
  const results: (typeof hairstyles[number] & { generatedImageUrl?: string | null })[] = [];
  for (const style of hairstyles) {
    const imageUrl = await generateHairstyle(photoDataUrl, style.description);
    results.push({ ...style, generatedImageUrl: imageUrl });
  }

  if (userId) {
    try {
      await supabase
        .from("look_lab_hairstyles")
        .upsert({ user_id: userId, hairstyles: results }, { onConflict: "user_id" });
    } catch {
      // Non-fatal
    }
  }

  return NextResponse.json({ hairstyles: results });
}
