import Link from "next/link";
import { TopBar } from "@/components/landing/topbar";
import { SeasonsCarousel } from "@/components/landing/seasons-carousel";
import { BeforeAfter } from "@/components/landing/before-after";
import { FeatureDemos } from "@/components/landing/feature-demos";
import { QuizCta } from "@/components/landing/quiz-cta";
import { SocialProof } from "@/components/landing/social-proof";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { MobileActionBar } from "@/components/landing/mobile-action-bar";
import { FAQS, REVIEWS } from "@/lib/landing-data";
import "./landing.css";

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <MobileActionBar />
      <TopBar />

      <section className="hero">
        <div className="hero__main">
          <div className="hero__copy">
            <div className="hero__eyebrow">
              <span className="kicker">personal color analysis</span>
              <span className="hero__live">
                <span className="pulse" />
                free · 60 seconds
              </span>
            </div>
            <p className="hero__logo wordmark">
              palette<span className="me">me</span>
            </p>
            <h1 className="hero__mast">
              Find the colors that make <span className="scr">you</span> glow
            </h1>
            <p className="hero__value">
              Take a quick style quiz, upload a selfie — AI reveals your exact
              seasonal palette with outfit picks matched to your coloring.
            </p>
            <div className="hero__cta">
              <Link href="/quiz" className="cta-mini">
                start color quiz
              </Link>
              <a href="#free" className="cta-mini cta-ghost">
                see how it works
              </a>
            </div>
            <div className="hero__note">
              <span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M2 8.5l4 4 8-9" />
                </svg>
                photo never leaves your device
              </span>
              <span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M2 8.5l4 4 8-9" />
                </svg>
                no account needed
              </span>
            </div>
          </div>
          <div className="hero__preview">
            <BeforeAfter />
          </div>
        </div>

        <div className="hero__foot">
          <div className="hero__steps">
            <Link href="/quiz" className="hstep">
              <span className="num">01</span>
              <span>
                <b>take the color quiz</b>
                <small>5 questions about your natural coloring and style goals</small>
              </span>
            </Link>
            <Link href="/dashboard" className="hstep">
              <span className="num">02</span>
              <span>
                <b>upload your selfie</b>
                <small>ai reads undertone, depth and contrast in seconds</small>
              </span>
            </Link>
            <a href="#waitlist" className="hstep">
              <span className="num">03</span>
              <span>
                <b>get your full palette</b>
                <small>8 core colors + curated outfit picks matched to you</small>
              </span>
            </a>
          </div>
        </div>
      </section>

      <SocialProof />

      <FeatureDemos />

      <SeasonsCarousel />

      <QuizCta />

      <section id="reviews" className="reviews">
        <div className="wrap">
          <div className="reviews__head reveal">
            <div className="eyebrow">
              <span className="kicker">reviews</span>
            </div>
            <h2>
              What they&apos;re <span className="scr">saying</span>
            </h2>
          </div>
          <div className="rgrid">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="review">
                <span className="stars">★★★★★</span>
                <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
                <figcaption>
                  <div className="who">
                    <b>{r.name}</b>
                    <small>{r.role}</small>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

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
                Upload a selfie. Get your colors. Look your best.
              </p>
            </div>
            <div>
              <h5>product</h5>
              <a href="#free">free flow</a>
              <a href="#features">all features</a>
              <Link href="/quiz">quiz</Link>
              <Link href="/dashboard">analysis</Link>
            </div>
            <div>
              <h5>company</h5>
              <a href="#waitlist">waitlist</a>
              <a href="#faq">faq</a>
              <a href="#">privacy</a>
            </div>
          </div>
          <div className="foot__bottom">
            <span>© 2026 PaletteMe</span>
            <span>made with color science</span>
          </div>
        </div>
      </footer>
    </>
  );
}
