import assert from "node:assert/strict";
import test from "node:test";
import {
  SELFIE_ACCEPT,
  buildCameraVideoConstraints,
  buildSelfieInputProps,
  canCaptureVideoFrame,
  isLiveCameraSupported,
  shouldDisableCameraAfterError,
  validateSelfieFile,
} from "./selfie-capture.ts";

function fileLike(type: string, size: number) {
  return { type, size } as File;
}

test("upload input accepts supported selfie image types without camera capture", () => {
  assert.deepEqual(buildSelfieInputProps("upload"), {
    type: "file",
    accept: SELFIE_ACCEPT,
  });
});

test("live camera action requires real webcam API support", () => {
  assert.equal(
    isLiveCameraSupported({
      isSecureContext: true,
      mediaDevices: { getUserMedia: async () => ({}) },
    }),
    true,
  );
  assert.equal(
    isLiveCameraSupported({
      isSecureContext: true,
      mediaDevices: {},
    }),
    false,
  );
  assert.equal(
    isLiveCameraSupported({
      isSecureContext: false,
      mediaDevices: { getUserMedia: async () => ({}) },
    }),
    false,
  );
});

test("camera capture requires a ready video frame", () => {
  assert.equal(canCaptureVideoFrame({ videoWidth: 1280, videoHeight: 720 }), true);
  assert.equal(canCaptureVideoFrame({ videoWidth: 0, videoHeight: 720 }), false);
  assert.equal(canCaptureVideoFrame({ videoWidth: 1280, videoHeight: 0 }), false);
});

test("camera constraints can target front selfie or back item camera", () => {
  assert.deepEqual(buildCameraVideoConstraints(), {
    audio: false,
    video: { facingMode: "user" },
  });
  assert.deepEqual(buildCameraVideoConstraints("environment"), {
    audio: false,
    video: { facingMode: "environment" },
  });
});

test("camera is hidden after device-unavailable webcam errors", () => {
  assert.equal(shouldDisableCameraAfterError({ name: "NotFoundError" }), true);
  assert.equal(shouldDisableCameraAfterError({ name: "NotReadableError" }), true);
  assert.equal(shouldDisableCameraAfterError({ name: "OverconstrainedError" }), true);
  assert.equal(shouldDisableCameraAfterError({ name: "NotAllowedError" }), false);
});

test("selfie validation accepts supported images below 10 MB", () => {
  assert.deepEqual(validateSelfieFile(fileLike("image/jpeg", 2_000_000)), { ok: true });
  assert.deepEqual(validateSelfieFile(fileLike("image/png", 2_000_000)), { ok: true });
  assert.deepEqual(validateSelfieFile(fileLike("image/webp", 2_000_000)), { ok: true });
});

test("selfie validation rejects unsupported images and oversize files", () => {
  assert.deepEqual(validateSelfieFile(fileLike("image/gif", 2_000_000)), {
    ok: false,
    error: "Only JPG, PNG, or WebP images are supported.",
  });
  assert.deepEqual(validateSelfieFile(fileLike("image/jpeg", 11 * 1024 * 1024)), {
    ok: false,
    error: "Image must be 10 MB or smaller.",
  });
});
