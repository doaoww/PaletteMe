import { ScanFlow } from "@/components/scan/scan-flow";
import "../app-shell.css";
import "../quiz/quiz.css";

export const metadata = {
  title: "Scan — PaletteMe",
  description: "Scan clothing, outfits, makeup, or shopping finds against your palette.",
};

export default function ScanPage() {
  return <ScanFlow />;
}
