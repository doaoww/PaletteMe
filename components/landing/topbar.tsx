"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function TopBar() {
  const [solid, setSolid] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

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
        <button
          className="hamburger"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="mobile-menu__top">
            <Link href="/" className="wordmark" style={{ fontSize: "1.4rem" }} onClick={close}>
              palette<span className="me">me</span>
            </Link>
            <button className="mobile-menu__close" onClick={close} aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="mobile-menu__nav">
            <a href="#free" onClick={close}>how it works</a>
            <a href="#features" onClick={close}>features</a>
            <Link href="/quiz" onClick={close}>quiz</Link>
            <a href="#waitlist" onClick={close}>waitlist</a>
            <a href="#faq" onClick={close}>faq</a>
          </nav>

          <div className="mobile-menu__foot">
            <Link href="/quiz" className="cta-mini" style={{ display: "block", textAlign: "center" }} onClick={close}>
              try it free
            </Link>
            <p className="mobile-menu__note">Free · No signup required</p>
          </div>
        </div>
      )}
    </>
  );
}
