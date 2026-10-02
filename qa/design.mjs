// Design QA for iteration 2. Checks the rules in DESIGN_V2_DIRECTION.md that a browser can measure.
// Usage: node qa/design.mjs [baseURL]
import { chromium } from "playwright-core"
import { stubAnalytics } from "./analytics-stub.mjs"

const base = process.argv[2] ?? "http://127.0.0.1:8788"
const PAGES = ["/", "/download/", "/use/", "/build/", "/lab/", "/learn/", "/conformance/", "/tests/", "/history/", "/contribute/", "/nope"]
const WIDTHS = [320, 390, 768, 820, 1024, 1440, 1920]
// H1 ceilings (px) by viewport: normal words, not posters.
const H1_MAX = (w) => (w < 640 ? 36 : w < 1024 ? 46 : 56)

// Alternate right-side-use rule: a wide first-screen capture whose right edge reaches the last quarter.
// Only media that is visibly rendered with real content counts: a full-width text block, a hidden or
// transparent element, an unloaded/broken image, or a video with neither frames nor a loaded poster does not.
// Canvas is excluded: a blank canvas cannot be told from a drawn one without pixel guessing, and the site's
// only canvases (X_ITE) live in shadow DOM where `main canvas` never matched them.
// Installed as an init script so the page check and the self-test below run the same code.
const wideMediaRule = () => {
  window.__qaWideMediaUsesRight = async (doc) => {
    const W = doc.documentElement.clientWidth
    // a video need not play: frames already decoded, or a poster that decodes, both show a real picture
    const decodes = (url) => { if (!url) return false; const i = new Image(); i.src = url; return i.decode().then(() => i.naturalWidth > 0, () => false) }
    const hasContent = async (e) =>
      e.tagName === "IMG" ? !!e.currentSrc && e.complete && e.naturalWidth > 0 && e.naturalHeight > 0
        : (e.readyState >= 2 && e.videoWidth > 0) || await decodes(e.poster)
    const candidates = [...doc.querySelectorAll("main img, main video")].filter((e) => {
      const b = e.getBoundingClientRect()
      return b.top < 900 && b.bottom > 120 && b.width >= W * 0.4 && b.right > W * 0.75 && b.height >= 2 &&
        e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
    })
    for (const e of candidates) if (await hasContent(e)) return true
    return false
  }
}

const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--headless=new", "--no-sandbox"] })
let pass = 0, fail = 0
const check = (name, ok, detail = "") => { ok ? pass++ : fail++; if (!ok) console.log(`FAIL  ${name}  ${detail}`) }

// Self-test of the wide-media rule on fixtures at 1440 px (counted separately from the page checks).
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(base + "/nope", { waitUntil: "networkidle" })
  const img = `${base}/media/archive/FreeWRL_poster-800.jpg`
  const wide = "position:absolute;top:150px;left:400px;width:1000px;height:500px"
  const FIXTURES = [
    ["wide text block", `<p style="${wide}">${"FreeWRL ".repeat(200)}</p>`, false],
    ["small image", `<img src="${img}" style="position:absolute;top:150px;left:1100px;width:200px;height:100px">`, false],
    ["wide media ending too early", `<img src="${img}" style="position:absolute;top:150px;left:0;width:1000px;height:500px">`, false],
    ["blank wide canvas", `<canvas width="1000" height="500" style="${wide}"></canvas>`, false],
    ["visibility:hidden wide image", `<img src="${img}" style="${wide};visibility:hidden">`, false],
    ["display:none wide image", `<img src="${img}" style="${wide};display:none">`, false],
    ["opacity:0 wide image", `<img src="${img}" style="${wide};opacity:0">`, false],
    ["opacity:0 ancestor", `<div style="opacity:0"><img src="${img}" style="${wide}"></div>`, false],
    ["zero-height wide image", `<img src="${img}" style="${wide};height:0">`, false],
    ["broken wide image", `<img src="${base}/qa-missing.jpg" style="${wide}">`, false],
    ["src-less wide image", `<img style="${wide}">`, false],
    ["empty wide video", `<video style="${wide}"></video>`, false],
    ["wide video, broken poster", `<video poster="${base}/qa-missing.jpg" preload="none" style="${wide}"></video>`, false],
    ["wide video, loaded poster", `<video poster="${img}" preload="none" style="${wide}"></video>`, true],
    ["loaded wide image", `<img src="${img}" style="${wide}">`, true],
  ]
  let ok = 0
  for (const [name, html, want] of FIXTURES) {
    await page.setContent(`<!doctype html><body style="margin:0"><main>${html}</main></body>`, { waitUntil: "networkidle" })
    await page.evaluate(wideMediaRule)
    const got = await page.evaluate(() => window.__qaWideMediaUsesRight(document))
    got === want ? ok++ : console.log(`FAIL  wide-media self-test: ${name}  expected ${want ? "ACCEPT" : "REJECT"}, got ${got ? "ACCEPT" : "REJECT"}`)
  }
  console.log(`wide-media rule self-test: ${ok}/${FIXTURES.length} fixtures judged correctly`)
  if (ok !== FIXTURES.length) process.exitCode = 1
  await ctx.close()
}

for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, hasTouch: w < 1024 })
  await stubAnalytics(ctx)
  await ctx.addInitScript(wideMediaRule)
  const page = await ctx.newPage()
  for (const p of PAGES) {
    await page.goto(base + p, { waitUntil: "networkidle" })
    const r = await page.evaluate(async () => {
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
      // or a wide capture spanning into the last quarter (see wideMediaRule)
      const rightUsed = firstScreen.some((e) => e.getBoundingClientRect().left > W * 0.66) || await window.__qaWideMediaUsesRight(document)
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
process.exit(fail || process.exitCode ? 1 : 0)
