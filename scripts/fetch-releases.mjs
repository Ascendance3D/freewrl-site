// Snapshot GitHub releases of Ascendance3D/freewrl into src/data/releases.json.
// The site renders only this snapshot: no runtime call to api.github.com.
// Run: node scripts/fetch-releases.mjs   (uses GITHUB_TOKEN if set)
import { writeFileSync } from "node:fs"

const REPO = "Ascendance3D/freewrl"
const headers = { Accept: "application/vnd.github+json", "User-Agent": "freewrl.org-build" }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=30`, { headers })
if (!res.ok) { console.error(`GitHub API ${res.status}`); process.exit(1) }
const raw = await res.json()

const releases = []
for (const r of raw.filter((r) => !r.draft)) {
  const assets = []
  for (const a of r.assets) {
    if (a.name.endsWith(".sha256")) continue
    const sumAsset = r.assets.find((s) => s.name === `${a.name}.sha256`)
    let sha256 = null
    if (sumAsset) {
      const t = await (await fetch(sumAsset.browser_download_url, { headers: { "User-Agent": headers["User-Agent"] } })).text()
      sha256 = /\b[0-9a-f]{64}\b/.exec(t)?.[0] ?? null
    }
    assets.push({ name: a.name, size: a.size, url: a.browser_download_url, sha256, sha256Url: sumAsset?.browser_download_url ?? null })
  }
  const body = r.body ?? ""
  releases.push({
    tag: r.tag_name, name: r.name, url: r.html_url, prerelease: r.prerelease,
    published: r.published_at, sourceCommit: /Source commit:\s*`([0-9a-f]{7,40})`/.exec(body)?.[1] ?? null,
    body, assets,
  })
}
writeFileSync(new URL("../src/data/releases.json", import.meta.url),
  JSON.stringify({ repo: REPO, fetched: new Date().toISOString().slice(0, 10), releases }, null, 2) + "\n")
console.log(`${releases.length} releases`)
