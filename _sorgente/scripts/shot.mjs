// Scrolls the local site and screenshots each viewport, so scroll animations run.
import { chromium } from "playwright-core";
import { readdirSync } from "node:fs";
import { join } from "node:path";
const root = join(process.env.LOCALAPPDATA, "ms-playwright");
const dir = readdirSync(root).filter((d) => d.startsWith("chromium-")).sort().pop();
const exe = join(root, dir, "chrome-win64", "chrome.exe");
const [url, out, w = "1280", h = "800"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
await page.goto(url);
await page.waitForTimeout(2200);
const total = await page.evaluate(() => document.body.scrollHeight);
let i = 0;
for (let y = 0; y < total; y += +h) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(+(process.env.WAIT||1700));
  await page.screenshot({ path: `${out}${i++}.png` });
}
const errs = [];
console.log("pages", i, "height", total);
await browser.close();
