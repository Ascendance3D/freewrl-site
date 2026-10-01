# FreeWRL test corpus — preservation and R2 publication

The upstream `freewrl.sourceforge.io/tests/` corpus, published unchanged at
**https://tests.freewrl.org/** from the Cloudflare R2 bucket **`freewrl-tests`**.
Published 2026-10-01. The website does not link here yet; its `/tests/` links still
point to the upstream copy until this corpus passes independent QA.

## Source

| | |
|---|---|
| archive | `~/Projects/cybertown/freewrl/archive-freewrl-site/raw/freewrl.sourceforge.io/tests/` (sealed capture of 2026-09-29/30, read-only) |
| files | 3,670 (3,420 files + 250 saved Apache directory listings, `<dir>/index.html`) |
| bytes | 1,144,175,167 |
| directories | 249 |
| manifest | [`scripts/r2-tests/tests-corpus.sha256`](scripts/r2-tests/tests-corpus.sha256) — SHA-256 of every file, paths relative to `tests/` |
| manifest SHA-256 | `5372c0d4e963a845083afbfb4f165f3d42fd2b54823b4f7c95f99a9d263c5d43` |

Every manifest entry matches the archive's own `URL_MANIFEST.csv` (path, size and SHA-256).

## Known missing file

**`41_Volume_rendering/supine.nrrd`** (about 213 MB, listed upstream 2022-09-12) is not in the
corpus and not in R2. SourceForge refuses to serve it ("Files on SourceForge.net Project Web
sites are limited to a max size", HTTP 410, also for byte ranges past ~20 MB). There is no
Wayback Machine copy and no copy in the local FreeWRL repositories. No placeholder was made;
`https://tests.freewrl.org/41_Volume_rendering/supine.nrrd` returns 404. The upstream listing
`41_Volume_rendering/index.html` still names it, unchanged. The smaller `supine128.nrrd` and the
skull data are preserved.

## Objects

- Key = path relative to `tests/`, no prefix: `tests/7_Core/x.wrl` → `https://tests.freewrl.org/7_Core/x.wrl`.
- Bytes unchanged. Paths keep upstream spelling, spaces, `[]`, `+`, `$` and `..` (e.g. `11_fogcoord..x3d`).
- Four files exceed the 25 MiB Workers asset limit and are why the corpus is on R2:
  `41_Volume_rendering/backpack.nrrd` (97,779,845), `28_Distributed_interactive_simulation/David Laflam Thesis.pdf`
  (67,063,525), `41_Volume_rendering/brain.nrrd` (60,293,252), `41_Volume_rendering/body.nrrd` (59,244,664).
- Content-Type: from the table in `scripts/r2-tests/upload.py` (`.wrl` `model/vrml`, `.x3d` `model/x3d+xml`,
  `.x3dv` `model/x3d-vrml`, …). Types without a registered or certain MIME type — `.nrrd`, `.bvh`,
  `.web3dit`, `.dds`, `.blend`, `.class`, `.exe`, `.dll`, `.x3dz`, `.x3dj`, … — are `application/octet-stream`.
- Cache-Control: HTML/XHTML `public, max-age=3600, no-transform`; everything else `public, max-age=604800`.
  `no-transform` is required: the freewrl.org zone has Automatic HTTPS Rewrites and Email
  Obfuscation on, and without it Cloudflare rewrote `http://` URLs inside archived HTML.
- No directory indexes: `/` and `/<dir>/` return 404. The saved upstream listings work at
  `/<dir>/index.html`. Their `/icons/*.gif` images 404.
- Byte ranges work (206 with the correct `Content-Range`).
- No CORS policy: the site only links to these files, nothing fetches them cross-origin.

## Scripts

All need `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the environment. Never commit them.

- `scripts/r2-tests/upload.py <log.tsv> [--only keys.txt]` — uploads with `wrangler r2 object put --remote`.
- `scripts/r2-tests/put-s3.sh <keys.txt> <log.tsv>` — the Cloudflare API's WAF rejects keys containing `..`,
  so those 8 keys go through the R2 S3 endpoint.
- `scripts/r2-tests/verify.py <outdir>` — checks the bucket listing (keys, sizes, metadata) and downloads
  every object from tests.freewrl.org to compare its SHA-256 with the manifest.
- `scripts/r2-tests/cf-audit.sh <outdir> <tag>` — snapshots Cloudflare state for before/after audits.

## Not changed

The archive, the website Worker `freewrl`, the redirect Worker, freewrl.org / www / .com hosts,
zone settings and analytics. Old HTML in the corpus may still request retired CDNs (rawgit,
assets-cdn.github.com, http x3dom.org) once per page load. No page loops.
