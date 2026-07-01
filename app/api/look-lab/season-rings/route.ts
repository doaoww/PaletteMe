export const runtime = "nodejs";
export const maxDuration = 300;

import Replicate from "replicate";
import { createClient } from "@/lib/db/supabase-server";
import { SEASON_RING_CONFIGS } from "@/lib/look-lab/season-ring-config";

const BUCKET = "season-rings";

// GET — returns public URLs for all 12 season rings
export async function GET() {
  const supabase = await createClient();
  const urls: Record<string, string> = {};

  for (const cfg of SEASON_RING_CONFIGS) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${cfg.id}.png`);
    urls[cfg.name] = data.publicUrl;
  }

  return Response.json({ urls });
}

// POST — generates missing rings via Flux 2 Pro, stores in Supabase Storage
// Protected by ADMIN_SECRET header
export async function POST(request: Request) {
  const secret = request.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { regenerate = false }: { regenerate?: boolean } = await request.json().catch(() => ({}));

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  const supabase = await createClient();
  const results: Record<string, string | null> = {};

  for (const cfg of SEASON_RING_CONFIGS) {
    const filename = `${cfg.id}.png`;

    // Skip if already exists and not forcing regeneration
    if (!regenerate) {
      const { data: existing } = await supabase.storage.from(BUCKET).download(filename);
      if (existing) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
        results[cfg.name] = data.publicUrl;
        continue;
      }
    }

    try {
      const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
        input: {
          prompt: cfg.prompt,
          width: 1024,
          height: 1024,
          output_format: "png",
          output_quality: 90,
        },
      }) as { url: () => URL } | string;

      const resultUrl = typeof output === "string"
        ? output
        : (output as { url: () => URL }).url().toString();

      if (!resultUrl) { results[cfg.name] = null; continue; }

      const imgRes = await fetch(resultUrl);
      if (!imgRes.ok) { results[cfg.name] = null; continue; }

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, buffer, { contentType: "image/png", upsert: true });

      if (error) { results[cfg.name] = null; continue; }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      results[cfg.name] = data.publicUrl;
    } catch {
      results[cfg.name] = null;
    }
  }

  return Response.json({ results });
}
