import Link from "next/link";
import Image from "next/image";
import { TopBar } from "@/components/landing/topbar";
import { SeasonsCarousel } from "@/components/landing/seasons-carousel";
import { BeforeAfter } from "@/components/landing/before-after";
import { FeatureDemos } from "@/components/landing/feature-demos";
import { QuizCta } from "@/components/landing/quiz-cta";
import { PricingSection } from "@/components/landing/pricing-section";
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
            <div className="hero__intro">
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
              <p className="hero__tagline">
                Your AI stylist. Know what works for you.
              </p>
              <h1 className="hero__mast">
                Find the colors that make{" "}
                <span className="hero__mast-keep">
                  <span className="scr">you</span> glow
                </span>
              </h1>
            </div>
            <p className="hero__value">
              A short quiz about your natural coloring and style goals comes
              first. Add a selfie only if you want extra accuracy — then get
              your season, palette, and practical outfit guidance.
            </p>
            <div className="hero__cta">
              <Link href="/quiz" className="cta-mini">
                let&apos;s start
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
                no account needed to begin
              </span>
              <span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M2 8.5l4 4 8-9" />
                </svg>
                photos processed securely for analysis
              </span>
            </div>
            <ul className="hero__values" aria-label="What you get">
              <li className="hero__value-card">
                <span className="hero__value-card-title">color season</span>
                <span className="hero__value-card-desc">
                  warm, cool, light, deep — matched to you
                </span>
              </li>
              <li className="hero__value-card">
                <span className="hero__value-card-title">scan anything</span>
                <span className="hero__value-card-desc">
                  clothes, outfits, makeup, shopping finds
                </span>
              </li>
              <li className="hero__value-card">
                <span className="hero__value-card-title">wardrobe help</span>
                <span className="hero__value-card-desc">
                  what to wear, buy, or skip — with reasons
                </span>
              </li>
            </ul>
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
                <b>answer a quick style quiz</b>
                <small>wardrobe type, coloring, body shape, and what you need help with</small>
              </span>
            </Link>
            <Link href="/quiz" className="hstep">
              <span className="num">02</span>
              <span>
                <b>selfie optional — your call</b>
                <small>skip for a fast result, or upload one photo to boost accuracy</small>
              </span>
            </Link>
            <Link href="/quiz" className="hstep">
              <span className="num">03</span>
              <span>
                <b>get your palette and next steps</b>
                <small>season, best colors, what to wear near your face, and scan tools</small>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <FeatureDemos />

      <SeasonsCarousel />

      <QuizCta />

      <section id="reviews" className="reviews">
        <div className="wrap">
          <div className="reviews__head reveal">
            <h2>
              Find yourself in <span className="scr">your</span> colors
            </h2>
          </div>
          <div className="rgrid">
            {/* TODO(asset-replace): REVIEWS portraits are women-only stock — see lib/landing-data.ts. */}
            {REVIEWS.map((r) => (
              <figure key={r.role} className="review">
                <div className="review__photo">
                  <Image
                    src={r.photo}
                    alt={r.role}
                    fill
                    sizes="320px"
                    style={{ objectFit: "cover", objectPosition: "top center" }}
                  />
                  <span className="review__season-tag">{r.role}</span>
                </div>
                <p className="review__desc">{r.desc}</p>
              </figure>
            ))}
          </div>
        </div>
      </section>

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
                Quiz-first color analysis. Scan clothes. Shop what suits you.
              </p>
            </div>
            <div>
              <h5>product</h5>
              <a href="#free">free flow</a>
              <a href="#features">all features</a>
              <Link href="/quiz">quiz</Link>
              <Link href="/quiz">analysis</Link>
            </div>
            <div>
              <h5>company</h5>
              <a href="#waitlist">waitlist</a>
              <a href="#faq">faq</a>
              <a href="#faq">privacy</a>
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
