# freewrl.org v1 — implementation plan

Written 2026-09-30. Scope: local/preview candidate only. Production, DNS,
Worker routes, redirects and R2 are out of scope until Ryan approves.

## Source-of-truth paths (verified 2026-09-30)

| what | path | state |
|---|---|---|
| live site source | `~/Projects/cybertown/freewrl/freewrl-site/` | was unversioned; ignored by the workspace root repo (`/.gitignore:14 /*`). Local repo created here: `main` = baseline as found, work on `redesign/v1`. No remote. |
| `~/Projects/freewrl-site/` | — | does not exist |
| www redirect Worker | `~/Projects/cybertown/freewrl/freewrl-www-redirect/` | untouched (301 today; the 308 plan is a later lane) |
| engine (read-only) | `~/Projects/cybertown/freewrl/freewrl-git/` → GitHub `Ascendance3D/freewrl`, default branch `master` | not modified |
| archive (read-only) | `~/Projects/cybertown/freewrl/archive-freewrl-site/` (`HANDOFF.md`, `ARCHIVE_REPORT.md`) | never written |
| release data | GitHub Releases of `Ascendance3D/freewrl`: `v6.7.0-macos-beta.1`, `v6.7.0-macos-beta.2` (both pre-release, macOS arm64) | snapshot in `src/data/releases.json` |

## Architecture as found

Vite 8 + React 19 + TypeScript + Tailwind 4 + shadcn template; one
"Coming soon" component. Cloudflare Worker `freewrl` serving `./dist` as static
assets with `not_found_handling: single-page-application`. Canonical/OG
metadata pointed at `freewrl.com`. No Web Analytics snippet in source.

## Architecture now

- Same stack (Vite + React + TS + Tailwind). shadcn/Geist/lucide removed.
  Tailwind supplies preflight only; the look is hand-written CSS
  (`src/styles/`), tokens as custom properties.
- Tiny History-API router (`src/router.tsx`), no dependency.
- Static prerender: `vite build` (client) + `vite build --ssr` →
  `scripts/prerender.mjs` writes `dist/<route>/index.html` with per-route
  title, description, canonical (`https://freewrl.org/...`), OG tags.
  The client hydrates. Every page is readable without JS.
- `wrangler.jsonc`: `not_found_handling` → `404-page`, so unknown paths
  (including broken legacy links) get a real 404, not the React app.
- Content is data: `src/data/*.json` (conformance, use/keys, history,
  releases, archive media). Pages render the data.

## Information architecture

`/` Home · `/download` · `/use` · `/build` · `/lab` (Examples) ·
`/learn` (Make something) · `/conformance` · `/tests` (test corpus) ·
`/history` (History & credits) · `/contribute` · `/legacy/` (static archive) · 404.

## Visual system

Interactive technical editorial + digital museum + Web3D workshop.
- Paper `#f3f1ec` / ink `#101114` pages; cobalt `#1a2e8c` "exhibit" bands
  taken from the CRC poster; gold `#f2c230` for annotation only; cyan
  `#2ec4ff` marks live/interactive 3D only; orange lives only in the logo.
  Dark mode follows the OS.
- Type (iteration 2, see `DESIGN_V2_DIRECTION.md`): Source Serif 4 for
  headings and reading, IBM Plex Mono for metadata, filenames, code. All
  self-hosted. Archivo was dropped from the site in V2 and removed as a
  dependency in the V2 clean-up (the OG image now uses the V2 fonts).
- Square geometry, 1px rules, labelled figures ("FIG. 3"), big media,
  asymmetric 12-column grid. No cards, no pills, no gradients-as-decor.

## X_ITE

- `x_ite@16.4.1` (npm latest on 2026-09-30), pinned exactly.
- `scripts/sync-xite.mjs` copies the minified build + assets to
  `public/x_ite/16.4.1/`. X_ITE is loaded with a dynamic `import()` of that
  file only when a viewer is needed; it locates its components from
  `import.meta.url`, so an injected Cloudflare beacon script cannot hijack its
  base URL. CDN switch: `VITE_XITE_BASE`.
- `<XiteViewer>`: lazy (IntersectionObserver), one-at-a-time init queue,
  poster fallback, WebGL check, loading/error states, `update="auto"`
  (X_ITE stops rendering off-screen), reduced-motion pauses TimeSensors,
  teardown on unmount (world cleared, WebGL context released).
- Every viewer is labelled "Web preview: X_ITE 16.4.1 · Native viewer: FreeWRL".

## Archive / test storage

- `/legacy/`: `scripts/build-legacy.mjs` copies the offline browse copy
  (minus `tests/`, 44 MB, no file over 25 MiB) into `dist/legacy/` at build
  time, inserts one banner after `<body>`, and points `tests/` links at
  `TESTS_BASE` (the live SourceForge copy until `tests.freewrl.org` exists).
- `/tests`: explains the corpus and browses a manifest generated from
  `URL_MANIFEST.csv`. Target: R2 bucket behind `tests.freewrl.org` with the
  original folder paths. R2 upload is a separate, approved lane.

## Deployment boundary

Nothing is deployed. No Cloudflare, DNS, route, redirect, R2 or GitHub
change. `npm run preview` runs `wrangler dev` locally only.

## Known risks

- Cloudflare Web Analytics is enabled on purpose, for aggregate traffic
  counts: the manual snippet in `index.html`, not the zone's automatic RUM
  injection (keep that off, or `/legacy/` and every page get a second
  beacon). No user accounts, no analytics cookies. X_ITE is loaded as a
  module, so the beacon cannot break it.
- Linux apt package list: checked 2026-09-30 in a clean `ubuntu:24.04`
  container (engine `340a9a6`). The first list lacked `unzip` and `wget`
  (configure stops without them); both added. Build, install and
  `freewrl --version` pass. Not run on a real desktop or GPU.
- Key bindings verified against engine source, not in a live window.
- Conformance data is upstream's claim; nothing has been re-measured yet.
- `Ascendance Open Worlds` legal status is not stated anywhere in the
  project files; the site does not describe it.
