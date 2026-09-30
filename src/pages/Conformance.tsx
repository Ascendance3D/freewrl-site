import { useMemo, useState } from "react"
import upstream from "../data/conformance.upstream.json"
import measured from "../data/conformance.measured.json"
import { Facts, PageHead, SectionHead } from "../components/primitives"
import { Link } from "../router"
import { SITE } from "../routes"

type Node = { node: string; status: string }
type Measured = { component: string; node: string; result: string; build: string; date: string; evidence?: string }

// Test-corpus folder for each numbered component (upstream spelling kept).
const FOLDERS: Record<string, string> = {
  "7": "7_Core", "8": "8_Time", "9": "9_Networking", "10": "10_Grouping", "11": "11_Rendering", "12": "12_Shape",
  "13": "13_Geometry3D", "14": "14_Geometry2D", "15": "15_Text", "16": "16_Sound", "17": "17_Lighting",
  "18": "18_Texturing", "19": "19_Interpolation", "20": "20_Pointing_device_sensor", "21": "21_Key_device_sensor",
  "22": "22_Environmental_sesnsor", "23": "23_Navigation", "24": "24_Environmental_effects", "25": "25_Geospatial",
  "26": "26_Humanoid_Animation", "27": "27_NURBS", "28": "28_Distributed_interactive_simulation", "29": "29_Scripting",
  "30": "30_Event_utilities", "31": "31_Programmable_shaders", "32": "32_CAD_geometry", "33": "33_Texturing3D",
  "34": "34_Cube_map_environmental_textuing", "35": "35_Layering", "36": "36_Layout", "37": "37_Rigid_body_physics",
  "38": "38_Picking", "39": "39_Followers", "40": "40_Particle_systems", "41": "41_Volume_rendering",
  "42": "42_Texture_projector", "43": "43_MIDI",
}

const claimClass = (s: string) =>
  /not implemented/i.test(s) ? "claim claim--no" : /^extra/i.test(s) ? "claim claim--extra" : /complete/i.test(s) ? "claim claim--yes" : "claim"

export default function Conformance() {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const results = measured.results as Measured[]
  const byNode = useMemo(() => new Map(results.map((r) => [`${r.component}::${r.node}`, r])), [results])

  const statuses = useMemo(() => {
    const c = new Map<string, number>()
    for (const comp of upstream.components) for (const n of comp.nodes as Node[]) c.set(n.status, (c.get(n.status) ?? 0) + 1)
    return [...c.entries()].sort((a, b) => b[1] - a[1])
  }, [])
  const total = statuses.reduce((s, [, n]) => s + n, 0)

  const filtered = upstream.components
    .map((c) => ({
      ...c,
      nodes: (c.nodes as Node[]).filter(
        (n) => (status === "all" || n.status === status) && (!q || n.node.toLowerCase().includes(q.toLowerCase()) || c.name.toLowerCase().includes(q.toLowerCase())),
      ),
    }))
    .filter((c) => c.nodes.length > 0)
  const searching = q !== "" || status !== "all"

  // Three groups for the bar; the exact upstream words stay in the table.
  const groupOf = (st: string) => (/not implemented/i.test(st) ? "no" : /^extra/i.test(st) ? "extra" : "yes")
  const GROUPS: [string, string][] = [["yes", "Complete (any form)"], ["extra", "Extra"], ["no", "Not implemented"]]
  const groupCount = (g: string) => statuses.filter(([st]) => groupOf(st) === g).reduce((n, [, c]) => n + c, 0)

  return (
    <>
      <PageHead
        kicker="Conformance"
        title="Claimed. Not yet measured."
        aside={
          <Facts
            className="facts--stack"
            rows={[
              ["Standard", upstream.source.spec],
              ["Upstream rows", `${total} nodes and features`],
              ["Measured", `${results.length} on current builds`],
              ["Captured", <><a key="s" href="/legacy/conformance.html">conformance.html</a>, {upstream.source.captured}</>],
            ]}
          />
        }
      >
        <p>
          The upstream FreeWRL site listed every X3D node and marked it Complete, Extra or Not Implemented. That list is
          kept here as it was published. It is <strong>the upstream project’s claim</strong>. It is not a test result for the
          current builds. When a node has been tested on a current build, the result goes in its own column, with the build, the date and the evidence.
        </p>
      </PageHead>

      <section className="frame section railed" aria-labelledby="summary">
        <SectionHead index="01" id="summary" title="Two columns, kept apart" kicker="What upstream said, and what has been measured since." />
        <div>
          <figure className="statusfig">
            <figcaption className="mono">Upstream claim, {total} rows</figcaption>
            <div className="statusbar" aria-hidden="true">
              {GROUPS.map(([g, label]) => {
                const n = groupCount(g)
                return n > 0 && <span key={g} className={`statusbar__seg statusbar__seg--${g}`} style={{ flexGrow: n }} title={`${label}: ${n}`} />
              })}
            </div>
            <p className="statusbar__legend mono">
              {GROUPS.map(([g, label]) => <span key={g} className={`k-${g}`}>{label} {groupCount(g)}</span>)}
            </p>
          </figure>
          <div className="ledger">
            <div className="ledger__col">
              <p className="mono">Upstream claim</p>
              <p className="ledger__big">{total}</p>
              <table className="table">
                <caption className="mono">Status words as written upstream</caption>
                <thead><tr><th>Status</th><th className="num">Nodes</th></tr></thead>
                <tbody>
                  {statuses.map(([st, n]) => (
                    <tr key={st}><td><span className={claimClass(st)}>{st}</span></td><td className="num mono">{n}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ledger__col">
              <p className="mono">Measured on current builds</p>
              <p className="ledger__big">{results.length}</p>
              <p>
                {results.length === 0
                  ? "No node has been re-tested yet. Every row below says “not yet tested” in the measured column."
                  : "Rows with a result show the build and date it came from."}
              </p>
              <p className="caption">
                Source: <a href="/legacy/conformance.html">conformance.html</a>, captured {upstream.source.captured}. Status words
                are copied exactly, including “CNOT IMPLEMENTED”. Some statuses have an asterisk that the page does not explain. The Sound heading says it “does not comply with v4 specs as written”.
              </p>
              <p>
                To help measure, start here: each component links to its folder in the <Link to="/tests">test corpus</Link>.
                <a href={SITE.issues}> Report results on GitHub</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="frame section railed" aria-labelledby="nodes">
        <div className="rail">
          <SectionHead index="02" id="nodes" title="By component" />
          <div className="filters" role="search">
            <label>
              <span className="mono">Find a node</span>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Extrusion" />
            </label>
            <label>
              <span className="mono">Upstream status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All</option>
                {statuses.map(([st]) => <option key={st} value={st}>{st}</option>)}
              </select>
            </label>
            <p className="mono filters__count" role="status">
              {filtered.reduce((n, c) => n + c.nodes.length, 0)} rows
            </p>
          </div>
        </div>

        <div className="components">
          {filtered.length === 0 && (
            <p className="caption components__empty">
              No node matches “{q}”{status !== "all" ? ` with status ${status}` : ""}. Try a shorter name, or set the status to All.
            </p>
          )}
          {filtered.map((c) => {
            const num = /^(\d+)\./.exec(c.name)?.[1]
            const folder = num ? FOLDERS[num] : undefined
            return (
              <details key={c.name} className="component" open={searching}>
                <summary>
                  <span className="component__name">{c.name}</span>
                  <span className="mono component__count">{c.nodes.length} rows</span>
                </summary>
                {folder && (
                  <p className="component__tests mono">
                    Tests: <a href={`${SITE.testsBase}${folder}/`}>tests/{folder}/</a>
                  </p>
                )}
                <table className="table table--tight">
                  <thead><tr><th>Node</th><th>Upstream claim</th><th>Measured on current build</th></tr></thead>
                  <tbody>
                    {c.nodes.map((n) => {
                      const m = byNode.get(`${c.name}::${n.node}`)
                      return (
                        <tr key={n.node}>
                          <th scope="row" className="mono">{n.node}</th>
                          <td><span className={claimClass(n.status)}>{n.status}</span></td>
                          <td>{m ? <>{m.result} · {m.build} · {m.date}{m.evidence && <> · <a href={m.evidence}>evidence</a></>}</> : <span className="muted">not yet tested</span>}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </details>
            )
          })}
        </div>
      </section>
    </>
  )
}
