import { useMemo, useState } from "react"
import upstream from "../data/conformance.upstream.json"
import measured from "../data/conformance.measured.json"
import { PageHead, SectionHead } from "../components/primitives"
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

  return (
    <>
      <PageHead kicker="Conformance" title={<>Claimed.<br />Not yet measured.</>}>
        <p>
          The upstream FreeWRL site listed every X3D node and marked it Complete, Extra or Not Implemented. That list is
          kept here as it was published. It is <strong>the upstream project’s claim</strong>. It is not a test result for the
          current builds. When a node has been tested on a current build, the result goes in its own column, with the build, the date and the evidence.
        </p>
      </PageHead>

      <section className="frame section" aria-labelledby="summary">
        <SectionHead index="01" id="summary" title="Two columns, kept apart" />
        <div className="split">
          <table className="table">
            <caption className="mono">Upstream claim — {upstream.source.spec}</caption>
            <thead><tr><th>Status as written upstream</th><th className="num">Nodes</th></tr></thead>
            <tbody>
              {statuses.map(([s, n]) => (
                <tr key={s}><td><span className={claimClass(s)}>{s}</span></td><td className="num mono">{n}</td></tr>
              ))}
              <tr><th scope="row">Total rows</th><td className="num mono">{total}</td></tr>
            </tbody>
          </table>
          <div className="prose">
            <p className="mono">Measured on current builds: {results.length} {results.length === 1 ? "result" : "results"}</p>
            <p>
              {results.length === 0
                ? "No node has been re-tested yet. Every row below says “not yet tested” in the measured column."
                : "Rows with a result show the build and date it came from."}
            </p>
            <p>
              Source: <a href="/legacy/conformance.html">conformance.html</a>, captured {upstream.source.captured}. Status words
              are copied exactly, including “CNOT IMPLEMENTED”. Some statuses have an asterisk that the page does not explain. The Sound heading says it “does not comply with v4 specs as written”.
            </p>
            <p>
              To help measure, start here: each component links to its folder in the <Link to="/tests">test corpus</Link>.
              <a href={SITE.issues}> Report results on GitHub</a>.
            </p>
          </div>
        </div>
      </section>

      <section className="frame section" aria-labelledby="nodes">
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
              {statuses.map(([s]) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <p className="mono filters__count" role="status">
            {filtered.reduce((s, c) => s + c.nodes.length, 0)} rows
          </p>
        </div>

        <div className="components">
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
