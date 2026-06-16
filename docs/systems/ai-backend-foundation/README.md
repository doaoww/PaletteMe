# AI Backend Foundation

Date: 2026-06-13
Status: shipped

## What Was Built

This system adds the design-independent backend foundation for PaletteMe's next AI features:

- Scan Anything backend contract.
- OpenAI Responses API adapter with Zod structured outputs.
- Shared AI result schemas for scan verdicts, wardrobe items, and outfit plans.
- Async in-memory AI job runner.
- Job polling route.
- Wardrobe save/list/correction route.
- Outfit-generation route contract.

The UI can now call stable backend routes while Claude Design continues visual work.

## Why It Exists

PaletteMe needs to feel fast and trustworthy for users. Heavy AI work should not freeze a mobile screen, and AI output should not be random prose that the UI has to guess how to render.

The backend now returns structured verdict data:

- verdict
- score
- confidence
- reason
- next action
- correction options
- styling tips
- better alternatives

## API Contracts

### `POST /api/ai/scan`

Accepts `multipart/form-data`.

Fields:

- `image` - required JPG, PNG, or WebP, max 10 MB
- `scanType` - `clothing_item`, `outfit`, `makeup`, or `product_screenshot`
- `profileSummary` - optional
- `userGoal` - optional
- `wardrobeSummary` - optional
- `mode` - optional, `sync` for local testing; default is async

Default response:

```json
{
  "ok": true,
  "mode": "async",
  "jobId": "uuid",
  "job": {
    "id": "uuid",
    "kind": "scan:product_screenshot",
    "status": "queued"
  }
}
```

### `GET /api/ai/jobs/[id]`

Returns job status.

Statuses:

- `queued`
- `running`
- `succeeded`
- `failed`

### `GET /api/wardrobe?userId=...`

Lists wardrobe items for a user id. If no user id is supplied, returns anonymous local items.

### `POST /api/wardrobe`

Saves a wardrobe item or applies a correction.

Create body:

```json
{
  "userId": "user-1",
  "source": "manual",
  "name": "navy blazer",
  "category": "jacket",
  "colors": ["navy"],
  "colorTemperature": "cool",
  "seasonFit": ["winter"],
  "formality": "work"
}
```

Correction body:

```json
{
  "action": "correct",
  "id": "item-id",
  "correction": {
    "category": "jacket",
    "colors": ["charcoal"]
  }
}
```

### `POST /api/outfits`

Starts an async outfit-generation job from saved wardrobe items. Requires at least 2 wardrobe items.

## Important Files

- `lib/server/openai.ts` - server-side OpenAI Responses adapter.
- `lib/server/ai/schemas.ts` - shared Zod schemas.
- `lib/server/ai/prompts.ts` - prompt builders and system prompt.
- `lib/server/ai/jobs.ts` - in-memory async job runner.
- `lib/server/ai/scan.ts` - scan validation and OpenAI input builder.
- `lib/server/wardrobe.ts` - in-memory wardrobe store and corrections.
- `app/api/ai/scan/route.ts` - scan submit route.
- `app/api/ai/jobs/[id]/route.ts` - job polling route.
- `app/api/wardrobe/route.ts` - wardrobe route.
- `app/api/outfits/route.ts` - outfit builder route.

## Current Limitations

- Jobs and wardrobe items are in-memory. They can reset on server restart and should move to Supabase before production launch.
- `/api/outfits` starts a job but does not yet have a polished frontend.
- `OPENAI_API_KEY` is required for live AI work.
- `OPENAI_STYLE_MODEL` can override the default model. Default is `gpt-5.5`.

## Verification

Commands run:

```powershell
node --test --experimental-strip-types
node node_modules\typescript\bin\tsc --noEmit
node node_modules\next\dist\bin\next build
```

Result:

- 48 tests passed.
- TypeScript passed.
- Next production build passed.

Note: `npm test` could not be used because this Windows npm install cannot find its global `npm-cli.js`. The equivalent Node test command passed.
