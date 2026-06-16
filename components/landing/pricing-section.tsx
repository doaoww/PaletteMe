import Link from "next/link";
import { PRICING_TIERS } from "@/lib/pricing-tiers";

export function PricingSection() {
  return (
    <section id="pricing" className="pricing">
      <div className="wrap">
        <div className="how__head reveal">
          <div className="eyebrow">
            <span className="kicker">pricing</span>
          </div>
          <h2>
            Start free. <span className="scr">Upgrade</span> when you scan more.
          </h2>
          <p>
            Your color analysis is always free. Pay only when you want more
            clothing scans, exports, or early access to wardrobe tools.
          </p>
        </div>

        <div className="pricing__grid">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`pricing__card${tier.highlight ? " pricing__card--highlight" : ""}`}
            >
              {tier.badge ? (
                <span className="pricing__badge">{tier.badge}</span>
              ) : null}
              <p className="pricing__tier">{tier.name}</p>
              <p className="pricing__price">
                {tier.price}
                <span>{tier.period}</span>
              </p>
              <ul className="pricing__features">
                {tier.features.map((feature) => (
                  <li
                    key={feature.label}
                    className={feature.soon ? "pricing__feature pricing__feature--soon" : "pricing__feature"}
                  >
                    {feature.soon ? (
                      <span className="pricing__soon-tag">coming soon</span>
                    ) : (
                      <span className="pricing__check" aria-hidden>
                        ✓
                      </span>
                    )}
                    {feature.label}
                  </li>
                ))}
              </ul>
              {tier.cta.soon ? (
                <span className="pricing__cta pricing__cta--soon">coming soon</span>
              ) : tier.cta.href.startsWith("/") ? (
                <Link href={tier.cta.href} className="cta-mini pricing__cta">
                  {tier.cta.label}
                </Link>
              ) : (
                <a
                  href={tier.cta.href}
                  className="cta-mini pricing__cta"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tier.cta.label}
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
