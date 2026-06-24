import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase-server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RequestSchema = z.object({
  // base64 data URL: "data:image/jpeg;base64,..."
  photoDataUrl: z.string(),
  hairstyles: z.array(z.object({
    name: z.string(),
    description: z.string(),
    faceShapeReason: z.string(),
    verdict: z.enum(["best", "okay", "avoid"]),
  })),
  userId: z.string(),
});

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string } {
  const [header, data] = dataUrl.split(",");
  const mimeType = header.replace("data:", "").replace(";base64", "");
  return { buffer: Buffer.from(data, "base64"), mimeType };
}

async function generateHairstyle(
  photoDataUrl: string,
  styleName: string,
  styleDescription: string
): Promise<string | null> {
  try {
    const { buffer, mimeType } = dataUrlToBuffer(photoDataUrl);
    const ext = mimeType.includes("png") ? "png" : "jpg";

    // openai.images.edit requires a File-like object
    const file = new File([new Uint8Array(buffer)], `photo.${ext}`, { type: mimeType });

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: file,
      prompt: `Change only the hairstyle to: ${styleDescription}. Keep the face, skin tone, eye colour, and all facial features completely identical. Only the hair shape, length, and style should change. Photorealistic, natural lighting.`,
      n: 1,
      size: "1024x1024",
    });

    // gpt-image-1 returns base64 by default
    const b64 = response.data?.[0]?.b64_json;
    if (b64) return `data:image/png;base64,${b64}`;
    return response.data?.[0]?.url ?? null;
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

  const { photoDataUrl, hairstyles, userId } = parsed.data;

  // Generate hairstyles sequentially to avoid rate limits
  const results: (typeof hairstyles[number] & { generatedImageUrl?: string | null })[] = [];
  for (const style of hairstyles) {
    const imageUrl = await generateHairstyle(
      photoDataUrl,
      style.name,
      style.description
    );
    results.push({ ...style, generatedImageUrl: imageUrl });
  }

  // Cache to Supabase so subsequent loads skip generation
  try {
    const supabase = await createClient();
    await supabase
      .from("look_lab_hairstyles")
      .upsert({ user_id: userId, hairstyles: results }, { onConflict: "user_id" });
  } catch {
    // Non-fatal — client still receives results
  }

  return NextResponse.json({ hairstyles: results });
}
