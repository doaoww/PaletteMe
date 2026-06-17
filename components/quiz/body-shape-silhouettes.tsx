import type { BodyShape, WardrobeType } from "@/lib/quiz-data";

const WOMENSWEAR_SHAPE_IMAGES: Partial<Record<BodyShape, string>> = {
  hourglass:           "/images/body-shapes/hourglass.png",
  "bottom-hourglass":  "/images/body-shapes/bottom-hourglass.png",
  triangle:            "/images/body-shapes/triangle.png",
  "inverted-triangle": "/images/body-shapes/inverted-triangle.png",
  pear:                "/images/body-shapes/pear.png",
  rectangle:           "/images/body-shapes/rectangle.png",
};

const MENSWEAR_SHAPE_IMAGES: Partial<Record<BodyShape, string>> = {
  triangle:            "/images/body-shapes/triangle-men.png",
  rectangle:           "/images/body-shapes/rectangle-men.png",
  trapezoid:           "/images/body-shapes/trapezoid-men.png",
  oval:                "/images/body-shapes/oval-men.png",
  "inverted-triangle": "/images/body-shapes/athleticV-men.png",
};

export function BodyShapeSilhouette({
  shape,
  className,
  wardrobeType,
}: {
  shape: BodyShape;
  className?: string;
  wardrobeType?: WardrobeType;
}) {
  const map = wardrobeType === "menswear" ? MENSWEAR_SHAPE_IMAGES : WOMENSWEAR_SHAPE_IMAGES;
  const src = map[shape] ?? WOMENSWEAR_SHAPE_IMAGES[shape];
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={shape} className={className} draggable={false} />;
}

export type BodyShapeScreenOption = { id: BodyShape; label: string };

const WOMENSWEAR_SHAPES: BodyShapeScreenOption[] = [
  { id: "hourglass",          label: "Hourglass" },
  { id: "bottom-hourglass",   label: "Bottom Hourglass" },
  { id: "triangle",           label: "Triangle" },
  { id: "inverted-triangle",  label: "Inverted Triangle" },
  { id: "pear",               label: "Pear" },
  { id: "rectangle",          label: "Rectangle" },
];

const MENSWEAR_SHAPES: BodyShapeScreenOption[] = [
  { id: "rectangle",           label: "Rectangle" },
  { id: "trapezoid",           label: "Trapezoid" },
  { id: "oval",                label: "Oval" },
  { id: "triangle",            label: "Triangle" },
  { id: "inverted-triangle",   label: "Athletic V" },
];

export function getBodyShapeScreenOptions(wardrobeType?: WardrobeType): BodyShapeScreenOption[] {
  if (wardrobeType === "menswear") return MENSWEAR_SHAPES;
  if (wardrobeType === "womenswear") return WOMENSWEAR_SHAPES;

  const merged = [...WOMENSWEAR_SHAPES];
  for (const shape of MENSWEAR_SHAPES) {
    if (!merged.some((item) => item.id === shape.id)) merged.push(shape);
  }
  return merged;
}
