import releases from "../data/releases.json"
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
sudo make install`}</Commands>
          <p className="prose">Details, dependencies and what has been tested: <Link to="/build">Build</Link>.</p>
        </div>
      </section>

      <section className="frame section railed" aria-labelledby="others">
        <SectionHead index="03" id="others" title="Windows, Android, iOS" />
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
        <section className="frame section railed" aria-labelledby="older">
          <SectionHead index="04" id="older" title="Earlier releases" />
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
