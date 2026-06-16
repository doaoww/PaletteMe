import type { ComponentType, ReactNode } from "react";
import type { BodyShape, WardrobeType } from "@/lib/quiz-data";

type SilhouetteProps = { className?: string };

const SKIN = "#C9956C";
const SKIN_SHADOW = "#A8784E";
const OUTLINE = "#5C4A3A";

function CroquisFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 148"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx="50" cy="18" rx="11" ry="13" fill={SKIN} stroke={OUTLINE} strokeWidth="1.2" />
      <path d="M44 30 Q50 34 56 30" stroke={OUTLINE} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      {children}
    </svg>
  );
}

function HourglassShape({ className }: SilhouetteProps) {
  return (
    <CroquisFrame className={className}>
      <path
        d="M36 34 L32 52 Q30 62 34 72 Q38 78 50 80 Q62 78 66 72 Q70 62 68 52 L64 34 Z"
        fill={SKIN}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M38 80 Q34 88 32 98 L30 132 Q50 136 70 132 L68 98 Q66 88 62 80"
        fill={SKIN_SHADOW}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M28 38 L24 58 M72 38 L76 58" stroke={OUTLINE} strokeWidth="1.2" strokeLinecap="round" />
    </CroquisFrame>
  );
}

function PearShape({ className }: SilhouetteProps) {
  return (
    <CroquisFrame className={className}>
      <path
        d="M40 34 L38 54 Q37 64 40 72 L42 80 Q44 84 50 84 Q56 84 58 80 L60 72 Q63 64 62 54 L60 34 Z"
        fill={SKIN}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M34 82 Q28 92 26 104 L24 132 Q50 138 76 132 L74 104 Q72 92 66 82 Q58 78 50 78 Q42 78 34 82 Z"
        fill={SKIN_SHADOW}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M30 40 L26 58 M70 40 L74 58" stroke={OUTLINE} strokeWidth="1.2" strokeLinecap="round" />
    </CroquisFrame>
  );
}

function InvertedTriangleShape({ className }: SilhouetteProps) {
  return (
    <CroquisFrame className={className}>
      <path
        d="M28 34 L72 34 L68 56 Q66 68 58 74 L50 78 L42 74 Q34 68 32 56 Z"
        fill={SKIN}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M42 78 L40 132 Q50 136 60 132 L58 78 Q54 80 50 80 Q46 80 42 78 Z"
        fill={SKIN_SHADOW}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M24 36 L18 56 M76 36 L82 56" stroke={OUTLINE} strokeWidth="1.2" strokeLinecap="round" />
    </CroquisFrame>
  );
}

function RectangleShape({ className }: SilhouetteProps) {
  return (
    <CroquisFrame className={className}>
      <path
        d="M38 34 L62 34 L64 132 Q50 136 36 132 Z"
        fill={SKIN}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M30 38 L26 58 M70 38 L74 58" stroke={OUTLINE} strokeWidth="1.2" strokeLinecap="round" />
    </CroquisFrame>
  );
}

function AppleShape({ className }: SilhouetteProps) {
  return (
    <CroquisFrame className={className}>
      <path
        d="M38 34 L62 34 Q68 52 66 68 Q64 82 58 88 L50 90 Q42 88 36 82 Q32 68 34 52 Z"
        fill={SKIN}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M40 88 L38 132 Q50 136 62 132 L60 88 Q56 92 50 92 Q44 92 40 88 Z"
        fill={SKIN_SHADOW}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M30 40 L26 58 M70 40 L74 58" stroke={OUTLINE} strokeWidth="1.2" strokeLinecap="round" />
    </CroquisFrame>
  );
}

function TrapezoidShape({ className }: SilhouetteProps) {
  return (
    <CroquisFrame className={className}>
      <path
        d="M26 34 L74 34 L66 72 L58 132 Q50 136 42 132 L34 72 Z"
        fill={SKIN}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M22 36 L16 56 M78 36 L84 56" stroke={OUTLINE} strokeWidth="1.2" strokeLinecap="round" />
    </CroquisFrame>
  );
}

function OvalShape({ className }: SilhouetteProps) {
  return (
    <CroquisFrame className={className}>
      <ellipse cx="50" cy="82" rx="22" ry="38" fill={SKIN} stroke={OUTLINE} strokeWidth="1.4" />
      <path d="M32 38 L28 58 M68 38 L72 58" stroke={OUTLINE} strokeWidth="1.2" strokeLinecap="round" />
    </CroquisFrame>
  );
}

function TriangleMensShape({ className }: SilhouetteProps) {
  return (
    <CroquisFrame className={className}>
      <path
        d="M42 34 L58 34 Q56 58 54 72 L52 88 Q50 90 48 88 L46 72 Q44 58 42 34 Z"
        fill={SKIN}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M30 82 Q24 96 22 112 L20 132 Q50 138 80 132 L78 112 Q76 96 70 82 Q60 76 50 76 Q40 76 30 82 Z"
        fill={SKIN_SHADOW}
        stroke={OUTLINE}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M36 38 L32 56 M64 38 L68 56" stroke={OUTLINE} strokeWidth="1.2" strokeLinecap="round" />
    </CroquisFrame>
  );
}

const SILHOUETTES: Partial<Record<BodyShape, ComponentType<SilhouetteProps>>> = {
  hourglass: HourglassShape,
  pear: PearShape,
  triangle: TriangleMensShape,
  "inverted-triangle": InvertedTriangleShape,
  rectangle: RectangleShape,
  apple: AppleShape,
  trapezoid: TrapezoidShape,
  oval: OvalShape,
};

export function BodyShapeSilhouette({
  shape,
  className,
}: {
  shape: BodyShape;
  className?: string;
}) {
  const Component = SILHOUETTES[shape] ?? RectangleShape;
  return <Component className={className} />;
}

export type BodyShapeScreenOption = { id: BodyShape; label: string };

const WOMENSWEAR_SHAPES: BodyShapeScreenOption[] = [
  { id: "hourglass", label: "Hourglass" },
  { id: "pear", label: "Triangle" },
  { id: "inverted-triangle", label: "Inverted Triangle" },
  { id: "rectangle", label: "Rectangle" },
  { id: "apple", label: "Apple" },
];

const MENSWEAR_SHAPES: BodyShapeScreenOption[] = [
  { id: "rectangle", label: "Rectangle" },
  { id: "trapezoid", label: "Trapezoid" },
  { id: "oval", label: "Oval" },
  { id: "triangle", label: "Triangle" },
  { id: "inverted-triangle", label: "Athletic V" },
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

/** @deprecated use getBodyShapeScreenOptions */
export const BODY_SHAPE_SCREEN_OPTIONS = WOMENSWEAR_SHAPES;
