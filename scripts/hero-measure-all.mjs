import { chromium } from "playwright";

const widths = [834, 900, 1024, 375, 1440];
const browser = await chromium.launch();

for (const width of widths) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: 900 });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  const data = await page.evaluate(() => {
    const rect = (el) => el?.getBoundingClientRect();
    const eyebrow = document.querySelector(".hero__eyebrow");
    const logo = document.querySelector(".hero__logo");
    const keep = document.querySelector(".hero__mast-keep");
    const mast = document.querySelector(".hero__mast");
    const rangeRects = (el) => {
      if (!el) return [];
      const range = document.createRange();
      range.selectNodeContents(el);
      return Array.from(range.getClientRects());
    };
    return {
      eyebrowLeft: Math.round(rect(eyebrow)?.left ?? 0),
      logoLeft: Math.round(rect(logo)?.left ?? 0),
      keepLeft: Math.round(rect(keep)?.left ?? 0),
      mastLeft: Math.round(rect(mast)?.left ?? 0),
      mastLineLefts: rangeRects(mast).map((r) => Math.round(r.left)),
    };
  });
  console.log(width, JSON.stringify(data));
  await page.close();
}

await browser.close();
