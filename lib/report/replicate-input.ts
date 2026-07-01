export function buildFlux2ProInput(
  prompt: string,
  originalPhoto: Blob,
  resolution: "1 MP" | "2 MP" = "1 MP",
) {
  return {
    prompt,
    input_images: [originalPhoto],
    resolution,
    aspect_ratio: "match_input_image",
    safety_tolerance: 5,
    output_format: "webp",
    output_quality: 90,
  };
}
