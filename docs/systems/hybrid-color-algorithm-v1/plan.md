# Hybrid Color Algorithm v1

Date: 2026-06-13
Status: in-progress

## Goal

Improve color analysis accuracy by combining GPT visual evidence extraction with deterministic 12-season scoring.

## Scope

- Use the user-provided Dark Autumn vs True Winter example as the first calibration case.
- Add a reusable sub-season scorer.
- Route `/api/analyze` through OpenAI Responses API when possible.
- Keep Accuracy Gate v1 retake behavior.

## Out of Scope

- Training a custom model.
- Storing user photos.
- Building a full labeled evaluation dataset.

