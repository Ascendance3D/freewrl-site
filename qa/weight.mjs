// Page weight: bytes transferred before and after the live world starts.
import { chromium } from "playwright-core"
const base = process.argv[2] ?? "http://127.0.0.1:8788"
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--use-angle=gl", "--enable-gpu", "--ignore-gpu-blocklist"] })
for (const path of (process.argv[3] ?? "/,/learn/,/lab/,/history/,/conformance/").split(",")) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const p = await ctx.newPage()
  const cdp = await ctx.newCDPSession(p); await cdp.send("Network.enable")
  const rows = []; const size = new Map()
  cdp.on("Network.responseReceived", (e) => size.set(e.requestId, { url: e.response.url, type: e.type }))
  cdp.on("Network.loadingFinished", (e) => { const r = size.get(e.requestId); if (r) rows.push({ ...r, bytes: e.encodedDataLength }) })
  await p.goto(base + path, { waitUntil: "load" })
  const lcp = await p.evaluate(() => new Promise((res) => { new PerformanceObserver((l) => { const e = l.getEntries(); res(Math.round(e[e.length - 1].startTime)) }).observe({ type: "largest-contentful-paint", buffered: true }); setTimeout(() => res(null), 3000) }))
  const initial = rows.reduce((s, r) => s + r.bytes, 0)
  const groups = (list) => Object.entries(list.reduce((g, r) => { const k = r.url.includes("/x_ite/") ? "x_ite" : r.url.match(/\.(woff2)$/) ? "fonts" : r.type.toLowerCase(); g[k] = (g[k] ?? 0) + r.bytes; return g }, {})).map(([k, v]) => `${k} ${(v / 1024).toFixed(0)}KB`).join(", ")
  const initialGroups = groups(rows)
  await p.waitForTimeout(6000)
  const all = rows.reduce((s, r) => s + r.bytes, 0)
  console.log(`${path}  LCP ${lcp}ms  at load: ${(initial / 1024).toFixed(0)} KB [${initialGroups}]  after 6s: ${(all / 1024).toFixed(0)} KB [${groups(rows)}]`)
  await ctx.close()
}
await b.close()
