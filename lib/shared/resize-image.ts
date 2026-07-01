const HEIC_MIME_TYPES = new Set(["image/heic", "image/heif"]);
const UPLOAD_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

function isHeicFile(file: Pick<File, "type" | "name">): boolean {
  if (HEIC_MIME_TYPES.has(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

async function convertHeicToJpeg(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Your photo is in HEIC format and couldn't be converted. " +
        "On iPhone: Settings → Camera → Formats → Most Compatible, then try again."
    );
  }

  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Photo conversion failed. Please try again.");
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );
  if (!blob) throw new Error("Photo conversion failed. Please try again.");

  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

/**
 * Convert HEIC → JPEG if needed, validate format and size, then resize.
 * Throws with a user-facing message on failure.
 */
export async function prepareImageForUpload(
  file: File,
  maxDim = 1024,
  quality = 0.85
): Promise<File> {
  if (isHeicFile(file)) {
    file = await convertHeicToJpeg(file);
  }

  if (!UPLOAD_ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, or WebP images are supported.");
  }

  if (file.size > UPLOAD_MAX_BYTES) {
    throw new Error("Image must be 10 MB or smaller.");
  }

  return resizeImageForAnalysis(file, maxDim, quality);
}

/** Shrink images before upload to reduce token usage and upload time. */
export async function resizeImageForAnalysis(
  file: File,
  maxDim = 1024,
  quality = 0.85
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  if (scale === 1 && file.type === "image/jpeg" && file.size < 800_000) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "selfie";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}
