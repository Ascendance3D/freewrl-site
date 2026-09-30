# freewrl.org — design iteration 2: direction

Written 2026-09-30 on branch `redesign/v2` (from `redesign/v1` at `c0cd1a6`).
V1's engineering stays. This iteration changes composition and typography only.

Rule for every page:

> **Make the artifact big. Make the words normal.**

Large things are live worlds, source text, archive photographs, the mark and
conformance data. Headlines are labels for those things, not the show.

Checked against Power Design (`ItsssssJack/power-design` @ `f0c4143`,
`principles/web-principles.md`, website path) as a QA floor. Where a Power
Design rule pushes toward a conversion landing page (hero value-prop formula,
social-proof strip, pricing tiers, "one filled CTA per view" as a sales device),
the FreeWRL direction wins. The site's job is understanding, exploring,
downloading and making, not lead generation.

Clay (Power Design `brands/clay/brand-style.md`, derived from
`VoltAgent/awesome-design-md` → `clay/DESIGN.md`) was read for ideas only. Taken: warm off-white canvas, quiet body type, letting artwork carry
emphasis. Not taken: rounded cards, pills, saturated feature grids, rounded
display type, 7/5 SaaS hero, oversized headlines.

## What V1 got wrong

1. Display type too large. Archivo 125% width / 800 weight / uppercase at up
   to 128px (`clamp(2.6rem, 8vw, 8rem)`) became the main content of Home,
   Lab, Conformance, Learn, Contribute and the footer.
2. Display face too generic. Extended heavy grotesk in caps reads as a
   2020s agency or SaaS template.
3. Desktop grid under-used. Page heads put a 10-column headline on the left
   and a lede in columns 5–11, leaving a large dead field. Sections put one
   block left and nothing right.
4. Typography-led. Words were bigger than the worlds.

## Typography

Two families, both already self-hosted and OFL, so nothing new is licensed:

| role | face | why |
|---|---|---|
| headings, body, captions | **Source Serif 4** (variable, 400–700 + italic) | Adobe's serif for long technical reading. Its sturdy, open forms read like a standards document or a museum catalogue, not a startup. |
| metadata, labels, navigation, filenames, code, data | **IBM Plex Mono** 400/500 | Carries the lab / Web3D voice: coordinates, versions, file names. Used small. |

**Archivo is removed from the site CSS.** In the V2 clean-up the OG image
(`scripts/make-og.mjs`) was redrawn with Source Serif 4 and Plex Mono, and
the Archivo package was removed.

Headings are sentence case, weight 600, tight but not crushed
(`letter-spacing: -0.01em`). Uppercase is kept only for small mono labels,
where tracking (+0.06em) makes it read as a technical stamp.

### Scale (fluid, `clamp()` with a `rem` term so zoom still works)

| token | 320px | 1440px | use |
|---|---|---|---|
| `--t-meta` | 12px | 13px | mono labels, captions metadata |
| `--t-small` | 14px | 15px | captions, table text |
| `--t-body` | 16px | 18px | body |
| `--t-h3` | 19px | 24px | subheads, exhibit titles |
| `--t-h2` | 24px | 34px | section headings |
| `--t-h1` | 30px | 52px | page titles |

Old → new at 1440px:

| element | V1 | V2 |
|---|---|---|
| inner page H1 | ~115px Archivo 800 caps | 52px Source Serif 600, sentence case |
| home H1 | ~107px Archivo 800 caps | 40px, beside the world |
| section H2 | ~54px Archivo 800 caps | 30px Source Serif 600 |
| manifesto words | ~63px Archivo 800 caps | 24px Source Serif 600 |
| footer statement | ~46px Archivo 800 caps | 24px Source Serif italic |
| nav | Archivo 600 caps 12.8px | Plex Mono 500 caps 12.5px |
| body | 16–18px | 16–18px (unchanged) |

Ratios: H1:body ≈ 2.9, H2:body ≈ 1.9, H3:body ≈ 1.33 (inside Power Design's
ranges).

## Grid

- Outer margin `clamp(20px, 4vw, 56px)`; frame `min(1560px, 100% − 2·margin)`.
  At 1440px the usable width is 1328px.
- 12 columns, gap `clamp(16px, 2vw, 32px)`.
- Breakpoints are content-driven: 640 (two-up lists), 1024 (margin rail
  appears), 1280 (third column appears on Learn / essay pages).

### The margin rail

The main compositional change. At ≥1024px most sections become:

```
cols 1–3   margin rail: § number, section title, short note (sticky)
cols 4–12  content, which splits again as the content needs
```

This is how standards documents and catalogues work: the index sits in the
margin, the material takes the page. The title no longer has to be big to be
found, and the right side is no longer empty because content starts at
column 4 and runs to 12.

Content inside the rail layout composes per page:

| type | layout inside cols 4–12 |
|---|---|
| artifact | 6 artifact / 3 notes, or 9 artifact |
| essay / history | 6 narrative / 3 marginal figures |
| documentation | 6 text or code / 3 notes |
| data | 9 full data |

### Page heads

Page heads use the same rail: kicker and page number in cols 1–3, H1 and
lede in cols 4–9, and a **page-specific fact block in cols 10–12**
(release, spec version, counts, dates). That fills the empty space V1 left and
gives each page's key facts before any scrolling.

## Wide screens (1440 → 1920)

The frame caps at 1560px. Past that, margins grow. Viewers and figures scale
with their column, and prose stays at ≤66ch.

## Mobile (≤640)

- One column. Rail heads sit above their content as a small mono § line plus
  an H2 at 24px.
- Page heads: H1 at ~30px, no forced line breaks. Facts move below the lede
  as a compact ruled list.
- Home: short H1 and one line, then the world. The world is on the first
  screen.
- Source listings keep 13px mono and scroll sideways inside their own box.
  The page itself never scrolls sideways.
- Tables with more than two columns (Download's earlier releases) turn into
  labelled rows.
- Tap targets ≥44px.

## Colour

Same tokens as V1, used more strictly:

| token | use |
|---|---|
| paper `#f3f1ec` / ink `#111216` | 90% of every page |
| cobalt `#1a2e8c` / deep `#0e1a5c` | links, the archive band, section numbers, figure numbers |
| night `#070b24` | behind live worlds only |
| cyan `#2ec4ff` | "this is live 3D": viewer frame, live indicator, focus ring |
| gold `#f2c230` | annotation: parameter marks, figure labels on dark, the one primary Download button |
| orange | only inside the logo artwork |

Dark mode keeps the same names with remapped values. It lightens surfaces
instead of using shadows, and links shift to a lighter cobalt.

## Page compositions

**Home.** The world takes cols 1–8 at ~76vh. Cols 9–12 are an exhibit label:
FIG. 1 line, H1 at 40px ("The old Web was made of pages."), the italic line,
a short description, Download / Make something, and a small spec table for
the file (nodes, size, format). "Dreamers wanted / View source / Change
something / Build a world" becomes a four-cell numbered index across the
page, not four giant rows. View source becomes rail + listing (cols 4–9) +
line notes (cols 10–12), with each note keyed to its line. The archive band
uses rail + poster (cols 4–9) + two figures stacked in cols 10–12. Now becomes
rail + release facts + mark.

**Conformance.** Page head facts: spec, rows, measured count, capture date,
method. First section: a proportional status bar (upstream claim) above a
two-column ledger: *claimed* vs *measured* counts. The component browser
puts the filters, count and legend in the sticky rail. Tables take cols
4–12.

**Lab.** H1 at page size, facts in the head (4 live worlds, 3 shader
captures, 3,420 test files). Each exhibit is viewer cols 1–8 and notes cols
9–12. No alternating flip, so viewers line up and can be compared.

**Download.** Page head facts: tag, date, platform, size. The release
section's rail holds the tag and status. The file, checksum and verify
command take cols 4–8, and the requirements table takes cols 9–12. Earlier
releases become labelled rows on mobile.

**Learn.** Three columns at ≥1280: controls (1–3), source (4–7), result
(8–12). Change → source → result read left to right. Under 1280, controls
and source stack beside the result. On mobile the order is result, then
controls, then source.

**History.** Rail heads throughout. Leads and pull quote across the content
width. The archive band's gallery composes across 9 columns in varied sizes.
The timeline uses the essay layout: dated entries in cols 4–9 and marginal
archive figures (previously unused captures) in cols 10–12. Credits run in
two columns. Provenance lines stay on every item.

**Use / Build / Tests / Contribute.** These get the new head, rail and type
automatically. Contribute's six "ways" become a ruled index at h3 size.

## Removed from V1

- Archivo, and every uppercase extended-heavy headline.
- `.display` as a page-title style.
- Forced `<br />` line breaks in titles.
- Alternating left/right exhibit rows on Lab.
- The oversized footer statement. It is kept as a small italic line.
- Dead right-hand fields in page heads and sections.

## Kept from V1

Routes, prerender, X_ITE 16.4.1 pin and loader, viewer teardown, WebGL
fallback, reduced motion, legacy build, tests manifest, conformance data and
provenance, releases snapshot, canonical metadata, real 404, the functional
QA suite, and all copy (after the slopmonster pass in `c0cd1a6`).
