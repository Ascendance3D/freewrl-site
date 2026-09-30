// Functional QA for the local preview (headless Chrome on the GPU).
// Usage: node qa/functional.mjs [baseURL]   — exits 1 if any check fails.
import { chromium } from "playwright-core"

const base = process.argv[2] ?? "http://127.0.0.1:8788"
const GPU = ["--headless=new", "--no-sandbox", "--use-gl=angle", "--use-angle=gl", "--enable-gpu", "--ignore-gpu-blocklist"]
const results = []
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`) }

async function launch(extra = []) {
  return chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: [...GPU, ...extra] })
}
function watch(page, bucket) {
  page.on("pageerror", (e) => bucket.push(`pageerror ${e.message}`))
  // archived /legacy/ pages reference dead third-party hosts; that is archive content, not site errors
  page.on("console", (m) => m.type() === "error" && !/404 \(Not Found\)/.test(m.text()) && !page.url().includes("/legacy/") && bucket.push(`console ${m.text()}`))
}
const waitStatus = (page, sel, want, timeout = 20000) =>
  page.waitForFunction(([s, w]) => document.querySelector(s)?.getAttribute("data-status") === w, [sel, want], { timeout }).then(() => true, () => false)
const sceneText = (page) => page.evaluate(() => document.querySelector("x3d-canvas")?.browser.currentScene.toVRMLString() ?? "")

const browser = await launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errors = []
watch(page, errors)

// GPU
await page.goto(base + "/", { waitUntil: "networkidle" })
const renderer = await page.evaluate(() => { const gl = document.createElement("canvas").getContext("webgl2"); const d = gl.getExtension("WEBGL_debug_renderer_info"); return gl.getParameter(d.UNMASKED_RENDERER_WEBGL) })
check("real GPU WebGL", /NVIDIA/.test(renderer), renderer)

// Home hero loads (VRML97)
check("home hero VRML loads in X_ITE", await waitStatus(page, ".viewer--hero", "ready"))
const hero = await sceneText(page)
check("hero scene has the Hand, Gyro ring and Clock", hero.includes("DEF Hand") && hero.includes("DEF Gyro") && hero.includes("DEF Clock"))
check("X_ITE label present", (await page.textContent(".viewer__credit")).includes("Web preview: X_ITE 16.4.1"))
check("FreeWRL label present", (await page.textContent(".viewer__credit")).includes("Native viewer: FreeWRL"))
check("X_ITE loaded from self-hosted path", await page.evaluate(() => performance.getEntriesByType("resource").some((r) => r.name.includes("/x_ite/16.4.1/x_ite.min.mjs"))))

// Teardown on client-side navigation
await page.evaluate(() => { window.__xc = document.querySelector("x3d-canvas"); window.__gl = window.__xc.shadowRoot.querySelector("canvas") })
await page.click('.masthead__nav a[href="/download/"]')
await page.waitForURL("**/download/")
await page.waitForTimeout(1200)
const td = await page.evaluate(() => ({ connected: window.__xc.isConnected, lost: (window.__gl.getContext("webgl2") ?? window.__gl.getContext("webgl"))?.isContextLost?.() ?? "n/a", canvases: document.querySelectorAll("x3d-canvas").length, title: document.title }))
check("viewer removed on navigation", !td.connected && td.canvases === 0, JSON.stringify(td))
check("WebGL context released on unmount", td.lost === true, String(td.lost))
check("SPA navigation updates title", td.title.startsWith("Download"), td.title)
await page.goBack(); await page.waitForURL(base + "/")
check("back button returns to home and re-creates viewer", await waitStatus(page, ".viewer--hero", "ready"))

// Learn: controls change the world
await page.goto(base + "/learn/", { waitUntil: "networkidle" })
check("learn viewer loads", await waitStatus(page, ".lab-bench .viewer", "ready"))
check("lesson 1 starts as a Box", (await sceneText(page)).includes("Box"))
await page.click('.segmented button:has-text("Sphere")')
await page.waitForTimeout(900)
check("choosing Sphere changes the scene", /Sphere/.test(await sceneText(page)) && !/Box \{/.test(await sceneText(page)))
const before = await sceneText(page)
await page.fill('input[type="range"]', "3.4")
await page.waitForTimeout(900)
const after = await sceneText(page)
check("moving the Size slider changes the scene", before !== after && after.includes("1.7"), "radius 1.7 expected")
await page.click('.swatches button[aria-label="orange"]')
await page.waitForTimeout(900)
check("colour swatch changes diffuseColor", (await sceneText(page)).includes("1 0.48 0.1"))
check("changed numbers are highlighted in the source", (await page.$$eval("mark.param", (m) => m.map((x) => x.textContent))).includes("1 0.48 0.1"))
// edit text: a blocked token keeps the last good world and explains why
await page.click('button:has-text("Edit the text")')
await page.fill("textarea.listing__edit", '#VRML V2.0 utf8\nScript { url "javascript:alert(1)" }')
await page.waitForTimeout(600)
check("blocked tokens are refused with a message", /turned off in this editor/.test(await page.textContent("#edit-status")))
check("last good world stays on screen", /Sphere/.test(await sceneText(page)))
await page.fill("textarea.listing__edit", "#VRML V2.0 utf8\nShape { geometry Cone { height 3 } }")
await page.waitForTimeout(900)
check("hand-edited source updates the scene", /Cone/.test(await sceneText(page)))
await page.click('button:has-text("Reset to controls")')
for (const [i, name] of ["Build an object", "Build a room", "Build a world"].entries()) {
  await page.click(`.steps button:has-text("${name}")`)
  await page.waitForTimeout(1200)
  const t = await sceneText(page)
  check(`lesson ${i + 2} (${name}) renders`, t.length > 200 && (i < 2 || t.includes("TimeSensor")))
}
await page.fill('input[type="range"] >> nth=0', "3")
await page.waitForTimeout(900)
check("lesson 4 cycleInterval slider reaches the TimeSensor", /cycleInterval 3\b/.test(await sceneText(page)))

// Lab: X3D XML + VRML + click-to-load
await page.goto(base + "/lab/", { waitUntil: "networkidle" })
const lab = await page.$$(".exhibit-row .viewer")
await lab[0].scrollIntoViewIfNeeded()
check("X3D XML example loads", await waitStatus(page, ".exhibit-row:nth-of-type(1) .viewer", "ready").then(async (ok) => ok || (await lab[0].getAttribute("data-status")) === "ready"))
await lab[1].scrollIntoViewIfNeeded(); await page.waitForTimeout(3000)
check("VRML97 example (1998 cone) loads", (await lab[1].getAttribute("data-status")) === "ready")
check("click-to-load viewers wait for the reader", (await lab[2].getAttribute("data-status")) === "idle")
await lab[2].scrollIntoViewIfNeeded(); await (await lab[2].$("button.btn--live")).click(); await page.waitForTimeout(5000)
check("teapot loads after click", (await lab[2].getAttribute("data-status")) === "ready")
await lab[3].scrollIntoViewIfNeeded(); await (await lab[3].$("button.btn--live")).click(); await page.waitForTimeout(5000)
check("panorama (texture from /legacy/) loads after click", (await lab[3].getAttribute("data-status")) === "ready")
await page.click("details.source-view >> nth=0")
await page.waitForTimeout(800)
check("View source fetches the file", (await page.textContent("details.source-view >> nth=0")).includes("<X3D"))

// Legacy is a real static archive, not SPA routing
await page.goto(base + "/", { waitUntil: "networkidle" })
await page.click(".masthead__legacy")
await page.waitForURL("**/legacy/", { waitUntil: "domcontentloaded" })
check("Legacy link does a full page load with the banner", !!(await page.$("#freewrl-archive-banner")) && !(await page.$("#root")))
const s404 = await page.goto(base + "/legacy/does-not-exist.html", { waitUntil: "domcontentloaded" })
check("missing legacy file is a real 404", s404.status() === 404)
const sUse = await page.goto(base + "/legacy/use.html", { waitUntil: "domcontentloaded" })
check("legacy page use.html served", sUse.status() === 200 && (await page.textContent("#freewrl-archive-banner")).includes("Captured 2026-09-30"))

// Every route returns 200 prerendered HTML with content before JS
for (const p of ["/", "/download/", "/use/", "/build/", "/lab/", "/learn/", "/conformance/", "/tests/", "/history/", "/contribute/"]) {
  const r = await fetch(base + p)
  const html = await r.text()
  check(`prerendered ${p}`, r.status === 200 && /<h1/.test(html) && html.includes(`https://freewrl.org${p}`), `${r.status}`)
}
const nf = await fetch(base + "/no-such-page/")
check("unknown path is 404 with noindex", nf.status === 404 && (await nf.text()).includes("noindex"))

// Conformance never presents upstream claims as measured
await page.goto(base + "/conformance/", { waitUntil: "networkidle" })
const conf = await page.textContent("main")
const rows = await page.$$eval(".component tbody tr", (r) => r.length)
const untested = await page.$$eval(".component tbody tr td:last-child", (c) => c.filter((x) => x.textContent.trim() === "not yet tested").length)
check("conformance: every measured cell says not yet tested (no results recorded)", conf.includes("Upstream claim") && rows > 300 && rows === untested, `${untested}/${rows}`)
await page.fill('input[type="search"]', "Extrusion")
check("conformance search filters", (await page.textContent(".filters__count")).trim() === "1 rows")

// Tests browser
await page.goto(base + "/tests/", { waitUntil: "networkidle" })
await page.click('button.linkish:has-text("7_Core/")')
check("test corpus browser opens a folder", (await page.textContent(".browser")).includes("tests/7_Core/"))

check("no uncaught errors on the main browser run", errors.length === 0, errors.slice(0, 3).join(" | "))
await browser.close()

// Reduced motion: clocks are stopped, and the button says so
{
  const b = await launch()
  const p = await (await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" })).newPage()
  await p.goto(base + "/", { waitUntil: "networkidle" })
  await waitStatus(p, ".viewer--hero", "ready")
  const enabled = await p.evaluate(() => document.querySelector("x3d-canvas").browser.currentScene.getNamedNode("Clock").enabled)
  check("reduced motion stops the hero animation", enabled === false)
  check("reduced motion offers Play motion", (await p.textContent(".viewer__tools")).includes("Play motion"))
  await b.close()
}

// No WebGL: fallback text, no crash
{
  const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--headless=new", "--no-sandbox", "--disable-webgl", "--disable-3d-apis"] })
  const p = await (await b.newContext()).newPage()
  const errs = []; watch(p, errs)
  await p.goto(base + "/", { waitUntil: "networkidle" })
  await p.waitForTimeout(800)
  check("no-WebGL fallback shown", (await p.getAttribute(".viewer--hero", "data-status")) === "nowebgl" && (await p.textContent(".viewer--hero")).includes("no WebGL"))
  check("no-WebGL page still has the headline", (await p.textContent("h1")).includes("The old Web"))
  check("no-WebGL has no uncaught errors", errs.length === 0, errs.join(" | "))
  await b.close()
}

// A Cloudflare Web Analytics beacon (as injected by RUM auto-setup) must not break X_ITE
{
  const b = await launch()
  const c = await b.newContext()
  await c.route(base + "/", async (route) => {
    const r = await route.fetch(); let body = await r.text()
    body = body.replace("</body>", '<script defer src="https://static.cloudflareinsights.com/beacon.min.js/v8b253dfea2ab4077af8c6f58422dfbfd1689876627854" data-cf-beacon=\'{"token":"x"}\'></script></body>')
    await route.fulfill({ response: r, body })
  })
  await c.route("https://static.cloudflareinsights.com/**", (route) => route.fulfill({ status: 200, contentType: "text/javascript", body: "/* stub beacon */" }))
  const p = await c.newPage()
  await p.goto(base + "/", { waitUntil: "networkidle" })
  const ok = await waitStatus(p, ".viewer--hero", "ready")
  const wrong = await p.evaluate(() => performance.getEntriesByType("resource").filter((r) => r.name.includes("cloudflareinsights.com") && r.name.includes("assets")).length)
  check("X_ITE still works with an injected RUM beacon", ok && wrong === 0, `asset requests to beacon host: ${wrong}`)
  await b.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
