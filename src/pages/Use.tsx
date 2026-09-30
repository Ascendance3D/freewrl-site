import use from "../data/use.json"
import { Commands, PageHead, SectionHead } from "../components/primitives"

type Key = { key: string; action: string; verified: boolean }
const GROUPS: [string, string[]][] = [
  ["Navigation modes", ["e", "w", "d", "f", "y", "t", "g", "m"]],
  ["Viewpoints", ["v", "b", "Page Down", "Page Up", "Home", "End", "/"]],
  ["Moving with keys", ["Arrow keys", "Shift+Left/Right arrow", "a / z", "j / l", "p / ;", "u / o", "k / 8", "7 / 9"]],
  ["World and program", ["h", "c", "Esc", "x", "n", "`", "Space", "H", ".", "q"]],
]

export default function Use() {
  const keys = new Map((use.keys as Key[]).map((k) => [k.key, k]))
  return (
    <>
      <PageHead kicker="Use" title={<>Open a world. Look around.</>}>
        <p>
          Open a file from the command line, or on macOS from Finder. Then move with the mouse or keys. Every key on
          this page was checked in the current FreeWRL source. Parts are adapted from the upstream <a href="/legacy/use.html">use.html</a>.
        </p>
      </PageHead>

      <section className="frame section railed" aria-labelledby="open">
        <SectionHead index="01" id="open" title="Open a world" />
        <div className="split">
          <Commands title="Linux / macOS terminal">{`freewrl world.wrl
freewrl https://example.org/world.x3d
freewrl --geometry 1280x800 world.x3dv`}</Commands>
          <div className="prose">
            <p>On macOS, double-click a <code>.wrl</code>, <code>.x3d</code> or <code>.x3dv</code> file, or drop it on FreeWRL.</p>
            <p>FreeWRL also reads gzipped files (<code>.wrz</code>, <code>.x3dz</code>) and loads worlds over HTTP and HTTPS.</p>
          </div>
        </div>
      </section>

      <section className="frame section railed" aria-labelledby="modes">
        <SectionHead index="02" id="modes" title="Navigation modes" kicker="A world can limit the modes with NavigationInfo. A key for a mode the world does not allow is ignored." />
        <table className="table table--modes">
          <thead><tr><th>Mode</th><th>Key</th><th>What it does</th></tr></thead>
          <tbody>
            {use.navModes.map((m) => (
              <tr key={m.name}>
                <th scope="row" className="mono">{m.name}</th>
                <td>{m.key ? <kbd>{m.key}</kbd> : <span className="muted">button bar</span>}</td>
                <td>{m.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="frame section railed" aria-labelledby="mouse">
        <SectionHead index="03" id="mouse" title="Mouse" kicker="Left button unless it says otherwise. The wheel only zooms in PAN mode." />
        <table className="table">
          <thead><tr><th>Mode</th><th>Input</th><th>Result</th></tr></thead>
          <tbody>
            {use.mouse.filter((m) => !m.action.startsWith("Nothing")).map((m, i) => (
              <tr key={i}><td className="mono">{m.mode}</td><td>{m.input}</td><td>{m.action}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="frame section railed" aria-labelledby="keys">
        <SectionHead index="04" id="keys" title="Keys" kicker="The same on Linux and macOS. On macOS, Command-key shortcuts go to the menu, not to FreeWRL." />
        <div className="keygrid">
          {GROUPS.map(([title, list]) => (
            <div key={title} className="keygrid__group">
              <h3 className="mono">{title}</h3>
              <dl>
                {list.map((k) => keys.get(k)).filter((k): k is Key => !!k && k.verified).map((k) => (
                  <div key={k.key} className="keyrow">
                    <dt><kbd>{k.key}</kbd></dt>
                    <dd>{k.action}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <p className="caption">
          Be careful with <kbd>n</kbd>: it unloads the world. <kbd>x</kbd> saves a screenshot on Linux and Windows builds only.
        </p>
      </section>

      <section className="frame section railed" aria-labelledby="options">
        <SectionHead index="05" id="options" title="Command-line options" kicker="The most useful ones. freewrl --help lists all of them. Use the long forms." />
        <table className="table">
          <thead><tr><th>Option</th><th>What it does</th></tr></thead>
          <tbody>
            {use.cli.map((c) => (
              <tr key={c.flag}><td><code>{c.flag}</code></td><td>{c.action}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="frame section railed" aria-labelledby="changed">
        <SectionHead index="06" id="changed" title="Changed since the old manual" />
        <ul className="prose changes">
          <li>Slide left and right is <kbd>j</kbd> / <kbd>l</kbd>. The old page said 7 / 9, but those keys roll the view.</li>
          <li>NumLock no longer toggles the headlight on Linux. Use <kbd>h</kbd>.</li>
          <li>New modes: SPHERICAL, TURNTABLE, EXPLORE, LOOKAT and PAN.</li>
          <li>EXAMINE now turns the model freely, like a trackball. Right-drag zoom moved to DIST mode.</li>
          <li>The fly keys work in every mode except NONE. The arrow keys start in the XY style: they slide, not turn.</li>
          <li><code>--server</code> and <code>--sig</code> are gone. <code>--eai</code> takes no host:port.</li>
        </ul>
        <p className="caption">
          Checked against the FreeWRL 6.7 source on 2026-09-30. Not yet checked in a running window on every platform.
          If something here is wrong, please <a href="https://github.com/Ascendance3D/freewrl/issues">open an issue</a>.
        </p>
      </section>
    </>
  )
}
