# Task 3 - API Routes

Status: done

## Goal

Expose stable backend routes for scan submission, job polling, wardrobe item save/list, and outfit generation.

## Files

- `app/api/ai/scan/route.ts`
- `app/api/ai/jobs/[id]/route.ts`
- `app/api/wardrobe/route.ts`
- `app/api/outfits/route.ts`

## Requirements

- Routes use `runtime = "nodejs"`.
- Routes validate inputs and return clear user-facing errors.
- Scan route can return either a synchronous result or a job id.
- Frontend should be able to build UI without knowing the OpenAI prompt internals.
