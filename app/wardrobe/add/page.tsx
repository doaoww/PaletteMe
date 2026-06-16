import Link from "next/link";
import { AddItemFlow } from "@/components/wardrobe/add-item-flow";
import "../../app-shell.css";
import "../../quiz/quiz.css";

export const metadata = {
  title: "Add item — PaletteMe",
  description: "Photograph a wardrobe piece and save it to your closet.",
};

export default function WardrobeAddPage() {
  return (
    <div className="app-shell">
      <header className="app-topbar glass-nav">
        <Link href="/wardrobe" className="wordmark app-topbar__wordmark">
          palette<span className="me">me</span>
        </Link>
        <span className="app-chip">add item</span>
      </header>
      <AddItemFlow />
    </div>
  );
}
