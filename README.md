# freewrl.org

Website for FreeWRL, the open-source native VRML97/X3D browser.
Vite + React + TypeScript, prerendered to static HTML, served as Cloudflare
Worker static assets. Plan and decisions: `IMPLEMENTATION_PLAN.md`.

## Run it

```sh
npm ci
npm run dev          # Vite dev server (no /legacy/)
npm run build        # dist/: prerendered pages + /legacy/ + X_ITE copy
qa/serve.sh          # local-only wrangler dev on http://127.0.0.1:8788 (restart after each build)
node qa/functional.mjs   # 53 checks, headless Chrome on the GPU
node qa/shots.mjs http://127.0.0.1:8788 qa-artifacts/shots /,/learn/ 1440,390 light
```

`npm run build` needs the archive at `../archive-freewrl-site/browse/freewrl.sourceforge.io`
(or `FREEWRL_ARCHIVE_BROWSE=...`). `SKIP_LEGACY=1` builds without `/legacy/` — never deploy that.

There is deliberately no `deploy` script. Production changes need Ryan's approval.

## Where things come from

| path | source | how |
|---|---|---|
| `src/data/releases.json` | GitHub Releases, `Ascendance3D/freewrl` | `npm run data:releases` |
| `src/data/conformance.upstream.json` | archived upstream `conformance.html` | `scripts/data/parse_conformance.py` — upstream **claims**, verbatim |
| `src/data/conformance.measured.json` | results measured on current builds | empty until tests are run; schema inside |
| `src/data/use.json` | archived `use.html`, checked against engine source | `scripts/data/mkuse.py` |
| `src/data/history.json` | archived upstream pages + engine README | `scripts/data/build_history.py` |
| `public/data/tests-manifest.json` | archive `URL_MANIFEST.csv` | `scripts/make_tests_manifest.py` |
| `public/media/archive/` | archived images, resized to WebP/JPEG | `scripts/make_archive_media.py`; originals stay under `/legacy/` |
| `public/worlds/freewrl-landing.wrl` | written for this site; design notes in `LANDING_WORLD_DIRECTION.md` | `npm run world:hero` (`scripts/gen-landing-world.mjs`) |
| `public/worlds/four-primitives.x3d` | written for this site | by hand |
| `public/x_ite/<version>/` | npm `x_ite` (MIT), exact version in `package.json` | `scripts/sync-xite.mjs` (gitignored, runs on dev/build) |
| `dist/legacy/` | offline copy of freewrl.sourceforge.io, 2026-09-29/30 | `scripts/build-legacy.mjs` adds one banner per page; `tests/` excluded |

## Logo and icons

- `logo-work/1.png` (white lettering) and `logo-work/2.png` (dark lettering) are
  1254 px remakes of the official FreeWRL hand-and-eye logo. The official
  128 px logo stays the source of record: `docs/assets/freewrl-logo-128.png` in
  `Ascendance3D/freewrl` (from `X3DFreeWRLIcon.icns`). Who produced the remakes is
  not recorded here yet — add it.
- Licence: same as FreeWRL (GNU LGPL 3.0 or later), as a derivative of the official logo.
  The upstream site says the logo was based on Larry Ewing's Linux penguin logo.
- `scripts/make_brand.py` removes ~1,200 near-invisible stray blue pixels from the
  source alpha, and writes `public/brand/*` (on-dark and on-light logos, mark-only)
  plus favicons. The favicon is the hand and eye only. Sources are not modified.
- `logo-work/EIA_*` are mood references of unknown licence. Gitignored. Never ship them.
- `public/og-image.png`: `node scripts/make-og.mjs` with the local server running.

## X_ITE

The live 3D is drawn by X_ITE in the browser, not by FreeWRL. Every viewer says so.
X_ITE is loaded as an ES module from `/x_ite/<version>/`, so it finds its
components from `import.meta.url`. An injected Cloudflare Web Analytics beacon cannot
redirect it (a QA check proves this). Web Analytics auto-injection should still stay
off for this zone. To use the CDN instead: `VITE_XITE_BASE=https://cdn.jsdelivr.net/npm/x_ite@16.4.1/dist/`.
