// Deterministic build-time copy of the archived upstream site into dist/legacy/.
//
// Source (read-only): the offline "browse" copy made by the archive job, see
//   ../archive-freewrl-site/HANDOFF.md and ARCHIVE_REPORT.md
// Nothing in the archive is modified. Each HTML page gets one small banner
// inserted right after <body> plus the safety transforms below (see
// LEGACY_TRANSFORMS.md); every other byte is copied as-is.
// tests/ (1.14 GB) is NOT copied: links into it are pointed at TESTS_BASE.
//
// Env:
//   FREEWRL_ARCHIVE_BROWSE  path to browse/freewrl.sourceforge.io
//   TESTS_BASE              where /tests/ lives (default: the R2 copy at
//                           tests.freewrl.org, see TEST_CORPUS.md)
//   SKIP_LEGACY=1           build without /legacy/ (never for a deploy)
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, extname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const src = process.env.FREEWRL_ARCHIVE_BROWSE ??
  join(root, "../archive-freewrl-site/browse/freewrl.sourceforge.io")
const out = join(root, "dist/legacy")
const TESTS_BASE = process.env.TESTS_BASE ?? "https://tests.freewrl.org/"
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

// Safety transforms: stop automatic third-party requests from the served copy.
// Exact source strings only; each is documented in LEGACY_TRANSFORMS.md, and the
// build fails if a count drifts from what was verified against the archive.
// Dead tracker images keep their URL as data-archived-src, so the markup still
// records it but nothing is fetched.
const archived = (url) => `data-archived-src="${url}"`
const TRANSFORMS = [
  { id: "clustrmaps-onerror-loop", expect: 2,
    // this.onError (capital E) never clears the real onerror handler, so the dead
    // fallback image re-fires onerror forever: ~2,800 requests/s.
    find: ` onerror="this.onError=null; this.src='http://clustrmaps.com/images/clustrmaps-back-soon.jpg'; document.getElementById('clustrMapsLink').href='http://clustrmaps.com'"`,
    replace: "" },
  { id: "clustrmaps-counter", expect: 2,
    find: 'src="http://www2.clustrmaps.com/counter/index2.php?url=http://freewrl.sourceforge.net"',
    replace: archived("http://www2.clustrmaps.com/counter/index2.php?url=http://freewrl.sourceforge.net") },
  { id: "sourceforge-sflogo", expect: 32,
    find: /src="(http:\/\/sourceforge\.net\/sflogo\.php\?[^"]*)"/g,
    replace: (_m, url) => archived(url) },
  { id: "android-play-badge", expect: 7,
    find: 'src="http://www.android.com/images/brand/android_app_on_play_logo_small.png"',
    replace: archived("http://www.android.com/images/brand/android_app_on_play_logo_small.png") },
  { id: "slashdotmedia-noscript-pixel", expect: 1,
    find: 'src="https://analytics.slashdotmedia.com/index.php?idsite=39"',
    replace: archived("https://analytics.slashdotmedia.com/index.php?idsite=39") },
  { id: "sourceforge-page-scripts", expect: 12,
    // index.htm is a 2026 capture of sourceforge.net/projects/freewrl/; these are
    // SourceForge's ad, consent and analytics bundles, not FreeWRL content.
    find: /<script src="(\/a\.fsdn\.com\/con\/js\/[^"]*)"(?: defer)?><\/script>/g,
    replace: (_m, url) => `<!-- freewrl-archive: SourceForge script ${url} not loaded -->` },
  { id: "faq-offsite-refresh", expect: 1,
    // faq.html was a redirect stub to the old site's home page; keep it inside the archive.
    find: 'content="0; url=http://freewrl.sourceforge.net/index.html"',
    replace: 'content="0; url=index.html"' },
]
const transformCounts = Object.fromEntries(TRANSFORMS.map((t) => [t.id, { files: 0, replacements: 0 }]))

function applyTransforms(s) {
  for (const t of TRANSFORMS) {
    let n = 0
    s = typeof t.find === "string"
      ? s.split(t.find).reduce((acc, part, i) => (i ? (n++, acc + t.replace + part) : part), "")
      : s.replace(t.find, (...m) => (n++, t.replace(...m)))
    if (n) { transformCounts[t.id].files++; transformCounts[t.id].replacements += n }
  }
  return s
}

function transformHtml(buf) {
  // latin1 keeps a 1:1 byte mapping, so non-UTF-8 pages survive untouched.
  let s = buf.toString("latin1")
  let links = 0
  // Keep explicit index.html: R2 has no directory indexes, so /<dir>/ is a 404
  // and only /<dir>/index.html opens the saved Apache listing.
  s = s.replace(testsLink, (_m, pre, rest) => {
    links++
    return pre + TESTS_BASE + rest
  })
  s = applyTransforms(s)
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
  safetyTransforms: transformCounts,
}, null, 2) + "\n")
console.log(`legacy: ${files} files (${pages} pages, ${rewritten} tests/ links -> ${TESTS_BASE}), ${(bytes / 1e6).toFixed(1)} MB`)
console.log("legacy safety transforms:", Object.entries(transformCounts).map(([id, c]) => `${id}=${c.replacements}/${c.files}f`).join(" "))
if (skipped.length) console.warn("skipped (>25 MiB):", skipped)
const drift = TRANSFORMS.filter((t) => transformCounts[t.id].replacements !== t.expect)
if (drift.length) {
  console.error("legacy safety transform counts changed; re-verify the archive and LEGACY_TRANSFORMS.md:",
    drift.map((t) => `${t.id} expected ${t.expect}, got ${transformCounts[t.id].replacements}`).join("; "))
  process.exit(1)
}
