"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function MobileActionBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>(".hero");
      const waitlist = document.getElementById("waitlist");
      if (!hero) return;

      const heroBottom = hero.getBoundingClientRect().bottom;
      const pastHero = heroBottom < window.innerHeight * 0.45;

      let nearWaitlist = false;
      if (waitlist) {
        const wTop = waitlist.getBoundingClientRect().top;
        nearWaitlist = wTop < window.innerHeight * 0.92;
      }

      setShow(pastHero && !nearWaitlist);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`mob-bar${show ? " mob-bar--show" : ""}`} aria-hidden={!show}>
      <Link href="/quiz" className="mob-bar__btn mob-bar__btn--primary">
        let&apos;s start
      </Link>
      <a href="#waitlist" className="mob-bar__btn mob-bar__btn--ghost">
        join waitlist
      </a>
    </div>
  );
}
