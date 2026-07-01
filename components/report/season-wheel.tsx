"use client";

import { SEASON_PALETTES } from "@/lib/analysis/season-palettes";

type Props = {
  seasonId: string;
  photoUrl: string;
  percentage: number;
  isMain?: boolean;
};

function polarXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(
  cx: number, cy: number,
  outerR: number,
  startDeg: number, endDeg: number
): string {
  const s = polarXY(cx, cy, outerR, startDeg);
  const e = polarXY(cx, cy, outerR, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${outerR} ${outerR} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

export function SeasonWheel({ seasonId, photoUrl, percentage, isMain = false }: Props) {
  const season = SEASON_PALETTES.find(s => s.id === seasonId);
  const colors = season?.palette ?? ["#e0e0e0"];

  const size   = isMain ? 280 : 140;
  const cx     = size / 2;
  const cy     = size / 2;
  const outerR = size / 2;

  // Oval for the face — 55% wide, 65% tall of size
  const ovalRx = size * 0.275;
  const ovalRy = size * 0.325;

  const segCount  = colors.length;
  const segAngle  = 360 / segCount;
  const uid       = `sw-${seasonId}-${isMain ? "main" : "alt"}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`season-wheel${isMain ? " season-wheel--main" : ""}`}
      aria-label={season?.name ?? seasonId}
    >
      <defs>
        <clipPath id={`${uid}-face`}>
          <ellipse cx={cx} cy={cy} rx={ovalRx} ry={ovalRy} />
        </clipPath>
      </defs>

      {/* Colour wedges radiating from center */}
      {colors.map((hex, i) => (
        <path
          key={i}
          d={wedgePath(cx, cy, outerR, i * segAngle, (i + 1) * segAngle)}
          fill={hex}
        />
      ))}

      {/* White shadow ring behind face */}
      <ellipse
        cx={cx} cy={cy}
        rx={ovalRx + 4} ry={ovalRy + 4}
        fill="white"
        opacity={0.9}
      />

      {/* Face photo clipped to oval — only when a real URL is available */}
      {photoUrl && (
        <image
          href={photoUrl}
          x={cx - ovalRx}
          y={cy - ovalRy}
          width={ovalRx * 2}
          height={ovalRy * 2}
          clipPath={`url(#${uid}-face)`}
          preserveAspectRatio="xMidYMid slice"
        />
      )}

      {/* Percentage badge (main only) */}
      {isMain && (
        <text
          x={cx}
          y={size - 10}
          textAnchor="middle"
          fontSize={11}
          fontFamily="DM Sans, sans-serif"
          fill="white"
          fontWeight="600"
        >
          {percentage}% match
        </text>
      )}
    </svg>
  );
}
