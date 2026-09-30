import releases from "../data/releases.json"
import heroSource from "../../public/worlds/hand-and-eye.wrl?raw"
import { XiteViewer } from "../components/XiteViewer"
import { ArchivalFigure, Facts, Logo, SectionHead, SourceListing } from "../components/primitives"
import { Link } from "../router"

const latest = releases.releases[0]

// The excerpt is cut from the real file at build time, so it cannot drift.
const LINES = heroSource.split("\n")
const at = (marker: string) => LINES.findIndex((l) => l.includes(marker))
const cut = (from: string, to: string) => LINES.slice(at(from), at(to))
const EXCERPT_LINES = [
  ...LINES.slice(0, 2),
  "",
  ...cut("DEF Hand Transform", "# pupil"),
  "    # … pupil and catch-light …",
  ...cut("# the five fingers", "# finger 2"),
  "    # … fingers 2 to 5 …",
  "      ]",
  "    }",
  "  ]",
  "}",
]
// fall back to a plain slice if a marker moved
const EXCERPT = (at("# finger 2") > 0 ? EXCERPT_LINES : LINES.slice(0, 40)).join("\n")
const lineOf = (marker: string) => EXCERPT.split("\n").findIndex((l) => l.includes(marker)) + 1

const NOTES: [string, string][] = [
  ["1", "The first line says which language this is. FreeWRL, X_ITE and every VRML97 browser since 1997 read it the same way."],
  [`${lineOf("# eyeball")}`, "Transform moves, turns or stretches what is inside it. Here scale 1 1 0.62 squashes a Sphere into the eye."],
  [`${lineOf("Shape {")}`, "A Shape joins what a thing looks like (appearance) with what it is (geometry)."],
  [`${lineOf("# iris")}`, "The iris is a flat Cylinder, turned 90° (1.5708 radians) to face you."],
  [`${lineOf("# finger 1")}`, "A finger is a Cylinder with a Sphere on each end. DEF Glass names one appearance; USE Glass reuses it for all five fingers."],
]

export default function Home() {
  return (
    <>
      <section className="stage" aria-labelledby="home-title">
        <div className="frame stage__grid">
          <p className="stage__annot stage__annot--tl mono">
            FIG. 1 — The FreeWRL mark, rebuilt from 19 VRML97 shapes
          </p>
          <XiteViewer
            className="viewer--hero"
            src="/worlds/hand-and-eye.wrl"
            file="hand-and-eye.wrl"
            facts={["VRML97", "10 KB"]}
            alt="A 3D hand of five glowing blue fingers around a large blue eye, standing in a slowly turning gold wireframe dome over a blue grid."
            poster={{ src: "/brand/freewrl-logo-on-dark-640.webp", alt: "" }}
            clocks={["Clock"]}
            download="/worlds/hand-and-eye.wrl"
          />
          <div className="stage__copy">
            <h1 id="home-title" className="stage__title display">
              The old Web was made of pages.
            </h1>
            <p className="stage__sub">
              Some of us thought it would be made of worlds. Maybe we weren’t finished.
            </p>
          </div>
          <div className="stage__aside">
            <p>
              <strong>FreeWRL</strong> is an open-source browser for VRML97 and X3D, the ISO standards for 3D
              worlds on the Web. It runs natively on your computer. It has been in development since 1998.
            </p>
            <p className="stage__links">
              <Link to="/download" className="btn btn--gold">Download</Link>
              <Link to="/learn" className="btn btn--line">Make something</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="manifesto" aria-label="What we are asking for">
        <ol className="frame manifesto__list">
          <li>
            <span className="manifesto__no mono">01</span>
            <Link to="/contribute" className="manifesto__word">Dreamers wanted.</Link>
            <span className="manifesto__note">FreeWRL needs testers, writers, world builders and people who keep a platform alive.</span>
          </li>
          <li>
            <span className="manifesto__no mono">02</span>
            <a href="#view-source" className="manifesto__word">View source.</a>
            <span className="manifesto__note">A world is a text file. You can read this one below.</span>
          </li>
          <li>
            <span className="manifesto__no mono">03</span>
            <Link to="/learn" className="manifesto__word">Change something.</Link>
            <span className="manifesto__note">Change one number and watch the world change with it.</span>
          </li>
          <li>
            <span className="manifesto__no mono">04</span>
            <Link to="/lab" className="manifesto__word">Build a world.</Link>
            <span className="manifesto__note">Worlds to turn around and read. Take any of them home and open it in FreeWRL.</span>
          </li>
        </ol>
      </section>

      <section className="section frame" aria-labelledby="view-source">
        <SectionHead index="01" id="view-source" title="View source" kicker="The world at the top of this page, in plain text." />
        <div className="annotated">
          <SourceListing file="hand-and-eye.wrl (excerpt)" lang="VRML97" className="annotated__code">
            {EXCERPT}
          </SourceListing>
          <ol className="annotated__notes">
            {NOTES.map(([lines, text]) => (
              <li key={lines}>
                <span className="mono annotated__lines">Line {lines}</span>
                <p>{text}</p>
              </li>
            ))}
            <li className="annotated__more">
              <a href="/worlds/hand-and-eye.wrl">Full file, 10 KB</a>. Save it, then open it in FreeWRL or any VRML browser.
              Or <Link to="/learn">start with one box</Link>.
            </li>
          </ol>
        </div>
      </section>

      <section className="section frame" aria-labelledby="what-is">
        <SectionHead index="02" id="what-is" title="What FreeWRL is" />
        <div className="split">
          <div className="prose">
            <p className="lede">
              A native program that opens 3D worlds written in VRML97 and X3D, and lets you walk, fly and look around in them.
            </p>
            <p>
              Tuomas J. Lukka started FreeWRL in 1998. From about 1999 to 2010, John A. Stewart ran the project at the
              Communications Research Centre Canada. Many people added to it after that. The last upstream release, 6.7, is dated April 2024.
            </p>
            <p>
              Today the 6.7 code line is maintained on GitHub. The first work is a native Apple Silicon build for macOS, and
              a clean Linux build. The code is written in C and uses OpenGL. JavaScript in Script nodes runs in the bundled Duktape engine.
            </p>
            <p><Link to="/history">Read the full history and credits</Link>.</p>
          </div>
          <Facts
            className="split__facts"
            rows={[
              ["Reads", <>VRML97 <code>.wrl</code>, X3D XML <code>.x3d</code>, X3D Classic <code>.x3dv</code>, gzipped too</>],
              ["Version", "6.7.0"],
              ["macOS", "14 Sonoma or newer, Apple Silicon. Signed beta."],
              ["Linux", "Build from source. Tested on Ubuntu 24.04."],
              ["Windows, Android", "Not maintained now. Old upstream builds remain on SourceForge."],
              ["Licence", "GNU LGPL 3.0 or later"],
              ["Written in", "C, with OpenGL"],
            ]}
          />
        </div>
      </section>

      <section className="exhibit" aria-labelledby="archive">
        <div className="frame">
          <SectionHead index="03" id="archive" title="From the archive" kicker="The project’s own pictures, kept as they were." />
          <div className="exhibit__grid">
            <ArchivalFigure
              className="exhibit__lead"
              path="FreeWRL_poster.jpg"
              fig="FIG. 2"
              title="FreeWRL — VRML 3D and Beyond"
              archive="wayback"
              alt="A blue poster: the words FreeWRL, VRML 3D and Beyond, with photos of a data glove, a person in a head-mounted display on a motion chair, a space station, a music synthesizer scene and a jet."
              sizes="(min-width: 1100px) 66vw, 100vw"
            >
              Poster from the Communications Research Centre Canada. Labels on the poster: CNN’s Space Station, Music
              Synthesizer, Digital Data Glove, CNN’s F-18 Hornet, Flying Chair. Web3D Consortium mark, lower left.
            </ArchivalFigure>
            <ArchivalFigure
              path="tictactoe.gif"
              fig="FIG. 3"
              title="Tic-tac-toe"
              archive="wayback"
              alt="A tic-tac-toe board with yellow walls and blue squares; red spheres and green cones are the pieces."
              sizes="(min-width: 1100px) 30vw, 100vw"
            >
              A board of spheres and cones in FreeWRL. No caption survives.
            </ArchivalFigure>
            <ArchivalFigure
              path="2001.jpg"
              fig="FIG. 4"
              title="Space station"
              archive="wayback"
              alt="A grey spherical space station with a window band, in a FreeWRL window on black."
              sizes="(min-width: 1100px) 30vw, 100vw"
            >
              A space-station model in a FreeWRL window. The same model appears on the poster.
            </ArchivalFigure>
          </div>
          <p className="exhibit__more">
            <Link to="/history">History &amp; credits</Link>
            <a href="/legacy/">The old site, archived</a>
          </p>
        </div>
      </section>

      <section className="section frame" aria-labelledby="now">
        <SectionHead index="04" id="now" title="Now" />
        <div className="now">
          <Logo className="now__logo" size={220} />
          {latest && (
            <div className="now__release">
              <p className="mono now__tag">Latest release · {latest.prerelease ? "pre-release" : "release"}</p>
              <h3 className="now__name">{latest.name}</h3>
              <Facts
                rows={[
                  ["Published", latest.published.slice(0, 10)],
                  ["For", "macOS 14+ on Apple Silicon"],
                  ["File", latest.assets[0]?.name ?? "—"],
                ]}
              />
              <p className="stage__links">
                <Link to="/download" className="btn btn--ink">Download and checksums</Link>
                <Link to="/build" className="btn btn--line">Build on Linux</Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
