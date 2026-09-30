import { useState, type ReactNode } from "react"
import releases from "../data/releases.json"
import { Link, useRouter } from "../router"
import { ROUTES, SITE } from "../routes"
import { Mark } from "./primitives"

const latest = releases.releases[0]

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Masthead />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
    </>
  )
}

function Masthead() {
  const { path } = useRouter()
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === path
  const setOpen = (v: boolean) => setOpenOn(v ? path : null)
  const nav = ROUTES.filter((r) => r.nav)
  return (
    <header className="masthead">
      <div className="masthead__rail frame mono">
        <span>Native VRML97 / X3D browser · since 1998</span>
        {latest && (
          <Link to="/download" className="masthead__release">
            {latest.tag} · {latest.published.slice(0, 10)}
          </Link>
        )}
      </div>
      <div className="masthead__bar frame">
        <Link to="/" className="masthead__brand" aria-label="FreeWRL home">
          <Mark size={44} />
          <span className="masthead__word">FreeWRL</span>
        </Link>
        <button
          type="button"
          className="masthead__toggle mono"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
        <nav id="site-nav" className="masthead__nav" data-open={open} aria-label="Main">
          <ul>
            {nav.map((r) => (
              <li key={r.path}><Link to={r.path}>{r.nav}</Link></li>
            ))}
            <li><a href="/legacy/" className="masthead__legacy">Legacy site</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="frame footer__grid">
        <div className="footer__statement">
          <p className="footer__big">View source.<br />Change something.<br />Build a world.</p>
        </div>
        <nav className="footer__col" aria-label="Site">
          <h2 className="mono">Site</h2>
          <ul>
            {ROUTES.map((r) => (
              <li key={r.path}><Link to={r.path}>{r.nav ?? (r.path === "/" ? "Home" : r.title.split(" — ")[0])}</Link></li>
            ))}
            <li><a href="/legacy/">Legacy site (archived)</a></li>
          </ul>
        </nav>
        <div className="footer__col">
          <h2 className="mono">Project</h2>
          <ul>
            <li><a href={SITE.github}>Source on GitHub</a></li>
            <li><a href={SITE.issues}>Issues</a></li>
            <li><a href={SITE.discussions}>Discussions</a></li>
            <li><a href={SITE.releases}>Releases</a></li>
            <li><a href={SITE.upstream}>Original project on SourceForge</a></li>
          </ul>
        </div>
        <div className="footer__col footer__notes">
          <h2 className="mono">Notes</h2>
          <p>
            FreeWRL is free software under the GNU LGPL, version 3 or later.
            Copyright its original authors and contributors; see <Link to="/history">History &amp; credits</Link>.
          </p>
          <p>
            The current code line is maintained on GitHub by the Ascendance Open Worlds modernization fork.
            It is not the upstream SourceForge project.
          </p>
          <p>Live 3D on this site is rendered in your browser by X_ITE. No trackers, no analytics, no accounts.</p>
        </div>
      </div>
    </footer>
  )
}
