export const SELFIE_ACCEPT = "image/jpeg,image/png,image/webp";
export const SELFIE_MAX_BYTES = 10 * 1024 * 1024;

export type SelfieInputMode = "upload";
export type CameraFacingMode = "user" | "environment";

export type LiveCameraSupportInput = {
  isSecureContext?: boolean;
  mediaDevices?: {
    getUserMedia?: unknown;
  } | null;
};

export type VideoFrameMetrics = {
  videoWidth?: number;
  videoHeight?: number;
};

export type CameraErrorLike = {
  name?: string;
};

export type SelfieValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function isLiveCameraSupported(input: LiveCameraSupportInput) {
  return input.isSecureContext === true && typeof input.mediaDevices?.getUserMedia === "function";
}

export function canCaptureVideoFrame(input: VideoFrameMetrics) {
  return (input.videoWidth ?? 0) > 0 && (input.videoHeight ?? 0) > 0;
}

export function shouldDisableCameraAfterError(error: CameraErrorLike) {
  return (
    error.name === "NotFoundError" ||
    error.name === "NotReadableError" ||
    error.name === "OverconstrainedError"
  );
}

export function buildSelfieInputProps(mode: SelfieInputMode) {
  void mode;
  const props: {
    type: "file";
    accept: string;
  } = {
    type: "file",
    accept: SELFIE_ACCEPT,
  };

  return props;
}

export function buildCameraVideoConstraints(facingMode: CameraFacingMode = "user"): MediaStreamConstraints {
  return {
    audio: false,
    video: { facingMode },
  };
}

export function validateSelfieFile(file: Pick<File, "type" | "size">): SelfieValidationResult {
  if (!SELFIE_ACCEPT.split(",").includes(file.type)) {
    return { ok: false, error: "Only JPG, PNG, or WebP images are supported." };
  }

  if (file.size > SELFIE_MAX_BYTES) {
    return { ok: false, error: "Image must be 10 MB or smaller." };
  }

  return { ok: true };
}
