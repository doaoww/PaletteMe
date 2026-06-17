import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const widths = [375, 480, 640, 768, 834, 900, 1024, 1440];
const height = 900;
const label = process.argv[2] ?? "before";
const outDir = path.join("scripts", "screenshots", label);

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

for (const width of widths) {
  await page.setViewportSize({ width, height });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector(".hero__mast", { state: "visible", timeout: 60000 });
  const hero = page.locator(".hero");
  await hero.screenshot({
    path: path.join(outDir, `hero-${width}px.png`),
  });
  console.log(`saved ${label}/hero-${width}px.png`);
}

await browser.close();
