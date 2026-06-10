import { QuizFlow } from "@/components/quiz/quiz-flow";
import "./quiz.css";

export const metadata = {
  title: "Color Quiz — PaletteMe",
  description:
    "Answer three quick questions about your coloring before your AI seasonal analysis.",
};

export default function QuizPage() {
  return <QuizFlow />;
}
