# Task 2: OpenAI Responses

Migrate the primary OpenAI path in `lib/analysis.ts` to structured Responses API output.

Acceptance:

- `OPENAI_COLOR_ANALYSIS_MODEL` overrides the color model.
- Default color model is `gpt-5.4` when no override is set.
- Legacy OpenAI chat and Gemini remain as fallbacks.

