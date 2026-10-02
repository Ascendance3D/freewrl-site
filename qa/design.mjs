// Design QA for iteration 2. Checks the rules in DESIGN_V2_DIRECTION.md that a browser can measure.
// Usage: node qa/design.mjs [baseURL]
import { chromium } from "playwright-core"
import { stubAnalytics } from "./analytics-stub.mjs"

const base = process.argv[2] ?? "http://127.0.0.1:8788"
const PAGES = ["/", "/download/", "/use/", "/build/", "/lab/", "/learn/", "/conformance/", "/tests/", "/history/", "/contribute/", "/nope"]
const WIDTHS = [320, 390, 768, 820, 1024, 1440, 1920]
// H1 ceilings (px) by viewport: normal words, not posters.
const H1_MAX = (w) => (w < 640 ? 36 : w < 1024 ? 46 : 56)

const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--headless=new", "--no-sandbox"] })
let pass = 0, fail = 0
const check = (name, ok, detail = "") => { ok ? pass++ : fail++; if (!ok) console.log(`FAIL  ${name}  ${detail}`) }

for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, hasTouch: w < 1024 })
  await stubAnalytics(ctx)
  const page = await ctx.newPage()
  for (const p of PAGES) {
    await page.goto(base + p, { waitUntil: "networkidle" })
    const r = await page.evaluate(() => {
      const h1s = [...document.querySelectorAll("h1")]
      const h1 = h1s[0]
      const cs = (el) => getComputedStyle(el)
      // children of <video>/<audio> are fallback markup the browser never renders, so they have no computed font
      const fams = new Set([...document.querySelectorAll("body *:not(video *, audio *)")].map((e) => cs(e).fontFamily.split(",")[0].replace(/"/g, "").trim()))
      // reading text only; marginal notes, captions and labels are meant to be smaller
      const bodyP = [...document.querySelectorAll("main .prose p:not(.caption, .mono), main p.prose, main .page-head__lede p, main .stage__body > p:first-child, main .exhibit-row__text > p, main .ledger__col > p:not(.mono, .caption, .ledger__big)")]
      const minBody = bodyP.length ? Math.min(...bodyP.map((e) => parseFloat(cs(e).fontSize))) : 16
      const upperH = [...document.querySelectorAll("main h1, main h2")].filter((e) => cs(e).textTransform === "uppercase").length
      const small = [...document.querySelectorAll("main .btn, main .segmented button, main .swatches button, .masthead__toggle")]
        .filter((e) => e.offsetParent).filter((e) => e.getBoundingClientRect().height < 43.5).map((e) => e.textContent.trim().slice(0, 20))
      // right-side use at desktop: something visible in the first screen whose right edge reaches the last quarter
      const W = document.documentElement.clientWidth
      const firstScreen = [...document.querySelectorAll("main *")].filter((e) => {
        const b = e.getBoundingClientRect(); return b.top < 900 && b.bottom > 120 && b.width > 0 && b.width < W * 0.6 && e.children.length === 0 && (e.textContent.trim() || e.tagName === "IMG" || e.tagName === "CANVAS")
      })
      // or a wide capture/canvas spanning into the last quarter (media only: a full-width text block does not count)
      const wideMedia = [...document.querySelectorAll("main img, main video, main canvas")].filter((e) => {
        const b = e.getBoundingClientRect(); return b.top < 900 && b.bottom > 120 && b.width >= W * 0.4 && b.right > W * 0.75
      })
      const rightUsed = firstScreen.some((e) => e.getBoundingClientRect().left > W * 0.66) || wideMedia.length > 0
      return {
        h1Count: h1s.length, h1Size: h1 ? parseFloat(cs(h1).fontSize) : 0, h1Upper: h1 ? cs(h1).textTransform === "uppercase" : false,
        hScroll: document.documentElement.scrollWidth - W, fams: [...fams], minBody, upperH, small, rightUsed,
      }
    })
    const tag = `${p} @${w}`
    check(`${tag} one h1`, r.h1Count === 1, `${r.h1Count}`)
    check(`${tag} h1 ≤ ${H1_MAX(w)}px`, r.h1Size <= H1_MAX(w), `${r.h1Size}px`)
    check(`${tag} no uppercase h1/h2`, !r.h1Upper && r.upperH === 0, `${r.upperH}`)
    check(`${tag} no horizontal scroll`, r.hScroll <= 0, `${r.hScroll}px`)
    check(`${tag} body ≥ 16px`, r.minBody >= 15.9, `${r.minBody}px`)
    check(`${tag} ≤ 2 families (+ fallbacks)`, r.fams.filter((f) => !/^(Source Serif 4 Variable|IBM Plex Mono|system-ui|ui-monospace|Menlo|Georgia|Times New Roman|monospace|serif|sans-serif|Arial)$/.test(f)).length === 0, r.fams.join(" | "))
    if (w < 1024) check(`${tag} tap targets ≥ 44px`, r.small.length === 0, r.small.join(", "))
    if (w >= 1440 && p !== "/nope") check(`${tag} right side used in first screen`, r.rightUsed)
  }
  await ctx.close()
}
await browser.close()
console.log(`\n${pass}/${pass + fail} design checks passed`)
process.exit(fail ? 1 : 0)
