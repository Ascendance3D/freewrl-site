import { chromium } from "playwright-core"
const [,, base, paths = "/", width = "390"] = process.argv
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--headless=new", "--no-sandbox"] })
const p = await (await b.newContext({ viewport: { width: Number(width), height: 844 } })).newPage()
for (const path of paths.split(",")) {
  await p.goto(base + path, { waitUntil: "networkidle" })
  const r = await p.evaluate(() => {
    const W = document.documentElement.clientWidth, out = []
    for (const el of document.querySelectorAll("body *")) {
      const b = el.getBoundingClientRect()
      if (b.right > W + 1 && b.width > 0) out.push(`${el.parentElement?.className}>${el.tagName.toLowerCase()}.${[...el.classList].join(".")} ${(el.getAttribute("href")||"").slice(0,40)} right=${Math.round(b.right)} w=${Math.round(b.width)}`)
    }
    return { W, scroll: document.documentElement.scrollWidth, out: out.slice(0, 8) }
  })
  console.log(path, JSON.stringify(r))
}
await b.close()
