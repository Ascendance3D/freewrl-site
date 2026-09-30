// Deterministic build-time copy of the archived upstream site into dist/legacy/.
//
// Source (read-only): the offline "browse" copy made by the archive job, see
//   ../archive-freewrl-site/HANDOFF.md and ARCHIVE_REPORT.md
// Nothing in the archive is modified. Each HTML page gets one small banner
// inserted right after <body>; every other byte is copied as-is.
// tests/ (1.14 GB) is NOT copied: links into it are pointed at TESTS_BASE.
//
// Env:
//   FREEWRL_ARCHIVE_BROWSE  path to browse/freewrl.sourceforge.io
//   TESTS_BASE              where /tests/ lives (default: the live upstream copy
//                           until tests.freewrl.org is published)
//   SKIP_LEGACY=1           build without /legacy/ (never for a deploy)
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, extname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const src = process.env.FREEWRL_ARCHIVE_BROWSE ??
  join(root, "../archive-freewrl-site/browse/freewrl.sourceforge.io")
const out = join(root, "dist/legacy")
const TESTS_BASE = process.env.TESTS_BASE ?? "https://freewrl.sourceforge.io/tests/"
const MAX_ASSET = 25 * 1024 * 1024 // Cloudflare Workers static asset limit

if (process.env.SKIP_LEGACY === "1") {
  console.warn("SKIP_LEGACY=1: /legacy/ not built")
  process.exit(0)
}
if (!existsSync(src)) {
  console.error(`archive not found: ${src}\nSet FREEWRL_ARCHIVE_BROWSE, or SKIP_LEGACY=1 for a local build without /legacy/.`)
  process.exit(1)
}

const BANNER =
  '<div id="freewrl-archive-banner" role="note" style="font:13px/1.4 ui-monospace,Menlo,Consolas,monospace;' +
  "background:#0e1a5c;color:#f3f1ec;padding:8px 14px;border-bottom:2px solid #f2c230;margin:0 0 8px 0;" +
  'text-align:left;letter-spacing:.02em">' +
  "Archived copy of freewrl.sourceforge.io &middot; Captured 2026-09-30 &middot; " +
  'Current site: <a href="/" style="color:#f2c230">freewrl.org</a> &middot; ' +
  '<a href="/history/" style="color:#f3f1ec">About this archive</a></div>'

const testsLink = /((?:href|src)\s*=\s*["'])(?:\.\.\/)*tests\/([^"'#?]*)/gi

function transformHtml(buf) {
  // latin1 keeps a 1:1 byte mapping, so non-UTF-8 pages survive untouched.
  let s = buf.toString("latin1")
  let links = 0
  s = s.replace(testsLink, (_m, pre, rest) => {
    links++
    return pre + TESTS_BASE + rest.replace(/(^|\/)index\.html$/i, "$1")
  })
  const body = /<body\b[^>]*>/i.exec(s)
  if (body) s = s.slice(0, body.index + body[0].length) + BANNER + s.slice(body.index + body[0].length)
  else s = BANNER + s
  return { out: Buffer.from(s, "latin1"), links }
}

let files = 0, pages = 0, bytes = 0, rewritten = 0
const skipped = []
function walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name)
    const rel = relative(src, p)
    if (rel === "tests") continue
    const st = statSync(p)
    if (st.isDirectory()) { walk(p); continue }
    if (st.size > MAX_ASSET) { skipped.push(rel); continue }
    const dest = join(out, rel)
    mkdirSync(dirname(dest), { recursive: true })
    const ext = extname(name).toLowerCase()
    if (ext === ".html" || ext === ".htm") {
      const { out: b, links } = transformHtml(readFileSync(p))
      writeFileSync(dest, b)
      pages++; rewritten += links; bytes += b.length
    } else {
      copyFileSync(p, dest)
      bytes += st.size
    }
    files++
  }
}
walk(src)
writeFileSync(join(out, "_legacy-build.json"), JSON.stringify({
  source: "freewrl.sourceforge.io, offline browse copy",
  captured: "2026-09-29/30",
  testsBase: TESTS_BASE,
  files, htmlPages: pages, testsLinksRewritten: rewritten, bytes,
  skippedOverAssetLimit: skipped,
}, null, 2) + "\n")
console.log(`legacy: ${files} files (${pages} pages, ${rewritten} tests/ links -> ${TESTS_BASE}), ${(bytes / 1e6).toFixed(1)} MB`)
if (skipped.length) console.warn("skipped (>25 MiB):", skipped)
