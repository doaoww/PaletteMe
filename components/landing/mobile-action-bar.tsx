"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function MobileActionBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>(".modern-hero, .hero");
      const waitlist = document.getElementById("waitlist");
      const pricing = document.getElementById("pricing");
      const reportPreview = document.getElementById("report-preview");
      if (!hero) return;

      const heroBottom = hero.getBoundingClientRect().bottom;
      const pastHero = heroBottom < window.innerHeight * 0.45;

      let nearWaitlist = false;
      if (waitlist) {
        const wTop = waitlist.getBoundingClientRect().top;
        nearWaitlist = wTop < window.innerHeight * 0.92;
      }

      let nearPricing = false;
      if (pricing) {
        const pRect = pricing.getBoundingClientRect();
        nearPricing = pRect.top < window.innerHeight * 0.88 && pRect.bottom > window.innerHeight * 0.18;
      }

      let nearReportPreview = false;
      if (reportPreview) {
        const rRect = reportPreview.getBoundingClientRect();
        nearReportPreview = rRect.top < window.innerHeight * 0.88 && rRect.bottom > window.innerHeight * 0.18;
      }

      setShow(pastHero && !nearWaitlist && !nearPricing && !nearReportPreview);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`mob-bar${show ? " mob-bar--show" : ""}`} aria-hidden={!show}>
      <Link href="/style-setup" className="mob-bar__btn mob-bar__btn--primary">
        upload photo
      </Link>
      <a href="#report-preview" className="mob-bar__btn mob-bar__btn--ghost">
        report preview
      </a>
    </div>
  );
}
