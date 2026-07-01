import { redirect } from "next/navigation";

export const metadata = {
  title: "Style Quiz — PaletteMe",
};

export default function QuizPage() {
  redirect("/style-setup");
}
