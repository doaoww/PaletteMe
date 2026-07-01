import { Buffer } from "node:buffer";

const SUPPORTED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ParsedImageDataUrl = {
  mimeType: string;
  buffer: Buffer;
};

export function parseImageDataUrl(value: string): ParsedImageDataUrl | null {
  const match = value.match(/^data:([^;,]+);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) return null;

  const mimeType = match[1]!.toLowerCase();
  if (!SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)) return null;

  try {
    return {
      mimeType,
      buffer: Buffer.from(match[2]!, "base64"),
    };
  } catch {
    return null;
  }
}
