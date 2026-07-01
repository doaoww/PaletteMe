export type PricingFeature = {
  label: string;
  soon: boolean;
};

export type PricingTier = {
  id: "free" | "starter" | "pro";
  name: string;
  price: string;
  period: string;
  description: string;
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
    name: "Mini Result",
    price: "Free",
    period: "",
    description: "See where you land.",
    badge: null,
    highlight: false,
    features: [
      { label: "your color season", soon: false },
      { label: "a preview of your best colors", soon: false },
      { label: "instant result from one photo", soon: false },
    ],
    cta: { label: "get my mini result", href: "/style-setup", soon: false },
  },
  {
    id: "starter",
    name: "Complete Report",
    price: "$5.99",
    period: "",
    description: "Everything your report includes.",
    badge: "Full Report",
    highlight: true,
    features: [
      { label: "color season + best and worst colors", soon: false },
      { label: "contrast, hair colors and haircuts", soon: false },
      { label: "jewelry metals and makeup shades", soon: false },
      { label: "glasses, nail colors and details", soon: false },
      { label: "style identity and visual rules", soon: false },
      { label: "ready-to-wear outfit capsules", soon: false },
    ],
    cta: {
      label: "get my full report",
      href: "/style-setup",
      soon: false,
    },
  },
];
