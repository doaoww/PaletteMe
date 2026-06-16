# Accuracy Gate v1 Design

Date: 2026-06-13

## Goal

PaletteMe should return a color result only when the uploaded image is a usable selfie of a human face. If the image is not a person, is too unclear, has harsh color cast, heavy filters, covered face, sunglasses, or poor lighting, the app should ask for a better selfie instead of inventing a season.

## Product Behavior

- If the user uploads a non-human image, show: "Please upload a clear selfie of your face."
- If the face is hidden, too small, strongly filtered, or lighting is unreliable, show a retake message with specific fixes.
- If the image is usable, return the season, sub-season, traits, feature evidence, confidence, top alternatives, and a short accuracy note.
- Quiz answers remain a soft prior only. Photo evidence wins.
- The result should be honest about uncertainty. A borderline result should say what the next best seasons were.

## Architecture

Use the existing `/api/analyze` path and `lib/analysis.ts`, because that is already wired into quiz and dashboard flows. Add a pure normalization layer that accepts model JSON and either returns an `AnalysisResult` or throws an `AnalysisRetakeError`. This lets tests cover the important accuracy gates without calling the model.

## Data Contract

The model response must include:

- `hasHumanFace`
- `faceCount`
- `photoQuality`
- `season`
- `subSeason`
- `undertone`
- `contrast`
- `depth`
- `chroma`
- `features`
- `evidence`
- `alternatives`
- `confidence`
- `summary`
- `tips`

The public `AnalysisResult` adds:

- `quality`
- `alternatives`
- `accuracyNote`
- `needsRetake: false`

Retake responses return HTTP 422 with:

- `error`
- `message`
- `issues`

## Testing

Add tests for:

- Non-human uploads throw a no-face retake error.
- Poor quality human selfies throw a retake error.
- Valid model output normalizes traits, alternatives, and report data.
- Missing alternatives still produces a safe fallback alternative list.

## Not In Scope

- Building a real benchmark dataset.
- Storing uploaded photos.
- Replacing macro-season palettes with 12 separate sub-season palettes.
- Building user correction feedback capture.
