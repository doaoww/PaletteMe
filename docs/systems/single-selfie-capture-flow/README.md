# Single Selfie Capture Flow

Date: 2026-06-13
Status: shipped

## What Changed

PaletteMe now has one active selfie analysis path: `/quiz`.

Users can choose an existing photo, take a new selfie on browsers with live camera support, or drag and drop an image. The old dashboard upload surface and unused quiz selfie component were removed so users do not see three different photo entry points.

## Architecture

- `components/selfie/selfie-capture.tsx` owns the reusable upload, live camera, and drag/drop UI.
- `lib/selfie-capture.ts` owns accepted MIME types, live camera support detection, and file validation.
- `components/quiz/quiz-flow.tsx` uses `SelfieCapture` in the color analysis entry step.
- `app/dashboard/page.tsx` redirects to `/quiz` as a legacy compatibility URL.

## Camera Behavior

`choose photo` opens a normal file picker.

`take photo` must not click a hidden file input on desktop. It starts a real webcam stream through `navigator.mediaDevices.getUserMedia()` and then captures a JPEG from the video preview. If the browser cannot support secure live camera access, the `take photo` action is hidden.

When the live camera preview is active, the selfie drop zone must switch to an auto-height panel. Do not keep the upload card's fixed `4/5` aspect ratio or hidden overflow around the webcam preview, because that clips the capture/cancel action row on short mobile viewports.

## User Experience

The intended user flow is:

1. Open `/quiz`.
2. Answer onboarding questions.
3. Choose photo, take photo when live camera is available, or drag and drop.
4. Get the color analysis result inside the same flow.

This keeps the mobile experience simpler and reduces user confusion around where photo analysis should happen.

## Deleted Legacy Parts

- `components/dashboard/color-analyzer.tsx`
- `components/quiz/quiz-selfie-step.tsx`

Do not rebuild these as active upload surfaces. If another part of the app needs selfie capture, reuse `SelfieCapture` instead.

## Validation

- `node --test --experimental-strip-types`
- `node node_modules\typescript\bin\tsc --noEmit`
- `node node_modules\next\dist\bin\next build`
