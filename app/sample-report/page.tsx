import type { Metadata } from "next";

import { ReportView } from "@/components/report/report-view";
import {
  SAMPLE_ANALYSIS,
  SAMPLE_REPORT_IMAGES,
  SAMPLE_REPORT_PHOTO,
} from "@/lib/report/sample-analysis";

import "@/components/report/report.css";
import "./sample-report.css";

export const metadata: Metadata = {
  title: "Sample report | PaletteMe",
  description:
    "Preview a pre-generated PaletteMe appearance report before uploading your own photo.",
};

export default function SampleReportPage() {
  const totalSlots = Object.keys(SAMPLE_REPORT_IMAGES).length;

  return (
    <main className="sample-report-page">
      <section className="sample-report-shell" aria-label="Sample PaletteMe appearance report">
        <ReportView
          analysis={SAMPLE_ANALYSIS}
          photoDataUrl={SAMPLE_REPORT_PHOTO}
          images={SAMPLE_REPORT_IMAGES}
          totalSlots={totalSlots}
          wardrobeType="woman"
          reportSections={[]}
        />
      </section>
    </main>
  );
}
