// Writes one static HTML file per route (plus 404.html) from the SSR build.
// Title, description, canonical and OpenGraph URL are set per route.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dist = join(root, "dist")
const ssr = await import(pathToFileURL(join(root, "dist-ssr/entry-server.js")).href)
const template = readFileSync(join(dist, "index.html"), "utf8")
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")

function page(path, route) {
  const html = ssr.render(path)
  let out = template.replace("<!--app-->", html)
  const title = route ? route.title : "Not found — FreeWRL"
  const desc = route ? route.description : "This address has no page. The archived old site is at /legacy/."
  const url = ssr.SITE.origin + (path === "/" ? "/" : `${path}/`)
  out = out
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(desc)}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(title)}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(desc)}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
  if (!route) out = out.replace(/<link rel="canonical"[^>]*>\n?\s*/, "").replace("<head>", '<head>\n    <meta name="robots" content="noindex" />')
  return out
}

for (const r of ssr.ROUTES) {
  const file = r.path === "/" ? join(dist, "index.html") : join(dist, r.path, "index.html")
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, page(r.path, r))
}
writeFileSync(join(dist, "404.html"), page("/__not_found__", null))
writeFileSync(join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ssr.ROUTES.map((r) => `  <url><loc>${ssr.SITE.origin}${r.path === "/" ? "/" : `${r.path}/`}</loc></url>`).join("\n") +
  `\n</urlset>\n`)
rmSync(join(root, "dist-ssr"), { recursive: true, force: true })
console.log(`prerendered ${ssr.ROUTES.length} routes + 404.html + sitemap.xml`)
