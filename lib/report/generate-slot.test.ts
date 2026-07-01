import assert from "node:assert/strict";
import test from "node:test";
import { generateSlot } from "./generate-slot.ts";

test("generateSlot posts only photoDataUrl and slotId, never a prompt field", async () => {
  const originalFetch = globalThis.fetch;
  let capturedBody: unknown = null;
  globalThis.fetch = (async (_url: string, init?: RequestInit) => {
    capturedBody = JSON.parse(init!.body as string);
    return new Response(JSON.stringify({ imageUrl: "https://example.com/img.webp" }), { status: 200 });
  }) as typeof fetch;

  try {
    const url = await generateSlot("data:image/png;base64,AA==", "neutral-draping");
    assert.equal(url, "https://example.com/img.webp");
    assert.deepEqual(Object.keys(capturedBody as object).sort(), ["photoDataUrl", "slotId"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
