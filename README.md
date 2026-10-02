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
npm run typecheck
npm run lint
```

## QA

Build, then start the local server with `qa/serve.sh`. Each script exits 1 if a check fails.
Reports and screenshots go to `qa-artifacts/` (gitignored).

```sh
node qa/functional.mjs       # 53 checks: pages, links, viewer, legacy, 404
node qa/design.mjs           # 526 layout/type checks across pages and widths
node qa/hero-final.mjs       # 34 checks on the Home landing world in X_ITE
node qa/legacy-network.mjs   # 63 checks: /legacy/ makes no tracker, external or runaway requests
node qa/hero-final.mjs --self-test   # proves a real FAIL exits 1 (no browser)
node qa/shots.mjs http://127.0.0.1:8788 qa-artifacts/shots /,/learn/ 1440,390 light
```

The scripts drive the system Chrome (`/usr/bin/google-chrome`) headless with the GPU on.
`hero-final.mjs` reports one known item as `EXPECTED WARNING`, not PASS or FAIL:
X_ITE 16.4.1 calls `preventDefault()` in a touch listener that Chrome treats as passive,
so a one-finger drag logs "Unable to preventDefault inside passive event listener".
Any other console error in that check is still a FAIL.

## Landing world

`public/worlds/freewrl-landing.wrl` is generated. Edit `scripts/gen-landing-world.mjs`,
then run `npm run world:hero`. Do not hand-edit the `.wrl`. Design notes:
`LANDING_WORLD_DIRECTION.md`. `node qa/landing-world.mjs <baseURL> - <outDir>` captures
every Viewpoint of the shipped world in the real viewer.

## Legacy archive and the test corpus

`/legacy/` is a read-only copy of the old freewrl.sourceforge.io site. It is not in this
repository. `npm run build` copies it from `../archive-freewrl-site/browse/freewrl.sourceforge.io`
(or `FREEWRL_ARCHIVE_BROWSE=...`) and adds one banner per HTML page. It also applies a
few exact-string safety transforms that stop automatic tracker, ad and dead-widget requests
(including a clustrmaps `onerror` loop). Those are listed in `LEGACY_TRANSFORMS.md`, and
`/legacy/*` gets a same-origin Content-Security-Policy. Every other byte is unchanged.
`node qa/legacy-network.mjs <baseURL>` checks it. Missing `/legacy/` paths return the site's real 404.
`SKIP_LEGACY=1` builds without `/legacy/` — never deploy that.

The upstream `tests/` corpus (1.14 GB) is not copied and not in this repository.
A byte-exact copy is published on R2 at `https://tests.freewrl.org/` (see `TEST_CORPUS.md`).
`/tests/`, `/conformance/` and `/legacy/` link there (`SITE.testsBase`; `TESTS_BASE` for
`/legacy/`). R2 has no directory indexes, so folder links keep an explicit `index.html`.

## Production

- URL: https://freewrl.org
- Release `v2026.09.30`: source `c7682b56e8761f6fc78b40ba3c45604631f5c3a5`,
  Worker version `95aa3ecf-b0a9-4f3d-a916-79cc153bd576`.
- Rollback versions: `deb28a09-8ed7-4177-8523-f1dc9db05628` (same release without analytics),
  `b7bcb7f1-e285-4c95-b8fc-1c538a3b825a` (pre-launch site).
- X_ITE is pinned to 16.4.1.
- The test corpus is on R2 at https://tests.freewrl.org/ (`TEST_CORPUS.md`). Release `v2026.09.30` still links to the upstream copy; source links to R2 from `feat: link tests browser to R2 corpus` on.
- freewrl.com, www.freewrl.com and www.freewrl.org redirect to freewrl.org (see below).

## Cloudflare

The site is static assets on the Cloudflare Worker `freewrl` (`wrangler.jsonc`).
That Worker serves freewrl.org only.

- There is deliberately no `deploy` script. Never run `wrangler deploy` or
  `wrangler versions deploy` without Ryan's approval. Production changes, DNS,
  redirects and R2 all need that approval.
- A preview is a version upload that does not take traffic:
  `npx wrangler versions upload --preview-alias <name>`. It is served at
  `https://<name>-freewrl.<account-subdomain>.workers.dev/`. Pages still emit
  `https://freewrl.org/` canonical URLs.
- Cloudflare Web Analytics is intentionally enabled, for aggregate traffic measurement.
  The site has no user accounts and sets no analytics cookies.
  The snippet in `index.html` puts it on every prerendered page and the 404, but not on
  `/legacy/`, whose CSP would block it anyway. Keep the zone's automatic
  Web Analytics / RUM injection off: it would add a second beacon everywhere, including
  `/legacy/`, where the CSP blocks it. QA browsers stub the beacon host (`qa/analytics-stub.mjs`).

### Credentials

- Use the **account-owned API token** (account "Ascendance Productions") in the ignored
  `.env.local` here: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Never put the
  values in tracked files, QA artifacts, commit messages or shell rc files. Do not export a
  global `CLOUDFLARE_API_TOKEN` for FreeWRL.
- Precedence, highest first: an exported shell `CLOUDFLARE_API_TOKEN`, then `.env.local`
  (Wrangler loads it by itself when run from this directory), then your personal
  `wrangler login` OAuth session. A stale exported token shadows `.env.local`, and
  repeated tries with it trip Cloudflare's auth rate limit (`code: 10502`).
- So run Cloudflare commands through `scripts/cf-env.sh`, which drops any `CLOUDFLARE_*`
  already in the environment, loads `.env.local`, verifies the token and runs the command:
  `scripts/cf-env.sh npx wrangler whoami`, `scripts/cf-env.sh scripts/r2-tests/cf-audit.sh <outdir> <tag>`.
  It fails if `.env.local` or either variable is missing. Nothing changes in your shell.
  If a stale token shows up in your shell anyway, `unset CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID`.
- Verify an account-owned token with
  `/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/tokens/verify`. `/client/v4/user/tokens/verify`
  is for personal (user) tokens and returns `Invalid API Token` (`code: 1000`) for an
  account token even when it is valid.
- `wrangler whoami` should say "logged in with an Account API Token". If it says
  "OAuth Token", you are on a personal login, not the FreeWRL token.
- `scripts/r2-tests/*` check the token against the account endpoint before doing anything
  and stop with a message if it is missing or not active. `qa/serve.sh` removes the
  `CLOUDFLARE_*` variables and runs Wrangler `--local`, so it needs no credential.
- Creating, rotating or deleting tokens needs Ryan's approval.

## Domain redirects

- Canonical domain: `freewrl.org`.
- `www.freewrl.org`, `freewrl.com` and `www.freewrl.com` return `308` to
  `https://freewrl.org` in one hop, for http and https. Path and query are preserved.
- Source: `workers/redirect/` (Worker `freewrl-www-redirect`, attached to those three
  hosts as Custom Domains). It returns `421` if it is ever attached to `freewrl.org`.
- Redirect deployment is separate from the website deployment:
  `npx wrangler deploy -c workers/redirect/wrangler.jsonc` deploys only the redirect Worker,
  and a plain `wrangler` command at the repo root only touches the website Worker `freewrl`.
  The same approval rule applies to both.

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
components from `import.meta.url`. The Cloudflare Web Analytics beacon cannot
redirect it (a QA check proves this). To use the CDN instead: `VITE_XITE_BASE=https://cdn.jsdelivr.net/npm/x_ite@16.4.1/dist/`.

## Licence

The site code and the content written for this site are licensed under the
GNU Lesser General Public License, version 3 or later (`LGPL-3.0-or-later`).
`LICENSE` is the LGPL text. `COPYING` is the GNU GPL v3 text that the LGPL builds on.

This does not claim ownership of historical FreeWRL material. Images in
`public/media/archive/`, text and data taken from the archived upstream site
(`src/data/`), and the `/legacy/` copy keep their original authors' rights.
The logo remakes are covered in "Logo and icons" above; their maker is still an open item.
X_ITE (MIT) and the fonts (SIL OFL 1.1) come from npm under their own licences.
