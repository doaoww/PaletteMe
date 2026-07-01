"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  Check,
  X,
} from "lucide-react";

const IMG = {
  heroPortrait: "/images/landing/hero-portrait.png",
  blueprintPortrait: "/images/landing/blueprint-portrait.jpg",
  stepSelfie: "/images/landing/step-flow-1.png",
  stepAnalysis: "/images/landing/step-flow-2.png",
  stepFlow3: "/images/landing/step-flow-3.png",
  reportCover: "/images/landing/report-cover.jpg",
  reportMakeup: "/images/landing/report-makeup.jpg",
  reportHair: "/images/landing/report-hair.jpg",
  beforeAfter: "/images/landing/before-after-1.jpg",
  t1: "/images/landing/testimonial-1.jpg",
  t2: "/images/landing/testimonial-2.jpg",
  t3: "/images/landing/testimonial-3.jpg",
  t4: "/images/landing/testimonial-4.jpg",
  pricingBox: "/images/landing/pricing-box.jpg",
  faqPortrait: "/images/landing/faq-portrait.jpg",
  ctaPortrait: "/images/landing/cta-portrait.jpg",
} as const;

const START_HREF = "/style-setup";

function CTAButton({
  children = "Upload my photo",
  className = "",
  href = START_HREF,
  size = "default",
  tone = "primary",
}: {
  children?: React.ReactNode;
  className?: string;
  href?: string;
  size?: "default" | "compact";
  tone?: "primary" | "subtle";
}) {
  const compact = size === "compact";
  return (
    <Link
      href={href}
      className={`cta-pill${compact ? " cta-pill--compact" : ""}${tone === "subtle" ? " cta-pill--subtle" : ""} ${className}`}
    >
      <span>{children}</span>
      <span
        className={`grid place-items-center rounded-full bg-white/15 ${compact ? "h-7 w-7" : "h-9 w-9"}`}
      >
        <ArrowRight className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </span>
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-ink-soft">
      <span className="h-px w-6 bg-pink" />
      {children}
    </span>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-revealed");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          window.setTimeout(() => el.classList.add("is-revealed"), delay);
          io.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

function Note({
  children,
  className = "",
  size = "md",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  delay?: number;
}) {
  const sizeCls =
    size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";
  return (
    <Reveal delay={delay} className={`pointer-events-none ${className}`}>
      <span className={`font-script text-pink leading-none ${sizeCls}`}>
        {children}
      </span>
    </Reveal>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    ["How it works", "#how"],
    ["What you get", "#blueprint"],
    ["Real results", "#results"],
    ["Pricing", "#pricing"],
    ["FAQ", "#faq"],
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-soft/60 bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 lg:px-10">
        <a href="#top" className="font-serif text-2xl tracking-tight">
          palette<span className="text-pink">me</span>
        </a>
        <ul className="hidden items-center gap-7 text-sm font-medium text-ink-soft xl:gap-9 lg:flex">
          {links.map(([l, h]) => (
            <li key={l}>
              <a href={h} className="transition-colors hover:text-ink">
                {l}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/login"
            className="text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <CTAButton size="compact" tone="subtle" />
        </div>
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 lg:hidden"
        >
          <span className="space-y-1.5">
            <span className="block h-px w-5 bg-ink" />
            <span className="block h-px w-5 bg-ink" />
          </span>
        </button>
      </nav>
      {open && (
        <div className="border-t border-border-soft bg-cream lg:hidden">
          <ul className="mx-auto flex max-w-[1320px] flex-col gap-1 px-5 py-4 text-base">
            {links.map(([l, h]) => (
              <li key={l}>
                <a
                  href={h}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-3 py-2.5 hover:bg-pink-blush"
                >
                  {l}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-3 py-2.5 hover:bg-pink-blush"
              >
                Sign in
              </Link>
            </li>
            <li className="pt-2">
              <CTAButton size="compact" tone="subtle" />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="landing-section landing-section--hero relative overflow-hidden">
      <div className="landing-section__inner mx-auto max-w-[1320px] px-5 py-8 lg:px-10">
        <div className="hero-grid grid h-full items-center gap-8 lg:grid-cols-[0.45fr_0.55fr] lg:gap-12 xl:gap-16">
          <div className="hero-copy flex flex-col justify-center lg:max-w-[540px]">
            <p className="hero-kicker mb-4 text-sm font-medium text-ink-soft">
              AI appearance analysis
            </p>
            <h1 className="hero-headline font-serif text-[2.55rem] leading-[1.03] tracking-tight sm:text-[3.25rem]">
              Discover the version of you that{" "}
              <span className="italic text-pink">actually works.</span>
            </h1>
            <p className="hero-subtitle mt-5 max-w-[32rem] text-base leading-relaxed text-ink-soft sm:text-lg">
              Upload one photo and get personalized recommendations for your
              colors, hair, glasses, metals and more, based on your features.
            </p>
            <div className="hero-cta-row mt-7 hidden items-center gap-4 lg:flex">
              <CTAButton />
              <p className="text-sm font-medium text-ink-soft">
                Takes less than 30 seconds
              </p>
            </div>
          </div>

          <div className="hero-visual flex flex-col items-center justify-center gap-5 lg:items-end">
            <div className="hero-visual-frame relative w-full max-w-[540px] lg:max-w-none">
              <Image
                src={IMG.heroPortrait}
                alt="Personal appearance report preview with color, hair, glasses, metals, and contrast recommendations"
                width={1024}
                height={1024}
                priority
                sizes="(max-width: 1024px) 92vw, 48vw"
                className="h-auto w-full object-contain object-center"
              />
              <div className="absolute bottom-4 left-4 hidden rounded-[1.25rem] bg-white/90 px-4 py-3 shadow-card backdrop-blur-md sm:block">
                <p className="font-serif text-xl leading-none">Appearance report</p>
                <p className="mt-1 text-xs font-medium text-ink-soft">
                  colors, hair, glasses, contrast
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center lg:hidden">
              <CTAButton />
              <p className="text-center text-sm font-medium text-ink-soft sm:text-left">
                Takes less than 30 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="landing-section landing-section--problem bg-pink-blush">
      <div className="landing-section__inner mx-auto max-w-[1320px] px-5 py-14 lg:px-10">
        <header className="max-w-2xl">
          <h2 className="font-serif text-[2.1rem] leading-[1.05] sm:text-5xl lg:text-6xl">
            You were{" "}
            <span className="italic">never</span> bad at style.
            <br />
            <span className="font-serif italic text-pink">
              Most advice was never built for your features.
            </span>
          </h2>
        </header>

        <div className="problem-comparison mt-10 grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-pink text-white">
                <X className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium">Generic advice</span>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] paper-card">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={IMG.beforeAfter}
                  alt="Before, colors that make facial features look less clear"
                  fill
                  sizes="(max-width: 1024px) 86vw, 420px"
                  className="h-full w-[200%] max-w-none object-cover object-left"
                />
              </div>
              <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-medium shadow">
                guessed tones
              </div>
              <p className="px-5 py-4 text-sm text-ink-soft">
                Your face can read flatter.
              </p>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-pink text-white shadow-pill lg:h-16 lg:w-16">
              <ArrowRight className="h-6 w-6" />
            </div>
            <Note
              className="absolute -top-6 left-1/2 -translate-x-1/2 -rotate-3 lg:-top-8"
              size="md"
            >
              more precise
            </Note>
          </div>

          <div className="relative">
            <Note className="absolute -top-7 right-2 rotate-3 lg:-top-9" size="md">
              your fit
            </Note>
            <div className="mb-4 flex items-center gap-2 text-sm">
              <Check className="h-5 w-5 text-pink" />
              <span className="font-medium">Personal analysis</span>
              <Check className="h-4 w-4 text-pink" />
            </div>

            <div className="relative overflow-hidden rounded-[2rem] paper-card">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={IMG.beforeAfter}
                  alt="After, colors that make facial features look clearer"
                  fill
                  sizes="(max-width: 1024px) 86vw, 420px"
                  className="h-full w-[200%] max-w-none -translate-x-1/2 object-cover object-left"
                />
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-pink px-3 py-1 text-xs font-medium text-white shadow">
                personal palette
              </div>
              <p className="px-5 py-4 text-sm text-ink-soft">
                Your features look clearer.
              </p>
            </div>
          </div>
        </div>

        <p className="problem-punchline mt-10 text-center font-script text-3xl text-pink lg:mt-14 lg:text-4xl">
          Better choices. Clearer features.
        </p>
      </div>
    </section>
  );
}

const steps = [
  {
    n: "01",
    title: "Upload one photo",
    body: "Use one clear face photo in natural light. The setup takes less than 30 seconds.",
    img: IMG.stepSelfie,
    width: 819,
    height: 1024,
  },
  {
    n: "02",
    title: "AI analyzes your features",
    body: "We read your coloring, contrast and face structure the way an image consultant would.",
    img: IMG.stepAnalysis,
    width: 739,
    height: 1024,
  },
  {
    n: "03",
    title: "Get your appearance report",
    body: "A visual report with colors, hair, glasses, metals and detail recommendations that fit you.",
    img: IMG.stepFlow3,
    width: 485,
    height: 1024,
  },
] as const;

function HowItWorks() {
  return (
    <section id="how" className="landing-section landing-section--how relative">
      <div className="landing-section__inner mx-auto max-w-[1320px] px-5 py-14 lg:px-10">
        <header className="mb-10 max-w-xl lg:mb-12">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-4 font-serif text-[2.2rem] leading-[1.05] sm:text-5xl lg:text-6xl">
            Three steps to a report{" "}
            <span className="italic">that explains why.</span>
            <Sparkles className="ml-2 inline h-5 w-5 text-pink" />
          </h2>
        </header>

        <ol className="grid gap-8 lg:grid-cols-3 lg:gap-6">
          {steps.map((s, i) => (
            <li key={s.n} className="group relative">
              <div className="mb-5 flex items-baseline gap-4 lg:flex-col lg:items-start">
                <span className="font-script text-4xl text-pink lg:text-5xl">
                  {s.n}
                </span>
                <h3 className="font-serif text-2xl leading-tight lg:text-3xl">
                  {s.title}
                </h3>
              </div>
              <div className="lift overflow-hidden">
                <Image
                  src={s.img}
                  alt={s.title}
                  width={s.width}
                  height={s.height}
                  sizes="(max-width: 1024px) 86vw, 360px"
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
                {s.body}
              </p>
              {i < steps.length - 1 && (
                <div className="absolute -bottom-8 left-1/2 hidden h-6 w-6 -translate-x-1/2 lg:hidden">
                  <ArrowRight className="h-6 w-6 rotate-90 text-pink" />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const blueprintCards = [
  {
    title: "Color season",
    tag: "example palette",
    body: (
      <div className="mt-2 grid grid-cols-6 gap-1">
        {["#D96A4A", "#E89B7A", "#F4D58D", "#A4C49D", "#7AAFCB", "#C97C7C"].map(
          (c) => (
            <span
              key={c}
              style={{ background: c }}
              className="aspect-square rounded-sm"
            />
          ),
        )}
      </div>
    ),
  },
  {
    title: "Contrast level",
    body: (
      <div className="mt-3 space-y-2">
        {["low", "medium", "high"].map((level, i) => (
          <div key={level} className="flex items-center gap-2">
            <span className="w-14 text-[11px] font-medium text-ink-soft">
              {level}
            </span>
            <span className="h-2 flex-1 rounded-full bg-pink-blush">
              <span
                className="block h-full rounded-full bg-pink"
                style={{ width: `${(i + 1) * 28}%` }}
              />
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Hair colors",
    body: (
      <div className="mt-2 flex gap-1.5">
        {["#3d2415", "#6b3d22", "#8a5a3a", "#b87a4a"].map((c) => (
          <span
            key={c}
            className="h-10 w-6 rounded-md"
            style={{ background: `linear-gradient(180deg, ${c}, ${c}aa)` }}
          />
        ))}
      </div>
    ),
  },
  {
    title: "Haircuts",
    body: (
      <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-ink-soft">
        {["shape", "length", "part"].map((item) => (
          <span key={item} className="rounded-full bg-pink-blush px-3 py-1">
            {item}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Glasses",
    body: (
      <div className="mt-2 flex gap-2">
        <span className="h-9 w-14 rounded-[999px] border-[3px] border-[#3c2a24]" />
        <span className="h-9 w-11 rounded-[0.85rem] border-[3px] border-[#7a4a3a]" />
        <span className="h-9 w-12 rounded-[1.4rem] border-[3px] border-[#b08a64]" />
      </div>
    ),
  },
  {
    title: "Metals & details",
    body: (
      <div className="mt-2 flex flex-wrap gap-2">
        {["gold", "silver", "rose", "makeup", "nails"].map((item) => (
          <span key={item} className="rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink-soft">
            {item}
          </span>
        ))}
      </div>
    ),
  },
];

function Blueprint() {
  return (
    <section id="blueprint" className="landing-section landing-section--blueprint bg-pink-blush/60">
      <div className="landing-section__inner mx-auto max-w-[1320px] px-5 py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
          <div>
            <Eyebrow>What you get</Eyebrow>
            <h2 className="mt-4 font-serif text-[2.2rem] leading-[1.05] sm:text-5xl lg:text-6xl">
              Your personal style{" "}
              <span className="italic text-pink">blueprint.</span>
            </h2>
            <p className="mt-4 max-w-md text-base text-ink-soft lg:text-lg">
              A clear report that turns your face, coloring and contrast into
              practical recommendations you can actually use.
            </p>
            <div className="blueprint-portrait relative mt-8 w-full max-w-[360px] lg:max-w-[420px]">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] paper-card">
                <Image
                  src={IMG.blueprintPortrait}
                  alt="Your personal style blueprint, built on your face"
                  fill
                  sizes="(max-width: 1024px) 86vw, 420px"
                  className="object-cover"
                />
                <Sparkles className="absolute right-4 top-4 h-5 w-5 text-pink" />
              </div>
              <div className="absolute -bottom-3 left-4 rounded-[1rem] bg-white px-4 py-3 shadow-card">
                <p className="font-serif text-xl leading-none">report preview</p>
                <p className="mt-1 text-xs font-medium text-ink-soft">
                  built from your photo
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {blueprintCards.map((c, i) => (
              <article
                key={c.title}
                className="paper-card lift tap flex min-h-[150px] flex-col justify-between gap-4 p-5 lg:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-ink-soft">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                <Check className="h-3.5 w-3.5 text-pink" />
              </div>
                <div>
                  <p className="font-serif text-xl leading-tight lg:text-2xl">
                    {c.title}
                  </p>
                  {"tag" in c && c.tag && (
                    <p className="mt-1 font-script text-2xl leading-none text-pink">
                      {c.tag}
                    </p>
                  )}
                  <div>{c.body}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const reportPages = [
  { src: IMG.reportCover, label: "Color Season" },
  { src: IMG.stepAnalysis, label: "Face & Contrast" },
  { src: IMG.reportHair, label: "Hair, Glasses & Metals" },
  { src: IMG.reportCover, label: "Best Colors" },
];

function Report() {
  return (
    <section id="results" className="landing-section landing-section--results relative bg-cream">
      <div className="landing-section__inner mx-auto max-w-[1320px] px-5 py-14 lg:px-10">
        <header className="mb-8 max-w-2xl lg:mb-12">
          <Eyebrow>Real results</Eyebrow>
          <h2 className="mt-4 font-serif text-[2.2rem] leading-[1.05] sm:text-5xl lg:text-6xl">
            See the shift before you buy another thing.
          </h2>
          <p className="mt-4 text-base text-ink-soft lg:text-lg">
            Preview the difference between generic advice and a report built
            around your face, coloring and contrast.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-12">
          <div className="results-before paper-card overflow-hidden p-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem]">
              <Image
                src={IMG.beforeAfter}
                alt="Before and after preview of colors that suit the face"
                fill
                sizes="(max-width: 1024px) 90vw, 520px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 top-0 flex justify-between p-4 text-xs font-semibold">
                <span className="rounded-full bg-white/90 px-3 py-1 text-ink">
                  before
                </span>
                <span className="rounded-full bg-pink px-3 py-1 text-white">
                  after
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/65 to-transparent p-5 text-white">
                <p className="font-serif text-2xl leading-none">
                  the right tones make your features read clearly
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {reportPages.slice(0, 3).map((p, j) => (
              <figure
                key={j}
                className="paper-card lift overflow-hidden"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={p.src}
                    alt={p.label}
                    fill
                    sizes="(max-width: 1024px) 90vw, 520px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="px-5 py-4 text-sm">
                  <p className="text-xs font-medium text-ink-soft">
                    Preview {j + 1}
                  </p>
                  <p className="font-serif text-xl">{p.label}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="landing-section landing-section--pricing relative overflow-hidden">
      <div className="landing-section__inner mx-auto max-w-[1320px] px-5 py-14 lg:px-10">
        <header className="mx-auto mb-10 max-w-2xl text-center lg:mb-12">
          <h2 className="font-serif text-[2.2rem] leading-[1.05] sm:text-5xl lg:text-6xl">
            Simple pricing.{" "}
            <span className="italic text-pink">Real value.</span>
          </h2>
          <p className="mt-4 text-ink-soft lg:text-lg">
            Try the mini result first. Unlock the full report when it feels
            like you.
          </p>
        </header>

        <div className="relative mx-auto grid max-w-5xl gap-6 lg:grid-cols-2 lg:gap-8">
          <Image
            src={IMG.pricingBox}
            alt=""
            aria-hidden
            width={380}
            height={285}
            className="pointer-events-none absolute -left-20 top-1/2 hidden w-[380px] -translate-y-1/2 -rotate-12 opacity-95 lg:block"
          />
          <Image
            src={IMG.pricingBox}
            alt=""
            aria-hidden
            width={340}
            height={255}
            className="pointer-events-none absolute -right-20 bottom-0 hidden w-[340px] rotate-12 opacity-95 lg:block"
          />

          <div className="paper-card relative z-10 flex flex-col p-7 lg:p-9">
            <p className="font-serif text-2xl">Free mini result</p>
            <p className="mt-3 font-serif text-6xl lg:text-7xl">$0</p>
            <p className="mt-4 text-sm text-ink-soft">
              Upload one photo and get a focused preview of your color direction,
              feature strengths and first appearance recommendations.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              {["face and coloring analysis", "mini report preview", "locked full report outline"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-pink" />
                    {item}
                  </li>
                ),
              )}
            </ul>
            <CTAButton className="mt-8 w-full">Upload my photo</CTAButton>
          </div>

          <div className="paper-card relative z-10 flex flex-col border-2 border-pink p-7 lg:p-9">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-pink px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Most popular
            </span>
            <p className="font-serif text-2xl">Full Look Lab report</p>
            <p className="mt-3 font-serif text-6xl lg:text-7xl">$9.99</p>
            <p className="mt-4 text-sm text-ink-soft">
              Your complete appearance report: colors, contrast, hair, glasses,
              metals, detail choices and practical explanations.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              {["full visual report", "colors, hair, glasses and metals", "clear reasons for every recommendation"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-pink" />
                    {item}
                  </li>
                ),
              )}
            </ul>
            <CTAButton className="mt-8 w-full">Unlock for $9.99</CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Is PaletteMe only for women?",
    a: "No. PaletteMe is built for women, men and nonbinary users. Makeup and nail guidance appears only where it is relevant to the user's preferences.",
  },
  {
    q: "Will this work for my ethnicity?",
    a: "Absolutely. PaletteMe is trained on a wide range of skin tones, undertones and features. Your report is built from your face, not an average.",
  },
  {
    q: "Can I upload any photo?",
    a: "Use a clear face photo in natural light, with no heavy filters, sunglasses or strong color cast. Better lighting gives a better report.",
  },
  {
    q: "What does the report include?",
    a: "You get recommendations for color season, best colors, contrast, hair colors, haircuts, glasses, metals, makeup and nails where relevant.",
  },
  {
    q: "How accurate is the analysis?",
    a: "It uses the same evidence a color analyst and image consultant would check: skin tone, undertone, contrast and feature shape.",
  },
  {
    q: "How is this different from color season quizzes?",
    a: "Quizzes guess from a few clicks. PaletteMe analyzes your actual face and explains why each recommendation fits your features.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="landing-section landing-section--faq">
      <div className="landing-section__inner mx-auto max-w-[1320px] px-5 py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="relative">
          <h2 className="font-serif text-[2.2rem] leading-[1.05] sm:text-5xl lg:text-6xl">
              Questions you might <span className="italic">have.</span>
            </h2>
            <div className="mt-8 max-w-[280px] overflow-hidden rounded-[2rem] paper-card">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={IMG.faqPortrait}
                  alt=""
                  aria-hidden
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute bottom-2 left-48 -rotate-6 rounded-md bg-pink-blush px-3 py-2 shadow-card lg:left-64">
              <p className="font-script text-pink text-xl leading-none">
                We&apos;ve got
              </p>
              <p className="font-script text-pink text-xl leading-none">
                you covered
              </p>
              <Check className="mt-1 h-3.5 w-3.5 text-pink" />
            </div>
          </div>

          <ul className="space-y-3 lg:pt-4">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.q} className="paper-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left lg:px-7 lg:py-6"
                  >
                    <span className="font-serif text-lg lg:text-xl">{f.q}</span>
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${isOpen ? "bg-pink text-white" : "border border-ink/15"}`}
                    >
                      {isOpen ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-ink-soft lg:px-7 lg:pb-7">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="upload" className="landing-section landing-section--final relative overflow-hidden bg-pink text-white">
      <div className="landing-section__inner relative mx-auto grid max-w-[1320px] gap-10 px-5 py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-12 lg:px-10">
        <div>
          <h2 className="font-serif text-[2.4rem] leading-[1.02] sm:text-5xl lg:text-7xl">
            Upload one photo.
            <br />
            <span className="font-serif italic">
              Get the report built for your features.
            </span>
          </h2>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Link
              href={START_HREF}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 font-medium text-pink shadow-pill transition hover:scale-[1.02]"
            >
              <span>Upload my photo</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-pink text-white">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <p className="font-script text-2xl text-white/95">
              Takes less than 30 seconds
            </p>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-[2rem]">
          <Image
            src={IMG.ctaPortrait}
            alt="Personal appearance report preview"
            fill
            sizes="(max-width: 1024px) 86vw, 460px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-cream">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p className="font-serif text-2xl text-ink">
          palette<span className="text-pink">me</span>
        </p>
        <p>
          Copyright {new Date().getFullYear()} PaletteMe. Made for the version of you
          that actually works.
        </p>
        <div className="flex gap-5">
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <a href="#" className="hover:text-ink">
            Terms
          </a>
          <a href="mailto:hello@paletteme.com" className="hover:text-ink">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export function RefLanding() {
  return (
    <div className="landing-ref min-h-screen bg-cream text-ink">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Blueprint />
        <Report />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
