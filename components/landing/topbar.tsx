"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/supabase";

export function TopBar() {
  const [solid, setSolid] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSignedIn, setIsSignedIn] = useState(false);

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

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsSignedIn(!!user);
    });
  }, []);

  return (
    <>
      <div className="progress" style={{ transform: `scaleX(${progress / 100})` }} />
      <header className={`topbar${solid ? " solid" : ""}`}>
        <Link href="/" className="wordmark brand">
          palette<span className="me">me</span>
        </Link>
        <nav className="navlinks">
          <a href="#free">how it works</a>
          <a href="#features">what you get</a>
          <a href="#report-preview">report preview</a>
          <a href="#pricing">pricing</a>
          <a href="#faq">faq</a>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isSignedIn ? (
            <Link href="/profile" className="cta-mini cta-ghost">
              my palette
            </Link>
          ) : (
            <Link href="/login" className="cta-mini cta-ghost">
              sign in
            </Link>
          )}
          <Link href="/style-setup" className="cta-mini topbar__cta-desktop">
            upload my photo
          </Link>
        </div>
      </header>
    </>
  );
}
