# Single Selfie Capture Flow

Date: 2026-06-13
Status: in-progress

## Goal

Make `/quiz` the only active selfie analysis path, add camera capture there, and remove old duplicate upload surfaces.

## Product Decision

Users should not see multiple places to upload/take a photo. The quiz is the canonical onboarding and color-analysis flow. `/dashboard` remains as a compatibility URL but redirects to `/quiz`.

## Architecture

- Add a reusable selfie capture helper/component.
- Use live camera capture through `getUserMedia` when available; hide the camera action when unsupported.
- Keep normal upload and drag/drop.
- Delete unused `QuizSelfieStep`.
- Delete legacy dashboard analyzer UI.
