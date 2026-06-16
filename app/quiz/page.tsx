import { QuizFlow } from "@/components/quiz/quiz-flow";
import "./quiz.css";

export const metadata = {
  title: "Style Quiz — PaletteMe",
  description:
    "Find your color type, body silhouette, and style direction — then optionally confirm with a selfie.",
};

export default function QuizPage() {
  return <QuizFlow />;
}
