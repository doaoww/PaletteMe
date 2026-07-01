"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useRef } from "react";

type TiltedCardProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  imageSrc?: string;
  altText?: string;
  captionText?: string;
  containerHeight?: string;
  containerWidth?: string;
  imageHeight?: string;
  imageWidth?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  showTooltip?: boolean;
  displayOverlayContent?: boolean;
  overlayContent?: ReactNode;
  ariaLabel?: string;
};

const DEFAULT_ROTATE = 10;
const DEFAULT_SCALE = 1.035;

export function TiltedCard({
  children,
  className = "",
  style,
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight,
  containerWidth = "100%",
  imageHeight,
  imageWidth,
  rotateAmplitude = DEFAULT_ROTATE,
  scaleOnHover = DEFAULT_SCALE,
  showTooltip = false,
  displayOverlayContent = false,
  overlayContent = null,
  ariaLabel,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  function setCardVar(name: string, value: string) {
    ref.current?.style.setProperty(name, value);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;
    const velocityY = offsetY - lastY.current;

    setCardVar("--tilt-rotate-x", `${rotationX.toFixed(2)}deg`);
    setCardVar("--tilt-rotate-y", `${rotationY.toFixed(2)}deg`);
    setCardVar("--tilt-caption-x", `${event.clientX - rect.left}px`);
    setCardVar("--tilt-caption-y", `${event.clientY - rect.top}px`);
    setCardVar("--tilt-caption-rotate", `${(-velocityY * 0.45).toFixed(2)}deg`);
    lastY.current = offsetY;
  }

  function handlePointerEnter(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;

    setCardVar("--tilt-scale", `${scaleOnHover}`);
    setCardVar("--tilt-caption-opacity", "1");
  }

  function handlePointerLeave() {
    setCardVar("--tilt-scale", "1");
    setCardVar("--tilt-rotate-x", "0deg");
    setCardVar("--tilt-rotate-y", "0deg");
    setCardVar("--tilt-caption-opacity", "0");
    setCardVar("--tilt-caption-rotate", "0deg");
  }

  const dimensions = {
    ...(containerHeight ? { height: containerHeight } : {}),
    width: containerWidth,
  };

  const imageDimensions = {
    ...(imageHeight ? { height: imageHeight } : {}),
    ...(imageWidth ? { width: imageWidth } : {}),
  };

  return (
    <figure
      ref={ref}
      className={`tilted-card${className ? ` ${className}` : ""}`}
      style={{ ...dimensions, ...style }}
      aria-label={ariaLabel}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div className="tilted-card__inner" style={imageDimensions}>
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageSrc} alt={altText} className="tilted-card__img" style={imageDimensions} />
        ) : null}

        {displayOverlayContent && overlayContent ? (
          <div className="tilted-card__overlay">{overlayContent}</div>
        ) : null}

        {children ? <div className="tilted-card__content">{children}</div> : null}
      </div>

      {showTooltip && captionText ? (
        <figcaption className="tilted-card__caption">{captionText}</figcaption>
      ) : null}
    </figure>
  );
}

export default TiltedCard;
