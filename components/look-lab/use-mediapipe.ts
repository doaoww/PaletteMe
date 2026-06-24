"use client";

import { useEffect, useRef, useState } from "react";
import type { FaceLandmarker, ImageSegmenter } from "@mediapipe/tasks-vision";

export type MediaPipeState = {
  faceLandmarker: FaceLandmarker | null;
  selfieSegmenter: ImageSegmenter | null;
  ready: boolean;
  error: string | null;
};

const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";

let globalFaceLandmarker: FaceLandmarker | null = null;
let globalSelfieSegmenter: ImageSegmenter | null = null;
let initPromise: Promise<void> | null = null;

async function initMediaPipe(): Promise<void> {
  const { FaceLandmarker, ImageSegmenter, FilesetResolver } = await import(
    "@mediapipe/tasks-vision"
  );
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

  globalFaceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "IMAGE",
    numFaces: 1,
  });

  globalSelfieSegmenter = await ImageSegmenter.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
      delegate: "GPU",
    },
    runningMode: "IMAGE",
    outputCategoryMask: true,
  });
}

export function useMediaPipe(): MediaPipeState {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (globalFaceLandmarker && globalSelfieSegmenter) {
      setReady(true);
      return;
    }
    if (!initPromise) initPromise = initMediaPipe();
    initPromise
      .then(() => { if (mounted.current) setReady(true); })
      .catch(e => { if (mounted.current) setError(String(e)); });
    return () => { mounted.current = false; };
  }, []);

  return {
    faceLandmarker: globalFaceLandmarker,
    selfieSegmenter: globalSelfieSegmenter,
    ready,
    error,
  };
}
