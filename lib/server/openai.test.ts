import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import {
  buildImageInput,
  getConfiguredStyleModel,
  getOpenAIClient,
  runStructuredStyleResponse,
} from "./openai.ts";

test("style model can be configured with an env var", () => {
  assert.equal(getConfiguredStyleModel({ OPENAI_STYLE_MODEL: " gpt-test " }), "gpt-test");
  assert.equal(getConfiguredStyleModel({}), "gpt-5.5");
});

test("missing OpenAI key throws a clear server setup error", () => {
  assert.throws(
    () => getOpenAIClient({ OPENAI_API_KEY: "" }),
    /OPENAI_API_KEY is not configured/
  );
});

test("builds image input as a data URL for Responses API vision calls", () => {
  assert.deepEqual(buildImageInput({
    mimeType: "image/webp",
    base64: "abc123",
    detail: "low",
  }), {
    type: "input_image",
    image_url: "data:image/webp;base64,abc123",
    detail: "low",
  });
});

test("structured style response sends schema format and returns parsed output", async () => {
  const calls: unknown[] = [];
  const fakeClient = {
    responses: {
      parse: async (params: unknown) => {
        calls.push(params);
        return { output_parsed: { ok: true } };
      },
    },
  };

  const result = await runStructuredStyleResponse({
    client: fakeClient,
    schema: z.object({ ok: z.boolean() }),
    schemaName: "test_schema",
    instructions: "Be practical.",
    prompt: "Analyze this.",
    image: { mimeType: "image/jpeg", base64: "image", detail: "high" },
    promptCacheKey: "scan",
  });

  assert.deepEqual(result, { ok: true });
  assert.equal(calls.length, 1);

  const params = calls[0] as {
    model: string;
    instructions: string;
    input: Array<{ role: string; content: Array<{ type: string }> }>;
    text: { format: { type: string } };
    prompt_cache_key: string;
    temperature?: number;
  };

  assert.equal(params.model, "gpt-5.5");
  assert.equal(params.instructions, "Be practical.");
  assert.equal(params.input[0].role, "user");
  assert.equal(params.input[0].content[0].type, "input_text");
  assert.equal(params.input[0].content[1].type, "input_image");
  assert.equal(params.text.format.type, "json_schema");
  assert.equal(params.prompt_cache_key, "scan");
  assert.equal(
    params.temperature,
    undefined,
    "gpt-5.x Responses models reject an explicit temperature param"
  );
});
