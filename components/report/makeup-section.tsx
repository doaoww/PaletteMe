"use client";

import { useState } from "react";
import type { MakeupShade } from "@/lib/report/color-diagnostics-schema";
import "./makeup-section.css";

type ShadePickerProps = {
  shades: MakeupShade[];
  label: string;
};

function ShadePicker({ shades, label }: ShadePickerProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = shades[activeIdx];

  return (
    <div className="shade-picker">
      <p className="shade-picker__label">{label}</p>
      <div className="shade-picker__circles">
        {shades.map((s, i) => (
          <button
            key={s.hex}
            className={`shade-picker__circle${i === activeIdx ? " shade-picker__circle--active" : ""}`}
            style={{ background: s.hex }}
            onClick={() => setActiveIdx(i)}
            aria-label={s.name}
            title={s.name}
          />
        ))}
      </div>
      {active && (
        <div className="shade-picker__info">
          <p className="shade-picker__name">{active.name}</p>
          <p className="shade-picker__explanation">{active.explanation}</p>
        </div>
      )}
    </div>
  );
}

type Props = {
  makeup: {
    blush: MakeupShade[];
    lips: MakeupShade[];
    eyeshadowDay: MakeupShade[];
    eyeshadowEvening: MakeupShade[];
  };
};

export function MakeupSection({ makeup }: Props) {
  return (
    <div className="makeup-section">
      <ShadePicker shades={makeup.blush} label="blush" />
      <ShadePicker shades={makeup.lips} label="lips" />
      <div className="makeup-section__eyes">
        <p className="makeup-section__eyes-title">eyes</p>
        <ShadePicker shades={makeup.eyeshadowDay} label="everyday" />
        <ShadePicker shades={makeup.eyeshadowEvening} label="evening" />
      </div>
    </div>
  );
}
