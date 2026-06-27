import type { FullReport } from "./report-schema";

// Slot type
export type ImageSlot = {
  slotId: string;
  prompt: string;
  label: string;
};

// This function is completed in Task 10 once prompt builders are exported.
// Placeholder that will be replaced:
export function buildImageSlots(_report: FullReport): ImageSlot[] {
  return [];
}
