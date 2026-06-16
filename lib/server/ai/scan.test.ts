import assert from "node:assert/strict";
import test from "node:test";
import { zodTextFormat } from "openai/helpers/zod";
import {
  buildScanAnalysisInput,
  parseScanType,
  readScanProfileSummaryFromFormData,
  validateScanImage,
} from "./scan.ts";
import { ScanResultSchema } from "./schemas.ts";

test("parses supported scan types and defaults to clothing item", () => {
  assert.equal(parseScanType("makeup"), "makeup");
  assert.equal(parseScanType("outfit"), "outfit");
  assert.equal(parseScanType("bad"), "clothing_item");
  assert.equal(parseScanType(null), "clothing_item");
});

test("validates supported scan images", () => {
  const image = new File(["image"], "shirt.jpg", { type: "image/jpeg" });
  assert.equal(validateScanImage(image), null);
});

test("rejects unsupported scan images and images over 10 MB", () => {
  const text = new File(["notes"], "notes.txt", { type: "text/plain" });
  assert.equal(validateScanImage(text), "Only JPG, PNG, or WebP images are supported.");

  const huge = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "huge.png", {
    type: "image/png",
  });
  assert.equal(validateScanImage(huge), "Image must be 10 MB or smaller.");
});

test("builds OpenAI scan input with schema, prompt, and image detail", () => {
  const input = buildScanAnalysisInput({
    scanType: "product_screenshot",
    imageBase64: "abc",
    mimeType: "image/webp",
    profileSummary: "True Winter with high contrast.",
    userGoal: "should I buy this coat?",
    wardrobeSummary: "owns black boots",
  });

  assert.equal(input.schema, ScanResultSchema);
  assert.equal(input.schemaName, "paletteme_scan_result");
  assert.equal(input.image?.detail, "high");
  assert.match(input.prompt, /True Winter/);
  assert.match(input.prompt, /black boots/);
  assert.match(input.instructions, /practical AI style analyst/);
});

test("scan result schema is compatible with OpenAI strict structured output", () => {
  assert.doesNotThrow(() => zodTextFormat(ScanResultSchema, "paletteme_scan_result"));
});

test("builds profile summary from scan palette form fields", () => {
  const formData = new FormData();
  formData.append("colortype", "autumn");
  formData.append("seasonId", "autumn");
  formData.append("subSeason", "Dark Autumn");
  formData.append("bestColors", JSON.stringify(["#D4A574", "#6B8E23"]));
  formData.append("colorsToAvoid", JSON.stringify(["Icy pink #F0D4DC", "Cool grey #B8BCC4"]));

  const summary = readScanProfileSummaryFromFormData(formData);

  assert.match(summary ?? "", /Season: autumn/);
  assert.match(summary ?? "", /Sub-season: Dark Autumn/);
  assert.match(summary ?? "", /Best colors: #D4A574, #6B8E23/);
  assert.match(summary ?? "", /Colors to avoid: Icy pink #F0D4DC, Cool grey #B8BCC4/);
});
