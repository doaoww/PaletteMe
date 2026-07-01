"use client";

import Link from "next/link";
import { PRICING_TIERS } from "@/lib/billing/pricing-tiers";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ScanPaywallModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="scan-paywall" role="dialog" aria-modal="true" aria-labelledby="scan-paywall-title">
      <button type="button" className="scan-paywall__backdrop" aria-label="Close" onClick={onClose} />
      <div className="scan-paywall__panel">
        <button type="button" className="scan-paywall__close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <p className="scan-paywall__kicker">weekly scans used</p>
        <h2 id="scan-paywall-title" className="scan-paywall__title">
          Keep scanning with more credits
        </h2>
        <p className="scan-paywall__sub">
          Your free clothing scans refresh each week. Upgrade when you want more checks before you buy or wear.
        </p>

        <div className="scan-paywall__grid">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`scan-paywall__card${tier.highlight ? " scan-paywall__card--highlight" : ""}`}
            >
              <p className="scan-paywall__tier">{tier.name}</p>
              <p className="scan-paywall__price">
                {tier.price}
                <span>{tier.period}</span>
              </p>
              <ul className="scan-paywall__features">
                {tier.features.map((feature) => (
                  <li
                    key={feature.label}
                    className={feature.soon ? "scan-paywall__feature scan-paywall__feature--soon" : "scan-paywall__feature"}
                  >
                    {feature.soon ? <span className="scan-paywall__soon">soon</span> : <span aria-hidden>✓</span>}
                    {feature.label}
                  </li>
                ))}
              </ul>
              {tier.cta.soon ? (
                <span className="scan-paywall__cta scan-paywall__cta--soon">coming soon</span>
              ) : tier.cta.href.startsWith("/") ? (
                <Link href={tier.cta.href} className="scan-paywall__cta" onClick={onClose}>
                  {tier.cta.label}
                </Link>
              ) : (
                <a
                  href={tier.cta.href}
                  className="scan-paywall__cta"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                >
                  {tier.cta.label}
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
