import Link from "next/link";
import { PRICING_TIERS } from "@/lib/billing/pricing-tiers";

export function PricingSection() {
  return (
    <section id="pricing" className="pricing">
      <div className="wrap">
        <div className="pricing__head">
          <h2>Start free. Go deeper for $5.99.</h2>
        </div>

        <div className="pricing__grid">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`pricing__card pricing__card--${tier.id}${tier.highlight ? " pricing__card--highlight" : ""}`}
            >
              {tier.badge ? (
                <span className="pricing__badge">{tier.badge}</span>
              ) : null}
              <p className="pricing__tier">{tier.name}</p>
              <p className="pricing__price">
                {tier.price}
                <span>{tier.period}</span>
              </p>
              <p className="pricing__desc">{tier.description}</p>
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
