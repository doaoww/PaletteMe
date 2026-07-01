import type { ReactNode } from "react";
import "./report-block.css";

type Props = {
  num: string;        // "01"
  title: string;      // "Discover Your Colors"
  subtitle?: string;
  children: ReactNode;
};

export function ReportBlock({ num, title, subtitle, children }: Props) {
  return (
    <section className="report-block">
      <div className="report-block__header" data-num={num}>
        <p className="report-block__num">{num}</p>
        <h2 className="report-block__title">{title}</h2>
        {subtitle && <p className="report-block__subtitle">{subtitle}</p>}
      </div>
      <div className="report-block__body">{children}</div>
    </section>
  );
}
