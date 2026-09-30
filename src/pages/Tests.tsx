import { useEffect, useMemo, useState } from "react"
import { Facts, formatBytes, PageHead, SectionHead } from "../components/primitives"
import { SITE } from "../routes"

type Manifest = { files: [string, number, string][]; missing: string[]; captured: string }
type Entry = { name: string; dir: boolean; bytes: number; count: number; sha?: string }

function list(files: Manifest["files"], dir: string): Entry[] {
  const out = new Map<string, Entry>()
  for (const [path, bytes, sha] of files) {
    if (!path.startsWith(dir)) continue
    const rest = path.slice(dir.length)
    const slash = rest.indexOf("/")
    const name = slash === -1 ? rest : rest.slice(0, slash)
    const e = out.get(name) ?? { name, dir: slash !== -1, bytes: 0, count: 0 }
    e.bytes += bytes
    e.count += 1
    if (slash === -1) e.sha = sha
    out.set(name, e)
  }
  return [...out.values()].sort((a, b) =>
    a.dir !== b.dir ? (a.dir ? -1 : 1) : a.name.localeCompare(b.name, "en", { numeric: true }))
}

export default function Tests() {
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [failed, setFailed] = useState(false)
  const [dir, setDir] = useState(() => {
    const h = typeof location === "undefined" ? "" : decodeURIComponent(location.hash.slice(1))
    return h.endsWith("/") ? h : ""
  })

  useEffect(() => {
    fetch("/data/tests-manifest.json").then((r) => (r.ok ? r.json() : Promise.reject(r.status))).then(setManifest).catch(() => setFailed(true))
  }, [])
  const go = (d: string) => {
    setDir(d)
    history.replaceState(null, "", d ? `#${encodeURIComponent(d).replace(/%2F/g, "/")}` : location.pathname)
  }

  const entries = useMemo(() => (manifest ? list(manifest.files, dir) : []), [manifest, dir])
  const crumbs = dir.split("/").filter(Boolean)

  return (
    <>
      <PageHead kicker="Test corpus" title={<>1.14 GB.<br />38 folders.</>}>
        <p>
          The upstream project kept its test worlds in <code>tests/</code>, one folder per X3D component. It is the
          largest collection of FreeWRL example files there is: 1.14 GB. It is too big for this website, so it will be
          served from its own address with the original folder paths. The copy holds 3,420 files, plus 250 saved folder listings.
        </p>
      </PageHead>

      <section className="frame section" aria-labelledby="where">
        <SectionHead index="01" id="where" title="Where the files are" />
        <Facts
          className="facts--wide"
          rows={[
            ["Now", <>Links on this page go to the original copy: <a href={SITE.testsBase}>{SITE.testsBase}</a></>],
            ["Planned", <><code>{SITE.testsBasePlanned}</code> — the same paths, served from Cloudflare R2. Not published yet.</>],
            ["Preserved", "A full copy was made on 2026-09-29/30. Every file has a SHA-256 in the manifest below."],
            ["Missing", <><code>41_Volume_rendering/supine.nrrd</code> (213 MB). SourceForge would not serve it. The smaller <code>supine128.nrrd</code> is kept.</>],
          ]}
        />
      </section>

      <section className="frame section" aria-labelledby="browse">
        <SectionHead index="02" id="browse" title="Browse" kicker="Folder listing from the archive manifest. File links open the original copy." />
        {failed && <p className="edit-status">The manifest could not be loaded.</p>}
        {!manifest && !failed && <p className="mono">Loading the manifest…</p>}
        {manifest && (
          <div className="browser">
            <nav className="browser__crumbs mono" aria-label="Folder">
              <button type="button" onClick={() => go("")}>tests/</button>
              {crumbs.map((c, i) => (
                <button key={i} type="button" onClick={() => go(`${crumbs.slice(0, i + 1).join("/")}/`)}>{c}/</button>
              ))}
            </nav>
            <table className="table table--tight">
              <thead><tr><th>Name</th><th className="num">Files</th><th className="num">Size</th></tr></thead>
              <tbody>
                {dir && (
                  <tr><td colSpan={3}><button type="button" className="linkish mono" onClick={() => go(`${crumbs.slice(0, -1).join("/")}${crumbs.length > 1 ? "/" : ""}`)}>../</button></td></tr>
                )}
                {entries.map((e) => (
                  <tr key={e.name}>
                    <td className="mono">
                      {e.dir
                        ? <button type="button" className="linkish" onClick={() => go(`${dir}${e.name}/`)}>{e.name}/</button>
                        : <a href={`${SITE.testsBase}${dir}${e.name}`.replace(/ /g, "%20")}>{e.name}</a>}
                    </td>
                    <td className="num mono">{e.dir ? e.count : ""}</td>
                    <td className="num mono">{formatBytes(e.bytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
