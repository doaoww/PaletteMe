import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { IMAGES } from "@/lib/demo-images";
import { PRODUCTS, SEASONS } from "@/lib/landing-data";

const PALETTE = SEASONS[1].palette;
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
              Selfie in. <span className="scr">Palette</span> out.
            </h2>
            <p>
              Upload a photo, AI finds your seasonal colors, and you get curated
              marketplace picks matched to your type.
            </p>
          </div>

          <div className="free-flow__grid">
            <figure className="free-flow__step polaroid">
              <div className="free-flow__photo">
                <Image
                  src={IMAGES.selfie}
                  alt="Upload your selfie"
                  fill
                  sizes="280px"
                  style={{ objectFit: "cover" }}
                />
                <span className="scard__chip">
                  <span className="dot" style={{ background: "#4ade80" }} />
                  upload
                </span>
              </div>
              <figcaption className="free-flow__cap">
                <span className="num">01</span>
                <span>Upload a clear selfie</span>
              </figcaption>
            </figure>

            <figure className="free-flow__step polaroid">
              <div className="free-flow__photo free-flow__photo--analyze">
                <Image
                  src={IMAGES.selfieAlt}
                  alt="AI analyzing your colors"
                  fill
                  sizes="280px"
                  style={{ objectFit: "cover" }}
                />
                <div className="fdemo__scan-grid" aria-hidden />
                <div className="fdemo__scan-line" aria-hidden />
                <div className="free-flow__result">
                  <span className="rn" style={{ fontSize: "1.1rem" }}>Soft Summer</span>
                  <div className="rp">
                    {PALETTE.slice(0, 6).map((c) => (
                      <i key={c} style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <figcaption className="free-flow__cap">
                <span className="num">02</span>
                <span>AI reads your coloring</span>
              </figcaption>
            </figure>

            <figure className="free-flow__step polaroid">
              <div className="free-flow__picks">
                {MATCHED_PICKS.map((p) => (
                  <div key={p.name} className="free-flow__pick">
                    <div className="free-flow__pick-img">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="120px"
                        style={{ objectFit: "cover" }}
                      />
                      <span className="product__match">
                        <span className="dot" style={{ background: "var(--pink)" }} />
                        {p.match}%
                      </span>
                    </div>
                    <p className="free-flow__pick-name">{p.name}</p>
                  </div>
                ))}
              </div>
              <figcaption className="free-flow__cap">
                <span className="num">03</span>
                <span>Picks matched to you</span>
              </figcaption>
            </figure>
          </div>

          <div className="free-flow__cta">
            <Link href="/quiz" className="cta-mini">
              start color quiz
            </Link>
          </div>
        </div>
      </section>

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
          desc="AI reads undertone, contrast, and depth from your selfie — then assigns your exact seasonal type with 8 core swatches."
          cta={<Link href="/quiz" className="cta-mini">start color quiz</Link>}
        >
          <div className="fdemo__phone polaroid">
            <div className="fdemo__phone-screen">
              <div className="fdemo__analyze-photo">
                <Image src={IMAGES.selfie} alt="Selfie analysis" fill sizes="300px" style={{ objectFit: "cover" }} />
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
            <div className="free-flow__picks free-flow__picks--large" style={{ pointerEvents: "none" }}>
              {MATCHED_PICKS.map((p) => (
                <article key={p.name} className="product" style={{ cursor: "default" }}>
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
                </article>
              ))}
            </div>
            <p className="fdemo__demo-note">Real picks matched to your palette — unlocks with early access</p>
          </div>
        </FeatureRow>

        <article className="fdemo__strip fdemo__next-strip">
          <div className="wrap">
            <div className="fdemo__next-head">
              <div className="eyebrow">
                <span className="kicker">coming soon</span>
              </div>
              <h2>More <span className="scr">features</span> on the way</h2>
              <p>Join early access — these unlock first for waitlist members.</p>
            </div>
            <div className="fdemo__next-grid">
              {([
                { num: "03", title: "Style match", desc: "Score any outfit against your palette — know instantly if it works for your coloring." },
                { num: "04", title: "Outfit scanner", desc: "Point your camera at any garment for a live verdict. Suits you or doesn't." },
                { num: "05", title: "Marketplace", desc: "Browse products filtered and scored for your exact palette — shop only what truly suits you." },
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
