import Image from "next/image";

const PREVIEW_CARDS = [
  {
    title: "Your color season",
    desc: "A clear palette direction based on your photo.",
    image: "/images/landing/report-preview/color-season.png",
  },
  {
    title: "Best colors",
    desc: "Shades that make your face look clearer and more balanced.",
    image: "/images/landing/report-preview/best-colors.png",
  },
  {
    title: "Hair color",
    desc: "Depth and undertone guidance for natural-looking changes.",
    image: "/images/landing/report-preview/hair-color.png",
  },
  {
    title: "Glasses",
    desc: "Frame shape, visual weight and color direction.",
    image: "/images/landing/report-preview/glasses.png",
  },
  {
    title: "Jewelry metals",
    desc: "Gold, silver, rose gold or mixed metals, explained.",
    image: "/images/landing/report-preview/jewelry-metals.png",
  },
  {
    title: "Makeup shades",
    desc: "Optional color suggestions where they are relevant.",
    image: "/images/landing/report-preview/makeup-shades.png",
  },
  {
    title: "Contrast",
    desc: "Whether softer or stronger contrast suits your features.",
    image: "/images/landing/report-preview/contrast.png",
  },
  {
    title: "Nails",
    desc: "Nail colors that harmonize with your personal palette.",
    image: "/images/landing/report-preview/nails.png",
  },
] as const;

export function SeasonsCarousel() {
  return (
    <section id="report-details" className="report-preview">
      <div className="wrap">
        <div className="report-preview__head">
          <div className="eyebrow">
            <span className="kicker">report preview</span>
          </div>
          <h2>Not just a color season. A full visual blueprint.</h2>
          <p>
            PaletteMe explains what works for you and why, so you stop guessing.
          </p>
        </div>

        <div className="report-preview__layout">
          <figure className="report-preview__hero-card polaroid">
            <div className="report-preview__hero-image">
              <Image
                src="/images/landing/report-preview/full-appearance-report.png"
                alt="PaletteMe appearance report preview"
                fill
                sizes="(max-width: 900px) 92vw, 560px"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
            <figcaption>
              <span>full appearance report</span>
              <small>colors, contrast, hair, glasses, metals, makeup, nails</small>
            </figcaption>
          </figure>

          <div className="report-preview__grid">
            {PREVIEW_CARDS.map((card) => (
              <article key={card.title} className="report-preview__card">
                <div className="report-preview__thumb">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 640px) 112px, 132px"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                </div>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
