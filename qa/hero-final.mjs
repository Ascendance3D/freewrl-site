// Final hero checks on the real homepage viewer (X_ITE, headless GPU):
// animation phases, reduced-motion starts, controls, touch, teardown on navigation, dark mode.
// Serve ./dist first (qa/serve.sh), then: node qa/hero-final.mjs [baseURL] [outDir]
import { mkdirSync, writeFileSync } from "node:fs"
import { chromium } from "playwright-core"

// Exits 1 if any check FAILs. `node qa/hero-final.mjs --self-test` checks that rule without a browser.

// Known, accepted console noise. X_ITE 16.4.1 calls preventDefault() in a touch listener that
// Chrome treats as passive. Matching lines become one EXPECTED WARNING, never a PASS or a FAIL.
// Any other console error or warning in the same check is still a FAIL.
const EXPECTED = [
  { id: "xite-passive-touch", re: /^error: Unable to preventDefault inside passive event listener due to target being treated as passive\./ },
]
const expectedId = (line) => EXPECTED.find((e) => e.re.test(line))?.id

// Status for a "no console errors or warnings" check.
const consoleStatus = (lines) => {
  const unexpected = lines.filter((l) => !expectedId(l))
  if (unexpected.length) return { status: "FAIL", detail: unexpected.join(" | ") }
  if (lines.length) return { status: "WARN", detail: `expected: ${[...new Set(lines.map(expectedId))].join(", ")} x${lines.length}` }
  return { status: "PASS", detail: "" }
}
const summarize = (results) => {
  const n = (s) => results.filter((r) => r.status === s).length
  const pass = n("PASS"), warn = n("WARN"), fail = n("FAIL")
  return { pass, warn, fail, total: results.length, exitCode: fail > 0 || results.length === 0 ? 1 : 0 }
}

if (process.argv.includes("--self-test")) {
  const P = "error: Unable to preventDefault inside passive event listener due to target being treated as passive. See https://www.chromestatus.com/feature/5093566007214080"
  const cases = [
    ["all pass", [{ status: "PASS" }], 0],
    ["expected warning only", [{ status: "PASS" }, { status: consoleStatus([P, P]).status }], 0],
    ["one real fail", [{ status: "PASS" }, { status: "FAIL" }], 1],
    ["expected warning + real console error", [{ status: consoleStatus([P, "pageerror: boom"]).status }], 1],
    ["real console warning", [{ status: consoleStatus(["warning: something"]).status }], 1],
    ["no checks ran", [], 1],
  ]
  let bad = 0
  for (const [name, rs, want] of cases) {
    const got = summarize(rs).exitCode
    console.log(`${got === want ? "ok " : "BAD"}  ${name}: exit ${got} (want ${want})`)
    if (got !== want) bad++
  }
  process.exit(bad ? 1 : 0)
}

const base = process.argv[2] ?? "http://127.0.0.1:8788"
const out = process.argv[3] ?? "qa-artifacts/final-integration/hero-final"
mkdirSync(out, { recursive: true })
const results = []
const record = (name, status, detail = "") => { results.push({ name, status, ok: status !== "FAIL", detail }); console.log(`${status === "WARN" ? "EXPECTED WARNING" : status}  ${name}${detail ? `  — ${detail}` : ""}`) }
const check = (name, ok, detail = "") => record(name, ok ? "PASS" : "FAIL", detail)
const checkConsole = (name, lines) => { const { status, detail } = consoleStatus(lines); record(name, status, detail) }

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--use-angle=gl", "--enable-gpu", "--ignore-gpu-blocklist"],
})

async function open({ width = 1440, reduced = false, scheme = "light", touch = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, deviceScaleFactor: 1, colorScheme: scheme, reducedMotion: reduced ? "reduce" : "no-preference", hasTouch: touch, isMobile: touch, acceptDownloads: true })
  const page = await ctx.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(`${m.type()}: ${m.text()}`))
  await page.goto(base + "/", { waitUntil: "networkidle" })
  await page.waitForFunction(() => document.querySelector(".viewer--hero")?.getAttribute("data-status") === "ready", null, { timeout: 30000 })
  await page.waitForTimeout(1500)
  return { ctx, page, errors, stage: page.locator(".viewer--hero .viewer__stage") }
}
const scene = (page, fn, arg) => page.evaluate(([f, a]) => {
  const b = document.querySelector(".viewer--hero x3d-canvas").browser
  return new Function("b", "s", "a", f)(b, b.currentScene, a)
}, [fn, arg])
const gyroAngle = (page) => scene(page, "const r = s.getNamedNode('Gyro').rotation; return +(r.angle * Math.sign(r.y || 1)).toFixed(3)")
const camera = (page) => scene(page, "const v = b.getActiveLayer?.()?.getViewpoint?.() ?? null; const m = v?.getCameraSpaceMatrix?.(); return m ? Array.from(m).map((x) => +x.toFixed(2)).join(',') : null")

// 1. Animation phases 0/25/50/75 %: stop the Clock, drive both interpolators to one fraction.
for (const width of [1440, 390]) {
  const { ctx, page, errors, stage } = await open({ width })
  for (const f of [0, 0.25, 0.5, 0.75]) {
    await scene(page, "s.getNamedNode('Clock').enabled = false; s.getNamedNode('GyroTurn').set_fraction = a; s.getNamedNode('OrbitTurn').set_fraction = a", f)
    await page.waitForTimeout(400)
    const a = await gyroAngle(page)
    await stage.screenshot({ path: `${out}/phase-${Math.round(f * 100)}-${width}.png` })
    check(`phase ${Math.round(f * 100)}% at ${width}: Gyro rotation follows the fraction`, Math.abs(((a + 2 * Math.PI) % (2 * Math.PI)) - (f * 2 * Math.PI) % (2 * Math.PI)) < 0.01 || (f === 0 && Math.abs(a) < 0.01), `angle ${a}`)
  }
  checkConsole(`phases at ${width}: no console errors or warnings`, errors)
  await ctx.close()
}

// 2. Reduced motion: five fresh starts. Clock must be off each time; record where the ring stopped.
const angles = []
for (let i = 0; i < 5; i++) {
  const { ctx, page, errors, stage } = await open({ reduced: true })
  const enabled = await scene(page, "return s.getNamedNode('Clock').enabled")
  const a1 = await gyroAngle(page); await page.waitForTimeout(1500); const a2 = await gyroAngle(page)
  angles.push(a1)
  await stage.screenshot({ path: `${out}/reduced-start-${i + 1}.png` })
  check(`reduced-motion start ${i + 1}: Clock off, ring still`, enabled === false && a1 === a2 && errors.length === 0, `angle ${a1}`)
  const btn = page.getByRole("button", { name: "Play motion" })
  if (i === 0) {
    check("reduced motion: button offers Play motion", await btn.count() === 1)
    await btn.click(); await page.waitForTimeout(1200)
    const b1 = await gyroAngle(page); await page.waitForTimeout(1200); const b2 = await gyroAngle(page)
    check("reduced motion: Play motion starts the ring", b1 !== b2 && await scene(page, "return s.getNamedNode('Clock').enabled"), `${b1} -> ${b2}`)
  }
  await ctx.close()
  await new Promise((r) => setTimeout(r, 1300)) // a different wall-clock phase next start
}

// 3. Controls, mouse, download, teardown and recreation.
{
  const { ctx, page, errors, stage } = await open()
  const vps = await scene(page, "return Array.from(s.rootNodes).filter((n) => n?.getNodeTypeName?.() === 'Viewpoint').map((n) => n.description)")
  const bound = () => scene(page, "return Array.from(s.rootNodes).filter((n) => n?.getNodeTypeName?.() === 'Viewpoint').findIndex((n) => n.isBound)")
  check("initial Viewpoint is Plaza", (await bound()) === 0, vps.join(" / "))
  const seen = [await bound()]
  for (let i = 0; i < 4; i++) { await page.getByRole("button", { name: "Next viewpoint" }).click(); await page.waitForTimeout(2200); seen.push(await bound()) }
  check("Next viewpoint visits all four and wraps to Plaza", seen.join(",") === "0,1,2,3,0", seen.join(","))
  const c0 = await camera(page)
  const box = await stage.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 160, box.y + box.height / 2 + 40, { steps: 12 }); await page.mouse.up()
  await page.waitForTimeout(800)
  const c1 = await camera(page)
  check("mouse drag turns the view (EXAMINE)", c0 && c1 && c0 !== c1)
  await stage.screenshot({ path: `${out}/after-drag.png` })
  await page.getByRole("button", { name: "Reset view" }).click(); await page.waitForTimeout(2500)
  check("Reset view returns to Plaza", (await bound()) === 0 && (await camera(page)) !== c1)
  await page.getByRole("button", { name: "Pause motion" }).click(); await page.waitForTimeout(300)
  const p1 = await gyroAngle(page); await page.waitForTimeout(1500); const p2 = await gyroAngle(page)
  check("Pause motion stops the ring", p1 === p2 && (await scene(page, "return s.getNamedNode('Clock').enabled")) === false)
  await page.getByRole("button", { name: "Play motion" }).click(); await page.waitForTimeout(1200)
  const q1 = await gyroAngle(page); await page.waitForTimeout(1200); const q2 = await gyroAngle(page)
  check("Play motion restarts the ring", q1 !== q2)
  const link = page.locator(".viewer--hero a[download]")
  const href = await link.getAttribute("href")
  const res = await page.request.get(base + href)
  check("Download file link serves the world", href === "/worlds/freewrl-landing.wrl" && res.status() === 200 && (await res.text()).startsWith("#VRML V2.0 utf8"), `${href} ${res.status()} ${res.headers()["content-type"]}`)
  // navigate away (client router), come back
  await page.locator("header").getByRole("link", { name: "Download" }).first().click()
  await page.waitForURL("**/download/"); await page.waitForTimeout(800)
  check("leaving Home removes the hero viewer", (await page.locator("x3d-canvas").count()) === 0)
  await page.goBack(); await page.waitForURL(base + "/")
  const ok = await page.waitForFunction(() => document.querySelector(".viewer--hero")?.getAttribute("data-status") === "ready", null, { timeout: 30000 }).then(() => true, () => false)
  check("returning Home re-creates one viewer", ok && (await page.locator("x3d-canvas").count()) === 1)
  checkConsole("controls/navigation: no console errors or warnings", errors)
  await ctx.close()
}

// 4. Touch-style controls on a phone viewport.
{
  const { ctx, page, errors, stage } = await open({ width: 390, touch: true })
  await page.locator(".viewer--hero").scrollIntoViewIfNeeded()
  const sizes = await page.$$eval(".viewer--hero .tool", (els) => els.map((e) => Math.round(e.getBoundingClientRect().height)))
  check("touch: viewer tools are at least 44 px high", sizes.every((h) => h >= 44), sizes.join(","))
  await page.getByRole("button", { name: "Next viewpoint" }).tap(); await page.waitForTimeout(2200)
  const idx = await scene(page, "return Array.from(s.rootNodes).filter((n) => n?.getNodeTypeName?.() === 'Viewpoint').findIndex((n) => n.isBound)")
  check("touch: tapping Next viewpoint moves to Under the tower", idx === 1)
  await page.getByRole("button", { name: "Pause motion" }).tap(); await page.waitForTimeout(300)
  check("touch: tapping Pause motion stops the Clock", (await scene(page, "return s.getNamedNode('Clock').enabled")) === false)
  // one-finger drag via CDP touch events
  const box = await stage.boundingBox(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2
  const c0 = await camera(page)
  const cdp = await ctx.newCDPSession(page)
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: cx, y: cy }] })
  for (let i = 1; i <= 10; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: cx + i * 12, y: cy }] })
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
  await page.waitForTimeout(800)
  check("touch: one-finger drag turns the view", c0 !== (await camera(page)))
  await stage.screenshot({ path: `${out}/touch-390.png` })
  checkConsole("touch: no console errors or warnings", errors)
  await ctx.close()
}

// 5. Dark mode hero.
for (const width of [1440, 390]) {
  const { ctx, page, errors } = await open({ width, scheme: "dark" })
  await page.screenshot({ path: `${out}/home-dark-${width}.png` })
  checkConsole(`dark mode ${width}: hero ready, no errors`, errors)
  await ctx.close()
}

const sum = summarize(results)
writeFileSync(`${out}/report.json`, JSON.stringify({ summary: sum, results, reducedStartAngles: angles }, null, 2))
console.log(`\n${sum.pass} PASS, ${sum.warn} EXPECTED WARNING, ${sum.fail} FAIL (${sum.total} checks)`)
await browser.close()
process.exit(sum.exitCode)
