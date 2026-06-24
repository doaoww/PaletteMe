"use client";

import type { ReactNode } from "react";

type LookLabBlockProps = {
  title: string;
  children: ReactNode;
};

export function LookLabBlock({ title, children }: LookLabBlockProps) {
  return (
    <section className="look-lab-block">
      <h3 className="look-lab-block__title">{title}</h3>
      <div className="look-lab-block__cards">{children}</div>
    </section>
  );
}
