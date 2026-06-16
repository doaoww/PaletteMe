# Task 1 - Contracts And Prompts

Status: done

## Goal

Create shared backend contracts for verdicts, scan results, wardrobe items, generated outfits, and prompt builders.

## Files

- `lib/server/ai/schemas.ts`
- `lib/server/ai/prompts.ts`
- `lib/server/ai/schemas.test.ts`

## Requirements

- Every AI result includes a verdict, confidence, reason, next action, and correction choices.
- Scan types cover clothing item, outfit, makeup, and product screenshot.
- Prompts ask the model to be practical, inclusive, and honest about uncertainty.
