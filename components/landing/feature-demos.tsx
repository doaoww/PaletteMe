import Image from "next/image";
import Link from "next/link";
import { IMAGES } from "@/lib/shared/demo-images";

const REPORT_MODULES = [
  {
    title: "Color Season",
    desc: "Find your seasonal palette and best color direction.",
  },
  {
    title: "Best Colors",
    desc: "See the shades that make your face look clearer and more balanced.",
  },
  {
    title: "Contrast Level",
    desc: "Understand whether softer or stronger contrast works better for you.",
  },
  {
    title: "Hair Colors",
    desc: "Discover hair colors that match your natural depth and undertone.",
  },
  {
    title: "Haircuts",
    desc: "Get haircut suggestions that work with your face shape and proportions.",
  },
  {
    title: "Glasses",
    desc: "Find frame shapes, weights and colors that balance your features.",
  },
  {
    title: "Jewelry Metals",
    desc: "See whether gold, silver, rose gold or mixed metals suit you best.",
  },
  {
    title: "Makeup Shades",
    desc: "Personalized blush, lipstick and makeup color suggestions where applicable.",
  },
  {
    title: "Nails",
    desc: "Find nail colors that harmonize with your palette.",
  },
] as const;

export function FeatureDemos() {
  return (
    <>
      <section id="free" className="free-flow">
        <div className="wrap">
          <div className="how__head">
            <div className="eyebrow">
              <span className="kicker">how it works</span>
            </div>
            <h2>How PaletteMe works</h2>
            <p>
              Upload one clear photo. PaletteMe analyzes your face, coloring,
              contrast and visual harmony, then turns it into a practical report.
            </p>
          </div>

          <div className="free-flow__grid">
            <figure className="free-flow__step polaroid">
              <div className="free-flow__photo">
                <Image
                  src={IMAGES.flow1}
                  alt="Upload one clear front-facing photo"
                  fill
                  sizes="280px"
                  style={{ objectFit: "cover", objectPosition: "top center" }}
                />
                <span className="scard__chip">
                  <span className="dot" style={{ background: "#4ade80" }} />
                  photo
                </span>
              </div>
              <figcaption className="free-flow__cap">
                <span className="num">01</span>
                <span>
                  Upload one photo
                  <small>Use a clear, front-facing photo. No complicated setup needed.</small>
                </span>
              </figcaption>
            </figure>

            <figure className="free-flow__step polaroid">
              <div className="free-flow__photo free-flow__photo--analyze">
                <Image
                  src={IMAGES.flow2}
                  alt="AI analyzing coloring, contrast and facial features"
                  fill
                  sizes="280px"
                  style={{ objectFit: "cover", objectPosition: "top center" }}
                />
                <div className="fdemo__scan-grid" aria-hidden />
                <div className="fdemo__scan-line" aria-hidden />
                <div className="free-flow__result">
                  <span className="rk">analysis</span>
                  <span className="rn" style={{ fontSize: "1rem" }}>features + color</span>
                </div>
              </div>
              <figcaption className="free-flow__cap">
                <span className="num">02</span>
                <span>
                  AI analyzes your appearance
                  <small>PaletteMe looks at coloring, contrast, features and harmony.</small>
                </span>
              </figcaption>
            </figure>

            <figure className="free-flow__step polaroid">
              <div className="free-flow__photo free-flow__photo--report">
                <Image
                  src="/images/landing/report-preview/how-works-sample-report.png"
                  alt="Personalized appearance report preview"
                  fill
                  sizes="280px"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                />
              </div>
              <figcaption className="free-flow__cap">
                <span className="num">03</span>
                <span>
                  Get your full report
                  <small>See what suits you with explanations, not generic labels.</small>
                </span>
              </figcaption>
            </figure>
          </div>

          <div className="free-flow__cta">
            <Link href="/style-setup" className="cta-mini">
              upload my photo
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="fdemo report-modules">
        <div className="wrap">
          <div className="how__head">
            <div className="eyebrow">
              <span className="kicker">what you get</span>
            </div>
            <h2>Your full appearance report</h2>
            <p>
              Everything is personalized to your face, coloring and features.
            </p>
          </div>

          <div className="fdemo__next-grid report-modules__grid">
            {REPORT_MODULES.map((module, index) => (
              <article key={module.title} className="fdemo__next-card report-modules__card">
                <span className="fdemo__next-num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{module.title}</h3>
                <p>{module.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
