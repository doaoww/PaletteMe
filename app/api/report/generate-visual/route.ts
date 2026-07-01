export const runtime = "nodejs";
export const maxDuration = 120;

import Replicate from "replicate";
import { z } from "zod";
import { createClient } from "@/lib/db/supabase-server";
import { extractReplicateImageUrl } from "@/lib/report/replicate-output";
import { buildFlux2ProInput } from "@/lib/report/replicate-input";
import { buildImageSlots } from "@/lib/report/image-slots";
import { claimGenerationRow, finalizeGeneration, type LockRow } from "@/lib/server/generation-lock";
import { checkRateLimit } from "@/lib/shared/rate-limit";
import type { AnalysisResult } from "@/lib/report/report-schema";

const RequestSchema = z.object({
  photoDataUrl: z.string(),
  slotId: z.string(),
  resolutionOverride: z.enum(["1 MP", "2 MP"]).nullish(),
});

type PhotoParseOk = { blob: Blob; mimeType: string; byteLength: number };
type PhotoParseErr = { error: string };

function parsePhotoDataUrl(value: string): PhotoParseOk | PhotoParseErr {
  const sep = ";base64,";
  const sepIdx = value.indexOf(sep);
  if (sepIdx === -1 || !value.startsWith("data:")) {
    return { error: `Not a base64 data URL. Prefix: "${value.slice(0, 60)}"` };
  }

  const mimeType = value.slice(5, sepIdx).toLowerCase().trim();
  if (!mimeType.startsWith("image/")) {
    return { error: `Unsupported mime type: "${mimeType}"` };
  }

  const b64 = value.slice(sepIdx + sep.length).replace(/[\s\r\n]/g, "");

  let arrayBuffer: ArrayBuffer;
  try {
    const binary = atob(b64);
    arrayBuffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  } catch (e) {
    return { error: `base64 decode failed: ${e}` };
  }

  if (arrayBuffer.byteLength === 0) {
    return { error: "Decoded buffer is empty" };
  }

  const blob = new Blob([arrayBuffer], { type: mimeType });
  return { blob, mimeType, byteLength: arrayBuffer.byteLength };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const rate = await checkRateLimit(`generate-visual:${user.id}`, 60, 60 * 60 * 1000);
  if (!rate.allowed) {
    return Response.json({ imageUrl: null, debugError: "Rate limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { photoDataUrl, slotId, resolutionOverride } = parsed.data;

  // ── Rebuild the allowed prompt server-side from the stored report ───────────
  const { data: reportRow } = await supabase
    .from("style_reports")
    .select("full_report, wardrobe_type, quiz_answers, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!reportRow || reportRow.status !== "done" || !reportRow.full_report) {
    return Response.json({ error: "Report not ready" }, { status: 400 });
  }

  const fullReport = (reportRow.full_report as AnalysisResult).fullReport;
  const wardrobeType = (reportRow.wardrobe_type as "woman" | "man" | "other") ?? "woman";
  const sections = (reportRow.quiz_answers as { reportSections?: string[] } | null)?.reportSections ?? [];
  const slots = buildImageSlots(fullReport, wardrobeType, sections);
  const slot = slots.find(s => s.slotId === slotId);

  if (!slot) {
    return Response.json({ error: `Unknown slotId: ${slotId}` }, { status: 400 });
  }

  const prompt = slot.prompt;

  const photoResult = parsePhotoDataUrl(photoDataUrl);
  if ("error" in photoResult) {
    console.error(`[generate-visual] parsePhoto failed: ${photoResult.error}`);
    return Response.json({ imageUrl: null, debugError: `parsePhoto: ${photoResult.error}` });
  }
  const { blob, mimeType, byteLength } = photoResult;
  const resolution = resolutionOverride ?? "1 MP";

  console.log(`[generate-visual] slot=${slotId} mimeType=${mimeType} byteLength=${byteLength} blobSize=${blob.size} resolution=${resolution}`);

  // ── Claim the report_visuals row before spending anything ───────────────────
  const claim = await claimGenerationRow<LockRow & { image_url?: string | null }>({
    supabase,
    table: "report_visuals",
    match: { user_id: user.id, slot_id: slotId },
  });

  if (claim.outcome === "still-generating") {
    return Response.json({ imageUrl: null, debugError: "Already generating this slot" }, { status: 409 });
  }
  if (claim.outcome === "attempts-exhausted") {
    return Response.json({ imageUrl: null, debugError: "Too many attempts for this slot" }, { status: 429 });
  }
  if (claim.outcome === "use-cached" && claim.row.image_url) {
    return Response.json({ imageUrl: claim.row.image_url });
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN, fileEncodingStrategy: "upload" });

  let resultUrl: string | null = null;
  try {
    const replicateInput = buildFlux2ProInput(prompt, blob, resolution);
    const output = await replicate.run("black-forest-labs/flux-2-pro", { input: replicateInput });
    resultUrl = extractReplicateImageUrl(output);

    if (!resultUrl) {
      await finalizeGeneration({ supabase, table: "report_visuals", match: { user_id: user.id, slot_id: slotId }, patch: { status: "failed" } });
      return Response.json({ imageUrl: null, debugError: "extractUrl returned null" });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[generate-visual] Replicate error:", msg);
    await finalizeGeneration({ supabase, table: "report_visuals", match: { user_id: user.id, slot_id: slotId }, patch: { status: "failed" } });
    return Response.json({ imageUrl: null, debugError: msg });
  }

  try {
    const imgRes = await fetch(resultUrl);
    if (imgRes.ok) {
      const arrayBuf = await imgRes.arrayBuffer();
      const imgBuf = Buffer.from(arrayBuf);
      const path = `${user.id}/${slotId}.webp`;
      const { error } = await supabase.storage.from("report-visuals").upload(path, imgBuf, { contentType: "image/webp", upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("report-visuals").getPublicUrl(path);
        await finalizeGeneration({ supabase, table: "report_visuals", match: { user_id: user.id, slot_id: slotId }, patch: { status: "done", image_url: data.publicUrl } });
        return Response.json({ imageUrl: data.publicUrl });
      }
    }
  } catch (cacheErr) {
    console.warn("[generate-visual] Supabase cache failed, returning Replicate URL directly:", cacheErr instanceof Error ? cacheErr.message : String(cacheErr));
  }

  await finalizeGeneration({ supabase, table: "report_visuals", match: { user_id: user.id, slot_id: slotId }, patch: { status: "done", image_url: resultUrl } });
  return Response.json({ imageUrl: resultUrl });
}
