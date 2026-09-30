// Renders public/og-image.png (1200x630) from HTML with the site's own V2 fonts
// (Source Serif 4 + IBM Plex Mono) and the Home page's figure-and-label layout.
// Run after `npm run build` with the local server up: node scripts/make-og.mjs
import { chromium } from "playwright-core"
const base = process.argv[2] ?? "http://127.0.0.1:8788"
const html = `<!doctype html><html><head><style>
@font-face{font-family:S;src:url(${base}/og/serif.woff2) format("woff2");font-weight:200 900}
@font-face{font-family:S;src:url(${base}/og/serif-italic.woff2) format("woff2");font-weight:200 900;font-style:italic}
@font-face{font-family:M;src:url(${base}/og/mono.woff2) format("woff2");font-weight:500}
html,body{margin:0;width:1200px;height:630px;background:#070b24;color:#fff;overflow:hidden}
body{background-image:linear-gradient(rgb(46 196 255/.06) 1px,transparent 1px),linear-gradient(90deg,rgb(46 196 255/.06) 1px,transparent 1px);background-size:48px 48px;position:relative;font-family:S}
.fig{position:absolute;left:600px;top:48px;width:552px;height:470px;border:1px solid rgb(46 196 255/.45);background:#05081c;display:flex;align-items:center;justify-content:center}
.fig img{width:400px}
.cap{position:absolute;left:600px;top:530px;font:500 14px/1 M;letter-spacing:.06em;text-transform:uppercase;color:#aab3d6}
.cap b{font-weight:500;color:#2ec4ff}
.label{position:absolute;left:48px;top:48px;width:504px;border-top:1px solid #f2c230;padding-top:14px}
.k{font:500 14px/1.4 M;letter-spacing:.06em;color:#f2c230;text-transform:uppercase}
h1{margin:22px 0 0;font-weight:600;font-size:58px;line-height:1.08;letter-spacing:-.015em}
p{margin:20px 0 0;font:italic 28px/1.3 S;color:#dfe4f7;text-wrap:balance}
.w{position:absolute;left:48px;bottom:48px;font:500 16px/1 M;letter-spacing:.06em;color:#fff;text-transform:uppercase}
.w span{color:#aab3d6}
</style></head><body>
<div class="label">
<div class="k">FreeWRL · native VRML97 / X3D browser</div>
<h1>The old Web was made of pages.</h1>
<p>Some of us thought it would be made of worlds.</p>
</div>
<div class="fig"><img src="${base}/brand/freewrl-mark-512.png"></div>
<div class="cap"><b>Fig. 1</b> — The hand-and-eye mark · since 1998</div>
<div class="w">freewrl.org <span>· open source · LGPL</span></div>
</body></html>`
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--headless=new", "--no-sandbox"] })
const p = await (await b.newContext({ viewport: { width: 1200, height: 630 } })).newPage()
await p.route(`${base}/og/**`, async (route) => {
  const f = { "serif.woff2": "@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2",
    "serif-italic.woff2": "@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-italic.woff2",
    "mono.woff2": "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2" }[route.request().url().split("/").pop()]
  route.fulfill({ path: new URL(`../node_modules/${f}`, import.meta.url).pathname, contentType: "font/woff2" })
})
await p.setContent(html, { waitUntil: "networkidle" })
await p.evaluate(() => document.fonts.ready)
await p.screenshot({ path: new URL("../public/og-image.png", import.meta.url).pathname })
await b.close()
console.log("public/og-image.png written")
