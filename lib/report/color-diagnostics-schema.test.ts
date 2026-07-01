import assert from "node:assert/strict";
import test from "node:test";
import { ColorDiagnosticsSchema } from "./color-diagnostics-schema.ts";

test("allows makeup diagnostics to be absent for male reports", () => {
  const parsed = ColorDiagnosticsSchema.parse({
    families: [
      { id: "warm", comment: "Warmth is the dominant direction.", isWinner: true },
      { id: "deep", comment: "Depth gives the face definition.", isWinner: true },
    ],
    neutrals: [
      { hex: "#6B4A2B", name: "Walnut", comment: "A grounded neutral.", verdict: "best" },
    ],
    makeup: null,
  });

  assert.equal(parsed.makeup, null);
});
