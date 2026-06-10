"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function TopBar() {
  const [solid, setSolid] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 80);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (y / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="progress" style={{ width: `${progress}%` }} />
      <header className={`topbar${solid ? " solid" : ""}`}>
        <Link href="/" className="wordmark brand">
          palette<span className="me">me</span>
        </Link>
        <nav className="navlinks">
          <a href="#free">how it works</a>
          <a href="#features">features</a>
          <Link href="/quiz">quiz</Link>
          <a href="#waitlist">waitlist</a>
          <a href="#faq">faq</a>
        </nav>
        <Link href="/quiz" className="cta-mini topbar__cta-desktop">
          try it free
        </Link>
      </header>
    </>
  );
}
