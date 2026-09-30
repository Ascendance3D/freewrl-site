// Headless GPU screenshots of the local preview.
// Usage: node qa/shots.mjs [baseURL] [outDir] [pages,comma] [widths,comma] [scheme]
import { mkdirSync } from "node:fs"
import { chromium } from "playwright-core"

const base = process.argv[2] ?? "http://127.0.0.1:8788"
const out = process.argv[3] ?? "qa-artifacts/shots"
const pages = (process.argv[4] ?? "/").split(",")
const widths = (process.argv[5] ?? "1440,390").split(",").map(Number)
const scheme = process.argv[6] ?? "light"
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--use-angle=gl", "--enable-gpu", "--ignore-gpu-blocklist"],
})
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : 900 }, colorScheme: scheme, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`))
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: "networkidle" })
    // scroll through so lazy viewers start, then come back to the top
    const h = await page.evaluate(() => document.body.scrollHeight)
    for (let y = 0; y < h; y += 700) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(120) }
    await page.evaluate(() => scrollTo(0, 0))
    await page.waitForTimeout(4000)
    const name = `${out}/${p.replace(/\//g, "_") || "_"}-${w}-${scheme}`
    await page.screenshot({ path: `${name}-top.png` })
    await page.screenshot({ path: `${name}-full.png`, fullPage: true })
    const status = await page.$$eval(".viewer", (els) => els.map((e) => e.getAttribute("data-status")))
    console.log(p, w, scheme, "viewers:", status.join(",") || "none")
  }
  if (errors.length) console.log("ERRORS", w, errors)
  await ctx.close()
}
await browser.close()
