# 02 - API Route And UI Handling

## Goal

Make the app display retake/no-face guidance instead of generic "analysis failed" messages.

## Acceptance

- `/api/analyze` returns 422 for retake cases.
- UI reads `message` first, then `error`.
- User is told to upload a clear selfie when the image is not a human face.
