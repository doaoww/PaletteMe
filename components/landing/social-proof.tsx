import Image from "next/image";
import Link from "next/link";
import { SOCIAL_PROOF, SEASONS } from "@/lib/landing-data";

export function SocialProof() {
  return (
    <section className="sproof">
      <div className="wrap">
        <div className="sproof__head">
          <div className="eyebrow">
            <span className="kicker">transformations</span>
          </div>
          <h2>
            Real people. <span className="scr">Real</span> results.
          </h2>
          <p>
            One selfie. 60 seconds. They went from guessing to knowing — and
            their wardrobes changed overnight.
          </p>
        </div>

        <div className="sproof__grid">
          {SOCIAL_PROOF.map((person) => {
            const season = SEASONS.find((s) => s.id === person.seasonId) ?? SEASONS[0];
            return (
              <article key={person.name} className="sproof__card">
                <div className="sproof__photo-wrap polaroid">
                  <div className="sproof__photo">
                    <Image
                      src={person.image}
                      alt={`${person.name} — ${person.subSeason}`}
                      fill
                      sizes="(max-width: 840px) 380px, 420px"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="sproof__overlay">
                      <span className="sproof__season">{season.name}</span>
                      <span className="sproof__sub">{person.subSeason}</span>
                    </div>
                  </div>
                  <div className="sproof__pal">
                    {season.palette.map((c) => (
                      <i key={c} style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <blockquote className="sproof__quote">
                  &ldquo;{person.quote}&rdquo;
                </blockquote>
                <span className="sproof__name">{person.name}</span>
              </article>
            );
          })}
        </div>

        <div className="sproof__cta">
          <Link href="/quiz" className="cta-mini">
            discover your season
          </Link>
          <p className="sproof__privacy">
            Your photo is analyzed and deleted immediately — never stored or shared.
          </p>
        </div>
      </div>
    </section>
  );
}
