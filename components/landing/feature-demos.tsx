import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { IMAGES } from "@/lib/demo-images";
import { PRODUCTS, SEASONS } from "@/lib/landing-data";
import { PricingSection } from "@/components/landing/pricing-section";

const PALETTE = SEASONS[2].palette;
const MATCHED_PICKS = PRODUCTS.slice(0, 3);

function FeatureRow({
  id,
  flip,
  num,
  title,
  desc,
  cta,
  children,
}: {
  id?: string;
  flip?: boolean;
  num: string;
  title: ReactNode;
  desc: string;
  cta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article id={id} className={`fdemo__strip${flip ? " fdemo__strip--flip" : ""}`}>
      <div className="wrap does__grid">
        <div className="does__copy">
          <span className="num">{num}</span>
          <h2>{title}</h2>
          <p>{desc}</p>
          {cta}
        </div>
        <div className="fdemo__media">{children}</div>
      </div>
    </article>
  );
}

export function FeatureDemos() {
  return (
    <>
      <section id="free" className="free-flow">
        <div className="wrap">
          <div className="how__head">
            <div className="eyebrow">
              <span className="kicker">how it works</span>
            </div>
            <h2>
              Quiz <span className="scr">first</span>, selfie if you want it.
            </h2>
            <p>
              Tell us about your coloring and style goals. We build your season
              from your answers — then you can confirm with a photo, scan
              clothes, and shop smarter.
            </p>
          </div>

          <div className="free-flow__grid">
            {/* TODO(asset-replace): flow-1/2/3 demo photos are women-only stock. */}
            <figure className="free-flow__step polaroid">
              <div className="free-flow__photo">
                <Image
                  src={IMAGES.flow1}
                  alt="Style quiz on mobile"
                  fill
                  sizes="280px"
                  style={{ objectFit: "cover", objectPosition: "top center" }}
                />
                <span className="scard__chip">
                  <span className="dot" style={{ background: "#4ade80" }} />
                  quiz
                </span>
              </div>
              <figcaption className="free-flow__cap">
                <span className="num">01</span>
                <span>Answer the style quiz</span>
              </figcaption>
            </figure>

            <figure className="free-flow__step polaroid">
              <div className="free-flow__photo free-flow__photo--analyze">
                <Image
                  src={IMAGES.flow2}
                  alt="AI analyzing your colors"
                  fill
                  sizes="280px"
                  style={{ objectFit: "cover", objectPosition: "top center" }}
                />
                <div className="fdemo__scan-grid" aria-hidden />
                <div className="fdemo__scan-line" aria-hidden />
                <div className="free-flow__result">
                  <span className="rn" style={{ fontSize: "1.1rem" }}>True Autumn</span>
                  <div className="rp">
                    {PALETTE.slice(0, 6).map((c) => (
                      <i key={c} style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <figcaption className="free-flow__cap">
                <span className="num">02</span>
                <span>Optional selfie confirmation</span>
              </figcaption>
            </figure>

            <figure className="free-flow__step polaroid">
              <div className="free-flow__photo">
                <Image
                  src={IMAGES.flow3}
                  alt="Picks matched to you"
                  fill
                  sizes="280px"
                  style={{ objectFit: "cover", objectPosition: "top center" }}
                />
              </div>
              <figcaption className="free-flow__cap">
                <span className="num">03</span>
                <span>Your palette and verdicts</span>
              </figcaption>
            </figure>
          </div>

          <div className="free-flow__cta">
            <Link href="/quiz" className="cta-mini">
              let&apos;s start
            </Link>
          </div>
        </div>
      </section>

      <PricingSection />

      <section id="features" className="fdemo">
        <div className="wrap">
          <div className="how__head">
            <div className="eyebrow">
              <span className="kicker">everything included</span>
            </div>
            <h2>
              Every <span className="scr">feature</span>, visualized
            </h2>
            <p>
              Analyze your colors, match your style, scan outfits, and shop
              pieces curated for your palette.
            </p>
          </div>
        </div>

        <FeatureRow
          id="analyze"
          num="01"
          title={<>Analyze your <span className="scr">colors</span></>}
          desc="Quiz answers build a color prior from undertone, depth, and contrast. Add a selfie later if you want the AI to double-check your season."
          cta={<Link href="/quiz" className="cta-mini">let&apos;s start</Link>}
        >
          <div className="fdemo__phone polaroid">
            <div className="fdemo__phone-screen">
              <div className="fdemo__analyze-photo">
                <Image src={IMAGES.analyzeDemo} alt="Selfie analysis" fill sizes="300px" style={{ objectFit: "cover" }} />
                <div className="fdemo__scan-grid" aria-hidden />
                <span className="scard__chip">
                  <span className="dot" style={{ background: "var(--pink)" }} />
                  analyzing…
                </span>
              </div>
              <div className="scard__panel">
                <div className="scard__head">
                  <span className="rk">your season</span>
                  <span className="rn">Soft Summer</span>
                </div>
                <div className="rp">
                  {PALETTE.map((c) => (
                    <i key={c} style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FeatureRow>

        <FeatureRow
          flip
          id="picks"
          num="02"
          title={<>Shop your <span className="scr">colors</span></>}
          desc="After analysis, get marketplace items scored against your palette — so every recommendation actually suits your coloring."
        >
          <div>
            <div className="free-flow__picks free-flow__picks--large">
              {MATCHED_PICKS.map((p) => (
                <a key={p.name} className="product" href={p.url} target="_blank" rel="noopener noreferrer">
                  <div className="product__img">
                    <div className="ba__img">
                      <Image src={p.image} alt={p.name} fill sizes="200px" style={{ objectFit: "cover" }} />
                    </div>
                    <span className="product__match">
                      <span className="dot" style={{ background: "var(--pink)" }} />
                      {p.match}% match
                    </span>
                  </div>
                  <div className="product__info">
                    <div>
                      <p className="nm">{p.name}</p>
                      <p className="br">{p.brand}</p>
                    </div>
                    <span className="pr">{p.price}</span>
                  </div>
                </a>
              ))}
            </div>
            <p className="fdemo__demo-note">Real picks from ASOS — matched to your palette</p>
          </div>
        </FeatureRow>

        <article className="fdemo__strip fdemo__next-strip">
          <div className="wrap">
            <div className="fdemo__next-head">
              <div className="eyebrow">
                <span className="kicker">style assistant</span>
              </div>
              <h2>Beyond your <span className="scr">season</span></h2>
              <p>
                Finish the quiz once — then use PaletteMe before you wear, buy,
                or add something to your wardrobe.
              </p>
            </div>
            <div className="fdemo__next-grid">
              {([
                { num: "03", title: "Scan anything", desc: "Photograph a garment, outfit, makeup shade, or shopping screenshot. Get a clear yes, maybe, or skip — with reasons." },
                { num: "04", title: "Wardrobe matchmaker", desc: "Add pieces you own. See what already works together and what to pair with a new buy." },
                { num: "05", title: "Shop your palette", desc: "Browse picks scored for your colors so you stop guessing in the dressing room." },
              ] as const).map((f) => (
                <div key={f.num} className="fdemo__next-card">
                  <span className="fdemo__next-num">{f.num}</span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
