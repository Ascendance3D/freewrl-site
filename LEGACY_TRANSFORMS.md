# Legacy archive: served-copy transforms

`/legacy/` is built by `scripts/build-legacy.mjs` from the sealed archive at
`../archive-freewrl-site/browse/freewrl.sourceforge.io/`. The archive is never
modified; everything below happens only in the generated `dist/legacy/` copy.

Besides the archive banner and the `tests/` link rewrite (see README), the build
applies these exact-string safety transforms to `.html`/`.htm` pages. Each has an
expected count; the build fails if a count changes, so an archive refresh can't
silently widen or skip a transform. Counts are also written to
`dist/legacy/_legacy-build.json` under `safetyTransforms`.

Dead tracker images keep their original URL as `data-archived-src`, so the
served markup still records it but the browser fetches nothing. The `alt` text,
size attributes and surrounding link stay as they were.

| id | files | count | original behavior | source pattern | served copy |
|---|---|---|---|---|---|
| `clustrmaps-onerror-loop` | `index.html`, `ubuntu_src.html` | 2 | Runaway loop. The visitor-map counter fails, and `onerror` swaps in `clustrmaps.com/images/clustrmaps-back-soon.jpg`. That host refuses connections, so `onerror` fires again. `this.onError=null` (capital E) never clears the real `onerror` handler, so the loop repeats about 2,800 times a second. | `onerror="this.onError=null; this.src='http://clustrmaps.com/images/clustrmaps-back-soon.jpg'; document.getElementById('clustrMapsLink').href='http://clustrmaps.com'"` | attribute removed |
| `clustrmaps-counter` | `index.html`, `ubuntu_src.html` | 2 | Visitor-tracking counter image; `www2.clustrmaps.com` no longer resolves | `src="http://www2.clustrmaps.com/counter/index2.php?url=http://freewrl.sourceforge.net"` | `data-archived-src="…"` |
| `sourceforge-sflogo` | 32 pages | 32 | SourceForge hit-counting logo; blocked by Chrome ORB | `src="http://sourceforge.net/sflogo.php?…"` | `data-archived-src="…"` |
| `android-play-badge` | 6 `FreeX3D/` pages | 7 | Google Play badge; URL now 404s | `src="http://www.android.com/images/brand/android_app_on_play_logo_small.png"` | `data-archived-src="…"` (the Play Store link is kept) |
| `slashdotmedia-noscript-pixel` | `index.htm` | 1 | Piwik tracking pixel, loaded only when JS is off | `src="https://analytics.slashdotmedia.com/index.php?idsite=39"` | `data-archived-src="…"` |
| `sourceforge-page-scripts` | `index.htm` | 12 | SourceForge's ad, consent-manager and analytics bundles (`admanager.js`, `asg_embed.js`, `sf.sandiego-*`, carousel/lightbox vendor code) on a 2026 capture of `sourceforge.net/projects/freewrl/`. They are not FreeWRL content. | `<script src="/a.fsdn.com/con/js/…"></script>` | replaced with an HTML comment naming the script |
| `faq-offsite-refresh` | `faq.html` | 1 | Redirect stub: meta refresh after 0 s to `http://freewrl.sourceforge.net/index.html`, which now serves a 403 page | `content="0; url=http://freewrl.sourceforge.net/index.html"` | `content="0; url=index.html"` (the archived home page) |

Not transformed:

- Inline scripts in `index.htm` stay as captured text. Without the SourceForge
  bundles, `bizx`/`$` are undefined, so the tracker loaders they contain do nothing.
- `index.html.SUN` is not an `.html` file. It is served without an HTML type and
  never runs as a page.
- Root-relative `/a.fsdn.com/…` stylesheets and images in `index.htm` point
  outside `/legacy/` on this origin and 404. They are dead, local and one-shot.
- Clickable external links are unchanged.

## Backstop: Content-Security-Policy

`public/_headers` gives `/legacy/*` a CSP that allows only same-origin
scripts, styles, images, fonts, frames and connections (inline allowed). A
third-party load missed by the transforms above is blocked before it leaves the
browser. If Cloudflare Web Analytics auto-injection is ever turned on, its
beacon would also be blocked on `/legacy/` pages only.

## Verification

`node qa/legacy-network.mjs [baseURL] [seconds] [homeSeconds]` opens `/legacy/`,
`use.html`, `conformance.html`, `examples.html` and each page transformed above.
It watches the network after load settles and fails on external requests,
tracker hosts, repeated URLs, request growth, self-navigation, or CSP-blocked
loads.
