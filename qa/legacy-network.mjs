// Legacy archive network QA: /legacy/ pages must not make automatic third-party
// requests, repeat requests, keep requesting after load, or navigate by themselves.
// Usage: node qa/legacy-network.mjs [baseURL] [observeSeconds=5] [homeObserveSeconds=observeSeconds]
// Exits 1 if any check fails. See LEGACY_TRANSFORMS.md.
import { chromium } from "playwright-core"

const base = process.argv[2] ?? "http://127.0.0.1:8788"
const observe = Number(process.argv[3] ?? 5)
const homeObserve = Number(process.argv[4] ?? observe)
const origin = new URL(base).origin
// matched against the host, so dead same-origin paths like /a.fsdn.com/... are not counted
const TRACKERS = /clustrmaps|sourceforge\.net|sf-syn\.com|slashdotmedia|doubleclick|google-analytics|googletagmanager|googlesyndication|quantserve|statcounter|pro-market|bombora|6sc\.co|narrative\.io|fsdn\.com/i
const host = (u) => { try { return new URL(u).host } catch { return "" } }

// path, expected main-frame navigations (faq.html is an archived meta-refresh stub)
const PAGES = [
  ["/legacy/", 1], ["/legacy/use.html", 1], ["/legacy/conformance.html", 1], ["/legacy/examples.html", 1],
  ["/legacy/ubuntu_src.html", 1], ["/legacy/FreeX3D/index.html", 1], ["/legacy/sficon_frame.html", 1],
  ["/legacy/index.htm", 1], ["/legacy/faq.html", 2],
]

const results = []
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`) }

const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--headless=new", "--no-sandbox"] })
for (const [path, expectNavs] of PAGES) {
  const secs = path === "/legacy/" ? homeObserve : observe
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const cdp = await page.context().newCDPSession(page)
  await cdp.send("Network.enable")
  const reqs = [], failed = {}, navs = [], errors = []
  cdp.on("Network.requestWillBeSent", (e) => reqs.push({ t: Date.now(), id: e.requestId, url: e.request.url }))
  cdp.on("Network.loadingFailed", (e) => { failed[e.requestId] = e.blockedReason ?? e.errorText })
  page.on("framenavigated", (f) => f === page.mainFrame() && navs.push(f.url()))
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
  page.on("pageerror", (e) => errors.push(`pageerror ${e.message}`))

  const resp = await page.goto(base + path, { waitUntil: "load", timeout: 30000 }).catch((e) => (errors.push(`goto ${e.message}`), null))
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(500)
  const settled = reqs.length, t0 = Date.now()
  await page.waitForTimeout(secs * 1000)
  const late = reqs.slice(settled).filter((r) => !/\/favicon\.ico$/.test(r.url))
  const half = t0 + (secs * 1000) / 2
  const lateFirst = late.filter((r) => r.t < half).length, lateSecond = late.length - lateFirst

  const external = reqs.filter((r) => /^https?:/.test(r.url) && new URL(r.url).origin !== origin)
  const counts = {}
  for (const r of reqs) counts[r.url] = (counts[r.url] ?? 0) + 1
  // index.htm uses one logo <img> three times; a runaway loop repeats thousands of times
  const repeated = Object.entries(counts).filter(([u, n]) => n > 3 && !/\/favicon\.ico$/.test(u))
  const trackers = reqs.filter((r) => TRACKERS.test(host(r.url)))
  const finalUrl = page.url()
  const blocked = Object.values(failed).filter((v) => /csp/i.test(v)).length

  const tag = `${path} (${secs}s)`
  check(`${tag} loads`, !!resp && resp.status() < 400, `status ${resp?.status()} final ${finalUrl.replace(origin, "")}`)
  check(`${tag} no automatic external requests`, external.length === 0,
    external.length ? external.slice(0, 5).map((r) => `${r.url} [${failed[r.id] ?? "sent"}]`).join(", ") : `${reqs.length} requests, all ${new URL(origin).host}`)
  check(`${tag} no tracker/ad hosts`, trackers.length === 0, trackers.slice(0, 3).map((r) => r.url).join(", "))
  check(`${tag} no repeated request`, repeated.length === 0, repeated.slice(0, 3).map(([u, n]) => `${n}x ${u}`).join(", "))
  check(`${tag} no request growth after load`, late.length <= 2 && lateSecond <= lateFirst,
    `${late.length} requests in ${secs}s after settle (${lateFirst} then ${lateSecond})`)
  check(`${tag} no self-navigation loop`, navs.length === expectNavs && finalUrl.startsWith(origin + "/legacy/"),
    `${navs.length} main-frame navigation(s), expected ${expectNavs}`)
  check(`${tag} no CSP-blocked loads`, blocked === 0 && !errors.some((e) => /Content Security Policy/i.test(e)), blocked ? `${blocked} blocked` : "")
  console.log(`      console errors: ${errors.length}${errors.length ? " — " + [...new Set(errors)].slice(0, 3).join(" | ").slice(0, 300) : ""}`)
  await page.close()
}
await browser.close()

const fails = results.filter((r) => !r.ok)
console.log(`\nlegacy network: ${results.length - fails.length} / ${results.length} PASS`)
process.exit(fails.length ? 1 : 0)
