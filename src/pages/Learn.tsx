import { useMemo, useState } from "react"
import { XiteViewer } from "../components/XiteViewer"
import { Facts, PageHead, SectionHead } from "../components/primitives"
import { Link } from "../router"
import { checkSource, COLORS, LESSONS, type Values } from "./lessons"

export default function Learn() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Values[]>(() => LESSONS.map((l) => ({ ...l.initial })))
  const [edited, setEdited] = useState<(string | null)[]>(() => LESSONS.map(() => null))
  const [renderError, setRenderError] = useState<string | null>(null)
  const lesson = LESSONS[step]
  const v = values[step]
  const built = useMemo(() => lesson.build(v), [lesson, v])
  const manual = edited[step]
  const text = manual ?? built.text
  const blocked = manual !== null ? checkSource(manual) : null
  // Only hand the viewer text that passed the check; keep the last good one otherwise.
  const [lastGood, setLastGood] = useState<(string | null)[]>(() => LESSONS.map(() => null))
  const viewerSource = manual === null ? built.text : (lastGood[step] ?? built.text)

  const set = (key: string, value: number | string) =>
    setValues((all) => all.map((x, i) => (i === step ? { ...x, [key]: value } : x)))
  const edit = (t: string | null) => {
    setEdited((all) => all.map((x, i) => (i === step ? t : x)))
    if (t === null || !checkSource(t)) setLastGood((all) => all.map((x, i) => (i === step ? t : x)))
  }

  const save = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "model/vrml" }))
    const a = Object.assign(document.createElement("a"), { href: url, download: `lesson-${step + 1}-${lesson.id}.wrl` })
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <>
      <PageHead
        kicker="Learn · no account · nothing to install"
        title="Change one number. Change a world."
        aside={
          <Facts
            className="facts--stack"
            rows={[
              ["Lessons", `${LESSONS.length}, from one shape to a small world`],
              ["Language", "VRML97, plain text"],
              ["Keep it", "Save .wrl and open it in FreeWRL"],
            ]}
          />
        }
      >
        <p>
          A VRML world is a text file. The controls below change numbers in that text, and the world changes with them.
          The <mark className="param">marked</mark> numbers are the ones each control changes.
        </p>
      </PageHead>

      <nav className="frame steps" aria-label="Lessons">
        <ol>
          {LESSONS.map((l, i) => (
            <li key={l.id}>
              <button type="button" aria-current={i === step ? "step" : undefined} onClick={() => { setStep(i); setRenderError(null) }}>
                <span className="mono">0{i + 1}</span> {l.title}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <section className="frame lab-bench" aria-labelledby="lesson-title">
        <div className="lab-bench__view">
          <span className="mono lab-bench__label">Result</span>
          <XiteViewer
            source={viewerSource}
            file={`lesson-${step + 1}-${lesson.id}.wrl`}
            facts={["VRML97", `${new Blob([text]).size} bytes`]}
            alt={`Live 3D view of lesson ${step + 1}: ${lesson.goal}`}
            clocks={["Clock"]}
            aspect="1 / 1"
            onSourceError={setRenderError}
          />
        </div>

        <div className="lab-bench__controls">
          <span className="mono lab-bench__label">Change</span>
          <h2 id="lesson-title" className="lesson__title">
            <span className="mono">Lesson 0{step + 1}</span> {lesson.title}
          </h2>
          <p className="lesson__goal">{lesson.goal}</p>

          <fieldset className="controls" disabled={manual !== null}>
            <legend className="mono">Controls{manual !== null ? " — off while you edit the text" : ""}</legend>
            {lesson.controls.map((c) => {
              const id = `ctl-${lesson.id}-${c.key}`
              if (c.kind === "range")
                return (
                  <div key={c.key} className="control">
                    <label htmlFor={id}>{c.label}</label>
                    <input id={id} type="range" min={c.min} max={c.max} step={c.step} value={Number(v[c.key])}
                      onChange={(e) => set(c.key, Number(e.target.value))} />
                    <output htmlFor={id} className="mono">{Number(v[c.key])}{c.unit ? ` ${c.unit}` : ""}</output>
                  </div>
                )
              if (c.kind === "choice")
                return (
                  <div key={c.key} className="control">
                    <span className="control__label" id={id}>{c.label}</span>
                    <div className="segmented" role="radiogroup" aria-labelledby={id}>
                      {c.options.map((o) => (
                        <button key={o} type="button" role="radio" aria-checked={v[c.key] === o} onClick={() => set(c.key, o)}>{o}</button>
                      ))}
                    </div>
                  </div>
                )
              return (
                <div key={c.key} className="control">
                  <span className="control__label" id={id}>{c.label}</span>
                  <div className="swatches" role="radiogroup" aria-labelledby={id}>
                    {Object.entries(COLORS).map(([name, [r, g, b]]) => (
                      <button key={name} type="button" role="radio" aria-checked={v[c.key] === name} aria-label={name}
                        title={`${name}: ${r} ${g} ${b}`}
                        style={{ background: `rgb(${r * 255} ${g * 255} ${b * 255})` }}
                        onClick={() => set(c.key, name)} />
                    ))}
                  </div>
                </div>
              )
            })}
          </fieldset>

          <ul className="lesson__explain">
            {lesson.explain.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>

        <div className="lab-bench__source">
          <span className="mono lab-bench__label">Source</span>
          <div className="listing">
            <div className="listing__head mono">
              <span>lesson-{step + 1}-{lesson.id}.wrl</span>
              <span>
                {manual === null ? (
                  <button type="button" className="tool" onClick={() => edit(built.text)}>Edit the text</button>
                ) : (
                  <button type="button" className="tool" onClick={() => { edit(null); setRenderError(null) }}>Reset to controls</button>
                )}
                <button type="button" className="tool" onClick={save}>Save .wrl</button>
              </span>
            </div>
            {manual === null ? (
              <pre className="listing__body" tabIndex={0} aria-label="World source">
                <code>
                  {built.parts.map((part, i) =>
                    typeof part === "string" ? part : <mark key={i} className="param" data-key={part.key}>{part.text}</mark>,
                  )}
                </code>
              </pre>
            ) : (
              <textarea
                className="listing__edit"
                value={manual}
                spellCheck={false}
                aria-label="Edit the world source"
                aria-describedby="edit-status"
                onChange={(e) => edit(e.target.value)}
              />
            )}
          </div>
          <p id="edit-status" className="edit-status" role="status">
            {blocked ?? (renderError ? `The web preview could not read this: ${renderError.slice(0, 200)}. The last working world stays on screen.` : "")}
          </p>
          <p className="caption">
            Save the file and open it in <Link to="/download">FreeWRL</Link>. It is the same world.
          </p>
        </div>
      </section>

      <section className="frame section railed next-steps" aria-labelledby="after">
        <SectionHead index="05" id="after" title="After lesson 04" />
        <p className="prose">
          Look at bigger worlds in the <Link to="/lab">Lab</Link>, and read their source. The X3D specification
          lists every node: <a href="https://www.web3d.org/specifications/X3Dv4/ISO-IEC19775-1v4-IS/Part01/Architecture.html">ISO/IEC 19775-1 at web3d.org</a>.
          When you make something, <Link to="/contribute">share it</Link>. Good lesson worlds can become examples on this site.
        </p>
      </section>
    </>
  )
}
