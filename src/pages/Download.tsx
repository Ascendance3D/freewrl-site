import releases from "../data/releases.json"
import { CaptureFigure, CaptureGallery, PendingMedia } from "../components/media"
import { Commands, Facts, formatBytes, PageHead, SectionHead, Tag } from "../components/primitives"
import { Link } from "../router"
import { SITE } from "../routes"

export default function Download() {
  const [latest, ...older] = releases.releases
  return (
    <>
      <PageHead
        kicker="Download"
        title="FreeWRL 6.7"
        aside={latest && (
          <Facts
            className="facts--stack"
            rows={[
              ["Latest", <code key="t">{latest.tag}</code>],
              ["Published", latest.published.slice(0, 10)],
              ["Platform", "macOS 14+, Apple Silicon (arm64)"],
              ["File", `${latest.assets[0] ? formatBytes(latest.assets[0].size) : "—"}, ZIP, notarized`],
            ]}
          />
        )}
      >
        <p>
          There is one binary today: a signed beta for macOS on Apple Silicon. On Linux, you build FreeWRL from source.
          This page lists only the files that have actually been published, with their checksums.
        </p>
      </PageHead>

      <section className="frame section section--tight railed" aria-label="What FreeWRL looks like">
        <CaptureFigure id="linux-window-ubuntu" fig="D1" eager className="capture--hero" sizes="(min-width: 1024px) 70vw, 100vw" title="FreeWRL 6.7 with a world open">
          One window, the world inside it, and a navigation bar along the bottom. This capture is from Linux.
          The macOS build draws the same window; a capture of it is still to come (see below).
        </CaptureFigure>
      </section>

      {latest && (
        <section className="frame section railed release" aria-labelledby="latest">
          <div className="rail">
            <SectionHead index="01" id="latest" title="Latest build" />
            <p className="mono release__tag">
              <Tag tone="gold">{latest.prerelease ? "Pre-release" : "Release"}</Tag> {latest.tag}
            </p>
          </div>
          <div>
            <h3 className="release__name">{latest.name}</h3>
          <div className="split">
            <div className="release__files">
              {latest.assets.map((a) => (
                <div key={a.name} className="asset">
                  <a className="asset__link" href={a.url}>
                    <span className="asset__name">{a.name}</span>
                    <span className="mono asset__size">{formatBytes(a.size)} · ZIP</span>
                  </a>
                  {a.sha256 && (
                    <p className="asset__sum mono">
                      SHA-256 <code className="hash">{a.sha256}</code>
                      {a.sha256Url && <> · <a href={a.sha256Url}>.sha256 file</a></>}
                    </p>
                  )}
                </div>
              ))}
              <Commands title="Check the download (macOS Terminal)">{`shasum -a 256 ~/Downloads/${latest.assets[0]?.name ?? "FreeWRL.zip"}`}</Commands>
            </div>
            <Facts
              className="facts--stack"
              rows={[
                ["Runs on", "macOS 14 Sonoma or newer, Apple Silicon (arm64)"],
                ["Not for", "Intel Macs, macOS 13 or older"],
                ["Graphics", "OpenGL 4.1 Core"],
                ["Signed", "Developer ID, hardened runtime, notarized, stapled"],
                ["Opens", ".wrl .wrz .wrlz .x3d .x3dz .x3dv .x3dvz"],
                ["Source commit", latest.sourceCommit ? <a key="c" href={`${SITE.github}/commit/${latest.sourceCommit}`}><code>{latest.sourceCommit.slice(0, 12)}</code></a> : "—"],
                ["Release notes", <a key="n" href={latest.url}>on GitHub</a>],
              ]}
            />
          </div>
          <p className="release__note caption">
            This is a beta. The release notes say it does not claim complete X3D coverage. Report problems on <a href={SITE.issues}>GitHub Issues</a>.
          </p>
          </div>
        </section>
      )}

      <section className="frame section railed" aria-labelledby="linux">
        <SectionHead index="02" id="linux" title="Linux" kicker="No binary package yet. Build from source. Tested on Ubuntu 24.04." />
        <div className="split">
          <Commands title="Ubuntu 24.04 — short version">{`git clone ${SITE.github}.git
cd freewrl/freex3d
./autogen.sh
./configure --with-target=x11 --with-javascript=duk
make -j$(nproc)
sudo make install
sudo ldconfig`}</Commands>
          <p className="prose">Details, dependencies and what has been tested: <Link to="/build">Build</Link>.</p>
        </div>
      </section>

      <section className="frame section railed" aria-labelledby="looks">
        <SectionHead index="03" id="looks" title="What it looks like" kicker="Real captures of FreeWRL 6.7. Nothing here is a mock-up." />
        <CaptureGallery
          label="FreeWRL 6.7 on Ubuntu 24.04"
          items={[
            { id: "linux-four-primitives", fig: "D2", caption: <>An X3D file with the four basic shapes.</> },
            { id: "linux-landing-examine", fig: "D3", caption: <>The plaza world, turned with a mouse drag.</> },
            { id: "linux-landing-above", fig: "D4", caption: <>The same world from another viewpoint.</> },
          ]}
        />
        <div className="media-split">
          <div className="media-split__text prose">
            <p>
              The pictures above were taken on Ubuntu 24.04 from a source build. The macOS beta is the same program with the same
              window and button bar. Its screenshots and a short clip will be added once they are captured on a Mac.
            </p>
            <p>A short clip of turning a world and changing viewpoints is on the <Link to="/use">Use</Link> page.</p>
          </div>
          <PendingMedia kind="Screenshot" title="FreeWRL 6.7 beta 2 on macOS, Apple Silicon">
            Wanted: the notarized app opening a <code>.wrl</code> file from Finder, with the macOS menu bar in view.
          </PendingMedia>
        </div>
      </section>

      <section className="frame section section--tight railed" aria-labelledby="others">
        <SectionHead index="04" id="others" title="Windows, Android, iOS" />
        <div className="prose">
          <p>
            Nobody maintains these builds now. The last upstream Windows and Android builds are still on the
            <a href={`${SITE.upstream}files/`}> SourceForge project</a>. They are old, and this site does not test them.
          </p>
          <p>
            The Windows project files are still in the source tree. If you want to bring a platform back, <Link to="/contribute">see how to help</Link>.
          </p>
        </div>
      </section>

      {older.length > 0 && (
        <section className="frame section section--tight railed" aria-labelledby="older">
          <SectionHead index="05" id="older" title="Earlier releases" />
          <div>
          <table className="table table--stack">
            <thead><tr><th>Tag</th><th>Published</th><th>File</th><th>SHA-256</th></tr></thead>
            <tbody>
              {older.map((r) => (
                <tr key={r.tag}>
                  <td data-label="Tag"><a href={r.url}>{r.tag}</a></td>
                  <td data-label="Published" className="mono">{r.published.slice(0, 10)}</td>
                  <td data-label="File">{r.assets.map((a) => <a key={a.name} href={a.url}>{a.name}</a>)}</td>
                  <td data-label="SHA-256">{r.assets.map((a) => <code key={a.name} className="hash">{a.sha256}</code>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="caption">Release list taken from GitHub on {releases.fetched}. <a href={SITE.releases}>All releases on GitHub</a>.</p>
          </div>
        </section>
      )}
    </>
  )
}
