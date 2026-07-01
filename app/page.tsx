import Link from "next/link";
import Image from "next/image";
import { TopBar } from "@/components/landing/topbar";
import { SeasonsCarousel } from "@/components/landing/seasons-carousel";
import { FeatureDemos } from "@/components/landing/feature-demos";
import { ReportDrapeDemo } from "@/components/landing/report-drape-demo";
import { QuizCta } from "@/components/landing/quiz-cta";
import { PricingSection } from "@/components/landing/pricing-section";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { MobileActionBar } from "@/components/landing/mobile-action-bar";
import { FAQS } from "@/lib/shared/landing-data";
import "./landing.css";

const HERO_TRUST_ITEMS = [
  "One photo, full report",
  "Twelve seasonal profiles",
  "Results in minutes",
  "Private & secure",
] as const;

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <MobileActionBar />
      <TopBar />

      <section className="modern-hero">
        <div className="modern-hero__inner">
          <div className="modern-hero__copy">
            <p className="modern-hero__kicker">AI APPEARANCE REPORT</p>
            <h1 className="modern-hero__headline">
              See what <em>actually</em>
              <span>works on you.</span>
            </h1>
            <p className="modern-hero__subtitle">
              Upload one clear photo and get a personal report for your colors,
              makeup, hair, glasses, jewelry and style details.
            </p>
            <div className="modern-hero__actions">
              <Link href="/style-setup" className="modern-hero__button">
                <span>Upload my photo</span>
                <span className="modern-hero__button-icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10" />
                    <path d="M9 4l4 4-4 4" />
                  </svg>
                </span>
              </Link>
              <p className="modern-hero__microcopy">
                Private analysis · takes less than 30 seconds
              </p>
            </div>
          </div>

          <div className="modern-hero__visual">
            <div className="hero-visual-stage" aria-label="PaletteMe appearance recommendations preview">
              <div className="hero-oval" aria-hidden="true" />

              <div className="hero-portrait-frame">
                <Image
                  src="/images/landing/hero-girl-portrait.png"
                  alt="Portrait used for a PaletteMe appearance report preview"
                  fill
                  priority
                  sizes="(max-width: 768px) 88vw, (max-width: 1100px) 52vw, 38vw"
                  className="hero-portrait"
                />
              </div>

              <article className="floating-card floating-card--hair">
                <div>
                  <p>Best Hair</p>
                  <strong>Soft Brunette</strong>
                </div>
                <div className="floating-card__media floating-card__media--hair">
                  <Image
                    src="/images/landing/hero-card-hair-clean.png"
                    alt=""
                    fill
                    sizes="180px"
                    className="floating-card__asset"
                  />
                </div>
              </article>

              <article className="floating-card floating-card--palette">
                <div>
                  <p>Soft Summer</p>
                  <strong>best colors</strong>
                </div>
                <div className="hero-palette" aria-label="Soft Summer palette">
                  {["#E6A1AC", "#D79AB5", "#BFCBDF", "#B9CDD1", "#B7C3B1", "#7D879F"].map((color) => (
                    <span key={color} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </article>

              <article className="floating-card floating-card--blush">
                <div>
                  <p>Best Blush</p>
                  <strong>Dusty Rose</strong>
                </div>
                <div className="floating-card__media floating-card__media--blush">
                  <Image
                    src="/images/landing/hero-card-blush-clean.png"
                    alt=""
                    fill
                    sizes="170px"
                    className="floating-card__asset"
                  />
                </div>
              </article>

              <article className="floating-card floating-card--metals">
                <div>
                  <p>Best Metals</p>
                  <strong>Silver</strong>
                </div>
                <div className="floating-card__media floating-card__media--metals">
                  <Image
                    src="/images/landing/hero-card-metals-clean.png"
                    alt=""
                    fill
                    sizes="190px"
                    className="floating-card__asset"
                  />
                </div>
              </article>

              <article className="floating-card floating-card--glasses">
                <div>
                  <p>Best Glasses</p>
                  <strong>Soft Oval</strong>
                </div>
                <div className="floating-card__media floating-card__media--glasses">
                  <Image
                    src="/images/landing/hero-card-glasses-clean.png"
                    alt=""
                    fill
                    sizes="180px"
                    className="floating-card__asset"
                  />
                </div>
              </article>

              <article className="floating-card floating-card--style">
                <div>
                  <p>Your Style</p>
                  <strong>Soft Minimal</strong>
                </div>
                <div className="floating-card__media floating-card__media--style">
                  <Image
                    src="/images/landing/hero-card-style-clean.png"
                    alt=""
                    fill
                    sizes="180px"
                    className="floating-card__asset"
                  />
                </div>
              </article>

            </div>
          </div>
        </div>

        <div className="hero-trust-strip" aria-label="PaletteMe report highlights">
          <ul className="hero-trust-strip__list">
            {HERO_TRUST_ITEMS.map((item) => (
              <li key={item} className="hero-trust-strip__item">
                <span className="hero-trust-strip__spark" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="guessing-section" aria-labelledby="guessing-heading">
        <div className="guessing-section__inner">
          <h2 id="guessing-heading">
            Most of us are guessing. Buying shades that almost work, wearing
            colours that quietly <span>drain us.</span>
          </h2>
          <p>
            Your face already holds the answer &mdash; a precise undertone,
            depth and contrast. PaletteMe reads it and tells you exactly what
            to wear, instead of leaving you to guess.
          </p>
        </div>
      </section>

      <FeatureDemos />

      <ReportDrapeDemo />

      <SeasonsCarousel />

      <QuizCta />

      <PricingSection />

      <section id="faq" className="faq">
        <div className="wrap">
          <div className="faq__head reveal">
            <div className="eyebrow">
              <span className="kicker">faq</span>
            </div>
            <h2>
              Questions, <span className="scr">answered</span>
            </h2>
          </div>
          <div className="faq__list">
            {FAQS.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <WaitlistForm />

      <footer className="foot">
        <div className="wrap">
          <p className="foot__mast wordmark">
            palette<span className="me">me</span>
          </p>
          <div className="foot__grid">
            <div>
              <p className="blurb">
                AI appearance analysis from one photo. See what suits your
                face, coloring, contrast and features.
              </p>
            </div>
            <div>
              <h5>product</h5>
              <a href="#free">how it works</a>
              <a href="#features">what you get</a>
              <a href="#report-preview">report preview</a>
              <Link href="/sample-report">sample report</Link>
              <Link href="/style-setup">upload photo</Link>
            </div>
            <div>
              <h5>company</h5>
              <a href="#faq">faq</a>
              <Link href="/privacy">privacy</Link>
            </div>
          </div>
          <div className="foot__bottom">
            <span>Copyright 2026 PaletteMe</span>
            <span>made for clearer appearance decisions</span>
          </div>
        </div>
      </footer>
    </>
  );
}
