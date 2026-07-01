"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AddItemFlow } from "@/components/wardrobe/add-item-flow";
import { loadQuizProfile } from "@/lib/quiz/quiz";
import "../../app-shell.css";
import "../../quiz/quiz.css";

export default function WardrobeAddPage() {
  const router = useRouter();

  useEffect(() => {
    if (!loadQuizProfile()) {
      router.replace("/quiz");
    }
  }, [router]);

  return (
    <div className="app-shell">
      <header className="app-topbar glass-nav">
        <Link href="/" className="wordmark app-topbar__wordmark">
          palette<span className="me">me</span>
        </Link>
        <span className="app-chip">add item</span>
      </header>
      <AddItemFlow />
    </div>
  );
}
