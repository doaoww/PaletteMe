import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 834, height: 900 });
await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });

const data = await page.evaluate(() => {
  const mast = document.querySelector(".hero__mast");
  const intro = document.querySelector(".hero__intro");
  const eyebrow = document.querySelector(".hero__eyebrow");
  const logo = document.querySelector(".hero__logo");
  const keep = document.querySelector(".hero__mast-keep");
  const rect = (el) => el?.getBoundingClientRect();
  const rangeRects = (el) => {
    if (!el) return [];
    const range = document.createRange();
    range.selectNodeContents(el);
    return range.getClientRects();
  };
  return {
    hasKeep: Boolean(keep),
    mastHtml: mast?.innerHTML,
    intro: rect(intro),
    eyebrow: rect(eyebrow),
    logo: rect(logo),
    mast: rect(mast),
    mastLineLefts: Array.from(rangeRects(mast)).map((r) => Math.round(r.left)),
    keep: rect(keep),
    keepStyle: keep ? getComputedStyle(keep).whiteSpace : null,
    mastTextAlign: mast ? getComputedStyle(mast).textAlign : null,
  };
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
