// Renders public/og-image.png (1200x630) from HTML with the site's own fonts.
// Run after `npm run build` with the local server up: node scripts/make-og.mjs
import { chromium } from "playwright-core"
const base = process.argv[2] ?? "http://127.0.0.1:8788"
const html = `<!doctype html><html><head><link rel="stylesheet" href="${base}/og-fonts.css"><style>
@font-face{font-family:A;src:url(${base}/og/archivo.woff2) format("woff2");font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:S;src:url(${base}/og/serif-italic.woff2) format("woff2");font-style:italic}
@font-face{font-family:M;src:url(${base}/og/mono.woff2) format("woff2")}
html,body{margin:0;width:1200px;height:630px;background:#070b24;color:#fff;overflow:hidden}
body{background-image:linear-gradient(rgb(46 196 255/.07) 1px,transparent 1px),linear-gradient(90deg,rgb(46 196 255/.07) 1px,transparent 1px);background-size:48px 48px;position:relative;font-family:A}
.m{position:absolute;right:40px;top:70px;width:470px}
.k{position:absolute;left:56px;top:48px;font:14px/1 M;letter-spacing:.08em;color:#f2c230;text-transform:uppercase}
h1{position:absolute;left:56px;top:120px;margin:0;font-weight:800;font-stretch:125%;font-size:78px;line-height:.92;text-transform:uppercase;width:680px}
p{position:absolute;left:56px;bottom:92px;margin:0;font:italic 30px/1.2 S;color:#dfe4f7;width:620px}
.w{position:absolute;left:56px;bottom:40px;font:16px/1 M;letter-spacing:.08em;color:#aab3d6;text-transform:uppercase}
.r{position:absolute;left:56px;right:56px;bottom:74px;border-top:1px solid #f2c230}
</style></head><body>
<div class="k">FreeWRL · native VRML97 / X3D browser · since 1998</div>
<h1>The old Web was made of pages.</h1>
<p>Some of us thought it would be made of worlds.</p>
<div class="r"></div><div class="w">freewrl.org</div>
<img class="m" src="${base}/brand/freewrl-mark-512.png">
</body></html>`
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--headless=new", "--no-sandbox"] })
const p = await (await b.newContext({ viewport: { width: 1200, height: 630 } })).newPage()
await p.route(`${base}/og/**`, async (route) => {
  const f = { "archivo.woff2": "@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2",
    "serif-italic.woff2": "@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-italic.woff2",
    "mono.woff2": "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2" }[route.request().url().split("/").pop()]
  route.fulfill({ path: new URL(`../node_modules/${f}`, import.meta.url).pathname, contentType: "font/woff2" })
})
await p.route(`${base}/og-fonts.css`, (r) => r.fulfill({ body: "", contentType: "text/css" }))
await p.setContent(html, { waitUntil: "networkidle" })
await p.evaluate(() => document.fonts.ready)
await p.screenshot({ path: new URL("../public/og-image.png", import.meta.url).pathname })
await b.close()
console.log("public/og-image.png written")
