import use from "../data/use.json"
import { CaptureFigure, CaptureGallery, DemoVideo } from "../components/media"
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
      <PageHead
        kicker="Use"
        title={<>Open a world. Look around.</>}
        media={
          <CaptureFigure id="linux-landing-plaza" fig="U1" eager className="capture--hero" sizes="(min-width: 1024px) 45vw, (min-width: 760px) 720px, 100vw">
            This is the whole program: one window with the world in it. The yellow bar along the bottom is the
            navigation button bar. The name of the current viewpoint, here <em>Plaza</em>, shows below it.
          </CaptureFigure>
        }
      >
        <p>
          Open a file from the command line, or on macOS from Finder. Then move with the mouse or keys. Every key on
          this page was checked in the current FreeWRL source. Parts are adapted from the upstream <a href="/legacy/use.html">use.html</a>.
        </p>
      </PageHead>

      <section className="frame section railed" aria-labelledby="open">
        <SectionHead index="01" id="open" title="Open a world" />
        <div className="media-split">
          <div className="media-split__text">
            <Commands title="Linux / macOS terminal">{`freewrl world.wrl
freewrl https://example.org/world.x3d
freewrl --geometry 1280x800 world.x3dv`}</Commands>
            <div className="prose">
              <p>FreeWRL also reads gzipped files (<code>.wrz</code>, <code>.x3dz</code>) and loads worlds over HTTP and HTTPS.</p>
            </div>
          </div>
          <CaptureFigure id="linux-four-primitives" fig="U2" sizes="(min-width: 1100px) 40vw, 100vw">
            <code>freewrl --geometry 1280x800 four-primitives.x3d</code> on Linux. The file opens at its first viewpoint, <em>Front</em>.
          </CaptureFigure>
        </div>
        <div className="media-split">
          <div className="media-split__text prose">
            <p>
              On macOS, open a <code>.wrl</code> file with FreeWRL from Finder. <code>.x3d</code> and <code>.x3dv</code> files
              open the same way, and you can also drop a file on FreeWRL.
            </p>
            <p>
              If another 3D viewer on your Mac is set to open <code>.wrl</code> files, a double-click opens that viewer instead.
              Choose FreeWRL under <em>Open With</em> in the file's context menu, or set it for that file in Finder's
              <em> Get Info</em> window, as was done for the clip.
            </p>
          </div>
          <DemoVideo
            src="/media/captures/macos-finder-open-wrl-1200.mp4"
            poster="macos-finder-open-wrl-poster"
            fig="U3"
            title="Opening a .wrl file with FreeWRL from Finder"
            length="15 s"
          >
            A Finder window holds one file, <code>freewrl-landing.wrl</code>. The pointer moves to it and double-clicks.
            FreeWRL starts, its window opens, and the animated world appears a moment later.
          </DemoVideo>
        </div>
      </section>

      <section className="frame section railed" aria-labelledby="modes">
        <SectionHead index="02" id="modes" title="Navigation modes" kicker="A world can limit the modes with NavigationInfo. A key for a mode the world does not allow is ignored." />
        <div className="shots">
          <DemoVideo
            src="/media/captures/linux-landing-navigate-960.mp4"
            poster="linux-landing-navigate-poster"
            fig="U4"
            title="Linux: turning a world, then changing viewpoint"
            length="11 s"
          >
            The world opens in EXAMINE mode. A left drag to the left turns the whole world around its centre.
            Then <kbd>Page Down</kbd> twice moves to the next viewpoints, <em>Under the tower</em> and <em>Through the portal</em>.
            FreeWRL animates each move.
          </DemoVideo>
          <DemoVideo
            src="/media/captures/macos-navigation-1200.mp4"
            poster="macos-navigation-poster"
            fig="U5"
            title="macOS: turning a world in EXAMINE"
            length="15 s"
          >
            The same world in EXAMINE mode on a Mac. Two left drags with the mouse turn the view around the
            animated sculpture in the middle, and then back.
          </DemoVideo>
        </div>
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

      <section className="frame section railed" aria-labelledby="viewpoints">
        <SectionHead index="03" id="viewpoints" title="Viewpoints" kicker="Places the world's author set up for you. Most worlds have a few." />
        <div className="prose">
          <p>
            <kbd>Page Down</kbd> or <kbd>v</kbd> goes to the next viewpoint, <kbd>Page Up</kbd> or <kbd>b</kbd> to the previous one.
            <kbd>Home</kbd> and <kbd>End</kbd> jump to the first and the last. If you get lost, go back to a viewpoint.
          </p>
        </div>
        <div className="media-split">
          <div className="media-split__text prose">
            <p>
              You can also use the button bar: the right arrow goes to the next viewpoint. In the clip, the bottom left of the
              window reads <em>Next VP</em>, and the middle shows the name of the viewpoint.
            </p>
          </div>
          <DemoVideo
            src="/media/captures/macos-controls-1200.mp4"
            poster="macos-controls-poster"
            fig="U6"
            title="macOS: the Next Viewpoint button"
            length="18 s"
          >
            The pointer moves to the right arrow on the button bar and clicks three times. Each click moves the view to the
            next viewpoint: <em>Under the tower</em>, <em>Through the portal</em>, then <em>From above</em>. The viewpoint name
            at the bottom changes with it.
          </DemoVideo>
        </div>
        <CaptureGallery
          label="The same world from two viewpoints, on Linux"
          items={[
            { id: "linux-landing-portal", fig: "U7", caption: <>Linux: second <kbd>Page Down</kbd> from the start.</> },
            { id: "linux-landing-above", fig: "U8", caption: <>Linux: third <kbd>Page Down</kbd>. The name at the bottom left changes with each viewpoint.</> },
          ]}
        />
      </section>

      <section className="frame section railed" aria-labelledby="mouse">
        <SectionHead index="04" id="mouse" title="Mouse" kicker="Left button unless it says otherwise. The wheel only zooms in PAN mode." />
        <CaptureGallery
          label="EXAMINE mode after a left drag, on Linux and macOS"
          items={[
            { id: "linux-landing-examine", fig: "U9", caption: <>Linux: the plaza after a short left drag in EXAMINE mode. Compare it with U1: the whole world has turned.</> },
            { id: "macos-world-navigated", fig: "U10", caption: <>macOS: after a longer drag the view has gone about a quarter of the way round. The yellow ring is now edge-on.</> },
          ]}
        />
        <table className="table">
          <thead><tr><th>Mode</th><th>Input</th><th>Result</th></tr></thead>
          <tbody>
            {use.mouse.filter((m) => !m.action.startsWith("Nothing")).map((m, i) => (
              <tr key={i}><td className="mono">{m.mode}</td><td>{m.input}</td><td>{m.action}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="frame section railed" aria-labelledby="content">
        <SectionHead index="05" id="content" title="Worlds that react" kicker="VRML content running in FreeWRL. These are not part of FreeWRL; they are files it opens." />
        <div className="prose">
          <p>
            Many worlds have parts you can click. These three Cybertown items by Ryan (BassMekanik) are VRML files with
            their own START or PLAY buttons. Click a button with the pointer and the item's animation starts. Each picture
            was taken in FreeWRL on macOS after its buttons were clicked.
          </p>
        </div>
        <CaptureGallery
          label="Cybertown items rendered in FreeWRL"
          items={[
            { id: "macos-item-signal-storm-globe", fig: "U11", caption: <>After START: the rings turn and the markers light up. Cybertown item by Ryan (BassMekanik).</> },
            { id: "macos-item-pulse-prism-console", fig: "U12", caption: <>After START: the prisms and meter bars light up. Cybertown item by Ryan (BassMekanik).</> },
            { id: "macos-item-plasma-disc-player", fig: "U13", caption: <>After PLAY and OPEN: the doors slide open and the disc spins. Cybertown item by Ryan (BassMekanik).</> },
          ]}
        />
      </section>

      <section className="frame section railed" aria-labelledby="keys">
        <SectionHead index="06" id="keys" title="Keys" kicker="The same on Linux and macOS. On macOS, Command-key shortcuts go to the menu, not to FreeWRL." />
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
        <SectionHead index="07" id="options" title="Command-line options" kicker="The most useful ones. freewrl --help lists all of them. Use the long forms." />
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
        <SectionHead index="08" id="changed" title="Changed since the old manual" />
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
