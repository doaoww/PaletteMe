# Task 2 - OpenAI Adapter And Jobs

Status: done

## Goal

Create the server-side OpenAI Responses adapter and an async job runner that the UI can poll.

## Files

- `lib/server/openai.ts`
- `lib/server/ai/jobs.ts`
- `lib/server/ai/jobs.test.ts`

## Requirements

- API key is read only on the server.
- Responses use Zod structured outputs through the OpenAI SDK helper.
- Jobs expose `queued`, `running`, `succeeded`, and `failed` states.
- In-memory jobs are acceptable for testing mode; Supabase persistence can replace it later.
