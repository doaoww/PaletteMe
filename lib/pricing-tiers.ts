export type PricingFeature = {
  label: string;
  soon: boolean;
};

export type PricingTier = {
  id: "free" | "starter" | "pro";
  name: string;
  price: string;
  period: string;
  badge: string | null;
  highlight: boolean;
  features: PricingFeature[];
  cta: {
    label: string;
    href: string;
    soon: boolean;
  };
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    badge: "start here",
    highlight: false,
    features: [
      { label: "color analysis", soon: false },
      { label: "3 clothing scans", soon: false },
    ],
    cta: { label: "let's start", href: "/quiz", soon: false },
  },
  {
    id: "starter",
    name: "Starter",
    price: "$4.99",
    period: "one-time",
    badge: null,
    highlight: true,
    features: [
      { label: "20 clothing scans", soon: false },
      { label: "full results export", soon: false },
    ],
    cta: {
      label: "get starter",
      href: process.env.NEXT_PUBLIC_PAID_REPORT_URL ?? "",
      soon: !process.env.NEXT_PUBLIC_PAID_REPORT_URL,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    period: "/ month",
    badge: null,
    highlight: false,
    features: [
      { label: "unlimited scans", soon: false },
      { label: "wardrobe matchmaker", soon: true },
      { label: "virtual try-on", soon: true },
    ],
    cta: {
      label: "get pro",
      href: process.env.NEXT_PUBLIC_SUBSCRIPTION_URL ?? "",
      soon: !process.env.NEXT_PUBLIC_SUBSCRIPTION_URL,
    },
  },
];
