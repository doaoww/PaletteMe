"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  buildCameraVideoConstraints,
  buildSelfieInputProps,
  canCaptureVideoFrame,
  type CameraFacingMode,
  isLiveCameraSupported,
  shouldDisableCameraAfterError,
} from "@/lib/selfie-capture";

type Props = {
  onFile: (file: File) => void;
  maxWidth?: number;
  title?: string;
  detail?: string;
  privacyCopy?: string;
  cameraFacingMode?: CameraFacingMode;
  captureLabel?: string;
  capturedFilePrefix?: string;
};

export function SelfieCapture({
  onFile,
  maxWidth = 400,
  title = "Drop your selfie here",
  detail = "JPG, PNG, or WebP · max 10 MB · natural light, no filters",
  privacyCopy = "Photos are processed securely for analysis. PaletteMe does not sell or share your images.",
  cameraFacingMode = "user",
  captureLabel = "capture selfie",
  capturedFilePrefix = "paletteme-selfie",
}: Props) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraStream(null);
    setIsCapturing(false);
    setCameraReady(false);
  }, []);

  useEffect(() => {
    setCameraAvailable(
      isLiveCameraSupported({
        isSecureContext: window.isSecureContext,
        mediaDevices: navigator.mediaDevices,
      }),
    );

    return stopCamera;
  }, [stopCamera]);

  useEffect(() => {
    if (!cameraStream || !videoRef.current) return;
    videoRef.current.srcObject = cameraStream;
    void videoRef.current.play().catch(() => {
      setCameraError("Camera preview could not start. Please choose a photo instead.");
      stopCamera();
    });
  }, [cameraStream, stopCamera]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    if (picked) onFile(picked);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  const openUploadPicker = () => {
    if (cameraStream) return;
    uploadRef.current?.click();
  };

  const startCamera = async () => {
    if (
      !isLiveCameraSupported({
        isSecureContext: window.isSecureContext,
        mediaDevices: navigator.mediaDevices,
      })
    ) {
      setCameraAvailable(false);
      setCameraError("Camera is not available in this browser. Please choose a photo instead.");
      return;
    }

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia(
        buildCameraVideoConstraints(cameraFacingMode),
      );
      setCameraReady(false);
      streamRef.current = stream;
      setCameraStream(stream);
    } catch (error) {
      const errorName =
        typeof error === "object" && error !== null && "name" in error
          ? String(error.name)
          : undefined;
      if (shouldDisableCameraAfterError({ name: errorName })) {
        setCameraAvailable(false);
      }
      setCameraError("We could not open your camera. Allow webcam access or choose a photo.");
    }
  };

  const waitForVideoFrame = async (video: HTMLVideoElement) => {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      if (
        canCaptureVideoFrame({
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
        })
      ) {
        return true;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }
    return false;
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) {
      setCameraError("Camera is still starting. Try again in a moment.");
      return;
    }

    setIsCapturing(true);
    const hasFrame = await waitForVideoFrame(video);
    if (!hasFrame) {
      setCameraError("Camera is still starting. Try again in a moment.");
      setIsCapturing(false);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Camera capture failed. Please choose a photo instead.");
      setIsCapturing(false);
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Camera capture failed. Please choose a photo instead.");
          setIsCapturing(false);
          return;
        }

        const file = new File([blob], `${capturedFilePrefix}-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        stopCamera();
        onFile(file);
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <div className="selfie-capture" style={{ maxWidth }}>
      <input
        {...buildSelfieInputProps("upload")}
        ref={uploadRef}
        className="hidden"
        onChange={handleInputChange}
      />

      <div
        role="button"
        tabIndex={0}
        className={`quiz-page__drop selfie-capture__drop${cameraStream ? " selfie-capture__drop--camera" : ""}${dragOver ? " quiz-page__drop--over" : ""}`}
        onClick={openUploadPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") openUploadPicker();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className={`quiz-page__drop-empty selfie-capture__empty${cameraStream ? " selfie-capture__empty--camera" : ""}`}>
          <span className="selfie-capture__icon" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.4-1.8A2 2 0 0 1 11 3.5h2a2 2 0 0 1 1.6.7L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
              <path d="M9 12.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
            </svg>
          </span>
          <p>{title}</p>
          <small>{detail}</small>
          {cameraStream ? (
            <div
              className="selfie-capture__camera"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <video
                ref={videoRef}
                className="selfie-capture__video"
                autoPlay
                muted
                playsInline
                onLoadedMetadata={() => {
                  setCameraReady(
                    canCaptureVideoFrame({
                      videoWidth: videoRef.current?.videoWidth,
                      videoHeight: videoRef.current?.videoHeight,
                    }),
                  );
                }}
                onCanPlay={() => {
                  setCameraReady(
                    canCaptureVideoFrame({
                      videoWidth: videoRef.current?.videoWidth,
                      videoHeight: videoRef.current?.videoHeight,
                    }),
                  );
                }}
              />
              <div className="selfie-capture__camera-actions">
                <button
                  type="button"
                  className="selfie-capture__action selfie-capture__action--primary"
                  disabled={isCapturing || !cameraReady}
                  onClick={() => void capturePhoto()}
                >
                  {cameraReady ? captureLabel : "starting camera"}
                </button>
                <button type="button" className="selfie-capture__action" onClick={stopCamera}>
                  cancel
                </button>
              </div>
            </div>
          ) : null}
          {!cameraStream ? (
            <div className="selfie-capture__actions">
              <button
                type="button"
                className="selfie-capture__action selfie-capture__action--primary"
                onClick={(event) => {
                  event.stopPropagation();
                  openUploadPicker();
                }}
              >
                choose photo
              </button>
              {cameraAvailable ? (
                <button
                  type="button"
                  className="selfie-capture__action"
                  onClick={(event) => {
                    event.stopPropagation();
                    void startCamera();
                  }}
                >
                  take photo
                </button>
              ) : null}
            </div>
          ) : null}
          {cameraError ? <small className="selfie-capture__camera-error">{cameraError}</small> : null}
          <small className="selfie-capture__privacy">{privacyCopy}</small>
        </div>
      </div>
    </div>
  );
}
