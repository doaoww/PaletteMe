type FileOutputLike = {
  url: () => URL;
};

export function extractReplicateImageUrl(output: unknown): string | null {
  if (typeof output === "string" && output.trim()) {
    return output;
  }

  if (Array.isArray(output)) {
    return extractReplicateImageUrl(output[0]);
  }

  if (isFileOutputLike(output)) {
    return output.url().toString();
  }

  return null;
}

function isFileOutputLike(output: unknown): output is FileOutputLike {
  return (
    typeof output === "object" &&
    output !== null &&
    "url" in output &&
    typeof (output as { url?: unknown }).url === "function"
  );
}
