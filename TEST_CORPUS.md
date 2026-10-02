# FreeWRL test corpus — preservation and R2 publication

The upstream `freewrl.sourceforge.io/tests/` corpus, published unchanged at
**https://tests.freewrl.org/** from the Cloudflare R2 bucket **`freewrl-tests`**.
Published 2026-10-01. The website's `/tests/`, `/conformance/` and `/legacy/` links point
here (`SITE.testsBase`, `TESTS_BASE`), with folders linked as `<dir>/index.html`.

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
  `/<dir>/index.html`.
- Byte ranges work (206 with the correct `Content-Range`).
- No CORS policy: the site only links to these files, nothing fetches them cross-origin.

## Listing icons

The 250 saved listings reference 15 Apache icons as `/icons/<name>.gif`: `a`, `back`, `binary`,
`blank`, `compressed`, `folder`, `image2`, `layout`, `movie`, `p`, `sound2`, `tar`, `text`,
`unknown`, `world2`. The archive captured these live from `freewrl.sourceforge.io/icons/`
(`raw/freewrl.sourceforge.io/icons/`, matching `URL_MANIFEST.csv`). Added 2026-10-01 as
support objects under the key `icons/<name>.gif`, bytes unchanged: 15 objects, 4,359 bytes,
`image/gif`, `public, max-age=604800`. The bucket holds 3,685 objects, 1,144,179,526 bytes.
Hashes are in [`scripts/r2-tests/listing-icons.sha256`](scripts/r2-tests/listing-icons.sha256).
Unreferenced upstream icons were not uploaded.

## Executable-like files

The corpus includes historical helper programs and test assets with executable-style extensions.
They are upstream files, preserved byte for byte like every other file. Each matches
`tests-corpus.sha256` and the archive's `URL_MANIFEST.csv` (path, size, SHA-256, all `source=live`),
and each is linked from its saved upstream listing, dated 2022–2023.

| extension | files | bytes | Content-Type | where |
|---|---:|---:|---|---|
| `.class` | 135 | 309,549 | `application/octet-stream` | `25_Geospatial/x3dEarthExamples/population/` (a Java viewer and Apache Commons Math) |
| `.bat` | 21 | 11,231 | `text/plain` | run scripts in `28_Distributed_interactive_simulation/`, `41_Volume_rendering/`, `25_Geospatial/Mars/`, … |
| `.dll` | 6 | 442,368 | `application/octet-stream` | `brick`, `tiles`, `voronoi` in `10_Grouping/helpers/` and `numbered/helpers/` |
| `.jar` | 1 | 332,273 | `application/java-archive` | `25_Geospatial/x3dEarthExamples/population/uscensus.jar` |
| `.exe` | 1 | 1,497,600 | `application/octet-stream` | `41_Volume_rendering/unu.exe` (Teem 1.11 `unu`, called by the `run_unu*.bat` files) |

The corpus has no `.com`, `.scr`, `.msi`, `.cmd`, `.ps1`, `.vbs`, `.sh`, `.command` or `.app`
files. A magic-byte check of all 3,670 files found Windows PE headers only in the 7 `.exe`/`.dll`
files, no ELF or Mach-O binaries, and Java class headers only in the `.class` files. Other script and
source files (`.py` 10, `.vb` 15, `.pl` 3) are plain text. Two zips also hold `.class` or `.vb`
source: `x3dEarthExamples/Web3D2008_X3D-Earth_Mashups_Tutorial.zip` and `vbScreenShotProgram/Source_Files.zip`.

These files are served as static R2 objects, like the rest of the corpus. No `Content-Disposition` is set, so
`.bat` files display as text and the others download. Neither the website nor R2 runs them. There are
no user accounts. On 2026-10-01, Chrome downloaded `unu.exe` from its saved listing with no Safe Browsing
warning (download danger type: not dangerous). No file was opened, run or sent to an outside scanner.

Current policy: the files are preserved and served as they are, with no extra note on the website.
Adding a note, unlinking them from `/tests/`, or removing their public access is the owner's decision.

## Scripts

All need the account token from `.env.local` (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`); see README,
"Credentials". Run them as `scripts/cf-env.sh scripts/r2-tests/…`. Each checks the token
first and stops if it is missing or not active. Never commit the values.

- `scripts/r2-tests/upload.py <log.tsv> [--only keys.txt]` — uploads with `wrangler r2 object put --remote`.
- `scripts/r2-tests/put-s3.sh <keys.txt> <log.tsv>` — the Cloudflare API's WAF rejects keys containing `..`,
  so those 8 keys go through the R2 S3 endpoint.
- `scripts/r2-tests/verify.py <outdir>` — checks the bucket listing (corpus plus listing icons) (keys, sizes, metadata) and downloads
  every object from tests.freewrl.org to compare its SHA-256 with the manifest.
- `scripts/r2-tests/cf-audit.sh <outdir> <tag>` — snapshots Cloudflare state for before/after audits.

## Not changed

The archive, the website Worker `freewrl`, the redirect Worker, freewrl.org / www / .com hosts,
zone settings and analytics. Old HTML in the corpus may still request retired CDNs (rawgit,
assets-cdn.github.com, http x3dom.org) once per page load. No page loops.
