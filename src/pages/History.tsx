import history from "../data/history.json"
import { ArchivalFigure, Facts, PageHead, SectionHead } from "../components/primitives"
import { SITE } from "../routes"

type Event = { date: string; event: string; source: string; archive: string }
type Person = { name: string; role: string; period: string | null; source: string }

// Where a source string from history.json can be read.
function sourceLink(src: string) {
  if (src.includes("freewrl-git")) return <a href={SITE.github}>engine repository</a>
  if (src === "ARCHIVE_REPORT.md") return <span>archive report</span>
  const file = src.replace(/\s.*$/, "")
  return <a href={`/legacy/${file}`}>{file}</a>
}

const LEADS = ["Tuomas J. Lukka", "John A. Stewart"]
const ALSO = ["Mike Fletcher", "Larry Ewing", "Brutzman", "Daily", "Drayde", "Adrian Rossiter", "Tom Smith", "Sarah Dumoulin"]
const PRESENT = ["Ryan Bundy"]

export default function History() {
  const people = history.people as Person[]
  const leads = people.filter((p) => LEADS.includes(p.name))
  const contributors = people.filter((p) => !LEADS.includes(p.name) && !ALSO.includes(p.name) && !PRESENT.includes(p.name))
  const also = people.filter((p) => ALSO.includes(p.name))
  return (
    <>
      <PageHead
        kicker="History & credits"
        title="Since 1998."
        aside={
          <Facts
            className="facts--stack"
            rows={[
              ["Started", "1998, Tuomas J. Lukka"],
              ["Timeline", `${history.timeline.length} dated entries`],
              ["Credited", `${history.people.length} people, ${history.organizations.length} organizations`],
              ["Sources", <a key="l" href="/legacy/">the old site, archived 2026</a>],
            ]}
          />
        }
      >
        <p>
          FreeWRL was written by many people over more than twenty-five years. This page is built from the project’s own
          pages, as archived in 2026. Every line links to the page it came from. Dates and names are as the sources give them.
        </p>
      </PageHead>

      <section className="frame section railed" aria-labelledby="leads">
        <SectionHead index="01" id="leads" title="Who led it" />
        <div className="leads">
          {leads.map((p) => (
            <article key={p.name} className="lead">
              <h3 className="lead__name">{p.name}</h3>
              <p className="mono">{p.period}</p>
              <p>{p.role}.</p>
              <p className="caption">Source: {sourceLink(p.source)}</p>
            </article>
          ))}
          <blockquote className="pull">
            <p>“From circa 1999 to April 2010, the FreeWRL project was managed by John A. Stewart.”</p>
            <footer className="mono">— <a href="/legacy/contact.html">contact.html</a>, upstream site</footer>
          </blockquote>
        </div>
      </section>

      <section className="exhibit" aria-labelledby="pictures">
        <div className="frame railed">
          <SectionHead index="02" id="pictures" title="Pictures" kicker="Captions in italics come from the old pages. Where no caption survives, we say what the picture shows." />
          <div className="gallery">
            <ArchivalFigure path="FreeWRL_poster.jpg" fig="H1" title="FreeWRL — VRML 3D and Beyond" archive="wayback" className="gallery__wide"
              alt="Blue CRC poster for FreeWRL with photos of a data glove, a head-mounted display, a space station and a jet." sizes="(min-width: 1024px) 50vw, 100vw">
              Poster from the Communications Research Centre Canada.
            </ArchivalFigure>
            <ArchivalFigure path="OSX-screen.gif" fig="H2" title="On Mac OS X" archive="wayback"
              alt="A Mac OS X 10.2 desktop with a FreeWRL window showing the grey space station and an About This Mac box."
              sizes="(min-width: 1024px) 25vw, 100vw">
              FreeWRL on Mac OS X 10.2, on a PowerPC G4.
            </ArchivalFigure>
            <ArchivalFigure path="aboutPlugins.png" fig="H3" title="The browser plugin" archive="wayback"
              alt="Firefox's installed plug-ins page, listing the FreeWRL X3D/VRML plugin npfreewrl.so."
              sizes="(min-width: 1024px) 25vw, 100vw">
              Firefox lists the FreeWRL plugin: “V3.1 VRML/X3D with FreeWRL. from http://www.crc.ca/FreeWRL”.
            </ArchivalFigure>
            <ArchivalFigure path="NCK.jpg" fig="H4" title="In a machine-control lab" archive="wayback"
              alt="A Linux desktop with CNC test-monitor panels and a small FreeWRL window showing a machine model."
              sizes="(min-width: 1024px) 25vw, 100vw">
              A FreeWRL window beside “MARS2 CNC Testmonitor” panels. No caption survives.
            </ArchivalFigure>
            <ArchivalFigure path="images/iPhone-running2.png" fig="H5" title="On the iPhone, 2011" archive="live"
              alt="An iPhone screen running FreeWRL with Quit, Vp, Wk and Ex buttons."
              sizes="(min-width: 1024px) 16vw, 60vw">
              The iPhone app, demonstrated at SIGGRAPH 2011 in Vancouver.
            </ArchivalFigure>
            <ArchivalFigure path="images/ring_tangle.jpg" fig="H6" title="Ring tangle" archive="live"
              alt="A dense tangle of coloured rings built from many IndexedFaceSets."
              sizes="(min-width: 1024px) 25vw, 100vw">
              Many IndexedFaceSets made through PROTOs. Model by Adrian Rossiter.
            </ArchivalFigure>
            <ArchivalFigure path="synth.gif" fig="H7" title="Music synthesizer" archive="wayback"
              alt="A 3D music-synthesizer scene of cylinders and spheres in FreeWRL."
              sizes="(min-width: 1024px) 25vw, 100vw">
              The same scene appears on the poster as “Music Synthesizer”. No caption survives.
            </ArchivalFigure>
          </div>
        </div>
      </section>

      <section className="frame section railed" aria-labelledby="timeline">
        <SectionHead index="03" id="timeline" title="Timeline" />
        <div className="essay">
        <ol className="timeline">
          {(history.timeline as Event[]).map((e, i) => (
            <li key={i} className="timeline__row">
              <span className="timeline__date mono">{e.date}</span>
              <span className="timeline__event">{e.event}</span>
              <span className="timeline__src mono">{sourceLink(e.source)}{e.archive === "wayback" ? " · Wayback" : ""}</span>
            </li>
          ))}
        </ol>
        <aside className="essay__margin" aria-label="Pictures from the timeline">
          <ArchivalFigure path="freewrl_screenshot3.jpg" fig="T1" title="An early scene" archive="wayback"
            alt="An early FreeWRL scene with a sphere, a box, an avatar figure and 3D text reading Java."
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw">
            A sphere, a box, an avatar and 3D “Java” text. No caption survives.
          </ArchivalFigure>
          <ArchivalFigure path="Test.png" fig="T2" title="test.wrl in the plugin" archive="wayback"
            alt="The test.wrl cone loaded inside Firefox through the FreeWRL plugin, with a HUD reading EXAMINE."
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw">
            The cone from the Lab page, inside Firefox through the FreeWRL plugin.
          </ArchivalFigure>
          <ArchivalFigure path="FreeX3D/images/FP_6_2013-04-06-15-46-21.png" fig="T3" title="FreeX3D on Android, 2013" date="2013-04-06" archive="live"
            alt="An STL model hatched with a green brick FillProperties pattern, on a Nexus 7 tablet."
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw">
            An STL model hatched with a FillProperties pattern, on a Nexus 7.
          </ArchivalFigure>
          <ArchivalFigure path="images/screenshot_Jan2023_2.jpg" fig="T4" title="Options panel, 2023" date="2023" archive="live"
            alt="FreeWRL's in-app options panel, open over a scene."
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw">
            The in-app options panel, for changing options while a world runs.
          </ArchivalFigure>
        </aside>
        </div>
      </section>

      <section className="frame section railed" aria-labelledby="credits">
        <SectionHead index="04" id="credits" title="Credits" kicker="Everyone the old pages credit for work on FreeWRL. If a name is missing, tell us." />
        <ul className="credits">
          {contributors.map((p) => (
            <li key={p.name}>
              <span className="credits__name">{p.name}</span>
              <span className="credits__role">{p.role}{p.period ? ` (${p.period})` : ""}</span>
              <span className="credits__src mono">{sourceLink(p.source)}</span>
            </li>
          ))}
        </ul>
        <h3 className="mono subhead">Also named in the pages</h3>
        <ul className="credits credits--small">
          {also.map((p) => (
            <li key={p.name}>
              <span className="credits__name">{p.name}</span>
              <span className="credits__role">{p.role}</span>
              <span className="credits__src mono">{sourceLink(p.source)}</span>
            </li>
          ))}
        </ul>
        <p className="caption">
          In the upstream Git history, the SourceForge user <code>crc_canada</code> made most commits up to 2012, and
          <code> dug9</code> made most commits from 2013 to 2024, including the last one. The archived pages do not say who these accounts belong to.
        </p>
      </section>

      <section className="frame section railed" aria-labelledby="orgs">
        <SectionHead index="05" id="orgs" title="Organizations" />
        <Facts
          className="facts--wide"
          rows={history.organizations.filter((o) => o.name !== "Ascendance Open Worlds").map((o) => [o.name, o.role])}
        />
      </section>

      <section className="frame section railed" aria-labelledby="licence">
        <SectionHead index="06" id="licence" title="Licence" />
        <ul className="prose changes">
          {history.licenseHistory.map((l, i) => <li key={i}>{l.what} <span className="mono muted">({sourceLink(l.source)})</span></li>)}
        </ul>
      </section>

      <section className="frame section railed present" aria-labelledby="now">
        <SectionHead index="07" id="now" title="Today" kicker="The history above belongs to the people who made it. This part is about the present." />
        <div className="prose">
          <p>
            In September 2026, the FreeWRL 6.7 code line was taken up on GitHub as the Ascendance Open Worlds modernization
            fork, maintained by Ryan Bundy. Its first results are a native Apple Silicon build for macOS and a Linux build from source.
            It is a fork. It is not the upstream project, and it did not create FreeWRL.
          </p>
          <p>
            The original project is still on <a href={SITE.upstream}>SourceForge</a>. The fork’s README says that bugs in FreeWRL itself belong upstream.
          </p>
          <p>
            This website replaces the old one at freewrl.sourceforge.io as the project’s home on the web. The old site is kept, unchanged,
            at <a href="/legacy/">/legacy/</a>. It was captured on 29–30 September 2026: 4,059 files from the live site, plus 64 pages and images
            recovered from the Wayback Machine. One file could not be saved: the full-size <code>supine.nrrd</code> volume (213 MB).
          </p>
        </div>
      </section>
    </>
  )
}
