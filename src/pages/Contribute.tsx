import type { ReactNode } from "react"
import { PageHead, SectionHead } from "../components/primitives"
import { Link } from "../router"
import { SITE } from "../routes"

const WAYS: [string, string, ReactNode][] = [
  ["Code", "Fix a bug, finish a node, clean up a warning.", <>Start from <code>master</code>, open a pull request on <a href={SITE.github}>GitHub</a>. Small pull requests are reviewed faster.</>],
  ["Testing", "Open worlds and report what breaks.", <>The <Link to="/tests">test corpus</Link> has a folder per X3D component. Say which file, which build, which platform, and what you saw. <a href={SITE.issues}>Issues</a>.</>],
  ["Documentation", "Make a page on this site clearer, or more correct.", <>If something on <Link to="/use">Use</Link> or <Link to="/build">Build</Link> is wrong for your system, tell us what worked instead.</>],
  ["Example worlds", "Small worlds that show one idea well.", <>Commented, self-contained, with your name and licence in the file. They can go into the <Link to="/lab">Lab</Link>.</>],
  ["Lessons", "Teach someone their first world.", <>The <Link to="/learn">Learn</Link> page has four lessons. More would be good: text, sound, sensors, animation.</>],
  ["Platforms", "Bring back Windows, Android or another system.", <>Nobody maintains these builds now. If you can build and test one, you can own it. Start a thread in <a href={SITE.discussions}>Discussions</a>.</>],
]

export default function Contribute() {
  return (
    <>
      <PageHead kicker="Contribute" title={<>Dreamers wanted.</>}>
        <p>
          FreeWRL is a small project with a long history. You do not need to know C or OpenGL to help. Testing, writing docs,
          teaching and building example worlds help as much as code does.
        </p>
      </PageHead>

      <section className="frame section railed" aria-labelledby="ways">
        <SectionHead index="01" id="ways" title="Ways in" />
        <ol className="ways">
          {WAYS.map(([title, line, how], i) => (
            <li key={title} className="ways__row">
              <span className="mono ways__no">0{i + 1}</span>
              <h3 className="ways__title">{title}</h3>
              <p className="ways__line">{line}</p>
              <p className="ways__how">{how}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="frame section railed" aria-labelledby="where">
        <SectionHead index="02" id="where" title="Where to talk" />
        <div className="prose">
          <p><a href={SITE.issues}>GitHub Issues</a> — bugs and concrete problems with the current builds.</p>
          <p><a href={SITE.discussions}>GitHub Discussions</a> — questions and ideas, or to show what you made.</p>
          <p>
            The old freewrl-develop mailing list is closed. Its history is part of the <a href={SITE.upstream}>SourceForge project</a>.
            Problems in the FreeWRL core can also be reported upstream there.
          </p>
          <p className="caption">Be kind. Assume the other person is trying. Many people here are learning.</p>
        </div>
      </section>
    </>
  )
}
