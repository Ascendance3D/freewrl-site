import { chromium } from "playwright-core"
const url = process.argv[2]
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--use-angle=gl", "--enable-gpu", "--ignore-gpu-blocklist"] })
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
p.on("response", (r) => r.status() >= 400 && console.log("HTTP", r.status(), r.url()))
p.on("console", (m) => console.log("console", m.type(), m.text().slice(0, 300)))
p.on("pageerror", (e) => console.log("pageerror", e.message, e.stack?.slice(0, 300)))
await p.goto(url, { waitUntil: "networkidle" })
await p.waitForTimeout(5000)
console.log(await p.evaluate(() => {
  const el = document.querySelector("x3d-canvas"); if (!el) return "no canvas"
  const r = el.getBoundingClientRect(); const c = el.shadowRoot?.querySelector("canvas")
  const gl = c && (c.getContext("webgl2"))
  const dbg = gl && gl.getExtension("WEBGL_debug_renderer_info")
  return JSON.stringify({ w: r.width, h: r.height, cw: c?.width, ch: c?.height, renderer: dbg && gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL), shadow: !!el.shadowRoot })
}))
await b.close()
