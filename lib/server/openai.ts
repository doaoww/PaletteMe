import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

type Env = Record<string, string | undefined>;

type ResponsesParseClient = {
  responses: {
    parse: (params: unknown) => Promise<{ output_parsed: unknown }>;
  };
};

export type StyleImageInput = {
  mimeType: string;
  base64: string;
  detail?: "low" | "high" | "auto" | "original";
};

export type StructuredStyleResponseInput<TSchema extends z.ZodType> = {
  client?: ResponsesParseClient;
  schema: TSchema;
  schemaName: string;
  instructions: string;
  prompt: string;
  image?: StyleImageInput;
  model?: string;
  maxOutputTokens?: number;
  promptCacheKey?: string;
};

let openaiClient: OpenAI | null = null;

export function getConfiguredStyleModel(env: Env = process.env): string {
  return env.OPENAI_STYLE_MODEL?.trim() || "gpt-5.5";
}

export function getOpenAIClient(env: Env = process.env): OpenAI {
  if (openaiClient) return openaiClient;
  const apiKey = env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

export function buildImageInput({
  mimeType,
  base64,
  detail = "auto",
}: StyleImageInput): {
  type: "input_image";
  image_url: string;
  detail: "low" | "high" | "auto" | "original";
} {
  return {
    type: "input_image",
    image_url: `data:${mimeType};base64,${base64}`,
    detail,
  };
}

export async function runStructuredStyleResponse<TSchema extends z.ZodType>({
  client,
  schema,
  schemaName,
  instructions,
  prompt,
  image,
  model,
  maxOutputTokens = 1200,
  promptCacheKey,
}: StructuredStyleResponseInput<TSchema>): Promise<z.infer<TSchema>> {
  const activeClient = client ?? getOpenAIClient();
  const content = [
    { type: "input_text" as const, text: prompt },
    ...(image ? [buildImageInput(image)] : []),
  ];

  const response = await activeClient.responses.parse({
    model: model ?? getConfiguredStyleModel(),
    instructions,
    input: [
      {
        role: "user",
        content,
      },
    ],
    text: {
      format: zodTextFormat(schema, schemaName),
    },
    max_output_tokens: maxOutputTokens,
    store: false,
    prompt_cache_key: promptCacheKey,
    prompt_cache_retention: promptCacheKey ? "24h" : undefined,
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI returned empty structured output.");
  }

  return response.output_parsed as z.infer<TSchema>;
}
