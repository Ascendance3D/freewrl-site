// Landing-world review in the real homepage viewer (X_ITE, headless GPU).
// Serves the built ./dist yourself (any static server), then:
//   node qa/landing-world.mjs <baseURL> <world.wrl|-> <outDir> [widths] [--reduced]
// "-" keeps the shipped freewrl-landing.wrl; a path swaps it in via request routing,
// so no site file changes. For each width it captures every Viewpoint of the hero
// viewer, counts triangles/lines drawn in one frame, and logs console errors.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { chromium } from "playwright-core"

const [base = "http://127.0.0.1:8795", world = "-", out = "qa-artifacts/landing-world", w = "1440"] = process.argv.slice(2).filter((a) => !a.startsWith("--"))
const reduced = process.argv.includes("--reduced")
const widths = w.split(",").map(Number)
mkdirSync(out, { recursive: true })

// Wrap draw calls so one frame's primitive counts can be read back.
const COUNTER = () => {
  const tally = { tri: 0, line: 0, calls: 0, on: false }
  globalThis.__draws = tally
  const add = (mode, n) => {
    if (!tally.on) return
    tally.calls++
    if (mode === 4) tally.tri += n / 3
    else if (mode === 5 || mode === 6) tally.tri += Math.max(0, n - 2)
    else if (mode === 1) tally.line += n / 2
    else if (mode === 3) tally.line += Math.max(0, n - 1)
  }
  for (const P of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
    const da = P.drawArrays, de = P.drawElements
    P.drawArrays = function (m, f, n) { add(m, n); return da.call(this, m, f, n) }
    P.drawElements = function (m, n, t, o) { add(m, n); return de.call(this, m, n, t, o) }
    const ext = P.getExtension
    P.getExtension = function (name) {
      const e = ext.call(this, name)
      if (e && name === "ANGLE_instanced_arrays" && !e.__w) {
        const a = e.drawArraysInstancedANGLE, b = e.drawElementsInstancedANGLE
        e.drawArraysInstancedANGLE = function (m, f, n, c) { add(m, n * c); return a.call(this, m, f, n, c) }
        e.drawElementsInstancedANGLE = function (m, n, t, o, c) { add(m, n * c); return b.call(this, m, n, t, o, c) }
        e.__w = 1
      }
      return e
    }
    if (P.drawArraysInstanced) {
      const a = P.drawArraysInstanced, b = P.drawElementsInstanced
      P.drawArraysInstanced = function (m, f, n, c) { add(m, n * c); return a.call(this, m, f, n, c) }
      P.drawElementsInstanced = function (m, n, t, o, c) { add(m, n * c); return b.call(this, m, n, t, o, c) }
    }
  }
}

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--use-angle=gl", "--enable-gpu", "--ignore-gpu-blocklist"],
})
const report = []
for (const width of widths) {
  const height = width < 600 ? 844 : 900
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: reduced ? "reduce" : "no-preference" })
  await ctx.addInitScript(COUNTER)
  if (world !== "-") {
    const body = readFileSync(world)
    await ctx.route("**/worlds/freewrl-landing.wrl", (r) => r.fulfill({ status: 200, contentType: "model/vrml", body }))
  }
  const page = await ctx.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(`${m.type()}: ${m.text()}`))
  await page.goto(base + "/", { waitUntil: "networkidle" })
  const viewer = page.locator(".viewer--hero")
  await viewer.scrollIntoViewIfNeeded()
  await page.waitForFunction(() => document.querySelector(".viewer--hero")?.getAttribute("data-status") === "ready", null, { timeout: 30000 })
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(2500)
  const stage = page.locator(".viewer--hero .viewer__stage")
  const vps = await page.evaluate(() => {
    const b = document.querySelector(".viewer--hero x3d-canvas").browser
    return Array.from(b.currentScene.rootNodes).filter((n) => n?.getNodeTypeName?.() === "Viewpoint").map((n) => n.description)
  })
  const count = await page.evaluate(async () => {
    const t = globalThis.__draws
    // count exactly one X_ITE frame: between two consecutive rAF callbacks of ours
    await new Promise((r) => requestAnimationFrame(() => {
      Object.assign(t, { tri: 0, line: 0, calls: 0, on: true })
      requestAnimationFrame(() => { t.on = false; r() })
    }))
    return { ...t }
  })
  const row = { width, reduced, viewpoints: vps, frame: count, shots: [] }
  const tag = `${width}${reduced ? "-reduced" : ""}`
  await page.screenshot({ path: `${out}/page-${tag}.png` })
  for (let i = 0; i < Math.max(1, vps.length); i++) {
    const p = `${out}/vp${i + 1}-${tag}.png`
    await stage.screenshot({ path: p })
    row.shots.push(p)
    if (vps.length > 1) {
      await page.getByRole("button", { name: "Next viewpoint" }).click()
      await page.waitForTimeout(2200) // X_ITE animates the transition
    }
  }
  row.errors = errors
  report.push(row)
  console.log(JSON.stringify(row))
  await ctx.close()
}
writeFileSync(`${out}/report${reduced ? "-reduced" : ""}.json`, JSON.stringify(report, null, 2))
await browser.close()
